import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
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
      <body className="min-h-screen bg-white text-stone-800 antialiased m-0 p-0">
        <AuthProvider>
          <div className="relative min-h-screen">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom right, rgba(255,237,213,0.5) 0%, rgba(255,255,255,1) 40%, rgba(255,251,235,0.4) 100%)",
              }}
            />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
              <Navbar />
              <main className="mt-8 min-w-0">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
