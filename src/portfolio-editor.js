import { esc } from "./data.js";
import { backend } from "./db.js";
export function portfolioEditor(form) {
  const json = form.elements.namedItem("portfolio"),
    detail = form.elements.namedItem("projectDetails"),
    panel = document.createElement("div");
  panel.className = "panel";
  json.parentElement.before(panel);
  let current = 0;
  function parse() {
    return JSON.parse(json.value);
  }
  function draw() {
    const rows = parse(),
      p = rows[current] || ["", "", "", "", "", "", ""],
      d = JSON.parse(detail.value)[p[0]] || {};
    panel.innerHTML =
      "<h3>Portfolio entries</h3><label>Select entry<select data-select>" +
      rows
        .map(
          (v, i) =>
            '<option value="' +
            i +
            '" ' +
            (current === i ? "selected" : "") +
            ">" +
            esc(v[1]) +
            "</option>",
        )
        .join("") +
      '<option value="' +
      rows.length +
      '" ' +
      (current === rows.length ? "selected" : "") +
      '>Add new entry</option></select></label><div class="fields">' +
      [
        "URL slug",
        "Title",
        "Category",
        "Filters (comma-separated)",
        "Problem addressed",
        "Preview title",
        "Features (separate with |)",
        "Solution",
        "Technology stack",
        "Delivery status",
        "Live URL",
        "Video URL",
      ]
        .map(
          (k, i) =>
            "<label>" +
            k +
            '<input data-field="' +
            i +
            '" value="' +
            esc(
              [
                p[0],
                p[1],
                p[2],
                p[3],
                p[4],
                p[6],
                p[5],
                d.solution,
                d.technology,
                d.status,
                d.url,
                d.video,
              ][i],
            ) +
            '"></label>',
        )
        .join("") +
      '</div><label>Project video (optional, up to 20 MB)<input data-video type="file" accept="video/mp4,video/webm"></label><label><input type="checkbox" data-hidden ' +
      (d.hidden ? "checked" : "") +
      '> Unpublished</label><div class="actions"><button type="button" data-apply>Apply entry edits</button><button type="button" data-up>Move earlier</button><button type="button" data-down>Move later</button></div><p role="status"></p>';
    panel.querySelector("[data-select]").onchange = (e) => {
      current = Number(e.target.value);
      draw();
    };
    for (const [attr, delta] of [
      ["up", -1],
      ["down", 1],
    ])
      panel.querySelector("[data-" + attr + "]").onclick = () => {
        let to = current + delta;
        if (to < 0 || to >= rows.length || current >= rows.length) return;
        [rows[to], rows[current]] = [rows[current], rows[to]];
        json.value = JSON.stringify(rows, null, 2);
        current = to;
        draw();
      };
    panel.querySelector("[data-apply]").onclick = async () => {
      let f = [...panel.querySelectorAll("[data-field]")].map((el) =>
        el.value.trim(),
      );
      try {
        if (
          !/^[a-z0-9-]+$/.test(f[0]) ||
          !f[1] ||
          rows.some((r, i) => i !== current && r[0] === f[0])
        )
          throw Error("Use a unique URL slug and a title.");
        const file = panel.querySelector("[data-video]").files[0];
        if (file) {
          if (
            file.size > 20 * 1024 * 1024 ||
            !["video/mp4", "video/webm"].includes(file.type)
          )
            throw Error("Choose MP4 or WebM under 20 MB.");
          const { getStorage, ref, uploadBytes, getDownloadURL } =
            await import("firebase/storage");
          const { db } = await backend();
          const stored = await uploadBytes(
            ref(getStorage(db.app), "portfolio/" + crypto.randomUUID()),
            file,
          );
          f[11] = await getDownloadURL(stored.ref);
        }
        const meta = JSON.parse(detail.value);
        if (p[0] !== f[0]) delete meta[p[0]];
        meta[f[0]] = {
          solution: f[7],
          technology: f[8],
          status: f[9],
          url: f[10],
          video: f[11],
          hidden: panel.querySelector("[data-hidden]").checked,
        };
        rows[current] = [f[0], f[1], f[2], f[3], f[4], f[6], f[5]];
        json.value = JSON.stringify(rows, null, 2);
        detail.value = JSON.stringify(meta, null, 2);
        draw();
        panel.querySelector("[role=status]").textContent =
          "Entry applied. Save draft or publish to persist changes.";
      } catch (err) {
        panel.querySelector("[role=status]").textContent = err.message;
      }
    };
  }
  draw();
}
