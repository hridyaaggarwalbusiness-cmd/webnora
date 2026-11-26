import React, { useEffect, useState } from "react";
import { session, login, logout, admin, list, save } from "./db.js";
import { money } from "./data.js";
import { pdf } from "./pdf.js";
import { imageUrl } from "./media.js";
import Editor from "./Editor.jsx";
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
function RecordForm({ kind, item, uid, staff, onDone, onCancel }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    keys =
      fields[kind] ||
      (kind === "inquiries"
        ? ["status", "internalNotes", "projectId"]
        : ["type", "message"]);
  async function submit(e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      if (!staff) v.owner = uid;
      if ("items" in v) {
        const amounts = v.items
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const parts = line.split("|");
            if (parts.length !== 2 || !parts[1].trim())
              throw Error("Use description | amount for each line item.");
            return Number(parts[1]);
          });
        if (
          [...amounts, Number(v.discount), Number(v.tax)].some(
            (n) => !Number.isFinite(n) || n < 0,
          )
        )
          throw Error("Use non-negative numbers for amounts and tax.");
        v.total = money(
          Math.max(0, amounts.reduce((n, a) => n + a, 0) - Number(v.discount)) *
            (1 + Number(v.tax) / 100),
        );
      }
      await save(kind, item.id, v);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <h3>{kind}</h3>
      {keys.map((k) => (
        <label key={k}>
          {labels[k] || k}
          {(k === "status" && kind === "inquiries") || k === "type" ? (
            <select name={k} defaultValue={item[k]}>
              {(k === "type"
                ? kind === "support"
                  ? ["Support"]
                  : ["Feedback", "Revision"]
                : [...statuses, "Archived"]
              ).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          ) : (
            <textarea
              name={k}
              defaultValue={item[k] || ""}
              maxLength={k === "message" ? 3000 : 6000}
              required={["title", "owner", "name", "message"].includes(k)}
            />
          )}
        </label>
      ))}
      <button disabled={busy}>Save record</button>{" "}
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <p role="status">{error}</p>
    </form>
  );
}
function Overview({ data: d }) {
  const stats = {
    "Total inquiries": d.inquiries.length,
    "New inquiries": d.inquiries.filter((x) => x.status === "New").length,
    "Active projects": d.projects.filter((x) => x.status !== "Completed")
      .length,
    "Completed projects": d.projects.filter((x) => x.status === "Completed")
      .length,
    "Pending quotations": d.quotations.filter((x) => x.status !== "Accepted")
      .length,
    "Customer records": d.customers.length,
  };
  return (
    <>
      <h2>Studio overview</h2>
      <div className="grid">
        {Object.entries(stats).map(([k, v]) => (
          <article key={k}>
            <small>{k}</small>
            <h3>{v}</h3>
          </article>
        ))}
      </div>
      <h3>Recent inquiries</h3>
      {[...d.inquiries]
        .sort((a, b) => (b.created?.seconds || 0) - (a.created?.seconds || 0))
        .slice(0, 5)
        .map((x) => (
          <p key={x.id}>
            {x.name} · {x.status}
          </p>
        ))}
      {!d.inquiries.length && <p>No inquiries yet.</p>}
    </>
  );
}
function Records({ items, kind, staff, edit }) {
  const [term, setTerm] = useState(""),
    matches = items.filter((x) =>
      JSON.stringify(x).toLowerCase().includes(term.toLowerCase()),
    );
  return (
    <>
      <h2>{kind}</h2>
      <label>
        Search records
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </label>
      {matches.map((x) => (
        <details key={x.id}>
          <summary>
            {x.title || x.name || x.type || x.id} · {x.status}
          </summary>
          {Object.entries(x)
            .filter(([k, v]) => typeof v === "string" && k !== "id")
            .map(([k, v]) => (
              <p key={k}>
                <b>{labels[k] || k}</b>
                <br />
                {k === "attachment" && imageUrl(v) ? (
                  <img
                    style={{ maxWidth: "100%" }}
                    alt="Inquiry reference"
                    src={imageUrl(v)}
                  />
                ) : ["documents", "preview"].includes(k) ? (
                  v.split("\n").map((s, i) => (
                    <React.Fragment key={i}>
                      {safeUrl(s) ? (
                        <a href={safeUrl(s)} target="_blank" rel="noreferrer">
                          {s}
                        </a>
                      ) : (
                        s
                      )}
                      <br />
                    </React.Fragment>
                  ))
                ) : (
                  <span style={{ whiteSpace: "pre-line" }}>{v}</span>
                )}
              </p>
            ))}
          {staff && <button onClick={() => edit(x)}>Edit</button>}
          {["invoices", "quotations"].includes(kind) && (
            <button
              onClick={() =>
                pdf(
                  kind + " " + x.id,
                  Object.entries(x)
                    .filter(([k]) => k !== "owner")
                    .map(([k, v]) => k + ": " + v)
                    .join("\n"),
                )
              }
            >
              Download PDF
            </button>
          )}
        </details>
      ))}
      {!matches.length && <p>No matching records.</p>}
      {((staff && fields[kind]) ||
        (!staff && ["feedback", "support"].includes(kind))) && (
        <button onClick={() => edit({})}>Create record</button>
      )}
      {staff && kind === "inquiries" && (
        <button
          onClick={() => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
              new Blob([JSON.stringify(items, null, 2)]),
            );
            a.download = "inquiries.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          }}
        >
          Export inquiries
        </button>
      )}
    </>
  );
}
export default function Workspace({ staff }) {
  const [user, setUser] = useState(null),
    [data, setData] = useState(null),
    [message, setMessage] = useState("Connecting…"),
    [tab, setTab] = useState(staff ? "overview" : "projects"),
    [item, edit] = useState(null),
    [reload, refresh] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const u = await session();
        if (!active) return;
        setUser(u);
        if (!u || u.isAnonymous) {
          setMessage("Sign in to view your workspace.");
          return;
        }
        if (staff && !(await admin(u)))
          throw Error("This account needs the studio admin role.");
        const entries = await Promise.all(
          kinds
            .filter((k) => staff || !["inquiries", "customers"].includes(k))
            .map(async (k) => [k, await list(k, staff ? null : u.uid)]),
        );
        if (active) {
          setData(Object.fromEntries(entries));
          setMessage("");
        }
      } catch (e) {
        if (active) setMessage(e.message);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [reload, staff]);
  async function authenticate(signout) {
    try {
      if (signout) {
        await logout();
        setData(null);
        setUser(null);
      } else await login();
      refresh((v) => v + 1);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <section>
      {!data ? (
        <div className="panel">
          <p role="status">{message}</p>
          <button onClick={() => authenticate(false)}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          <small>{user.email}</small>
          <p>Your client ID: {user.uid}</p>
          <button onClick={() => authenticate(true)}>Sign out</button>
          <div className="filters">
            {[
              ...(staff ? ["overview"] : []),
              ...Object.keys(data),
              ...(staff ? ["editor"] : []),
            ].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => {
                  setTab(t);
                  edit(null);
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="panel">
            {tab === "overview" ? (
              <Overview data={data} />
            ) : tab === "editor" ? (
              <Editor />
            ) : item ? (
              <RecordForm
                kind={tab}
                item={item}
                uid={user.uid}
                staff={staff}
                onCancel={() => edit(null)}
                onDone={() => {
                  edit(null);
                  refresh((v) => v + 1);
                }}
              />
            ) : (
              <Records
                key={tab}
                kind={tab}
                items={data[tab]}
                staff={staff}
                edit={edit}
              />
            )}
          </div>
          <p role="status">{message}</p>
        </>
      )}
    </section>
  );
}
