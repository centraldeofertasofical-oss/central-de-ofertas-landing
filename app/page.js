"use client";

import { useEffect, useRef } from "react";
import { sendEvent } from "../lib/tracking";
import { DEALS } from "./deals";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

const PASSOS = [
  { n: "01", t: "Entre no grupo", d: "Um toque e você está dentro. Grátis, sem cadastro." },
  { n: "02", t: "Receba os achados", d: "Ofertas selecionadas por IA, várias por dia." },
  { n: "03", t: "Compre com desconto", d: "Pelos links oficiais da Amazon, ML e Shopee." },
];

const FEATS = [
  ["🎯", "Curadoria por IA", "Nosso sistema filtra milhares de ofertas e manda só as que valem a pena."],
  ["🎟️", "Cupons exclusivos", "Códigos e descontos que a maioria das pessoas nem descobre."],
  ["⚡", "Na hora, no celular", "Direto no WhatsApp. Sem app, sem cadastro, sem enrolação."],
  ["🆓", "Sempre grátis", "Nunca cobramos nada. Você economiza, a gente cresce junto."],
];

export default function Page() {
  const spot = useRef(null);

  useEffect(() => {
    sendEvent("page_view");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    const move = (e) => { if (spot.current) spot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("pointermove", move); };
  }, []);

  function join() {
    sendEvent("group_click");
    if (typeof window !== "undefined" && window.fbq) window.fbq("track", "Lead");
  }
  function tilt(e) {
    const c = e.currentTarget, r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    c.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    c.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
    c.style.setProperty("--mx", `${px * 100}%`);
    c.style.setProperty("--my", `${py * 100}%`);
  }
  function untilt(e) { const c = e.currentTarget; c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); }

  const CTA = ({ label, className = "" }) => (
    <a className={`cta ${className}`} href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer" onClick={join}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.4.9 1.4 1.9 2 .8.5 1.1.5 1.4.4.3-.1.5-.5.7-.8.2-.3.4-.2.6-.1l1.7.8c.3.1.5.2.5.4.1.2.1.8-.1 1.2Z"/></svg>
      <span>{label}</span>
      <span className="shine" />
    </a>
  );

  const Logo = ({ small }) => (
    <span className={`logo ${small ? "sm" : ""}`}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="#FFD400" />
        <path d="M14.5 19.5h19l1.3 15a2.5 2.5 0 0 1-2.5 2.7H15.7a2.5 2.5 0 0 1-2.5-2.7z" fill="#141414" />
        <path d="M18.2 19.5v-1.3a5.8 5.8 0 0 1 11.6 0v1.3" stroke="#141414" strokeWidth="2.6" />
        <path d="M18.6 27.9l3.5 3.6 7.3-8" stroke="#FFD400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="wm"><b>CENTRAL</b><em>DE OFERTAS</em></span>
    </span>
  );

  return (
    <main className="page">
      {/* fundo aurora animado + brilho do cursor */}
      <div className="aurora">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" /><span className="blob b4" />
        <span className="grid" />
      </div>
      <div ref={spot} className="spot" />

      <div className="floatBar"><CTA label="Entrar no grupo grátis" className="floatCta" /></div>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="brandTop"><Logo /><span className="tag">ofertas oficiais e seguras</span></div>
          <h1>Ofertas reais, curadas por <span className="grad">inteligência artificial</span>, direto no seu WhatsApp.</h1>
          <p className="sub">
            Achadinhos, cupons e as melhores promoções da <b>Amazon</b>, <b>Mercado Livre</b> e <b>Shopee</b>.
            A gente garimpa milhares de ofertas — você recebe só as que valem a pena.
          </p>
          <div className="heroCta">
            <CTA label="ENTRAR NO GRUPO GRÁTIS" className="hot" />
            <div className="trust"><span className="dot" /> grátis · sem spam · sair quando quiser</div>
          </div>
        </div>
      </header>

      {/* LETREIRO DE OFERTAS */}
      <div className="marquee reveal">
        <div className="track">
          {[...DEALS, ...DEALS].map((d, i) => (
            <span className="mItem" key={i}>🔥 {d.nome} <b>−{d.off}%</b></span>
          ))}
        </div>
      </div>

      {/* OFERTAS REAIS */}
      <section className="sec">
        <div className="head reveal">
          <span className="eyebrow">achados de hoje</span>
          <h2>Promoções que já rolaram no grupo</h2>
          <p className="lead">Produtos reais, com desconto real. Passe o mouse nos cards 👇</p>
        </div>
        <div className="deals">
          {DEALS.map((d, i) => (
            <article className="deal reveal" key={i} style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              onMouseMove={tilt} onMouseLeave={untilt}>
              <div className="dealIn">
                <div className="badgeRow">
                  <span className="store">{d.loja}</span>
                  <span className="off">−{d.off}%</span>
                </div>
                <div className="shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.img} alt={d.nome} loading="lazy" />
                </div>
                <p className="name">{d.nome}</p>
                <div className="price"><s>R$ {d.de}</s><strong>R$ {d.por}</strong></div>
              </div>
            </article>
          ))}
        </div>
        <div className="center reveal"><CTA label="VER OFERTAS NO WHATSAPP" className="hot" /></div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="sec">
        <div className="head reveal"><span className="eyebrow">simples assim</span><h2>Como funciona</h2></div>
        <div className="steps">
          {PASSOS.map((p, i) => (
            <div className="step reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="sn">{p.n}</span><strong>{p.t}</strong><span className="sd">{p.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* POR QUE */}
      <section className="sec">
        <div className="head reveal"><span className="eyebrow">por que entrar</span><h2>Feito pra você economizar</h2></div>
        <div className="feats">
          {FEATS.map((f, i) => (
            <div className="feat reveal" key={i} style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
              <span className="fi">{f[0]}</span><div><strong>{f[1]}</strong><span>{f[2]}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL */}
      <section className="finale reveal">
        <div className="fbox">
          <div className="fire">🔥</div>
          <h2>As melhores ofertas somem rápido.</h2>
          <p>Entre agora e não perca o próximo achado. Leva 5 segundos e é de graça.</p>
          <CTA label="QUERO ENTRAR NO GRUPO GRÁTIS" className="hot big" />
        </div>
      </section>

      <footer className="foot">
        <div className="fbrand"><Logo /></div>
        <div className="footLinks">
          <a href="/privacidade">Política de Privacidade</a>
          <span>·</span>
          <a href="/exclusao-de-dados">Exclusão de dados</a>
        </div>
        <p>
          Não vendemos produtos. Apenas divulgamos ofertas e cupons de e-commerce por meio de links oficiais das
          plataformas. Este site não é afiliado oficialmente às marcas mencionadas — Amazon, Mercado Livre e Shopee
          são marcas de seus respectivos proprietários. Os preços podem variar; confira sempre na loja oficial.
        </p>
      </footer>

      <style jsx global>{`
        :root { --grn:#25d366; --grn2:#12b85a; --ink:#0b0e1c; --line:rgba(255,255,255,.14); }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { background: var(--ink); color: #eef1f5; font-family: var(--font-body), system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
        .reveal.in { opacity: 1; transform: none; }
      `}</style>

      <style jsx>{`
        .page { position: relative; z-index: 1; }
        h1, h2, .chip, .sn, .price strong, .off, .eyebrow, .fbrand, .mItem b { font-family: var(--font-display), system-ui, sans-serif; }

        /* AURORA de fundo (colorida, animada) */
        .aurora { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
          background: linear-gradient(160deg, #0f1230 0%, #0c1626 45%, #0a1a1c 100%); }
        .aurora::after { content: ""; position: absolute; inset: 0; background: rgba(8,10,20,.5); }
        .blob { position: absolute; border-radius: 50%; filter: blur(95px); opacity: .38; }
        .b1 { width: 55vw; height: 55vw; background: #17d15f; top: -18%; left: -14%; animation: d1 22s ease-in-out infinite; }
        .b2 { width: 52vw; height: 52vw; background: #ffce1f; top: 6%; right: -18%; animation: d2 27s ease-in-out infinite; opacity:.3; }
        .b3 { width: 46vw; height: 46vw; background: #ff9d2f; bottom: -20%; left: 12%; animation: d3 30s ease-in-out infinite; opacity:.3; }
        .b4 { width: 42vw; height: 42vw; background: #16d19a; bottom: 4%; right: 6%; animation: d4 25s ease-in-out infinite; }
        @keyframes d1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(9vw,7vh) scale(1.15)} }
        @keyframes d2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-8vw,9vh) scale(1.1)} }
        @keyframes d3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(7vw,-8vh) scale(1.18)} }
        @keyframes d4 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-9vw,-6vh) scale(1.12)} }
        .grid { position: absolute; inset: 0; opacity: .5;
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 48px 48px; mask-image: radial-gradient(90% 70% at 50% 30%, #000, transparent 78%); }
        .spot { position: fixed; top: 0; left: 0; z-index: 0; width: 420px; height: 420px; margin: -210px 0 0 -210px; pointer-events: none;
          background: radial-gradient(circle, rgba(37,211,102,.16), transparent 62%); }

        /* HERO */
        .hero { position: relative; padding: 62px 20px 46px; }
        .wrap { position: relative; z-index: 2; max-width: 880px; margin: 0 auto; text-align: center; }
        .brandTop { display: inline-flex; flex-direction: column; align-items: center; gap: 9px; padding: 12px 22px; border-radius: 18px;
          background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,206,31,.4); box-shadow: 0 0 30px rgba(255,206,31,.14); backdrop-filter: blur(8px); }
        .logo { display: inline-flex; align-items: center; gap: 11px; }
        .logo svg { width: 46px; height: 46px; filter: drop-shadow(0 4px 16px rgba(255,212,0,.4)); }
        .logo.sm svg { width: 38px; height: 38px; }
        .wm { display: flex; flex-direction: column; text-align: left; font-family: var(--font-display), sans-serif; line-height: 1; }
        .wm b { font-size: 20px; letter-spacing: 1px; color: #FFD400; }
        .wm em { font-style: normal; font-size: 10.5px; letter-spacing: 3.5px; color: #eef1f5; margin-top: 3px; }
        .tag { font-size: 10.5px; letter-spacing: 2px; text-transform: uppercase; color: #ffce33; }
        h1 { margin: 22px auto 18px; max-width: 780px; font-size: clamp(33px, 6.5vw, 60px); line-height: 1.05; font-weight: 700; letter-spacing: -1px; }
        .grad { background: linear-gradient(100deg, #25d366, #7ef0a6 42%, #ffce1f); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .sub { max-width: 600px; margin: 0 auto 30px; color: #c2c8d4; font-size: clamp(16px, 3.5vw, 20px); line-height: 1.5; }
        .sub b { color: #fff; font-weight: 600; }
        .heroCta { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .trust { display: inline-flex; align-items: center; gap: 8px; color: #9aa2b2; font-size: 13.5px; }
        .trust .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--grn); animation: blink 1.9s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* CTA — grande, pulsando, brilhoso */
        .cta { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 11px;
          min-height: 62px; padding: 16px 34px; border-radius: 16px; color: #04220f; text-decoration: none;
          background: linear-gradient(180deg, #34ef78, var(--grn2)); border: 2px solid rgba(255,255,255,.35);
          font-family: var(--font-display), sans-serif; font-weight: 700; font-size: clamp(16px, 3.8vw, 20px); letter-spacing: .3px;
          overflow: hidden; transition: transform .15s ease; }
        .cta.hot { animation: pump 2.1s ease-in-out infinite; }
        @keyframes pump {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,211,102,.55), 0 14px 40px rgba(37,211,102,.35); }
          50% { transform: scale(1.04); box-shadow: 0 0 44px 10px rgba(37,211,102,.5), 0 18px 52px rgba(37,211,102,.5); }
        }
        .cta:hover { transform: translateY(-2px) scale(1.02); }
        .cta:active { transform: scale(.98); }
        .cta .shine { position: absolute; top: 0; left: -75%; width: 45%; height: 100%; transform: skewX(-18deg);
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.6), transparent); animation: shine 2.8s infinite; }
        @keyframes shine { 0%{left:-75%} 55%,100%{left:140%} }
        .cta.big { min-height: 70px; padding: 20px 40px; font-size: clamp(17px, 4.2vw, 23px); }

        /* LETREIRO */
        .marquee { position: relative; margin: 6px 0 8px; padding: 12px 0; overflow: hidden;
          border-top: 1.5px solid var(--line); border-bottom: 1.5px solid var(--line); background: rgba(255,255,255,.03); }
        .track { display: inline-flex; white-space: nowrap; gap: 34px; animation: roll 32s linear infinite; will-change: transform; }
        @keyframes roll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mItem { font-size: 14.5px; color: #cfd4e0; }
        .mItem b { color: #ffce33; }

        /* seções */
        .sec { position: relative; z-index: 2; max-width: 1080px; margin: 0 auto; padding: 62px 20px 6px; }
        .head { text-align: center; margin-bottom: 32px; }
        .eyebrow { display: inline-block; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: #ffce33;
          margin-bottom: 12px; padding: 5px 14px; border: 1.5px solid rgba(255,206,51,.45); border-radius: 999px; }
        h2 { margin: 0; font-size: clamp(26px, 5.2vw, 42px); font-weight: 700; letter-spacing: -.6px; line-height: 1.08; }
        .lead { max-width: 540px; margin: 12px auto 0; color: #aab0be; font-size: 16px; line-height: 1.5; }

        /* DEALS — cards com borda + 3D no mouse */
        .deals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .deal { perspective: 800px; }
        .dealIn { position: relative; padding: 14px; border-radius: 20px; background: rgba(255,255,255,.055);
          border: 1.5px solid var(--line); backdrop-filter: blur(10px);
          transform: rotateX(var(--rx,0)) rotateY(var(--ry,0)); transform-style: preserve-3d;
          transition: transform .18s ease, border-color .25s ease, box-shadow .25s ease; }
        .deal:hover .dealIn { border-color: rgba(37,211,102,.65); box-shadow: 0 30px 60px rgba(0,0,0,.45), 0 0 40px rgba(37,211,102,.22); }
        .dealIn::after { content: ""; position: absolute; inset: 0; border-radius: 20px; pointer-events: none; opacity: 0; transition: opacity .25s;
          background: radial-gradient(240px at var(--mx,50%) var(--my,50%), rgba(37,211,102,.18), transparent 60%); }
        .deal:hover .dealIn::after { opacity: 1; }
        .badgeRow { position: absolute; top: 22px; left: 22px; right: 22px; z-index: 3; display: flex; justify-content: space-between; }
        .store { padding: 5px 11px; border-radius: 999px; background: rgba(6,10,16,.8); border: 1.5px solid var(--line); font-size: 10.5px; font-weight: 700; letter-spacing: .5px; }
        .off { padding: 5px 12px; border-radius: 999px; background: linear-gradient(180deg, #ffd93b, #ffc400); color: #141414; font-size: 13px; font-weight: 700; border: 1.5px solid rgba(255,255,255,.4); box-shadow: 0 4px 16px rgba(255,200,0,.5); }
        .shot { aspect-ratio: 1/1; border-radius: 14px; background: linear-gradient(180deg,#fff,#eef0f2); border: 1px solid rgba(255,255,255,.5);
          display: flex; align-items: center; justify-content: center; padding: 20px; overflow: hidden; }
        .shot img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
        .name { margin: 14px 4px 12px; font-size: 15px; font-weight: 600; line-height: 1.3; min-height: 40px; }
        .price { display: flex; align-items: baseline; gap: 10px; padding: 0 4px 4px; }
        .price s { color: #838a98; font-size: 14px; }
        .price strong { color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -.5px; }
        .center { text-align: center; margin-top: 34px; }

        /* steps */
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .step { padding: 26px 22px; border-radius: 18px; background: rgba(255,255,255,.05); border: 1.5px solid var(--line); transition: border-color .25s, transform .25s; }
        .step:hover { border-color: rgba(37,211,102,.5); transform: translateY(-4px); }
        .sn { font-size: 30px; font-weight: 700; color: transparent; -webkit-text-stroke: 1.5px rgba(37,211,102,.7); display: block; margin-bottom: 12px; }
        .step strong { display: block; font-size: 18px; margin-bottom: 6px; }
        .sd { color: #aab0be; font-size: 14.5px; line-height: 1.45; }

        /* feats */
        .feats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .feat { display: flex; gap: 14px; padding: 22px 20px; border-radius: 18px; background: rgba(255,255,255,.05); border: 1.5px solid var(--line); transition: border-color .25s, transform .25s; }
        .feat:hover { border-color: rgba(37,211,102,.5); transform: translateY(-4px); }
        .fi { font-size: 26px; line-height: 1.2; }
        .feat strong { display: block; font-size: 17px; margin-bottom: 5px; }
        .feat span { color: #aab0be; font-size: 14.5px; line-height: 1.45; }

        /* finale */
        .finale { position: relative; z-index: 2; max-width: 800px; margin: 46px auto 0; padding: 0 20px; }
        .fbox { position: relative; padding: 54px 26px 58px; text-align: center; border-radius: 26px;
          background: rgba(37,211,102,.06); border: 2px solid rgba(37,211,102,.4); box-shadow: 0 0 60px rgba(37,211,102,.12); overflow: hidden; }
        .fire { font-size: 50px; margin-bottom: 6px; }
        .fbox h2 { margin-bottom: 12px; }
        .fbox p { color: #cdd2dc; font-size: 17px; max-width: 500px; margin: 0 auto 26px; }

        /* footer */
        .foot { position: relative; z-index: 2; border-top: 1.5px solid var(--line); margin-top: 40px; padding: 34px 22px 130px; text-align: center; background: rgba(7,9,16,.72); }
        .fbrand { display: flex; justify-content: center; margin-bottom: 16px; }
        .footLinks { display: flex; justify-content: center; gap: 10px; margin-bottom: 14px; font-size: 13.5px; }
        .footLinks a { color: #25d366; text-decoration: none; }
        .footLinks a:hover { text-decoration: underline; }
        .footLinks span { color: #667; }
        .foot p { max-width: 720px; margin: 0 auto; color: #aab1bf; font-size: 13px; line-height: 1.65; }

        /* float bar */
        .floatBar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
          background: linear-gradient(180deg, transparent, rgba(11,14,28,.95) 36%); display: none; }
        .floatCta { width: 100%; min-height: 58px; }

        @media (max-width: 900px) { .deals { grid-template-columns: repeat(2, 1fr); } .steps { grid-template-columns: 1fr; } .spot { display: none; } }
        @media (max-width: 720px) { .floatBar { display: block; } }
        @media (max-width: 480px) { .feats { grid-template-columns: 1fr; } .name { min-height: 38px; font-size: 14px; } .price strong { font-size: 21px; } }
        @media (prefers-reduced-motion: reduce) { .blob, .cta.hot, .track, .shine, .trust .dot { animation: none !important; } }
      `}</style>
    </main>
  );
}
