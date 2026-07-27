// API do painel (roda no servidor do Vercel — o token nunca vai pro navegador).
// Precisa no Vercel: FB_ADS_TOKEN, FB_AD_ACCOUNT_ID, PANEL_KEY, e o KV (Upstash).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACCT = process.env.FB_AD_ACCOUNT_ID;
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
const conversas = (a) => val(a, "onsite_conversion.messaging_conversation_started_7d") || val(a, "onsite_conversion.messaging_first_reply") || val(a, "onsite_conversion.total_messaging_connection");
const lead = (a) => val(a, "lead") || val(a, "offsite_conversion.fb_pixel_lead");
async function kvGet(key) {
  if (!KV_URL || !KV_TOK) return null;
  try { const r = await fetch(KV_URL + "/get/" + key, { headers: { Authorization: "Bearer " + KV_TOK }, cache: "no-store" }); const j = await r.json(); if (j && j.result != null) return typeof j.result === "string" ? JSON.parse(j.result) : j.result; } catch (e) {}
  return null;
}

export async function GET(request) {
  const k = new URL(request.url).searchParams.get("k");
  if (!TOKEN || !ACCT) return Response.json({ ok: false, erro: "Configure FB_ADS_TOKEN e FB_AD_ACCOUNT_ID no Vercel" });
  if (k !== KEY) return Response.json({ ok: false, erro: "Chave invalida" }, { status: 401 });
  try {
    const acct = await g(ACCT, { fields: "name,amount_spent,balance,funding_source_details" });
    if (acct.error) return Response.json({ ok: false, erro: acct.error.message });
    const adsR = await g(`${ACCT}/ads`, {
      fields: "name,effective_status,campaign{id,name},insights.date_preset(today){spend,impressions,reach,inline_link_clicks,actions}",
      limit: "80",
    });
    const ads = [];
    const campMap = {};
    for (const a of (adsR.data || [])) {
      const i = (a.insights && a.insights.data && a.insights.data[0]) || {};
      const cn = (a.campaign && a.campaign.name) || "?";
      const o = { nome: a.name, status: a.effective_status, spend: Number(i.spend || 0), impr: Number(i.impressions || 0), reach: Number(i.reach || 0), clicks: Number(i.inline_link_clicks || 0), lpv: val(i.actions, "landing_page_view"), lead: lead(i.actions), conversas: conversas(i.actions), campNome: cn };
      ads.push(o);
      const tipo = /messenger/i.test(cn) ? "Messenger" : /abre-pagina|landing/i.test(cn) ? "Landing" : "Outra";
      if (!campMap[cn]) campMap[cn] = { nome: cn, tipo, spend: 0, impr: 0, clicks: 0, conv: 0, lead: 0, ativos: 0, total: 0 };
      const c = campMap[cn];
      c.spend += o.spend; c.impr += o.impr; c.clicks += o.clicks; c.conv += o.conversas; c.lead += o.lead; c.total++;
      if (a.effective_status === "ACTIVE") c.ativos++;
    }
    // orçamentos por dia (dos conjuntos ativos)
    let orcamentoDia = 0;
    try {
      const setsR = await g(`${ACCT}/adsets`, { fields: "daily_budget,effective_status,campaign{name}", limit: "80" });
      for (const s of (setsR.data || [])) {
        const b = Number(s.daily_budget || 0) / 100;
        const cn = (s.campaign && s.campaign.name) || "?";
        if (s.effective_status === "ACTIVE") { orcamentoDia += b; if (campMap[cn]) campMap[cn].orcamentoDia = (campMap[cn].orcamentoDia || 0) + b; }
      }
    } catch (e) {}

    const campanhas = Object.values(campMap)
      .filter((c) => c.spend > 0 || c.ativos > 0)
      .map((c) => ({ ...c, resultados: c.conv + c.lead, custoResultado: (c.conv + c.lead) > 0 ? c.spend / (c.conv + c.lead) : null }))
      .sort((a, b) => b.tipo.localeCompare(a.tipo));
    const tot = ads.reduce((s, a) => ({ sp: s.sp + a.spend, im: s.im + a.impr, rc: s.rc + a.reach, cl: s.cl + a.clicks, lpv: s.lpv + a.lpv, lead: s.lead + a.lead, conv: s.conv + a.conversas }), { sp: 0, im: 0, rc: 0, cl: 0, lpv: 0, lead: 0, conv: 0 });

    const robo = await kvGet("robo:status");
    const historia = (await kvGet("robo:history")) || [];

    return Response.json({
      ok: true, ts: Date.now(),
      conta: { nome: acct.name, saldo: (acct.funding_source_details && acct.funding_source_details.display_string) || "", gastoTotal: Number(acct.amount_spent || 0) / 100, balance: Number(acct.balance || 0) / 100, orcamentoDia },
      ads: ads.filter((a) => a.spend > 0 || ["ACTIVE", "IN_PROCESS", "PENDING_REVIEW"].includes(a.status)),
      tot, campanhas, robo, historia,
    });
  } catch (e) {
    return Response.json({ ok: false, erro: e.message });
  }
}
