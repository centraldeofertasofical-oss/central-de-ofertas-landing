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
    select:
      "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    preco_por: "gt.25",
    desconto: "gt.10",
    order: "data_publicacao.desc",
    limit: "100",
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
    "tenis",
    "tênis",
    "nike",
    "adidas",
    "fila",
    "olympikus",
    "smartwatch",
    "relógio",
    "fone",
    "bluetooth",
    "air fryer",
    "cafeteira",
    "liquidificador",
    "secador",
    "chapinha",
    "escova",
    "aspirador",
    "ventilador",
    "tv",
    "monitor",
    "notebook",
    "celular",
    "iphone",
    "xiaomi",
    "samsung",
    "cadeira",
    "gamer",
    "mouse",
    "teclado",
    "perfume",
    "creme",
    "skincare",
    "panela",
    "kit",
    "mochila",
    "mala",
    "travesseiro",
  ];

  const palavrasRuins = [
    "livro",
    "ebook",
    "apostila",
    "pdf",
    "capa",
    "pelicula",
    "película",
    "adesivo",
    "refil",
    "parafuso",
    "miniatura",
    "amostra",
    "usado",
  ];

  const validos = data
    .filter((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      if (!nome) return false;
      if (!Number.isFinite(preco) || preco < 25) return false;
      if (!Number.isFinite(desconto) || desconto < 10) return false;
      if (!p.link_imagem) return false;
      if (palavrasRuins.some((w) => nome.includes(w))) return false;

      return true;
    })
    .map((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      let score = 0;

      if (palavrasFortes.some((w) => nome.includes(w))) score += 100;

      if (desconto >= 70) score += 40;
      else if (desconto >= 50) score += 30;
      else if (desconto >= 30) score += 20;

      if (preco >= 50 && preco <= 300) score += 30;
      if (preco > 300 && preco <= 1200) score += 20;

      if (p.plataforma === "mercado_livre") score += 15;
      if (p.plataforma === "amazon") score += 12;
      if (p.plataforma === "shopee") score += 8;

      score += desconto * 0.3;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  const selecionados = [];
  const usados = new Set();

  for (const p of validos) {
    if (selecionados.length >= 4) break;

    const chave = String(p.produto || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .slice(0, 4)
      .join(" ");

    if (usados.has(chave)) continue;

    usados.add(chave);
    selecionados.push(p);
  }

  return selecionados;
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
  if (p === "mercado_livre") return "Mercado Livre";
  if (p === "amazon") return "Amazon";
  if (p === "shopee") return "Shopee";
  return "Oferta";
}

export default function LandingPage() {
  const [produtos, setProdutos] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    sendEvent("page_view");
    fetchMelhoresProdutos()
      .then(setProdutos)
      .catch(() => setProdutos([]));
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
          padding: 18px;
          background:
            radial-gradient(circle at 15% 20%, rgba(255, 215, 0, .16), transparent 28%),
            radial-gradient(circle at 85% 15%, rgba(255, 215, 0, .12), transparent 26%),
            radial-gradient(circle at 50% 100%, rgba(37, 211, 102, .10), transparent 35%),
            #050505;
        }

        .banner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          min-height: calc(100dvh - 36px);
          border-radius: 24px;
          border: 1px solid rgba(255, 215, 0, .28);
          background:
            linear-gradient(135deg, rgba(255, 215, 0, .08), transparent 18%),
            linear-gradient(225deg, rgba(255, 215, 0, .08), transparent 18%),
            #080808;
          box-shadow: 0 0 50px rgba(255, 215, 0, .08);
          padding: 26px 34px 22px;
          position: relative;
          overflow: hidden;
        }

        .decor {
          position: absolute;
          font-size: 92px;
          opacity: .12;
          filter: drop-shadow(0 0 18px rgba(255, 215, 0, .35));
          pointer-events: none;
        }

        .decor.cart { left: 42px; top: 82px; }
        .decor.bag { right: 58px; top: 48px; }
        .decor.gift { right: 98px; top: 190px; }
        .decor.percent { left: 40px; bottom: 160px; }

        .brand {
          text-align: center;
          font-size: clamp(1.7rem, 4vw, 2.4rem);
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
          margin: 10px auto 14px;
          padding: 8px 18px;
          border-radius: 999px;
          background: #22c55e;
          color: #fff;
          font-weight: 900;
          font-size: .9rem;
          box-shadow: 0 0 22px rgba(34, 197, 94, .35);
        }

        .fire {
          text-align: center;
          font-size: 3rem;
          margin-top: 6px;
        }

        .headline {
          max-width: 720px;
          margin: 4px auto 0;
          text-align: center;
          font-size: clamp(2rem, 5vw, 3.45rem);
          line-height: .98;
          font-weight: 1000;
          letter-spacing: -.04em;
        }

        .headline em {
          color: #ffd700;
          font-style: normal;
        }

        .sub {
          margin: 14px auto 18px;
          max-width: 650px;
          text-align: center;
          color: #e8e8e8;
          font-size: clamp(.95rem, 2vw, 1.1rem);
          line-height: 1.4;
        }

        .sub strong {
          color: #fff;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 22px auto 18px;
          max-width: 1060px;
        }

        .card {
          background: linear-gradient(180deg, #151515, #080808);
          border: 1px solid rgba(255, 215, 0, .45);
          border-radius: 15px;
          overflow: hidden;
          min-height: 260px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,.35);
        }

        .imgBox {
          height: 145px;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 10px;
        }

        .imgBox img {
          max-width: 100%;
          max-height: 130px;
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
          padding: 4px 8px;
          font-size: .58rem;
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
          font-size: .72rem;
          font-weight: 1000;
        }

        .body {
          padding: 11px 12px 13px;
        }

        .name {
          min-height: 42px;
          color: #f1f1f1;
          font-size: .82rem;
          line-height: 1.28;
          font-weight: 800;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .de {
          margin-top: 10px;
          color: #b8b8b8;
          font-size: .75rem;
        }

        .de span {
          text-decoration: line-through;
        }

        .por {
          margin-top: 3px;
          color: #ffd700;
          font-weight: 1000;
          font-size: 1.12rem;
        }

        .benefits {
          max-width: 960px;
          margin: 12px auto 16px;
          border: 1px solid rgba(255, 215, 0, .65);
          border-radius: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(0,0,0,.42);
          overflow: hidden;
        }

        .benefit {
          padding: 13px 10px;
          text-align: center;
          border-right: 1px solid rgba(255, 215, 0, .22);
        }

        .benefit:last-child {
          border-right: none;
        }

        .benefit strong {
          display: block;
          color: #fff;
          font-size: .86rem;
          text-transform: uppercase;
          font-weight: 1000;
        }

        .benefit span {
          color: #d0d0d0;
          font-size: .78rem;
        }

        .benefit i {
          font-style: normal;
          color: #ffd700;
          font-size: 1.45rem;
          display: block;
          margin-bottom: 2px;
        }

        .cta {
          display: block;
          width: min(520px, 100%);
          margin: 0 auto;
          border: none;
          border-radius: 13px;
          background: #18c94f;
          color: #fff;
          font-size: clamp(1.05rem, 3vw, 1.5rem);
          font-weight: 1000;
          padding: 16px 22px;
          cursor: pointer;
          box-shadow: 0 0 30px rgba(24, 201, 79, .35);
        }

        .cta:active {
          transform: scale(.98);
        }

        .secure {
          margin-top: 9px;
          text-align: center;
          color: #c8b35a;
          font-size: .78rem;
          font-weight: 800;
        }

        .skeleton {
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
            padding: 22px 16px 96px;
          }

          .decor {
            font-size: 54px;
          }

          .decor.cart { left: 8px; top: 95px; }
          .decor.bag { right: 14px; top: 72px; }
          .decor.gift { display: none; }
          .decor.percent { left: 12px; bottom: 210px; }

          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .card {
            min-height: 235px;
          }

          .imgBox {
            height: 124px;
          }

          .imgBox img {
            max-height: 110px;
          }

          .benefits {
            grid-template-columns: 1fr;
          }

          .benefit {
            border-right: none;
            border-bottom: 1px solid rgba(255, 215, 0, .22);
          }

          .benefit:last-child {
            border-bottom: none;
          }

          .cta {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 18px;
            width: auto;
            z-index: 50;
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
            Entre grátis no grupo e receba cupons e descontos da{" "}
            <strong>Amazon, Mercado Livre e Shopee</strong> direto no seu celular.
          </p>

          <div className="grid">
            {loading
              ? cards.map((_, i) => (
                  <div className="card skeleton" key={i}></div>
                ))
              : cards.map((p, i) => {
                  const off = Math.round(Number(p.desconto || 0));

                  return (
                    <article className="card" key={`${p.produto}-${i}`}>
                      <div className="imgBox">
                        <img
                          src={p.link_imagem || IMG_FALLBACK}
                          alt={p.produto || "Oferta"}
                          onError={(e) => {
                            e.currentTarget.src = IMG_FALLBACK;
                          }}
                        />

                        <span className="plat">{nomePlat(p.plataforma)}</span>

                        {off > 0 && <span className="off">{off}% OFF</span>}
                      </div>

                      <div className="body">
                        <div className="name">{p.produto}</div>

                        {Number(p.preco_de) > Number(p.preco_por) && (
                          <div className="de">
                            De: <span>{moeda(p.preco_de)}</span>
                          </div>
                        )}

                        <div className="por">Por: {moeda(p.preco_por)}</div>
                      </div>
                    </article>
                  );
                })}
          </div>

          <div className="benefits">
            <div className="benefit">
              <i>🔶</i>
              <strong>Ofertas filtradas</strong>
              <span>Só o que vale a pena!</span>
            </div>

            <div className="benefit">
              <i>🏷️</i>
              <strong>Descontos reais</strong>
              <span>Economize todos os dias</span>
            </div>

            <div className="benefit">
              <i>⚡</i>
              <strong>Chega na hora</strong>
              <span>Direto no seu WhatsApp</span>
            </div>
          </div>

          <button className="cta" onClick={handleCTA} disabled={clicked}>
            💬 {clicked ? "Redirecionando..." : "ENTRAR NO GRUPO GRÁTIS"}
          </button>

          <div className="secure">🔒 100% GRATUITO • SEM TAXAS • SEM PLANOS</div>
        </section>
      </main>
    </>
  );
}
