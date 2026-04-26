"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

const WA_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

const SUPA_URL = "https://zqkcsucactezbampkbps.supabase.co";
const SUPA_KEY = "sb_publishable_WVQdo69bguY3Bb55NP4sJA_le7IVszi";

async function fetchMelhoresProdutos() {
  const params = new URLSearchParams({
    select:
      "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    preco_por: "gt.40",
    desconto: "gt.15",
    order: "data_publicacao.desc",
    limit: "100",
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
    },
  });

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const palavrasFortes = [
    "tenis","tênis","nike","adidas",
    "smartwatch","fone","air fryer",
    "cafeteira","secador","chapinha",
    "tv","monitor","notebook","celular",
    "iphone","xiaomi","samsung",
    "cadeira","gamer","perfume","panela"
  ];

  const palavrasRuins = [
    "livro","ebook","capa","pelicula",
    "adesivo","refil","parafuso","miniatura"
  ];

  const validos = data
    .filter(p => {
      const nome = (p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      if (!nome) return false;
      if (preco < 40) return false;
      if (desconto < 15) return false;
      if (palavrasRuins.some(w => nome.includes(w))) return false;

      return true;
    })
    .map(p => {
      const nome = (p.produto || "").toLowerCase();
      let score = 0;

      if (palavrasFortes.some(w => nome.includes(w))) score += 150;

      if (p.desconto >= 70) score += 40;
      else if (p.desconto >= 50) score += 30;

      if (p.preco_por >= 50 && p.preco_por <= 500) score += 30;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  return validos.slice(0, 4);
}

export default function Page() {
  const [produtos, setProdutos] = useState([]);
  const [showFloat, setShowFloat] = useState(false);

  useEffect(() => {
    fetchMelhoresProdutos().then(setProdutos);

    setTimeout(() => {
      setShowFloat(true);
    }, 3000);
  }, []);

  function goWhats() {
    sendEvent("click");
    window.location.href = WA_URL;
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20 }}>

      <h1 style={{ textAlign: "center", color: "#FFD700" }}>
        CENTRAL DE OFERTAS
      </h1>

      <p style={{ textAlign: "center", fontSize: 22 }}>
        Promoções reais todos os dias no <b style={{ color: "#FFD700" }}>WhatsApp</b>
      </p>

      <div style={{ textAlign: "center", color: "#22c55e", fontWeight: "900" }}>
        🔥 Mais de 1200 pessoas entraram hoje
      </div>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 10,
        marginTop: 20
      }}>
        {produtos.map((p, i) => (
          <div
            key={i}
            onClick={goWhats}
            style={{
              border: "1px solid gold",
              borderRadius: 10,
              padding: 10,
              cursor: "pointer"
            }}
          >
            <img src={p.link_imagem} style={{ width: "100%" }} />

            <p>{p.produto}</p>

            <p style={{ textDecoration: "line-through" }}>
              R$ {p.preco_de}
            </p>

            <p style={{ color: "#FFD700", fontWeight: "bold" }}>
              R$ {p.preco_por}
            </p>

            <span style={{
              background: "green",
              padding: 4,
              borderRadius: 5
            }}>
              {Math.round(p.desconto)}% OFF
            </span>
          </div>
        ))}
      </div>

      {/* BOTÃO PRINCIPAL */}
      <button
        onClick={goWhats}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 15,
          background: "#25D366",
          color: "#fff",
          fontSize: 18,
          borderRadius: 10,
          fontWeight: "bold"
        }}
      >
        💬 ENTRAR NO GRUPO GRÁTIS (Vagas limitadas)
      </button>

      {/* BOTÃO FLUTUANTE */}
      {showFloat && (
        <button
          onClick={goWhats}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "14px 18px",
            background: "#25D366",
            color: "#fff",
            borderRadius: 50,
            fontWeight: "bold",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)"
          }}
        >
          🔥 Entrar agora
        </button>
      )}
    </div>
  );
}
