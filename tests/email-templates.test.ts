import { describe, it, expect } from 'vitest'
import { promptPurchaseEmail } from '../server/utils/prompt-email-templates'
import { orderConfirmationEmail, adminOrderNotificationEmail } from '../server/utils/email-templates'

describe('promptPurchaseEmail', () => {
  it('returns subject with artwork title', () => {
    const result = promptPurchaseEmail({ title: 'Red Shift', price: 399, galleryUrl: 'https://lapinski.art/gallery' })
    expect(result.subject).toBe('Prompt Unlocked: Red Shift')
  })

  it('returns HTML body containing the artwork title', () => {
    const result = promptPurchaseEmail({ title: 'The Deep', price: 599, galleryUrl: 'https://lapinski.art/gallery' })
    expect(result.html).toContain('The Deep')
  })

  it('formats price in cents as dollars in the body', () => {
    const result = promptPurchaseEmail({ title: 'Test', price: 1299, galleryUrl: 'https://lapinski.art/gallery' })
    expect(result.html).toContain('$12.99')
  })

  it('includes the gallery URL in the CTA link', () => {
    const url = 'https://lapinski.art/gallery?prompt_unlocked=abc123'
    const result = promptPurchaseEmail({ title: 'Test', price: 399, galleryUrl: url })
    expect(result.html).toContain(url)
  })

  it('escapes HTML in the title to prevent XSS', () => {
    const result = promptPurchaseEmail({ title: '<script>alert("xss")</script>', price: 399, galleryUrl: 'https://lapinski.art' })
    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('includes all four feature descriptions', () => {
    const result = promptPurchaseEmail({ title: 'Test', price: 399, galleryUrl: 'https://lapinski.art' })
    expect(result.html).toContain('Full raw prompt text')
    expect(result.html).toContain('Technique descriptions')
    expect(result.html).toContain('Refinement notes')
    expect(result.html).toContain('Playground access')
  })
})

describe('orderConfirmationEmail', () => {
  const sampleData = {
    orderId: 42,
    email: 'buyer@example.com',
    total: 7500,
    items: [
      { artworkTitle: 'Silk Valley', sizeName: '24×36', material: 'Fine Art Paper', quantity: 1, unitPrice: 7500 },
    ],
  }

  it('returns subject with order number', () => {
    const result = orderConfirmationEmail(sampleData)
    expect(result.subject).toBe('Order Confirmed — #42')
  })

  it('includes order total formatted as dollars', () => {
    const result = orderConfirmationEmail(sampleData)
    expect(result.html).toContain('$75.00')
  })

  it('includes item details', () => {
    const result = orderConfirmationEmail(sampleData)
    expect(result.html).toContain('Silk Valley')
    expect(result.html).toContain('24×36')
    expect(result.html).toContain('Fine Art Paper')
  })

  it('escapes HTML in artwork title', () => {
    const data = { ...sampleData, items: [{ ...sampleData.items[0], artworkTitle: 'Art & <Soul>' }] }
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('Art &amp; &lt;Soul&gt;')
  })

  it('handles multiple items', () => {
    const data = {
      ...sampleData,
      items: [
        { artworkTitle: 'Work A', sizeName: '12×16', material: 'Canvas', quantity: 2, unitPrice: 5000 },
        { artworkTitle: 'Work B', sizeName: '24×36', material: 'Paper', quantity: 1, unitPrice: 7500 },
      ],
    }
    const result = orderConfirmationEmail(data)
    expect(result.html).toContain('Work A')
    expect(result.html).toContain('Work B')
    expect(result.html).toContain('$100.00') // 5000 * 2
  })
})

describe('adminOrderNotificationEmail', () => {
  const sampleData = {
    orderId: 99,
    email: 'admin-test@example.com',
    total: 15000,
    items: [
      { artworkTitle: 'The Threshold', sizeName: '30×40', material: 'Canvas', quantity: 1, unitPrice: 15000 },
    ],
  }

  it('returns subject with order number and total', () => {
    const result = adminOrderNotificationEmail(sampleData)
    expect(result.subject).toBe('New Order #99 — $150.00')
  })

  it('includes customer email', () => {
    const result = adminOrderNotificationEmail(sampleData)
    expect(result.html).toContain('admin-test@example.com')
  })

  it('escapes customer email to prevent injection', () => {
    const data = { ...sampleData, email: 'test@example.com"><script>' }
    const result = adminOrderNotificationEmail(data)
    expect(result.html).not.toContain('"><script>')
    expect(result.html).toContain('&lt;script&gt;')
  })
})
