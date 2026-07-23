export const metadata = {
  title: "Exclusão de Dados — Central de Ofertas",
  description: "Como solicitar a exclusão dos seus dados na Central de Ofertas.",
};

export default function ExclusaoDeDados() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 22px 80px", color: "#e9ebef", fontFamily: "system-ui, Arial, sans-serif", lineHeight: 1.65, background: "#0b0e1c", minHeight: "100vh" }}>
      <h1 style={{ color: "#ffce33", fontSize: 30, marginBottom: 6 }}>Exclusão de Dados</h1>
      <p style={{ color: "#9aa2b2", fontSize: 14, marginTop: 0 }}>Central de Ofertas · Última atualização: julho de 2026</p>

      <p>Você tem o direito de solicitar a exclusão dos dados de navegação que coletamos sobre você (conforme a nossa <a style={{ color: "#25d366" }} href="/privacidade">Política de Privacidade</a>).</p>

      <h2 style={{ color: "#fff", fontSize: 19, marginTop: 30, marginBottom: 8 }}>Como solicitar</h2>
      <p>Envie um e-mail para <a style={{ color: "#25d366" }} href="mailto:centraldeofertas.ofical@gmail.com">centraldeofertas.ofical@gmail.com</a> com o assunto <b>"Exclusão de dados"</b>, informando:</p>
      <ul>
        <li>uma forma de te identificarmos (o e-mail usado ou detalhes do acesso);</li>
        <li>a solicitação de exclusão.</li>
      </ul>
      <p>Processaremos o pedido em até <b>30 dias</b> e confirmaremos por e-mail.</p>

      <h2 style={{ color: "#fff", fontSize: 19, marginTop: 30, marginBottom: 8 }}>Observação</h2>
      <p>Este site coleta apenas dados de navegação anônimos/pseudônimos (cookies, IP aproximado, estatísticas de acesso). Não armazenamos nome, CPF ou dados de pagamento. Dados mantidos por terceiros (Meta, Google) seguem as políticas de cada plataforma.</p>
    </main>
  );
}
