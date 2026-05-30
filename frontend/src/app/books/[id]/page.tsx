'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { booksService } from '@/lib/books';
import { Book } from '@/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiArrowLeft, FiEdit2, FiTrash2, FiBook, FiCalendar, FiTag, FiHash, FiDollarSign, FiPackage } from 'react-icons/fi';

export default function BookDetailPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    booksService.getBook(id as string)
      .then(setBook)
      .catch(() => toast.error('Book not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!book || !confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await booksService.deleteBook(book.id);
      toast.success('Book deleted');
      router.push('/books');
    } catch {
      toast.error('Failed to delete book');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="card space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-48 bg-gray-100 rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!book) return (
    <div className="text-center py-16">
      <FiBook className="text-5xl text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500">Book not found.</p>
      <Link href="/books" className="btn-primary inline-block mt-4">Back to Books</Link>
    </div>
  );

  const details = [
    { icon: FiHash, label: 'ISBN', value: book.isbn },
    { icon: FiTag, label: 'Category', value: book.category },
    { icon: FiDollarSign, label: 'Price', value: `₹${book.price.toFixed(2)}` },
    { icon: FiPackage, label: 'Stock', value: `${book.stock} units` },
    { icon: FiCalendar, label: 'Published', value: book.published_date ? format(new Date(book.published_date), 'MMMM d, yyyy') : 'N/A' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <FiArrowLeft /> Back
      </button>

      <div className="card">
        <div className="flex items-start gap-5">
          {/* Cover */}
          <div className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden shadow-md bg-indigo-100 flex items-center justify-center">
            {book.cover_image ? (
              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ''; }} />
            ) : (
              <FiBook className="text-indigo-300 text-3xl" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-gray-600 mt-1">by <span className="font-medium">{book.author}</span></p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/books/${book.id}/edit`} className="btn-secondary flex items-center gap-1.5 text-sm">
                  <FiEdit2 /> Edit
                </Link>
                <button onClick={handleDelete} disabled={isDeleting} className="btn-danger flex items-center gap-1.5 text-sm">
                  <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                    <Icon className="text-xs" /> {label}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {book.description && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Added on {format(new Date(book.created_at), 'MMMM d, yyyy')}</p>
        </div>
      </div>
    </div>
  );
}
