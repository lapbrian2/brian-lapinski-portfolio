/**
 * Structured server logger.
 * Prefixes messages with ISO timestamp and tag for consistent log output.
 */
function formatMessage(level: string, tag: string, message: string): string {
  return `${new Date().toISOString()} [${level}] [${tag}] ${message}`
}

export function createLogger(tag: string) {
  return {
    info(message: string, ...args: unknown[]) {
      console.log(formatMessage('INFO', tag, message), ...args)
    },
    warn(message: string, ...args: unknown[]) {
      console.warn(formatMessage('WARN', tag, message), ...args)
    },
    error(message: string, ...args: unknown[]) {
      console.error(formatMessage('ERROR', tag, message), ...args)
    },
  }
}
