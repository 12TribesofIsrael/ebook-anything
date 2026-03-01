require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Resolve Puppeteer from the ebook-anything skill
const puppeteerPath = path.resolve(
  __dirname, '../../.claude/skills/ebook-anything/node_modules/puppeteer'
);
let puppeteer;
try {
  puppeteer = require(puppeteerPath);
} catch {
  console.error('Puppeteer not found. Run: cd .claude/skills/ebook-anything && npm install');
  process.exit(1);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Color Themes (ported from export_html.py) ─────────────────────────────────

const THEMES = {
  midnight: {
    label: 'Midnight', bg: '#0d0d0d', surface: '#1a1a2e', text: '#e2e2e2',
    textMuted: '#888899', accent: '#7c3aed', accentLight: '#a78bfa',
    heading: '#f0f0ff', border: '#2a2a40', codeBg: '#12121f', codeText: '#a78bfa',
    bqBg: '#16162a', bqBorder: '#7c3aed', thBg: '#1e1e3a', trAlt: '#15152a',
    link: '#a78bfa', fontHeading: "'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontMono: "'Cascadia Code', 'Fira Code', monospace",
  },
  ocean: {
    label: 'Ocean', bg: '#f0f6ff', surface: '#ffffff', text: '#1e3a5f',
    textMuted: '#5a7a9a', accent: '#2563eb', accentLight: '#3b82f6',
    heading: '#0f2a4a', border: '#c8ddf5', codeBg: '#e8f0fb', codeText: '#1a4080',
    bqBg: '#e8f2ff', bqBorder: '#2563eb', thBg: '#daeaff', trAlt: '#f0f7ff',
    link: '#2563eb', fontHeading: "'Segoe UI', Georgia, serif",
    fontBody: "'Segoe UI', system-ui, sans-serif", fontMono: "Consolas, monospace",
  },
  earth: {
    label: 'Earth', bg: '#f2efe6', surface: '#fffdf8', text: '#2d1b00',
    textMuted: '#7a6040', accent: '#c38133', accentLight: '#d4a055',
    heading: '#1a0f00', border: '#e0d4be', codeBg: '#ede8dc', codeText: '#8b4513',
    bqBg: '#f5efe0', bqBorder: '#c38133', thBg: '#e8dfc8', trAlt: '#f5f0e8',
    link: '#a0631a', fontHeading: "Georgia, serif",
    fontBody: "'Segoe UI', system-ui, sans-serif", fontMono: "Consolas, monospace",
  },
  minimal: {
    label: 'Minimal', bg: '#ffffff', surface: '#ffffff', text: '#111111',
    textMuted: '#666666', accent: '#000000', accentLight: '#333333',
    heading: '#000000', border: '#e0e0e0', codeBg: '#f5f5f5', codeText: '#222222',
    bqBg: '#f9f9f9', bqBorder: '#bbbbbb', thBg: '#f0f0f0', trAlt: '#fafafa',
    link: '#000000', fontHeading: "Georgia, serif",
    fontBody: "Georgia, serif", fontMono: "'Courier New', monospace",
  },
  editorial: {
    label: 'Editorial', bg: '#111111', surface: '#1a1a1a', text: '#f0f0f0',
    textMuted: '#888888', accent: '#ff4d00', accentLight: '#ff7040',
    heading: '#ffffff', border: '#2a2a2a', codeBg: '#0d0d0d', codeText: '#ff7040',
    bqBg: '#1e1e1e', bqBorder: '#ff4d00', thBg: '#222222', trAlt: '#161616',
    link: '#ff7040', fontHeading: "'Arial Black', Impact, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif", fontMono: "Consolas, monospace",
  },
  sage: {
    label: 'Sage', bg: '#f4f7f2', surface: '#fafcf8', text: '#2a3b2a',
    textMuted: '#5a7a5a', accent: '#4a7a4a', accentLight: '#6a9a6a',
    heading: '#1a2e1a', border: '#cddeca', codeBg: '#e8f0e5', codeText: '#2d5a2d',
    bqBg: '#ecf4e9', bqBorder: '#4a7a4a', thBg: '#d8ecda', trAlt: '#f0f8ee',
    link: '#3a6a3a', fontHeading: "Georgia, serif",
    fontBody: "'Segoe UI', system-ui, sans-serif", fontMono: "Consolas, monospace",
  },
};

// ── Markdown → HTML (minimal parser for ebook output) ────────────────────────

function mdToHtml(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // headings
    .replace(/^#{6} (.+)$/gm, '<h6>$1</h6>')
    .replace(/^#{5} (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#{4} (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // bold / italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // hr
    .replace(/^---+$/gm, '<hr>')
    // tables (simple 3-col max)
    .replace(/^\|(.+)\|$/gm, (match, inner) => {
      const cells = inner.split('|').map(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    // wrap consecutive <tr> in <table>
    .replace(/((<tr>.+<\/tr>\n?)+)/g, (block) => {
      const rows = block.trim().split('\n');
      const header = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
      const body = rows.slice(2).join('\n'); // skip separator row
      return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
    })
    // unordered lists
    .replace(/(^- .+$(\n^- .+$)*)/gm, (block) => {
      const items = block.split('\n').map(l => `<li>${l.slice(2)}</li>`).join('');
      return `<ul>${items}</ul>`;
    })
    // paragraphs
    .replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>')
    // collapse excess newlines
    .replace(/\n{3,}/g, '\n\n');
}

function buildHtml(markdownContent, title, themeName) {
  const t = THEMES[themeName] || THEMES.earth;
  const body = mdToHtml(markdownContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${t.fontBody};font-size:17px;line-height:1.75;background:${t.bg};color:${t.text};padding:0}
    .wrap{max-width:760px;margin:0 auto;padding:3rem 2rem 6rem}
    .cover{text-align:center;padding:4rem 0 3rem;border-bottom:2px solid ${t.border};margin-bottom:3rem}
    .badge{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;background:${t.bqBg};color:${t.accent};padding:4px 12px;border-radius:20px;margin-bottom:1.5rem;font-family:${t.fontMono}}
    .cover h1{font-family:${t.fontHeading};font-size:clamp(2rem,5vw,3.2rem);font-weight:800;color:${t.heading};line-height:1.2}
    h1,h2,h3,h4{font-family:${t.fontHeading};color:${t.heading};line-height:1.3;margin-top:2.5rem;margin-bottom:.75rem}
    h2{font-size:1.55rem;font-weight:700;padding-bottom:.4rem;border-bottom:2px solid ${t.accent};color:${t.accent};margin-top:3rem}
    h3{font-size:1.2rem;font-weight:700}
    p{margin-bottom:1.1rem}
    ul,ol{margin:.75rem 0 1.1rem 1.5rem}
    li{margin-bottom:.35rem}
    a{color:${t.link}}
    blockquote{background:${t.bqBg};border-left:4px solid ${t.bqBorder};border-radius:0 8px 8px 0;padding:1rem 1.25rem;margin:1.5rem 0;font-style:italic}
    code{font-family:${t.fontMono};font-size:.88em;background:${t.codeBg};color:${t.codeText};padding:2px 6px;border-radius:4px}
    pre{background:${t.codeBg};border:1px solid ${t.border};border-radius:8px;padding:1.25rem 1.5rem;overflow-x:auto;margin:1.25rem 0}
    pre code{background:none;padding:0}
    table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:.95em}
    th{background:${t.thBg};color:${t.heading};font-weight:700;text-align:left;padding:.6rem 1rem;border-bottom:2px solid ${t.border}}
    td{padding:.55rem 1rem;border-bottom:1px solid ${t.border};vertical-align:top}
    tr:nth-child(even) td{background:${t.trAlt}}
    hr{border:none;border-top:1px solid ${t.border};margin:2.5rem 0}
    strong{color:${t.accentLight};font-weight:700}
    .footer{margin-top:5rem;padding-top:2rem;border-top:1px solid ${t.border};text-align:center;font-size:.85rem;color:${t.textMuted};font-family:${t.fontMono}}
    @media print{.cover{page-break-after:always}h2{page-break-before:always}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="cover">
      <div class="badge">${t.label} Edition</div>
      <h1>${title}</h1>
    </div>
    <div class="content">${body}</div>
    <div class="footer">Generated with ebook-anything &nbsp;·&nbsp; ${t.label} theme</div>
  </div>
</body>
</html>`;
}

// ── Claude system prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert content creator. Convert the transcript provided by the user into a polished beginner-friendly ebook in Markdown format.

Structure:
- Title as H1
- One-sentence hook as a blockquote (> text)
- 5–8 chapters as H2 headings (200–400 words each)
- Each chapter builds on the last
- Chapter 1 must acknowledge that beginners may feel overwhelmed, then reframe positively
- Define every technical term in plain language the first time it appears
- Use analogies and real-world examples from the transcript
- At least one motivating real-world outcome per chapter
- Final chapter: "Your First Win" — one concrete action the reader can take today
- Appendix as H2 with 2–3 Quick Reference tables

Rules:
- Conversational tone — knowledgeable friend, not a textbook
- No jargon without definition
- Output ONLY the Markdown. No preamble, no commentary, no code fences around the whole document.`;

// ── In-memory PDF store (token → filepath) ───────────────────────────────────

const pdfStore = new Map();

// ── Routes ────────────────────────────────────────────────────────────────────

app.post('/convert', async (req, res) => {
  const { text, theme } = req.body;

  if (!text || text.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript text is too short.' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // 10% — starting
    send({ progress: 10 });

    // 10–65% — Claude API streaming
    let markdown = '';
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text.trim() }],
    });

    // Simulate smooth progress during streaming (10 → 65)
    let streamProgress = 10;
    const progressInterval = setInterval(() => {
      if (streamProgress < 65) {
        streamProgress += 1;
        send({ progress: streamProgress });
      }
    }, 300);

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        markdown += chunk.delta.text;
      }
    }
    clearInterval(progressInterval);
    send({ progress: 65 });

    // Extract title from first H1
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Your Ebook';

    // 70% — generate HTML
    send({ progress: 70 });
    const html = buildHtml(markdown, title, theme || 'earth');

    // Write HTML to temp file
    const tmpDir = os.tmpdir();
    const id = crypto.randomUUID();
    const htmlPath = path.join(tmpDir, `${id}.html`);
    const pdfPath = path.join(tmpDir, `${id}.pdf`);
    fs.writeFileSync(htmlPath, html, 'utf8');

    // 80% — launch Puppeteer
    send({ progress: 80 });
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

    // 90% — render PDF
    send({ progress: 90 });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await browser.close();

    // Clean up temp HTML
    fs.unlinkSync(htmlPath);

    // Store token → pdf path
    const token = crypto.randomUUID();
    pdfStore.set(token, { path: pdfPath, title });

    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      const entry = pdfStore.get(token);
      if (entry) {
        try { fs.unlinkSync(entry.path); } catch {}
        pdfStore.delete(token);
      }
    }, 10 * 60 * 1000);

    // 100% — done
    send({ progress: 100, token, title });
    res.end();

  } catch (err) {
    console.error(err);
    send({ error: err.message || 'Conversion failed.' });
    res.end();
  }
});

app.get('/download/:token', (req, res) => {
  const entry = pdfStore.get(req.params.token);
  if (!entry || !fs.existsSync(entry.path)) {
    return res.status(404).send('PDF not found or already downloaded.');
  }

  const filename = entry.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const stream = fs.createReadStream(entry.path);
  stream.pipe(res);
  stream.on('end', () => {
    try { fs.unlinkSync(entry.path); } catch {}
    pdfStore.delete(req.params.token);
  });
});

app.listen(PORT, () => {
  console.log(`\n  ebook-anything running at http://localhost:${PORT}\n`);
});
