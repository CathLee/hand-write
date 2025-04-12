/*
 * @Date: 2025-04-12 10:50:50
 * @Description: 錯誤boundary
 */
import React, { ErrorInfo, ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

interface MyErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onReset?: () => void;
  resetKeys?: any[];
  onError?: (error: Error, info: ErrorInfo) => void;
}

const DefaultFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="p-4 border rounded-md bg-red-50 text-red-800">
      <h2 className="font-bold text-lg mb-2">出错啦！</h2>
      <p className="mb-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        重试
      </button>
    </div>
  );
};

const defaultErrorFn = (error: Error, info: ErrorInfo) => {
  console.error("错误被 MyErrorBoundary 捕获:", error, info);
  // 你也可以接入 Sentry / LogRocket / 自定义日志服务
};

const MyErrorBoundary: React.FC<MyErrorBoundaryProps> = ({
  children,
  fallback = DefaultFallback,
  onReset = () => {},
  resetKeys = [],
  onError = defaultErrorFn,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onReset={onReset}
      resetKeys={resetKeys}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default MyErrorBoundary;
