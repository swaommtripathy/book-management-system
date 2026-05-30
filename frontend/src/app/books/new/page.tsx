'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { booksService } from '@/lib/books';
import { BookFormData } from '@/types';
import BookForm from '@/components/ui/BookForm';
import { FiArrowLeft } from 'react-icons/fi';

export default function NewBookPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    try {
      await booksService.createBook(data);
      toast.success('Book added successfully!');
      router.push('/books');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <FiArrowLeft /> Back
      </button>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New Book</h2>
        <BookForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Add Book"
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
