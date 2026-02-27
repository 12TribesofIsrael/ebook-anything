#!/usr/bin/env python3
"""
read_large_file.py — Chunk-reader for large or single-line markdown files.

Usage:
    python3 read_large_file.py <file_path> [chunk_size_bytes]

Designed for transcript files like YouTube exports that may be stored as a
single continuous line (e.g., outline.md at 302KB on one line).

Output:
    - Header with file metadata (size, line count, format detection)
    - Full content split into labeled chunks for sequential processing
"""

import sys
import os

DEFAULT_CHUNK_SIZE = 50_000  # 50KB per chunk


def format_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    if n < 1_048_576:
        return f"{n / 1024:.1f} KB"
    return f"{n / 1_048_576:.1f} MB"


def read_large_file(file_path: str, chunk_size: int = DEFAULT_CHUNK_SIZE) -> None:
    if not os.path.exists(file_path):
        print(f"ERROR: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    file_size = os.path.getsize(file_path)

    # Read the whole file to detect format
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    lines = content.split("\n")
    line_count = len(lines)
    max_line_len = max((len(l) for l in lines), default=0)

    is_single_line = line_count <= 2 and max_line_len > 1000
    is_large = file_size > 50_000

    # Print metadata header
    print("=" * 60)
    print(f"FILE: {os.path.basename(file_path)}")
    print(f"SIZE: {format_size(file_size)}")
    print(f"LINES: {line_count:,}")
    print(f"MAX LINE LENGTH: {max_line_len:,} chars")
    if is_single_line:
        print("FORMAT: Single-line transcript (chunking by bytes)")
    elif is_large:
        print("FORMAT: Large multi-line file (chunking by bytes)")
    else:
        print("FORMAT: Normal markdown file")
    print("=" * 60)
    print()

    if is_single_line or is_large:
        # Chunk by bytes using byte offsets
        total_chunks = (len(content.encode("utf-8")) + chunk_size - 1) // chunk_size
        encoded = content.encode("utf-8")
        offset = 0
        chunk_num = 1

        while offset < len(encoded):
            chunk_bytes = encoded[offset : offset + chunk_size]
            # Decode with error replacement to avoid splitting multi-byte chars badly
            chunk_text = chunk_bytes.decode("utf-8", errors="replace")

            # Try to break at a word boundary for readability
            if offset + chunk_size < len(encoded):
                last_space = chunk_text.rfind(" ")
                if last_space > chunk_size // 2:
                    chunk_text = chunk_text[:last_space]
                    actual_bytes = len(chunk_text.encode("utf-8"))
                else:
                    actual_bytes = len(chunk_bytes)
            else:
                actual_bytes = len(chunk_bytes)

            print(f"--- CHUNK {chunk_num} of {total_chunks} ---")
            print(chunk_text)
            print()

            offset += actual_bytes
            chunk_num += 1
    else:
        # Small, normal file — print as-is
        print("--- FULL CONTENT ---")
        print(content)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 read_large_file.py <file_path> [chunk_size_bytes]")
        sys.exit(1)

    path = sys.argv[1]
    size = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_CHUNK_SIZE
    read_large_file(path, size)
