# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Workspace Is

A content creation and knowledge management workspace built around a Claude Code course transcript. All files are large Markdown documents derived from a single YouTube course ("Code Mastery") on Claude Code for beginners.

## File Map

| File | Description | Size |
|------|-------------|------|
| `outline.md` | Raw course transcript — single 302KB line, the source of truth | ~302KB |
| `master.md` | Structured study guide extracted from the transcript | ~54KB |
| `howto.md` | Step-by-step procedural checklists extracted from the transcript | ~41KB |
| `claude-code-beginners-guide.md` | Beginner ebook drafted from distilled transcript content | ~25KB |

## Reading Large Files

`outline.md` is a single long line (~302KB) and cannot be read with standard tools. Use byte-range reads:

```bash
# Read in 50KB chunks
dd if="C:/Users/Tommy/Claude/outline.md" bs=1 skip=0 count=50000
dd if="C:/Users/Tommy/Claude/outline.md" bs=1 skip=50000 count=50000
# etc.
```

`master.md` and `howto.md` are large but line-structured — use `Read` with `offset`/`limit` parameters.

## Content Conventions

- All documents use GitHub-flavored Markdown
- `master.md` is organized by course section with `##` headers per topic
- `howto.md` uses checkbox checklists (`- [ ]`) for every actionable step
- `claude-code-beginners-guide.md` uses a chapter structure aimed at non-technical readers

## Priorities When Editing

- Treat `outline.md` as read-only source material — never edit it
- `master.md` and `howto.md` are reference extracts — update only when adding newly extracted content
- `claude-code-beginners-guide.md` is the primary deliverable — this is what gets shared with users
- Keep the ebook beginner-friendly: avoid jargon, use analogies from the transcript, keep chapters short
