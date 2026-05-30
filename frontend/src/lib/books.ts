import api from './api';
import { BookFormData, BooksResponse, Book } from '@/types';

interface GetBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: string;
  sort_order?: string;
}

export const booksService = {
  async getBooks(params: GetBooksParams = {}): Promise<BooksResponse> {
    const res = await api.get('/api/books', { params });
    return res.data;
  },

  async getBook(id: string): Promise<Book> {
    const res = await api.get(`/api/books/${id}`);
    return res.data;
  },

  async createBook(data: BookFormData): Promise<Book> {
    const res = await api.post('/api/books', data);
    return res.data;
  },

  async updateBook(id: string, data: Partial<BookFormData>): Promise<Book> {
    const res = await api.put(`/api/books/${id}`, data);
    return res.data;
  },

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/api/books/${id}`);
  },

  async getCategories(): Promise<string[]> {
    const res = await api.get('/api/books/categories');
    return res.data.categories;
  },

  async exportCSV(params: { search?: string; category?: string } = {}): Promise<void> {
    const res = await api.get('/api/books/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'books.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
