import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import DotBackground from "@/components/DotBackground";
import GlobalLogic from "@/components/GlobalLogic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evalugence | AI Evaluation Lab",
  description: "A Bring-Your-Own-Key (BYOK) AI evaluation workspace. Test and compare bleeding-edge Large Language Models side-by-side in real time.",
  appleWebApp: {
    title: "Evalugence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-transparent pb-14 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalLogic />
          <DotBackground />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
