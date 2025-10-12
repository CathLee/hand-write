/*
 * @Date: 2025-10-10 22:40:52
 * @Description:
 */
import { useCallback, useRef, useState,useEffect } from "react";
import { MD5WorkerPool } from '../worker/workpool';

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
    serverUrl = '/api',
    workerPoolSize = 2, // 默认2个Worker
    onProgress,
    onMD5Progress,
    onChunkProgress,
    onComplete,
    onError,
    onStatusChange,
  } = config;

  // Worker Pool引用
  const workerPoolRef = useRef<MD5WorkerPool | null>(null);
  const chunksRef = useRef<ChunkInfo[]>([]);
  const startTimeRef = useRef<number>(0);
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const fileIdRef = useRef<string>("");
  const currentFileRef = useRef<File | null>(null);

  // 状态管理
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
      console.log('🗑️ Worker Pool已销毁');
    };
  }, [workerPoolSize]);

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
        console.log("✅ MD5计算完成:", fileMD5);
      } catch (error) {}
    },
    []
  );

  return {
    chunkFile,
  };
};

export default useSplitVideo;
