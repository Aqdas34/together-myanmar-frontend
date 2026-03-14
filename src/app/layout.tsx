import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LanguageWrapper from "@/components/LanguageWrapper";
import Loader from "@/components/Loader";

const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-inter" 
});

export const metadata = {
  title: "Together Myanmar Platform",
  description:
    "Secure, multilingual, community-driven platform for Myanmar diaspora communities worldwide."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-primary-100 selection:text-primary-900 transition-colors duration-500">
        <Loader />
        <LanguageWrapper>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageWrapper>
      </body>
    </html>
  );
}
