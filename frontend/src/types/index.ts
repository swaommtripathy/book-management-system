export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  published_date: string;
  description?: string;
  cover_image?: string;
  stock: number;
  created_by: string;
  created_at: string;
}

export interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  published_date: string;
  description?: string;
  cover_image?: string;
  stock: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface ApiError {
  detail: string;
}
