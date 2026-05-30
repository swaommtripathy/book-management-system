import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookShelf — Book Management System',
  description: 'Manage your book inventory with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' },
              success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
              error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
