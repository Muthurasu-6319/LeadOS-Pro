import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lead Finder — Business Intelligence & Lead Generation',
  description: 'Find qualified leads, analyse business pain points, and close deals faster with AI-powered insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
