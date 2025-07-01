import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.SITE_NAME || 'DocsDeploy',
  description: process.env.SITE_DESCRIPTION || 'Documentation generated from GitHub repository',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}