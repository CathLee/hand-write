/*
 * @Date: 2025-04-12 16:58:10
 * @Description: 
 */
import { useRef } from 'react'

// @see https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
export const useRefValue = <T>(value: () => T): T => {
  const ref = useRef<T>()

  if (!ref.current) {
    ref.current = value()
  }

  return ref.current!
}