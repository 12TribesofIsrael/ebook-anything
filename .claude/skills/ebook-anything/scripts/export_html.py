#!/usr/bin/env python3
"""
export_html.py — Convert a markdown ebook to a self-contained styled HTML file.

Usage:
    python3 export_html.py --input ebook.md --output ebook.html --theme midnight --title "My Ebook"

Themes: midnight, ocean, earth, minimal, editorial, sage
"""

import argparse
import sys
import os

try:
    import markdown2
except ImportError:
    print("ERROR: markdown2 not installed. Run: python3 setup.py", file=sys.stderr)
    sys.exit(1)


# ─── Color Themes ────────────────────────────────────────────────────────────

THEMES = {
    "midnight": {
        "label": "Midnight",
        "description": "Dark background, purple accents — great for tech and coding content",
        "bg": "#0d0d0d",
        "surface": "#1a1a2e",
        "text": "#e2e2e2",
        "text_muted": "#888899",
        "accent": "#7c3aed",
        "accent_light": "#a78bfa",
        "heading": "#f0f0ff",
        "border": "#2a2a40",
        "code_bg": "#12121f",
        "code_text": "#a78bfa",
        "blockquote_bg": "#16162a",
        "blockquote_border": "#7c3aed",
        "table_header_bg": "#1e1e3a",
        "table_row_alt": "#15152a",
        "link": "#a78bfa",
        "tag_bg": "#2a1a4a",
        "tag_text": "#c4b5fd",
        "font_heading": "'Segoe UI', 'SF Pro Display', system-ui, sans-serif",
        "font_body": "'Segoe UI', system-ui, sans-serif",
        "font_mono": "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
    },
    "ocean": {
        "label": "Ocean",
        "description": "Light blue tones — professional and trustworthy, great for business content",
        "bg": "#f0f6ff",
        "surface": "#ffffff",
        "text": "#1e3a5f",
        "text_muted": "#5a7a9a",
        "accent": "#2563eb",
        "accent_light": "#3b82f6",
        "heading": "#0f2a4a",
        "border": "#c8ddf5",
        "code_bg": "#e8f0fb",
        "code_text": "#1a4080",
        "blockquote_bg": "#e8f2ff",
        "blockquote_border": "#2563eb",
        "table_header_bg": "#daeaff",
        "table_row_alt": "#f0f7ff",
        "link": "#2563eb",
        "tag_bg": "#dbeafe",
        "tag_text": "#1d4ed8",
        "font_heading": "'Segoe UI', 'SF Pro Display', Georgia, serif",
        "font_body": "'Segoe UI', system-ui, sans-serif",
        "font_mono": "Consolas, 'Courier New', monospace",
    },
    "earth": {
        "label": "Earth",
        "description": "Off-white with terracotta accents — warm, creative, lifestyle content",
        "bg": "#f2efe6",
        "surface": "#fffdf8",
        "text": "#2d1b00",
        "text_muted": "#7a6040",
        "accent": "#c38133",
        "accent_light": "#d4a055",
        "heading": "#1a0f00",
        "border": "#e0d4be",
        "code_bg": "#ede8dc",
        "code_text": "#8b4513",
        "blockquote_bg": "#f5efe0",
        "blockquote_border": "#c38133",
        "table_header_bg": "#e8dfc8",
        "table_row_alt": "#f5f0e8",
        "link": "#a0631a",
        "tag_bg": "#f0e8d0",
        "tag_text": "#8b5e1a",
        "font_heading": "Georgia, 'Times New Roman', serif",
        "font_body": "'Segoe UI', system-ui, sans-serif",
        "font_mono": "Consolas, 'Courier New', monospace",
    },
    "minimal": {
        "label": "Minimal",
        "description": "Clean white, pure black — academic, research, timeless",
        "bg": "#ffffff",
        "surface": "#ffffff",
        "text": "#111111",
        "text_muted": "#666666",
        "accent": "#000000",
        "accent_light": "#333333",
        "heading": "#000000",
        "border": "#e0e0e0",
        "code_bg": "#f5f5f5",
        "code_text": "#222222",
        "blockquote_bg": "#f9f9f9",
        "blockquote_border": "#bbbbbb",
        "table_header_bg": "#f0f0f0",
        "table_row_alt": "#fafafa",
        "link": "#000000",
        "tag_bg": "#eeeeee",
        "tag_text": "#333333",
        "font_heading": "Georgia, 'Times New Roman', serif",
        "font_body": "Georgia, 'Times New Roman', serif",
        "font_mono": "'Courier New', Courier, monospace",
    },
    "editorial": {
        "label": "Editorial",
        "description": "Dark bg, bold red-orange accent — high energy, marketing, bold topics",
        "bg": "#111111",
        "surface": "#1a1a1a",
        "text": "#f0f0f0",
        "text_muted": "#888888",
        "accent": "#ff4d00",
        "accent_light": "#ff7040",
        "heading": "#ffffff",
        "border": "#2a2a2a",
        "code_bg": "#0d0d0d",
        "code_text": "#ff7040",
        "blockquote_bg": "#1e1e1e",
        "blockquote_border": "#ff4d00",
        "table_header_bg": "#222222",
        "table_row_alt": "#161616",
        "link": "#ff7040",
        "tag_bg": "#2a1500",
        "tag_text": "#ff9060",
        "font_heading": "'Arial Black', 'Segoe UI Black', Impact, sans-serif",
        "font_body": "'Segoe UI', system-ui, sans-serif",
        "font_mono": "Consolas, 'Fira Code', monospace",
    },
    "sage": {
        "label": "Sage",
        "description": "Soft greens, calming — wellness, nature, mindful content",
        "bg": "#f4f7f2",
        "surface": "#fafcf8",
        "text": "#2a3b2a",
        "text_muted": "#5a7a5a",
        "accent": "#4a7a4a",
        "accent_light": "#6a9a6a",
        "heading": "#1a2e1a",
        "border": "#cddeca",
        "code_bg": "#e8f0e5",
        "code_text": "#2d5a2d",
        "blockquote_bg": "#ecf4e9",
        "blockquote_border": "#4a7a4a",
        "table_header_bg": "#d8ecda",
        "table_row_alt": "#f0f8ee",
        "link": "#3a6a3a",
        "tag_bg": "#dceeda",
        "tag_text": "#2d5a2d",
        "font_heading": "Georgia, 'Palatino Linotype', serif",
        "font_body": "'Segoe UI', system-ui, sans-serif",
        "font_mono": "Consolas, 'Courier New', monospace",
    },
}


# ─── HTML Template ────────────────────────────────────────────────────────────

def build_html(content_html: str, title: str, theme: dict) -> str:
    t = theme
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    body {{
      font-family: {t['font_body']};
      font-size: 17px;
      line-height: 1.75;
      background: {t['bg']};
      color: {t['text']};
      padding: 0;
    }}

    /* ── Layout ── */
    .page-wrap {{
      max-width: 760px;
      margin: 0 auto;
      padding: 3rem 2rem 6rem;
    }}

    /* ── Cover / Title ── */
    .ebook-cover {{
      text-align: center;
      padding: 4rem 0 3rem;
      border-bottom: 2px solid {t['border']};
      margin-bottom: 3rem;
    }}
    .ebook-cover .theme-badge {{
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: {t['tag_bg']};
      color: {t['tag_text']};
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 1.5rem;
      font-family: {t['font_mono']};
    }}
    .ebook-cover h1 {{
      font-family: {t['font_heading']};
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800;
      color: {t['heading']};
      line-height: 1.2;
      margin-bottom: 1rem;
    }}
    .ebook-cover .subtitle {{
      font-size: 1.05rem;
      color: {t['text_muted']};
      max-width: 500px;
      margin: 0 auto;
    }}

    /* ── Headings ── */
    h1, h2, h3, h4, h5, h6 {{
      font-family: {t['font_heading']};
      color: {t['heading']};
      line-height: 1.3;
      margin-top: 2.5rem;
      margin-bottom: 0.75rem;
    }}
    h1 {{ font-size: 2rem; font-weight: 800; }}
    h2 {{
      font-size: 1.55rem;
      font-weight: 700;
      padding-bottom: 0.4rem;
      border-bottom: 2px solid {t['accent']};
      color: {t['accent']};
      margin-top: 3rem;
    }}
    h3 {{ font-size: 1.2rem; font-weight: 700; }}
    h4 {{ font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: {t['text_muted']}; }}

    /* ── Paragraphs & lists ── */
    p {{ margin-bottom: 1.1rem; }}
    ul, ol {{ margin: 0.75rem 0 1.1rem 1.5rem; }}
    li {{ margin-bottom: 0.35rem; }}
    li > ul, li > ol {{ margin-top: 0.35rem; margin-bottom: 0.35rem; }}

    /* ── Links ── */
    a {{ color: {t['link']}; text-decoration: underline; text-underline-offset: 3px; }}
    a:hover {{ opacity: 0.8; }}

    /* ── Blockquote (callout) ── */
    blockquote {{
      background: {t['blockquote_bg']};
      border-left: 4px solid {t['blockquote_border']};
      border-radius: 0 8px 8px 0;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      color: {t['text']};
      font-style: italic;
    }}
    blockquote p:last-child {{ margin-bottom: 0; }}

    /* ── Code ── */
    code {{
      font-family: {t['font_mono']};
      font-size: 0.88em;
      background: {t['code_bg']};
      color: {t['code_text']};
      padding: 2px 6px;
      border-radius: 4px;
    }}
    pre {{
      background: {t['code_bg']};
      border: 1px solid {t['border']};
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      overflow-x: auto;
      margin: 1.25rem 0;
    }}
    pre code {{
      background: none;
      color: {t['code_text']};
      padding: 0;
      font-size: 0.9em;
      line-height: 1.6;
    }}

    /* ── Tables ── */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95em;
    }}
    th {{
      background: {t['table_header_bg']};
      color: {t['heading']};
      font-family: {t['font_heading']};
      font-weight: 700;
      text-align: left;
      padding: 0.6rem 1rem;
      border-bottom: 2px solid {t['border']};
    }}
    td {{
      padding: 0.55rem 1rem;
      border-bottom: 1px solid {t['border']};
      vertical-align: top;
    }}
    tr:nth-child(even) td {{ background: {t['table_row_alt']}; }}

    /* ── Horizontal rule ── */
    hr {{
      border: none;
      border-top: 1px solid {t['border']};
      margin: 2.5rem 0;
    }}

    /* ── Chapter divider ── */
    h2::before {{
      content: '';
      display: block;
      height: 2px;
      width: 40px;
      background: {t['accent']};
      margin-bottom: 0.5rem;
    }}

    /* ── Accent highlight ── */
    strong {{ color: {t['accent_light']}; font-weight: 700; }}

    /* ── Footer ── */
    .ebook-footer {{
      margin-top: 5rem;
      padding-top: 2rem;
      border-top: 1px solid {t['border']};
      text-align: center;
      font-size: 0.85rem;
      color: {t['text_muted']};
      font-family: {t['font_mono']};
    }}

    /* ── Print ── */
    @media print {{
      body {{ background: white; color: black; }}
      .ebook-cover {{ page-break-after: always; }}
      h2 {{ page-break-before: always; }}
      pre, blockquote {{ page-break-inside: avoid; }}
    }}

    /* ── Responsive ── */
    @media (max-width: 600px) {{
      .page-wrap {{ padding: 2rem 1.25rem 4rem; }}
      h2 {{ font-size: 1.3rem; }}
      table {{ font-size: 0.85em; }}
    }}
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="ebook-cover">
      <div class="theme-badge">{t['label']} Edition</div>
      <h1>{title}</h1>
    </div>
    <div class="ebook-content">
      {content_html}
    </div>
    <div class="ebook-footer">
      Generated with ebook-anything &nbsp;·&nbsp; Theme: {t['label']}
    </div>
  </div>
</body>
</html>"""


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Convert markdown ebook to styled HTML")
    parser.add_argument("--input", required=True, help="Path to input .md file")
    parser.add_argument("--output", required=True, help="Path to output .html file")
    parser.add_argument(
        "--theme",
        default="earth",
        choices=list(THEMES.keys()),
        help=f"Color theme: {', '.join(THEMES.keys())}",
    )
    parser.add_argument("--title", default="", help="Ebook title (overrides H1 detection)")
    parser.add_argument("--list-themes", action="store_true", help="Print available themes and exit")
    args = parser.parse_args()

    if args.list_themes:
        print("\nAvailable themes:\n")
        for key, t in THEMES.items():
            print(f"  {key:<12} — {t['description']}")
        print()
        return

    # Read input
    if not os.path.exists(args.input):
        print(f"ERROR: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Auto-detect title from first H1 if not provided
    title = args.title
    if not title:
        for line in md_text.splitlines():
            if line.startswith("# "):
                title = line[2:].strip()
                break
        if not title:
            title = os.path.splitext(os.path.basename(args.input))[0].replace("-", " ").title()

    # Convert markdown → HTML
    content_html = markdown2.markdown(
        md_text,
        extras=[
            "tables",
            "fenced-code-blocks",
            "strike",
            "task_list",
            "header-ids",
            "smarty-pants",
        ],
    )

    # Apply theme
    theme = THEMES[args.theme]
    full_html = build_html(content_html, title, theme)

    # Write output
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"✓ {args.output}")
    print(f"  Theme: {theme['label']} — {theme['description']}")
    print(f"  Open in any browser. Print → Save as PDF for a PDF copy.")


if __name__ == "__main__":
    main()
