import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hehe , Website",
  description: "Whiteye's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      {/* <link href="https://files.ax86.net/terminus-ttf/files/4.30/TerminusMedium.ttf" rel="stylesheet"></link> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white font-mono flex flex-col relative`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}
