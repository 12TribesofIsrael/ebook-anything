#!/usr/bin/env python3
"""
setup.py — Install required packages for ebook-anything skill.

Usage:
    python3 setup.py

Installs: markdown2
Skips packages already installed.
"""

import subprocess
import sys


REQUIRED = ["markdown2"]


def is_installed(package: str) -> bool:
    try:
        __import__(package.replace("-", "_"))
        return True
    except ImportError:
        return False


def main():
    missing = [p for p in REQUIRED if not is_installed(p)]

    if not missing:
        print("All required packages already installed.")
        return

    print(f"Installing: {', '.join(missing)}")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "--quiet", *missing]
    )
    print("Done.")


if __name__ == "__main__":
    main()
