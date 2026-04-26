// lib/tracking.js

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return null;
  const key = "co_vid";
  let vid = sessionStorage.getItem(key);
  if (!vid) {
    vid =
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);
    sessionStorage.setItem(key, vid);
  }
  return vid;
}

function getUTMParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    fbclid: params.get("fbclid") || "",
  };
}

function getDeviceType() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua))
    return "mobile";
  return "desktop";
}

export async function sendEvent(eventType) {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  const utms = getUTMParams();

  const payload = {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    visitor_id: getOrCreateVisitorId(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    device_type: getDeviceType(),
    ...utms,
  };

  try {
    await Promise.race([
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 300)
      ),
    ]);
  } catch (_) {
    // Silently fail — never block the user
  }
}
