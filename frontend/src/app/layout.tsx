import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AddExpenseFab from "@/components/AddExpenseFab";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Splitwise Clone | Split expenses with friends",
  description: "Track and split group expenses easily. Modern expense sharing app.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background text-foreground antialiased m-0 p-0 transition-smooth">
        <AuthProvider>
          <div className="relative min-h-screen">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom right, rgba(250,239,221,0.6) 0%, rgba(251,251,254,1) 45%, rgba(247,133,45,0.06) 100%)",
              }}
            />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
              <Navbar />
              <main className="mt-8 min-w-0">{children}</main>
              <AddExpenseFab />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
