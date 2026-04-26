"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

export default function LandingPage() {
  const [clicked, setClicked] = useState(false);

  const WA_URL = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
    "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

  useEffect(() => {
    sendEvent("page_view");
  }, []);

  async function handleCTA() {
    if (clicked) return;
    setClicked(true);
    await sendEvent("group_click");
    window.location.href = WA_URL;
  }

  return (
    <>
      <style>{`
        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100dvh;
          padding: 0 0 120px;
          position: relative;
          overflow: hidden;
        }

        /* ── Hero noise bg ── */
        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,215,0,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(37,211,102,0.08) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Top bar ── */
        .topbar {
          width: 100%;
          background: var(--yellow);
          color: var(--black);
          text-align: center;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 10px 16px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.4s ease both;
        }

        /* ── Logo zone ── */
        .logo-zone {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 32px 24px 0;
          animation: fadeUp 0.5s 0.1s ease both;
        }

        .logo-wordmark {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--white-muted);
        }

        .logo-wordmark span {
          color: var(--yellow);
        }

        /* ── Badge ── */
        .badge-free {
          display: inline-block;
          background: var(--green-wa);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 40px;
          margin-top: 14px;
          animation: badge-pop 0.5s 0.3s cubic-bezier(.34,1.56,.64,1) both;
          transform: rotate(-3deg);
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 36px 24px 0;
          max-width: 420px;
          width: 100%;
          animation: fadeUp 0.6s 0.15s ease both;
        }

        .hero-emoji {
          font-size: 3.2rem;
          display: block;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        .hero h1 {
          font-size: clamp(1.55rem, 6vw, 2rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--white);
        }

        .hero h1 .highlight {
          color: var(--yellow);
        }

        .hero p {
          font-size: 1rem;
          line-height: 1.55;
          color: var(--white-muted);
          margin-top: 16px;
          font-weight: 400;
        }

        /* ── Benefits card ── */
        .benefits {
          position: relative;
          z-index: 1;
          background: var(--gray-light);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: var(--radius);
          padding: 24px 20px;
          margin: 32px 24px 0;
          max-width: 420px;
          width: calc(100% - 48px);
          animation: fadeUp 0.6s 0.25s ease both;
        }

        .benefits-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--yellow);
          margin-bottom: 16px;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .benefit-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .benefit-item:first-of-type {
          padding-top: 0;
        }

        .benefit-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .benefit-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--white);
          line-height: 1.35;
        }

        .benefit-sub {
          font-size: 0.82rem;
          color: var(--gray);
          font-weight: 400;
          margin-top: 2px;
        }

        /* ── Social proof ── */
        .social-proof {
          position: relative;
          z-index: 1;
          text-align: center;
          margin: 24px 24px 0;
          max-width: 420px;
          width: calc(100% - 48px);
          animation: fadeUp 0.6s 0.35s ease both;
        }

        .stars {
          color: var(--yellow);
          font-size: 1.1rem;
          letter-spacing: 2px;
        }

        .social-proof p {
          font-size: 0.85rem;
          color: var(--gray);
          margin-top: 6px;
        }

        /* ── Fixed CTA bar ── */
        .cta-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 20px 24px;
          background: linear-gradient(to top, var(--black) 70%, transparent);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .cta-btn {
          width: 100%;
          max-width: 420px;
          background: var(--green-wa);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          padding: 18px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s, transform 0.1s;
          animation: pulse-glow 2.5s ease-in-out infinite;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .cta-btn:active {
          background: var(--green-wa-dark);
          transform: scale(0.98);
        }

        .cta-btn.loading {
          opacity: 0.85;
          animation: none;
        }

        .cta-sub {
          font-size: 0.78rem;
          color: var(--gray);
          text-align: center;
        }

        /* ── Footer ── */
        .footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 32px 24px 8px;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.25);
          max-width: 420px;
          line-height: 1.5;
          animation: fadeUp 0.6s 0.45s ease both;
        }
      `}</style>

      <div className="page">
        {/* Top bar */}
        <div className="topbar">
          🔒 GRUPO 100% GRATUITO — SEM TAXAS, SEM PLANOS
        </div>

        {/* Logo */}
        <div className="logo-zone">
          <div className="logo-wordmark">
            <span>Central</span> de Ofertas
          </div>
          <div className="badge-free">✓ Grátis para sempre</div>
        </div>

        {/* Hero */}
        <section className="hero">
          <span className="hero-emoji">🔥</span>
          <h1>
            Promoções reais todos os dias no{" "}
            <span className="highlight">WhatsApp</span>
          </h1>
          <p>
            Entre grátis no grupo e receba cupons e descontos da{" "}
            <strong>Amazon, Mercado Livre e Shopee</strong> direto no seu
            celular.
          </p>
        </section>

        {/* Benefits */}
        <div className="benefits">
          <div className="benefits-title">O que você recebe no grupo</div>

          <div className="benefit-item">
            <span className="benefit-icon">✅</span>
            <div>
              <div className="benefit-text">Ofertas filtradas</div>
              <div className="benefit-sub">Só promoções reais, sem enrolação</div>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">🎟️</span>
            <div>
              <div className="benefit-text">Cupons e descontos</div>
              <div className="benefit-sub">Amazon, Mercado Livre e Shopee</div>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <div>
              <div className="benefit-text">Promoções relâmpago</div>
              <div className="benefit-sub">Avisos imediatos antes de acabar</div>
            </div>
          </div>

          <div className="benefit-item">
            <span className="benefit-icon">🔗</span>
            <div>
              <div className="benefit-text">Links seguros</div>
              <div className="benefit-sub">Direto das plataformas oficiais</div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="social-proof">
          <div className="stars">★★★★★</div>
          <p>Grupo ativo com ofertas todos os dias</p>
        </div>

        {/* Footer */}
        <footer className="footer">
          Promoções, preços e cupons podem mudar a qualquer momento.
          <br />
          Verifique sempre o valor final antes de comprar.
        </footer>
      </div>

      {/* Fixed CTA */}
      <div className="cta-bar">
        <button
          className={`cta-btn${clicked ? " loading" : ""}`}
          onClick={handleCTA}
          disabled={clicked}
          aria-label="Entrar no grupo gratuito do WhatsApp"
        >
          {clicked ? (
            "Redirecionando…"
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L.057 23.885a.5.5 0 0 0 .619.612l6.197-1.62A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.52-5.178-1.426l-.368-.217-3.818.999 1.017-3.717-.236-.38A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              🔥 Entrar no grupo grátis
            </>
          )}
        </button>
        <span className="cta-sub">Você será redirecionado para o WhatsApp</span>
      </div>
    </>
  );
}
