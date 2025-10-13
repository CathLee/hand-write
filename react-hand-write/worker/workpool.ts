/*
 * @Date: 2025-10-12 09:47:46
 * @Description:
 */
/**
 * @Date: 2025-10-11
 * @Description: Worker Pool 实现 - 复用Worker，避免频繁创建销毁
 */

// ============ Worker Pool 类 ============

export interface WorkerTask<T = any> {
  id: string;
  type: string;
  data: any;
  resolve: (result: T) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface PoolWorker {
  worker: Worker;
  busy: boolean;
  currentTaskId: string | null;
}

export class WorkerPool {
  private workers: PoolWorker[] = [];
  private queue: WorkerTask[] = [];
  private workerCode: string;
  private maxWorkers: number;
  private workerUrl: string | null = null;

  constructor(workerCode: string, maxWorkers: number = 2) {
    this.workerCode = workerCode;
    this.maxWorkers = maxWorkers;
    this.initialize();
  }

  // 初始化Worker池
  private initialize() {
    // 创建Blob URL（只创建一次）
    const blob = new Blob([this.workerCode], {
      type: "application/javascript",
    });
    this.workerUrl = URL.createObjectURL(blob);
    // 创建初始Worker池
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * 创建单个Worker
   */
  private createWorker(): PoolWorker {
    const worker = new Worker(this.workerUrl!);
    const poolWorker: PoolWorker = {
      worker,
      busy: false,
      currentTaskId: null,
    };

    // 监听Worker消息
    worker.onmessage = (event) => {
      this.handleWorkerMessage(poolWorker, event.data);
    };

    // 监听Worker错误
    worker.onerror = (error) => {
      console.error("Worker error:", error);
      this.handleWorkerError(poolWorker, error);
    };

    this.workers.push(poolWorker);
    return poolWorker;
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(poolWorker: PoolWorker, error: any) {
    if (poolWorker.currentTaskId) {
      const task = this.queue.find((t) => t.id === poolWorker.currentTaskId);
      if (task) {
        task.reject(new Error('Worker执行错误'));
        this.removeTask(poolWorker.currentTaskId);
      }
    }
    this.releaseWorker(poolWorker);
    this.processQueue();
  }


   /**
   * 处理Worker消息
   */
  private handleWorkerMessage(poolWorker: PoolWorker, data: any) {
    const { type, taskId, result, progress, error } = data;

    // 找到对应的任务
    const task = this.queue.find((t) => t.id === taskId);
    if (!task) return;

    if (type === 'progress') {
      // 进度更新
      task.onProgress?.(progress);
    } else if (type === 'complete') {
      // 任务完成
      task.resolve(result);
      this.removeTask(taskId);
      this.releaseWorker(poolWorker);
      this.processQueue();
    } else if (type === 'error') {
      // 任务错误
      task.reject(new Error(error));
      this.removeTask(taskId);
      this.releaseWorker(poolWorker);
      this.processQueue();
    }
  }


  /**
   * 从队列中移除任务
   */
  private removeTask(taskId: string) {
    const index = this.queue.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }


  /**
   * 获取空闲Worker
   */
  private getIdleWorker(): PoolWorker | null {
    return this.workers.find((w) => !w.busy) || null;
  }

  /**
   * 分配任务给Worker
   */
  private assignTask(poolWorker: PoolWorker, task: WorkerTask) {
    poolWorker.busy = true;
    poolWorker.currentTaskId = task.id;

    // 发送任务给Worker
    poolWorker.worker.postMessage({
      taskId: task.id,
      type: task.type,
      data: task.data,
    });
  }

  /**
   * 处理队列中的任务
   */
  private processQueue() {
    const idleWorker = this.getIdleWorker();
    console.log(idleWorker);

    if (!idleWorker) return;

    // 找到待处理的任务（排除已分配的任务）
    const pendingTask = this.queue.find(
      (task) => !this.workers.some((w) => w.currentTaskId === task.id)
    );
    console.log(pendingTask);

    if (pendingTask) {
      this.assignTask(idleWorker, pendingTask);
    }
  }

  /**
   * 提交任务到Worker Pool
   */
  public execute<T = any>(
    type: string,
    data: any,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask<T> = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        resolve,
        reject,
        onProgress,
      };

      // 添加到队列
      this.queue.push(task);

      console.log("尝试立即分配");

      // 尝试立即分配
      this.processQueue();
    });
  }

  /**
   * 获取Worker Pool状态
   */
  public getStatus() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter((w) => w.busy).length,
      idleWorkers: this.workers.filter((w) => !w.busy).length,
      queuedTasks: this.queue.filter(
        (task) => !this.workers.some((w) => w.currentTaskId === task.id)
      ).length,
      runningTasks: this.workers.filter((w) => w.busy).length,
    };
  }

  /**
   * 释放Worker
   */
  private releaseWorker(poolWorker: PoolWorker) {
    poolWorker.busy = false;
    poolWorker.currentTaskId = null;
  }

  /**
   * 清空所有任务
   */
  public clear() {
    // 拒绝所有待处理任务
    this.queue.forEach((task) => {
      task.reject(new Error("Worker Pool已清空"));
    });
    this.queue = [];

    // 释放所有Worker
    this.workers.forEach((w) => {
      if (w.busy) {
        w.worker.postMessage({ type: "cancel" });
      }
      this.releaseWorker(w);
    });
  }

  /**
   * 销毁Worker Pool
   */
  public destroy() {
    this.clear();

    // 终止所有Worker
    this.workers.forEach((poolWorker) => {
      poolWorker.worker.terminate();
    });
    this.workers = [];

    // 释放Blob URL
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
  }
}

// ============ Worker 代码模板 ============
// Worker 代码 - 计算文件MD5
export const MD5_WORKER_CODE = `
self.onmessage = async (event) => {
  const { taskId, type, data } = event.data;

  if (type === "calculateMD5") {
    const { file } = data;
    try {
      // 使用FileReader分块读取
      const chunkSize = 2 * 1024 * 1024; // 2MB
      // 偏移量
      let offset = 0;
      let hashParts = []; // 存储 Uint8Array 块，而不是展开的字节

      // 读取下一个分块
      const readNextChunk = () => {
        // 递归终止条件：
        if (offset >= file.size) {
          // 计算最终MD5
          calculateFinalHash();
          return;
        }
        const chunk = file.slice(
          offset,
          Math.min(offset + chunkSize, file.size)
        );
        const reader = new FileReader();
        reader.onprogress = (e) => {
          // 计算进度
          // lengthComputable 是 ProgressEvent 对象的一个布尔属性，表示是否能够计算进度
          if (e.lengthComputable) {
            const currentProgress = ((offset + e.loaded) / file.size) * 100;
            self.postMessage({
              type: "progress",
              taskId,
              progress: currentProgress,
            });
          }
        };

        reader.onload = (e) => {
          // 相当于读取文件地址然后重组
          const arrayBuffer = e.target?.result;
          const unit8Array = new Uint8Array(arrayBuffer);
          // 直接存储 Uint8Array 块，避免参数数量溢出
          hashParts.push(unit8Array);
          offset += chunkSize;
          // 使用 setTimeout 打破同步调用栈，避免栈溢出
          setTimeout(readNextChunk, 0);
        };

        reader.onerror = () => {
          self.postMessage({
            type: "error",
            taskId,
            error: "文件读取失败",
          });
        };
        reader.readAsArrayBuffer(chunk);
      };

      // 计算最终MD5
      const calculateFinalHash = async () => {
        try {
          // 计算总长度
          const totalLength = hashParts.reduce((sum, arr) => sum + arr.length, 0);

          // 创建一个足够大的 Uint8Array 来存储所有数据
          const finalArray = new Uint8Array(totalLength);

          // 使用 set() 方法拼接所有块
          let position = 0;
          for (const part of hashParts) {
            finalArray.set(part, position);
            position += part.length;
          }

          // 计算哈希
          const hashBuffer = await crypto.subtle.digest("SHA-256", finalArray.buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const md5 = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
          self.postMessage({
            type: "complete",
            taskId,
            result: md5,
          });
        } catch (error) {
          self.postMessage({
            type: "error",
            taskId,
            error: "MD5计算失败",
          });
        }
      };

      // 启动分块读取
      readNextChunk();
    } catch (error) {
       self.postMessage({
          type: 'error',
          taskId,
          error: error.message || 'MD5计算失败'
        });
    }
  }else if (type === 'cancel') {
      // 取消当前任务（可以设置标志位来中断）
      self.postMessage({
        type: 'error',
        taskId: data.taskId,
        error: '任务已取消'
      });
    }
}
`;

// MD5 计算pool
export class MD5WorkerPool {
  private pool: WorkerPool;

  constructor(maxWorkers: number = 2) {
    this.pool = new WorkerPool(MD5_WORKER_CODE, maxWorkers);
  }

  /**
   * 计算文件MD5
   */
  public calculateMD5(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return this.pool.execute<string>("calculateMD5", { file }, onProgress);
  }

  /**
   * 获取Pool状态
   */
  public getStatus() {
    return this.pool.getStatus();
  }

  /**
   * 清空所有任务
   */
  public clear() {
    this.pool.clear();
  }

  /**
   * 销毁Worker Pool
   */
  public destroy() {
    this.pool.destroy();
  }
}

export default WorkerPool;
