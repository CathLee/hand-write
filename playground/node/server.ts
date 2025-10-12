/*
 * @Date: 2025-10-12 15:11:19
 * @Description: Express 服务器启动文件
 */
import express from 'express';
import cors from 'cors';
import videoRouter from './video.js'; // ES Module 需要添加 .js 扩展名

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: '*', // 开发环境允许所有来源，生产环境应指定具体域名
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件（调试用）
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 静态文件服务 - 用于访问上传的视频文件
app.use('/uploads', express.static('uploads'));

// 路由配置
app.use('/api/upload', videoRouter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '视频分片上传服务',
    version: '1.0.0',
    endpoints: {
      check: 'POST /api/upload/check',
      chunk: 'POST /api/upload/chunk',
      chunks: 'GET /api/upload/chunks/:fileId',
      merge: 'POST /api/upload/merge',
      delete: 'DELETE /api/upload/:fileId',
    },
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path,
  });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 视频分片上传服务已启动`);
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log(`📁 上传接口: http://localhost:${PORT}/api/upload`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log('========================================');
});

export default app;
