export type ClientErrorCode =
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'TASK_NOT_FOUND'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export type ClientError = {
  code: ClientErrorCode;
  message: string;
};

export function mapApiError(body: { error: ClientError }): ClientError {
  return {
    code: body.error.code,
    message: body.error.message,
  };
}
