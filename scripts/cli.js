#!/usr/bin/env node
// lavish-themes — tiny CLI for the @rubar/lavish-themes package.
// Pure Node, zero deps. Lists, prints paths to, and copies theme shells.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

const THEMES = [
  { slug: "latex",       tier: 1, blurb: "Academic paper, Latin Modern" },
  { slug: "terminal",    tier: 1, blurb: "Monospace terminal stationery" },
  { slug: "water",       tier: 1, blurb: "Neutral classless, auto dark/light" },
  { slug: "swiss",       tier: 2, blurb: "International typographic, black/red/white grid" },
  { slug: "handwritten", tier: 2, blurb: "Lined exercise book, Caveat + Permanent Marker" },
  { slug: "zine",        tier: 2, blurb: "Yellow/black/magenta, Anton, hard shadows" },
];

function themePath(slug) {
  const t = THEMES.find((x) => x.slug === slug);
  if (!t) return null;
  return path.join(ROOT, `tier${t.tier}`, `${slug}.html`);
}

function help() {
  process.stdout.write(`lavish-themes — six self-contained HTML theme shells

usage:
  lavish-themes list                       List all themes with tier + slug
  lavish-themes path <slug>                Print absolute path to a theme's HTML file
  lavish-themes copy <slug> [dest]         Copy a theme to <dest> (default: ./<slug>.html)
  lavish-themes root                       Print the package root (where tier1/ and tier2/ live)

themes:
${THEMES.map((t) => `  tier ${t.tier}  ${t.slug.padEnd(12)} ${t.blurb}`).join("\n")}

examples:
  npx @rubar/lavish-themes list
  npx @rubar/lavish-themes copy swiss my-brief.html
  cat $(lavish-themes path latex)
`);
}

function cmdList() {
  const rows = THEMES.map((t) => `tier${t.tier}\t${t.slug}\t${t.blurb}`);
  process.stdout.write(rows.join("\n") + "\n");
}

function cmdPath(slug) {
  if (!slug) fail("usage: lavish-themes path <slug>");
  const p = themePath(slug);
  if (!p) fail(`unknown theme: ${slug}. Run 'lavish-themes list' to see options.`);
  if (!fs.existsSync(p)) fail(`theme file missing on disk: ${p}`);
  process.stdout.write(p + "\n");
}

function cmdCopy(slug, dest) {
  if (!slug) fail("usage: lavish-themes copy <slug> [dest]");
  const src = themePath(slug);
  if (!src) fail(`unknown theme: ${slug}. Run 'lavish-themes list' to see options.`);
  if (!fs.existsSync(src)) fail(`theme file missing on disk: ${src}`);

  let target = dest;
  if (!target) target = `${slug}.html`;
  // If dest is an existing directory, drop the file inside it.
  try {
    if (fs.statSync(target).isDirectory()) {
      target = path.join(target, `${slug}.html`);
    }
  } catch {
    // dest doesn't exist yet — that's fine, treat as file path
  }

  if (fs.existsSync(target)) {
    fail(`refusing to overwrite ${target}. Pick a different destination or delete the file first.`);
  }

  fs.mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
  fs.copyFileSync(src, target);
  process.stdout.write(`copied ${slug} → ${target}\n`);
}

function cmdRoot() {
  process.stdout.write(ROOT + "\n");
}

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

const [, , cmd, ...rest] = process.argv;
switch (cmd) {
  case "list":
  case "ls":
    cmdList();
    break;
  case "path":
    cmdPath(rest[0]);
    break;
  case "copy":
  case "cp":
    cmdCopy(rest[0], rest[1]);
    break;
  case "root":
    cmdRoot();
    break;
  case "--help":
  case "-h":
  case "help":
  case undefined:
    help();
    break;
  default:
    process.stderr.write(`unknown command: ${cmd}\n\n`);
    help();
    process.exit(1);
}
