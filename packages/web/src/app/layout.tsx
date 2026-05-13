import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Yaproom — Loud room games, rebuilt',
  description: 'Neobrutalist multiplayer party games with room control, live play, and bold shared visuals.'
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
          '--font-bebas-neue': '"Arial Black", "Impact", "Trebuchet MS", system-ui, sans-serif',
          '--font-dm-sans': '"Space Grotesk", "Trebuchet MS", system-ui, sans-serif',
          '--font-jetbrains-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="neub-root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
