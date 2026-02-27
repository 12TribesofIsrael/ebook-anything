---
name: ebook-anything
description: Convert any markdown transcript, course notes, or document into a structured ebook with companion study guide and how-to guide. Outputs styled HTML ebooks in one of 6 color themes. Use when the user asks to convert a transcript to an ebook, create learning materials from a document, or make an ebook from a .md file.
argument-hint: "[transcript-file.md] [output-folder (optional)] [theme (optional)]"
disable-model-invocation: true
---

# Ebook Anything

Convert any markdown transcript or document into three learning artifacts **plus** a styled HTML ebook in one of 6 color themes.

## Arguments

- `$ARGUMENTS[0]` — Path to the input markdown file (required)
- `$ARGUMENTS[1]` — Output directory (optional; defaults to same folder as input file)
- `$ARGUMENTS[2]` — Color theme (optional; if omitted, Claude picks based on content tone)

## Available Color Themes

| Theme | Best For | Look |
|-------|----------|------|
| `midnight` | Tech, coding, developer content | Dark bg, purple accent |
| `ocean` | Business, productivity, professional | Light blue tones |
| `earth` | Creative, lifestyle, personal development | Off-white, terracotta |
| `minimal` | Academic, research, reference | Clean white, black type |
| `editorial` | Bold topics, marketing, high-energy content | Dark bg, red/orange accent |
| `sage` | Wellness, nature, slow topics | Soft greens, calming |

If the user does not specify a theme, analyze the content and choose the most fitting one. State which theme you chose and why.

---

## Stage 0 — Setup

### 1. Install required packages (first run only)

```bash
python3 ~/.claude/skills/ebook-anything/scripts/setup.py
```

This installs `markdown2` (converts markdown to HTML). It skips installation if already present.

### 2. Resolve paths

- `INPUT` = `$ARGUMENTS[0]` — normalize path (handle `~`, relative, Windows backslashes)
- `OUTPUT_DIR` = `$ARGUMENTS[1]` if provided, else same directory as input file
- `THEME` = `$ARGUMENTS[2]` if provided, else pick from table above based on content tone

Confirm both INPUT exists and OUTPUT_DIR is writable before proceeding.

### 3. Detect file format and read content

Check file size:

```bash
wc -c "$INPUT"
```

- **If >50KB or appears to be a single long line** (transcript export): use the chunked reader:
  ```bash
  python3 ~/.claude/skills/ebook-anything/scripts/read_large_file.py "$INPUT"
  ```
  Read ALL chunks before proceeding.
- **Otherwise**: use the `Read` tool directly.

### 4. Analyze the content

Identify:
- **Topic / subject** and derive the `[topic]` slug (lowercase, hyphenated, e.g., `claude-code`)
- **Audience** — beginner, practitioner, mixed?
- **Major sections / themes** — the 5–10 primary areas covered
- **Key terminology** — specialized terms that need defining
- **Tone** — formal, casual, technical? (informs theme choice if not specified)

---

## Stage 1 — Create `master.md` (Structured Study Guide)

**Output:** `<output-dir>/master.md`

**Purpose:** Complete hierarchical reference an active learner can annotate.

**Format:**

```
# [Topic]: Complete Study Guide

## Part 1: [Theme Name]

### I. [Section Title]

**A. [Sub-topic]**
   1. [Detail]
      - [Supporting detail or example]
   2. [Detail]

_Notes:_

___

**Questions to Consider:**
- [Reflective question]
- [Another question]

---

### Key Terms — Part 1
| Term | Definition |
|------|-----------|
| `term` | Plain-language definition |
```

**Rules:**
- Organize into Parts (Part 1, Part 2...) by theme; each Part has 3–6 Roman numeral sections
- Every major point gets a blank `_Notes:_` block for user annotation
- Key Terms table at end of each Part
- Bold key concepts inline; backtick commands and filenames
- Include "Questions to Consider" per section
- Aim for depth — this is the complete reference

---

## Stage 2 — Create `howto.md` (Procedural Checklist Guide)

**Output:** `<output-dir>/howto.md`

**Purpose:** Task-oriented companion for doing things, not just understanding them.

**Format:**

```
# [Topic]: How-To Guide

## 1. [Category]

**How to [specific task]:**
- [ ] Imperative step — exact action
- [ ] Next step
  - [ ] Sub-step if needed
- [ ] Verification: confirm you see [expected result] or run `[cmd]` and verify `[output]`
```

**Rules:**
- 8–10 major sections matching source structure
- Every action is a checkbox `- [ ]` — imperative, specific: "Open...", "Run...", "Click..."
- Verification sub-step for every major procedure
- End with a **Quick Reference Card** table: `| Task | Command / Action |`

---

## Stage 3 — Create `[topic]-ebook.md` (Beginner Ebook — Markdown Draft)

**Output:** `<output-dir>/[topic]-ebook.md`

**Purpose:** Beginner-friendly readable guide. This is converted to styled HTML in Stage 4.

**Format:**

```
# [Full Title]: A Beginner's Guide

> [One-sentence hook about what the reader gains]

## Chapter 1: [Welcoming title]

[200–400 words, conversational. Open Ch1 by acknowledging overwhelm — then reframe.]

...

## Appendix: Quick Reference
| [Col 1] | [Col 2] |
```

**Rules:**
- 5–8 short chapters (200–400 words each), each building on the last
- Open Chapter 1 acknowledging that this might feel like a lot — then reframe it positively
- Zero jargon without definition — define every technical term in plain language
- Analogies drawn from source material; at least one real-world motivating outcome per chapter
- End with "Your First Win" or "What's Next" — one concrete action for today
- Appendix: Quick Reference tables
- Tone: knowledgeable friend, not a textbook

---

## Stage 4 — Export to Styled HTML Ebook

**Output:** `<output-dir>/[topic]-ebook.html`

Run the HTML exporter with the chosen theme:

```bash
python3 ~/.claude/skills/ebook-anything/scripts/export_html.py \
  --input "<output-dir>/[topic]-ebook.md" \
  --output "<output-dir>/[topic]-ebook.html" \
  --theme "[chosen-theme]" \
  --title "[Full Title]"
```

The script converts the markdown to a self-contained, styled HTML file that opens directly in any browser. Each theme has its own color palette, typography, and layout.

---

## Stage 5 — Deliver

Print a completion summary:

```
✓ master.md              — [N] lines — Full study guide (annotate while learning)
✓ howto.md               — [N] lines — Task checklists (use while doing)
✓ [topic]-ebook.md       — [N] lines — Ebook markdown source
✓ [topic]-ebook.html     — Theme: [theme] — Open in browser to read or print to PDF

All files written to: [output-dir]

To share: send [topic]-ebook.html — opens in any browser, no install needed.
To print/PDF: open [topic]-ebook.html in Chrome → File → Print → Save as PDF.
```

---

## Supporting Files

- `scripts/read_large_file.py` — Chunks large/single-line files. Use for files >50KB.
- `scripts/setup.py` — Installs required Python packages (`markdown2`).
- `scripts/export_html.py` — Converts markdown to styled HTML in 6 color themes.
