import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Shoe Company — Inventory",
  description: "Good Shoes Take You To Great Places",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="bg-ink text-cream border-b-4 border-gold">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="wordmark text-base sm:text-xl text-cream">
            THE SHOE
          </span>
          <span className="wordmark text-base sm:text-xl text-gold">
            COMPANY
          </span>
        </Link>
        <Link
          href="/admin"
          className="text-sm text-cream/80 hover:text-gold transition-colors"
        >
          Manage stock
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-ink text-cream/70 border-t-4 border-gold mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm space-y-1">
        <p className="wordmark text-gold tracking-widest">
          Good Shoes Take You To Great Places
        </p>
        <p>Jagriti Colony, Azadpur, Kalaburagi, Karnataka 585105</p>
        <p>
          +91 95132 60298 &nbsp;·&nbsp; Instagram: theshoecompany_01
        </p>
      </div>
    </footer>
  );
}
