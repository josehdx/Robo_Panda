import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { QrCode } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Robo_Panda",
  description: "AI-powered QR code generator and scanner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Global Update Notification */}

          {/* Global Navigation */}
          <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <QrCode className="w-5 h-5 text-white"/>
                </div>
                <span>Robo_Panda</span>
              </div>
              <nav className="flex items-center gap-4">
                <ThemeToggle/>
              </nav>
            </div>
          </header>

          {/* Main Application Content */}
          <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Canvas Agent. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}