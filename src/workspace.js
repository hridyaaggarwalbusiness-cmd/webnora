import {
  backend,
  session,
  admin,
  login,
  logout,
  list,
  read,
  save,
} from "./db.js";
import { esc, money, projects, addOns } from "./data.js";
import { imageUrl, thumbnail } from "./media.js";
import { pdf } from "./pdf.js";
const kinds = [
  "inquiries",
  "customers",
  "projects",
  "quotations",
  "invoices",
  "feedback",
  "support",
];
const statuses = [
  "New",
  "Contacted",
  "Discussion",
  "Quotation sent",
  "Accepted",
  "In development",
  "Completed",
  "Closed",
];
const fields = {
  customers: ["name", "owner", "email", "notes"],
  projects: [
    "title",
    "owner",
    "status",
    "milestones",
    "tasks",
    "deadline",
    "updates",
    "preview",
    "documents",
    "completion",
  ],
  quotations: [
    "title",
    "owner",
    "customer",
    "plan",
    "items",
    "discount",
    "tax",
    "scope",
    "timeline",
    "terms",
    "status",
  ],
  invoices: [
    "title",
    "owner",
    "customer",
    "items",
    "discount",
    "tax",
    "terms",
    "status",
  ],
};
const labels = {
  owner: "Client Firebase UID",
  items: "Line items (one per line: description | amount)",
  discount: "Discount amount (INR)",
  tax: "Tax rate (%)",
  preview: "Preview URL",
  documents: "Private document links (one per line)",
};
const safeUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
};
export async function mount(main, page) {
  const sec = document.createElement("section");
  main.append(sec);
  const staff = page === "admin";
  let u,
    tab = staff ? "overview" : "projects",
    data = {},
    settings = {};
  function error(e) {
    sec.querySelector("[role=status]").textContent = e.message;
  }
  async function init() {
    sec.innerHTML =
      '<div class="panel"><p role="status">Connecting to the workspace…</p><button id="signin">Sign in with Google</button></div>';
    sec.querySelector("button").onclick = async () => {
      try {
        await login();
        await init();
      } catch (e) {
        error(e);
      }
    };
    try {
      u = await session();
      if (!u || u.isAnonymous) {
        sec.querySelector("[role=status]").textContent =
          "Sign in to view your workspace.";
        return;
      }
      if (staff && !(await admin(u))) {
        sec.querySelector("[role=status]").textContent =
          "This account needs the studio admin role.";
        return;
      }
      await refresh();
    } catch (e) {
      error(e);
    }
  }
  async function refresh() {
    const visible = staff
      ? kinds
      : kinds.filter((k) => !["inquiries", "customers"].includes(k));
    const res = await Promise.all(
      visible.map(async (k) => [k, await list(k, staff ? null : u.uid)]),
    );
    data = Object.fromEntries(res);
    draw();
  }
  function draw() {
    sec.innerHTML =
      "<small>" +
      esc(u.email || u.uid) +
      "</small><p>Your client ID: " +
      esc(u.uid) +
      '</p><button id="signout">Sign out</button><div class="filters">' +
      [
        ...(staff ? ["overview"] : []),
        ...Object.keys(data),
        ...(staff ? ["editor"] : []),
      ]
        .map(
          (k) =>
            '<button data-tab="' +
            k +
            '" class="' +
            (k === tab ? "active" : "") +
            '">' +
            k +
            "</button>",
        )
        .join("") +
      '</div><div class="panel" id="workspace"></div><p class="notice" role="status"></p>';
    sec.querySelector("#signout").onclick = async () => {
      await logout();
      await init();
    };
    sec.querySelectorAll("[data-tab]").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.tab;
          draw();
        }),
    );
    const box = sec.querySelector("#workspace");
    if (tab === "overview") {
      const metrics = {
        "Total inquiries": data.inquiries.length,
        "New inquiries": data.inquiries.filter((x) => x.status === "New")
          .length,
        "Active projects": data.projects.filter((x) => x.status !== "Completed")
          .length,
        "Completed projects": data.projects.filter(
          (x) => x.status === "Completed",
        ).length,
        "Pending quotations": data.quotations.filter(
          (x) => x.status !== "Accepted",
        ).length,
        "Customer records": data.customers.length,
      };
      box.innerHTML =
        '<h2>Studio overview</h2><div class="grid">' +
        Object.entries(metrics)
          .map(
            ([k, v]) =>
              "<article><small>" + k + "</small><h3>" + v + "</h3></article>",
          )
          .join("") +
        "</div><h3>Recent inquiries</h3>" +
        ([...data.inquiries]
          .sort((a, b) => (b.created?.seconds || 0) - (a.created?.seconds || 0))
          .slice(0, 5)
          .map((x) => "<p>" + esc(x.name) + " · " + esc(x.status) + "</p>")
          .join("") || "<p>No inquiries yet.</p>");
      return;
    }
    if (tab === "editor") {
      editor(box).catch(error);
      return;
    }
    box.innerHTML =
      "<h2>" +
      tab +
      '</h2><label>Search records<input type="search"></label><div class="records"></div>';
    let items = data[tab];
    const recordView = () => {
      const needle = box.querySelector("input").value.toLowerCase(),
        el = box.querySelector(".records");
      el.innerHTML =
        items
          .filter((x) => JSON.stringify(x).toLowerCase().includes(needle))
          .map(
            (x) =>
              "<details><summary>" +
              esc(x.title || x.name || x.type || x.id) +
              " · " +
              esc(x.status || "") +
              "</summary>" +
              Object.entries(x)
                .filter(([k, v]) => typeof v === "string" && k !== "id")
                .map(
                  ([k, v]) =>
                    "<p><b>" +
                    esc(labels[k] || k) +
                    "</b><br>" +
                    (k === "attachment" && imageUrl(v)
                      ? '<img style="max-width:min(100%,420px)" alt="Inquiry reference image" src="' +
                        imageUrl(v) +
                        '">'
                      : ["documents", "preview"].includes(k)
                        ? v
                            .split("\n")
                            .map((s) =>
                              safeUrl(s)
                                ? '<a href="' +
                                  esc(safeUrl(s)) +
                                  '" rel="noreferrer" target="_blank">' +
                                  esc(s) +
                                  "</a>"
                                : esc(s),
                            )
                            .join("<br>")
                        : esc(v).replaceAll("\n", "<br>")) +
                    "</p>",
                )
                .join("") +
              (staff
                ? '<button data-edit="' + esc(x.id) + '">Edit</button>'
                : "") +
              (["invoices", "quotations"].includes(tab)
                ? '<button data-pdf="' + esc(x.id) + '">Download PDF</button>'
                : "") +
              "</details>",
          )
          .join("") || "<p>No matching records.</p>";
      el.querySelectorAll("[data-edit]").forEach(
        (b) =>
          (b.onclick = () =>
            edit(
              box,
              items.find((x) => x.id === b.dataset.edit),
            )),
      );
      el.querySelectorAll("[data-pdf]").forEach(
        (b) =>
          (b.onclick = () => {
            const x = items.find((v) => v.id === b.dataset.pdf);
            pdf(
              tab + " " + x.id,
              Object.entries(x)
                .filter(([k]) => k !== "owner")
                .map(([k, v]) => k + ": " + v)
                .join("\n"),
            );
          }),
      );
    };
    recordView();
    box.querySelector("input").oninput = recordView;
    if (
      (staff && fields[tab]) ||
      (!staff && ["feedback", "support"].includes(tab))
    ) {
      let b = document.createElement("button");
      b.textContent = "Create record";
      b.onclick = () => edit(box, {});
      box.append(b);
    }
    if (staff && tab === "inquiries") {
      let b = document.createElement("button");
      b.textContent = "Export inquiries";
      b.onclick = () => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify(items, null, 2)]),
        );
        a.download = "inquiries.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
      box.append(b);
    }
  }
  function edit(box, x) {
    const keys =
      fields[tab] ||
      (tab === "inquiries"
        ? ["status", "internalNotes", "projectId"]
        : ["type", "message"]);
    box.innerHTML =
      "<h3>" +
      esc(tab) +
      "</h3><form>" +
      keys
        .map(
          (k) =>
            "<label>" +
            esc(labels[k] || k) +
            ((k === "status" && tab === "inquiries") || k === "type"
              ? '<select name="' +
                k +
                '">' +
                (k === "type"
                  ? tab === "support"
                    ? ["Support"]
                    : ["Feedback", "Revision"]
                  : [...statuses, "Archived"]
                )
                  .map(
                    (v) =>
                      "<option " +
                      (v === x[k] ? "selected" : "") +
                      ">" +
                      v +
                      "</option>",
                  )
                  .join("") +
                "</select>"
              : '<textarea name="' +
                k +
                '" maxlength="' +
                (k === "message" ? 3000 : 6000) +
                '" ' +
                (["title", "owner", "name", "message"].includes(k)
                  ? "required"
                  : "") +
                ">" +
                esc(x[k]) +
                "</textarea>") +
            "</label>",
        )
        .join("") +
      "<button>Save record</button></form>";
    box.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      let v = Object.fromEntries(new FormData(e.target));
      if (!staff) v.owner = u.uid;
      try {
        if ("items" in v) {
          let amounts = v.items
            .split("\n")
            .filter(Boolean)
            .map((s) => {
              let parts = s.split("|");
              if (parts.length !== 2 || !parts[1].trim())
                throw Error("Each line item needs a description and amount.");
              return Number(parts[1]);
            });
          if (
            [...amounts, Number(v.discount), Number(v.tax)].some(
              (n) => !Number.isFinite(n) || n < 0,
            )
          )
            throw Error("Enter valid non-negative amounts.");
          v.total = money(
            Math.max(
              0,
              amounts.reduce((a, b) => a + b, 0) - Number(v.discount),
            ) *
              (1 + Number(v.tax) / 100),
          );
        }
        await save(tab, x.id, v);
        await refresh();
      } catch (e) {
        error(e);
      }
    };
  }
  async function editor(box) {
    settings =
      (await read("content", "draft")) ||
      (await read("content", "published")) ||
      {};
    box.innerHTML =
      "<h3>Website editor</h3><form>" +
      ["headline", "description", "cta", "color", "email", "whatsapp"]
        .map(
          (k) =>
            "<label>" +
            k +
            '<input name="' +
            k +
            '" value="' +
            esc(settings[k]) +
            '"></label>',
        )
        .join("") +
      ["base", "addOns", "portfolio", "serviceDescriptions", "projectDetails"]
        .map(
          (k) =>
            "<label>" +
            k +
            ' (JSON)<textarea name="' +
            k +
            '">' +
            esc(
              JSON.stringify(
                settings[k] ??
                  {
                    base: [4999, 9999, 14999],
                    addOns,
                    portfolio: projects,
                    serviceDescriptions: {},
                    projectDetails: {},
                  }[k],
                null,
                2,
              ),
            ) +
            "</textarea></label>",
        )
        .join("") +
      '<label>Replace brand mark<input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp"></label><label>Portfolio image project<select id="imageProject">' +
      projects
        .map(
          (p) => '<option value="' + esc(p[0]) + '">' + esc(p[1]) + "</option>",
        )
        .join("") +
      '</select></label><label>Replace project image<input type="file" id="coverFile" accept="image/png,image/jpeg,image/webp"></label><article class="card" id="preview"></article><div class="actions"><button value="draft">Save draft</button><button value="published">Publish changes</button></div></form>';
    const f = box.querySelector("form");
    (await import("./portfolio-editor.js")).portfolioEditor(f);
    function preview() {
      box.querySelector("#preview").innerHTML =
        "<small>HOMEPAGE PREVIEW</small><h2>" +
        esc(f.headline.value || "We build digital experiences") +
        "</h2><p>" +
        esc(f.description.value) +
        "</p><strong>" +
        esc(f.cta.value || "Start Your Project") +
        "</strong>";
    }
    const previewBox = box.querySelector("#preview");
    previewBox.setAttribute(
      "aria-label",
      "Select a heading, description or call to action to edit",
    );
    previewBox.onclick = (event) => {
      const key = { H2: "headline", P: "description", STRONG: "cta" }[
        event.target.tagName
      ];
      if (key) {
        f.elements.namedItem(key).focus();
        f.elements.namedItem(key).select();
      }
    };
    preview();
    f.oninput = preview;
    f.onsubmit = async (e) => {
      e.preventDefault();
      try {
        let v = { ...settings, ...Object.fromEntries(new FormData(f)) };
        if (f.querySelector("#logoFile").files[0])
          v.logo = await thumbnail(f.querySelector("#logoFile").files[0]);
        if (f.querySelector("#coverFile").files[0])
          v.media = {
            ...settings.media,
            [f.querySelector("#imageProject").value]: await thumbnail(
              f.querySelector("#coverFile").files[0],
            ),
          };
        for (let k of [
          "base",
          "addOns",
          "portfolio",
          "serviceDescriptions",
          "projectDetails",
        ])
          v[k] = JSON.parse(v[k]);
        if (
          !Array.isArray(v.base) ||
          v.base.length !== 3 ||
          v.base.some((n) => !Number.isFinite(n) || n < 0) ||
          Object.values(v.addOns).some((n) => !Number.isFinite(n) || n < 0) ||
          !Array.isArray(v.portfolio) ||
          v.portfolio.some(
            (x) =>
              !Array.isArray(x) ||
              x.length !== 7 ||
              x.some((i) => typeof i !== "string") ||
              !/^[\w-]+$/.test(x[0]),
          )
        )
          throw Error("Check portfolio and pricing field formats.");
        await save("content", e.submitter.value, v);
        sec.querySelector("[role=status]").textContent =
          "Changes saved to " + e.submitter.value + ".";
      } catch (e) {
        error(e);
      }
    };
  }
  await init();
}
