"use client";

import { useEffect, useState } from "react";
import { sendEvent } from "../lib/tracking";

const WA_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD";

const SUPA_URL = "https://zqkcsucactezbampkbps.supabase.co";
const SUPA_KEY = "sb_publishable_WVQdo69bguY3Bb55NP4sJA_le7IVszi";
const IMG_FALLBACK = "https://placehold.co/400x400/111111/FFD700?text=Oferta";

async function fetchMelhoresProdutos() {
  const params = new URLSearchParams({
    select:
      "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    preco_por: "gt.50",
    desconto: "gt.20",
    order: "data_publicacao.desc",
    limit: "120",
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // 🔥 PRODUTOS QUE VENDEM
  const palavrasFortes = [
    "tenis","tênis","nike","adidas","fila","olympikus",
    "smartwatch","fone","bluetooth",
    "air fryer","cafeteira","liquidificador",
    "secador","chapinha","escova",
    "aspirador","ventilador",
    "tv","monitor","notebook","celular",
    "iphone","xiaomi","samsung",
    "cadeira","gamer","mouse","teclado",
    "perfume","creme","skincare",
    "whey","suplemento",
    "panela","kit","mochila","mala"
  ];

  // 🚫 PRODUTOS RUINS
  const palavrasRuins = [
    "livro","ebook","apostila","pdf",
    "capa","pelicula","película",
    "adesivo","refil","parafuso",
    "miniatura","amostra","usado"
  ];

  const validos = data
    .filter((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      if (!nome) return false;
      if (!Number.isFinite(preco) || preco < 50) return false;
      if (!Number.isFinite(desconto) || desconto < 20) return false;
      if (!p.link_imagem) return false;
      if (palavrasRuins.some((w) => nome.includes(w))) return false;

      return true;
    })
    .map((p) => {
      const nome = String(p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      let score = 0;

      // 🔥 peso forte (principal mudança)
      if (palavrasFortes.some((w) => nome.includes(w))) score += 200;

      // 💸 desconto
      if (desconto >= 70) score += 40;
      else if (desconto >= 50) score += 30;
      else if (desconto >= 30) score += 20;

      // 💰 faixa que mais converte
      if (preco >= 80 && preco <= 400) score += 40;
      if (preco > 400 && preco <= 1200) score += 25;

      // 🏪 confiança
      if (p.plataforma === "mercado_livre") score += 20;
      if (p.plataforma === "amazon") score += 15;
      if (p.plataforma === "shopee") score += 10;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  // 🧠 remove repetidos
  const selecionados = [];
  const usados = new Set();

  for (const p of validos) {
    if (selecionados.length >= 4) break;

    const chave = p.produto
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .slice(0, 4)
      .join(" ");

    if (usados.has(chave)) continue;

    usados.add(chave);
    selecionados.push(p);
  }

  return selecionados;
}

function moeda(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomePlat(p) {
  if (p === "mercado_livre") return "Mercado Livre";
  if (p === "amazon") return "Amazon";
  if (p === "shopee") return "Shopee";
  return "Oferta";
}

export default function LandingPage() {
  const [produtos, setProdutos] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [showFloat, setShowFloat] = useState(false);

  useEffect(() => {
    fetchMelhoresProdutos().then(setProdutos).catch(() => setProdutos([]));

    setTimeout(() => setShowFloat(true), 3000);
  }, []);

  async function handleCTA() {
    if (clicked) return;
    setClicked(true);
    await sendEvent("group_click");
    window.location.href = WA_URL;
  }

  const loading = produtos === null;
  const cards = loading ? [0, 1, 2, 3] : produtos;

  return (
    <>
      <style>{`
        body {
          background:#050505;
          color:#fff;
          font-family: Arial;
        }

        .grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
        }

        .card {
          border:1px solid gold;
          border-radius:12px;
          padding:10px;
          cursor:pointer;
          transition:.2s;
        }

        .card:hover {
          transform:translateY(-5px) scale(1.02);
          box-shadow:0 0 20px rgba(37,211,102,0.4);
        }

        @media (max-width: 860px){
          .grid{
            grid-template-columns:repeat(2,1fr);
          }
        }

        .float-btn{
          position:fixed;
          bottom:20px;
          right:20px;
          background:#25D366;
          color:#fff;
          padding:14px;
          border-radius:50px;
          font-weight:bold;
        }
      `}</style>

      <div style={{padding:20}}>

        <h1 style={{textAlign:"center",color:"#FFD700"}}>
          CENTRAL DE OFERTAS
        </h1>

        <p style={{textAlign:"center"}}>
          Promoções reais no WhatsApp
        </p>

        <div className="grid">
          {cards.map((p,i)=>(
            <div key={i} className="card" onClick={handleCTA}>
              <img src={p.link_imagem || IMG_FALLBACK} style={{width:"100%"}} />
              <p>{p.produto}</p>
              <p style={{textDecoration:"line-through"}}>
                {moeda(p.preco_de)}
              </p>
              <p style={{color:"#FFD700",fontWeight:"bold"}}>
                {moeda(p.preco_por)}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleCTA}
          style={{
            width:"100%",
            marginTop:20,
            padding:15,
            background:"#25D366",
            color:"#fff",
            fontWeight:"bold"
          }}
        >
          💬 ENTRAR NO GRUPO GRÁTIS
        </button>

      </div>

      {showFloat && (
        <button className="float-btn" onClick={handleCTA}>
          🔥 Entrar agora
        </button>
      )}
    </>
  );
}
