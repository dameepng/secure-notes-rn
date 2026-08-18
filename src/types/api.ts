export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}
