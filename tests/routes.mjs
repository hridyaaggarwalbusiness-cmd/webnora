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
    "/start?plan=1",
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
  async function waitFor(check) {
    for (let i = 0; i < 100; i++) {
      if (check()) return;
      await new Promise((r) => setTimeout(r, 25));
    }
    assert.fail(
      "View did not render: " +
        route +
        " " +
        document.body.textContent.slice(-250),
    );
  }
  const clickText = (scope, t) =>
    Array.from(scope.querySelectorAll("button"))
      .find((b) => b.textContent === t)
      .click();
  globalThis.fetch = async () => new Response("{}");
  const entry = html.match(/src="(\/assets\/index-[^"]+\.js)"/)[1];
  await import("../dist" + entry);
  await waitFor(() => document.querySelector("main h1")?.textContent);
  if (route === "/work") {
    w.document.querySelectorAll(".filters button")[1].click();
    await waitFor(() => document.querySelectorAll("#portfolio a").length === 3);
  }
  if (route === "/playground") {
    clickText(document, "software");
    await waitFor(() => !document.querySelector("table").closest("[hidden]"));
    clickText(document, "Delete");
    await waitFor(() => document.querySelectorAll("tbody tr").length === 1);
    clickText(document, "websites");
    await waitFor(() => document.querySelector("#demo"));
    assert.match(sessionStorage.design, /Aster House/);
  }
  if (route.startsWith("/start")) {
    const main = document.querySelector("main");
    assert.equal(main.querySelector("select").value, "Application");
    async function next(step) {
      clickText(main, "Continue →");
      await waitFor(
        () =>
          main
            .querySelector("small")
            .textContent.toLowerCase()
            .includes(step + "/ 6") ||
          main.querySelector("form small").textContent.includes(step + " / 6"),
      );
    }
    await next(2);
    await next(3);
    main.querySelector("input[type=checkbox]").click();
    await next(4);
    await next(5);
    assert.match(main.textContent, /11,999/);
    await next(6);
    assert.ok(main.querySelector("[name=email]").required);
  }
  if (["/portal", "/admin"].includes(route))
    await waitFor(() =>
      document
        .querySelector("main [role=status]")
        ?.textContent.includes("configuration"),
    );
  process.exit(0);
}
