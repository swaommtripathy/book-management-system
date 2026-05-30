'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookFormData, Book } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters').max(20),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  published_date: z.string().min(1, 'Published date is required'),
  description: z.string().optional(),
  cover_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Children', 'Mystery', 'Romance', 'Self-Help', 'Philosophy', 'Art', 'Other'];

interface Props {
  defaultValues?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export default function BookForm({ defaultValues, onSubmit, isLoading, submitLabel, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { stock: 0 },
  });

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Title *" error={errors.title?.message}>
          <input {...register('title')} className="input-field" placeholder="Enter book title" />
        </Field>

        <Field label="Author *" error={errors.author?.message}>
          <input {...register('author')} className="input-field" placeholder="Enter author name" />
        </Field>

        <Field label="ISBN *" error={errors.isbn?.message}>
          <input {...register('isbn')} className="input-field" placeholder="978-0-000000-00-0" />
        </Field>

        <Field label="Category *" error={errors.category?.message}>
          <select {...register('category')} className="input-field appearance-none">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Price (₹) *" error={errors.price?.message}>
          <input {...register('price')} type="number" step="0.01" className="input-field" placeholder="0.00" />
        </Field>

        <Field label="Stock Quantity *" error={errors.stock?.message}>
          <input {...register('stock')} type="number" className="input-field" placeholder="0" />
        </Field>

        <Field label="Published Date *" error={errors.published_date?.message}>
          <input {...register('published_date')} type="date" className="input-field" />
        </Field>

        <Field label="Cover Image URL" error={errors.cover_image?.message}>
          <input {...register('cover_image')} className="input-field" placeholder="https://example.com/cover.jpg" />
        </Field>
      </div>

      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Enter book description..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
