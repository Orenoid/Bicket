import { ClerkProvider } from "@clerk/nextjs";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientSidebar from "./components/ClientSidebar";
import "./globals.css";

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
            {/* <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header> */}
            <main className="transition-all duration-300 sidebar-margin">
              {children}
            </main>

          </body>
        </html>
      </ClerkProvider>
    </NuqsAdapter>
  );
}
