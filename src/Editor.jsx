import React, { useState, useEffect } from "react";
import { projects, addOns } from "./data.js";
import { read, save, backend } from "./db.js";
import { thumbnail } from "./media.js";
const defaultSettings = {
  base: [4999, 9999, 14999],
  addOns,
  portfolio: projects,
  serviceDescriptions: {},
  projectDetails: {},
};
function Entry({ index, rows, details, update, select }) {
  const original = rows[index] || Array(7).fill(""),
    [row, setRow] = useState([...original]),
    [meta, setMeta] = useState(details[original[0]] || {}),
    [video, setVideo] = useState(null),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  async function apply() {
    setBusy(true);
    try {
      if (
        !/^[\w-]+$/.test(row[0]) ||
        !row[1].trim() ||
        rows.some((r, i) => i !== index && r[0] === row[0])
      )
        throw Error("Use a unique slug and title.");
      const nextMeta = { ...meta };
      if (video) {
        if (
          video.size >= 20 * 1024 * 1024 ||
          !["video/mp4", "video/webm"].includes(video.type)
        )
          throw Error("Choose MP4 or WebM under 20 MB.");
        const { getStorage, ref, uploadBytes, getDownloadURL } =
            await import("firebase/storage"),
          { db } = await backend();
        nextMeta.video = await getDownloadURL(
          (
            await uploadBytes(
              ref(getStorage(db.app), "portfolio/" + crypto.randomUUID()),
              video,
            )
          ).ref,
        );
      }
      const next = [...rows];
      next[index] = row;
      const all = { ...details };
      delete all[original[0]];
      all[row[0]] = nextMeta;
      update(next, all);
      setMsg("Entry applied. Save a draft or publish to persist it.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }
  function move(delta) {
    const to = index + delta;
    if (to < 0 || to >= rows.length || index >= rows.length) return;
    const next = [...rows];
    [next[to], next[index]] = [next[index], next[to]];
    update(next, details);
    select(to);
  }
  return (
    <div className="panel">
      <h3>Portfolio entries</h3>
      <select
        aria-label="Select entry"
        value={index}
        onChange={(e) => select(Number(e.target.value))}
      >
        {rows.map((r, i) => (
          <option key={r[0]} value={i}>
            {r[1]}
          </option>
        ))}
        <option value={rows.length}>Add new entry</option>
      </select>
      <div className="fields">
        {[
          "URL slug",
          "Title",
          "Category",
          "Filters (comma-separated)",
          "Problem addressed",
          "Features (separate with |)",
          "Preview title",
        ].map((k, i) => (
          <label key={k}>
            {k}
            <input
              value={row[i]}
              onChange={(e) =>
                setRow(row.map((v, j) => (i === j ? e.target.value : v)))
              }
            />
          </label>
        ))}
        {["solution", "technology", "status", "url", "video"].map((k) => (
          <label key={k}>
            {k}
            <input
              value={meta[k] || ""}
              onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label>
        Project video
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => setVideo(e.target.files[0])}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={!!meta.hidden}
          onChange={(e) => setMeta({ ...meta, hidden: e.target.checked })}
        />{" "}
        Unpublished
      </label>
      <div className="actions">
        <button type="button" disabled={busy} onClick={apply}>
          Apply entry edits
        </button>
        <button type="button" onClick={() => move(-1)}>
          Move earlier
        </button>
        <button type="button" onClick={() => move(1)}>
          Move later
        </button>
      </div>
      <p role="status">{msg}</p>
    </div>
  );
}
export default function Editor() {
  const [data, setData] = useState(null),
    [json, setJson] = useState({}),
    [index, select] = useState(0),
    [target, setTarget] = useState(""),
    [logo, setLogo] = useState(null),
    [cover, setCover] = useState(null),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const v = {
          ...defaultSettings,
          ...((await read("content", "draft")) ||
            (await read("content", "published")) ||
            {}),
        };
        if (active) {
          setData(v);
          setTarget(v.portfolio[0]?.[0] || "");
          setJson(
            Object.fromEntries(
              ["base", "addOns", "serviceDescriptions"].map((k) => [
                k,
                JSON.stringify(v[k], null, 2),
              ]),
            ),
          );
        }
      } catch (e) {
        if (active) setMsg(e.message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  async function persist(id) {
    setBusy(true);
    try {
      const v = {
        ...data,
        ...Object.fromEntries(
          Object.entries(json).map(([k, s]) => [k, JSON.parse(s)]),
        ),
      };
      if (
        !Array.isArray(v.base) ||
        v.base.length !== 3 ||
        [...v.base, ...Object.values(v.addOns)].some(
          (n) => !Number.isFinite(n) || n < 0,
        ) ||
        Object.values(v.serviceDescriptions).some((x) => typeof x !== "string")
      )
        throw Error("Check the pricing and service descriptions.");
      if (logo) v.logo = await thumbnail(logo);
      if (cover) v.media = { ...v.media, [target]: await thumbnail(cover) };
      await save("content", id, v);
      setData(v);
      setMsg("Changes saved to " + id + ".");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data) return <p role="status">{msg || "Loading editor…"}</p>;
  return (
    <>
      <h3>Website editor</h3>
      {["headline", "description", "cta", "color", "email", "whatsapp"].map(
        (k) => (
          <label key={k}>
            {k}
            <input
              id={"edit-" + k}
              value={data[k] || ""}
              onChange={(e) => setData({ ...data, [k]: e.target.value })}
            />
          </label>
        ),
      )}
      {Object.keys(json).map((k) => (
        <label key={k}>
          {k} (JSON)
          <textarea
            value={json[k]}
            onChange={(e) => setJson({ ...json, [k]: e.target.value })}
          />
        </label>
      ))}
      <Entry
        key={index + ":" + (data.portfolio[index]?.[0] || "new")}
        index={index}
        rows={data.portfolio}
        details={data.projectDetails}
        update={(portfolio, projectDetails) =>
          setData((d) => ({ ...d, portfolio, projectDetails }))
        }
        select={select}
      />
      <label>
        Replace brand mark
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setLogo(e.target.files[0])}
        />
      </label>
      <label>
        Portfolio image project
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {data.portfolio.map((p) => (
            <option key={p[0]} value={p[0]}>
              {p[1]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Replace project image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCover(e.target.files[0])}
        />
      </label>
      <article className="card">
        <small>Homepage preview</small>
        <h2>
          <label htmlFor="edit-headline">
            {data.headline || "We build digital experiences"}
          </label>
        </h2>
        <p>
          <label htmlFor="edit-description">{data.description}</label>
        </p>
        <strong>
          <label htmlFor="edit-cta">{data.cta || "Start Your Project"}</label>
        </strong>
      </article>
      <div className="actions">
        {["draft", "published"].map((k) => (
          <button disabled={busy} key={k} onClick={() => persist(k)}>
            {k === "draft" ? "Save draft" : "Publish changes"}
          </button>
        ))}
      </div>
      <p role="status">{msg}</p>
    </>
  );
}
