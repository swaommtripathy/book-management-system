'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { booksService } from '@/lib/books';
import { BookFormData, Book } from '@/types';
import BookForm from '@/components/ui/BookForm';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditBookPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    booksService.getBook(id as string)
      .then(setBook)
      .catch(() => { toast.error('Book not found'); router.push('/books'); })
      .finally(() => setIsFetching(false));
  }, [id, router]);

  const handleSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    try {
      await booksService.updateBook(id as string, data);
      toast.success('Book updated!');
      router.push(`/books/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update book');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const defaultValues: Partial<BookFormData> = {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    price: book.price,
    published_date: book.published_date,
    description: book.description || '',
    cover_image: book.cover_image || '',
    stock: book.stock,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <FiArrowLeft /> Back
      </button>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Book</h2>
        <BookForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Save Changes"
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
