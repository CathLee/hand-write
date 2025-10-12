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
      //   this.createWorker();
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

      // 尝试立即分配
    //   this.processQueue();
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

export const MD5_WORKER_CODE = `
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
