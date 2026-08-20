"use client";

import { useEffect, useRef, useState } from "react";
import { sendEvent } from "../lib/tracking";

const INVITE_CODE = "K7y2RlgUuAc0Xepn0qHYBD";
const WHATSAPP_GROUP_URL = `https://chat.whatsapp.com/${INVITE_CODE}`;

// nomes p/ os balões "fulano acabou de entrar" — embaralhados a cada carregamento,
// sem repetir na mesma visita (refresh mostra nomes/ordem diferentes).
const NOMES = [
  "Fábio", "Patrícia", "Lucas", "Amanda", "Rodrigo", "Juliana", "Bruno", "Carla", "Thiago", "Fernanda",
  "Rafael", "Aline", "Gustavo", "Camila", "Felipe", "Beatriz", "Diego", "Larissa", "Marcelo", "Vanessa",
  "André", "Priscila", "Leonardo", "Tatiane", "Vinícius", "Bruna", "Renato", "Sabrina", "Eduardo", "Débora",
  "Márcio", "Letícia", "Gabriel", "Natália", "Rogério", "Simone", "Wesley", "Michele", "Anderson", "Jéssica",
  "Cristiano", "Adriana", "Douglas", "Karina", "Fabiano", "Roberta", "Alexandre", "Viviane", "Igor", "Elaine",
  "Otávio", "Sandra", "Caio", "Renata", "Murilo", "Daniela", "Everton", "Cláudia", "Ricardo", "Luana",
  "Sérgio", "Mariana", "Paulo", "Bianca", "Hélio", "Rosana", "Nelson", "Tainá", "Wagner", "Priscilla",
  "Matheus", "Isabela", "Cauã", "Yasmin", "Emerson", "Milena", "Fabrício", "Raquel", "Jonas", "Sheila",
];

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function LogoMark() {
  return (
    <span className="logo" aria-hidden>
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="#FFC400" />
        <path d="M14.5 19.5h19l1.3 15a2.5 2.5 0 0 1-2.5 2.7H15.7a2.5 2.5 0 0 1-2.5-2.7z" fill="#141414" />
        <path d="M18.2 19.5v-1.3a5.8 5.8 0 0 1 11.6 0v1.3" stroke="#141414" strokeWidth="2.6" />
        <path d="M18.6 27.9l3.5 3.6 7.3-8" stroke="#FFC400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function WppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.4.9 1.4 1.9 2 .8.5 1.1.5 1.4.4.3-.1.5-.5.7-.8.2-.3.4-.2.6-.1l1.7.8c.3.1.5.2.5.4.1.2.1.8-.1 1.2Z" />
    </svg>
  );
}

export default function Landing({ redirect = false }) {
  const foi = useRef(false);
  const [entrou, setEntrou] = useState(null);
  const [secs, setSecs] = useState(12);

  // balões "fulano acabou de entrar" — nomes aleatórios sem repetir na visita
  useEffect(() => {
    let pool = embaralhar(NOMES);
    let idx = 0;
    let tHide, tNext;
    const proximo = () => {
      if (idx >= pool.length) { pool = embaralhar(NOMES); idx = 0; }
      setEntrou({ nome: pool[idx++], key: Date.now() });
      tHide = setTimeout(() => setEntrou(null), 3800);
      tNext = setTimeout(proximo, 4600 + Math.random() * 2400);
    };
    const tStart = setTimeout(proximo, 1500);
    return () => { clearTimeout(tStart); clearTimeout(tHide); clearTimeout(tNext); };
  }, []);

  function irProGrupo(e) {
    if (e) e.preventDefault();
    if (typeof window !== "undefined" && window.fbq) window.fbq("track", "Lead");
    if (foi.current) return; // pixel só uma vez, mas o link sempre abre
    foi.current = true;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram/i.test(ua) && /Android/i.test(ua)) {
      window.location.href = `intent://chat.whatsapp.com/${INVITE_CODE}#Intent;scheme=https;package=com.whatsapp;end`;
      setTimeout(() => { window.location.href = WHATSAPP_GROUP_URL; }, 1200);
    } else {
      window.location.href = WHATSAPP_GROUP_URL;
    }
  }

  useEffect(() => {
    sendEvent("page_view");
    // reveal on scroll
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // contagem regressiva + redirect automático (só na rota /redirect)
  useEffect(() => {
    if (!redirect) return;
    const iv = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(iv); irProGrupo(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [redirect]);

  const CTA = ({ children = "Entrar no grupo grátis", big = false, ghost = false, pulse = false }) => (
    <a
      href={WHATSAPP_GROUP_URL}
      onClick={irProGrupo}
      className={"cta" + (big ? " big" : "") + (ghost ? " ghost" : "") + (pulse ? " pulse" : "")}
    >
      <span className="ctaIn"><WppIcon size={big ? 24 : 20} />{children}</span>
    </a>
  );

  return (
    <main className={redirect ? "hasRedirect" : ""}>
      {redirect && (
        <div className="redirectBar">
          <span className="rbProg" aria-hidden />
          <div className="container rbIn">
            <span className="rbTxt">⏳ Levando você pro grupo em <b>{secs}s</b>…</span>
            <a href={WHATSAPP_GROUP_URL} onClick={irProGrupo} className="cta small">Entrar agora</a>
          </div>
        </div>
      )}

      {/* ---------- HEADER ---------- */}
      <header className="nav">
        <div className="container navIn">
          <div className="brand"><LogoMark /><span className="brandTxt">Central <b>de Ofertas</b></span></div>
          <a href={WHATSAPP_GROUP_URL} onClick={irProGrupo} className="cta small">
            <WppIcon size={18} /> Entrar no grupo
          </a>
        </div>
      </header>

      {/* ---------- HERO (foto de fundo) ---------- */}
      <section className="hero">
        <div className="heroBg" aria-hidden />
        <div className="heroShade" aria-hidden />
        <div className="floatCard fc1">
          <span className="off">−70%</span>
          <div><b>Achados do dia</b><small>as maiores quedas</small></div>
        </div>
        <div className="floatCard fc2">
          <span className="tag">🎟️</span>
          <div><b>Cupom LEVE20</b><small>desconto extra</small></div>
        </div>
        <div className="container heroIn">
          <div className="heroTxt reveal">
            <span className="pill"><span className="dot" /> Grupo oficial no WhatsApp</span>
            <h1>As melhores promoções da <span className="hl">Amazon, Shopee e Mercado&nbsp;Livre</span> — todo dia no seu Zap.</h1>
            <p className="lead">
              A gente garimpa as lojas por você e manda só o que vale a pena:
              achadinhos de verdade e cupons exclusivos, direto no WhatsApp.
              <b> Grátis, sem spam, e você sai quando quiser.</b>
            </p>
            <div className="heroCtas">
              <CTA big pulse>Entrar no grupo grátis</CTA>
            </div>
            <div className="trustRow">
              <div className="stars" aria-hidden>★★★★★</div>
              <span>Curadoria diária · 3 lojas · 100% grátis</span>
            </div>
            <div className="joinSlot" aria-live="polite">
              {entrou && (
                <div className="joinToast" key={entrou.key}>
                  <span className="jAvatar">{entrou.nome.charAt(0)}</span>
                  <div className="jTxt">
                    <span><b>{entrou.nome}</b> acabou de entrar 🎉</span>
                    <small>agora mesmo no grupo</small>
                  </div>
                  <span className="jLive" aria-hidden />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* faixa de lojas */}
      <div className="storesWrap">
        <div className="container">
          <div className="stores reveal">
            <span>Ofertas selecionadas de:</span>
            <div className="storeList">
              <b className="s-amz">amazon</b>
              <b className="s-ml">Mercado Livre</b>
              <b className="s-shp">Shopee</b>
              <b className="s-cup">🎟️ Cupons</b>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- COMO FUNCIONA ---------- */}
      <section className="section" id="como">
        <div className="container">
          <div className="head reveal">
            <span className="eyebrow">Simples assim</span>
            <h2>Como funciona</h2>
            <p>Em menos de 1 minuto você já está recebendo os melhores achados do dia.</p>
          </div>
          <div className="steps">
            {[
              { n: "01", t: "Entre no grupo", d: "É grátis e leva 10 segundos. Um toque no botão e pronto." },
              { n: "02", t: "Receba os achados", d: "Nossa equipe garimpa Amazon, Shopee e ML e manda só o que vale." },
              { n: "03", t: "Compre e economize", d: "Link direto + cupom já aplicado. É só clicar e aproveitar." },
            ].map((s, i) => (
              <div className="step reveal" style={{ transitionDelay: `${i * 90}ms` }} key={s.n}>
                <span className="stepN">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="center reveal"><CTA big pulse /></div>
        </div>
      </section>

      {/* ---------- VEJA O GRUPO POR DENTRO ---------- */}
      <section className="peek">
        <div className="container peekIn">
          <div className="peekImg reveal">
            <div className="phone">
              <video src="/grupo-video.mp4" poster="/grupo-poster.jpg" autoPlay muted loop playsInline preload="metadata" />
            </div>
          </div>
          <div className="peekTxt reveal">
            <span className="eyebrow dark">Por dentro do grupo</span>
            <h2>Cada oferta chega prontinha pra você comprar</h2>
            <p>Foto do produto, preço de antes e de agora, o desconto, o cupom e o link direto — é só tocar e economizar. Sem precisar procurar nada.</p>
            <ul className="ticks light">
              <li>Preço cheio × preço com desconto</li>
              <li>Cupom já indicado</li>
              <li>Link direto pra loja</li>
            </ul>
            <CTA pulse />
          </div>
        </div>
      </section>

      {/* ---------- PROVA REAL ---------- */}
      <section className="section proof">
        <div className="container">
          <div className="head reveal">
            <span className="eyebrow">Ofertas de verdade</span>
            <h2>É isso que rola no grupo, todo dia</h2>
            <p>Promoções reais que já foram enviadas — com desconto e cupom de verdade.</p>
          </div>
          <div className="proofGrid">
            <figure className="proofCard reveal">
              <img src="/prova-1.jpg" alt="Membro mostrando uma oferta do grupo no celular" loading="lazy" />
              <figcaption><b>Fone Anker soundcore</b><span className="badge">−37% + cupom</span></figcaption>
            </figure>
            <figure className="proofCard reveal" style={{ transitionDelay: "90ms" }}>
              <img src="/prova-3.jpg" alt="Membro com a air fryer que comprou pelo grupo" loading="lazy" />
              <figcaption><b>Air Fryer Mondial</b><span className="badge">−42% + cupom</span></figcaption>
            </figure>
            <div className="proofPitch reveal" style={{ transitionDelay: "150ms" }}>
              <h3>Do grupo pra sua casa 📦</h3>
              <p>Achadinhos de casa, cozinha, beleza, eletrônicos, pet e muito mais — sempre com o melhor preço do dia.</p>
              <ul className="ticks">
                <li>Descontos de até 70%</li>
                <li>Cupons que baixam ainda mais</li>
                <li>Sem produto repetido, sem enrolação</li>
              </ul>
              <CTA pulse />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BENEFÍCIOS ---------- */}
      <section className="section">
        <div className="container">
          <div className="head reveal">
            <span className="eyebrow">Por que entrar</span>
            <h2>Feito pra te fazer economizar</h2>
          </div>
          <div className="benefits">
            {[
              { i: "🔎", t: "Curadoria de verdade", d: "Nada de spam: só ofertas boas, filtradas uma a uma." },
              { i: "🎟️", t: "Cupons exclusivos", d: "Códigos que derrubam o preço na hora de comprar." },
              { i: "🛒", t: "Todas as lojas", d: "Amazon, Mercado Livre e Shopee no mesmo lugar." },
              { i: "🔔", t: "Você no controle", d: "Silencia se quiser, sai quando quiser. Sem compromisso." },
            ].map((b, i) => (
              <div className="benefit reveal" style={{ transitionDelay: `${i * 70}ms` }} key={b.t}>
                <span className="bIcon">{b.i}</span>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BANNER COM FOTO DE FUNDO ---------- */}
      <section className="bgBanner">
        <div className="bgOverlay" />
        <div className="container bgBannerIn reveal">
          <span className="pill light"><span className="dot" /> Novidades toda hora</span>
          <h2>Todo dia tem coisa nova chegando 📦</h2>
          <p>Enquanto você lê isso, já tem achadinho novo rolando lá no grupo.</p>
          <CTA big pulse>Quero entrar agora</CTA>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section faqSec">
        <div className="container narrow">
          <div className="head reveal">
            <span className="eyebrow">Ficou na dúvida?</span>
            <h2>Perguntas rápidas</h2>
          </div>
          <div className="faq reveal">
            {[
              { q: "É grátis mesmo?", a: "Sim, 100% grátis — e continua grátis. Você não paga nada pra participar." },
              { q: "Vou receber spam?", a: "Não. Só entram ofertas selecionadas, sem lotar o seu WhatsApp. Qualidade acima de quantidade." },
              { q: "Como eu saio depois?", a: "É só tocar em 'Sair do grupo' no WhatsApp, quando quiser. Sem burocracia." },
              { q: "É seguro?", a: "Total. É apenas um grupo do WhatsApp — você não precisa informar nenhum dado pessoal." },
            ].map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="chev" aria-hidden>+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="finalCta">
        <div className="container">
          <div className="finalBox reveal">
            <h2>Bora economizar de verdade?</h2>
            <p>Entra agora e já pega os achados de hoje. É grátis. 💛</p>
            <CTA big pulse>Entrar no grupo grátis</CTA>
            <span className="micro">grátis · sem spam · sair quando quiser</span>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="foot">
        <div className="container footIn">
          <div className="brand"><LogoMark /><span className="brandTxt">Central <b>de Ofertas</b></span></div>
          <nav className="footLinks">
            <a href="/privacidade">Privacidade</a>
            <a href="/exclusao-de-dados">Exclusão de dados</a>
          </nav>
          <span className="copy">© 2026 Central de Ofertas · Achadinhos todo dia</span>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --bg: #faf6ee; --surface: #ffffff; --ink: #17130c; --muted: #6b6155;
          --line: #ece3d4; --yellow: #ffc400; --yellow-d: #f0a500; --orange: #f47420;
          --wpp: #25d366; --wpp-d: #12b85a; --shadow: 0 18px 44px rgba(60,40,10,.10);
        }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--ink); font-family: var(--font-body), system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .container { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .container.narrow { max-width: 760px; }
        h1, h2, h3 { font-family: var(--font-display), sans-serif; letter-spacing: -.02em; margin: 0; text-wrap: balance; }
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } html { scroll-behavior: auto; } }
      `}</style>

      <style jsx global>{`
        /* ---- CTA ---- */
        .cta { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          background: linear-gradient(180deg, #2be06e, var(--wpp-d)); color: #04220f; text-decoration: none;
          font-family: var(--font-display), sans-serif; font-weight: 800; font-size: 16px;
          padding: 14px 22px; border-radius: 14px; border: 2px solid rgba(255,255,255,.55);
          box-shadow: 0 10px 26px rgba(37,211,102,.32); transition: transform .14s ease, box-shadow .14s ease; white-space: nowrap; }
        .ctaIn { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 9px; }
        .cta:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(37,211,102,.45); }
        .cta:active { transform: translateY(0) scale(.98); }
        .cta.big { font-size: 19px; padding: 20px 34px; border-radius: 18px; }
        .cta.small { padding: 10px 16px; font-size: 14px; border-radius: 11px; box-shadow: 0 6px 16px rgba(37,211,102,.3); }
        .cta.ghost { background: #fff; color: var(--ink); border-color: var(--line); box-shadow: var(--shadow); }

        /* botão em destaque: pulsa + anel de brilho + shine passando */
        .cta.pulse { animation: ctaPulse 1.7s ease-in-out infinite; }
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 30px rgba(37,211,102,.45), 0 0 0 0 rgba(37,211,102,.5); }
          50% { transform: scale(1.045); box-shadow: 0 22px 48px rgba(37,211,102,.6), 0 0 0 16px rgba(37,211,102,0); }
        }
        .cta.pulse:hover { transform: scale(1.05); }
        .cta.pulse::after { content: ""; position: absolute; top: 0; left: 0; width: 55%; height: 100%; z-index: 1; pointer-events: none;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.6), transparent);
          transform: skewX(-18deg) translateX(-160%); animation: ctaShine 2.6s ease-in-out infinite; }
        @keyframes ctaShine { 0% { transform: skewX(-18deg) translateX(-160%); } 55%, 100% { transform: skewX(-18deg) translateX(360%); } }

        /* ---- BARRA DE REDIRECT (rota /redirect) ---- */
        .redirectBar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 48px; overflow: hidden;
          background: linear-gradient(90deg, #17130c, #2a1f06); color: #fff; box-shadow: 0 4px 18px rgba(0,0,0,.28); }
        .rbProg { position: absolute; top: 0; left: 0; height: 3px; width: 0; background: linear-gradient(90deg, #34ef78, #ffc400);
          box-shadow: 0 0 10px rgba(52,239,120,.6); animation: rbGrow 12s linear forwards; }
        @keyframes rbGrow { from { width: 0; } to { width: 100%; } }
        .rbIn { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .rbTxt { font-size: 14.5px; font-weight: 600; }
        .rbTxt b { color: #ffc400; font-family: var(--font-display), sans-serif; font-size: 16px; }
        main.hasRedirect { padding-top: 48px; }
        .hasRedirect .nav { top: 48px; }

        /* ---- NAV ---- */
        .nav { position: sticky; top: 0; z-index: 50; background: rgba(250,246,238,.82); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
        .navIn { display: flex; align-items: center; justify-content: space-between; height: 66px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .logo svg { width: 34px; height: 34px; display: block; }
        .brandTxt { font-family: var(--font-display), sans-serif; font-weight: 500; font-size: 18px; letter-spacing: -.02em; }
        .brandTxt b { font-weight: 700; }

        /* ---- HERO (foto de fundo) ---- */
        .hero { position: relative; min-height: 90vh; display: flex; align-items: center; overflow: hidden; padding: 92px 0 64px; }
        .heroBg { position: absolute; inset: 0; z-index: 0; background: url('/hero.jpg') center 28% / cover no-repeat; }
        .heroShade { position: absolute; inset: 0; z-index: 1; background: linear-gradient(100deg, rgba(10,7,2,.92) 0%, rgba(10,7,2,.74) 38%, rgba(10,7,2,.3) 74%, rgba(10,7,2,.05) 100%); }
        .heroIn { position: relative; z-index: 3; }
        .heroTxt { max-width: 640px; }
        .pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.3);
          padding: 7px 14px; border-radius: 999px; font-size: 13.5px; font-weight: 600; color: #fff; backdrop-filter: blur(6px); }
        .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--wpp); box-shadow: 0 0 0 4px rgba(37,211,102,.25); animation: pulse 1.8s ease-in-out infinite; }
        @keyframes pulse { 50% { box-shadow: 0 0 0 8px rgba(37,211,102,0); } }
        .hero h1 { font-size: clamp(32px, 5.2vw, 54px); font-weight: 700; line-height: 1.05; margin: 18px 0 0; color: #fff; }
        .hl { color: #ffb43a; }
        .hero .lead { margin: 20px 0 0; font-size: 18px; line-height: 1.55; color: #f0e7d8; max-width: 42ch; }
        .hero .lead b { color: #fff; }
        .heroCtas { margin: 30px 0 0; }
        .trustRow { display: flex; align-items: center; gap: 10px; margin: 20px 0 0; font-size: 14px; color: #e8ddca; }
        .stars { color: #ffca3a; letter-spacing: 2px; font-size: 15px; }

        /* balões "fulano acabou de entrar" — prova social no topo */
        .joinSlot { min-height: 60px; margin-top: 18px; }
        .joinToast { display: inline-flex; align-items: center; gap: 11px; background: rgba(255,255,255,.97);
          padding: 9px 16px 9px 9px; border-radius: 999px; box-shadow: 0 14px 34px rgba(0,0,0,.32);
          animation: joinIn .5s cubic-bezier(.2,.9,.3,1.2) both; }
        @keyframes joinIn { from { opacity: 0; transform: translateY(14px) scale(.94); } to { opacity: 1; transform: none; } }
        .jAvatar { width: 38px; height: 38px; border-radius: 50%; flex: none; display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 16px; color: #fff; background: linear-gradient(135deg, #ffb43a, #f47420); }
        .jTxt { display: flex; flex-direction: column; line-height: 1.2; }
        .jTxt > span { font-size: 14.5px; color: var(--ink); }
        .jTxt b { font-weight: 700; }
        .jTxt small { font-size: 11.5px; color: #12b85a; font-weight: 600; }
        .jLive { width: 8px; height: 8px; border-radius: 50%; background: var(--wpp); animation: pulse 1.6s ease-in-out infinite; margin-left: 2px; }

        /* selos flutuantes sobre o hero (canto inferior direito, longe do rosto) */
        .floatCard { position: absolute; z-index: 3; display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid rgba(0,0,0,.05);
          padding: 11px 14px; border-radius: 14px; box-shadow: 0 14px 34px rgba(0,0,0,.35); }
        .floatCard b { display: block; font-size: 13.5px; font-weight: 700; line-height: 1.1; color: var(--ink); }
        .floatCard small { color: var(--muted); font-size: 12px; }
        .fc1 { right: 6%; bottom: 30%; }
        .fc1 .off { background: var(--orange); color: #fff; font-weight: 800; font-size: 13px; padding: 6px 9px; border-radius: 9px; }
        .fc2 { right: 6%; bottom: 13%; }
        .fc2 .tag { font-size: 18px; }

        /* ---- STORES STRIP ---- */
        .storesWrap { position: relative; z-index: 5; margin-top: -34px; }
        .stores { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px 26px; margin: 0;
          padding: 18px; background: #fff; border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 18px 44px rgba(60,40,10,.14); }
        .stores > span { color: var(--muted); font-size: 14px; }
        .storeList { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 22px; }
        .storeList b { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 19px; opacity: .85; }
        .s-amz { color: #ff9900; text-transform: lowercase; }
        .s-ml { color: #cc8800; }
        .s-shp { color: #ee4d2d; }
        .s-cup { color: #3d372e; font-size: 16px; }

        /* ---- SECTIONS ---- */
        .section { padding: 68px 0; }
        .head { text-align: center; max-width: 640px; margin: 0 auto 40px; }
        .eyebrow { display: inline-block; font-weight: 700; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #a8410c; background: #ffe9d6; padding: 5px 12px; border-radius: 999px; }
        h2 { font-size: clamp(26px, 4vw, 38px); font-weight: 700; margin: 14px 0 0; }
        .head p { color: var(--muted); font-size: 17px; margin: 12px 0 0; line-height: 1.5; }
        .center { text-align: center; margin-top: 40px; }

        /* ---- STEPS ---- */
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .step { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 28px 24px; box-shadow: var(--shadow); }
        .stepN { font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 15px; color: #04220f; background: var(--yellow); width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; }
        .step h3 { font-size: 20px; margin: 18px 0 8px; }
        .step p { color: var(--muted); font-size: 15.5px; line-height: 1.5; margin: 0; }

        /* ---- PROOF ---- */
        .proof { background: linear-gradient(180deg, #fff, #fbf4e6); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .proofGrid { display: grid; grid-template-columns: 1fr 1fr 1.15fr; gap: 20px; align-items: stretch; }
        .proofCard { margin: 0; background: #fff; border: 1px solid var(--line); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); }
        .proofCard img { width: 100%; height: 340px; object-fit: cover; display: block; }
        .proofCard figcaption { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 14px 16px; font-size: 14.5px; }
        .badge { background: #eafff1; color: #0f7a3a; font-weight: 700; font-size: 12.5px; padding: 5px 10px; border-radius: 999px; border: 1px solid #bff0cf; white-space: nowrap; }
        .proofPitch { background: #17130c; color: #fff; border-radius: 20px; padding: 30px 26px; display: flex; flex-direction: column; justify-content: center; }
        .proofPitch h3 { font-size: 24px; }
        .proofPitch p { color: #d6ccbb; margin: 12px 0 16px; line-height: 1.55; }
        .ticks { list-style: none; padding: 0; margin: 0 0 24px; display: grid; gap: 10px; }
        .ticks li { position: relative; padding-left: 28px; font-size: 15.5px; }
        .ticks li::before { content: "✓"; position: absolute; left: 0; top: -1px; color: #04220f; background: var(--yellow); width: 20px; height: 20px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
        .proofPitch .cta { align-self: flex-start; }

        /* ---- BENEFITS ---- */
        .benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .benefit { background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 26px 22px; box-shadow: var(--shadow); }
        .bIcon { font-size: 30px; display: block; }
        .benefit h3 { font-size: 18px; margin: 14px 0 8px; }
        .benefit p { color: var(--muted); font-size: 14.5px; line-height: 1.5; margin: 0; }

        /* ---- PEEK (grupo por dentro) ---- */
        .peek { background: radial-gradient(circle at 25% 15%, #2a2013, #17130c 62%); color: #fff; padding: 70px 0; }
        .peekIn { display: grid; grid-template-columns: .8fr 1.2fr; gap: 48px; align-items: center; }
        .peekImg { display: flex; justify-content: center; }
        .phone { width: 100%; max-width: 280px; border-radius: 34px; padding: 9px; background: #0a0a0a; border: 1px solid #2a2418; box-shadow: 0 30px 70px rgba(0,0,0,.6); }
        .phone video { width: 100%; display: block; border-radius: 26px; background: #000; }
        .peekTxt h2 { color: #fff; }
        .peekTxt p { color: #cfc6b8; font-size: 17px; line-height: 1.55; margin: 14px 0 18px; }
        .eyebrow.dark { background: #3a2f16; color: #ffcf5a; }
        .ticks.light li { color: #ece4d6; }

        /* ---- BANNER COM FOTO DE FUNDO ---- */
        .bgBanner { position: relative; background: #17130c url('/unbox.jpg') center 28% / cover no-repeat; padding: 92px 0; text-align: center; overflow: hidden; }
        .bgOverlay { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(18,13,7,.86) 28%, rgba(18,13,7,.42)); }
        .bgBannerIn { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
        .bgBanner h2 { color: #fff; font-size: clamp(26px, 4.5vw, 40px); margin-top: 14px; }
        .bgBanner p { color: #ffe6c9; font-size: 18px; margin: 12px 0 26px; }
        .pill.light { background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.28); color: #fff; box-shadow: none; }

        /* ---- FAQ ---- */
        .faqSec { background: #fff; border-top: 1px solid var(--line); }
        .faq { display: grid; gap: 12px; }
        details { background: var(--bg); border: 1px solid var(--line); border-radius: 14px; padding: 4px 18px; }
        summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 0; font-family: var(--font-display), sans-serif; font-weight: 600; font-size: 17px; }
        summary::-webkit-details-marker { display: none; }
        .chev { font-size: 22px; color: var(--orange); transition: transform .2s ease; line-height: 1; }
        details[open] .chev { transform: rotate(45deg); }
        details p { margin: 0 0 16px; color: var(--muted); font-size: 15.5px; line-height: 1.55; }

        /* ---- FINAL CTA ---- */
        .finalCta { padding: 20px 0 80px; }
        .finalBox { position: relative; overflow: hidden; text-align: center; background: linear-gradient(135deg, #ffd94a, #ffb300); border-radius: 28px; padding: 56px 26px; box-shadow: 0 26px 60px rgba(240,165,0,.35); }
        .finalBox::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 80% -10%, rgba(255,255,255,.5), transparent 50%); pointer-events: none; }
        .finalBox h2 { font-size: clamp(26px, 4.5vw, 40px); color: #241a02; position: relative; }
        .finalBox p { color: #4a3a08; font-size: 18px; margin: 12px 0 26px; position: relative; }
        .finalBox .cta { position: relative; }
        .micro { display: block; margin-top: 16px; font-size: 13px; color: #5c4a12; position: relative; }

        /* ---- FOOTER ---- */
        .foot { background: #17130c; color: #cfc6b8; padding: 34px 0; }
        .footIn { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .foot .brandTxt { color: #fff; }
        .footLinks { display: flex; gap: 20px; }
        .footLinks a { color: #cfc6b8; text-decoration: none; font-size: 14.5px; }
        .footLinks a:hover { color: var(--yellow); }
        .copy { font-size: 13px; color: #8a8071; }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 900px) {
          .hero { min-height: 76vh; }
          .hero .lead { max-width: none; }
          .floatCard { display: none; }
          .proofGrid { grid-template-columns: 1fr 1fr; }
          .proofPitch { grid-column: 1 / -1; }
          .benefits { grid-template-columns: 1fr 1fr; }
          .peekIn { grid-template-columns: 1fr; gap: 28px; }
          .phone { max-width: 230px; }
          .bgBanner { padding: 70px 0; }
        }
        @media (max-width: 560px) {
          .hero { min-height: 84vh; padding: 76px 0 40px; }
          .hero h1 { font-size: 32px; }
          .steps { grid-template-columns: 1fr; }
          .proofGrid { grid-template-columns: 1fr; }
          .proofCard img { height: 300px; }
          .benefits { grid-template-columns: 1fr; }
          .navIn .cta.small { padding: 9px 13px; }
          .brandTxt { font-size: 16px; }
          .cta.big { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cta.pulse { animation: none; }
          .cta.pulse::after { display: none; }
          .dot { animation: none; }
        }
      `}</style>
    </main>
  );
}
