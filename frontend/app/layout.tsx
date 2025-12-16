import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RiftCounter | Tactical Companion',
  description: 'Your intelligent Wild Rift counter-pick and strategy companion',
  keywords: ['Wild Rift', 'counter pick', 'LoL', 'strategy', 'builds'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
