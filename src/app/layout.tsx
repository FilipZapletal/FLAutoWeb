import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], weight: ["400", "600"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin", "latin-ext"], weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} – prodej ojetých vozů`, template: `%s | ${SITE_NAME}` },
  description: "Ojeté vozy s čistou historií. Každé auto prochází kontrolou před prodejem. Prodej, servis, mytí a příprava na STK.",
  openGraph: { siteName: SITE_NAME, locale: "cs_CZ", type: "website", images: ["/logo-dark.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
};

// Nastaví motiv ještě před vykreslením (bez probliknutí): localStorage → systém.
const themeScript = `(function(){var t;try{t=localStorage.getItem("ab_theme")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${inter.variable} ${oswald.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
