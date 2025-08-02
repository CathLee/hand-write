/*
 * @Date: 2025-08-02
 * @Description: 视频加载 Hook，支持进度追踪、错误处理和取消操作
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface VideoMetadata {
  duration: number;
  videoWidth: number;
  videoHeight: number;
  size?: number; // 文件大小（字节）
}

export interface VideoLoadState {
  isLoading: boolean;
  isLoaded: boolean;
  progress: number; // 0-100
  error: string | null;
  metadata: VideoMetadata | null;
  videoElement: HTMLVideoElement | null;
}

export interface UseVideoLoaderOptions {
  preload?: 'none' | 'metadata' | 'auto'; // 预加载策略
  autoLoad?: boolean; // 是否自动开始加载
  onProgress?: (progress: number) => void;
  onMetadata?: (metadata: VideoMetadata) => void;
  onError?: (error: string) => void;
  onLoaded?: () => void;
}

export interface UseVideoLoaderReturn extends VideoLoadState {
  loadVideo: (source: string | File) => void;
  cancelLoad: () => void;
  retry: () => void;
  reset: () => void;
}

const useVideoLoader = (options: UseVideoLoaderOptions = {}): UseVideoLoaderReturn => {
  const {
    preload = 'metadata',
    autoLoad = true,
    onProgress,
    onMetadata,
    onError,
    onLoaded
  } = options;

  const [state, setState] = useState<VideoLoadState>({
    isLoading: false,
    isLoaded: false,
    progress: 0,
    error: null,
    metadata: null,
    videoElement: null
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentSourceRef = useRef<string | File | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isLoaded: false,
      progress: 0,
      error: null,
      metadata: null,
      videoElement: null
    });
    currentSourceRef.current = null;
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load(); // 清空当前加载
    }
  }, []);

  // 取消加载
  const cancelLoad = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // 创建 video 元素
  const createVideoElement = useCallback(() => {
    if (!videoRef.current) {
      videoRef.current = document.createElement('video');
      videoRef.current.preload = preload;
    }
    return videoRef.current;
  }, [preload]);

  // 处理文件大小获取
  const getFileSize = useCallback((source: string | File): number | undefined => {
    if (source instanceof File) {
      return source.size;
    }
    return undefined;
  }, []);

  // 加载视频
  const loadVideo = useCallback((source: string | File) => {
    currentSourceRef.current = source;
    
    // 取消之前的加载
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      isLoaded: false,
      progress: 0,
      error: null,
      metadata: null
    }));

    const video = createVideoElement();
    const fileSize = getFileSize(source);

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true, progress: 0 }));
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = Math.round((bufferedEnd / duration) * 100);
          setState(prev => ({ ...prev, progress }));
          onProgress?.(progress);
        }
      }
    };

    const handleLoadedMetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        size: fileSize
      };
      
      setState(prev => ({ 
        ...prev, 
        metadata,
        videoElement: video
      }));
      onMetadata?.(metadata);
    };

    const handleCanPlayThrough = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isLoaded: true, 
        progress: 100,
        videoElement: video
      }));
      onLoaded?.();
    };

    const handleError = () => {
      const errorMsg = video.error ? 
        `视频加载失败: ${video.error.message}` : 
        '视频加载失败';
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMsg 
      }));
      onError?.(errorMsg);
    };

    const handleAbort = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    // 添加事件监听器
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);
    video.addEventListener('abort', handleAbort);

    // 设置视频源
    try {
      if (source instanceof File) {
        const objectUrl = URL.createObjectURL(source);
        video.src = objectUrl;
        
        // 清理 URL 对象
        const cleanup = () => {
          URL.revokeObjectURL(objectUrl);
        };
        
        video.addEventListener('loadend', cleanup, { once: true });
        abortControllerRef.current.signal.addEventListener('abort', cleanup);
      } else {
        video.src = source;
      }

      if (autoLoad) {
        video.load();
      }
    } catch (err) {
      handleError();
    }

    // 清理函数
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.removeEventListener('abort', handleAbort);
    };
  }, [createVideoElement, getFileSize, autoLoad, onProgress, onMetadata, onError, onLoaded]);

  // 重试加载
  const retry = useCallback(() => {
    if (currentSourceRef.current) {
      loadVideo(currentSourceRef.current);
    }
  }, [loadVideo]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cancelLoad();
      if (videoRef.current) {
        const currentSrc = videoRef.current.src;
        if (currentSrc && currentSrc.startsWith('blob:')) {
          URL.revokeObjectURL(currentSrc);
        }
      }
    };
  }, [cancelLoad]);

  return {
    ...state,
    loadVideo,
    cancelLoad,
    retry,
    reset
  };
};

export default useVideoLoader;