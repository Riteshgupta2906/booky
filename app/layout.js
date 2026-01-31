import { Gaegu } from "next/font/google";
import "./globals.css";

const gaegu = Gaegu({
  variable: "--font-gaegu",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Note to Self",
  description: "What's the next story?",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Note to Self",
  },
};

export const viewport = {
  themeColor: "#fdfaf6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${gaegu.variable} antialiased bg-[var(--paper)] text-[var(--ink)] font-[family-name:var(--font-gaegu)]`}
      >
        {children}
      </body>
    </html>
  );
}
