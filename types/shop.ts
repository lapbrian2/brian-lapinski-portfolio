export interface PrintProduct {
  id: number
  artworkId: string
  active: boolean
  artworkTitle?: string
  artworkSrc?: string
  variants?: PrintVariant[]
  createdAt?: string
  updatedAt?: string
}

export interface PrintVariant {
  id: number
  productId: number
  sizeName: string
  sizeWidth: number
  sizeHeight: number
  material: string
  price: number // cents
  printfulVariantId?: string | null
  active: boolean
  createdAt?: string
}

export type MaterialType = 'fine-art-paper' | 'canvas' | 'metal'

export interface CartItem {
  variantId: number
  productId: number
  artworkId: string
  artworkTitle: string
  artworkSrc: string
  sizeName: string
  material: string
  price: number // cents
  quantity: number
}

export interface Order {
  id: number
  email: string
  stripeSessionId?: string | null
  stripePaymentIntentId?: string | null
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  total: number // cents
  shippingName?: string | null
  shippingAddress?: string | null
  items?: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: number
  orderId: number
  variantId: number
  quantity: number
  unitPrice: number // cents
}

export const MATERIALS: Record<MaterialType, { label: string; description: string }> = {
  'fine-art-paper': {
    label: 'Fine Art Paper',
    description: 'Museum-quality Hahnemuhle paper with archival inks',
  },
  canvas: {
    label: 'Gallery Canvas',
    description: 'Stretched canvas with gallery-wrapped edges',
  },
  metal: {
    label: 'Metal Print',
    description: 'Vivid colors on brushed aluminum for a modern look',
  },
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
