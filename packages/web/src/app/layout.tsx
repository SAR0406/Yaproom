import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/Providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display'
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'Yaproom — Loud room games, rebuilt',
  description: 'Neobrutalist multiplayer party games with room control, live play, and bold shared visuals.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
      style={
        {
          '--font-bebas-neue': '"Arial Black", "Impact", "Trebuchet MS", system-ui, sans-serif',
          '--font-dm-sans': '"Space Grotesk", "Trebuchet MS", system-ui, sans-serif',
          '--font-jetbrains-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        } as CSSProperties
      }
    >
      <body className="min-h-full flex flex-col font-display">
        <Providers>
          <div className="neub-root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
