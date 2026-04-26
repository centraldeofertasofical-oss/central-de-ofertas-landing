"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

const WA_URL = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

const SUPA_URL = "https://zqkcsucactezbampkbps.supabase.co";
const SUPA_KEY = "sb_publishable_WVQdo69bguY3Bb55NP4sJA_le7IVszi";
const IMG_FALLBACK = "https://placehold.co/300x300/1a1a1a/333?text=Oferta";

// ── Query inteligente ────────────────────────────────────────
// Busca 30 produtos ativos com desconto > 0, ordenados por desconto DESC.
// Depois seleciona o melhor de cada plataforma (amazon, mercado_livre, shopee)
// + completa com os de maior desconto geral até ter 4 cards.
async function fetchMelhoresProdutos() {
  const params = new URLSearchParams({
    select: "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    desconto: "gt.5",           // só desconto real > 5%
    order: "desconto.desc,data_publicacao.desc",
    limit: "30",
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const validos = data.filter(
    p => p.produto && Number.isFinite(Number(p.preco_por)) && Number(p.preco_por) > 0
  );

  // 1 melhor de cada plataforma
  const plats = ["amazon", "mercado_livre", "shopee"];
  const selecionados = [];
  const usados = new Set();

  plats.forEach(plat => {
    const melhor = validos.find(p => p.plataforma === plat && !usados.has(p.produto));
    if (melhor) { selecionados.push(melhor); usados.add(melhor.produto); }
  });

  // completa até 4 com maiores descontos gerais não usados
  for (const p of validos) {
    if (selecionados.length >= 4) break;
    if (!usados.has(p.produto)) { selecionados.push(p); usados.add(p.produto); }
  }

  return selecionados.slice(0, 4);
}

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

const PLAT_COLOR = { amazon: "#FF9900", mercado_livre: "#FFE600", shopee: "#EE4D2D" };

export default function LandingPage() {
  const [produtos, setProdutos] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    sendEvent("page_view");
    fetchMelhoresProdutos().then(setProdutos).catch(() => setProdutos([]));
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900;1000&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body { font-family: 'Nunito', system-ui, sans-serif; background: #0b0b0b; color: #fff; min-height: 100dvh; overflow-x: hidden; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,.5), 0 4px 24px rgba(37,211,102,.25); }
          50%      { box-shadow: 0 0 0 10px rgba(37,211,102,0), 0 4px 24px rgba(37,211,102,.35); }
        }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ticker  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ── outer page ── */
        .page {
          min-height: 100dvh;
          padding-bottom: 108px;
          background:
            radial-gradient(ellipse 90% 50% at 50% -5%, rgba(255,215,0,.13) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 85%, rgba(37,211,102,.07) 0%, transparent 55%),
            #0b0b0b;
        }

        /* ── topbar ── */
        .topbar {
          background: linear-gradient(90deg,#c9a800,#FFD700,#c9a800);
          color: #0b0b0b; font-size: .7rem; font-weight: 900;
          letter-spacing: .09em; text-transform: uppercase;
          text-align: center; padding: 9px 16px;
        }

        /* ── ticker ── */
        .ticker-wrap { overflow: hidden; background: #0f0f0f; border-bottom: 1px solid #1a1a1a; padding: 7px 0; }
        .ticker-inner { display:flex; gap:52px; white-space:nowrap; animation:ticker 30s linear infinite; width:max-content; }
        .ticker-item { font-size:.68rem; font-weight:800; color:#2d2d2d; letter-spacing:.02em; }
        .ticker-item em { color: #FFD700; font-style:normal; }

        /* ── hero ── */
        .hero { text-align:center; padding: 36px 22px 0; max-width:520px; margin:0 auto; animation: fadeUp .5s ease both; }
        .logo-row { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:18px; }
        .logo-badge {
          background: #FFD700; color: #0b0b0b;
          font-size:.65rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
          padding:4px 10px; border-radius:30px;
        }
        .logo-name { font-size:.82rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#333; }
        .hero-fire { font-size:3rem; display:block; margin-bottom:14px; animation:float 3s ease-in-out infinite; }
        .hero h1 {
          font-size: clamp(1.7rem,7vw,2.4rem);
          font-weight:900; line-height:1.12; letter-spacing:-.025em;
          color:#fff;
        }
        .hero h1 em { color:#FFD700; font-style:normal; }
        .hero-sub { margin-top:13px; font-size:.93rem; color:#555; line-height:1.6; }
        .hero-sub strong { color:#999; }
        .gratis-badge {
          display:inline-flex; align-items:center; gap:7px; margin-top:16px;
          background:rgba(37,211,102,.1); border:1px solid rgba(37,211,102,.2);
          color:#25D366; border-radius:30px; padding:7px 16px;
          font-size:.78rem; font-weight:800; letter-spacing:.02em;
        }

        /* ── produtos section ── */
        .prods-section { max-width:520px; margin:32px auto 0; padding:0 18px; animation:fadeUp .55s .1s ease both; }
        .prods-header { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#22C55E; box-shadow:0 0 0 3px rgba(34,197,94,.2); flex-shrink:0; }
        .prods-title { font-size:.66rem; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:#2d2d2d; }

        /* ── grid 2x2 ── */
        .prods-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        /* ── product card ── */
        .prod-card {
          background:#111; border-radius:16px; overflow:hidden;
          border:1px solid #1c1c1c;
          position:relative;
          /* pointer-events:none — visual only */
          pointer-events:none; user-select:none;
          transition:border-color .2s;
        }
        .prod-card::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(135deg,rgba(255,215,0,.04) 0%,transparent 60%);
        }
        .prod-img-box { position:relative; height:148px; background:#0e0e0e; display:flex; align-items:center; justify-content:center; }
        .prod-img { max-width:100%; max-height:128px; object-fit:contain; padding:8px; display:block; }
        .badge-plat {
          position:absolute; top:8px; left:8px;
          background:#0b0b0b; color:#fff;
          font-size:.55rem; font-weight:900; letter-spacing:.07em; text-transform:uppercase;
          padding:3px 7px; border-radius:5px;
        }
        .badge-off {
          position:absolute; top:8px; right:8px;
          background:#22C55E; color:#fff;
          font-size:.65rem; font-weight:900; padding:3px 9px; border-radius:30px;
        }
        .prod-body { padding:10px 12px 13px; }
        .prod-nome {
          font-size:.75rem; font-weight:700; color:#ccc; line-height:1.35; margin-bottom:9px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .prod-de { font-size:.67rem; color:#333; text-decoration:line-through; margin-bottom:3px; }
        .prod-por { font-size:1.05rem; font-weight:900; color:#FFD700; }

        /* ── skeleton ── */
        .skel { background:#111; border-radius:16px; overflow:hidden; border:1px solid #1c1c1c; }
        .skel-img { height:148px; background:linear-gradient(90deg,#141414 25%,#1c1c1c 50%,#141414 75%); background-size:200%; animation:shimmer 1.4s infinite; }
        .skel-body { padding:10px 12px 13px; display:flex; flex-direction:column; gap:7px; }
        .skel-line { height:10px; background:#1a1a1a; border-radius:5px; }

        /* ── benefits bar ── */
        .benefits-bar {
          max-width:520px; margin:14px auto 0; padding:0 18px;
          animation:fadeUp .55s .18s ease both;
        }
        .benefits-inner {
          background:#0f0f0f; border:1px solid #1a1a1a; border-radius:14px;
          padding:14px 10px;
          display:grid; grid-template-columns:repeat(3,1fr); gap:6px; text-align:center;
        }
        .bene { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .bene-icon { font-size:1.1rem; }
        .bene-label { font-size:.62rem; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:#FFD700; }
        .bene-sub { font-size:.61rem; color:#2a2a2a; }

        /* ── CTA bar ── */
        .cta-section { max-width:520px; margin:16px auto 0; padding:0 18px; animation:fadeUp .55s .22s ease both; }
        .cta-main-btn {
          width:100%; background:#25D366; color:#fff; border:none; border-radius:14px;
          padding:17px 20px; font-size:1.05rem; font-weight:900; font-family:inherit;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
          animation:glow-pulse 2.5s ease-in-out infinite;
          -webkit-tap-highlight-color:transparent; touch-action:manipulation;
          transition:background .15s;
          letter-spacing:.01em;
        }
        .cta-main-btn:active { background:#1DA851; transform:scale(.98); }
        .cta-main-btn:disabled { opacity:.8; animation:none; }
        .cta-sub-text { text-align:center; font-size:.68rem; color:#222; margin-top:7px; }
        .cta-sub-row {
          display:flex; justify-content:center; align-items:center; gap:12px;
          margin-top:10px; font-size:.65rem; color:#222; font-weight:700; letter-spacing:.04em;
        }
        .cta-sub-row span { display:flex; align-items:center; gap:4px; }

        /* ── disclaimer ── */
        .disclaimer { font-size:.63rem; color:#1e1e1e; text-align:center; padding:14px 24px 0; max-width:380px; margin:0 auto; line-height:1.5; }

        /* ── fixed bottom CTA (mobile) ── */
        .fixed-cta {
          position:fixed; bottom:0; left:0; right:0; z-index:100;
          padding:10px 18px 20px;
          background:linear-gradient(to top,#0b0b0b 65%,transparent);
        }
        .fixed-btn {
          width:100%; max-width:480px; display:flex; align-items:center; justify-content:center; gap:9px;
          margin:0 auto; background:#25D366; color:#fff; border:none; border-radius:14px;
          padding:16px 24px; font-size:1rem; font-weight:900; font-family:inherit; cursor:pointer;
          animation:glow-pulse 2.5s ease-in-out infinite;
          -webkit-tap-highlight-color:transparent; touch-action:manipulation; transition:background .15s;
        }
        .fixed-btn:active { background:#1DA851; transform:scale(.98); }
        .fixed-btn:disabled { opacity:.8; animation:none; }
        .fixed-sub { text-align:center; font-size:.67rem; color:#222; margin-top:5px; }

        @media (min-width:480px) {
          .prods-grid { grid-template-columns:repeat(4,1fr); }
          .prod-img-box { height:130px; }
          .skel-img { height:130px; }
        }
      `}</style>

      <div className="page">
        {/* Topbar */}
        <div className="topbar">🔒 Grupo 100% Gratuito — Sem taxas • Sem planos</div>

        {/* Ticker */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker-inner">
            {[...Array(2)].map((_, ri) =>
              (produtos?.length ? produtos : [
                { produto: "Tênis Esportivo", preco_por: 267.22 },
                { produto: "Smartwatch", preco_por: 109.64 },
                { produto: "Air Fryer", preco_por: 268.00 },
                { produto: "Fone Bluetooth", preco_por: 57.00 },
              ]).map((p, i) => (
                <span key={`${ri}-${i}`} className="ticker-item">
                  🔥 {(p.produto || "").split(" ").slice(0, 5).join(" ")} — <em>{moeda(p.preco_por)}</em>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="logo-row">
            <span className="logo-badge">🛍️ Central de Ofertas</span>
            <span className="logo-name">GRÁTIS</span>
          </div>
          <span className="hero-fire">🔥</span>
          <h1>Promoções reais todos os dias no <em>WhatsApp</em></h1>
          <p className="hero-sub">
            Entre grátis no grupo e receba cupons e descontos da{" "}
            <strong>Amazon, Mercado Livre e Shopee</strong> direto no seu celular.
          </p>
          <div className="gratis-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Grátis para sempre
          </div>
        </div>

        {/* Produtos */}
        <div className="prods-section">
          <div className="prods-header">
            <div className="live-dot" />
            <span className="prods-title">Maiores descontos agora no grupo</span>
          </div>
          <div className="prods-grid">
            {loading
              ? [0,1,2,3].map(i => (
                  <div key={i} className="skel">
                    <div className="skel-img" />
                    <div className="skel-body">
                      <div className="skel-line" style={{width:"88%"}} />
                      <div className="skel-line" style={{width:"55%"}} />
                      <div className="skel-line" style={{width:"65%",height:14}} />
                    </div>
                  </div>
                ))
              : cards.map((p, i) => {
                  const off = p.desconto ? Math.round(Number(p.desconto)) : null;
                  const platColor = PLAT_COLOR[p.plataforma] || "#555";
                  return (
                    <div key={i} className="prod-card">
                      <div className="prod-img-box">
                        <img
                          className="prod-img"
                          src={p.link_imagem || IMG_FALLBACK}
                          alt={p.produto}
                          onError={e => { e.target.src = IMG_FALLBACK; }}
                        />
                        <span className="badge-plat" style={{ borderBottom: `2px solid ${platColor}` }}>
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
                })
            }
          </div>
        </div>

        {/* Benefits bar */}
        <div className="benefits-bar">
          <div className="benefits-inner">
            <div className="bene">
              <span className="bene-icon">🔶</span>
              <span className="bene-label">Ofertas filtradas</span>
              <span className="bene-sub">Só o que vale a pena!</span>
            </div>
            <div className="bene">
              <span className="bene-icon">%</span>
              <span className="bene-label">Descontos reais</span>
              <span className="bene-sub">Economize todos os dias</span>
            </div>
            <div className="bene">
              <span className="bene-icon">⚡</span>
              <span className="bene-label">Chega na hora</span>
              <span className="bene-sub">Direto no seu WhatsApp</span>
            </div>
          </div>
        </div>

        {/* CTA inline */}
        <div className="cta-section">
          <button className="cta-main-btn" onClick={handleCTA} disabled={clicked}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {clicked ? "Redirecionando…" : "🔥 ENTRAR NO GRUPO GRÁTIS"}
          </button>
          <div className="cta-sub-row">
            <span>🔒 100% GRATUITO</span>
            <span>• SEM TAXAS</span>
            <span>• SEM PLANOS</span>
          </div>
        </div>

        <p className="disclaimer">Promoções, preços e cupons podem mudar a qualquer momento. Verifique sempre o valor final antes de comprar.</p>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed-cta">
        <button className="fixed-btn" onClick={handleCTA} disabled={clicked}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          {clicked ? "Redirecionando…" : "🔥 Entrar no grupo grátis"}
        </button>
        <p className="fixed-sub">Você será redirecionado para o WhatsApp</p>
      </div>
    </>
  );
}
