import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif-heading",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prophet Code — The Bible Prophesy Dossier",
  description:
    "An intelligence digest for those monitoring the return of Christ. Historical roots, modern echoes, and prophetic horizon.",
  keywords: ["bible", "prophecy", "end times", "intelligence digest", "prophet code"],
  openGraph: {
    title: "Prophet Code — The Bible Prophesy Dossier",
    description:
      "An intelligence digest for those monitoring the return of Christ.",
    type: "website",
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
      className={`${playfair.variable} ${lora.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
