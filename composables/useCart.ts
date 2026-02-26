import type { CartItem } from '~/types/shop'

const STORAGE_KEY = 'bl-cart'

/**
 * Shopping cart composable — useState + localStorage persistence.
 * Follows the same pattern as useLikes.
 */
export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const isOpen = useState<boolean>('cart-open', () => false)

  // Hydrate from localStorage on client mount
  if (import.meta.client) {
    onMounted(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[]
          if (Array.isArray(parsed)) {
            items.value = parsed
          }
        }
      } catch {
        // Corrupt localStorage
      }
    })
  }

  function persistToStorage() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // Storage full
    }
  }

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find(
      (i) => i.variantId === item.variantId,
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...item, quantity })
    }
    persistToStorage()
    isOpen.value = true
  }

  function removeItem(variantId: number) {
    items.value = items.value.filter((i) => i.variantId !== variantId)
    persistToStorage()
  }

  function updateQuantity(variantId: number, quantity: number) {
    const item = items.value.find((i) => i.variantId === variantId)
    if (item) {
      if (quantity <= 0) {
        removeItem(variantId)
      } else {
        item.quantity = quantity
        persistToStorage()
      }
    }
  }

  function clearCart() {
    items.value = []
    persistToStorage()
  }

  const itemCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0),
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
  )

  function open() { isOpen.value = true }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  return {
    items,
    isOpen,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    open,
    close,
    toggle,
  }
}
