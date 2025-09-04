import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OFT Payments',
  description: 'Cross-chain USDT payments using LayerZero OFT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Filter out Chrome extension errors that aren't related to our app
              const originalError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('chrome.runtime.sendMessage') || 
                    message.includes('Extension ID')) {
                  return; // Suppress these specific errors
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
