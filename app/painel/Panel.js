"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const money = (n) => "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",");
const num = (n) => (Number(n) || 0).toLocaleString("pt-BR");
const haquanto = (ts) => { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return "agora"; if (m < 60) return "há " + m + " min"; return "há " + Math.round(m / 60) + "h"; };

export default function Panel() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  const [ts, setTs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0), startY = useRef(0), pulling = useRef(false);

  const load = useCallback(async () => {
    const key = new URLSearchParams(window.location.search).get("k") || "";
    setLoading(true);
    try {
      const r = await fetch("/api/painel?k=" + encodeURIComponent(key) + "&_=" + Date.now(), { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) setErr(j.erro || "erro"); else { setErr(null); setD(j); setTs(new Date()); }
    } catch (e) { setErr("sem conexão"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    const onStart = (e) => { if (window.scrollY <= 0) { startY.current = e.touches[0].clientY; pulling.current = true; } };
    const onMove = (e) => { if (!pulling.current) return; const dy = e.touches[0].clientY - startY.current; if (dy > 0) { const p = Math.min(dy * 0.5, 80); pullRef.current = p; setPull(p); } };
    const onEnd = () => { if (pullRef.current > 55) load(); pullRef.current = 0; setPull(0); pulling.current = false; };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
  }, [load]);

  const tot = d?.tot || { sp: 0, im: 0, rc: 0, cl: 0, lpv: 0, lead: 0, conv: 0 };
  const robo = d?.robo || {};
  const membros = robo.membros != null ? robo.membros : null;
  const historia = d?.historia || [];
  const campanhas = d?.campanhas || [];
  const cpc = tot.conv > 0 ? tot.sp / tot.conv : null;
  const resultados = tot.conv + tot.lead;
  const comCusto = campanhas.filter((c) => c.custoResultado != null);
  const vencedora = comCusto.length ? comCusto.reduce((a, b) => (b.custoResultado < a.custoResultado ? b : a)).nome : null;

  const pill = (st) => st === "ACTIVE" ? <span className="pill on">ativo</span> : ["IN_PROCESS", "PENDING_REVIEW"].includes(st) ? <span className="pill rev">análise</span> : <span className="pill off">pausado</span>;

  function chart() {
    const pts = historia.filter((h) => h && h.membros != null);
    if (pts.length < 2) return <div className="chartEmpty">📈 montando o histórico… (atualiza a cada 15 min)</div>;
    const W = 320, H = 84, pad = 4;
    const ys = pts.map((p) => p.membros);
    const min = Math.min(...ys) - 1, max = Math.max(...ys) + 1;
    const x = (i) => pad + (i * (W - 2 * pad)) / (pts.length - 1);
    const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - 2 * pad);
    const line = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(p.membros).toFixed(1)).join(" ");
    const area = `M${x(0).toFixed(1)},${H} ` + pts.map((p, i) => "L" + x(i).toFixed(1) + "," + y(p.membros).toFixed(1)).join(" ") + ` L${x(pts.length - 1).toFixed(1)},${H} Z`;
    const last = pts[pts.length - 1];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart">
        <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4aa3ff" stopOpacity="0.4" /><stop offset="1" stopColor="#4aa3ff" stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#mg)" />
        <path d={line} fill="none" stroke="#4aa3ff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        <circle cx={x(pts.length - 1)} cy={y(last.membros)} r="3.5" fill="#4aa3ff" />
      </svg>
    );
  }

  const funil = [
    { ic: "👁️", nm: "Impressões", v: tot.im, cls: "blu" },
    { ic: "👆", nm: "Cliques no anúncio", v: tot.cl, cls: "cya" },
    { ic: "💬", nm: "Conversas + cliques p/ grupo", v: resultados, cls: "grn" },
  ];
  const fmax = Math.max(1, tot.im);

  return (
    <main className="wrap">
      <div className="ptr" style={{ height: pull }}><span className={"ico " + (loading ? "spin" : "")}>↻</span>{pull > 55 ? "solte pra atualizar" : pull > 6 ? "puxe" : ""}</div>

      <div className="top">
        <span className={"dot " + (err ? "bad" : "ok")} />
        <h1>🎯 Central de Ofertas</h1>
        <button className="ref" onClick={load} aria-label="Atualizar"><span className={loading ? "spin" : ""}>↻</span></button>
      </div>
      <div className="subline">{ts ? "atualizado " + ts.toLocaleTimeString("pt-BR") : "carregando…"}{d?.conta?.saldo ? " · saldo " + d.conta.saldo : ""}</div>

      {err && <div className="erro">⚠️ {err}{String(err).toLowerCase().includes("token") ? " — token do Facebook pode ter expirado." : ""}</div>}

      {/* HERO */}
      <div className="hero">
        <div className="heroTop">
          <div className="heroL">
            <div className="hl">👥 Membros do grupo</div>
            <div className="hv">{membros != null ? num(membros) : "—"} {robo.delta ? <span className={"hd " + (robo.delta > 0 ? "up" : "dn")}>{robo.delta > 0 ? "+" + robo.delta : robo.delta}</span> : null}</div>
          </div>
          <div className="heroR">
            <div className="hl">resultados hoje</div>
            <div className="hv2">{resultados}</div>
            <div className="hs">conversas + cliques</div>
          </div>
        </div>
        {chart()}
      </div>

      {/* CUSTOS */}
      <div className="card custos">
        <h2>💰 Custos</h2>
        <div className="cgrid">
          <div className="citem big"><div className="cl">Orçamento / dia</div><div className="cv">{money(d?.conta?.orcamentoDia || 0)}</div></div>
          <div className="citem"><div className="cl">Gasto hoje</div><div className="cv">{money(tot.sp)}</div></div>
          <div className="citem"><div className="cl">Gasto total</div><div className="cv">{money(d?.conta?.gastoTotal || 0)}</div></div>
          <div className="citem"><div className="cl">Saldo disponível</div><div className="cv">{d?.conta?.saldo || (d?.conta?.balance != null ? money(d.conta.balance) : "—")}</div></div>
        </div>
      </div>

      {/* BATALHA */}
      {campanhas.length > 0 && (
        <div className="card">
          <h2>⚔️ Batalha das campanhas</h2>
          <div className="battle">
            {campanhas.map((c, i) => (
              <div className={"camp " + (c.nome === vencedora && comCusto.length > 1 ? "win" : "")} key={i}>
                <div className="ctipo">{c.tipo === "Messenger" ? "💬 Messenger" : c.tipo === "Landing" ? "🌐 Landing" : "📢 " + c.tipo}{c.nome === vencedora && comCusto.length > 1 ? <span className="crown">🏆</span> : null}</div>
                <div className="cbig">{c.resultados}</div>
                <div className="csmall">resultados</div>
                <div className="crow"><span>Orçam./dia</span><b>{c.orcamentoDia ? money(c.orcamentoDia) : "—"}</b></div>
                <div className="crow"><span>Gasto hoje</span><b>{money(c.spend)}</b></div>
                <div className="crow"><span>Custo/result.</span><b>{c.custoResultado != null ? money(c.custoResultado) : "—"}</b></div>
                <div className="crow"><span>Anúncios</span><b>{c.ativos > 0 ? c.ativos + " ativo" + (c.ativos > 1 ? "s" : "") : "pausada"}</b></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi"><div className="l">Gasto hoje</div><div className="v">{money(tot.sp)}</div><div className="s">saldo {d?.conta?.balance != null ? money(d.conta.balance) : "—"}</div></div>
        <div className="kpi hot"><div className="l">Conversas</div><div className="v">{tot.conv}</div><div className="s">abriram o chat</div></div>
        <div className="kpi"><div className="l">Cliques p/ grupo</div><div className="v">{tot.lead}</div><div className="s">na landing</div></div>
        <div className="kpi"><div className="l">Custo / conversa</div><div className="v">{cpc != null ? money(cpc) : "—"}</div><div className="s">{cpc != null ? (cpc <= 1 ? "ótimo 🔥" : cpc <= 3 ? "ok" : "caro ⚠️") : "aguardando"}</div></div>
        <div className="kpi"><div className="l">Cliques anúncio</div><div className="v">{num(tot.cl)}</div><div className="s">{num(tot.im)} impressões</div></div>
        <div className="kpi"><div className="l">Alcance</div><div className="v">{num(tot.rc)}</div><div className="s">pessoas diferentes</div></div>
      </div>

      {/* FUNIL */}
      <div className="card">
        <h2>🎯 Funil de hoje</h2>
        {funil.map((s, i) => {
          const drop = i > 0 && funil[i - 1].v > 0 ? Math.round((1 - s.v / funil[i - 1].v) * 100) : null;
          return (
            <div className="fstep" key={i}>
              <div className="fnm">{s.ic} {s.nm}</div>
              <div className="ftrack"><div className={"ffill " + s.cls} style={{ width: Math.max((s.v / fmax) * 100, 2) + "%" }} /></div>
              <div className="fval">{num(s.v)}{drop != null ? <span className="drop"> −{drop}%</span> : null}</div>
            </div>
          );
        })}
      </div>

      {/* ROBÔ */}
      <div className="card">
        <h2>🤖 Ações do robô{robo.roboTs ? " · " + haquanto(robo.roboTs) : ""}</h2>
        {(robo.acoes && robo.acoes.length) ? robo.acoes.map((a, i) => <div className="acao" key={i}>{a}</div>) : <div className="muted">Sem ações ainda — o robô só age com dados suficientes (roda a cada 4h). Pausar/escalar/avisar aparece aqui.</div>}
      </div>

      {/* ANÚNCIOS */}
      <div className="card">
        <h2>📢 Anúncios ({(d?.ads || []).length})</h2>
        {(d?.ads || []).length === 0 ? <div className="muted">carregando…</div> : (d?.ads || []).map((a, i) => (
          <div className="row" key={i}><div className="nm">{a.nome}</div><div className="meta">{money(a.spend)} {pill(a.status)}</div></div>
        ))}
      </div>

      <div className="foot">atualiza a cada 30s · puxe pra baixo ou toque em ↻ · membros a cada 15 min</div>

      <style jsx global>{`html,body{margin:0;background:#0a0d14;overscroll-behavior-y:contain}`}</style>
      <style jsx>{`
        .wrap { max-width: 660px; margin: 0 auto; padding: 14px 13px calc(30px + env(safe-area-inset-bottom)); color: #e8edf5; font-family: -apple-system, "Segoe UI", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .ptr { display: flex; align-items: center; justify-content: center; gap: 8px; overflow: hidden; color: #8a97ab; font-size: 12.5px; transition: height .12s; }
        .ptr .ico { font-size: 16px; }
        .top { display: flex; align-items: center; gap: 9px; }
        .top h1 { font-size: 18px; font-weight: 800; margin: 0; flex: 1; letter-spacing: -.2px; }
        .dot { width: 9px; height: 9px; border-radius: 50%; }
        .dot.ok { background: #37d67a; box-shadow: 0 0 10px #37d67a; }
        .dot.bad { background: #ff5d5d; box-shadow: 0 0 10px #ff5d5d; }
        .ref { background: #1a2130; border: 1px solid #283449; color: #e8edf5; width: 34px; height: 34px; border-radius: 10px; font-size: 17px; display: flex; align-items: center; justify-content: center; -webkit-tap-highlight-color: transparent; }
        .ref:active { background: #283449; }
        .spin { display: inline-block; animation: sp .8s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .subline { color: #8a97ab; font-size: 12px; margin: 3px 0 15px; }
        .erro { background: rgba(255,93,93,.12); border: 1px solid #ff5d5d; color: #ffb3b3; padding: 10px 13px; border-radius: 11px; margin-bottom: 13px; font-size: 13px; }

        .hero { background: linear-gradient(160deg, #16223a, #111826); border: 1px solid #26344d; border-radius: 18px; padding: 16px 16px 6px; margin-bottom: 13px; box-shadow: 0 8px 30px rgba(0,0,0,.35); }
        .custos .cgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .citem { background: #0f1521; border: 1px solid #232d40; border-radius: 11px; padding: 11px 12px; }
        .citem.big { border-color: #ffce33; }
        .cl { font-size: 10.5px; color: #8a97ab; text-transform: uppercase; letter-spacing: .4px; }
        .cv { font-size: 20px; font-weight: 800; margin-top: 2px; letter-spacing: -.4px; }
        .citem.big .cv { color: #ffce33; }
        .heroTop { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .hl { color: #9fb0c9; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
        .hv { font-size: 42px; font-weight: 900; color: #4aa3ff; line-height: 1; margin-top: 4px; letter-spacing: -1px; }
        .hd { font-size: 15px; font-weight: 800; margin-left: 6px; vertical-align: middle; }
        .hd.up { color: #37d67a; } .hd.dn { color: #ff5d5d; }
        .heroR { text-align: right; }
        .hv2 { font-size: 26px; font-weight: 800; margin-top: 4px; }
        .hs { font-size: 11px; color: #8a97ab; }
        .chart { width: 100%; height: 84px; display: block; }
        .chartEmpty { color: #8a97ab; font-size: 12.5px; text-align: center; padding: 26px 0 30px; }

        .card { background: #131a27; border: 1px solid #232d40; border-radius: 16px; padding: 14px; margin-bottom: 13px; }
        .card h2 { font-size: 12.5px; text-transform: uppercase; letter-spacing: .6px; color: #9fb0c9; margin: 0 0 13px; font-weight: 700; }

        .battle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .camp { background: #0f1521; border: 1px solid #232d40; border-radius: 13px; padding: 13px 12px; }
        .camp.win { border-color: #37d67a; box-shadow: 0 0 24px rgba(55,214,122,.18); }
        .ctipo { font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
        .crown { margin-left: auto; }
        .cbig { font-size: 30px; font-weight: 900; line-height: 1; }
        .camp.win .cbig { color: #37d67a; }
        .csmall { font-size: 11px; color: #8a97ab; margin: 2px 0 10px; }
        .crow { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-top: 1px solid #1c2536; color: #8a97ab; }
        .crow b { color: #e8edf5; }

        .kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 13px; }
        .kpi { background: #131a27; border: 1px solid #232d40; border-radius: 13px; padding: 12px 13px; }
        .kpi.hot { border-color: #37d67a; }
        .kpi .l { color: #8a97ab; font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; }
        .kpi .v { font-size: 23px; font-weight: 800; margin-top: 3px; letter-spacing: -.5px; }
        .kpi.hot .v { color: #37d67a; }
        .kpi .s { font-size: 11px; color: #8a97ab; margin-top: 1px; }

        .fstep { display: flex; align-items: center; gap: 10px; margin: 9px 0; font-size: 13px; }
        .fnm { width: 150px; flex-shrink: 0; font-size: 12.5px; }
        .ftrack { flex: 1; height: 22px; background: #0f1521; border-radius: 6px; overflow: hidden; }
        .ffill { height: 100%; border-radius: 6px; transition: width .5s; }
        .ffill.blu { background: linear-gradient(90deg,#2563a8,#4aa3ff); }
        .ffill.cya { background: linear-gradient(90deg,#0e7490,#22d3ee); }
        .ffill.grn { background: linear-gradient(90deg,#1a8f4c,#37d67a); }
        .fval { width: 92px; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; font-size: 13px; }
        .drop { color: #ff5d5d; font-size: 11px; font-weight: 600; }

        .acao { padding: 8px 0; border-bottom: 1px solid #1c2536; font-size: 13.5px; line-height: 1.4; }
        .acao:last-child { border-bottom: none; }
        .row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #1c2536; font-size: 13.5px; }
        .row:last-child { border-bottom: none; }
        .nm { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meta { color: #8a97ab; font-size: 12.5px; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .pill { font-size: 10.5px; padding: 2px 8px; border-radius: 20px; font-weight: 700; }
        .on { background: rgba(55,214,122,.15); color: #37d67a; }
        .rev { background: rgba(255,210,30,.15); color: #ffd21e; }
        .off { background: rgba(255,93,93,.15); color: #ff5d5d; }
        .muted { color: #8a97ab; font-size: 13px; }
        .foot { text-align: center; color: #55617a; font-size: 11px; margin-top: 16px; }
      `}</style>
    </main>
  );
}
