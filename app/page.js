async function fetchMelhoresProdutos() {
  const params = new URLSearchParams({
    select: "produto,preco_de,preco_por,desconto,link_imagem,plataforma,data_publicacao",
    ativo: "eq.true",
    preco_por: "gt.25",
    desconto: "gt.10",
    order: "data_publicacao.desc",
    limit: "100",
  });

  const res = await fetch(`${SUPA_URL}/rest/v1/produtos?${params}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  // 🔥 PALAVRAS QUE VENDEM
  const palavrasFortes = [
    "tenis","tênis","nike","adidas",
    "smartwatch","relógio","fone","bluetooth",
    "air fryer","cafeteira","liquidificador",
    "secador","chapinha","escova",
    "aspirador","robo","ventilador",
    "tv","monitor","notebook","celular",
    "iphone","xiaomi","samsung",
    "cadeira","gamer","mouse","teclado",
    "perfume","creme","skincare",
    "whey","suplemento",
    "panela","jogo","kit","mochila","mala"
  ];

  // 🚫 LIXO
  const palavrasRuins = [
    "livro","ebook","apostila","pdf",
    "capa","pelicula","película",
    "adesivo","refil","peça","parafuso",
    "miniatura","amostra","usado"
  ];

  const validos = data
    .filter(p => {
      const nome = (p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      if (!nome) return false;
      if (!Number.isFinite(preco) || preco < 25) return false;
      if (desconto < 10) return false;
      if (!p.link_imagem) return false;

      if (palavrasRuins.some(w => nome.includes(w))) return false;

      return true;
    })
    .map(p => {
      const nome = (p.produto || "").toLowerCase();
      const preco = Number(p.preco_por);
      const desconto = Number(p.desconto);

      let score = 0;

      // 🔥 prioridade por tipo de produto
      if (palavrasFortes.some(w => nome.includes(w))) score += 100;

      // 💸 desconto
      if (desconto >= 70) score += 40;
      else if (desconto >= 50) score += 30;
      else if (desconto >= 30) score += 20;

      // 💰 faixa de preço que mais converte
      if (preco >= 50 && preco <= 300) score += 30;
      if (preco > 300 && preco <= 1200) score += 20;

      // 🏪 confiança da plataforma
      if (p.plataforma === "mercado_livre") score += 15;
      if (p.plataforma === "amazon") score += 12;
      if (p.plataforma === "shopee") score += 8;

      // bônus leve por desconto
      score += desconto * 0.3;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  // 🧠 remove duplicados parecidos
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
