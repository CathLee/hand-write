/*
 * @Date: 2025-04-12 16:49:28
 * @Description: 封装最新的ref解决闭包问题
 */
import { useRef } from "react";

// 封装一个useRef,
function useLastest<T>(initialValue: T): { current: T } {
  const ref = useRef<T>(initialValue);
  ref.current = initialValue;
  return ref;
}

export default useLastest;
