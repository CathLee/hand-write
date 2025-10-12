/*
 * @Date: 2025-10-12 15:11:19
 * @Description: 视频分片上传后端服务
 */
import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// 配置存储路径
const UPLOAD_DIR = path.join(__dirname, '../uploads'); // 临时分片目录
const MERGED_DIR = path.join(__dirname, '../uploads/videos'); // 合并后的视频目录
const CHUNK_DIR = path.join(UPLOAD_DIR, 'chunks'); // 分片存储目录

// 确保目录存在
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(MERGED_DIR);
fs.ensureDirSync(CHUNK_DIR);

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 从 query 参数获取 fileId（因为 req.body 在此时还未被解析）
    const fileId = req.query.fileId as string;
    if (!fileId) {
      return cb(new Error('缺少 fileId 参数'), '');
    }
    const chunkDir = path.join(CHUNK_DIR, fileId);
    fs.ensureDirSync(chunkDir);
    cb(null, chunkDir);
  },
  filename: (req, file, cb) => {
    // 从 query 参数获取 chunkIndex（因为 req.body 在此时还未被解析）
    const chunkIndex = req.query.chunkIndex as string;
    if (!chunkIndex) {
      return cb(new Error('缺少 chunkIndex 参数'), '');
    }
    cb(null, `chunk_${chunkIndex}`);
  },
});

const upload = multer({ storage });

// 计算文件 MD5
function calculateFileMD5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * 1. 秒传检查接口
 * POST /api/upload/check
 * 检查文件是否已存在，支持秒传功能
 */
router.post('/check', async (req: Request, res: Response) => {
  try {
    console.log('🔍 收到秒传检查请求:', req.body);
    const { fileMD5, filename } = req.body;

    if (!fileMD5 || !filename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    // 检查是否存在相同 MD5 的文件
    const existingFiles = await fs.readdir(MERGED_DIR);
    const matchedFile = existingFiles.find((file) =>
      file.includes(fileMD5)
    );

    if (matchedFile) {
      const filePath = path.join(MERGED_DIR, matchedFile);
      const stats = await fs.stat(filePath);

      return res.json({
        success: true,
        exists: true,
        path: `/uploads/videos/${matchedFile}`,
        size: stats.size,
        md5: fileMD5,
      });
    }

    res.json({
      success: true,
      exists: false,
    });
  } catch (error) {
    console.error('秒传检查失败:', error);
    res.status(500).json({
      success: false,
      message: '秒传检查失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 2. 上传分片接口
 * POST /api/upload/chunk
 * 接收并保存单个分片
 */
router.post('/chunk', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { fileId, chunkIndex } = req.body;

    if (!fileId || chunkIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未接收到文件',
      });
    }

    console.log(`✅ 分片 ${chunkIndex} 上传成功 (fileId: ${fileId})`);

    res.json({
      success: true,
      message: '分片上传成功',
      chunkIndex: parseInt(chunkIndex),
      size: req.file.size,
    });
  } catch (error) {
    console.error('分片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '分片上传失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 3. 查询已上传分片接口
 * GET /api/upload/chunks/:fileId
 * 返回指定文件已上传的分片索引列表（支持断点续传）
 */
router.get('/chunks/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const chunkDir = path.join(CHUNK_DIR, fileId);

    // 检查目录是否存在
    const exists = await fs.pathExists(chunkDir);
    if (!exists) {
      return res.json({
        success: true,
        chunks: [],
      });
    }

    // 读取已上传的分片
    const files = await fs.readdir(chunkDir);
    const chunks = files
      .filter((file) => file.startsWith('chunk_'))
      .map((file) => parseInt(file.replace('chunk_', '')))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    console.log(`📊 文件 ${fileId} 已上传分片: ${chunks.length} 个`);

    res.json({
      success: true,
      chunks,
      total: chunks.length,
    });
  } catch (error) {
    console.error('查询分片失败:', error);
    res.status(500).json({
      success: false,
      message: '查询分片失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 4. 合并分片接口
 * POST /api/upload/merge
 * 将所有分片合并成完整文件
 */
router.post('/merge', async (req: Request, res: Response) => {
  try {
    const { fileId, totalChunks, filename } = req.body;

    if (!fileId || !totalChunks || !filename) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
    }

    const chunkDir = path.join(CHUNK_DIR, fileId);

    // 检查所有分片是否都已上传
    const exists = await fs.pathExists(chunkDir);
    if (!exists) {
      return res.status(400).json({
        success: false,
        message: '未找到分片文件',
      });
    }

    const files = await fs.readdir(chunkDir);
    const chunkFiles = files
      .filter((file) => file.startsWith('chunk_'))
      .sort((a, b) => {
        const indexA = parseInt(a.replace('chunk_', ''));
        const indexB = parseInt(b.replace('chunk_', ''));
        return indexA - indexB;
      });

    if (chunkFiles.length !== totalChunks) {
      return res.status(400).json({
        success: false,
        message: `分片不完整，预期 ${totalChunks} 个，实际 ${chunkFiles.length} 个`,
      });
    }

    console.log(`🔄 开始合并文件 ${filename}，共 ${totalChunks} 个分片...`);

    // 生成最终文件名（包含时间戳避免冲突）
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const mergedFilename = `${basename}_${Date.now()}${ext}`;
    const mergedFilePath = path.join(MERGED_DIR, mergedFilename);

    // 创建写入流
    const writeStream = fs.createWriteStream(mergedFilePath);

    // 逐个读取分片并写入
    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(chunkDir, chunkFile);
      const chunkBuffer = await fs.readFile(chunkPath);
      writeStream.write(chunkBuffer);
    }

    // 等待写入完成
    await new Promise<void>((resolve, reject) => {
      writeStream.end(() => {
        console.log('✅ 文件写入完成');
        resolve();
      });
      writeStream.on('error', reject);
    });

    // 计算合并后文件的 MD5
    const fileMD5 = await calculateFileMD5(mergedFilePath);

    // 获取文件大小
    const stats = await fs.stat(mergedFilePath);

    // 清理分片文件
    await fs.remove(chunkDir);
    console.log(`🗑️ 已清理分片目录: ${chunkDir}`);

    console.log(`✅ 文件合并成功: ${mergedFilename} (${stats.size} bytes, MD5: ${fileMD5})`);

    res.json({
      success: true,
      message: '文件合并成功',
      path: `/uploads/videos/${mergedFilename}`,
      filename: mergedFilename,
      size: stats.size,
      md5: fileMD5,
    });
  } catch (error) {
    console.error('合并分片失败:', error);
    res.status(500).json({
      success: false,
      message: '合并分片失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

/**
 * 5. 清理未完成的上传任务（可选）
 * DELETE /api/upload/:fileId
 * 清理指定 fileId 的所有分片
 */
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const chunkDir = path.join(CHUNK_DIR, fileId);

    const exists = await fs.pathExists(chunkDir);
    if (exists) {
      await fs.remove(chunkDir);
      console.log(`🗑️ 已清理未完成的上传任务: ${fileId}`);
    }

    res.json({
      success: true,
      message: '清理成功',
    });
  } catch (error) {
    console.error('清理失败:', error);
    res.status(500).json({
      success: false,
      message: '清理失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

export default router;
