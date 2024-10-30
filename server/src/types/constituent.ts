export interface Constituent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchUploadResult {
  successful: number;
  failed: number;
  totalProcessed: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
}