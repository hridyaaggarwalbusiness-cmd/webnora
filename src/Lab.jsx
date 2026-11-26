import React, { useState, useEffect } from "react";
export default function Lab() {
  const [tab, setTab] = useState(
      new URLSearchParams(location.search).get("tab") || "websites",
    ),
    [design, setDesign] = useState({
      name: "Aster House",
      color: "#ad935e",
      font: "Georgia",
      rounded: 16,
      light: true,
      width: "100%",
      align: "left",
    }),
    [screen, setScreen] = useState("Overview"),
    [mode, setMode] = useState("preview");
  const update = (k, v) => setDesign((d) => ({ ...d, [k]: v }));
  useEffect(() => {
    sessionStorage.design = JSON.stringify(design);
  }, [design]);
  return (
    <section>
      <div className="filters">
        {["websites", "applications", "software"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <small>Fictional demonstration data</small>
      <div className="panel">
        {tab === "websites" ? (
          <>
            <div className="fields">
              <label>
                Business name
                <input
                  value={design.name}
                  maxLength="60"
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                Brand color
                <input
                  type="color"
                  value={design.color}
                  onChange={(e) => update("color", e.target.value)}
                />
              </label>
              {Object.entries({
                font: ["Georgia", "Arial", "monospace"],
                width: ["100%", "740px", "375px"],
                align: ["left", "center"],
              }).map(([k, items]) => (
                <label key={k}>
                  {
                    { font: "Typography", width: "Viewport", align: "Layout" }[
                      k
                    ]
                  }
                  <select
                    value={design[k]}
                    onChange={(e) => update(k, e.target.value)}
                  >
                    {items.map((x, i) => (
                      <option key={x} value={x}>
                        {k === "width" ? ["Desktop", "Tablet", "Mobile"][i] : x}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label>
                Button corners
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={design.rounded}
                  onChange={(e) => update("rounded", e.target.value)}
                />
              </label>
            </div>
            <button onClick={() => update("light", !design.light)}>
              Switch theme
            </button>
            <article
              id="demo"
              style={{
                margin: "24px auto",
                padding: 30,
                background: design.light ? "#edeae3" : "#242127",
                color: design.light ? "#231e22" : "white",
                width: "min(100%," + design.width + ")",
                fontFamily: design.font,
                textAlign: design.align,
                borderTop: "6px solid " + design.color,
              }}
            >
              <b>{design.name}</b>
              {mode === "preview" ? (
                <>
                  <h2 style={{ fontFamily: "inherit" }}>
                    A slower kind of stay.
                  </h2>
                  <p style={{ color: "inherit" }}>
                    Private suites and garden breakfasts.
                  </p>
                  <button
                    style={{
                      background: design.color,
                      borderRadius: +design.rounded,
                    }}
                    onClick={() => setMode("request")}
                  >
                    Enquire about a stay
                  </button>
                </>
              ) : mode === "request" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMode("sent");
                  }}
                >
                  <label>
                    Sample guest name
                    <input required />
                  </label>
                  <button>Send demo request</button>
                </form>
              ) : (
                <>
                  <h3>Demo request received.</h3>
                  <button onClick={() => setMode("preview")}>
                    Back to preview
                  </button>
                </>
              )}
            </article>
            <a className="btn" href="/start?customized=1">
              Build Something Like This for Me ↗
            </a>
          </>
        ) : tab === "applications" ? (
          <article
            style={{
              maxWidth: 340,
              minHeight: 420,
              margin: "auto",
              padding: 28,
              border: "7px solid #585164",
              borderRadius: 38,
              background: design.light ? "#ece7f6" : "#191622",
              color: design.light ? "#211a2b" : "white",
            }}
          >
            <small>Studio mobile</small>
            <h2>{screen}</h2>
            <p style={{ color: "inherit" }}>
              {
                {
                  Overview: "Upcoming studio consultation · Friday at 10 AM",
                  Notifications: "Your consultation reminder is ready.",
                  Profile: "Mira Reed · Demo account",
                }[screen]
              }
            </p>
            <div className="filters">
              {["Overview", "Notifications", "Profile"].map((s) => (
                <button key={s} onClick={() => setScreen(s)}>
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => update("light", !design.light)}>
              Switch theme
            </button>
          </article>
        ) : null}
        <div hidden={tab !== "software"}>
          <Operations />
        </div>
      </div>
    </section>
  );
}
function Operations() {
  const [data, setData] = useState({
      Customers: [
        ["Ari Lane", 1200, "2026-01-10"],
        ["Mira Reed", 900, "2026-02-01"],
      ],
      Inventory: [["Studio notebooks", 24, "2026-01-12"]],
      Sales: [
        ["Discovery session", 1000, "2026-01-06"],
        ["Design consultation", 1600, "2026-02-03"],
        ["Website design", 4999, "2026-03-12"],
      ],
    }),
    [kind, setKind] = useState("Customers"),
    [term, setTerm] = useState(""),
    [date, setDate] = useState(""),
    [editing, edit] = useState(null),
    [name, setName] = useState(""),
    [value, setValue] = useState("");
  const filtered = data[kind]
    .map((r, i) => ({ r, i }))
    .filter(
      ({ r }) =>
        r[0].toLowerCase().includes(term.toLowerCase()) && r[2] >= date,
    );
  function reset() {
    edit(null);
    setName("");
    setValue("");
  }
  function report() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([
        "Name,Value,Date\n" +
          filtered
            .map(({ r }) =>
              r
                .map(
                  (v) =>
                    '"' +
                    String(v)
                      .replace(/^[=+@-]/, "'")
                      .replaceAll('"', '""') +
                    '"',
                )
                .join(","),
            )
            .join("\n"),
      ]),
    );
    a.download = "demo-report.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const monthly = {};
  data.Sales.filter((r) => r[2] >= date).forEach((r) => {
    const k = r[2].slice(0, 7);
    monthly[k] = (monthly[k] || 0) + r[1];
  });
  return (
    <>
      <h3>Operations dashboard</h3>
      <figure>
        <figcaption>Revenue by month · demo sales</figcaption>
        {Object.entries(monthly)
          .sort()
          .map(([month, n]) => (
            <div key={month}>
              {month}{" "}
              <meter max={Math.max(1, ...Object.values(monthly))} value={n} /> ₹
              {n}
            </div>
          ))}
      </figure>
      <div className="filters">
        {Object.keys(data).map((k) => (
          <button
            key={k}
            onClick={() => {
              setKind(k);
              reset();
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <label>
        Search {kind}
        <input value={term} onChange={(e) => setTerm(e.target.value)} />
      </label>
      <label>
        From date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <table>
        <thead>
          <tr>
            {[kind, "Value", "Date", "Actions"].map((t) => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(({ r, i }) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
              <td>
                <button
                  onClick={() => {
                    edit(i);
                    setName(r[0]);
                    setValue(String(r[1]));
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setData({
                      ...data,
                      [kind]: data[kind].filter((_, j) => i !== j),
                    });
                    reset();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const rows = [...data[kind]];
          rows[editing ?? rows.length] = [
            name,
            Number(value),
            editing === null
              ? new Date().toISOString().slice(0, 10)
              : rows[editing][2],
          ];
          setData({ ...data, [kind]: rows });
          reset();
        }}
      >
        <label>
          Name
          <input
            required
            maxLength="80"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Value
          <input
            type="number"
            min="0"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button>{editing === null ? "Add record" : "Save changes"}</button>
      </form>
      <button onClick={report}>Export report CSV</button>
      <p>
        {filtered.length} records · Total{" "}
        {filtered.reduce((n, { r }) => n + r[1], 0)}
      </p>
    </>
  );
}
