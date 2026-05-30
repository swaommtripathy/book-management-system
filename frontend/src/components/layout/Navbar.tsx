'use client';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/books': 'Books',
  '/books/new': 'Add New Book',
};

export default function Navbar() {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([k]) => pathname === k || (k !== '/dashboard' && pathname.startsWith(k)))?.[1] || 'BookShelf';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </header>
  );
}
