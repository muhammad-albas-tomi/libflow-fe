export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type LoanStatus = 'BORROWED' | 'RETURNED' | 'LATE';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/** Bentuk respons list backend LibFlow (ApiResponse.paginate) */
export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: Pagination;
  timestamp: string;
};

/** Bentuk respons item tunggal (ApiResponse.success) */
export type ItemResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  stock: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type LibraryUser = {
  id: string;
  nik: string | null;
  memberNumber: string | null;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Loan = {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  fineAmount: number;
  createdAt: string;
  updatedAt: string;
  book?: Book;
  user?: Pick<LibraryUser, 'id' | 'name' | 'memberNumber'>;
};
