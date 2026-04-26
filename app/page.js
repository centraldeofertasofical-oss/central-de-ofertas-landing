"use client";

const WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

export default function Page() {
  return (
    <main className="page">
      <section className="hero">
        <div className="bgDecor cart">🛒</div>
        <div className="bgDecor bag">🛍️</div>
        <div className="bgDecor gift">🎁</div>
        <div className="bgDecor tag1">🏷️</div>
        <div className="bgDecor tag2">%</div>

        <div className="content">
          <h1>
            <span>CENTRAL</span> DE OFERTAS
          </h1>

          <div className="badge">Acesso gratuito</div>

          <div className="fire">🔥</div>

          <h2>
            Promoções reais todos os dias no <span>WhatsApp</span>
          </h2>

          <p className="subtitle">
            A Central de Ofertas compartilha promoções de lojas conhecidas como
            Amazon, Mercado Livre e Shopee.
          </p>

          <p className="transparency">
            Não vendemos produtos diretamente. Apenas divulgamos ofertas e
            cupons de e-commerce por meio de links oficiais das plataformas.
          </p>

          <a
            className="cta"
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Acessar grupo de ofertas
          </a>

          <div className="products">
            <div className="card">
              <span className="label">AMAZON</span>
              <span className="discount">54%</span>
              <div className="img watch" />
              <p>Relógio Smartwatch Rose</p>
              <small>De: R$ 269,00</small>
              <strong>Por: R$ 122,55</strong>
            </div>

            <div className="card">
              <span className="label">ML</span>
              <span className="discount">50%</span>
              <div className="img shoe" />
              <p>Tênis casual masculino</p>
              <small>De: R$ 189,99</small>
              <strong>Por: R$ 94,90</strong>
            </div>

            <div className="card">
              <span className="label">SHOPEE</span>
              <span className="discount">42%</span>
              <div className="img tool" />
              <p>Kit organizador doméstico</p>
              <small>De: R$ 263,42</small>
              <strong>Por: R$ 150,80</strong>
            </div>

            <div className="card">
              <span className="label">ML</span>
              <span className="discount">32%</span>
              <div className="img clothes" />
              <p>Kit moda masculina</p>
              <small>De: R$ 143,70</small>
              <strong>Por: R$ 96,99</strong>
            </div>
          </div>

          <div className="features">
            <div>
              <span>◆</span>
              <strong>Ofertas filtradas</strong>
              <small>Curadoria de promoções</small>
            </div>

            <div>
              <span>%</span>
              <strong>Cupons e descontos</strong>
              <small>Atualizações diárias</small>
            </div>

            <div>
              <span>⚡</span>
              <strong>Direto no celular</strong>
              <small>Via WhatsApp</small>
            </div>
          </div>

          <a
            className="cta second"
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Ver ofertas no WhatsApp
          </a>

          <p className="notice">
            Ao clicar, você será redirecionado para o WhatsApp para acessar o
            grupo de ofertas.
          </p>

          <p className="footer">
            Este site não é afiliado oficialmente às marcas mencionadas. Amazon,
            Mercado Livre e Shopee são marcas de seus respectivos proprietários.
          </p>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 210, 0, 0.14), transparent 28%),
            radial-gradient(circle at 80% 18%, rgba(255, 210, 0, 0.16), transparent 28%),
            radial-gradient(circle at 50% 100%, rgba(0, 255, 90, 0.11), transparent 30%),
            linear-gradient(135deg, #050505 0%, #0b0b08 45%, #000 100%);
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          overflow: hidden;
        }

        .hero {
          position: relative;
          min-height: 100vh;
          padding: 38px 18px 34px;
          overflow: hidden;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, transparent 0%, rgba(255, 215, 0, 0.08) 35%, transparent 60%),
            repeating-linear-gradient(
              135deg,
              rgba(255, 215, 0, 0.05) 0px,
              rgba(255, 215, 0, 0.05) 1px,
              transparent 1px,
              transparent 42px
            );
          pointer-events: none;
        }

        .hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle, rgba(255, 215, 0, 0.45) 1px, transparent 1px),
            radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 80px 80px, 130px 130px;
          opacity: 0.35;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 1120px;
          margin: 0 auto;
          text-align: center;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 7vw, 72px);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: 3px;
        }

        h1 span {
          color: #ffd400;
        }

        .badge {
          display: inline-block;
          margin: 20px 0 16px;
          padding: 10px 28px;
          border-radius: 999px;
          background: linear-gradient(180deg, #22e85c, #09b73f);
          color: #fff;
          font-size: clamp(17px, 3vw, 24px);
          font-weight: 900;
          box-shadow: 0 0 25px rgba(0, 255, 90, 0.45);
        }

        .fire {
          font-size: 46px;
          margin: 8px 0;
        }

        h2 {
          max-width: 900px;
          margin: 0 auto 18px;
          font-size: clamp(36px, 7vw, 68px);
          line-height: 1.02;
          font-weight: 900;
        }

        h2 span {
          color: #ffd400;
        }

        .subtitle {
          max-width: 760px;
          margin: 0 auto 10px;
          color: #eeeeee;
          font-size: clamp(18px, 3vw, 28px);
          line-height: 1.35;
        }

        .transparency {
          max-width: 780px;
          margin: 0 auto 24px;
          color: #cfcfcf;
          font-size: clamp(14px, 2.5vw, 18px);
          line-height: 1.45;
        }

        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: min(100%, 760px);
          min-height: 78px;
          padding: 20px 28px;
          border-radius: 22px;
          background: linear-gradient(180deg, #1fe95c, #08b83c);
          color: #fff;
          text-decoration: none;
          font-size: clamp(22px, 4.8vw, 42px);
          font-weight: 900;
          text-transform: uppercase;
          box-shadow:
            0 0 25px rgba(0, 255, 90, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .second {
          margin-top: 28px;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin: 32px auto 24px;
        }

        .card {
          position: relative;
          min-height: 275px;
          padding: 14px;
          border: 1px solid rgba(255, 215, 0, 0.55);
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0.72));
          text-align: left;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.07);
        }

        .label {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          padding: 5px 10px;
          border-radius: 999px;
          background: #050505;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
        }

        .discount {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          padding: 6px 10px;
          border-radius: 999px;
          background: #18c754;
          color: #fff;
          font-size: 15px;
          font-weight: 900;
        }

        .img {
          height: 125px;
          margin-bottom: 14px;
          border-radius: 13px;
          background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.95), rgba(230, 230, 230, 0.85));
        }

        .watch::after,
        .shoe::after,
        .tool::after,
        .clothes::after {
          display: flex;
          height: 100%;
          align-items: center;
          justify-content: center;
          font-size: 54px;
        }

        .watch::after {
          content: "⌚";
        }

        .shoe::after {
          content: "👟";
        }

        .tool::after {
          content: "🧰";
        }

        .clothes::after {
          content: "🩳";
        }

        .card p {
          min-height: 48px;
          margin: 0 0 10px;
          font-size: clamp(14px, 1.8vw, 18px);
          font-weight: 800;
          line-height: 1.25;
        }

        .card small {
          display: block;
          color: #b8b8b8;
          font-size: 16px;
          text-decoration: line-through;
        }

        .card strong {
          display: block;
          margin-top: 4px;
          color: #ffd400;
          font-size: clamp(20px, 2.4vw, 28px);
          font-weight: 900;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid rgba(255, 215, 0, 0.72);
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.55);
        }

        .features div {
          padding: 20px 14px;
          border-right: 1px solid rgba(255, 215, 0, 0.28);
        }

        .features div:last-child {
          border-right: none;
        }

        .features span {
          display: block;
          color: #ffd400;
          font-size: 32px;
          margin-bottom: 8px;
        }

        .features strong {
          display: block;
          font-size: clamp(15px, 2.1vw, 22px);
          font-weight: 900;
          text-transform: uppercase;
        }

        .features small {
          display: block;
          margin-top: 5px;
          color: #d8d8d8;
          font-size: clamp(13px, 1.8vw, 17px);
        }

        .notice {
          margin: 14px auto 0;
          color: #bfbfbf;
          font-size: 14px;
          line-height: 1.4;
        }

        .footer {
          max-width: 800px;
          margin: 18px auto 0;
          color: #8f8f8f;
          font-size: 12px;
          line-height: 1.4;
        }

        .bgDecor {
          position: absolute;
          z-index: 1;
          opacity: 0.16;
          filter: drop-shadow(0 0 18px rgba(255, 215, 0, 0.25));
          pointer-events: none;
        }

        .cart {
          top: 160px;
          left: 5%;
          font-size: 92px;
          transform: rotate(-8deg);
        }

        .bag {
          top: 135px;
          right: 5%;
          font-size: 90px;
          transform: rotate(10deg);
        }

        .gift {
          top: 330px;
          right: 8%;
          font-size: 96px;
          opacity: 0.13;
        }

        .tag1 {
          bottom: 180px;
          left: 6%;
          font-size: 72px;
        }

        .tag2 {
          bottom: 210px;
          right: 7%;
          font-size: 92px;
          color: #ffd400;
          font-weight: 900;
        }

        @media (max-width: 900px) {
          .products {
            grid-template-columns: repeat(2, 1fr);
          }

          .features {
            grid-template-columns: 1fr;
          }

          .features div {
            border-right: none;
            border-bottom: 1px solid rgba(255, 215, 0, 0.28);
          }

          .features div:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 560px) {
          .hero {
            padding: 34px 14px 28px;
          }

          .products {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .card {
            min-height: 235px;
            padding: 10px;
            border-radius: 14px;
          }

          .img {
            height: 96px;
          }

          .card p {
            min-height: 54px;
          }

          .label,
          .discount {
            font-size: 11px;
          }

          .cta {
            min-height: 68px;
            border-radius: 18px;
          }

          .cart,
          .bag,
          .gift,
          .tag1,
          .tag2 {
            opacity: 0.09;
          }
        }
      `}</style>
    </main>
  );
}
