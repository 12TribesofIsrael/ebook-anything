# Claude Content Studio

A collection of Claude Code skills for turning raw transcripts into polished learning materials.

## What's Inside

### `ebook-anything` Skill

Drop any markdown transcript or document in, get three learning artifacts out:

| Output | What It Is |
|--------|-----------|
| `study-guide.md` | Hierarchical college-level outline with key terms, note-taking blocks, and reflection questions |
| `howto-guide.md` | Actionable checkbox checklists with verification steps and a quick reference card |
| `[topic]-ebook.html` | Styled, self-contained HTML ebook ready to share or print to PDF |

The HTML ebook ships in one of **6 color themes** — chosen automatically based on content tone, or specified manually:

| Theme | Best For |
|-------|----------|
| `midnight` | Tech, coding, developer content |
| `ocean` | Business, productivity, professional |
| `earth` | Creative, lifestyle, personal development |
| `minimal` | Academic, research, reference |
| `editorial` | Bold topics, marketing, high-energy content |
| `sage` | Wellness, nature, slow topics |

## Requirements

- [Claude Code](https://claude.ai/code) installed
- Python 3.8+
- Internet connection (for first-run package install)

## Installation

Clone this repo, then copy the skill to your personal Claude skills folder:

```bash
git clone https://github.com/your-username/claude-content-studio.git
cp -r claude-content-studio/.claude/skills/ebook-anything ~/.claude/skills/
```

Or use it as a project-level skill by leaving it in `.claude/skills/` inside your working directory.

## Usage

```
/ebook-anything path/to/transcript.md
/ebook-anything path/to/transcript.md path/to/output/
/ebook-anything path/to/transcript.md path/to/output/ midnight
```

**Arguments:**
1. Input file path (required) — any `.md` file
2. Output directory (optional) — defaults to same folder as input
3. Theme (optional) — `midnight`, `ocean`, `earth`, `minimal`, `editorial`, or `sage`

### Example

```
/ebook-anything ~/transcripts/course.md ~/Desktop/output/ ocean
```

Produces:
```
~/Desktop/output/
├── study-guide.md
├── howto-guide.md
├── course-ebook.md
└── course-ebook.html   ← open in browser, or print to PDF
```

## Handling Large Transcripts

YouTube transcript exports are often a single 300KB+ line. The skill detects this automatically and uses `scripts/read_large_file.py` to chunk it into processable segments — no manual intervention needed.

## File Structure

```
.claude/
└── skills/
    └── ebook-anything/
        ├── SKILL.md                  ← skill definition and instructions
        └── scripts/
            ├── setup.py              ← installs required Python packages
            ├── read_large_file.py    ← handles large / single-line transcripts
            └── export_html.py        ← converts markdown to themed HTML
```

## How It Works

1. **Analyze** — reads the transcript, identifies topic, sections, audience, and tone
2. **Study guide** — builds a hierarchical outline with Parts, Roman numeral sections, key terms tables, and note-taking blocks
3. **How-to guide** — extracts all procedures as checkbox checklists with verification steps
4. **Ebook** — writes a beginner-friendly narrative guide in chapters, conversational tone, real-world examples
5. **Export** — converts the ebook markdown to a self-contained styled HTML file using the chosen theme

## License

MIT
