# ebook-anything

A Claude Code skill + local web app that converts any markdown transcript into a polished PDF ebook — with a study guide and how-to checklist as bonuses.

## Two Ways to Use It

| | Claude Code Skill | Web App |
|--|------------------|---------|
| **How** | `/ebook-anything transcript.md` | Paste text → browser UI |
| **Who** | You, in your terminal | Anyone with the link |
| **Output** | 5 files in `courses/[topic]/` | PDF download |
| **Requires** | Claude Code + Python + Node.js | Node.js + `ANTHROPIC_API_KEY` |

---

## Web App

### What It Does

Paste any transcript → pick a color theme → watch the progress bar → download your PDF. Every ebook includes a full-page cover with title, subtitle hook, and theme branding.

### Run It Locally

**Option A — double-click:**
Double-click `start.bat` in the project root.

**Option B — terminal:**
```bash
cd src/webapp
cp .env.example .env      # add your Anthropic API key
npm install
npm start
# open http://localhost:3000
```

> **Tip:** Press `Ctrl+Enter` in the textarea to submit without clicking the button.

### How the Conversion Works

```
 10%  Request received — Claude API starts generating ebook content
 65%  Writing complete — building themed HTML
 70%  HTML ready — launching Puppeteer
 80%  Browser open — rendering PDF
 90%  PDF rendering complete
100%  Download ready
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `invalid x-api-key` | Your API key changed — restart the server: `Ctrl+C` then `node server.js` |
| `EADDRINUSE :3000` | Another process owns the port — kill it: `npx kill-port 3000` |
| `Puppeteer not found` | Run `cd src/webapp && npm install` |
| PDF downloads but is blank | Make sure `printBackground: true` — already set in server.js |

> **Note:** The server reads `.env` only on startup. After changing your API key, always restart.

---

## Claude Code Skill

### What It Outputs

Every run creates a `courses/[topic]/` folder with five files:

| File | What It Is |
|------|-----------|
| `study-guide.md` | Hierarchical college-level outline with key terms and note-taking blocks |
| `howto-guide.md` | Checkbox checklists with verification steps and a quick reference card |
| `[topic]-ebook.md` | Ebook markdown source |
| `[topic]-ebook.html` | Styled HTML ebook — opens in any browser |
| `[topic]-ebook.pdf` | Print-ready PDF |

### Install

```bash
git clone https://github.com/12TribesofIsrael/ebook-anything.git
cp -r ebook-anything/.claude/skills/ebook-anything ~/.claude/skills/
cd ~/.claude/skills/ebook-anything && npm install
```

### Usage

```
/ebook-anything path/to/transcript.md
/ebook-anything path/to/transcript.md path/to/output/
/ebook-anything path/to/transcript.md path/to/output/ midnight
```

**Arguments:**
1. Input `.md` file (required)
2. Output parent directory (optional — defaults to same folder as input)
3. Theme name (optional — Claude auto-selects if omitted)

---

## Color Themes

| Theme | Best For | Style |
|-------|----------|-------|
| `midnight` | Tech, coding, developer content | Dark bg, purple accent |
| `ocean` | Business, productivity, professional | Light blue tones |
| `earth` | Creative, lifestyle, personal development | Off-white, terracotta |
| `minimal` | Academic, research, reference | Clean white, black type |
| `editorial` | Bold topics, marketing, high-energy | Dark bg, red-orange accent |
| `sage` | Wellness, nature, slow topics | Soft greens, calming |

---

## Requirements

### Web App

| Requirement | Used For |
|-------------|---------|
| Node.js 18+ | Running the Express server + Puppeteer |
| `ANTHROPIC_API_KEY` | Claude API calls |

### Claude Code Skill

| Requirement | Used For |
|-------------|---------|
| [Claude Code](https://claude.ai/code) | Running the skill |
| Python 3.8+ | Markdown → HTML conversion |
| Node.js 18+ | PDF generation (Puppeteer) |

---

## Large Transcripts

YouTube transcript exports are often a single 300KB+ line. The skill detects this automatically and chunks it for processing — no manual steps needed.

---

## File Structure

```
ebook-anything/
├── src/
│   └── webapp/
│       ├── server.js               ← Express + Claude API + Puppeteer + SSE
│       ├── package.json            ← includes marked + puppeteer
│       ├── .env.example
│       └── public/
│           └── index.html          ← landing page
│
├── .claude/
│   └── skills/
│       └── ebook-anything/
│           ├── SKILL.md            ← skill definition and pipeline
│           ├── package.json        ← puppeteer dependency
│           └── scripts/
│               ├── setup.py        ← installs Python packages
│               ├── read_large_file.py   ← handles large transcripts
│               ├── export_html.py  ← markdown → themed HTML
│               └── generate_pdf.js ← HTML → PDF via Puppeteer
│
├── scripts/                        ← add new Node utilities here
├── courses/                        ← generated output from /ebook-anything skill
├── output/                         ← manual or legacy generated files
├── start.bat                       ← double-click to launch the web app
├── CLAUDE.md
├── README.md
└── .gitignore
```

---

## License

MIT
