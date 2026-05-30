'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { booksService } from '@/lib/books';
import { useAuth } from '@/hooks/useAuth';
import { Book } from '@/types';
import { FiBook, FiDollarSign, FiPackage, FiPlusCircle, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState({ total: 0, totalValue: 0, lowStock: 0, categories: 0 });
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const [res, allRes] = await Promise.all([
        booksService.getBooks({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
        booksService.getBooks({ limit: 100 }),
      ]);
      setBooks(res.books);
      const all = allRes.books;
      const categories = new Set(all.map(b => b.category)).size;
      const totalValue = all.reduce((sum, b) => sum + b.price * b.stock, 0);
      const lowStock = all.filter(b => b.stock < 5).length;
      setStats({ total: allRes.total, totalValue, lowStock, categories });
    } catch {
      // silently fail — empty state is shown
    } finally {
      setIsLoading(false);
    }
  };
    loadData();
  }, []);

  const statCards = [
    { label: 'Total Books', value: stats.total, icon: FiBook, color: 'bg-blue-50 text-blue-600' },
    { label: 'Categories', value: stats.categories, icon: FiPackage, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Value', value: `₹${stats.totalValue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Low Stock', value: stats.lowStock, icon: FiAlertCircle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good day, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">Here&apos;s your book inventory overview.</p>
        </div>
        <Link href="/books/new" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Add Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoading ? <span className="w-16 h-7 bg-gray-200 rounded animate-pulse inline-block" /> : value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Books */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Books</h3>
          <Link href="/books" className="text-sm text-indigo-600 hover:text-indigo-700">View all →</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-10">
            <FiBook className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No books yet. <Link href="/books/new" className="text-indigo-600">Add your first book</Link></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Title</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Author</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Price</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/books/${book.id}`} className="font-medium text-gray-900 hover:text-indigo-600">{book.title}</Link>
                    </td>
                    <td className="py-3 text-gray-600">{book.author}</td>
                    <td className="py-3">
                      <span className="badge bg-indigo-50 text-indigo-700">{book.category}</span>
                    </td>
                    <td className="py-3 text-gray-900">₹{book.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`badge ${book.stock < 5 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {book.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
