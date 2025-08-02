/*
 * @Date: 2025-08-02
 * @Description: 视频分析 WebWorker - 处理视频帧分析和缩略图生成
 */

// Worker 消息类型定义
const MESSAGE_TYPES = {
  ANALYZE_FRAME: 'ANALYZE_FRAME',
  GENERATE_THUMBNAIL: 'GENERATE_THUMBNAIL',
  EXTRACT_KEYFRAMES: 'EXTRACT_KEYFRAMES',
  ANALYZE_COMPLETE: 'ANALYZE_COMPLETE',
  THUMBNAIL_COMPLETE: 'THUMBNAIL_COMPLETE',
  KEYFRAMES_COMPLETE: 'KEYFRAMES_COMPLETE',
  ERROR: 'ERROR'
};

// 分析视频帧的颜色分布
function analyzeFrameColors(imageData) {
  const data = imageData.data;
  const colorBuckets = {
    red: 0,
    green: 0,
    blue: 0,
    brightness: 0
  };
  
  let totalBrightness = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 计算亮度 (使用标准公式)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
    
    // 统计主要颜色
    if (r > g && r > b) colorBuckets.red++;
    else if (g > r && g > b) colorBuckets.green++;
    else if (b > r && b > g) colorBuckets.blue++;
  }
  
  return {
    averageBrightness: Math.round(totalBrightness / pixelCount),
    colorDistribution: {
      red: Math.round((colorBuckets.red / pixelCount) * 100),
      green: Math.round((colorBuckets.green / pixelCount) * 100),
      blue: Math.round((colorBuckets.blue / pixelCount) * 100)
    },
    pixelCount
  };
}

// 检测场景变化
function detectSceneChange(currentAnalysis, previousAnalysis) {
  if (!previousAnalysis) return false;
  
  const brightnessDiff = Math.abs(
    currentAnalysis.averageBrightness - previousAnalysis.averageBrightness
  );
  
  const colorDiff = Math.abs(
    currentAnalysis.colorDistribution.red - previousAnalysis.colorDistribution.red
  ) + Math.abs(
    currentAnalysis.colorDistribution.green - previousAnalysis.colorDistribution.green
  ) + Math.abs(
    currentAnalysis.colorDistribution.blue - previousAnalysis.colorDistribution.blue
  );
  
  // 如果亮度变化超过30或颜色分布变化超过40%，认为是场景变化
  return brightnessDiff > 30 || colorDiff > 40;
}

// 生成缩略图
function generateThumbnail(imageData, width, height, maxWidth = 200, maxHeight = 150) {
  // 计算缩放比例
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  
  // 创建离屏 canvas
  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');
  
  // 创建临时 canvas 来处理原始数据
  const tempCanvas = new OffscreenCanvas(width, height);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);
  
  // 绘制缩放后的图像
  ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
}

// 存储分析历史
let analysisHistory = [];
let keyFrames = [];

// 处理消息
self.onmessage = async function(e) {
  const { type, data, id } = e.data;
  
  try {
    switch (type) {
      case MESSAGE_TYPES.ANALYZE_FRAME: {
        const { imageData, timestamp, frameIndex } = data;
        
        // 分析当前帧
        const analysis = analyzeFrameColors(imageData);
        analysis.timestamp = timestamp;
        analysis.frameIndex = frameIndex;
        
        // 检测场景变化
        const previousAnalysis = analysisHistory[analysisHistory.length - 1];
        const isSceneChange = detectSceneChange(analysis, previousAnalysis);
        analysis.isSceneChange = isSceneChange;
        
        // 如果是场景变化，标记为关键帧
        if (isSceneChange || analysisHistory.length === 0) {
          keyFrames.push({
            frameIndex,
            timestamp,
            analysis
          });
        }
        
        analysisHistory.push(analysis);
        
        self.postMessage({
          type: MESSAGE_TYPES.ANALYZE_COMPLETE,
          data: analysis,
          id
        });
        break;
      }
      
      case MESSAGE_TYPES.GENERATE_THUMBNAIL: {
        const { imageData, width, height } = data;
        
        const thumbnailBlob = await generateThumbnail(imageData, width, height);
        
        self.postMessage({
          type: MESSAGE_TYPES.THUMBNAIL_COMPLETE,
          data: {
            thumbnail: thumbnailBlob,
            originalSize: { width, height }
          },
          id
        });
        break;
      }
      
      case MESSAGE_TYPES.EXTRACT_KEYFRAMES: {
        // 返回所有关键帧信息
        self.postMessage({
          type: MESSAGE_TYPES.KEYFRAMES_COMPLETE,
          data: {
            keyFrames: keyFrames.slice(),
            totalFramesAnalyzed: analysisHistory.length,
            sceneChangeCount: keyFrames.length
          },
          id
        });
        break;
      }
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: MESSAGE_TYPES.ERROR,
      data: {
        message: error.message,
        stack: error.stack
      },
      id
    });
  }
};

// 清理函数（当 worker 被终止时）
self.onclose = function() {
  analysisHistory = null;
  keyFrames = null;
};