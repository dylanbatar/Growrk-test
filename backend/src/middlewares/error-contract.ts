const errors = {
  INVALID_JSON: { status: 400, message: 'Request body must contain valid JSON.' },
  VALIDATION_ERROR: { status: 400, message: 'Request input is invalid.' },
  NOT_FOUND: { status: 404, message: 'Route not found.' },
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred.' },
} as const;

export type ErrorCode = keyof typeof errors;

export class ApiError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(errors[code].message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function errorResponse(error: unknown) {
  const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR';
  const { status, message } = errors[code];

  return { status, body: { error: { code, message } } };
}
