import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AsyncMailTest",
  description: "A Site for Testing Asynchronous Email Transmission Techniques Using Bull Queue and Redis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
