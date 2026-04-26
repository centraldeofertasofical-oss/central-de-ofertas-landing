import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  title: "Central de Ofertas",
  description: "Promoções reais todos os dias no WhatsApp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
