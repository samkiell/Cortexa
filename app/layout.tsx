import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { DM_Sans, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { ModelProvider } from '@/contexts/ModelContext';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '500'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!baseUrl && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_APP_URL is not set in production');
}

export const metadata: Metadata = {
  title: 'Cortexa — AI Without Limits',
  description: 'Access powerful uncensored AI models including vision, reasoning, and code. Built for developers and researchers.',
  metadataBase: (baseUrl && baseUrl.startsWith('http')) ? new URL(baseUrl) : null,
  openGraph: {
    title: 'Cortexa — AI Without Limits',
    description: 'Access powerful uncensored AI models.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-base text-text-custom font-dm-sans">
        <SessionProviderWrapper>
          <ModelProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ModelProvider>
        </SessionProviderWrapper>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
