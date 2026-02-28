import { ref, watch, type Ref } from 'vue'

/**
 * Returns a debounced copy of a ref that updates after `delay` ms of inactivity.
 */
export function useDebounce<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(source, (val) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  return debounced
}
