import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cindy from Cinder - AI Interview Coach",
  description: "Free AI interview and application coach for job seekers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
