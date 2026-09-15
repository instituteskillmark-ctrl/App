import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Automation Developer OS',
  description: 'Private learning & productivity training system for AI Automation Developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
