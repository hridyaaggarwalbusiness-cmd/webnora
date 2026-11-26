import { esc } from "./data.js";
export function mount(main) {
  const section = document.createElement("section");
  main.append(section);
  let tab = new URLSearchParams(location.search).get("tab") || "websites",
    name = "Aster House",
    color = "#ad935e",
    font = "Georgia",
    rounded = "16",
    light = true,
    width = "100%",
    align = "left",
    screen = "Overview",
    category = "Customers",
    term = "",
    date = "",
    records = {
      Customers: [
        ["Ari Lane", 1200, "2026-01-10"],
        ["Mira Reed", 900, "2026-02-01"],
      ],
      Inventory: [["Studio notebooks", 24, "2026-01-12"]],
      Sales: [["Design consultation", 1600, "2026-02-03"]],
    };
  function render() {
    section.innerHTML =
      '<div class="filters">' +
      ["websites", "applications", "software"]
        .map(
          (x) =>
            '<button data-tab="' +
            x +
            '" class="' +
            (tab === x ? "active" : "") +
            '">' +
            x +
            "</button>",
        )
        .join("") +
      '</div><small>FICTIONAL DEMONSTRATION DATA</small><div class="panel" id="lab"></div>';
    section.querySelectorAll("[data-tab]").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.tab;
          screen = "Overview";
          render();
        }),
    );
    const lab = section.querySelector("#lab");
    if (tab === "websites") {
      lab.innerHTML =
        '<div class="fields"><label>Business name<input id="business" maxlength="60"></label><label>Brand color<input id="color" type="color"></label><label>Typography<select id="font"><option>Georgia</option><option>Arial</option><option>monospace</option></select></label><label>Viewport<select id="width"><option value="100%">Desktop</option><option value="740px">Tablet</option><option value="375px">Mobile</option></select></label><label>Button corners<input id="rounded" type="range" min="0" max="32"></label><label>Layout<select id="align"><option>left</option><option>center</option></select></label></div><button id="theme">Switch theme</button><article id="demo"></article><a class="btn" href="/start?customized=1">Build Something Like This for Me ↗</a>';
      function draw() {
        let d = lab.querySelector("#demo");
        d.style.cssText =
          "padding:30px;margin:24px auto;background:" +
          (light ? "#edeae3" : "#242127") +
          ";color:" +
          (light ? "#231e22" : "#fff") +
          ";width:min(100%," +
          width +
          ");font-family:" +
          font +
          ";text-align:" +
          align +
          ";border-top:6px solid " +
          color;
        d.innerHTML =
          "<b>" +
          esc(name) +
          '</b><h2 style="font-family:inherit">A slower kind of stay.</h2><p style="color:inherit">Private suites and garden breakfasts.</p><button style="border-radius:' +
          rounded +
          "px;background:" +
          color +
          ';color:#111">Enquire about a stay</button>';
        d.querySelector("button").onclick = () => {
          d.innerHTML =
            "<form><label>Sample guest name<input required></label><button>Send demo request</button></form>";
          d.querySelector("form").onsubmit = (e) => {
            e.preventDefault();
            d.innerHTML =
              "<h3>Demo request received.</h3><button>Back to preview</button>";
            d.querySelector("button").onclick = draw;
          };
        };
        sessionStorage.design = JSON.stringify({
          name,
          color,
          font,
          rounded,
          light,
          width,
          align,
        });
      }
      for (let [id, val, set] of [
        ["business", name, (v) => (name = v)],
        ["color", color, (v) => (color = v)],
        ["font", font, (v) => (font = v)],
        ["width", width, (v) => (width = v)],
        ["rounded", rounded, (v) => (rounded = v)],
        ["align", align, (v) => (align = v)],
      ]) {
        let el = lab.querySelector("#" + id);
        el.value = val;
        el.oninput = () => {
          set(el.value);
          draw();
        };
      }
      lab.querySelector("#theme").onclick = () => {
        light = !light;
        draw();
      };
      draw();
    } else if (tab === "applications") {
      lab.innerHTML =
        '<article style="max-width:340px;min-height:420px;margin:auto;padding:28px;border:7px solid #585164;border-radius:38px;background:' +
        (light ? "#ece7f6;color:#211a2b" : "#191622") +
        '"><small>STUDIO MOBILE</small><h2>' +
        esc(screen) +
        '</h2><p style="color:inherit">' +
        {
          Overview:
            "Your upcoming booking · Studio consultation, Friday at 10 AM.",
          Notifications: "Your consultation reminder is ready.",
          Profile: "Mira Reed · Demo account",
        }[screen] +
        '</p><div class="filters">' +
        ["Overview", "Notifications", "Profile"]
          .map((s) => '<button data-screen="' + s + '">' + s + "</button>")
          .join("") +
        '</div><button id="theme">Switch theme</button></article>';
      lab.querySelectorAll("[data-screen]").forEach(
        (b) =>
          (b.onclick = () => {
            screen = b.dataset.screen;
            render();
          }),
      );
      lab.querySelector("#theme").onclick = () => {
        light = !light;
        render();
      };
    } else {
      lab.innerHTML =
        '<h3>Operations dashboard</h3><div class="filters">' +
        Object.keys(records)
          .map((k) => '<button data-key="' + k + '">' + k + "</button>")
          .join("") +
        '</div><div class="fields"><label>Search ' +
        category +
        '<input id="term"></label><label>From date<input type="date" id="date"></label></div><table><thead><tr><th>' +
        category +
        '</th><th>Value</th><th>Date</th><th>Actions</th></tr></thead><tbody></tbody></table><form class="fields"><label>Name<input name="record" required maxlength="80"></label><label>Value<input type="number" name="value" min="0" required></label><button>Add record</button></form><button id="export">Export report CSV</button><p id="report"></p>';
      lab.querySelectorAll("[data-key]").forEach(
        (b) =>
          (b.onclick = () => {
            category = b.dataset.key;
            render();
          }),
      );
      const filtered = () =>
        records[category]
          .map((r, i) => [r, i])
          .filter(
            ([r]) =>
              r[0].toLowerCase().includes(term.toLowerCase()) &&
              (!date || r[2] >= date),
          );
      function rows() {
        lab.querySelector("tbody").innerHTML = filtered()
          .map(
            ([r, i]) =>
              "<tr><td>" +
              esc(r[0]) +
              "</td><td>" +
              r[1] +
              "</td><td>" +
              r[2] +
              '</td><td><button data-edit="' +
              i +
              '">Edit</button><button data-del="' +
              i +
              '">Delete</button></td></tr>',
          )
          .join("");
        lab.querySelector("#report").textContent =
          filtered().length +
          " records · Total " +
          filtered().reduce((n, [r]) => n + r[1], 0);
        lab.querySelectorAll("[data-del]").forEach(
          (b) =>
            (b.onclick = () => {
              records[category].splice(+b.dataset.del, 1);
              render();
            }),
        );
        lab.querySelectorAll("[data-edit]").forEach(
          (b) =>
            (b.onclick = () => {
              editing = +b.dataset.edit;
              form.record.value = records[category][editing][0];
              form.value.value = records[category][editing][1];
              form.querySelector("button").textContent = "Save changes";
            }),
        );
      }
      let editing = -1,
        form = lab.querySelector("form");
      form.onsubmit = (e) => {
        e.preventDefault();
        const r = [
          form.record.value,
          Number(form.value.value),
          new Date().toISOString().slice(0, 10),
        ];
        if (editing < 0) records[category].push(r);
        else records[category][editing] = r;
        render();
      };
      for (let k of ["term", "date"]) {
        let el = lab.querySelector("#" + k);
        el.value = k === "term" ? term : date;
        el.oninput = () => {
          if (k === "term") term = el.value;
          else date = el.value;
          rows();
        };
      }
      lab.querySelector("#export").onclick = () => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(
          new Blob(
            [
              "Name,Value,Date\n" +
                filtered()
                  .map(([r]) =>
                    r
                      .map(
                        (x) =>
                          '"' +
                          String(x)
                            .replace(/^[=+@-]/, "'")
                            .replaceAll('"', '""') +
                          '"',
                      )
                      .join(","),
                  )
                  .join("\n"),
            ],
            { type: "text/csv" },
          ),
        );
        a.download = "demo-report.csv";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
      rows();
    }
  }
  render();
}
