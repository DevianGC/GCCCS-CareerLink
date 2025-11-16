import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GCCCS CareerLink - Gordon College CCS Graduate Employment & Development Portal",
  description: "A career support and placement platform for students, graduates, and alumni of Gordon College CCS",
};

// Add preconnect for performance optimization
export const viewport = {
  themeColor: "#FF6600",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#FF6600" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <Suspense fallback={<div className="loading-container">Loading...</div>}>
          <main className="main-content">
            {children}
          </main>
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}
