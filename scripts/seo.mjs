import { readFile, writeFile, mkdir } from "node:fs/promises";
import { projects, services, esc } from "../src/data.js";
const shell = await readFile("dist/index.html", "utf8"),
  base = "https://web-nora.web.app";
const pages = [
  [
    "",
    "WebNora — Digital Development Studio",
    "Custom websites, applications and business software.",
  ],
  ...[
    "services",
    "about",
    "pricing",
    "contact",
    "work",
    "playground",
    "start",
    "privacy",
    "terms",
    "admin",
    "portal",
  ].map((p) => [
    p,
    p[0].toUpperCase() + p.slice(1) + " | WebNora",
    "Explore the WebNora digital studio.",
  ]),
  ...services.map((s) => ["services/" + s[0], s[1] + " | WebNora", s[2]]),
  ...projects.map((p) => ["work/" + p[0], p[1] + " | WebNora", p[4]]),
];
for (const [route, title, desc] of pages) {
  await mkdir("dist/" + route, { recursive: true });
  const privatePage = ["admin", "portal"].includes(route);
  let html = shell
    .replace(/<title>.*?<\/title>/, "<title>" + esc(title) + "</title>")
    .replace(
      "WebNora designs custom websites, applications and business software for growing businesses.",
      esc(desc),
    )
    .replace(
      "</head>",
      '<link rel="canonical" href="' +
        base +
        "/" +
        route +
        '"><meta property="og:image" content="' +
        base +
        '/assets/hero.webp"><meta property="og:url" content="' +
        base +
        "/" +
        route +
        '">' +
        (privatePage ? '<meta name="robots" content="noindex">' : "") +
        '<script type="application/ld+json">' +
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "WebNora",
          url: base,
        }) +
        "</script></head>",
    );
  await writeFile("dist/" + (route ? route + "/" : "") + "index.html", html);
}
await writeFile("dist/404.html", shell);
await writeFile(
  "dist/robots.txt",
  "User-agent: *\nDisallow: /admin\nDisallow: /portal\nSitemap: " +
    base +
    "/sitemap.xml\n",
);
await writeFile(
  "dist/sitemap.xml",
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages
      .filter(([p]) => !["admin", "portal"].includes(p))
      .map(([r]) => "<url><loc>" + base + "/" + r + "</loc></url>")
      .join("") +
    "</urlset>",
);
