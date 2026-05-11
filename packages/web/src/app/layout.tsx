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
          '--font-inter': 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          '--font-sora': 'Sora, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
