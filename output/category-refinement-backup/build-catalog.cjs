"use strict";

// Generates static entry points. The browser serves these files without a build server.
const fs = require("node:fs");
const path = require("node:path");
const data = require("./catalog-data.js");
const root = __dirname;
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");

function section(start, end) {
  const from = home.indexOf(start);
  const to = home.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error("Missing shared markup: " + start);
  return home.slice(from, to + end.length);
}

const sprite = section('<svg class="sprite"', "</svg>");
const header = section('<a class="skip-link"', "</header>");
const footer = section('<footer class="site-footer"', "</footer>");
const dialogs = section('<aside class="floating"', "</body>").replace(/<\/body>$/, "");

function sharedMarkup(markup, prefix) {
  return markup.replace(/(href|src)="([^"]+)"/g, (match, attribute, value) => {
    if (value === "#main" || value.startsWith("#icon-")) return match;
    const local = value.startsWith("#") ? "index.html" + value : value;
    return attribute + '="' + prefix + local + '"';
  }).replace('class="is-current" href="' + prefix + 'index.html#top" aria-current="page"', 'href="' + prefix + 'index.html#top"')
    .replace('href="' + prefix + 'index.html#top" aria-current="page"', 'href="' + prefix + 'index.html#top"')
    .replaceAll('href="' + prefix + 'products/">المنتجات</a>', 'class="is-current" href="' + prefix + 'products/" aria-current="true">المنتجات</a>');
}

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const routes = [
  { type: "catalog", path: "products", title: "المنتجات", description: "كتالوج Scenery التجريبي للأثاث والأعمال الخشبية.", cover: data.cover },
  ...data.categories.map((item) => ({ type: "category", path: "products/category/" + item.slug, ...item })),
  ...data.products.map((item) => ({ type: "product", path: "products/" + item.slug, cover: item.media[0], ...item }))
];

const writtenPaths = new Set();
for (const route of routes) {
  if (route.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.slug)) throw new Error("Invalid slug: " + route.slug);
  if (writtenPaths.has(route.path)) throw new Error("Duplicate route: " + route.path);
  writtenPaths.add(route.path);
  const prefix = "../".repeat(route.path.split("/").length);
  const title = escape(route.title + " | Scenery");
  const description = escape(route.description);
  const publicUrl = data.publicBase ? new URL(route.path + "/", data.publicBase).href : "";
  const imageUrl = route.cover && (publicUrl ? new URL(route.cover.src, data.publicBase).href : prefix + route.cover.src);
  const image = imageUrl ? '  <meta property="og:image" content="' + escape(imageUrl) + '">\n' : "";
  const url = publicUrl ? '  <meta property="og:url" content="' + escape(publicUrl) + '">\n' : "";
  const html = `<!doctype html>
<html lang="ar" dir="rtl" data-page="${route.type}" data-slug="${escape(route.slug || "")}" data-root="${prefix}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f3eee7">
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
${image}${url}  <title>${title}</title>
  <link rel="icon" href="${prefix}assets/scenery-logo.png" type="image/png">
  <link rel="stylesheet" href="${prefix}styles.css">
  <link rel="stylesheet" href="${prefix}catalog.css">
${route.type === "catalog" ? '  <link rel="stylesheet" href="' + prefix + 'catalog-showcase.css">\n' : ""}${route.type === "product" ? '  <link rel="stylesheet" href="' + prefix + 'product-detail.css">\n' : ""}  <script src="${prefix}catalog-data.js" defer></script>
  <script src="${prefix}site.js" defer></script>
  <script src="${prefix}catalog.js" defer></script>
${route.type === "product" ? '  <script src="' + prefix + 'catalog-detail.js" defer></script>\n' : ""}${route.type === "catalog" ? '  <script src="' + prefix + 'catalog-showcase.js" defer></script>\n' : ""}</head>
<body class="catalog${route.type === "catalog" ? " catalog-showcase" : ""}">
  ${sprite}
  ${sharedMarkup(header, prefix)}
  <main id="main" tabindex="-1"><noscript><div class="wrap"><h1>${escape(route.title)}</h1><p>يحتاج الكتالوج التجريبي إلى JavaScript لعرض المنتجات وتشغيل التفاعلات.</p></div></noscript></main>
  ${sharedMarkup(footer, prefix)}
  ${sharedMarkup(dialogs, prefix)}
</body>
</html>
`;
  const directory = path.join(root, route.path);
  fs.mkdirSync(directory, { recursive: true });
  const target = path.join(directory, "index.html");
  if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== html) fs.writeFileSync(target, html, "utf8");
}
console.log("Generated " + routes.length + " static catalog routes.");
