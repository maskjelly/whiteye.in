import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Maskjelly",
  description: "@personal portfolio - Some stuff",
  openGraph: {
    url: "https://whiteye.in/",
    type: "website",
    title: "Maskjelly",
    description: "@personal portfolio - Some stuff",
    images: [
      {
        url: "https://sdmntprwestus.oaiusercontent.com/files/00000000-a33c-6230-ab93-316ebf614dd4/raw?se=2025-04-26T20%3A55%3A05Z&sp=r&sv=2024-08-04&sr=b&scid=2ef2bc47-d834-5bad-a629-c381d99d0901&skoid=ae70be19-8043-4428-a990-27c58b478304&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-25T23%3A06%3A04Z&ske=2025-04-26T23%3A06%3A04Z&sks=b&skv=2024-08-04&sig=QYOL9J0s%2BEXGfYAoj/FISUdwE0lGoAADHQktS0EqIEo%3D",
        width: 1200,
        height: 630,
        alt: "Maskjelly Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://whiteye.in",
    creator: "@LiquidZooo",
    title: "Maskjelly",
    description: "@personal portfolio - Some stuff",
    images: [
      "https://sdmntprwestus.oaiusercontent.com/files/00000000-a33c-6230-ab93-316ebf614dd4/raw?se=2025-04-26T20%3A55%3A05Z&sp=r&sv=2024-08-04&sr=b&scid=2ef2bc47-d834-5bad-a629-c381d99d0901&skoid=ae70be19-8043-4428-a990-27c58b478304&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-25T23%3A06%3A04Z&ske=2025-04-26T23%3A06%3A04Z&sks=b&skv=2024-08-04&sig=QYOL9J0s%2BEXGfYAoj/FISUdwE0lGoAADHQktS0EqIEo%3D",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Background Grid Animation Layer */}
        <div className="background-grid"></div>
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
