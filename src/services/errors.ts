export type ServiceErrorCode =
  | "NOT_FOUND"
  | "NETWORK"
  | "INVALID_RESPONSE"
  | "VALIDATION"
  | "CONFIG"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "UNAVAILABLE";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ServiceError";
    this.code = code;
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}
