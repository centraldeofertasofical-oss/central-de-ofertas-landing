import "./globals.css";

export const metadata = {
  title: "Central de Ofertas – Promoções no WhatsApp",
  description:
    "Entre no grupo gratuito e receba cupons e descontos da Amazon, Mercado Livre e Shopee direto no seu celular.",
  openGraph: {
    title: "Central de Ofertas – Promoções no WhatsApp",
    description:
      "Ofertas filtradas todos os dias. Cupons, promoções relâmpago e links seguros.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
