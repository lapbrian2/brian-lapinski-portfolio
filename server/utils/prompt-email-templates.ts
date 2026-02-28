/**
 * Email template for prompt purchase confirmation.
 * Follows the same HTML email pattern as email-templates.ts.
 */

interface PromptPurchaseEmailData {
  title: string
  price: number
  galleryUrl: string
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
 * Prompt purchase confirmation email sent to buyer after successful payment.
 */
export function promptPurchaseEmail(data: PromptPurchaseEmailData) {
  return {
    subject: `Prompt Unlocked: ${data.title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #e8e3f3; letter-spacing: -0.02em;">Brian Lapinski</span>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #141418; border: 1px solid #2a2a2a; border-radius: 8px; padding: 40px 32px;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: rgba(237, 84, 77, 0.1); border: 1px solid rgba(237, 84, 77, 0.2); color: #ed544d; font-size: 20px;">&#128275;</span>
              </div>

              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #e8e3f3; text-align: center;">
                Prompt Unlocked
              </h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #9b95a8; text-align: center; line-height: 1.5;">
                You now have full access to the prompt architecture for this artwork.
              </p>

              <!-- Artwork Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; background-color: #0f0f14; border-radius: 6px; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b6577;">Artwork</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #e8e3f3;">${escapeHtml(data.title)}</p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b6577;">Price</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #4ade80;">${formatCents(data.price)}</p>
                  </td>
                </tr>
              </table>

              <!-- What's Included -->
              <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #c8c3d6; text-transform: uppercase; letter-spacing: 0.1em;">What you get</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #9b95a8;">&#10003;&nbsp;&nbsp;Full raw prompt text</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #9b95a8;">&#10003;&nbsp;&nbsp;Technique descriptions &amp; categories</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #9b95a8;">&#10003;&nbsp;&nbsp;Refinement notes &amp; artist process</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #9b95a8;">&#10003;&nbsp;&nbsp;Playground access to remix &amp; fork</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${escapeHtml(data.galleryUrl)}" style="display: inline-block; padding: 14px 32px; background-color: #ed544d; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px; letter-spacing: 0.02em;">
                  View Your Prompt
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b6577; line-height: 1.6;">
                Thank you for supporting the art.<br>
                &copy; ${new Date().getFullYear()} Brian Lapinski
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
