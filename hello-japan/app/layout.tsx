import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hello-japan",
  description: "일본 여행지 관리 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
