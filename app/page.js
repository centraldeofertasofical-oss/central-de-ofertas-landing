"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

const WA_URL = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

// Supabase direto — anon key pública (igual ao site do catálogo)
const SUPA_URL  = "https://zqkcsucactezbampkbps.supabase.co";
const SUPA_KEY  = "sb_publishable_WVQdo69bguY3Bb55NP4sJA_le7IVszi";
const IMG_FALLBACK = "https://placehold.co/400x400/141414/555?text=Oferta";

const PLAT_BORDER = { amazon: "#FF9900", mercado_livre: "#FFE600", shopee: "#EE4D2D" };

function nomePlat(p) {
  if (p === "mercado_livre") return "Mercado Livre";
  if (p === "amazon") return "Amazon";
  if (p === "shopee") return "Shopee";
  return p || "Oferta";
}

function moeda(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const SKELETONS = Array.from({ length: 4 }, (_, i) => i);

export default function LandingPage() {
  const [produtos, setProdutos] = useState(null); // null = loading
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    sendEvent("page_view");
    fetchMelhores();
  }, []);

  async function fetchMelhores() {
    try {
      // Busca os 4 produtos ativos com maior desconto dos últimos 7 dias
      const params = new URLSearchParams({
        select: "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
        ativo: "eq.true",
        order: "desconto.desc,data_publicacao.desc",
        limit: "4",
      });
      const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      });
      const data = await res.json();
      const validos = Array.isArray(data)
        ? data.filter(p => p.produto && Number.isFinite(Number(p.preco_por)))
        : [];
      setProdutos(validos.length ? validos : []);
    } catch {
      setProdutos([]);
    }
  }

  async function handleCTA() {
    if (clicked) return;
    setClicked(true);
    await sendEvent("group_click");
    window.location.href = WA_URL;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { font-family: 'Nunito', system-ui, sans-serif; background: #0A0A0A; color: #fff; min-height: 100dvh; overflow-x: hidden; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,.45); }
          50%      { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .page { display: flex; flex-direction: column; align-items: center; padding-bottom: 110px; }

        /* topbar */
        .topbar {
          width: 100%; background: #FFD700; color: #0A0A0A;
          font-size: .72rem; font-weight: 900; letter-spacing: .07em;
          text-transform: uppercase; text-align: center; padding: 9px 16px;
        }

        /* ticker */
        .ticker-wrap { width: 100%; overflow: hidden; background: #111; border-bottom: 1px solid #1a1a1a; padding: 7px 0; }
        .ticker-inner { display: flex; gap: 48px; white-space: nowrap; animation: ticker 32s linear infinite; width: max-content; }
        .ticker-item { font-size: .7rem; font-weight: 700; color: #444; }
        .ticker-item em { color: #FFD700; font-style: normal; }

        /* hero */
        .hero { text-align: center; padding: 34px 22px 0; max-width: 440px; width: 100%; animation: fadeUp .5s ease both; }
        .logo-label { font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #333; margin-bottom: 16px; }
        .logo-label span { color: #FFD700; }
        .fire { font-size: 2.8rem; display: block; margin-bottom: 12px; animation: float 3s ease-in-out infinite; }
        .hero h1 { font-size: clamp(1.6rem,6vw,2.1rem); font-weight: 900; line-height: 1.13; letter-spacing: -.02em; }
        .hero h1 em { color: #FFD700; font-style: normal; }
        .hero p { margin-top: 13px; font-size: .93rem; color: #777; line-height: 1.6; }
        .hero p strong { color: #ccc; }
        .badge-gratis {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(37,211,102,.1); border: 1px solid rgba(37,211,102,.25);
          color: #25D366; border-radius: 30px; padding: 6px 14px;
          font-size: .76rem; font-weight: 800; margin-top: 16px;
        }

        /* section produtos */
        .prods-wrap { width: 100%; max-width: 440px; padding: 28px 18px 0; animation: fadeUp .55s .1s ease both; }
        .prods-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
        }
        .prods-title { font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #333; flex: 1; }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22C55E;
          box-shadow: 0 0 0 3px rgba(34,197,94,.25);
          flex-shrink: 0;
        }
        .prods-sub { font-size: .68rem; color: #333; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* card produto — visual only, sem cursor pointer */
        .prod-card {
          background: #141414; border: 1px solid #1e1e1e;
          border-radius: 14px; overflow: hidden;
          position: relative;
          /* sem pointer events de clique */
          pointer-events: none;
          user-select: none;
        }
        .prod-img-wrap { position: relative; height: 150px; background: #111; }
        .prod-img { width: 100%; height: 100%; object-fit: contain; padding: 10px; display: block; }
        .badge-plat {
          position: absolute; top: 8px; left: 8px;
          background: #0A0A0A; color: #fff;
          font-size: .56rem; font-weight: 900; letter-spacing: .06em;
          text-transform: uppercase; padding: 3px 7px; border-radius: 6px;
        }
        .badge-off {
          position: absolute; top: 8px; right: 8px;
          background: #22C55E; color: #fff;
          font-size: .62rem; font-weight: 900;
          padding: 3px 8px; border-radius: 20px;
        }
        .prod-body { padding: 10px 11px 13px; }
        .prod-nome {
          font-size: .74rem; font-weight: 700; color: #ddd; line-height: 1.35;
          margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .prod-de { font-size: .67rem; color: #444; text-decoration: line-through; margin-bottom: 2px; }
        .prod-por { font-size: 1rem; font-weight: 900; color: #fff; }

        /* skeleton */
        .skel {
          background: #141414; border: 1px solid #1e1e1e;
          border-radius: 14px; overflow: hidden;
        }
        .skel-img {
          height: 150px;
          background: linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);
          background-size: 200%;
          animation: shimmer 1.4s infinite;
        }
        .skel-body { padding: 10px 11px 13px; display: flex; flex-direction: column; gap: 7px; }
        .skel-line { height: 10px; background: #1e1e1e; border-radius: 5px; }

        /* aviso */
        .aviso {
          max-width: 440px; width: calc(100% - 36px);
          margin: 16px auto 0;
          background: #111; border: 1px solid #1a1a1a; border-radius: 12px;
          padding: 11px 13px; display: flex; align-items: flex-start; gap: 9px;
          animation: fadeUp .55s .18s ease both;
        }
        .aviso p { font-size: .74rem; color: #444; line-height: 1.45; }
        .aviso strong { color: #FFD700; }

        /* benefits */
        .benefits {
          max-width: 440px; width: calc(100% - 36px);
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; margin-top: 10px;
          animation: fadeUp .55s .22s ease both;
        }
        .benefit {
          background: #111; border: 1px solid #1a1a1a;
          border-radius: 12px; padding: 11px 11px;
          display: flex; align-items: center; gap: 8px;
        }
        .benefit span:first-child { font-size: 1rem; flex-shrink: 0; }
        .benefit-text { font-size: .73rem; font-weight: 700; color: #aaa; line-height: 1.3; }

        /* disclaimer */
        .disclaimer { font-size: .65rem; color: #2a2a2a; text-align: center; padding: 18px 24px 0; max-width: 360px; line-height: 1.5; }

        /* cta fixo */
        .cta-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          padding: 12px 18px 20px;
          background: linear-gradient(to top, #0A0A0A 60%, transparent);
          z-index: 100; display: flex; flex-direction: column; align-items: center; gap: 5px;
        }
        .cta-btn {
          width: 100%; max-width: 420px; background: #25D366; color: #fff; border: none;
          border-radius: 14px; padding: 17px 24px;
          font-size: 1.05rem; font-weight: 900; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          animation: pulse-glow 2.5s ease-in-out infinite;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          transition: background .15s;
        }
        .cta-btn:active { background: #1DA851; transform: scale(.98); }
        .cta-btn:disabled { opacity: .8; animation: none; }
        .cta-sub { font-size: .7rem; color: #2a2a2a; }
      `}</style>

      <div className="page">
        <div className="topbar">🔒 Grupo 100% Gratuito — Sem taxas, Sem planos</div>

        {/* Ticker dinâmico com nomes dos produtos carregados */}
        <div className="ticker-wrap">
          <div className="ticker-inner" aria-hidden="true">
            {[...Array(2)].map((_, ri) =>
              (produtos?.length ? produtos : [
                { produto: "Tênis Esportivo", preco_por: 267.22 },
                { produto: "Smartwatch IP67", preco_por: 109.64 },
                { produto: "Air Fryer 4,3L", preco_por: 268.00 },
                { produto: "Fone Bluetooth", preco_por: 57.00 },
              ]).map((p, i) => (
                <span key={`${ri}-${i}`} className="ticker-item">
                  🔥 {p.produto?.split(" ").slice(0, 4).join(" ")} — <em>{moeda(p.preco_por)}</em>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="logo-label"><span>Central</span> de Ofertas</div>
          <span className="fire">🔥</span>
          <h1>Promoções reais todos os dias no <em>WhatsApp</em></h1>
          <p>Entre grátis no grupo e receba cupons e descontos da <strong>Amazon, Mercado Livre e Shopee</strong> direto no seu celular.</p>
          <div className="badge-gratis">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Grátis para sempre
          </div>
        </div>

        {/* Produtos */}
        <div className="prods-wrap">
          <div className="prods-header">
            <div className="live-dot" />
            <span className="prods-title">Maiores descontos agora no grupo</span>
          </div>
          <div className="grid">
            {/* Loading */}
            {produtos === null && SKELETONS.map(i => (
              <div key={i} className="skel">
                <div className="skel-img" />
                <div className="skel-body">
                  <div className="skel-line" style={{ width: "85%" }} />
                  <div className="skel-line" style={{ width: "55%" }} />
                  <div className="skel-line" style={{ width: "60%", height: 14 }} />
                </div>
              </div>
            ))}

            {/* Produtos reais */}
            {produtos?.map((p, i) => {
              const off = p.desconto ? Math.round(Number(p.desconto)) : null;
              const bordColor = PLAT_BORDER[p.plataforma] || "#333";
              return (
                <div key={i} className="prod-card" style={{ borderColor: "#1e1e1e" }}>
                  <div className="prod-img-wrap">
                    <img
                      className="prod-img"
                      src={p.link_imagem || IMG_FALLBACK}
                      alt={p.produto}
                      onError={e => { e.target.src = IMG_FALLBACK; }}
                    />
                    <span className="badge-plat" style={{ borderLeft: `3px solid ${bordColor}` }}>
                      {nomePlat(p.plataforma)}
                    </span>
                    {off > 0 && <span className="badge-off">{off}% OFF</span>}
                  </div>
                  <div className="prod-body">
                    <div className="prod-nome">{p.produto}</div>
                    {p.preco_de && Number(p.preco_de) > Number(p.preco_por) && (
                      <div className="prod-de">De: {moeda(p.preco_de)}</div>
                    )}
                    <div className="prod-por">{moeda(p.preco_por)}</div>
                  </div>
                </div>
              );
            })}

            {/* Vazio */}
            {produtos?.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#333", fontSize: ".8rem", padding: "20px 0" }}>
                Carregando ofertas…
              </div>
            )}
          </div>
        </div>

        {/* Aviso call to action suave */}
        <div className="aviso">
          <span style={{ fontSize: "1rem", marginTop: 1 }}>📲</span>
          <p><strong>Essas e muitas outras ofertas</strong> chegam direto no seu WhatsApp, todos os dias. Entre no grupo e não perca nenhuma.</p>
        </div>

        {/* Benefits */}
        <div className="benefits">
          <div className="benefit"><span>✅</span><span className="benefit-text">Ofertas filtradas todo dia</span></div>
          <div className="benefit"><span>🎟️</span><span className="benefit-text">Cupons e descontos</span></div>
          <div className="benefit"><span>⚡</span><span className="benefit-text">Promoções relâmpago</span></div>
          <div className="benefit"><span>🔗</span><span className="benefit-text">Links seguros e oficiais</span></div>
        </div>

        <p className="disclaimer">Promoções, preços e cupons podem mudar a qualquer momento. Verifique sempre o valor final antes de comprar.</p>
      </div>

      {/* CTA fixo */}
      <div className="cta-bar">
        <button className="cta-btn" onClick={handleCTA} disabled={clicked}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          {clicked ? "Redirecionando…" : "🔥 Entrar no grupo grátis"}
        </button>
        <span className="cta-sub">Você será redirecionado para o WhatsApp</span>
      </div>
    </>
  );
}
