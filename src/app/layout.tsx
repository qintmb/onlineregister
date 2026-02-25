import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sigHeadline = localFont({
  src: "../fonts/SIGHeadline-Bold.otf",
  variable: "--font-sig-headline",
  weight: "700",
});

const sigText = localFont({
  src: [
    {
      path: "../fonts/SIGText-Medium.otf",
      weight: "500",
    },
    {
      path: "../fonts/SIGText-Bold.otf",
      weight: "700",
    },
  ],
  variable: "--font-sig-text",
});

export const metadata: Metadata = {
  title: "Absensi Rapat Internal - PT Semen Tonasa",
  description: "Absensi Rapat Internal PT Semen Tonasa",
  keywords: ["absensi", "rapat internal", "semen tonasa"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${sigHeadline.variable} ${sigText.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
