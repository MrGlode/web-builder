export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}