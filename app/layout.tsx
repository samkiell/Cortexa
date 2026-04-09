import type { Metadata } from "next";
import { Syne, DM_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { ModelProvider } from "@/contexts/ModelContext";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cortexa — AI Chat Platform",
  description: "Next-generation AI chat platform powered by Featherless AI.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    images: [{ url: "/og-image.png" }],
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
      className={`${syne.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-base text-text-custom font-dm-sans">
        <ModelProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ModelProvider>
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
