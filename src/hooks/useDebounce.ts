import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook that debounces a value
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 500)
 *
 * useEffect(() => {
 *   // This will only run 500ms after the user stops typing
 *   searchApi(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timeout to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook that returns a debounced callback function
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced callback function
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value: string) => {
 *   saveToServer(value)
 * }, 1000)
 *
 * <input onChange={(e) => debouncedSave(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )

  return debouncedCallback
}

/**
 * Custom hook that debounces a value with immediate option
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @param immediate - If true, trigger on the leading edge instead of trailing
 * @returns The debounced value
 */
export function useDebounceImmediate<T>(value: T, delay: number, immediate: boolean = false): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const isFirstRun = useRef(true)

  useEffect(() => {
    // If immediate is true and this is the first run, update immediately
    if (immediate && isFirstRun.current) {
      setDebouncedValue(value)
      isFirstRun.current = false
      return
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay, immediate])

  return debouncedValue
}
