import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Yapzi — Join the chaos',
  description: 'Room-based multiplayer party games with instant friend group chaos.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={
        {
          '--font-bebas-neue': '"Bebas Neue", Impact, "Arial Narrow", sans-serif',
          '--font-dm-sans':
            '"DM Sans", Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          '--font-jetbrains-mono':
            '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">
            <Providers>
              <div className="neub-root">
                {children}
              </div>
            </Providers>
      </body>
    </html>
  );
}
