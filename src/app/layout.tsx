"use client";
import { UserProvider } from "@/contexts/UserContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainMenu from "@/components/MainMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Project Space</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <UserProvider>
          <MainMenu />
          <main className="container mx-auto py-4 flex-1">{children}</main>
          <footer className="text-center text-gray-500 text-sm py-4">
            © {new Date().getFullYear()} developed by Li Haiyun &lt;
            <a
              href="mailto:li_haiyun@nyp.edu.sg"
              className="underline hover:text-gray-700"
            >
              li_haiyun@nyp.edu.sg
            </a>
            &gt;
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}
