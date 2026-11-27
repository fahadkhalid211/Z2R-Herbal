type LogContext = Record<string, unknown>;

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

function describe(context?: LogContext): LogContext | "" {
  if (!context) return "";
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      value instanceof Error ? { name: value.name, message: value.message, cause: value.cause } : value,
    ]),
  );
}

export const logger = {
  error(message: string, context?: LogContext): void {
    if (isServer || !isProd) console.error(`[z2r] ${message}`, describe(context));
  },
  warn(message: string, context?: LogContext): void {
    if (isServer || !isProd) console.warn(`[z2r] ${message}`, describe(context));
  },
};
