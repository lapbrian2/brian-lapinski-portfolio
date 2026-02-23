import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const formData = await readMultipartFormData(event)
  if (!formData || !formData.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData[0]
  if (!file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'Only image files allowed' })
  }

  // Max 10MB
  if (file.data.length > 10 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'File too large (max 10MB)' })
  }

  const ext = file.filename?.split('.').pop() || 'webp'
  const slug = file.filename
    ?.replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase() || 'artwork'
  const filename = `artworks/${slug}-${Date.now()}.${ext}`

  const blob = await put(filename, file.data, {
    access: 'public',
    token: config.blobToken as string,
    contentType: file.type,
  })

  return { success: true, data: { url: blob.url, pathname: blob.pathname } }
})
