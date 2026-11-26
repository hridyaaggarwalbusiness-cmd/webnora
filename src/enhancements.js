import { esc, plans, money } from "./data.js";
const safeHref = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? esc(u.href) : "";
  } catch {
    return "";
  }
};
export function enhance({ page, slug, settings, projects, services }) {
  const main = document.querySelector("main");
  if (page === "services" && slug) {
    const n = services.findIndex((s) => s[0] === slug);
    if (n >= 0) {
      const section = document.createElement("section");
      section.innerHTML =
        "<small>EXAMPLE INTERFACE</small><h2>" +
        [
          "The guest experience.",
          "Your school on mobile.",
          "A clearer operations desk.",
        ][n] +
        '</h2><a class="project" href="/playground?tab=' +
        services[n][0] +
        '"><img src="/assets/work-' +
        [2, 1, 6][n] +
        '.webp" alt="Concept interface preview"><strong>Open interactive demonstration ↗</strong></a>';
      main.append(section);
    }
  }
  if (page === "work" && slug) {
    const p = projects.find((x) => x[0] === slug);
    if (p) {
      const s = main.querySelector("section"),
        cover = s.querySelector("a.project"),
        dialog = document.createElement("dialog");
      dialog.className = "lightbox";
      dialog.innerHTML =
        '<form method="dialog"><button>Close preview ×</button></form>' +
        cover.querySelector("img").outerHTML;
      document.body.append(dialog);
      cover.onclick = (e) => {
        e.preventDefault();
        dialog.showModal();
      };
      const extra = settings.projectDetails?.[slug] || {},
        type = p[3].includes("Websites") ? 0 : p[3].includes("Apps") ? 1 : 2;
      s.insertAdjacentHTML(
        "beforeend",
        "<h3>Design approach</h3><p>" +
          esc(extra.solution || p[3]) +
          '</p><a class="secondary" href="/services/' +
          services[type][0] +
          '">' +
          services[type][1] +
          " ↗</a> " +
          (safeHref(extra.url)
            ? '<a class="secondary" href="' +
              safeHref(extra.url) +
              '">View project ↗</a>'
            : "") +
          (safeHref(extra.video)
            ? '<video controls preload="none" src="' +
              safeHref(extra.video) +
              '"></video>'
            : ""),
      );
    }
  }
  if (page === "pricing") {
    const comparison = main
      .querySelector("details:last-of-type")
      ?.parentNode?.querySelector("section > details");
    if (comparison) {
      comparison.innerHTML =
        '<summary>Compare packages side by side</summary><div style="overflow:auto"><table><thead><tr><th>Package</th>' +
        plans.map((p) => "<th>" + p[0] + "</th>").join("") +
        "</tr></thead><tbody>" +
        [
          [
            "Starting price",
            ...plans.map((p, i) =>
              money(settings.base?.[i] ?? Number(p[2].replace(",", ""))),
            ),
          ],
          ["Primary delivery", "Website", "Application", "Business system"],
          ["User accounts", "Optional", "Included", "Role-based"],
          ["Operations reporting", "Optional", "Scoped", "Included"],
          ["Deployment assistance", "Included", "Included", "Included"],
        ]
          .map(
            (row) =>
              "<tr>" +
              row.map((t) => "<td>" + esc(t) + "</td>").join("") +
              "</tr>",
          )
          .join("") +
        "</tbody></table></div>";
    }
  }
  if (!page) {
    const transformation = document.querySelector(".compare");
    transformation.insertAdjacentHTML(
      "beforeend",
      '<div class="morph" aria-hidden="true"><div class="paper">Daily register<br>────────<br>────────</div><div class="digital">Operations dashboard<div class="spark">▂▄▃▆▅█</div></div></div>',
    );
    const shift = document.querySelector("#shift");
    const update = () =>
      transformation.style.setProperty("--reveal", shift.value + "%");
    shift.addEventListener("input", update);
    update();
    const cap = main.querySelector(".hero + .strip + section");
    cap?.insertAdjacentHTML(
      "beforeend",
      '<div class="signature"><code>&lt;WebNora /&gt;</code><span>Website</span><span>Application</span><span>Business ecosystem</span></div>',
    );
  }
  const nav = document.querySelector("nav"),
    service = nav.querySelector('[href="/services"]');
  const drop = document.createElement("div");
  drop.className = "navgroup";
  service.replaceWith(drop);
  drop.append(service);
  drop.insertAdjacentHTML(
    "beforeend",
    '<div class="dropdown">' +
      services
        .map((s) => '<a href="/services/' + s[0] + '">' + s[1] + "</a>")
        .join("") +
      "</div>",
  );
  const progress = document.createElement("div");
  progress.className = "scrollprogress";
  document.body.append(progress);
  const setProgress = () =>
    (progress.style.transform =
      "scaleX(" +
      window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight) +
      ")");
  window.addEventListener("scroll", setProgress, { passive: true });
  setProgress();
}
