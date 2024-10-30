export interface Constituent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchUploadResult {
  successful: number;
  failed: number;
  errors: { row: number; error: string; data: any }[];
}

export interface ConstituentListProps {
  constituents: PaginatedResult<Constituent>;
  onPageChange?: (page: number) => void;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


export type CreateConstituentInput = Omit<Constituent, 'id' | 'createdAt' | 'updatedAt'>;