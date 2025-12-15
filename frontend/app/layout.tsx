import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'RiftCounter - Wild Rift Counter Pick Assistant',
  description: 'Get counter picks, lane tactics, and build recommendations for Wild Rift',
  keywords: ['Wild Rift', 'counter pick', 'builds', 'tactics', 'LoL'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-primary-200 dark:border-primary-800 no-print">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold tracking-tight">
                    RiftCounter
                  </h1>
                  <span className="text-xs text-primary-500 font-mono">
                    v1.0
                  </span>
                </div>
                <nav className="flex items-center gap-4">
                  <a
                    href="/"
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100"
                  >
                    Analyze
                  </a>
                  <a
                    href="/champions"
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100"
                  >
                    Champions
                  </a>
                  <a
                    href="/settings"
                    className="text-sm text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100"
                  >
                    Settings
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-primary-200 dark:border-primary-800 py-4 no-print">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between text-xs text-primary-500">
                <span>
                  Data aggregated from community sources. Not affiliated with Riot Games.
                </span>
                <span>
                  © {new Date().getFullYear()} RiftCounter
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
