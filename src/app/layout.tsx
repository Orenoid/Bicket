import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/shadcn/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NuqsAdapter>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="pt-0">{children}</SidebarInset>
              <Toaster />
            </SidebarProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  );
}
