import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-public" });

export const metadata: Metadata = {
  title: "Validly: validate before you manufacture",
  description: "Test a physical product idea with real consumer feedback before you spend on production.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}