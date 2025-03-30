"use client";

import React from "react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import Link from "next/link";
import { FileUp, LineChart, Home, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="block md:hidden p-2 -mr-2" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <LineChart className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Data Visualizer</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/upload" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-30 bg-background transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 pt-20 space-y-6">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 py-2 text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link 
              href="/upload" 
              className="flex items-center gap-2 py-2 text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileUp className="h-5 w-5" />
              Upload
            </Link>
          </nav>
        </div>
      </div>

      <main className="flex-1 container py-8">
        {children}
      </main>

      <footer className="border-t py-6 bg-muted/40">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Data Visualizer. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 