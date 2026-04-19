import Providers from "./providers";
import CSSLoader from "./CSSLoader";
import { TEXT } from "@/constants/site";
import "./critical.css";

export const metadata = {
  title: TEXT.SITE.TITLE,
  description: TEXT.SEO.HOME,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* FONT PRELOAD - Prevent render-blocking font requests */}
        {/* Preload heading font */}
        <link
          rel="preload"
          as="font"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preload body font */}
        <link
          rel="preload"
          as="font"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        <CSSLoader />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
