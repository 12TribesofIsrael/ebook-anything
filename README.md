# ebook-anything

A Claude Code skill that converts any markdown transcript into a full learning package — study guide, how-to checklist, styled HTML ebook, and PDF — all organized into a dedicated course folder.

## Output

Drop in any `.md` transcript. Get back a `courses/[topic]/` folder with five files:

| File | What It Is |
|------|-----------|
| `study-guide.md` | Hierarchical college-level outline with key terms, note-taking blocks, and reflection questions |
| `howto-guide.md` | Actionable checkbox checklists with verification steps and a quick reference card |
| `[topic]-ebook.md` | Ebook markdown source |
| `[topic]-ebook.html` | Styled, self-contained HTML ebook — opens in any browser |
| `[topic]-ebook.pdf` | Print-ready PDF generated from the HTML |

## Color Themes

The HTML and PDF ebook renders in one of 6 themes — auto-selected based on content tone, or specified manually:

| Theme | Best For | Style |
|-------|----------|-------|
| `midnight` | Tech, coding, developer content | Dark bg, purple accent |
| `ocean` | Business, productivity, professional | Light blue tones |
| `earth` | Creative, lifestyle, personal development | Off-white, terracotta |
| `minimal` | Academic, research, reference | Clean white, black type |
| `editorial` | Bold topics, marketing, high-energy | Dark bg, red-orange accent |
| `sage` | Wellness, nature, slow topics | Soft greens, calming |

## Requirements

- [Claude Code](https://claude.ai/code)
- Python 3.8+
- Node.js 18+ (for PDF generation)

## Installation

Clone and copy the skill to your personal Claude skills folder:

```bash
git clone https://github.com/12TribesofIsrael/ebook-anything.git
cp -r ebook-anything/.claude/skills/ebook-anything ~/.claude/skills/
```

Install Node dependencies (one time):

```bash
cd ~/.claude/skills/ebook-anything && npm install
```

Or use it as a project-level skill by leaving `.claude/skills/ebook-anything/` inside your working directory.

## Usage

```
/ebook-anything path/to/transcript.md
/ebook-anything path/to/transcript.md path/to/output/
/ebook-anything path/to/transcript.md path/to/output/ midnight
```

**Arguments:**
1. Input `.md` file (required)
2. Output parent directory (optional — defaults to same folder as input)
3. Theme name (optional — Claude picks automatically if omitted)

### Example

```
/ebook-anything ~/transcripts/course.md ~/Desktop/ ocean
```

Output:

```
~/Desktop/courses/course/
├── study-guide.md
├── howto-guide.md
├── course-ebook.md
├── course-ebook.html
└── course-ebook.pdf
```

## Large Transcripts

YouTube transcript exports are often a single 300KB+ line. The skill detects this automatically and chunks it for processing — no manual intervention needed.

## How It Works

1. **Setup** — installs Python (`markdown2`) and Node (`puppeteer`) packages on first run
2. **Analyze** — reads the transcript, identifies topic, audience, major sections, and tone
3. **Study guide** — hierarchical outline: Parts, Roman numeral sections, key terms tables, note-taking blocks
4. **How-to guide** — every procedure as a `- [ ]` checkbox with verification steps
5. **Ebook** — beginner-friendly narrative chapters, conversational tone, real-world examples, appendix tables
6. **HTML export** — self-contained styled HTML using the chosen color theme
7. **PDF export** — Puppeteer renders the HTML to a print-ready PDF
8. **Organize** — all five files placed into `courses/[topic]/`

## File Structure

```
.claude/skills/ebook-anything/
├── SKILL.md                    ← skill definition and pipeline instructions
├── package.json                ← Node.js dependencies (puppeteer)
└── scripts/
    ├── setup.py                ← installs Python packages (markdown2)
    ├── read_large_file.py      ← chunks large / single-line transcripts
    ├── export_html.py          ← markdown → styled HTML (6 themes)
    └── generate_pdf.js         ← HTML → PDF via Puppeteer
```

## License

MIT
