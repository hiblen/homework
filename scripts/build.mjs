// Builds the static site into dist/ from site.json.
// Each subject gets a page listing its homework; homework files are copied as-is.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const site = JSON.parse(readFileSync(join(root, "site.json"), "utf8"));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const url = (s) => encodeURIComponent(s);

const page = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,600&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css">
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;

const card = (href, label, hint) =>
  `<li><a class="card" href="${href}"><span class="label">${esc(label)}</span>${hint ? `<span class="hint">${esc(hint)}</span>` : ""}<span class="arrow" aria-hidden="true">→</span></a></li>`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "scripts", "site.css"), join(dist, "site.css"));

const subjectCards = site.subjects.map((s) => {
  const n = s.homework.length;
  return card(`/${url(s.folder)}/`, s.name, `${n} homework${n === 1 ? "" : "s"}`);
});
writeFileSync(
  join(dist, "index.html"),
  page(site.title, `<h1>${esc(site.title)}</h1>
<p class="lede">Pick a subject.</p>
<ul class="cards">
${subjectCards.join("\n")}
</ul>`)
);

for (const subject of site.subjects) {
  const outDir = join(dist, subject.folder);
  mkdirSync(outDir, { recursive: true });
  for (const hw of subject.homework) {
    const src = join(root, subject.folder, hw.file);
    if (!existsSync(src)) throw new Error(`Missing homework file: ${subject.folder}/${hw.file}`);
    cpSync(src, join(outDir, hw.file));
  }
  const items = subject.homework.length
    ? `<ul class="cards">\n${subject.homework.map((hw) => card(url(hw.file), hw.title)).join("\n")}\n</ul>`
    : `<p class="lede">No homework yet.</p>`;
  writeFileSync(
    join(outDir, "index.html"),
    page(`${subject.name} · ${site.title}`, `<a class="back" href="/">← All subjects</a>
<h1>${esc(subject.name)}</h1>
<p class="lede">Choose a homework.</p>
${items}`)
  );
}

writeFileSync(
  join(dist, "404.html"),
  page(`Not found · ${site.title}`, `<h1>Not found</h1>
<p class="lede">That page doesn't exist.</p>
<a class="back" href="/">← All subjects</a>`)
);

console.log(`Built ${site.subjects.length} subject(s) into dist/`);
