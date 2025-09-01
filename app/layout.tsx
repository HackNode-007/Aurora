import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora",
  description: "An ai and web-3 powered web-app that helps to report and resolve issue an get rewards on resolving issue listed on our website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
