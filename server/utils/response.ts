export function apiSuccess<T>(data: T, meta?: Record<string, any>) {
  return { success: true as const, data, ...meta }
}

export function apiError(message: string, statusCode: number = 400): never {
  throw createError({ statusCode, statusMessage: message })
}
