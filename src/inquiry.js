import { plans, industries, addOns, money, esc } from "./data.js";
import { thumbnail } from "./media.js";
import { pdf } from "./pdf.js";
const opts = (items, v) =>
  items
    .map(
      (x) =>
        "<option " + (x === v ? "selected" : "") + ">" + esc(x) + "</option>",
    )
    .join("");
const styles = [
    "Minimal",
    "Luxury",
    "Modern",
    "Corporate",
    "Futuristic",
    "Creative",
  ],
  types = [...plans.map((p) => p[1]), "Custom solution"];
const names = [
  "Project type",
  "Industry",
  "Features",
  "Design direction",
  "Estimate",
  "Your details",
];
export function mount(main, settings, page) {
  let params = new URLSearchParams(location.search),
    step = page === "contact" ? 5 : 0,
    type = types[Number(params.get("plan") || 0)] || types[0],
    industry = industries.includes(params.get("industry"))
      ? params.get("industry")
      : "Other",
    features = [],
    style = "Modern",
    prefs = params.has("customized") ? sessionStorage.design || "" : "";
  const section = document.createElement("section");
  main.append(section);
  const price = () =>
    Number(
      settings.base?.[types.indexOf(type)] ??
        [4999, 9999, 14999, 0][types.indexOf(type)],
    ) +
    features.reduce((a, f) => a + Number(settings.addOns?.[f] ?? addOns[f]), 0);
  const estimate = () =>
    type === types[3]
      ? "Custom quotation"
      : money(price()) + " – " + money(Math.ceil(price() * 1.25));
  const summary = () =>
    [
      type,
      industry,
      style,
      features.join(", ") || "Base package",
      estimate(),
      prefs,
    ]
      .filter(Boolean)
      .join("\n");
  function render() {
    const avail = Object.keys(addOns).filter((k) =>
      type === "Website"
        ? !["Inventory management", "Real-time tracking"].includes(k)
        : true,
    );
    section.innerHTML =
      '<form class="panel"><small>STEP ' +
      (step + 1) +
      " / 6</small><h2>" +
      names[step] +
      "</h2>" +
      [
        '<label>What would you like to build?<select name="type">' +
          opts(types, type) +
          "</select></label>",
        '<label>Business industry<select name="industry">' +
          opts(industries, industry) +
          "</select></label>",
        avail
          .map(
            (x) =>
              '<label style="display:block"><input type="checkbox" value="' +
              x +
              '" ' +
              (features.includes(x) ? "checked" : "") +
              "> " +
              x +
              " · " +
              money(settings.addOns?.[x] ?? addOns[x]) +
              "</label>",
          )
          .join(""),
        '<div class="filters">' +
          styles
            .map(
              (x, i) =>
                '<label style="border-bottom:4px solid ' +
                ["#ddd", "#bd9d64", "#66baba", "#8191cc", "#b978fe", "#ff847e"][
                  i
                ] +
                '"><input type="radio" name="style" value="' +
                x +
                '" ' +
                (x === style ? "checked" : "") +
                "> " +
                x +
                "</label>",
            )
            .join("") +
          "</div>",
        '<p class="notice">' +
          esc(summary()) +
          '</p><p>This estimated range is indicative. Final scope and pricing are agreed during consultation.</p><button type="button" id="pdf">Download requirements PDF</button>',
        '<div class="fields">' +
          [
            ["name", "Your name", "text", 120],
            ["business", "Business name", "text", 150],
            ["email", "Email", "email", 254],
            ["phone", "Phone", "tel", 40],
            ["budget", "Estimated budget", "text", 80],
            ["timeline", "Preferred timeline", "text", 120],
            ["reference", "Reference website or shared file link", "url", 1500],
          ]
            .map(
              ([k, l, t, n]) =>
                "<label>" +
                l +
                '<input name="' +
                k +
                '" type="' +
                t +
                '" maxlength="' +
                n +
                '" ' +
                (["name", "email"].includes(k) ? "required" : "") +
                "></label>",
            )
            .join("") +
          '<label>Contact method<select name="method">' +
          opts(["Email", "Phone", "WhatsApp"]) +
          '</select></label><label>Project type / plan<select name="type">' +
          opts(types, type) +
          '</select></label></div><label>Project requirements<textarea name="requirements" required maxlength="6000"></textarea></label><label>Reference image (optional, PNG/JPEG/WebP)<input name="attachment" type="file" accept="image/png,image/jpeg,image/webp"></label><label hidden>Leave blank<input name="trap" tabindex="-1" autocomplete="off"></label>',
      ][step] +
      '<div class="actions">' +
      (step > 0 ? '<button type="button" id="back">Back</button>' : "") +
      '<button class="btn" type="submit">' +
      (step === 5 ? "Submit inquiry" : "Continue →") +
      '</button></div><div role="status" class="notice"></div></form>';
    const form = section.querySelector("form");
    if (step > 0)
      form.querySelector("#back").onclick = () => {
        step--;
        render();
      };
    if (step === 4)
      form.querySelector("#pdf").onclick = () =>
        pdf("Project requirements", summary());
    form.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      if (f.has("type")) {
        const next = f.get("type");
        if (next !== type) features = [];
        type = next;
      }
      if (step === 1) industry = f.get("industry");
      if (step === 2)
        features = [...form.querySelectorAll(":checked")].map((x) => x.value);
      if (step === 3) style = f.get("style");
      if (step < 5) {
        step++;
        render();
        return;
      }
      const status = form.querySelector("[role=status]"),
        b = form.querySelector("[type=submit]");
      if (f.get("trap")) return;
      b.disabled = true;
      status.textContent = "Submitting…";
      try {
        const { inquire } = await import("./db.js");
        const file = f.get("attachment");
        const id = await inquire({
          ...(file?.size ? { attachment: await thumbnail(file) } : {}),
          name: f.get("name").trim(),
          email: f.get("email").trim(),
          business: f.get("business"),
          phone: f.get("phone"),
          summary: [
            summary(),
            ...[
              "budget",
              "timeline",
              "method",
              "reference",
              "requirements",
            ].map((k) => k + ": " + f.get(k)),
          ].join("\n"),
        });
        section.innerHTML =
          '<div class="panel"><h2>Inquiry received.</h2><p>Your reference is ' +
          esc(id) +
          ".</p></div>";
      } catch (e) {
        status.textContent = "Inquiry could not be sent. " + e.message;
        b.disabled = false;
      }
    };
  }
  render();
  if (page === "contact") {
    const links = document.createElement("p");
    if (settings.email && /^[\w.+-]+@[\w.-]+$/.test(settings.email))
      links.innerHTML =
        '<a href="mailto:' + esc(settings.email) + '">Email the studio ↗</a> ';
    if (/^\d{8,15}$/.test(settings.whatsapp || ""))
      links.innerHTML +=
        '<a href="https://wa.me/' + settings.whatsapp + '">WhatsApp ↗</a>';
    main.append(links);
  }
}
