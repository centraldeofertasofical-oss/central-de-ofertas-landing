// API do painel (roda no servidor do Vercel — o token nunca vai pro navegador).
// Precisa das variaveis de ambiente no Vercel: FB_ADS_TOKEN, FB_AD_ACCOUNT_ID, PANEL_KEY
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACCT = process.env.FB_AD_ACCOUNT_ID;
const TOKEN = process.env.FB_ADS_TOKEN;
const KEY = process.env.PANEL_KEY || "cdo-9f3k7m2q";

async function g(path, params = {}) {
  const u = new URL(`https://graph.facebook.com/v21.0/${path}`);
  u.searchParams.set("access_token", TOKEN);
  for (const k in params) u.searchParams.set(k, params[k]);
  const r = await fetch(u.toString(), { cache: "no-store" });
  return r.json();
}
const val = (actions, type) => {
  const a = (actions || []).find((x) => x.action_type === type);
  return a ? Number(a.value) : 0;
};
const conversas = (a) =>
  val(a, "onsite_conversion.messaging_conversation_started_7d") ||
  val(a, "onsite_conversion.messaging_first_reply") ||
  val(a, "onsite_conversion.total_messaging_connection");
const lead = (a) => val(a, "lead") || val(a, "offsite_conversion.fb_pixel_lead");

export async function GET(request) {
  const k = new URL(request.url).searchParams.get("k");
  if (!TOKEN || !ACCT) return Response.json({ ok: false, erro: "Configure FB_ADS_TOKEN e FB_AD_ACCOUNT_ID no Vercel" });
  if (k !== KEY) return Response.json({ ok: false, erro: "Chave invalida" }, { status: 401 });
  try {
    const acct = await g(ACCT, { fields: "name,amount_spent,funding_source_details" });
    if (acct.error) return Response.json({ ok: false, erro: acct.error.message });
    const adsR = await g(`${ACCT}/ads`, {
      fields: "name,effective_status,insights.date_preset(today){spend,impressions,inline_link_clicks,actions}",
      limit: "50",
    });
    const ads = (adsR.data || []).map((a) => {
      const i = (a.insights && a.insights.data && a.insights.data[0]) || {};
      return {
        nome: a.name,
        status: a.effective_status,
        spend: Number(i.spend || 0),
        impr: Number(i.impressions || 0),
        clicks: Number(i.inline_link_clicks || 0),
        lpv: val(i.actions, "landing_page_view"),
        lead: lead(i.actions),
        conversas: conversas(i.actions),
      };
    });
    const tot = ads.reduce(
      (s, a) => ({ sp: s.sp + a.spend, im: s.im + a.impr, cl: s.cl + a.clicks, lpv: s.lpv + a.lpv, lead: s.lead + a.lead, conv: s.conv + a.conversas }),
      { sp: 0, im: 0, cl: 0, lpv: 0, lead: 0, conv: 0 }
    );
    // dados que o robô empurra do PC (membros do grupo + ações) via KV
    let robo = null;
    try {
      const kvUrl = process.env.KV_REST_API_URL, kvTok = process.env.KV_REST_API_TOKEN;
      if (kvUrl && kvTok) {
        const kr = await fetch(kvUrl + "/get/robo:status", { headers: { Authorization: "Bearer " + kvTok }, cache: "no-store" });
        const kj = await kr.json();
        if (kj && kj.result) robo = typeof kj.result === "string" ? JSON.parse(kj.result) : kj.result;
      }
    } catch (e) {}

    return Response.json({
      ok: true,
      ts: Date.now(),
      conta: { nome: acct.name, saldo: (acct.funding_source_details && acct.funding_source_details.display_string) || "", gastoTotal: Number(acct.amount_spent || 0) / 100 },
      ads: ads.filter((a) => a.spend > 0 || a.status === "ACTIVE" || a.status === "IN_PROCESS" || a.status === "PENDING_REVIEW"),
      tot,
      robo,
    });
  } catch (e) {
    return Response.json({ ok: false, erro: e.message });
  }
}
