import Script from "next/script";
import { Space_Grotesk, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import StyledJsxRegistry from "./registry";

const display = Space_Grotesk({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "Central de Ofertas — Promoções e cupons todo dia no WhatsApp",
  description:
    "Entre grátis no grupo e receba as melhores promoções da Amazon, Mercado Livre e Shopee — achadinhos e cupons selecionados, direto no seu WhatsApp.",
  openGraph: {
    title: "Central de Ofertas — Promoções todo dia no WhatsApp",
    description: "Achadinhos e cupons da Amazon, Mercado Livre e Shopee. Grátis, direto no seu WhatsApp.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${inter.variable}`}>
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;
            n.push=n;
            n.loaded=!0;
            n.version='2.0';
            n.queue=[];
            t=b.createElement(e);
            t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}
            (window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '1516567043190692');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VTCJZ4BF9K"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-VTCJZ4BF9K');
          `}
        </Script>

        <Analytics />
      </body>
    </html>
  );
}
