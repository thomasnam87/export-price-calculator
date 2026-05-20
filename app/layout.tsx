import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Export Price Calculator',
  description: 'Calculate EXW, FOB, CFR, and CIF export prices for B2B trade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
