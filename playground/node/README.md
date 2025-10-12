# 视频分片上传后端服务

这是一个支持大文件分片上传的 Node.js 后端服务，配合 `useSplitVideo` Hook 使用。

## 功能特性

- **分片上传**: 将大文件分成多个小块上传，支持断点续传
- **秒传检查**: 通过 MD5 校验，相同文件无需重复上传
- **断点续传**: 支持查询已上传分片，继续未完成的上传
- **自动合并**: 所有分片上传完成后自动合并为完整文件
- **错误处理**: 完善的错误处理和重试机制

## 安装依赖

```bash
pnpm add express multer fs-extra
pnpm add -D @types/express @types/multer @types/fs-extra
```

## 目录结构

```
playground/
├── node/
│   ├── video.ts          # 视频上传路由
│   ├── server.ts         # Express 服务器启动文件
│   └── README.md         # 本文件
└── uploads/              # 上传文件存储目录（自动创建）
    ├── chunks/           # 临时分片目录
    └── videos/           # 合并后的视频文件
```

## API 接口

### 1. 秒传检查

**POST** `/api/upload/check`

检查文件是否已存在，支持秒传功能。

**请求体:**
```json
{
  "fileMD5": "文件的 MD5 值",
  "filename": "文件名"
}
```

**响应:**
```json
{
  "success": true,
  "exists": true,
  "path": "/uploads/videos/xxx.mp4",
  "size": 1024000,
  "md5": "..."
}
```

### 2. 上传分片

**POST** `/api/upload/chunk`

上传单个分片文件。

**请求 (FormData):**
- `file`: 分片文件 Blob
- `fileId`: 文件唯一标识
- `chunkIndex`: 分片索引

**响应:**
```json
{
  "success": true,
  "message": "分片上传成功",
  "chunkIndex": 0,
  "size": 10485760
}
```

### 3. 查询已上传分片

**GET** `/api/upload/chunks/:fileId`

查询指定文件已上传的分片索引列表（支持断点续传）。

**响应:**
```json
{
  "success": true,
  "chunks": [0, 1, 2, 5, 6],
  "total": 5
}
```

### 4. 合并分片

**POST** `/api/upload/merge`

将所有分片合并成完整文件。

**请求体:**
```json
{
  "fileId": "文件唯一标识",
  "totalChunks": 10,
  "filename": "video.mp4"
}
```

**响应:**
```json
{
  "success": true,
  "message": "文件合并成功",
  "path": "/uploads/videos/video_1234567890.mp4",
  "filename": "video_1234567890.mp4",
  "size": 104857600,
  "md5": "..."
}
```

### 5. 清理未完成的上传

**DELETE** `/api/upload/:fileId`

清理指定 fileId 的所有分片。

**响应:**
```json
{
  "success": true,
  "message": "清理成功"
}
```

## 使用示例

### 启动服务器

创建 `server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import videoRouter from './video';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于访问上传的视频）
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/upload', videoRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 上传接口: http://localhost:${PORT}/api/upload`);
});
```

运行服务器:

```bash
ts-node server.ts
# 或使用 nodemon 开发模式
nodemon server.ts
```

### 前端配置

在使用 `useSplitVideo` Hook 时，配置服务器地址：

```typescript
import useSplitVideo from '@/hooks/useSplitVideo';

const VideoUploader = () => {
  const { uploadFile, progress, status } = useSplitVideo({
    serverUrl: 'http://localhost:3001/api/upload', // 后端服务地址
    chunkSize: 10 * 1024 * 1024, // 10MB 分片
    concurrentLimit: 3, // 并发上传 3 个分片
    onProgress: (prog) => {
      console.log(`上传进度: ${prog.percentage.toFixed(2)}%`);
    },
    onComplete: (result) => {
      console.log('上传完成:', result);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileSelect} />
      <p>状态: {status}</p>
      <p>进度: {progress.percentage.toFixed(2)}%</p>
    </div>
  );
};
```

## 配置说明

### 环境变量（可选）

可以通过环境变量配置上传目录：

```bash
UPLOAD_DIR=/path/to/uploads
PORT=3001
```

### 修改存储路径

在 `video.ts` 中修改以下常量：

```typescript
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const MERGED_DIR = path.join(__dirname, '../uploads/videos');
const CHUNK_DIR = path.join(UPLOAD_DIR, 'chunks');
```

## 注意事项

1. **文件大小限制**: 默认无限制，可在 multer 配置中添加 `limits` 选项
2. **并发控制**: 建议前端并发数设置为 3-5，避免服务器压力过大
3. **清理机制**: 分片合并后会自动清理临时文件，但建议定期清理过期的未完成上传
4. **安全性**: 生产环境需添加身份验证、文件类型校验等安全措施
5. **跨域配置**: 开发环境已配置 CORS，生产环境需根据实际情况调整

## 故障排查

### 问题 1: 分片上传失败

检查：
- 服务器 `/uploads/chunks` 目录是否有写入权限
- 网络连接是否稳定
- 服务器磁盘空间是否充足

### 问题 2: 合并失败

检查：
- 所有分片是否都已上传完成
- 分片顺序是否正确
- 服务器内存是否足够（大文件合并需要足够内存）

### 问题 3: 秒传不生效

检查：
- 前端 MD5 计算是否正确
- 文件名匹配逻辑是否符合预期
