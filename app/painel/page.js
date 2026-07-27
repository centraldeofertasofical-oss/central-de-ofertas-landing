import Panel from "./Panel";

export const metadata = {
  title: "Painel — Central de Ofertas",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Painel CDO", statusBarStyle: "black-translucent" },
};

export default function Page() {
  return <Panel />;
}
