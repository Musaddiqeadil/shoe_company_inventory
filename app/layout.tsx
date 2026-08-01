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
      {/* On a narrow phone the wordmark shrinks, its letter-spacing tightens
          and "Manage stock" becomes "Stock", so the bar always fits one row. */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex min-w-0 items-baseline gap-1 sm:gap-2 whitespace-nowrap"
        >
          <span className="wordmark text-sm tracking-[0.08em] text-cream sm:text-xl sm:tracking-[0.18em]">
            THE SHOE
          </span>
          <span className="wordmark text-sm tracking-[0.08em] text-gold sm:text-xl sm:tracking-[0.18em]">
            COMPANY
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            href="/sales"
            className="text-xs sm:text-sm text-cream/80 hover:text-gold transition-colors"
          >
            Sold
          </Link>
          <Link
            href="/admin"
            className="text-xs sm:text-sm text-cream/80 hover:text-gold transition-colors"
          >
            <span className="sm:hidden">Stock</span>
            <span className="hidden sm:inline">Manage stock</span>
          </Link>
        </nav>
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
