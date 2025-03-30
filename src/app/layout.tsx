import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Data.gov.sg Explorer',
  description: 'Search, visualize, and explore datasets from data.gov.sg',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
} 