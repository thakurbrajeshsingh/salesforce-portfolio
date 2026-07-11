import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brajeshkumar.dev"),
  title: "Brajesh Kumar | Salesforce Developer",
  description:
    "Salesforce Developer specializing in Field Service, Service Cloud, Apex, LWC, Flow, enterprise utility delivery, and a growing Agentforce practice.",
  keywords: [
    "Agentforce",
    "Salesforce Developer",
    "Brajesh Kumar",
    "Field Service Lightning",
    "Agentforce",
    "Data Cloud",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Brajesh Kumar | Salesforce Developer",
    description: "Explore Brajesh Kumar's Salesforce expertise, certifications, project impact, and Agentforce journey.",
    type: "website",
    url: "/",
    siteName: "Brajesh Kumar — Salesforce Developer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brajesh Kumar | Salesforce Developer",
    description: "Field Service, Service Cloud, Apex, LWC, Flow, integrations, and Agentforce.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
