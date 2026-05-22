import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { validateEnv } from "@/lib/env";

validateEnv();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SecureGate",
  description: "Secure authentication system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
