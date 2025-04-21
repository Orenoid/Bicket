import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import ClientSidebar from "../components/ClientSidebar";
import "./globals.css";
import inittializeApp from "./init";

inittializeApp();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bicket",
  description: "Bicket is a platform for managing issues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <ClerkProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ClientSidebar />
            <main className="transition-all duration-300 sidebar-margin h-screen">
              {children}
            </main>
          </body>
        </html>
      </ClerkProvider>
    </NuqsAdapter>
  );
}
