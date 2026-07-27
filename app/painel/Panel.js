"use client";

import { useEffect, useState } from "react";

const money = (n) => "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",");

export default function Panel() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  const [ts, setTs] = useState(null);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("k") || "";
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/painel?k=" + encodeURIComponent(key), { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (!j.ok) { setErr(j.erro || "erro"); }
        else { setErr(null); setD(j); setTs(new Date()); }
      } catch (e) { if (alive) setErr("sem conexão"); }
    };
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const tot = d?.tot || { sp: 0, im: 0, cl: 0, lpv: 0, lead: 0, conv: 0 };
  const cpc = tot.conv > 0 ? tot.sp / tot.conv : null;
  const ativos = (d?.ads || []).filter((a) => a.status === "ACTIVE").length;

  const pill = (st) => {
    if (st === "ACTIVE") return <span className="pill on">ativo</span>;
    if (["IN_PROCESS", "PENDING_REVIEW"].includes(st)) return <span className="pill rev">em análise</span>;
    return <span className="pill off">{(st || "pausado").toLowerCase()}</span>;
  };

  return (
    <main className="wrap">
      <div className="top">
        <span className={"dot " + (err ? "bad" : "ok")} />
        <h1>🎯 Painel — Central de Ofertas</h1>
        <span className="upd">{ts ? "atualizado " + ts.toLocaleTimeString("pt-BR") : "carregando…"}</span>
      </div>

      {err && (
        <div className="erro">
          ⚠️ {err}
          {String(err).toLowerCase().includes("token") && " — o token do Facebook pode ter expirado; renove no PC."}
          {String(err).toLowerCase().includes("configure") && " — falta configurar as variáveis no Vercel."}
        </div>
      )}

      <div className="kpis">
        <div className="kpi"><div className="l">Gasto hoje</div><div className="v">{money(tot.sp)}</div><div className="s">{d?.conta?.saldo || ""}</div></div>
        <div className="kpi hot"><div className="l">Conversas iniciadas</div><div className="v">{tot.conv}</div><div className="s">gente que abriu o chat</div></div>
        <div className="kpi"><div className="l">Custo / conversa</div><div className="v">{cpc !== null ? money(cpc) : "—"}</div><div className="s">{cpc !== null ? (cpc <= 1 ? "ótimo 🔥" : cpc <= 3 ? "ok" : "caro ⚠️") : "aguardando"}</div></div>
        <div className="kpi"><div className="l">Cliques no anúncio</div><div className="v">{tot.cl}</div><div className="s">{tot.im.toLocaleString("pt-BR")} impressões</div></div>
        <div className="kpi"><div className="l">Leads (landing)</div><div className="v">{tot.lead}</div><div className="s">visitas: {tot.lpv}</div></div>
        <div className="kpi"><div className="l">Anúncios ativos</div><div className="v">{ativos}/{(d?.ads || []).length}</div><div className="s">gasto total {money(d?.conta?.gastoTotal || 0)}</div></div>
      </div>

      <div className="card">
        <h2>Anúncios</h2>
        {(d?.ads || []).length === 0 && <div className="muted">carregando anúncios…</div>}
        {(d?.ads || []).map((a, i) => (
          <div className="row" key={i}>
            <div className="nm" title={a.nome}>{a.nome}</div>
            <div className="meta">{money(a.spend)} · {a.conversas} conv {pill(a.status)}</div>
          </div>
        ))}
      </div>

      <div className="foot">atualiza sozinho a cada 30s · Central de Ofertas</div>

      <style jsx global>{`
        html, body { margin: 0; background: #0d1017; }
      `}</style>
      <style jsx>{`
        .wrap { max-width: 640px; margin: 0 auto; padding: 16px 14px calc(28px + env(safe-area-inset-bottom)); color: #e8edf5; font-family: -apple-system, "Segoe UI", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .top { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; flex-wrap: wrap; }
        .top h1 { font-size: 17px; font-weight: 800; margin: 0; flex: 1; }
        .dot { width: 9px; height: 9px; border-radius: 50%; }
        .dot.ok { background: #37d67a; box-shadow: 0 0 10px #37d67a; }
        .dot.bad { background: #ff5d5d; box-shadow: 0 0 10px #ff5d5d; }
        .upd { width: 100%; color: #8a97ab; font-size: 12px; }
        .erro { background: rgba(255,93,93,.12); border: 1px solid #ff5d5d; color: #ffb3b3; padding: 10px 13px; border-radius: 11px; margin-bottom: 14px; font-size: 13px; }
        .kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .kpi { background: #161b26; border: 1px solid #273143; border-radius: 14px; padding: 13px 14px; }
        .kpi.hot { border-color: #37d67a; }
        .kpi .l { color: #8a97ab; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
        .kpi .v { font-size: 25px; font-weight: 800; margin-top: 3px; }
        .kpi.hot .v { color: #37d67a; }
        .kpi .s { font-size: 11.5px; color: #8a97ab; margin-top: 2px; }
        .card { background: #161b26; border: 1px solid #273143; border-radius: 16px; padding: 14px; }
        .card h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .6px; color: #8a97ab; margin: 0 0 12px; }
        .row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #1d2431; font-size: 13.5px; }
        .row:last-child { border-bottom: none; }
        .nm { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meta { color: #8a97ab; font-size: 12.5px; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .pill { font-size: 10.5px; padding: 2px 8px; border-radius: 20px; font-weight: 700; }
        .on { background: rgba(55,214,122,.15); color: #37d67a; }
        .rev { background: rgba(255,210,30,.15); color: #ffd21e; }
        .off { background: rgba(255,93,93,.15); color: #ff5d5d; }
        .muted { color: #8a97ab; font-size: 13px; }
        .foot { text-align: center; color: #55617a; font-size: 11.5px; margin-top: 18px; }
      `}</style>
    </main>
  );
}
