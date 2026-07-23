export const metadata = {
  title: "Política de Privacidade — Central de Ofertas",
  description: "Política de Privacidade da Central de Ofertas.",
};

export default function Privacidade() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 22px 80px", color: "#e9ebef", fontFamily: "system-ui, Arial, sans-serif", lineHeight: 1.65, background: "#0b0e1c", minHeight: "100vh" }}>
      <h1 style={{ color: "#ffce33", fontSize: 30, marginBottom: 6 }}>Política de Privacidade</h1>
      <p style={{ color: "#9aa2b2", fontSize: 14, marginTop: 0 }}>Central de Ofertas · Última atualização: julho de 2026</p>

      <h2 style={h2}>Quem somos</h2>
      <p>A <b>Central de Ofertas</b> divulga promoções e cupons de e-commerce (Amazon, Mercado Livre, Shopee) por meio de links oficiais das plataformas. Não vendemos produtos diretamente. Contato: <a style={a} href="mailto:centraldeofertas.ofical@gmail.com">centraldeofertas.ofical@gmail.com</a>.</p>

      <h2 style={h2}>Quais dados coletamos</h2>
      <p>Neste site coletamos apenas dados de navegação e desempenho, de forma anônima ou pseudônima: páginas visitadas, cliques, tipo de dispositivo, navegador, endereço IP aproximado, origem do acesso (parâmetros de campanha/UTM) e identificadores de cookies. <b>Não coletamos nome, CPF, telefone ou dados de pagamento neste site.</b></p>

      <h2 style={h2}>Como usamos</h2>
      <p>Usamos esses dados para medir e melhorar nossos anúncios e conteúdos, entender de onde vêm os visitantes e otimizar a experiência. Não vendemos seus dados.</p>

      <h2 style={h2}>Serviços de terceiros</h2>
      <p>Utilizamos ferramentas que podem usar cookies e coletar dados de navegação:</p>
      <ul>
        <li><b>Meta Pixel (Facebook/Instagram)</b> — mensuração de anúncios. <a style={a} href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Política da Meta</a></li>
        <li><b>Google Analytics</b> — estatísticas de acesso. <a style={a} href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Política do Google</a></li>
        <li><b>Vercel</b> — hospedagem e análise de desempenho.</li>
      </ul>

      <h2 style={h2}>Grupo de WhatsApp</h2>
      <p>A entrada no grupo é voluntária. Ao entrar, seu número fica visível aos administradores conforme o funcionamento do WhatsApp. Você pode sair do grupo a qualquer momento.</p>

      <h2 style={h2}>Seus direitos (LGPD)</h2>
      <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail <a style={a} href="mailto:centraldeofertas.ofical@gmail.com">centraldeofertas.ofical@gmail.com</a>. Veja também nossa página de <a style={a} href="/exclusao-de-dados">exclusão de dados</a>.</p>

      <h2 style={h2}>Alterações</h2>
      <p>Esta política pode ser atualizada. A data no topo indica a última revisão.</p>
    </main>
  );
}

const h2 = { color: "#fff", fontSize: 19, marginTop: 30, marginBottom: 8 };
const a = { color: "#25d366" };
