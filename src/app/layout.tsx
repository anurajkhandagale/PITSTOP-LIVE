import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { UniversalBackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "PitStop Live | Hyper-Fast Roadside Assistance",
  description: "Futuristic emergency garage finder with real-time tracking.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={cn("dark scroll-smooth", inter.variable, outfit.variable)} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary font-sans"
        )}
      >
        <Providers session={session}>
          <Navbar session={session} />
          {/* Global Background Decorative Elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-primary/5 rounded-full blur-[110px] animate-pulse-slow" />
          </div>
          
          <UniversalBackButton />
          <ThemeToggle />
          <div className="relative z-10 pt-20">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
