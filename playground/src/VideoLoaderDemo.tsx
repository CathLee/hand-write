/*
 * @Date: 2025-08-02
 * @Description: useVideoLoader Hook 演示组件
 */
import React, { useRef, useState, useEffect } from 'react';
import useVideoLoader from '../../react-hand-write/hook/useVideoLoader';
import useVideoAnalysis from '../../react-hand-write/hook/useVideoAnalysis';

const VideoLoaderDemo: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'load' | 'analysis'>('load');

  const {
    isLoading,
    isLoaded,
    progress,
    error,
    metadata,
    videoElement,
    loadVideo,
    cancelLoad,
    retry,
    reset
  } = useVideoLoader({
    preload: 'metadata',
    autoLoad: true,
    onProgress: (progress) => console.log('加载进度:', progress + '%'),
    onMetadata: (metadata) => console.log('视频元数据:', metadata),
    onError: (error) => console.error('加载错误:', error),
    onLoaded: () => console.log('视频加载完成')
  });

  // 视频分析 hook
  const {
    isAnalyzing,
    progress: analysisProgress,
    currentAnalysis,
    analysisResult,
    thumbnails,
    startAnalysis,
    stopAnalysis,
    reset: resetAnalysis
  } = useVideoAnalysis({
    onFrameAnalyzed: (analysis) => console.log('帧分析完成:', analysis),
    onThumbnailGenerated: (result) => console.log('缩略图生成:', result),
    onAnalysisComplete: (result) => console.log('分析完成:', result),
    onError: (error) => console.error('分析错误:', error)
  });

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadVideo(file);
    }
  };

  // 处理 URL 加载
  const handleUrlLoad = () => {
    const url = urlInputRef.current?.value;
    if (url) {
      loadVideo(url);
    }
  };

  // 开始视频分析
  const handleStartAnalysis = () => {
    if (videoElement && isLoaded) {
      startAnalysis(videoElement, {
        frameInterval: 2, // 每2秒分析一帧
        generateThumbnails: true
      });
    }
  };

  // 当视频加载完成时自动切换到分析标签页
  useEffect(() => {
    if (isLoaded && !isAnalyzing && !analysisResult) {
      // 自动切换到分析标签页并显示提示
      setActiveTab('analysis');
    }
  }, [isLoaded, isAnalyzing, analysisResult]);

  // 重置所有状态
  const handleResetAll = () => {
    reset();
    resetAnalysis();
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🎥 视频加载器与分析演示</h2>
      
      {/* 标签页导航 */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('load')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'load' ? '2px solid #007acc' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          视频加载
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'analysis' ? '2px solid #007acc' : 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
        >
          视频分析 (WebWorker)
        </button>
      </div>
      
      {/* 控制区域 */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>加载控制</h3>
        
        {/* 文件上传 */}
        <div style={{ marginBottom: '15px' }}>
          <label>选择视频文件：</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ marginLeft: '10px' }}
          />
        </div>

        {/* URL 输入 */}
        <div style={{ marginBottom: '15px' }}>
          <label>或输入视频 URL：</label>
          <input
            ref={urlInputRef}
            type="url"
            placeholder="https://example.com/video.mp4"
            style={{ marginLeft: '10px', width: '300px', padding: '5px' }}
          />
          <button 
            onClick={handleUrlLoad}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            加载
          </button>
        </div>

        {/* 操作按钮 */}
        <div>
          <button 
            onClick={cancelLoad} 
            disabled={!isLoading}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            取消加载
          </button>
          <button 
            onClick={retry} 
            disabled={isLoading || !error}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            重试
          </button>
          <button 
            onClick={handleResetAll}
            style={{ padding: '5px 10px' }}
          >
            重置全部
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'load' ? (
        <div>
          {/* 加载状态显示 */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>加载状态</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
              <span>状态：</span>
              <span style={{ color: isLoading ? '#ff9500' : isLoaded ? '#34c759' : '#666' }}>
                {isLoading ? '加载中...' : isLoaded ? '已加载' : '待加载'}
              </span>
              
              <span>进度：</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{ 
                    width: '200px', 
                    height: '10px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: '#34c759',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ marginLeft: '10px' }}>{progress}%</span>
              </div>

              {error && (
                <>
                  <span>错误：</span>
                  <span style={{ color: '#ff3b30' }}>{error}</span>
                </>
              )}
            </div>
          </div>

          {/* 视频元数据 */}
          {metadata && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>视频信息</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px' }}>
                <span>时长：</span>
                <span>{formatDuration(metadata.duration)}</span>
                
                <span>分辨率：</span>
                <span>{metadata.videoWidth} × {metadata.videoHeight}</span>
                
                <span>文件大小：</span>
                <span>{formatFileSize(metadata.size)}</span>
              </div>
            </div>
          )}

          {/* 视频预览 */}
          {videoElement && isLoaded && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>视频预览</h3>
              <video
                controls
                style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
                src={videoElement.src}
              >
                您的浏览器不支持视频播放。
              </video>
              
              {/* 分析提示 */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e8f4ff', 
                borderRadius: '5px',
                border: '1px solid #007acc' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🧠</span>
                  <div>
                    <strong>视频已就绪！</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>
                      现在可以使用 AI 分析功能了，切换到"视频分析"标签页开始智能分析
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#007acc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    立即分析
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>功能说明</h3>
            <ul>
              <li>支持本地文件和远程 URL 加载</li>
              <li>实时显示加载进度</li>
              <li>自动获取视频元数据（时长、分辨率、文件大小）</li>
              <li>支持取消加载和重试操作</li>
              <li>错误处理和状态管理</li>
              <li>内存优化（自动清理 blob URL）</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {/* 视频分析控制 */}
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>🧠 AI 视频分析控制</h3>
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleStartAnalysis}
                disabled={!isLoaded || isAnalyzing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isLoaded && !isAnalyzing ? '#007acc' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isLoaded && !isAnalyzing ? 'pointer' : 'not-allowed',
                  marginRight: '10px'
                }}
              >
                {isAnalyzing ? '分析中...' : '开始智能分析'}
              </button>
              <button
                onClick={stopAnalysis}
                disabled={!isAnalyzing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isAnalyzing ? '#ff3b30' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isAnalyzing ? 'pointer' : 'not-allowed',
                  marginRight: '10px'
                }}
              >
                停止分析
              </button>
              <button
                onClick={resetAnalysis}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                重置分析
              </button>
            </div>
            {!isLoaded && (
              <p style={{ color: '#666', fontSize: '14px' }}>
                ⚠️ 请先在"视频加载"标签页中加载视频
              </p>
            )}
          </div>

          {/* 分析进度 */}
          {isAnalyzing && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>🔄 分析进度</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    height: '15px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '7px',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      width: `${analysisProgress}%`,
                      height: '100%',
                      backgroundColor: '#007acc',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ marginLeft: '15px', minWidth: '50px' }}>{analysisProgress}%</span>
              </div>
              {currentAnalysis && (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  正在分析帧 {currentAnalysis.frameIndex + 1} (时间: {currentAnalysis.timestamp.toFixed(1)}s)
                  {currentAnalysis.isSceneChange && <span style={{ color: '#ff9500' }}> - 检测到场景变化!</span>}
                </div>
              )}
            </div>
          )}

          {/* 实时分析结果 */}
          {currentAnalysis && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>📊 当前帧分析</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px' }}>
                <span>帧索引：</span>
                <span>{currentAnalysis.frameIndex}</span>
                
                <span>时间戳：</span>
                <span>{currentAnalysis.timestamp.toFixed(2)}s</span>
                
                <span>平均亮度：</span>
                <span>{currentAnalysis.averageBrightness}</span>
                
                <span>颜色分布：</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#ff3b30' }}>红: {currentAnalysis.colorDistribution.red}%</span>
                  <span style={{ color: '#34c759' }}>绿: {currentAnalysis.colorDistribution.green}%</span>
                  <span style={{ color: '#007acc' }}>蓝: {currentAnalysis.colorDistribution.blue}%</span>
                </div>
                
                <span>场景变化：</span>
                <span style={{ color: currentAnalysis.isSceneChange ? '#ff9500' : '#666' }}>
                  {currentAnalysis.isSceneChange ? '是' : '否'}
                </span>
              </div>
            </div>
          )}

          {/* 最终分析结果 */}
          {analysisResult && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>📈 完整分析报告</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', marginBottom: '15px' }}>
                <span>总分析帧数：</span>
                <span>{analysisResult.totalFramesAnalyzed}</span>
                
                <span>场景变化次数：</span>
                <span>{analysisResult.sceneChangeCount}</span>
                
                <span>平均亮度：</span>
                <span>{analysisResult.averageBrightness}</span>
                
                <span>主导颜色：</span>
                <span style={{ 
                  color: analysisResult.dominantColor === 'red' ? '#ff3b30' :
                        analysisResult.dominantColor === 'green' ? '#34c759' :
                        analysisResult.dominantColor === 'blue' ? '#007acc' : '#666'
                }}>
                  {analysisResult.dominantColor === 'red' ? '红色' :
                   analysisResult.dominantColor === 'green' ? '绿色' :
                   analysisResult.dominantColor === 'blue' ? '蓝色' : '平衡'}
                </span>
              </div>
              
              {/* 关键帧列表 */}
              <h4>🎯 关键帧 (场景变化点)</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
                {analysisResult.keyFrames.map((keyFrame, index) => (
                  <div key={index} style={{ 
                    padding: '5px 0', 
                    borderBottom: index < analysisResult.keyFrames.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: '14px'
                  }}>
                    第 {keyFrame.frameIndex + 1} 帧 - {keyFrame.timestamp.toFixed(2)}s 
                    (亮度: {keyFrame.analysis.averageBrightness})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 自动生成的缩略图 */}
          {thumbnails.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>🖼️ 自动生成缩略图 ({thumbnails.length})</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {thumbnails.map((thumbnail, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <img
                      src={URL.createObjectURL(thumbnail.thumbnail)}
                      alt={`缩略图 ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onLoad={(e) => {
                        // 图片加载后释放 URL
                        setTimeout(() => {
                          URL.revokeObjectURL((e.target as HTMLImageElement).src);
                        }, 100);
                      }}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WebWorker 说明 */}
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>⚡ WebWorker 视频分析功能</h3>
            <ul>
              <li><strong>智能场景检测：</strong>通过亮度和颜色分布变化自动识别场景切换</li>
              <li><strong>实时帧分析：</strong>分析每一帧的颜色分布、亮度等特征</li>
              <li><strong>关键帧提取：</strong>自动标记重要的场景变化点</li>
              <li><strong>缩略图生成：</strong>自动生成视频关键帧缩略图</li>
              <li><strong>后台处理：</strong>使用 WebWorker 避免阻塞 UI 线程</li>
              <li><strong>内存优化：</strong>使用 OffscreenCanvas 和及时释放资源</li>
            </ul>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              💡 这个演示展示了如何使用 WebWorker 进行计算密集型的视频分析任务，
              保证主线程的流畅性同时进行复杂的图像处理。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLoaderDemo;