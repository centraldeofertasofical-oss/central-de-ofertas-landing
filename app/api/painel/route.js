// API do painel (roda no servidor do Vercel — o token nunca vai pro navegador).
// Precisa no Vercel: FB_ADS_TOKEN, FB_AD_ACCOUNT_ID, PANEL_KEY, e o KV (Upstash).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACCT = process.env.FB_AD_ACCOUNT_ID;
const ACCT2 = process.env.FB_AD_ACCOUNT_ID_2 || "act_1581432126071391"; // conta 2 (teste Goiás/vídeo)
const TOKEN = process.env.FB_ADS_TOKEN;
const KEY = process.env.PANEL_KEY || "cdo-9f3k7m2q";
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function g(path, params = {}) {
  const u = new URL(`https://graph.facebook.com/v21.0/${path}`);
  u.searchParams.set("access_token", TOKEN);
  for (const k in params) u.searchParams.set(k, params[k]);
  const r = await fetch(u.toString(), { cache: "no-store" });
  return r.json();
}
const val = (a, t) => { const x = (a || []).find((y) => y.action_type === t); return x ? Number(x.value) : 0; };
const lead = (a) => val(a, "lead") || val(a, "offsite_conversion.fb_pixel_lead");
async function kvGet(key) {
  if (!KV_URL || !KV_TOK) return null;
  try { const r = await fetch(KV_URL + "/get/" + key, { headers: { Authorization: "Bearer " + KV_TOK }, cache: "no-store" }); const j = await r.json(); if (j && j.result != null) return typeof j.result === "string" ? JSON.parse(j.result) : j.result; } catch (e) {}
  return null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const k = url.searchParams.get("k");
  const PRESETS = { hoje: "today", ontem: "yesterday", "3d": "last_3d", "7d": "last_7d" };
  const periodo = url.searchParams.get("p") || "hoje";
  const preset = PRESETS[periodo] || "today";
  if (!TOKEN || !ACCT) return Response.json({ ok: false, erro: "Configure FB_ADS_TOKEN e FB_AD_ACCOUNT_ID no Vercel" });
  if (k !== KEY) return Response.json({ ok: false, erro: "Chave invalida" }, { status: 401 });
  try {
    // soma as 2 contas de anúncio (principal + conta 2 de teste)
    const ACCTS = [ACCT, ACCT2].filter(Boolean);
    const parseSaldo = (str) => { const m = String(str || "").match(/([\d.]+),(\d{2})/); return m ? Number(m[1].replace(/\./g, "") + "." + m[2]) : 0; };
    const ads = [];
    const campMap = {};
    let orcamentoDia = 0, gastoTotal = 0, saldoNum = 0, contaNome = "";
    for (const A of ACCTS) {
      const acct = await g(A, { fields: "name,amount_spent,funding_source_details" });
      if (acct.error) continue; // sem acesso a essa conta: pula
      contaNome = contaNome || acct.name;
      gastoTotal += Number(acct.amount_spent || 0) / 100;
      saldoNum += parseSaldo(acct.funding_source_details && acct.funding_source_details.display_string);
      const adsR = await g(`${A}/ads`, {
        fields: `name,effective_status,campaign{id,name},insights.date_preset(${preset}){spend,impressions,reach,inline_link_clicks,actions}`,
        limit: "80",
      });
      for (const a of (adsR.data || [])) {
        const i = (a.insights && a.insights.data && a.insights.data[0]) || {};
        const cn = (a.campaign && a.campaign.name) || "?";
        const o = { nome: a.name, status: a.effective_status, spend: Number(i.spend || 0), impr: Number(i.impressions || 0), reach: Number(i.reach || 0), clicks: Number(i.inline_link_clicks || 0), lpv: val(i.actions, "landing_page_view"), lead: lead(i.actions), campNome: cn };
        ads.push(o);
        const tipo = /messenger/i.test(cn) ? "Messenger" : /conversa|entrar|grupo|whats/i.test(cn) ? "Grupo WhatsApp" : /abre-pagina|landing/i.test(cn) ? "Landing" : "Outra";
        if (!campMap[cn]) campMap[cn] = { nome: cn, tipo, spend: 0, impr: 0, clicks: 0, lead: 0, ativos: 0, total: 0 };
        const c = campMap[cn];
        c.spend += o.spend; c.impr += o.impr; c.clicks += o.clicks; c.lead += o.lead; c.total++;
        if (a.effective_status === "ACTIVE") c.ativos++;
      }
      // orçamentos por dia (dos conjuntos ativos desta conta)
      try {
        const setsR = await g(`${A}/adsets`, { fields: "daily_budget,effective_status,campaign{name}", limit: "80" });
        for (const s of (setsR.data || [])) {
          const b = Number(s.daily_budget || 0) / 100;
          const cn = (s.campaign && s.campaign.name) || "?";
          if (s.effective_status === "ACTIVE") { orcamentoDia += b; if (campMap[cn]) campMap[cn].orcamentoDia = (campMap[cn].orcamentoDia || 0) + b; }
        }
      } catch (e) {}
    }
    const nContas = ACCTS.length;
    const saldo = saldoNum > 0 ? "R$" + saldoNum.toFixed(2).replace(".", ",") + (nContas > 1 ? " (2 contas)" : "") : "";

    const campanhas = Object.values(campMap)
      .filter((c) => c.spend > 0 || c.ativos > 0)
      .map((c) => ({ ...c, resultados: c.lead, custoResultado: c.lead > 0 ? c.spend / c.lead : null }))
      .sort((a, b) => b.tipo.localeCompare(a.tipo));
    const tot = ads.reduce((s, a) => ({ sp: s.sp + a.spend, im: s.im + a.impr, rc: s.rc + a.reach, cl: s.cl + a.clicks, lpv: s.lpv + a.lpv, lead: s.lead + a.lead }), { sp: 0, im: 0, rc: 0, cl: 0, lpv: 0, lead: 0 });

    const robo = await kvGet("robo:status");
    const historia = (await kvGet("robo:history")) || [];

    return Response.json({
      ok: true, ts: Date.now(),
      conta: { nome: contaNome, saldo, gastoTotal, orcamentoDia },
      ads: ads.filter((a) => a.spend > 0 || ["ACTIVE", "IN_PROCESS", "PENDING_REVIEW"].includes(a.status)),
      tot, campanhas, robo, historia, periodo,
    });
  } catch (e) {
    return Response.json({ ok: false, erro: e.message });
  }
}
