/*
 * @Date: 2025-10-10 22:40:52
 * @Description: 
 */
import { useCallback } from "react";

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
}

export interface UploadResult {
  success: boolean;
  fileId: string;
  filename: string;
  filepath: string;
  size: number;
  md5: string;
}
type UploadStatus = 'idle' | 'preparing' | 'checking' | 'uploading' | 'merging' | 'completed' | 'error' | 'paused';

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
}
const useSplitVideo = (config: UploadConfig = {}) => {
const {
    chunkSize = 10 * 1024 * 1024, // 10MB
    concurrentLimit = 3,
    maxRetries = 3,
    serverUrl = '/api',
    onProgress,
    onChunkProgress,
    onComplete,
    onError,
    onStatusChange,
  } = config;
    
  // 将文件分片
  const chunkFile = useCallback((file: File): ChunkInfo[] => {
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

  }, [chunkSize]);

  return {
    chunkFile,
  };
};

export default useSplitVideo;