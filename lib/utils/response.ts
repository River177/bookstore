// lib/utils/response.ts - API Response utilities

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function error(message: string, error?: string): ApiResponse<never> {
  return {
    success: false,
    message,
    error,
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
