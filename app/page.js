"use client";

import { useEffect, useState, useRef } from "react";
import { sendEvent } from "../lib/tracking";

const INVITE_CODE = "K7y2RlgUuAc0Xepn0qHYBD";
const WHATSAPP_GROUP_URL = `https://chat.whatsapp.com/${INVITE_CODE}`;
const DELAY_MS = 4000; // tempo até o redirecionamento automático

export default function Page() {
  const [indo, setIndo] = useState(false);
  const [teste, setTeste] = useState(false);
  const foi = useRef(false);

  // dispara o redirecionamento pro grupo (uma vez só)
  function irProGrupo() {
    if (foi.current) return;
    foi.current = true;
    setIndo(true);
    if (typeof window !== "undefined" && window.fbq) window.fbq("track", "Lead");
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    // no navegador interno do FB/IG no Android, força abrir o app WhatsApp direto
    if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram/i.test(ua) && /Android/i.test(ua)) {
      window.location.href = `intent://chat.whatsapp.com/${INVITE_CODE}#Intent;scheme=https;package=com.whatsapp;end`;
      setTimeout(() => { window.location.href = WHATSAPP_GROUP_URL; }, 1500);
    } else {
      window.location.href = WHATSAPP_GROUP_URL;
    }
  }

  useEffect(() => {
    sendEvent("page_view");
    const params = new URLSearchParams(window.location.search);
    if (params.has("preview") || params.has("teste")) { setTeste(true); return; } // modo de teste: não redireciona
    const t = setTimeout(irProGrupo, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="wrap">
      <div className="aurora"><span className="b b1" /><span className="b b2" /><span className="b b3" /></div>

      <div className="card">
        <span className="logo" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="#FFD400" />
            <path d="M14.5 19.5h19l1.3 15a2.5 2.5 0 0 1-2.5 2.7H15.7a2.5 2.5 0 0 1-2.5-2.7z" fill="#141414" />
            <path d="M18.2 19.5v-1.3a5.8 5.8 0 0 1 11.6 0v1.3" stroke="#141414" strokeWidth="2.6" />
            <path d="M18.6 27.9l3.5 3.6 7.3-8" stroke="#FFD400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1>Tudo certo! 🎉</h1>
        <p className="sub">
          Estamos te levando para o <b>grupo de ofertas no WhatsApp</b> — achadinhos e cupons
          da Amazon, Mercado Livre e Shopee, todos os dias. É grátis!
        </p>

        <div className="loadWrap" role="status" aria-live="polite">
          <span className="spin" />
          <span className="loadTxt">{teste ? "Modo de teste — não vai redirecionar" : indo ? "Abrindo o WhatsApp…" : "Redirecionando você…"}</span>
        </div>
        <div className="bar"><span className="fill" /></div>

        <a className="cta" href={WHATSAPP_GROUP_URL} onClick={(e) => { e.preventDefault(); irProGrupo(); }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.4.9 1.4 1.9 2 .8.5 1.1.5 1.4.4.3-.1.5-.5.7-.8.2-.3.4-.2.6-.1l1.7.8c.3.1.5.2.5.4.1.2.1.8-.1 1.2Z"/></svg>
          Entrar no grupo agora
        </a>
        <p className="fallback">Não foi redirecionado? Toque no botão acima. 👆</p>
        <p className="trust">grátis · sem spam · sair quando quiser</p>
      </div>

      <footer className="foot">
        <a href="/privacidade">Privacidade</a><span>·</span><a href="/exclusao-de-dados">Exclusão de dados</a>
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { background: #0b0e1c; color: #eef1f5; font-family: var(--font-body), system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
      `}</style>

      <style jsx>{`
        .wrap { position: relative; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 18px; overflow: hidden; }
        .aurora { position: fixed; inset: 0; z-index: 0; overflow: hidden; background: linear-gradient(160deg, #0f1230, #0c1626 50%, #0a1a1c); }
        .b { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .4; }
        .b1 { width: 60vw; height: 60vw; background: #17d15f; top: -20%; left: -15%; animation: f 20s ease-in-out infinite; }
        .b2 { width: 50vw; height: 50vw; background: #ffce1f; bottom: -18%; right: -12%; opacity: .28; animation: f 26s ease-in-out infinite reverse; }
        .b3 { width: 46vw; height: 46vw; background: #16d19a; bottom: 10%; left: 20%; opacity: .3; animation: f 23s ease-in-out infinite; }
        @keyframes f { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,5vh) scale(1.12); } }

        .card { position: relative; z-index: 2; width: 100%; max-width: 440px; text-align: center;
          padding: 40px 26px 34px; border-radius: 26px; background: rgba(255,255,255,.06);
          border: 1.5px solid rgba(255,255,255,.14); backdrop-filter: blur(12px); box-shadow: 0 30px 70px rgba(0,0,0,.45); }
        .logo svg { width: 62px; height: 62px; filter: drop-shadow(0 6px 20px rgba(255,212,0,.4)); }
        h1 { margin: 16px 0 10px; font-family: var(--font-display), sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -.5px; }
        .sub { margin: 0 auto 24px; max-width: 360px; color: #c7ccd8; font-size: 16px; line-height: 1.5; }
        .sub b { color: #fff; }

        .loadWrap { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 14px; }
        .spin { width: 20px; height: 20px; border-radius: 50%; border: 3px solid rgba(37,211,102,.3); border-top-color: #25d366; animation: sp .8s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .loadTxt { color: #aeb4c2; font-size: 14px; }
        .bar { height: 6px; border-radius: 999px; background: rgba(255,255,255,.12); overflow: hidden; margin-bottom: 26px; }
        .fill { display: block; height: 100%; width: 0; border-radius: 999px; background: linear-gradient(90deg, #34ef78, #12b85a); animation: grow ${DELAY_MS}ms linear forwards; }
        @keyframes grow { from { width: 0; } to { width: 100%; } }

        .cta { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%;
          min-height: 60px; padding: 16px 26px; border-radius: 15px; color: #04220f; text-decoration: none;
          background: linear-gradient(180deg, #34ef78, #12b85a); border: 2px solid rgba(255,255,255,.35);
          font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 18px;
          box-shadow: 0 12px 34px rgba(37,211,102,.4); transition: transform .15s ease; }
        .cta:active { transform: scale(.98); }
        .fallback { margin: 12px 0 0; color: #9aa2b2; font-size: 13px; }
        .trust { margin: 16px 0 0; color: #8891a2; font-size: 12.5px; }

        .foot { position: relative; z-index: 2; margin-top: 22px; display: flex; gap: 8px; font-size: 12.5px; color: #667; }
        .foot a { color: #25d366; text-decoration: none; }
        .foot span { opacity: .6; }

        @media (prefers-reduced-motion: reduce) { .b, .spin, .fill { animation: none !important; } .fill { width: 100%; } }
      `}</style>
    </main>
  );
}
