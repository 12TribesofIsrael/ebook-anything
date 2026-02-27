#!/usr/bin/env node
/**
 * generate_pdf.js — Convert a styled HTML ebook to PDF using Puppeteer.
 *
 * Usage:
 *   node generate_pdf.js --input <file.html> --output <file.pdf>
 *
 * Requires: puppeteer (npm install in skill root)
 */

const path = require('path');
const fs = require('fs');

// Resolve puppeteer from skill root node_modules
const skillRoot = path.resolve(__dirname, '..');
const puppeteerPath = path.join(skillRoot, 'node_modules', 'puppeteer');

let puppeteer;
try {
  puppeteer = require(puppeteerPath);
} catch {
  console.error('ERROR: puppeteer not found. Run: cd ~/.claude/skills/ebook-anything && npm install');
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  return { input: get('--input'), output: get('--output') };
}

async function main() {
  const { input, output } = parseArgs();

  if (!input || !output) {
    console.error('Usage: node generate_pdf.js --input <file.html> --output <file.pdf>');
    process.exit(1);
  }

  const inputFile = path.resolve(input);
  const outputFile = path.resolve(output);

  if (!fs.existsSync(inputFile)) {
    console.error(`ERROR: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file://' + inputFile.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputFile,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();

  const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(0);
  console.log(`✓ ${path.basename(outputFile)} (${sizeKB} KB)`);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
