# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Workspace Is

A content creation and knowledge management workspace built around a Claude Code course transcript. All files are large Markdown documents derived from a single YouTube course ("Code Mastery") on Claude Code for beginners.

## File Map

| File | Description | Size |
|------|-------------|------|
| `docs/transcripts/outline.md` | Raw course transcript — single 302KB line, the source of truth | ~302KB |
| `docs/transcripts/outline2.md` | Secondary transcript | ~29KB |
| `src/webapp/` | Express web app — paste a transcript, Claude generates a PDF ebook | — |
| `scripts/` | Node utilities folder (add new conversion scripts here) | — |
| `output/` | Manual or legacy generated PDFs and HTML files | — |
| `courses/` | Generated course bundles from the `/ebook-anything` skill | — |

## Reading Large Files

`docs/transcripts/outline.md` is a single long line (~302KB) and cannot be read with standard tools. Use byte-range reads:

```bash
# Read in 50KB chunks
dd if="C:/Users/Tommy/ebookAnything/docs/transcripts/outline.md" bs=1 skip=0 count=50000
dd if="C:/Users/Tommy/ebookAnything/docs/transcripts/outline.md" bs=1 skip=50000 count=50000
# etc.
```

Or use the skill's chunked reader directly:

```bash
python3 .claude/skills/ebook-anything/scripts/read_large_file.py docs/transcripts/outline.md
```

## Content Conventions

- All documents use GitHub-flavored Markdown
- Treat `outline.md` as read-only source material — never edit it
- Course output in `courses/[topic]/` is generated — re-run the skill rather than hand-editing
- `output/` is for manual or legacy files only
