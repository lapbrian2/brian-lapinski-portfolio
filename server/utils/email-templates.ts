/**
 * Email templates for order notifications.
 * Follows the same HTML email pattern as contact.post.ts.
 */

interface OrderEmailItem {
  artworkTitle: string
  sizeName: string
  material: string
  quantity: number
  unitPrice: number
}

interface OrderEmailData {
  orderId: number
  email: string
  total: number
  items: OrderEmailItem[]
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Order confirmation email sent to buyer after successful payment.
 */
export function orderConfirmationEmail(data: OrderEmailData) {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">
          <strong style="color: #e8e3f3;">${escapeHtml(item.artworkTitle)}</strong><br>
          <span style="color: #9b95a8; font-size: 13px;">${escapeHtml(item.sizeName)} &middot; ${escapeHtml(item.material)}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: center; color: #c8c3d6;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #e8e3f3; font-weight: 600;">${formatCents(item.unitPrice * item.quantity)}</td>
      </tr>`,
    )
    .join('')

  return {
    subject: `Order Confirmed — #${data.orderId}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <span style="font-size: 20px; font-weight: 700; color: #e8e3f3; letter-spacing: 0.05em;">BRIAN LAPINSKI</span>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="background-color: #111118; border: 1px solid #1e1e2a; border-radius: 8px; padding: 40px 32px;">
              <h1 style="margin: 0 0 8px; font-size: 28px; color: #e8e3f3; font-weight: 700;">Thank You</h1>
              <p style="margin: 0 0 24px; color: #9b95a8; font-size: 15px; line-height: 1.6;">
                Your order <strong style="color: #c8c3d6;">#${data.orderId}</strong> has been confirmed. We're preparing your print for shipment.
              </p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 1px solid #2a2a2a;">
                    <th style="padding: 8px 0; text-align: left; color: #6b6580; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Item</th>
                    <th style="padding: 8px 0; text-align: center; color: #6b6580; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Qty</th>
                    <th style="padding: 8px 0; text-align: right; color: #6b6580; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px 0 0; text-align: right;">
                    <span style="color: #6b6580; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Total</span>
                    <br>
                    <span style="color: #e8e3f3; font-size: 24px; font-weight: 700;">${formatCents(data.total)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0; text-align: center;">
              <p style="color: #4a4560; font-size: 12px; line-height: 1.6; margin: 0;">
                You'll receive a shipping confirmation with tracking details once your print ships.<br>
                Questions? Reply to this email or visit <a href="https://lapinski.art" style="color: #c43b3b; text-decoration: none;">lapinski.art</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

/**
 * Welcome email sent to new newsletter subscribers.
 */
export function welcomeEmail({ name, unsubscribeUrl }: { name?: string | null; unsubscribeUrl: string }): { subject: string; html: string } {
  const greeting = name ? `Welcome, ${escapeHtml(name)}!` : 'Welcome!'

  return {
    subject: 'Welcome to the Gallery',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <span style="font-size: 20px; font-weight: 700; color: #e8e3f3; letter-spacing: 0.05em;">BRIAN LAPINSKI</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #111118; border: 1px solid #1e1e2a; border-radius: 8px; padding: 40px 32px;">
              <h1 style="margin: 0 0 8px; font-size: 28px; color: #e8e3f3; font-weight: 700;">${greeting}</h1>
              <p style="margin: 0 0 24px; color: #9b95a8; font-size: 15px; line-height: 1.6;">
                Thanks for subscribing. You'll be the first to know about new artworks, behind-the-scenes process updates, and exclusive prompt drops.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #c43b3b; border-radius: 6px;">
                    <a href="https://lapinski.art/gallery" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">Browse the Gallery</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0; text-align: center;">
              <p style="color: #4a4560; font-size: 12px; line-height: 1.6; margin: 0;">
                You're receiving this because you subscribed at <a href="https://lapinski.art" style="color: #c43b3b; text-decoration: none;">lapinski.art</a>.<br>
                <a href="${escapeHtml(unsubscribeUrl)}" style="color: #4a4560; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  }
}

/**
 * New order notification sent to the admin.
 */
export function adminOrderNotificationEmail(data: OrderEmailData) {
  const itemList = data.items
    .map(
      (item) =>
        `<li style="margin-bottom: 8px; color: #333;">
          <strong>${escapeHtml(item.artworkTitle)}</strong> — ${escapeHtml(item.sizeName)}, ${escapeHtml(item.material)} × ${item.quantity} = ${formatCents(item.unitPrice * item.quantity)}
        </li>`,
    )
    .join('')

  return {
    subject: `New Order #${data.orderId} — ${formatCents(data.total)}`,
    html: `
<h2>New Print Shop Order</h2>
<p><strong>Order #:</strong> ${data.orderId}</p>
<p><strong>Customer:</strong> ${escapeHtml(data.email)}</p>
<p><strong>Total:</strong> ${formatCents(data.total)}</p>
<h3>Items</h3>
<ul>${itemList}</ul>
<hr>
<p style="color: #666; font-size: 12px;">View the full order in your <a href="https://lapinski.art/admin/orders">admin panel</a>.</p>`,
  }
}
