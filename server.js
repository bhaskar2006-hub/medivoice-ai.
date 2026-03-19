require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const http    = require('http');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    murf:  !!process.env.MURF_API_KEY,
    ts:    Date.now()
  });
});

// ── Murf AI proxy (bypasses CORS) ────────────────────────────
app.post('/api/murf/speak', async (req, res) => {
  const murfKey = process.env.MURF_API_KEY;
  if (!murfKey) {
    return res.status(500).json({ error: 'MURF_API_KEY not set on server' });
  }

  const { text, voiceId, style } = req.body;
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'text and voiceId are required' });
  }

  const clean = text
    .replace(/\*\*/g,'').replace(/\*/g,'')
    .replace(/\[.*?\]/g,'').replace(/<[^>]+>/g,'')
    .replace(/ICD-?10[:\s][A-Z0-9.]+/gi,'')
    .replace(/\s+/g,' ').trim()
    .substring(0, 900);

  try {
    const { default: fetch } = await import('node-fetch');
    const murf = await fetch('https://api.murf.ai/v1/speech/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': murfKey },
      body: JSON.stringify({
        text:         clean,
        voiceId:      voiceId,
        style:        style || 'Conversational',
        modelVersion: 'GEN2',
        format:       'MP3',
        rate:         -5,
        pitch:        0,
        sampleRate:   44100
      })
    });

    if (!murf.ok) {
      const err = await murf.json().catch(() => ({}));
      const msg = err.message || err.error || `Murf HTTP ${murf.status}`;
      if (murf.status === 401 || murf.status === 403)
        return res.status(401).json({ error: 'Invalid Murf API key' });
      if (murf.status === 402)
        return res.status(402).json({ error: 'Murf quota exceeded' });
      return res.status(murf.status).json({ error: msg });
    }

    const data = await murf.json();
    res.json({
      audioFile:            data.audioFile,
      audioLengthInSeconds: data.audioLengthInSeconds
    });

  } catch (e) {
    console.error('Murf proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Gemini proxy (keeps API key server-side) ─────────────────
app.post('/api/gemini/analyze', async (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set on server' });
  }

  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'transcript required' });

  const system = `You are MediVoice AI, a clinical decision support system in a hospital ED. Respond ONLY with valid JSON — no markdown, no backticks.

Format:
{"triage":{"level":"CRITICAL","label":"Triage Level I — Immediate"},"assessment":"2-3 sentence professional medical assessment","differentials":[{"diagnosis":"NSTEMI","confidence":87,"icd10":"I21.4"},{"diagnosis":"Unstable Angina","confidence":61,"icd10":"I20.0"},{"diagnosis":"Musculoskeletal","confidence":12,"icd10":"M54.6"}],"findings":[{"label":"Primary Concern","value":"NSTEMI / ACS","flag":"red"},{"label":"TIMI Score","value":"4/7","flag":"red"},{"label":"Onset","value":"~120 min","flag":"normal"},{"label":"Trigger","value":"Exertional","flag":"normal"}],"actions":[{"label":"12-Lead ECG Stat","urgency":"urgent"},{"label":"Troponin I/T","urgency":"urgent"},{"label":"Notify Cardiology","urgency":"standard"}],"alert":"One-line critical protocol or null","orders":[{"name":"12-Lead ECG","status":"ordered"},{"name":"Troponin I","status":"pending"}],"extractedSymptoms":["Chest tightness","Left arm pain"]}

Patient context: T2DM, HTN, Metformin + Amlodipine, NKDA, premature CAD family history, active smoker 10/day.`;

  try {
    const { default: fetch } = await import('node-fetch');
    // Using v1 stable API for better model availability
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    
    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\nPatient says: "${transcript}"` }] }]
      })
    });

    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: e.error?.message || `Gemini error ${resp.status}` });
    }

    const data = await resp.json();
    const text = data.candidates[0].content.parts[0].text.trim();
    // Strip markdown backticks if Gemini adds them
    const raw  = text.replace(/```json|```/g, '').trim(); 
    res.json(JSON.parse(raw));

  } catch (e) {
    console.error('Gemini proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Fallback → index.html (SPA) ──────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`\n🏥 MediVoice AI running on port ${PORT}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✓ loaded' : '✗ MISSING'}`);
  console.log(`   Murf key:   ${process.env.MURF_API_KEY   ? '✓ loaded' : '✗ MISSING'}\n`);
});
