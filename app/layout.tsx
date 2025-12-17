import type { Metadata } from "next";
import { ThemeProvider } from "@/app/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "クリぼっちカウンター",
  description: "クリスマスがぼっちの人たちが集まるカウンターサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-YD8FR387VH" />
      </body>
    </html>
  );
}
