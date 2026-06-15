import type { Metadata } from "next";
import { AuthProvider } from "@/core/auth/provider";
import { satoshi } from "@/core/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnTap - Mobile Bar OS",
  description: "All-in-one operating system for mobile bar operators",
  icons: {
    icon: "/images/svg/charcoal_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body className="bg-charcoal text-warm-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
