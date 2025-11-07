// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export const metadata = {
  title: "Elite Performance App",
  description: "Train. Track. Progress.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        {children}
        {/* Notifications */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}