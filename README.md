# Central de Ofertas — Landing Page

Landing page de alta conversão para anúncios Meta Ads, com tracking próprio via n8n.

## Estrutura

```
central-de-ofertas/
├── app/
│   ├── layout.js          # Layout global + metadados SEO
│   ├── globals.css        # Estilos e animações base
│   ├── page.js            # Landing page principal
│   └── dashboard/
│       └── page.js        # Dashboard de relatório (/dashboard)
├── lib/
│   └── tracking.js        # Lógica de envio de eventos ao n8n
├── .env.example           # Variáveis necessárias
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
# URL do grupo do WhatsApp
NEXT_PUBLIC_WHATSAPP_GROUP_URL=https://chat.whatsapp.com/K7y2RlgUuAc0Xepn0qHYBD

# URL do Webhook do seu n8n (crie um nó Webhook no n8n)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://centraldeofertas.app.n8n.cloud/webhook/landing-tracker

# (Opcional) Para o dashboard ler dados do Google Sheets via CSV público
NEXT_PUBLIC_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/SEU_ID/export?format=csv&gid=0
```

---

## Payload enviado ao n8n

Para cada evento, o webhook recebe:

```json
{
  "event_type": "page_view",
  "timestamp": "2025-05-10T14:32:00.000Z",
  "visitor_id": "k9x3m7z1t8",
  "user_agent": "Mozilla/5.0 (iPhone; ...) ...",
  "referrer": "https://www.facebook.com/",
  "page_url": "https://centraldeoferta.vercel.app/?utm_source=facebook&utm_medium=cpc&utm_campaign=meta-maio&fbclid=...",
  "device_type": "mobile",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "meta-maio",
  "utm_content": "video-01",
  "utm_term": "",
  "fbclid": "IwAR3abc..."
}
```

`event_type` pode ser:
- `"page_view"` — quando a pessoa acessa a landing
- `"group_click"` — quando a pessoa clica em "Entrar no grupo grátis"

---

## Configuração do n8n

1. Crie um novo workflow.
2. Adicione nó **Webhook** (método POST, path: `landing-tracker`).
3. Conecte ao nó **Google Sheets** → Append Row.
4. Mapeie os campos do payload para as colunas da planilha.
5. Ative o workflow.
6. Copie a URL de produção do webhook e cole em `NEXT_PUBLIC_N8N_WEBHOOK_URL`.

Colunas sugeridas na planilha:
```
event_type | timestamp | visitor_id | device_type | utm_source | utm_medium | utm_campaign | utm_content | utm_term | fbclid | referrer | page_url | user_agent
```

---

## Como rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:3000
# Dashboard em http://localhost:3000/dashboard
```

---

## Deploy na Vercel

```bash
# 1. Suba para o GitHub
git init
git add .
git commit -m "feat: landing page inicial"
git remote add origin https://github.com/SEU_USUARIO/central-de-ofertas-landing.git
git push -u origin main

# 2. Acesse vercel.com → New Project → importe o repositório
# 3. Em "Environment Variables", adicione as três variáveis do .env.local
# 4. Deploy automático!
```

---

## UTMs para os anúncios

Modelo de URL para usar nos conjuntos de anúncios:

```
https://SEU_DOMINIO.vercel.app/?utm_source=facebook&utm_medium=cpc&utm_campaign=NOME_CAMPANHA&utm_content=NOME_ANUNCIO&fbclid={{fbc}}
```

Parâmetros dinâmicos do Meta Ads:
- `{{campaign.name}}` → nome da campanha
- `{{adset.name}}` → nome do conjunto
- `{{ad.name}}` → nome do anúncio

Exemplo completo:
```
https://SEU_DOMINIO.vercel.app/?utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&fbclid={{fbc}}
```

---

## Como calcular taxa de conversão

```
Taxa = (total de group_click / total de page_view) × 100
```

Exemplo: 120 cliques / 300 visitas = **40% de conversão**

---

## Como testar o tracking

1. Abra a landing com uma UTM de teste:
   ```
   http://localhost:3000/?utm_source=teste&utm_campaign=debug
   ```
2. Abra o DevTools → Network → filtre por `webhook` ou o domínio do seu n8n.
3. Verifique se a requisição `page_view` aparece ao carregar.
4. Clique no botão e verifique se `group_click` é enviado.
5. No n8n, abra o histórico de execuções do webhook e confirme os dados recebidos.
6. Confirme que a linha foi gravada na planilha.

---

## Dashboard

Acesse `/dashboard` para ver:
- Total de visitas e cliques
- Taxa de conversão geral
- Breakdown por campanha UTM

Para dados reais, configure `NEXT_PUBLIC_SHEET_CSV_URL` com o CSV público da sua planilha do Google Sheets.
