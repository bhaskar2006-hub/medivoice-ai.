# MediVoice AI — Deployment Guide

## Files
```
medivoice-ai/
├── server.js          ← Express backend (Murf + Claude proxies)
├── package.json
├── railway.toml       ← Railway config
├── render.yaml        ← Render config
├── .env.example       ← Copy to .env for local dev
└── public/
    └── index.html     ← Frontend SPA
```

---

## Option A — Railway (Recommended, ~2 min)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Push this folder to a GitHub repo first:
   ```bash
   git init && git add . && git commit -m "MediVoice AI"
   gh repo create medivoice-ai --public --push
   ```
3. In Railway: connect that repo → it auto-detects Node.js
4. Add environment variables in Railway dashboard:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `MURF_API_KEY` = your Murf key
5. Deploy → get your URL like `https://medivoice-ai.up.railway.app`

---

## Option B — Render (Free tier)

1. Push to GitHub (same as above)
2. Go to https://render.com → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add env vars: `ANTHROPIC_API_KEY` and `MURF_API_KEY`
6. Deploy

---

## Option C — Local / VPS

```bash
# Clone / copy files
npm install
cp .env.example .env
# Edit .env — add your keys
node server.js
# Open http://localhost:3001
```

For VPS with nginx + PM2:
```bash
npm install -g pm2
pm2 start server.js --name medivoice
pm2 save
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | From console.anthropic.com |
| `MURF_API_KEY` | Yes | From murf.ai/api/dashboard |
| `PORT` | No | Defaults to 3001 |

---

## Why server-side proxy for Murf?
Murf AI's API does not send CORS headers — direct browser calls are blocked.
The Express server proxies the request server-to-server, which has no CORS restrictions.
Both `ANTHROPIC_API_KEY` and `MURF_API_KEY` stay on the server and are never exposed to the browser.
