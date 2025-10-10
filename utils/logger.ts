/**
 * Universal Logger for MercaFlow
 * 
 * Features:
 * - Colored output in development
 * - Structured JSON in production
 * - Context support for better debugging
 * - Sentry integration for error tracking
 * - Type-safe logging levels
 * 
 * Usage:
 *   import { logger } from '@/utils/logger'
 *   
 *   logger.info('User logged in', { userId: '123' })
 *   logger.warn('Rate limit approaching', { remaining: 10 })
 *   logger.error('Payment failed', { error, orderId: '456' })
 *   logger.debug('ML API response', { data })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  stack?: string
}

class Logger {
  private isDev: boolean
  private isProduction: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Debug level - verbose information for development only
   * Not logged in production
   */
  debug(message: string, context?: LogContext): void {
    if (this.isProduction) return // Skip debug logs in production
    this.log('debug', message, context)
  }

  /**
   * Info level - general informational messages
   * Example: "User logged in", "Email sent", "Sync completed"
   */
  info(message: string, ...args: unknown[]): void {
    // If args are provided, treat them as context
    const context = args.length > 0 ? { args } : undefined
    this.log('info', message, context)
  }

  /**
   * Warning level - potentially problematic situations
   * Example: "Rate limit approaching", "Token expiring soon"
   */
  warn(message: string, ...args: unknown[]): void {
    const context = args.length > 0 ? { args } : undefined
    this.log('warn', message, context)
  }

  /**
   * Error level - error events that might still allow the app to continue
   * Automatically sends to Sentry in production
   */
  error(message: string, ...args: unknown[]): void {
    // First arg might be Error object, rest are context
    const errorObj = args[0] instanceof Error ? args[0] : undefined
    const contextArgs = errorObj ? args.slice(1) : args
    const context = contextArgs.length > 0 ? { args: contextArgs } : undefined

    this.log('error', message, context, errorObj)

    // Send to Sentry in production
    if (this.isProduction && typeof window !== 'undefined') {
      // Client-side error tracking
      const globalWindow = window as Window & { Sentry?: { captureException: (error: Error, options?: unknown) => void } }
      if (globalWindow.Sentry?.captureException) {
        globalWindow.Sentry.captureException(errorObj || new Error(message), {
          contexts: { custom: context }
        })
      }
    } else if (this.isProduction && typeof window === 'undefined') {
      // Server-side error tracking
      // Note: Sentry will be configured in sentry.server.config.ts when installed
      // For now, we skip Sentry integration to avoid build errors
      // TODO: Add Sentry when needed
      /*
      try {
        // Dynamic import to avoid bundling in development
        import('@sentry/nextjs').then((Sentry) => {
          if (Sentry && Sentry.captureException) {
            Sentry.captureException(errorObj || new Error(message), {
              contexts: { custom: context }
            })
          }
        }).catch(() => {
          // Sentry not installed yet
        })
      } catch {
        // Sentry not configured
      }
      */
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      stack: error?.stack
    }

    if (this.isDev) {
      // Development: Colored console output
      this.logDev(entry)
    } else {
      // Production: Structured JSON
      this.logProduction(entry)
    }
  }

  /**
   * Development logging with colors and formatting
   */
  private logDev(entry: LogEntry): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m'
    }

    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }

    const color = colors[entry.level]
    const symbol = emoji[entry.level]
    const timestamp = new Date(entry.timestamp).toLocaleTimeString('pt-BR')

    // Main log line
    console.log(
      `${color}${symbol} [${entry.level.toUpperCase()}]${colors.reset} ${timestamp} - ${entry.message}`
    )

    // Context (if provided)
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('  📋 Context:', entry.context)
    }

    // Error details (if provided)
    if (entry.error) {
      console.error('  💥 Error:', entry.error)
      if (entry.stack) {
        console.error('  📚 Stack:', entry.stack)
      }
    }
  }

  /**
   * Production logging with JSON format
   */
  private logProduction(entry: LogEntry): void {
    const logData: Record<string, unknown> = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message
    }

    if (entry.context) {
      logData.context = entry.context
    }

    if (entry.error) {
      logData.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.stack
      }
    }

    // Output as JSON for log aggregation tools (Vercel, Datadog, etc)
    console.log(JSON.stringify(logData))
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export type { LogLevel, LogContext }
