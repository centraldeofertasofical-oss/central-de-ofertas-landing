"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

const WA_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

const SUPA_URL = "https://zqkcsucactezbampkbps.supabase.co";
const SUPA_KEY = "sb_publishable_WVQdo69bguY3Bb55NP4sJA_le7IVszi";
const IMG_FALLBACK = "https://placehold.co/400x400/111111/FFD700?text=Oferta";

async function fetchMelhoresProdutos() {
  const params = new URLSearchParams({
    select: "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    preco_por: "gt.40",
    desconto: "gt.15",
    order: "data_publicacao.desc",
    limit: "150",
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const palavrasFortes = [
    "tenis", "tênis", "nike", "adidas", "fila", "olympikus",
    "smartwatch", "relógio", "fone", "bluetooth", "air fryer",
    "cafeteira", "secador", "chapinha", "escova", "aspirador",
    "ventilador", "tv", "monitor", "notebook", "celular", "iphone",
    "xiaomi", "samsung", "cadeira", "gamer", "mouse", "teclado",
    "perfume", "creme", "skincare", "panela", "kit", "mochila",
    "mala", "travesseiro", "ferramentas"
  ];

  const palavrasRuins = [
    "livro", "ebook", "apostila", "pdf", "capa", "pelicula",
    "película", "adesivo", "refil", "parafuso", "miniatura",
    "amostra", "usado"
  ];

  const validos = data
    .filter((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      if (!nome) return false;
      if (!p.link_imagem) return false;
      if (!Number.isFinite(preco) || preco < 40) return false;
      if (!Number.isFinite(desconto) || desconto < 15) return false;
      if (palavrasRuins.some((w) => nome.includes(w))) return false;

      return true;
    })
    .map((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      let score = 0;

      if (palavrasFortes.some((w) => nome.includes(w))) score += 200;

      if (desconto >= 70) score += 45;
      else if (desconto >= 50) score += 35;
      else if (desconto >= 30) score += 25;

      if (preco >= 70 && preco <= 400) score += 40;
      else if (preco > 400 && preco <= 1200) score += 25;

      if (p.plataforma === "mercado_livre") score += 20;
      if (p.plataforma === "amazon") score += 18;
      if (p.plataforma === "shopee") score += 15;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  const selecionados = [];
  const usados = new Set();

  function chaveProduto(p) {
    return String(p.produto || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .slice(0, 4)
      .join(" ");
  }

  function adicionar(p) {
    if (!p) return;
    const chave = chaveProduto(p);
    if (usados.has(chave)) return;
    selecionados.push(p);
    usados.add(chave);
  }

  ["amazon", "mercado_livre", "shopee"].forEach((plat) => {
    adicionar(validos.find((p) => p.plataforma === plat));
  });

  for (const p of validos) {
    if (selecionados.length >= 4) break;
    adicionar(p);
  }

  return selecionados.slice(0, 4);
}

function moeda(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomePlat(p) {
  if (p === "mercado_livre") return "ML";
  if (p === "amazon") return "Amazon";
  if (p === "shopee") return "Shopee";
  return "Oferta";
}

export default function LandingPage() {
  const [produtos, setProdutos] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [showFloat, setShowFloat] = useState(false);

  useEffect(() => {
    sendEvent("page_view");

    fetchMelhoresProdutos()
      .then(setProdutos)
      .catch(() => setProdutos([]));

    const timer = setTimeout(() => setShowFloat(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  async function handleCTA() {
    if (clicked) return;
    setClicked(true);
    await sendEvent("group_click");
    window.location.href = WA_URL;
  }

  const loading = produtos === null;
  const cards = loading ? [0, 1, 2, 3] : produtos;

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #050505;
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        .page {
          min-height: 100dvh;
          padding: 16px;
          background:
            radial-gradient(circle at 15% 20%, rgba(255, 215, 0, .16), transparent 28%),
            radial-gradient(circle at 85% 15%, rgba(255, 215, 0, .12), transparent 26%),
            radial-gradient(circle at 50% 100%, rgba(37, 211, 102, .10), transparent 35%),
            #050505;
        }

        .banner {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          min-height: calc(100dvh - 32px);
          border-radius: 24px;
          border: 1px solid rgba(255, 215, 0, .28);
          background:
            linear-gradient(135deg, rgba(255, 215, 0, .08), transparent 18%),
            linear-gradient(225deg, rgba(255, 215, 0, .08), transparent 18%),
            #080808;
          box-shadow: 0 0 50px rgba(255, 215, 0, .08);
          padding: 24px 34px 22px;
          position: relative;
          overflow: hidden;
        }

        .decor {
          position: absolute;
          font-size: 82px;
          opacity: .10;
          pointer-events: none;
        }

        .decor.cart { left: 44px; top: 86px; }
        .decor.bag { right: 58px; top: 54px; }
        .decor.gift { right: 104px; top: 178px; }
        .decor.percent { left: 46px; bottom: 130px; }

        .brand {
          text-align: center;
          font-size: clamp(1.7rem, 4vw, 2.35rem);
          font-weight: 1000;
          letter-spacing: .04em;
          color: #ffd700;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(255, 215, 0, .25);
        }

        .brand span {
          color: #fff;
        }

        .free-badge {
          width: max-content;
          margin: 9px auto 10px;
          padding: 7px 17px;
          border-radius: 999px;
          background: #22c55e;
          color: #fff;
          font-weight: 900;
          font-size: .85rem;
          box-shadow: 0 0 22px rgba(34, 197, 94, .35);
        }

        .fire {
          text-align: center;
          font-size: 2.45rem;
          margin-top: 3px;
        }

        .headline {
          max-width: 720px;
          margin: 2px auto 0;
          text-align: center;
          font-size: clamp(2rem, 5vw, 3.3rem);
          line-height: .98;
          font-weight: 1000;
          letter-spacing: -.04em;
        }

        .headline em {
          color: #ffd700;
          font-style: normal;
        }

        .sub {
          margin: 12px auto 10px;
          max-width: 650px;
          text-align: center;
          color: #e8e8e8;
          font-size: clamp(.92rem, 2vw, 1.05rem);
          line-height: 1.35;
        }

        .trust {
          text-align: center;
          color: #22c55e;
          font-weight: 900;
          font-size: .86rem;
          margin: 6px auto 14px;
        }

        .cta-top {
          display: block;
          width: min(540px, 100%);
          margin: 0 auto 16px;
          border: none;
          border-radius: 14px;
          background: #18c94f;
          color: #fff;
          font-size: clamp(1.05rem, 3vw, 1.35rem);
          font-weight: 1000;
          padding: 15px 22px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(24, 201, 79, .35);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin: 0 auto 16px;
          max-width: 980px;
        }

        .card {
          background: linear-gradient(180deg, #151515, #080808);
          border: 1px solid rgba(255, 215, 0, .55);
          border-radius: 15px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,.35);
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(37, 211, 102, .9);
          box-shadow: 0 0 24px rgba(37, 211, 102, .32);
        }

        .imgBox {
          height: 138px;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 9px;
        }

        .imgBox img {
          max-width: 100%;
          max-height: 122px;
          object-fit: contain;
          display: block;
        }

        .plat {
          position: absolute;
          left: 8px;
          top: 8px;
          background: #050505;
          color: #fff;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 6px;
          padding: 4px 7px;
          font-size: .56rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .off {
          position: absolute;
          right: 8px;
          top: 8px;
          background: #22c55e;
          color: #fff;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: .7rem;
          font-weight: 1000;
        }

        .body {
          padding: 9px 10px 11px;
          text-align: left;
        }

        .de {
          color: #b8b8b8;
          font-size: .75rem;
          line-height: 1.2;
        }

        .de span {
          text-decoration: line-through;
        }

        .por {
          margin-top: 3px;
          color: #ffd700;
          font-weight: 1000;
          font-size: 1.1rem;
          line-height: 1.1;
        }

        .benefits {
          max-width: 900px;
          margin: 0 auto 14px;
          border: 1px solid rgba(255, 215, 0, .65);
          border-radius: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(0,0,0,.42);
          overflow: hidden;
        }

        .benefit {
          padding: 11px 10px;
          text-align: center;
          border-right: 1px solid rgba(255, 215, 0, .22);
        }

        .benefit:last-child {
          border-right: none;
        }

        .benefit strong {
          display: block;
          color: #fff;
          font-size: .78rem;
          text-transform: uppercase;
          font-weight: 1000;
        }

        .benefit span {
          color: #d0d0d0;
          font-size: .72rem;
        }

        .benefit i {
          font-style: normal;
          color: #ffd700;
          font-size: 1.25rem;
          display: block;
          margin-bottom: 1px;
        }

        .secure {
          margin-top: 8px;
          text-align: center;
          color: #c8b35a;
          font-size: .76rem;
          font-weight: 800;
        }

        .float-btn {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 80;
          border: none;
          border-radius: 999px;
          background: #25d366;
          color: #fff;
          padding: 15px 22px;
          font-size: .98rem;
          font-weight: 1000;
          cursor: pointer;
          box-shadow: 0 0 26px rgba(37, 211, 102, .45);
        }

        .skeleton {
          height: 205px;
          background: linear-gradient(90deg, #111, #1d1d1d, #111);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite linear;
        }

        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        @media (max-width: 860px) {
          .page {
            padding: 0;
          }

          .banner {
            min-height: 100dvh;
            border-radius: 0;
            padding: 24px 16px 92px;
            border-left: none;
            border-right: none;
          }

          .decor {
            font-size: 50px;
          }

          .decor.cart { left: 10px; top: 112px; }
          .decor.bag { right: 14px; top: 74px; }
          .decor.gift { display: none; }
          .decor.percent { display: none; }

          .brand {
            font-size: 2.05rem;
            line-height: 1.05;
          }

          .free-badge {
            font-size: .72rem;
            padding: 7px 14px;
            margin-bottom: 8px;
          }

          .fire {
            font-size: 2rem;
          }

          .headline {
            font-size: 1.75rem;
            line-height: 1.05;
          }

          .sub {
            font-size: .84rem;
            margin: 9px auto 8px;
          }

          .trust {
            font-size: .78rem;
            margin-bottom: 10px;
          }

          .cta-top {
            padding: 14px 14px;
            font-size: 1rem;
            margin-bottom: 14px;
          }

          .grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 7px;
            max-width: 100%;
            margin-bottom: 14px;
          }

          .card {
            border-radius: 10px;
          }

          .imgBox {
            height: 74px;
            padding: 5px;
          }

          .imgBox img {
            max-height: 66px;
          }

          .plat {
            font-size: .43rem;
            padding: 2px 4px;
            left: 4px;
            top: 4px;
          }

          .off {
            font-size: .48rem;
            padding: 3px 5px;
            right: 4px;
            top: 4px;
          }

          .body {
            padding: 6px 5px 7px;
            text-align: center;
          }

          .de {
            font-size: .58rem;
          }

          .por {
            font-size: .76rem;
          }

          .benefits {
            grid-template-columns: repeat(3, 1fr);
            margin-bottom: 12px;
          }

          .benefit {
            padding: 8px 4px;
          }

          .benefit strong {
            font-size: .55rem;
          }

          .benefit span {
            display: none;
          }

          .benefit i {
            font-size: 1rem;
          }

          .secure {
            font-size: .66rem;
          }

          .float-btn {
            display: none;
          }

          .cta-bottom {
            position: fixed;
            left: 14px;
            right: 14px;
            bottom: 16px;
            z-index: 90;
            border: none;
            border-radius: 14px;
            background: #18c94f;
            color: #fff;
            font-size: 1rem;
            font-weight: 1000;
            padding: 15px 12px;
            box-shadow: 0 0 28px rgba(24, 201, 79, .42);
          }
        }

        @media (min-width: 861px) {
          .cta-bottom {
            display: none;
          }
        }
      `}</style>

      <main className="page">
        <section className="banner">
          <div className="decor cart">🛒</div>
          <div className="decor bag">🛍️</div>
          <div className="decor gift">🎁</div>
          <div className="decor percent">🏷️</div>

          <h1 className="brand">
            CENTRAL <span>DE OFERTAS</span>
          </h1>

          <div className="free-badge">💬 GRÁTIS PARA SEMPRE!</div>

          <div className="fire">🔥</div>

          <h2 className="headline">
            Promoções reais todos os dias no <em>WhatsApp</em>
          </h2>

          <p className="sub">
            Receba cupons e descontos da <strong>Amazon, Mercado Livre e Shopee</strong> direto no seu celular.
          </p>

          <div className="trust">✅ Ofertas atualizadas diariamente</div>

          <button className="cta-top" onClick={handleCTA} disabled={clicked}>
            💬 {clicked ? "Redirecionando..." : "ENTRAR NO GRUPO GRÁTIS"}
          </button>

          <div className="grid">
            {loading
              ? cards.map((_, i) => <div className="card skeleton" key={i}></div>)
              : cards.map((p, i) => {
                  const off = Math.round(Number(p.desconto || 0));

                  return (
                    <article className="card" key={`${p.produto}-${i}`} onClick={handleCTA}>
                      <div className="imgBox">
                        <img
                          src={p.link_imagem || IMG_FALLBACK}
                          alt="Oferta"
                          onError={(e) => {
                            e.currentTarget.src = IMG_FALLBACK;
                          }}
                        />

                        <span className="plat">{nomePlat(p.plataforma)}</span>
                        {off > 0 && <span className="off">{off}%</span>}
                      </div>

                      <div className="body">
                        {Number(p.preco_de) > Number(p.preco_por) && (
                          <div className="de">
                            <span>{moeda(p.preco_de)}</span>
                          </div>
                        )}

                        <div className="por">{moeda(p.preco_por)}</div>
                      </div>
                    </article>
                  );
                })}
          </div>

          <div className="benefits">
            <div className="benefit">
              <i>🔶</i>
              <strong>Filtradas</strong>
              <span>Só o que vale a pena</span>
            </div>

            <div className="benefit">
              <i>🏷️</i>
              <strong>Descontos</strong>
              <span>Economize todos os dias</span>
            </div>

            <div className="benefit">
              <i>⚡</i>
              <strong>Na hora</strong>
              <span>Direto no WhatsApp</span>
            </div>
          </div>

          <div className="secure">🔒 100% GRATUITO • SEM TAXAS • SEM PLANOS</div>
        </section>
      </main>

      <button className="cta-bottom" onClick={handleCTA} disabled={clicked}>
        💬 {clicked ? "Redirecionando..." : "ENTRAR NO GRUPO GRÁTIS"}
      </button>

      {showFloat && (
        <button className="float-btn" onClick={handleCTA} disabled={clicked}>
          🔥 Entrar agora
        </button>
      )}
    </>
  );
}
