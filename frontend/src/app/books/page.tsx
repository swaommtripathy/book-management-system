'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { booksService } from '@/lib/books';
import { Book } from '@/types';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter, FiPlusCircle, FiEdit2, FiTrash2, FiEye, FiBook, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await booksService.getBooks({ page, limit: 10, search: search || undefined, category: category || undefined, sort_by: sortBy, sort_order: sortOrder });
      setBooks(res.books);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, sortBy, sortOrder]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => {
    booksService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await booksService.deleteBook(id);
      toast.success('Book deleted');
      fetchBooks();
    } catch {
      toast.error('Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Books</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} book{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/books/new" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Add Book
        </Link>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title..."
                className="input-field pl-9 text-sm py-2"
              />
            </div>
          </form>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field pl-9 text-sm py-2 pr-8 appearance-none min-w-[150px]">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <select value={`${sortBy}:${sortOrder}`} onChange={e => { const [sb, so] = e.target.value.split(':'); setSortBy(sb); setSortOrder(so); setPage(1); }} className="input-field text-sm py-2 min-w-[160px]">
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="published_date:desc">Recently Published</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <FiBook className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No books found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new book</p>
            <Link href="/books/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <FiPlusCircle /> Add Book
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Title', 'Author', 'ISBN', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt="" className="w-8 h-10 object-cover rounded shadow-sm" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="w-8 h-10 bg-indigo-100 rounded flex items-center justify-center">
                              <FiBook className="text-indigo-400 text-xs" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 max-w-[160px] truncate">{book.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{book.author}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{book.isbn}</td>
                      <td className="px-4 py-3"><span className="badge bg-indigo-50 text-indigo-700">{book.category}</span></td>
                      <td className="px-4 py-3 font-medium text-gray-900">₹{book.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${book.stock < 5 ? 'bg-red-50 text-red-700' : book.stock < 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                          {book.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => router.push(`/books/${book.id}`)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View">
                            <FiEye />
                          </button>
                          <button onClick={() => router.push(`/books/${book.id}/edit`)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                            disabled={deletingId === book.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <FiChevronLeft />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return p <= totalPages ? (
                      <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-sm rounded transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
                    ) : null;
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
