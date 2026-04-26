"use client";

import { useEffect, useState } from "react";

// This dashboard reads from your Google Sheet via a public CSV export URL.
// Set NEXT_PUBLIC_SHEET_CSV_URL in your .env.local to enable live data.
// If not set, shows placeholder data.

const MOCK_DATA = [
  { event_type: "page_view",   utm_campaign: "meta-maio",    utm_source: "facebook" },
  { event_type: "page_view",   utm_campaign: "meta-maio",    utm_source: "facebook" },
  { event_type: "group_click", utm_campaign: "meta-maio",    utm_source: "facebook" },
  { event_type: "page_view",   utm_campaign: "instagram-01", utm_source: "instagram" },
  { event_type: "group_click", utm_campaign: "instagram-01", utm_source: "instagram" },
  { event_type: "page_view",   utm_campaign: "meta-maio",    utm_source: "facebook" },
];

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const csvUrl = process.env.NEXT_PUBLIC_SHEET_CSV_URL;
    if (!csvUrl) {
      setRows(MOCK_DATA);
      setLoading(false);
      return;
    }

    fetch(csvUrl)
      .then((r) => r.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        const parsed = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
        });
        setRows(parsed);
      })
      .catch(() => {
        setError("Não foi possível carregar dados. Verifique NEXT_PUBLIC_SHEET_CSV_URL.");
        setRows(MOCK_DATA);
      })
      .finally(() => setLoading(false));
  }, []);

  const views  = rows.filter((r) => r.event_type === "page_view").length;
  const clicks = rows.filter((r) => r.event_type === "group_click").length;
  const rate   = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

  // Per-campaign breakdown
  const campaigns = {};
  rows.forEach((r) => {
    const c = r.utm_campaign || "(sem campanha)";
    if (!campaigns[c]) campaigns[c] = { views: 0, clicks: 0 };
    if (r.event_type === "page_view")   campaigns[c].views++;
    if (r.event_type === "group_click") campaigns[c].clicks++;
  });

  return (
    <>
      <style>{`
        body { background: #0A0A0A; color: #fff; font-family: 'Segoe UI', system-ui, sans-serif; }
        .dash { max-width: 600px; margin: 0 auto; padding: 32px 20px 60px; }
        h1 { font-size: 1.4rem; font-weight: 900; color: #FFD700; margin-bottom: 6px; }
        .subtitle { font-size: 0.82rem; color: #666; margin-bottom: 32px; }
        .note { font-size: 0.78rem; background: #1a1a1a; border: 1px solid #333; border-radius: 10px;
          padding: 12px 14px; color: #aaa; margin-bottom: 28px; line-height: 1.5; }
        .note code { background: #2a2a2a; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; color: #FFD700; }
        .cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 18px 14px; text-align: center; }
        .card-value { font-size: 2rem; font-weight: 900; line-height: 1; }
        .card-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
        .card.green .card-value { color: #25D366; }
        .card.yellow .card-value { color: #FFD700; }
        .card.white .card-value { color: #fff; }
        .table-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #FFD700; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th { text-align: left; padding: 8px 10px; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 0.07em; color: #555; border-bottom: 1px solid #222; }
        td { padding: 11px 10px; border-bottom: 1px solid #1a1a1a; color: #ddd; }
        td.num { text-align: right; font-weight: 700; }
        td.rate { text-align: right; color: #25D366; font-weight: 700; }
        tr:last-child td { border-bottom: none; }
        .loading { color: #555; text-align: center; padding: 40px; }
        .error { color: #ff6b6b; font-size: 0.85rem; margin-bottom: 16px; }
        .mock-badge { display: inline-block; background: #2a2a2a; color: #666;
          font-size: 0.7rem; padding: 3px 8px; border-radius: 4px; margin-left: 8px; vertical-align: middle; }
      `}</style>

      <div className="dash">
        <h1>📊 Dashboard — Central de Ofertas</h1>
        <p className="subtitle">
          Analytics da landing page
          {!process.env.NEXT_PUBLIC_SHEET_CSV_URL && (
            <span className="mock-badge">dados de exemplo</span>
          )}
        </p>

        {!process.env.NEXT_PUBLIC_SHEET_CSV_URL && (
          <div className="note">
            <strong>Para dados reais:</strong> adicione{" "}
            <code>NEXT_PUBLIC_SHEET_CSV_URL</code> no seu{" "}
            <code>.env.local</code>. Exporte sua planilha como CSV público no
            Google Sheets → Arquivo → Compartilhar → Publicar na web → CSV.
          </div>
        )}

        {error && <p className="error">⚠️ {error}</p>}

        {loading ? (
          <p className="loading">Carregando dados…</p>
        ) : (
          <>
            <div className="cards">
              <div className="card white">
                <div className="card-value">{views}</div>
                <div className="card-label">Visitas</div>
              </div>
              <div className="card green">
                <div className="card-value">{clicks}</div>
                <div className="card-label">Cliques</div>
              </div>
              <div className="card yellow">
                <div className="card-value">{rate}%</div>
                <div className="card-label">Conversão</div>
              </div>
            </div>

            <div className="table-title">Por campanha UTM</div>
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th style={{ textAlign: "right" }}>Visitas</th>
                  <th style={{ textAlign: "right" }}>Cliques</th>
                  <th style={{ textAlign: "right" }}>Conversão</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(campaigns).map(([camp, data]) => (
                  <tr key={camp}>
                    <td>{camp}</td>
                    <td className="num">{data.views}</td>
                    <td className="num">{data.clicks}</td>
                    <td className="rate">
                      {data.views > 0
                        ? ((data.clicks / data.views) * 100).toFixed(1) + "%"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
