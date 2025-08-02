/*
 * @Date: 2025-08-02
 * @Description: 视频分析 Hook，使用 WebWorker 进行视频帧分析
 */
import { useState, useRef, useCallback } from 'react';

export interface FrameAnalysis {
  frameIndex: number;
  timestamp: number;
  averageBrightness: number;
  colorDistribution: {
    red: number;
    green: number;
    blue: number;
  };
  pixelCount: number;
  isSceneChange: boolean;
}

export interface KeyFrame {
  frameIndex: number;
  timestamp: number;
  analysis: FrameAnalysis;
}

export interface VideoAnalysisResult {
  totalFramesAnalyzed: number;
  sceneChangeCount: number;
  keyFrames: KeyFrame[];
  frameAnalyses: FrameAnalysis[];
  averageBrightness: number;
  dominantColor: 'red' | 'green' | 'blue' | 'balanced';
}

export interface ThumbnailResult {
  thumbnail: Blob;
  originalSize: { width: number; height: number };
}

export interface UseVideoAnalysisOptions {
  onFrameAnalyzed?: (analysis: FrameAnalysis) => void;
  onThumbnailGenerated?: (result: ThumbnailResult) => void;
  onAnalysisComplete?: (result: VideoAnalysisResult) => void;
  onError?: (error: string) => void;
}

export interface UseVideoAnalysisReturn {
  isAnalyzing: boolean;
  progress: number;
  currentAnalysis: FrameAnalysis | null;
  analysisResult: VideoAnalysisResult | null;
  thumbnails: ThumbnailResult[];
  startAnalysis: (videoElement: HTMLVideoElement, options?: {
    frameInterval?: number;
    generateThumbnails?: boolean;
  }) => Promise<void>;
  stopAnalysis: () => void;
  reset: () => void;
}

const useVideoAnalysis = (options: UseVideoAnalysisOptions = {}): UseVideoAnalysisReturn => {
  const {
    onFrameAnalyzed,
    onThumbnailGenerated,
    onAnalysisComplete,
    onError
  } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<FrameAnalysis | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailResult[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const frameAnalyses = useRef<FrameAnalysis[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisIdRef = useRef<number>(0);

  // 初始化 Worker
  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker('/workers/videoAnalysisWorker.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, data } = e.data;
          
          switch (type) {
            case 'ANALYZE_COMPLETE':
              const analysis = data as FrameAnalysis;
              frameAnalyses.current.push(analysis);
              setCurrentAnalysis(analysis);
              onFrameAnalyzed?.(analysis);
              break;
              
            case 'THUMBNAIL_COMPLETE':
              const thumbnailResult = data as ThumbnailResult;
              setThumbnails(prev => [...prev, thumbnailResult]);
              onThumbnailGenerated?.(thumbnailResult);
              break;
              
            case 'KEYFRAMES_COMPLETE':
              // 分析完成
              const finalResult = calculateFinalResult(data);
              setAnalysisResult(finalResult);
              setIsAnalyzing(false);
              onAnalysisComplete?.(finalResult);
              break;
              
            case 'ERROR':
              console.error('Worker error:', data);
              setIsAnalyzing(false);
              onError?.(data.message);
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          setIsAnalyzing(false);
          onError?.('视频分析worker发生错误');
        };
      } catch (error) {
        console.error('Failed to create worker:', error);
        onError?.('无法创建视频分析worker');
      }
    }
    return workerRef.current;
  }, [onFrameAnalyzed, onThumbnailGenerated, onAnalysisComplete, onError]);

  // 计算最终分析结果
  const calculateFinalResult = useCallback((workerData: any): VideoAnalysisResult => {
    const analyses = frameAnalyses.current;
    const totalBrightness = analyses.reduce((sum, a) => sum + a.averageBrightness, 0);
    const avgBrightness = analyses.length > 0 ? totalBrightness / analyses.length : 0;
    
    // 计算主导颜色
    const totalRed = analyses.reduce((sum, a) => sum + a.colorDistribution.red, 0);
    const totalGreen = analyses.reduce((sum, a) => sum + a.colorDistribution.green, 0);
    const totalBlue = analyses.reduce((sum, a) => sum + a.colorDistribution.blue, 0);
    
    let dominantColor: 'red' | 'green' | 'blue' | 'balanced' = 'balanced';
    if (totalRed > totalGreen && totalRed > totalBlue) dominantColor = 'red';
    else if (totalGreen > totalRed && totalGreen > totalBlue) dominantColor = 'green';
    else if (totalBlue > totalRed && totalBlue > totalGreen) dominantColor = 'blue';
    
    return {
      totalFramesAnalyzed: workerData.totalFramesAnalyzed,
      sceneChangeCount: workerData.sceneChangeCount,
      keyFrames: workerData.keyFrames,
      frameAnalyses: analyses,
      averageBrightness: Math.round(avgBrightness),
      dominantColor
    };
  }, []);

  // 获取视频帧
  const captureFrame = useCallback((video: HTMLVideoElement): ImageData | null => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  // 开始分析
  const startAnalysis = useCallback(async (
    videoElement: HTMLVideoElement,
    analysisOptions: {
      frameInterval?: number;
      generateThumbnails?: boolean;
    } = {}
  ) => {
    const { frameInterval = 1, generateThumbnails = true } = analysisOptions;
    
    if (!videoElement || !videoElement.duration) {
      onError?.('无效的视频元素');
      return;
    }

    const worker = initWorker();
    if (!worker) {
      onError?.('无法初始化分析worker');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    frameAnalyses.current = [];
    setThumbnails([]);
    setCurrentAnalysis(null);
    setAnalysisResult(null);

    const duration = videoElement.duration;
    const framesToAnalyze = Math.floor(duration / frameInterval);
    let frameIndex = 0;

    try {
      // 逐帧分析
      for (let time = 0; time < duration; time += frameInterval) {
        videoElement.currentTime = time;
        
        // 等待视频跳转到指定时间
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            videoElement.removeEventListener('seeked', onSeeked);
            resolve();
          };
          videoElement.addEventListener('seeked', onSeeked);
        });

        const imageData = captureFrame(videoElement);
        if (!imageData) continue;

        // 发送帧数据到 Worker 进行分析
        worker.postMessage({
          type: 'ANALYZE_FRAME',
          data: {
            imageData,
            timestamp: time,
            frameIndex
          },
          id: ++analysisIdRef.current
        });

        // 生成缩略图（每5帧生成一个）
        if (generateThumbnails && frameIndex % 5 === 0) {
          worker.postMessage({
            type: 'GENERATE_THUMBNAIL',
            data: {
              imageData,
              width: videoElement.videoWidth,
              height: videoElement.videoHeight
            },
            id: ++analysisIdRef.current
          });
        }

        frameIndex++;
        setProgress(Math.round((frameIndex / framesToAnalyze) * 100));

        // 让出控制权，避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // 请求关键帧提取
      worker.postMessage({
        type: 'EXTRACT_KEYFRAMES',
        data: {},
        id: ++analysisIdRef.current
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      onError?.('视频分析过程中发生错误');
    }
  }, [initWorker, captureFrame, onError]);

  // 停止分析
  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    stopAnalysis();
    setProgress(0);
    setCurrentAnalysis(null);
    setAnalysisResult(null);
    setThumbnails([]);
    frameAnalyses.current = [];
  }, [stopAnalysis]);

  return {
    isAnalyzing,
    progress,
    currentAnalysis,
    analysisResult,
    thumbnails,
    startAnalysis,
    stopAnalysis,
    reset
  };
};

export default useVideoAnalysis;