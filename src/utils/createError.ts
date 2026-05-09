export interface AppError extends Error {
  status: number;
}

export function createError(message: string, status: number): AppError {
  const error = new Error(message) as AppError;
  error.status = status;
  return error;
}
