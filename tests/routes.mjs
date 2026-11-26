// Exercise the built entry point with browser DOM APIs and unavailable live Firebase.
import { Window } from "happy-dom";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const route = process.argv[2];
if (route === undefined) {
  for (const p of [
    "/",
    "/services",
    "/services/websites",
    "/work",
    "/work/madaan",
    "/pricing",
    "/playground",
    "/about",
    "/start",
    "/contact",
    "/portal",
    "/admin",
    "/privacy",
    "/terms",
    "/missing",
  ]) {
    const child = spawnSync(process.execPath, [import.meta.filename, p], {
      encoding: "utf8",
      timeout: 10000,
    });
    if (child.status !== 0) throw Error(p + " " + child.stderr + child.stdout);
  }
  console.log("All 15 production route entry checks passed.");
} else {
  const html = await readFile("dist/index.html", "utf8");
  const w = new Window({
    url: "https://example.org" + route,
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
    },
  });
  w.document.body.innerHTML = html.split("<body>")[1].split("</body>")[0];
  w.sessionStorage.intro = "1";
  for (const k of [
    "document",
    "location",
    "sessionStorage",
    "window",
    "navigator",
    "innerHeight",
    "MutationObserver",
    "HTMLElement",
    "Event",
    "customElements",
    "getComputedStyle",
    "matchMedia",
    "IntersectionObserver",
    "ResizeObserver",
  ]) {
    if (k === "window") {
      globalThis.window = w;
      continue;
    }
    let v = w[k];
    if (
      typeof v === "function" &&
      ["getComputedStyle", "matchMedia"].includes(k)
    )
      v = v.bind(w);
    Object.defineProperty(globalThis, k, { value: v, configurable: true });
  }
  for (const k of [
    "menu",
    "results",
    "shift",
    "change",
    "changeCopy",
    "bookmark",
    "portfolio",
    "brochure",
  ])
    Object.defineProperty(globalThis, k, {
      get: () => w.document.getElementById(k),
      configurable: true,
    });
  globalThis.fetch = async () => new Response("{}");
  const entry = html.match(/src="(\/assets\/index-[^"]+\.js)"/)[1];
  await import("../dist" + entry);
  assert.ok(w.document.querySelector("main h1")?.textContent, route);
  if (route === "/work") {
    w.document.querySelectorAll(".filters button")[1].click();
    assert.equal(w.document.querySelectorAll("#portfolio a").length, 3);
  }
  process.exit(0);
}
