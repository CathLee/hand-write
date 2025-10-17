/*
 * @Date: 2025-10-10 22:40:52
 * @Description:
 */
import { useCallback, useRef, useState, useEffect } from "react";
import { MD5WorkerPool } from "../worker/workpool";

export interface ChunkInfo {
  index: number;
  blob: Blob;
  size: number;
  md5?: string;
  retries: number;
  uploadProgress?: number;
}

export interface UploadProgress {
  totalBytes: number; // 总字节数
  uploadedBytes: number; // 已上传字节数
  percentage: number; // 上传百分比
  uploadSpeed: number; // 上传速度（MB/s）
  remainingTime: number; // 剩余时间（秒）
  uploadedChunks: number; // 已上传分片数
  totalChunks: number; // 总分片数
  currentPhase: "preparing" | "calculating-md5" | "uploading" | "merging";
}

export interface UploadResult {
  success: boolean;
  fileId: string;
  filename: string;
  filepath: string;
  size: number;
  md5: string;
}
type UploadStatus =
  | "cancelled"
  | "idle"
  | "preparing"
  | "checking"
  | "uploading"
  | "merging"
  | "completed"
  | "error"
  | "calculating-md5"
  | "paused";

export interface UploadConfig {
  chunkSize?: number; // 分片大小，默认10MB
  concurrentLimit?: number; // 并发数，默认3
  maxRetries?: number; // 最大重试次数，默认3
  serverUrl?: string; // 服务器地址
  onProgress?: (progress: UploadProgress) => void;
  onChunkProgress?: (chunkIndex: number, progress: number) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: UploadStatus) => void;
  onMD5Progress?: (progress: number) => void; // MD5计算进度回调
  workerPoolSize?: number; // Worker Pool大小，默认2
}
const useSplitVideo = (config: UploadConfig = {}) => {
  const {
    chunkSize = 10 * 1024 * 1024,
    concurrentLimit = 3,
    maxRetries = 3,
    serverUrl = "/api",
    workerPoolSize = 2, // 默认2个Worker
    onProgress,
    onMD5Progress,
    onChunkProgress,
    onComplete,
    onError,
    onStatusChange,
  } = config;

  console.log(serverUrl);
  

  // Worker Pool引用
  const workerPoolRef = useRef<MD5WorkerPool | null>(null);
  const chunksRef = useRef<ChunkInfo[]>([]);
  const startTimeRef = useRef<number>(0);
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const fileIdRef = useRef<string>("");
  const currentFileRef = useRef<File | null>(null);

  // 状态管理

  const [uploadedChunks, setUploadedChunks] = useState<Set<number>>(new Set());
  const [md5Progress, setMd5Progress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState<UploadProgress>({
    totalBytes: 0,
    uploadedBytes: 0,
    percentage: 0,
    uploadSpeed: 0,
    remainingTime: 0,
    uploadedChunks: 0,
    totalChunks: 0,
    currentPhase: "preparing",
  });

  // 初始化Worker Pool（只初始化一次）
  useEffect(() => {
    workerPoolRef.current = new MD5WorkerPool(workerPoolSize);
    console.log(`✅ Worker Pool已初始化，大小: ${workerPoolSize}`);
    return () => {
      // 组件卸载时销毁Worker Pool
      workerPoolRef.current?.destroy();
      console.log("🗑️ Worker Pool已销毁");
    };
  }, [workerPoolSize]);

  // 计算剩余时间
  const calculateRemainingTime = (prog: UploadProgress): number => {
    const speed = prog.uploadSpeed;
    if (speed === 0) return 0;
    return (prog.totalBytes - prog.uploadedBytes) / (speed * 1024 * 1024);
  };
  // 计算上传速度
  const calculateUploadSpeed = (uploadedBytes: number): number => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    return elapsed > 0 ? uploadedBytes / elapsed / (1024 * 1024) : 0;
  };

  // 使用Worker Pool计算文件MD5
  const calculateFileMD5 = useCallback(
    async (file: File): Promise<string> => {
      if (!workerPoolRef.current) {
        throw new Error("Worker Pool未初始化");
      }
      console.log("📊 Worker Pool状态:", workerPoolRef.current.getStatus());
      // 使用Worker Pool计算MD5
      return workerPoolRef.current.calculateMD5(file, (progress) => {
        setMd5Progress(progress);
        onMD5Progress?.(progress);
      });
    },
    [onMD5Progress]
  );

  // 将文件分片
  const chunkFile = useCallback(
    (file: File): ChunkInfo[] => {
      const chunks: ChunkInfo[] = [];
      const totalChunks = Math.ceil(file.size / chunkSize);
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        chunks.push({
          index: i,
          blob: file.slice(start, end),
          size: end - start,
          retries: 0,
          uploadProgress: 0,
        });
      }
      return chunks;
    },
    [chunkSize]
  );

  // 上传单个分片（带进度）
  const uploadChunk = useCallback(
    async (chunk: ChunkInfo, fileId: string): Promise<void> => {
      const formData = new FormData();
      formData.append("file", chunk.blob);
      formData.append("fileId", fileId);
      formData.append("chunkIndex", chunk.index.toString());

      const abortController = new AbortController();
      abortControllersRef.current.set(chunk.index, abortController);

      for (let i = 0; i <= maxRetries; i++) {
        try {
          if (isPaused) {
            throw new Error("上传已暂停");
          }

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const chunkProgress = (event.loaded / event.total) * 100;
                chunk.uploadProgress = chunkProgress;
                onChunkProgress?.(chunk.index, chunkProgress);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  if (data.success) {
                    resolve();
                  } else {
                    reject(new Error(data.message || "上传失败"));
                  }
                } catch (err) {
                  reject(new Error("解析响应失败"));
                }
              } else {
                reject(new Error(`服务器错误: ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error("网络错误"));
            xhr.onabort = () => reject(new Error("上传已中断"));

            abortController.signal.addEventListener("abort", () => {
              xhr.abort();
            });

            // 将 fileId 和 chunkIndex 作为 query 参数传递（因为 multer 在处理文件时 req.body 还未解析）
            xhr.open("POST", `${serverUrl}/upload/chunk?fileId=${encodeURIComponent(fileId)}&chunkIndex=${chunk.index}`);
            xhr.send(formData);
          });

          setUploadedChunks((prev) => new Set([...prev, chunk.index]));
          setProgress((prev) => {
            const newProgress = {
              ...prev,
              uploadedBytes: prev.uploadedBytes + chunk.size,
              uploadedChunks: prev.uploadedChunks + 1,
              currentPhase: "uploading" as const,
            };
            newProgress.percentage =
              (newProgress.uploadedBytes / newProgress.totalBytes) * 100;
            newProgress.uploadSpeed = calculateUploadSpeed(
              newProgress.uploadedBytes
            );
            newProgress.remainingTime = calculateRemainingTime(newProgress);

            onProgress?.(newProgress);
            return newProgress;
          });

          abortControllersRef.current.delete(chunk.index);
          return;
        } catch (err) {
          if (err instanceof Error && err.message === "上传已中断") {
            throw err;
          }

          if (i === maxRetries) {
            throw err;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
        }
      }
    },
    [serverUrl, maxRetries, isPaused, onProgress, onChunkProgress]
  );
  // 秒传检查
  const checkSecondaryUpload = useCallback(
    async (fileMD5: string, filename: string): Promise<boolean> => {
      try {
        const response = await fetch(`${serverUrl}/upload/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileMD5, filename }),
        });
        const data = await response.json();
        if (data.exists) {
          onComplete?.({
            success: true,
            fileId: fileMD5,
            filename,
            filepath: data.path,
            size: 0,
            md5: fileMD5,
          });
          return true;
        }
        return false;
      } catch (err) {
        console.error("秒传检查失败:", err);
        return false;
      }
    },
    [serverUrl, onComplete]
  );

  // 查询已上传的分片
  const checkUploadedChunks = useCallback(
    async (fileId: string): Promise<number[]> => {
      try {
        const response = await fetch(`${serverUrl}/upload/chunks/${fileId}`);
        const data = await response.json();
        return data.chunks || [];
      } catch (err) {
        console.error("查询已上传分片失败:", err);
        return [];
      }
    },
    [serverUrl]
  );

  // 合并分片
  const mergeChunks = useCallback(
    async (
      fileId: string,
      totalChunks: number,
      filename: string
    ): Promise<UploadResult> => {
      setStatus("merging");
      setProgress((prev) => ({ ...prev, currentPhase: "merging" }));

      try {
        const response = await fetch(`${serverUrl}/upload/merge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId, totalChunks, filename }),
        });

        const data = await response.json();
        if (data.success) {
          const result: UploadResult = {
            success: true,
            fileId,
            filename,
            filepath: data.path,
            size: data.size,
            md5: data.md5,
          };
          onComplete?.(result);
          setStatus("completed");
          return result;
        } else {
          throw new Error(data.message || "合并失败");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "合并分片失败";
        setError(errorMsg);
        setStatus("error");
        onError?.(new Error(errorMsg));
        throw err;
      }
    },
    [serverUrl, onComplete, onError]
  );

  // 并发上传控制
  const uploadChunksWithLimit = useCallback(
    async (chunks: ChunkInfo[], fileId: string): Promise<void> => {
      const queue = chunks.filter((c) => !uploadedChunks.has(c.index));
      const uploading = new Map<number, Promise<void>>();

      while (queue.length > 0 || uploading.size > 0) {
        // 暂停上传
        if (isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        // 启动新的上传任务
        while (uploading.size < concurrentLimit && queue.length > 0) {
          const chunk = queue.shift()!;
          const uploadPromise = uploadChunk(chunk, fileId)
            .catch((err) => {
              console.error(`分片 ${chunk.index} 上传失败:`, err);
              // 重新加入队列（如果还有重试次数）
              if (chunk.retries < maxRetries) {
                chunk.retries++;
                queue.push(chunk);
              } else {
                throw err;
              }
            })
            .finally(() => {
              uploading.delete(chunk.index);
            });
          uploading.set(chunk.index, uploadPromise);
        }

        // 等待至少一个上传完成
        if (uploading.size > 0) {
          await Promise.race(Array.from(uploading.values()));
        }
      }
    },
    [uploadedChunks, isPaused, concurrentLimit, uploadChunk, maxRetries]
  );
  // 上传文件
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      try {
        setStatus("preparing");
        setIsUploading(true);
        setError("");
        setIsPaused(false);
        startTimeRef.current = Date.now();
        currentFileRef.current = file;

        setProgress((prev) => ({
          ...prev,
          totalBytes: file.size,
          uploadedBytes: 0,
          percentage: 0,
          currentPhase: "preparing",
        }));

        fileIdRef.current = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 计算MD5（使用Worker Pool）
        setStatus("calculating-md5");
        console.log("🔐 开始计算MD5，使用Worker Pool...");
        const fileMD5 = await calculateFileMD5(file);
        console.log(fileMD5);
        
        console.log("✅ MD5计算完成:", fileMD5);
      

        // 秒传检查（略过，假设文件不存在）
        // 秒传检查
        setStatus("checking");
        const isSecondaryUpload = await checkSecondaryUpload(
          fileMD5,
          file.name
        );
        if (isSecondaryUpload) {
          setStatus("completed");
          setIsUploading(false);
          return null;
        }
        // 分片处理
        setStatus("preparing");
        const chunks = chunkFile(file);
        chunksRef.current = chunks;
        setProgress((prev) => ({
          ...prev,
          totalChunks: chunks.length,
          uploadedChunks: 0,
          currentPhase: "uploading",
        }));

        // 查询已上传的分片（断点续传）
        const uploaded = await checkUploadedChunks(fileIdRef.current);
        setUploadedChunks(new Set(uploaded));
        // 并发上传分片
        setStatus("uploading");
        await uploadChunksWithLimit(chunks, fileIdRef.current);
        // 合并分片
        const result = await mergeChunks(
          fileIdRef.current,
          chunks.length,
          file.name
        );
        setIsUploading(false);
        return result;
      } catch (err) {
        if (err instanceof Error && err.message === "MD5计算已中断") {
          setStatus("cancelled");
          setError("上传已取消");
        } else {
          const errorMsg = err instanceof Error ? err.message : "上传失败";
          setError(errorMsg);
          setStatus("error");
          onError?.(new Error(errorMsg));
        }
        setIsUploading(false);
        return null;
      }
    },
    [calculateFileMD5, chunkFile, onError]
  );

  // 暂停上传
  const pauseUpload = useCallback(() => {
    setIsPaused(true);
    setStatus("paused");
    onStatusChange?.("paused");
  }, [onStatusChange]);

  // 恢复上传
  const resumeUpload = useCallback(() => {
    setIsPaused(false);
    setStatus("uploading");
    onStatusChange?.("uploading");
  }, [onStatusChange]);

  // 取消上传
  const cancelUpload = useCallback(() => {
    // 中止所有正在进行的上传
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();

    // 清空 Worker Pool
    workerPoolRef.current?.clear();

    setStatus("cancelled");
    setIsUploading(false);
    setError("上传已取消");
    onStatusChange?.("cancelled");
  }, [onStatusChange]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 取消所有正在进行的上传
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    uploadFile,
    chunkFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    // 状态
    status,
    progress,
    md5Progress,
    isPaused,
    isUploading,
    error,
  };
};

export default useSplitVideo;
