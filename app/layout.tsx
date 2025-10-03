import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MercaFlow - Integração Mercado Livre",
  description: "Plataforma world-class de integração com Mercado Livre para vendedores brasileiros",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
