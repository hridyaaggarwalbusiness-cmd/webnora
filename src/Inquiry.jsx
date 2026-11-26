import React, { useState } from "react";
import { plans, industries, addOns, money } from "./data.js";
import { pdf } from "./pdf.js";
import { thumbnail } from "./media.js";
const types = [...plans.map((p) => p[1]), "Custom solution"],
  steps = [
    "Project type",
    "Industry",
    "Features",
    "Design direction",
    "Estimate",
    "Your details",
  ];
const options = (xs) => xs.map((x) => <option key={x}>{x}</option>);
export default function Inquiry({ settings, page }) {
  const params = new URLSearchParams(location.search),
    [step, setStep] = useState(page === "contact" ? 5 : 0),
    [type, setType] = useState(types[Number(params.get("plan"))] || types[0]),
    [industry, setIndustry] = useState(
      industries.includes(params.get("industry"))
        ? params.get("industry")
        : "Other",
    ),
    [features, setFeatures] = useState([]),
    [style, setStyle] = useState("Modern"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ref, setRef] = useState("");
  const base =
      settings.base?.[types.indexOf(type)] ??
      [4999, 9999, 14999, 0][types.indexOf(type)],
    price = features.reduce(
      (s, f) => s + (settings.addOns?.[f] ?? addOns[f]),
      base,
    ),
    summary = [
      type,
      industry,
      style,
      features.join(", ") || "Base package",
      type === types[3]
        ? "Custom quotation"
        : money(price) + " – " + money(Math.ceil(price * 1.25)),
      params.has("customized") ? sessionStorage.design : "",
    ]
      .filter(Boolean)
      .join("\n");
  function changeType(v) {
    setType(v);
    setFeatures([]);
  }
  async function submit(e) {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    const f = new FormData(e.currentTarget);
    if (busy || f.get("trap")) return;
    setBusy(true);
    setError("");
    try {
      const { inquire } = await import("./db.js"),
        file = f.get("attachment");
      setRef(
        await inquire({
          name: f.get("name").trim(),
          business: f.get("business"),
          email: f.get("email").trim(),
          phone: f.get("phone"),
          summary: [
            summary,
            ...[
              "budget",
              "timeline",
              "method",
              "reference",
              "requirements",
            ].map((k) => k + ": " + f.get(k)),
          ].join("\n"),
          ...(file?.size ? { attachment: await thumbnail(file) } : {}),
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      {ref ? (
        <div className="panel">
          <h2>Inquiry received.</h2>
          <p>Your reference is {ref}.</p>
        </div>
      ) : (
        <form className="panel" onSubmit={submit}>
          <small>Step {step + 1} / 6</small>
          <h2>{steps[step]}</h2>
          {step === 0 && (
            <label>
              What would you like to build?
              <select value={type} onChange={(e) => changeType(e.target.value)}>
                {options(types)}
              </select>
            </label>
          )}
          {step === 1 && (
            <label>
              Business industry
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {options(industries)}
              </select>
            </label>
          )}
          {step === 2 &&
            Object.keys(addOns)
              .filter(
                (f) =>
                  type !== "Website" ||
                  !["Inventory management", "Real-time tracking"].includes(f),
              )
              .map((f) => (
                <label style={{ display: "block" }} key={f}>
                  <input
                    type="checkbox"
                    checked={features.includes(f)}
                    onChange={(e) =>
                      setFeatures(
                        e.target.checked
                          ? [...features, f]
                          : features.filter((v) => v !== f),
                      )
                    }
                  />
                  {f} · {money(settings.addOns?.[f] ?? addOns[f])}
                </label>
              ))}
          {step === 3 && (
            <div className="filters">
              {[
                "Minimal",
                "Luxury",
                "Modern",
                "Corporate",
                "Futuristic",
                "Creative",
              ].map((s) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="style"
                    checked={s === style}
                    onChange={() => setStyle(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}
          {step === 4 && (
            <>
              <p className="notice">{summary}</p>
              <p>
                This range is an estimate. Final pricing is agreed during
                consultation.
              </p>
              <button
                type="button"
                onClick={() => pdf("Project requirements", summary)}
              >
                Download requirements PDF
              </button>
            </>
          )}
          <div hidden={step !== 5}>
            <div className="fields">
              {[
                ["name", "Your name", "text", 120],
                ["business", "Business name", "text", 150],
                ["email", "Email", "email", 254],
                ["phone", "Phone", "tel", 40],
                ["budget", "Estimated budget", "text", 80],
                ["timeline", "Preferred timeline", "text", 120],
                [
                  "reference",
                  "Reference website or shared file link",
                  "url",
                  1500,
                ],
              ].map(([k, l, t, n]) => (
                <label key={k}>
                  {l}
                  <input
                    disabled={step !== 5}
                    name={k}
                    type={t}
                    maxLength={n}
                    required={["name", "email"].includes(k)}
                  />
                </label>
              ))}
              <label>
                Contact method
                <select name="method">
                  {options(["Email", "Phone", "WhatsApp"])}
                </select>
              </label>
              <label>
                Project type / plan
                <select
                  value={type}
                  onChange={(e) => changeType(e.target.value)}
                >
                  {options(types)}
                </select>
              </label>
            </div>
            <label>
              Project requirements
              <textarea
                name="requirements"
                maxLength="6000"
                disabled={step !== 5}
                required
              />
            </label>
            <label>
              Optional reference image
              <input
                type="file"
                name="attachment"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            <input hidden name="trap" tabIndex="-1" />
          </div>
          <div className="actions">
            {step > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button className="btn" disabled={busy}>
              {step < 5
                ? "Continue →"
                : busy
                  ? "Submitting…"
                  : "Submit inquiry"}
            </button>
          </div>
          <p role="status">{error && "Inquiry could not be sent. " + error}</p>
        </form>
      )}
      {page === "contact" && (
        <p>
          {/^[\w.+-]+@[\w.-]+$/.test(settings.email) && (
            <a href={"mailto:" + settings.email}>Email the studio ↗ </a>
          )}
          {/^\d{8,15}$/.test(settings.whatsapp) && (
            <a href={"https://wa.me/" + settings.whatsapp}>WhatsApp ↗</a>
          )}
        </p>
      )}
    </section>
  );
}
