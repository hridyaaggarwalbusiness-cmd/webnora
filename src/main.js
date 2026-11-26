import "./style.css";
import { imageUrl } from "./media.js";
import {
  plans,
  services,
  projects,
  industries,
  stages,
  stageCopy,
  money,
  esc,
} from "./data.js";
const main = document.querySelector("main"),
  path = decodeURI(location.pathname).replace(/^\/|\/$/g, ""),
  [page = "", slug] = path.split("/");
const link = (to, t, cls = "") =>
    '<a class="' + cls + '" href="/' + to + '">' + t + "</a>",
  btn = (to, t) => link(to, t + " <span>↗</span>", "btn"),
  brand = link("", '<img src="/mark.svg" alt="">WebNora', "brand");
const nav = [
  ["", "Home"],
  ["services", "Services"],
  ["work", "Our Work"],
  ["playground", "Live Playground"],
  ["pricing", "Pricing"],
  ["about", "About"],
  ["contact", "Contact"],
];
document.querySelector("header").innerHTML =
  brand +
  "<nav>" +
  nav.map(([a, b]) => link(a, b, page === a ? "active" : "")).join("") +
  '</nav><button id="find" aria-label="Search">⌕</button>' +
  btn("start", "Start a Project") +
  '<button id="menu" aria-label="Toggle menu" aria-expanded="false">☰</button>';
menu.onclick = () =>
  menu.setAttribute("aria-expanded", document.body.classList.toggle("open"));
const search = document.querySelector("#search"),
  query = document.querySelector("#query");
function openSearch() {
  search.showModal();
  query.focus();
  query.oninput();
}
document.querySelector("#find").onclick = openSearch;
document.onkeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    openSearch();
  }
};
const choices = [
  ...nav,
  ...services.map((x) => ["services/" + x[0], x[1]]),
  ...projects.map((x) => ["work/" + x[0], x[1]]),
  ["portal", "Client portal"],
  ["start", "Project configurator"],
];
query.oninput = () =>
  (results.innerHTML =
    choices
      .filter((x) => x[1].toLowerCase().includes(query.value.toLowerCase()))
      .map((x) => link(...x))
      .join("") || "No matches");
document.querySelector("footer").innerHTML =
  "<div>" +
  brand +
  "<p>From your first website to your entire digital ecosystem.</p></div><div>" +
  [
    ...nav.slice(1),
    ["portal", "Client portal"],
    ["admin", "Studio admin"],
    ["privacy", "Privacy"],
    ["terms", "Terms"],
  ]
    .map((x) => link(...x))
    .join(" ") +
  "</div><h2>Great Businesses Deserve<br><i>Great Technology.</i></h2>" +
  btn("start", "Start Your Project");
const heading = (k, h, p = "") =>
  '<div class="title"><small>' +
  k +
  "</small><h1>" +
  h +
  "</h1><p>" +
  p +
  "</p></div>";
const cards = (arr) => '<div class="grid">' + arr.join("") + "</div>";
const serviceCards = () =>
  cards(
    services.map(([id, name, desc], i) =>
      link(
        "services/" + id,
        '<b class="glyph">' +
          ["⌘", "◫", "▦"][i] +
          "</b><h3>" +
          name +
          "</h3><p>" +
          desc +
          "</p><strong>Explore service ↗</strong>",
        "card",
      ),
    ),
  );
const projectCard = (p, i) =>
  link(
    "work/" + p[0],
    '<img loading="lazy" src="' +
      (imageUrl(settings.media?.[p[0]]) ||
        "/assets/work-" + ((Math.abs(i) % 7) + 1) + ".webp") +
      '" alt="' +
      esc(p[1]) +
      ' interface concept"><small>' +
      esc(p[2]) +
      " · CONCEPT PREVIEW</small><h3>" +
      esc(p[1]) +
      " ↗</h3>",
    "project",
  );
let settings = {};
try {
  const db = await import("./db.js");
  settings = (await db.read("content", "published")) || {};
} catch {}
if (settings.serviceDescriptions)
  services.forEach((s) => {
    if (typeof settings.serviceDescriptions[s[0]] === "string")
      s[2] = esc(settings.serviceDescriptions[s[0]]);
  });
if (settings.logo && imageUrl(settings.logo))
  document
    .querySelectorAll(".brand img")
    .forEach((img) => (img.src = settings.logo));
if (settings.color && /^#[0-9a-f]{6}$/i.test(settings.color))
  document.documentElement.style.setProperty("--accent", settings.color);
if (Array.isArray(settings.portfolio))
  projects.splice(
    0,
    projects.length,
    ...settings.portfolio.filter(
      (p) =>
        Array.isArray(p) &&
        p.length === 7 &&
        !settings.projectDetails?.[p[0]]?.hidden &&
        p.every((v) => typeof v === "string") &&
        /^[\w-]+$/.test(p[0]),
    ),
  );
const pricing = () =>
  cards(
    plans.map(
      ([n, type, price, tag, features, cta], i) =>
        '<article class="card price"><small>WEBNORA ' +
        n.toUpperCase() +
        "</small><h3>" +
        type +
        "</h3><p>" +
        tag +
        "</p><small>STARTING AT</small><h2>" +
        money(settings.base?.[i] ?? Number(price.replace(",", ""))) +
        "</h2><details><summary>Package features</summary><ul>" +
        features
          .split("|")
          .map((f) => "<li>" + f + "</li>")
          .join("") +
        "</ul></details>" +
        btn("start?plan=" + i, cta) +
        "</article>",
    ),
  );
const timeline = () =>
  '<div class="timeline">' +
  stages
    .map(
      (s, i) =>
        "<article><small>0" +
        (i + 1) +
        "</small><h3>" +
        s +
        "</h3><p>" +
        stageCopy[i] +
        "</p></article>",
    )
    .join("") +
  "</div>";
const industryList = () =>
  industries
    .slice(0, -1)
    .map(
      (s, i) =>
        "<details><summary>" +
        s +
        "</summary><p>" +
        [
          "Manage reservations and room inquiries.",
          "Publish menus and collect table requests.",
          "Build event proposals and menus.",
          "Organize attendance, fees and notices.",
          "Track stock and sales.",
          "Track lots, production and dispatch.",
          "Schedule appointments and showcase treatments.",
          "Manage appointment requests.",
          "Organize clients, briefs and billing.",
          "Build a searchable local presence.",
          "Test and launch your first product.",
          "Connect catalogue, checkout and fulfilment.",
        ][i] +
        "</p>" +
        link(
          "start?industry=" + encodeURIComponent(s),
          "Discuss this solution ↗",
        ) +
        "</details>",
    )
    .join("");
if (!page) {
  main.innerHTML =
    '<section class="hero"><div class="visual"><img src="/assets/hero.webp" alt="Interlocking polished amethyst ribbons"></div><div class="heroCopy"><small><b class="dot"></b> INDEPENDENT DIGITAL STUDIO</small><h1>' +
    esc(settings.headline || "We build digital experiences") +
    "<i>that move businesses forward.</i></h1><p>" +
    esc(
      settings.description ||
        "From stunning websites and powerful applications to intelligent business software, WebNora transforms your ideas into technology that works.",
    ) +
    '</p><div class="actions">' +
    btn("start", esc(settings.cta || "Start Your Project")) +
    link("work", "Explore Our Work ↗", "secondary") +
    '</div><aside>Professional digital solutions starting at <b>₹4,999.</b></aside></div><div class="scene"></div><div class="figure">FIG. 01 &nbsp; / &nbsp; DIGITAL ECOSYSTEM</div></section><div class="strip"><span>OUR DISCIPLINES</span> Website development <i>✳</i> Applications <i>✳</i> Business software</div><section><small>OUR CAPABILITIES</small><h2>A studio for your <i>digital business.</i></h2>' +
    serviceCards() +
    "</section><section><small>SELECTED WORK</small><h2>Ideas turned into reality.</h2>" +
    cards(projects.slice(0, 3).map(projectCard)) +
    link("work", "Explore all work ↗", "secondary") +
    '</section><section><small>BUSINESS TRANSFORMATION</small><h2>From traditional business to digital powerhouse.</h2><label>Explore the transformation<input type="range" id="shift" value="0"></label><div class="compare"><h3 id="change">Manual registers</h3><p id="changeCopy">Scattered records and repetitive paper-based processes.</p></div></section><section><h2>Built for your business.</h2>' +
    industryList() +
    "</section><section><h2>From discovery to launch.</h2>" +
    timeline() +
    "</section>";
  shift.oninput = () => {
    change.textContent = [
      "Manual registers",
      "Connected records",
      "Centralized dashboard",
    ][Math.min(2, Math.floor(shift.value / 34))];
    changeCopy.textContent =
      shift.value > 50
        ? "Digital workflows, customer applications and real-time reports."
        : "Bring scattered information into one workspace.";
  };
  if (
    !sessionStorage.intro &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    sessionStorage.intro = "1";
    let intro = document.createElement("div");
    intro.className = "intro";
    intro.innerHTML =
      '<img src="/mark.svg" alt=""><b>WebNora</b><small>Building What’s Next.</small><button>Skip intro</button>';
    document.body.append(intro);
    intro.onclick = () => intro.remove();
    setTimeout(() => intro.remove(), 2100);
  }
} else if (page === "services") {
  const s = services.find((x) => x[0] === slug);
  main.innerHTML = s
    ? heading("STUDIO SERVICES", s[1], s[2]) +
      "<section>" +
      cards(
        s[3]
          .split("|")
          .map((f) => '<article class="card"><h3>' + f + "</h3></article>"),
      ) +
      btn("playground?tab=" + s[0], "Try an interface") +
      btn("start?plan=" + services.indexOf(s), "Discuss your project") +
      "</section>"
    : heading("CAPABILITIES", "Services built around your business.") +
      "<section>" +
      serviceCards() +
      "</section>";
} else if (page === "work") {
  let p = projects.find((x) => x[0] === slug);
  if (p) {
    main.innerHTML =
      heading(esc(p[2]), esc(p[1]), esc(p[4])) +
      "<section>" +
      projectCard(p, projects.indexOf(p)) +
      "<h2>Inside the project.</h2><p>" +
      esc(
        settings.projectDetails?.[p[0]]?.status ||
          "Concept preview · Delivery status unconfirmed",
      ) +
      "</p><p>" +
      esc(settings.projectDetails?.[p[0]]?.technology || "") +
      "</p>" +
      cards(
        p[5]
          .split("|")
          .map(
            (x) => '<article class="card"><h3>' + esc(x) + "</h3></article>",
          ),
      ) +
      '<button id="bookmark"></button> ' +
      btn("start", "Discuss a similar project") +
      "</section>";
    let key = "saved-" + slug;
    function bookmarkState() {
      bookmark.textContent = sessionStorage[key]
        ? "Remove bookmark"
        : "Bookmark project";
    }
    bookmarkState();
    bookmark.onclick = () => {
      if (sessionStorage[key]) sessionStorage.removeItem(key);
      else sessionStorage[key] = 1;
      bookmarkState();
    };
  } else {
    main.innerHTML =
      heading(
        "PORTFOLIO",
        "Ideas turned into reality.",
        "Explore the interfaces and systems behind the studio’s work.",
      ) +
      '<section><div class="filters"></div><div id="portfolio" class="grid"></div></section>';
    for (let f of [
      "All",
      "Websites",
      "Apps",
      "Software",
      "AI",
      "3D Experiences",
    ]) {
      let b = document.createElement("button");
      b.textContent = f;
      b.onclick = () => {
        document
          .querySelectorAll(".filters button")
          .forEach((v) => v.classList.toggle("active", v === b));
        portfolio.innerHTML = projects
          .map((p, i) =>
            f === "All" || p[3].includes(f) ? projectCard(p, i) : "",
          )
          .join("");
      };
      document.querySelector(".filters").append(b);
      if (f === "All") b.click();
    }
  }
} else if (page === "pricing") {
  main.innerHTML =
    heading(
      "PRICING",
      "A clear place to start.",
      "Final pricing depends on your requirements. Compare packages and customize your estimate.",
    ) +
    "<section>" +
    pricing() +
    "<details><summary>Compare plans</summary>" +
    plans
      .map(
        (p) =>
          "<p><b>" +
          p[0] +
          "</b> · " +
          p[4].split("|").slice(0, 3).join(" · ") +
          "</p>",
      )
      .join("") +
    "</details><details><summary>What costs are quoted separately?</summary><p>Maintenance, hosting, third-party services and extra modules. Native platforms and app-store publication are scoped during consultation.</p></details>" +
    btn("start?plan=3", "Request a custom quote") +
    "</section>";
} else if (page === "about") {
  main.innerHTML =
    heading(
      "ABOUT THE STUDIO",
      "Your Vision. Our Code.<br><i>Extraordinary Results.</i>",
      "Premium technology. Accessible pricing. Limitless possibilities.",
    ) +
    "<section><h2>How we work.</h2>" +
    timeline() +
    '<h2>Technology in the studio.</h2><div class="strip">JavaScript · Three.js · Firebase · GitHub · CSS</div><h2>Built for your business.</h2>' +
    industryList() +
    '<button id="brochure">Download service brochure ↓</button></section>';
  brochure.onclick = async () =>
    (await import("./pdf.js")).pdf(
      "Studio services",
      plans
        .map(
          (p) => p[1] + " — from ₹" + p[2] + "\n" + p[4].replaceAll("|", ", "),
        )
        .join("\n\n"),
    );
} else if (["start", "contact"].includes(page)) {
  main.innerHTML = heading(
    "PROJECT INQUIRIES",
    page === "start" ? "Build your digital solution." : "Start a conversation.",
  );
  (await import("./inquiry.js")).mount(main, settings, page);
} else if (page === "playground") {
  main.innerHTML = heading(
    "INTERACTIVE LAB",
    "WebNora Live Playground.",
    "Explore working interfaces with fictional demonstration data.",
  );
  (await import("./lab.js")).mount(main);
} else if (["portal", "admin"].includes(page)) {
  main.innerHTML = heading(
    "WEBNORA WORKSPACE",
    page === "admin" ? "Studio administration." : "Client portal.",
  );
  await (await import("./workspace.js")).mount(main, page);
} else if (["privacy", "terms"].includes(page))
  main.innerHTML = heading(
    "STUDIO INFORMATION",
    page === "privacy" ? "Privacy policy" : "Terms of service",
    page === "privacy"
      ? "WebNora uses inquiry details to respond to project requests. Authorized staff manage these records in Firebase. Client workspace records are restricted to their assigned account. Contact the studio to request correction or removal."
      : "Estimates are indicative. Scope, timing, fees, hosting and ongoing support are agreed in a written quotation before work begins.",
  );
else
  main.innerHTML =
    heading("404", "Page not found.") + btn("", "Back to the studio");
document.title =
  (main.querySelector("h1")?.textContent || "Digital Studio") + " | WebNora";

if (!page)
  import("./scene.js")
    .then((m) => m.mountScene(document.querySelector(".scene")))
    .catch(() => {});

const contact = document.createElement("a");
contact.href = "/contact";
contact.className = "shortcut";
contact.setAttribute("aria-label", "Contact WebNora");
contact.textContent = "↗";
document.body.append(contact);
if (!page) {
  const s = document.createElement("section");
  s.innerHTML =
    "<small>THE STUDIO</small><h2>Why WebNora?</h2>" +
    cards(
      [
        "Premium design and custom development",
        "Transparent pricing and project scope",
        "Direct communication and optional support",
      ].map((t) => '<article class="card"><h3>' + t + "</h3></article>"),
    ) +
    "<h2>Choose your starting point.</h2>" +
    pricing();
  main.append(s);
}
import { enhance } from "./enhancements.js";
enhance({ page, slug, settings, projects, services });
