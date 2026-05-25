import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Rehydrate from "@/components/ui/Rehydrate";

export const metadata: Metadata = {
  title: "Social Score",
  description: "Rate and be rated by the community",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Rehydrate />
        {children}
        <Toaster position="top-right" toastOptions={{ className: "text-sm" }} />
      </body>
    </html>
  );
}
