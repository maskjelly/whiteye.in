import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import React from "react";
import { FollowerPointerCard } from "@/components/background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Webssite",
  description: "Personal Webssite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
      <FollowerPointerCard>
         {children}
      </FollowerPointerCard>
      </body>
    </html>
  );
}
