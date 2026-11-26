import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  createContext,
  useContext,
} from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import {
  plans,
  projects as seeds,
  services,
  industries,
  stages,
  stageCopy,
  money,
} from "./data.js";
import { imageUrl } from "./media.js";
const Inquiry = lazy(() => import("./Inquiry.jsx")),
  Lab = lazy(() => import("./Lab.jsx")),
  Workspace = lazy(() => import("./Workspace.jsx"));
const Studio = createContext({}),
  nav = [
    ["", "Home"],
    ["services", "Services"],
    ["work", "Our Work"],
    ["playground", "Live Playground"],
    ["pricing", "Pricing"],
    ["about", "About"],
    ["contact", "Contact"],
  ];
const [page = "", slug] = location.pathname.replace(/^\/|\/$/g, "").split("/");
function CTA({ to = "start", children = "Start Your Project" }) {
  return (
    <a className="btn" href={"/" + to}>
      {children} <span>↗</span>
    </a>
  );
}
function Brand() {
  const { settings } = useContext(Studio);
  return (
    <a className="brand" href="/">
      <img src={imageUrl(settings.logo) || "/mark.svg"} alt="" />
      WebNora
    </a>
  );
}
function Header() {
  const [menu, setMenu] = useState(false),
    [query, setQuery] = useState(""),
    dialog = useRef(null),
    { projects } = useContext(Studio);
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        dialog.current.showModal();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  const choices = [
    ...nav,
    ...services.map((s) => ["services/" + s[0], s[1]]),
    ...projects.map((p) => ["work/" + p[0], p[1]]),
    ["portal", "Client portal"],
    ["start", "Project configurator"],
  ].filter((x) => x[1].toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <header>
        <Brand />
        <nav
          style={
            menu
              ? {
                  display: "grid",
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#17151e",
                  padding: 18,
                }
              : undefined
          }
        >
          {nav.map(([url, text]) =>
            url === "services" ? (
              <div className="navgroup" key={url}>
                <a href="/services">Services</a>
                <div className="dropdown">
                  {services.map((s) => (
                    <a key={s[0]} href={"/services/" + s[0]}>
                      {s[1]}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                className={url === page ? "active" : ""}
                key={url}
                href={"/" + url}
              >
                {text}
              </a>
            ),
          )}
        </nav>
        <button
          id="find"
          aria-label="Search"
          onClick={() => dialog.current.showModal()}
        >
          ⌕
        </button>
        <CTA>Start a Project</CTA>
        <button
          id="menu"
          aria-expanded={menu}
          aria-label="Toggle menu"
          onClick={() => setMenu(!menu)}
        >
          ☰
        </button>
      </header>
      <dialog ref={dialog}>
        <form method="dialog">
          <button aria-label="Close search">×</button>
        </form>
        <label>
          Search WebNora
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div id="results">
          {choices.map(([url, text]) => (
            <a href={"/" + url} key={url}>
              {text}
            </a>
          ))}
          {!choices.length && "No matches"}
        </div>
      </dialog>
    </>
  );
}
function Title({ tag, children, desc }) {
  return (
    <div className="title">
      <small>{tag}</small>
      <h1>{children}</h1>
      {desc && <p>{desc}</p>}
    </div>
  );
}
function Footer() {
  return (
    <footer>
      <Brand />
      <p>From your first website to your entire digital ecosystem.</p>
      <div>
        {[
          ...nav.slice(1),
          ["portal", "Client portal"],
          ["admin", "Studio admin"],
          ["privacy", "Privacy"],
          ["terms", "Terms"],
        ].map(([url, t]) => (
          <a key={url} href={"/" + url}>
            {t}{" "}
          </a>
        ))}
      </div>
      <h2>
        Great Businesses Deserve
        <br />
        <i>Great Technology.</i>
      </h2>
      <CTA />
    </footer>
  );
}
function Timeline() {
  return (
    <div className="timeline">
      {stages.map((s, i) => (
        <article key={s}>
          <small>0{i + 1}</small>
          <h3>{s}</h3>
          <p>{stageCopy[i]}</p>
        </article>
      ))}
    </div>
  );
}
function Industries() {
  return (
    <>
      {industries.slice(0, -1).map((s, i) => (
        <details key={s}>
          <summary>{s}</summary>
          <p>
            {
              [
                "Manage room inquiries and reservations.",
                "Publish menus and collect table requests.",
                "Plan event menus and proposals.",
                "Connect attendance, fees and notices.",
                "Track stock and sales.",
                "Manage production lots and dispatch.",
                "Showcase treatments and schedule appointments.",
                "Coordinate appointment requests.",
                "Organize clients and billing.",
                "Build a local online presence.",
                "Launch your first product.",
                "Connect catalogue, checkout and fulfilment.",
              ][i]
            }
          </p>
          <a href={"/start?industry=" + encodeURIComponent(s)}>
            Discuss this solution ↗
          </a>
        </details>
      ))}
    </>
  );
}
function ServiceCards() {
  const { settings } = useContext(Studio);
  return (
    <div className="grid">
      {services.map(([id, t, d], i) => (
        <a className="card" key={id} href={"/services/" + id}>
          <b className="glyph">{["⌘", "◫", "▦"][i]}</b>
          <h3>{t}</h3>
          <p>{settings.serviceDescriptions?.[id] || d}</p>
          <strong>Explore service ↗</strong>
        </a>
      ))}
    </div>
  );
}
function Prices() {
  const { settings } = useContext(Studio);
  return (
    <div className="grid">
      {plans.map(([name, type, price, d, features, cta], i) => (
        <article className="card price" key={name}>
          <small>WebNora {name}</small>
          <h3>{type}</h3>
          <p>{d}</p>
          <small>Starting at</small>
          <h2>{money(settings.base?.[i] ?? Number(price.replace(",", "")))}</h2>
          <details>
            <summary>Package features</summary>
            <ul>
              {features.split("|").map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
          <CTA to={"start?plan=" + i}>{cta}</CTA>
        </article>
      ))}
    </div>
  );
}
function Cover({ p }) {
  const { settings } = useContext(Studio);
  return (
    <img
      loading="lazy"
      src={
        imageUrl(settings.media?.[p[0]]) ||
        "/assets/work-" +
          (Math.max(
            0,
            seeds.findIndex((v) => v[0] === p[0]),
          ) +
            1) +
          ".webp"
      }
      alt={p[1] + " concept preview"}
    />
  );
}
function ProjectCard({ p }) {
  return (
    <a className="project" href={"/work/" + p[0]}>
      <Cover p={p} />
      <small>{p[2]} · Concept preview</small>
      <h3>{p[1]} ↗</h3>
    </a>
  );
}
function Scene() {
  const ref = useRef(null);
  useEffect(() => {
    let current = true,
      dispose;
    import("./scene.js")
      .then((m) => {
        if (current) dispose = m.mountScene(ref.current);
      })
      .catch(() => {});
    return () => {
      current = false;
      dispose?.();
    };
  }, []);
  return <div ref={ref} className="scene" />;
}
function Home() {
  const { settings, projects } = useContext(Studio),
    [shift, setShift] = useState(0),
    [intro, setIntro] = useState(
      () =>
        !sessionStorage.intro &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  useEffect(() => {
    sessionStorage.intro = "1";
    const timer = setTimeout(() => setIntro(false), 2100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {intro && (
        <div className="intro">
          <img src="/mark.svg" alt="" />
          <b>WebNora</b>
          <small>Building What’s Next.</small>
          <button onClick={() => setIntro(false)}>Skip intro</button>
        </div>
      )}
      <section className="hero">
        <div className="visual">
          <img
            src="/assets/hero.webp"
            alt="Interlocking polished amethyst ribbons"
          />
        </div>
        <div className="heroCopy">
          <small>
            <b className="dot" /> Independent digital studio
          </small>
          <h1>
            {settings.headline || "We build digital experiences"}{" "}
            <i>that move businesses forward.</i>
          </h1>
          <p>
            {settings.description ||
              "From stunning websites and powerful applications to intelligent business software, WebNora transforms your ideas into technology that works."}
          </p>
          <div className="actions">
            <CTA>{settings.cta || "Start Your Project"}</CTA>
            <a className="secondary" href="/work">
              Explore Our Work ↗
            </a>
          </div>
          <aside>
            Professional digital solutions starting at{" "}
            <b>{money(settings.base?.[0] ?? 4999)}.</b>
          </aside>
        </div>
        <Scene />
        <div className="figure">FIG. 01 / DIGITAL ECOSYSTEM</div>
      </section>
      <div className="strip">
        <span>Our disciplines</span>Website development <i>✳</i> Applications{" "}
        <i>✳</i> Business software
      </div>
      <section>
        <small>Our capabilities</small>
        <h2>
          A studio for your <i>digital business.</i>
        </h2>
        <ServiceCards />
        <div className="signature">
          <code>&lt;WebNora /&gt;</code>
          <span>Website</span>
          <span>Application</span>
          <span>Business ecosystem</span>
        </div>
      </section>
      <section>
        <small>Selected work</small>
        <h2>Ideas turned into reality.</h2>
        <div className="grid">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p[0]} p={p} />
          ))}
        </div>
        <CTA to="work">Explore all work</CTA>
      </section>
      <section>
        <h2>From traditional business to digital powerhouse.</h2>
        <label>
          Explore the transformation
          <input
            type="range"
            value={shift}
            onChange={(e) => setShift(+e.target.value)}
          />
        </label>
        <div className="compare">
          <h3>
            {
              [
                "Manual registers",
                "Connected records",
                "Centralized dashboard",
              ][Math.floor(shift / 34)]
            }
          </h3>
          <div className="morph" style={{ "--reveal": shift + "%" }}>
            <div className="paper">Daily register</div>
            <div className="digital">
              Operations dashboard<div className="spark">▂▄▃▆▅█</div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2>Built for your business.</h2>
        <Industries />
      </section>
      <section>
        <h2>From discovery to launch.</h2>
        <Timeline />
      </section>
      <section>
        <h2>Why WebNora?</h2>
        <p>Custom development, transparent scope and direct communication.</p>
        <h2>Choose your starting point.</h2>
        <Prices />
      </section>
    </>
  );
}
function Work() {
  const { projects, settings } = useContext(Studio),
    [filter, setFilter] = useState("All"),
    [saved, setSaved] = useState(!!sessionStorage["saved-" + slug]),
    dialog = useRef(null);
  const p = projects.find((x) => x[0] === slug),
    extra = settings.projectDetails?.[slug] || {};
  if (slug && p)
    return (
      <>
        <Title tag={p[2]} desc={p[4]}>
          {p[1]}
        </Title>
        <section>
          <button
            className="project"
            onClick={() => dialog.current.showModal()}
          >
            <Cover p={p} />
          </button>
          <dialog className="lightbox" ref={dialog}>
            <form method="dialog">
              <button>Close preview ×</button>
            </form>
            <Cover p={p} />
          </dialog>
          <h2>Inside the project.</h2>
          <p>
            {extra.status || "Concept preview · Delivery status unconfirmed"}
          </p>
          <p>{extra.technology}</p>
          <div className="grid">
            {p[5].split("|").map((f) => (
              <article className="card" key={f}>
                <h3>{f}</h3>
              </article>
            ))}
          </div>
          <button
            onClick={() => {
              if (saved) sessionStorage.removeItem("saved-" + slug);
              else sessionStorage["saved-" + slug] = "1";
              setSaved(!saved);
            }}
          >
            {saved ? "Remove bookmark" : "Bookmark project"}
          </button>{" "}
          <CTA>Discuss a similar project</CTA>
          <h3>Design approach</h3>
          <p>{extra.solution || p[4]}</p>
          <a
            href={
              "/services/" +
              (p[3].includes("Websites")
                ? "websites"
                : p[3].includes("Apps")
                  ? "applications"
                  : "software")
            }
          >
            Related service ↗
          </a>{" "}
          {/^https:\/\//.test(extra.url) && (
            <a href={extra.url}>View project ↗</a>
          )}
          {/^https:\/\//.test(extra.video) && (
            <video controls src={extra.video} />
          )}
        </section>
      </>
    );
  return (
    <>
      <Title tag="Portfolio">Ideas turned into reality.</Title>
      <section>
        <div className="filters">
          {["All", "Websites", "Apps", "Software", "AI", "3D Experiences"].map(
            (f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ),
          )}
        </div>
        <div id="portfolio" className="grid">
          {projects
            .filter((p) => filter === "All" || p[3].includes(filter))
            .map((p) => (
              <ProjectCard key={p[0]} p={p} />
            ))}
        </div>
      </section>
    </>
  );
}
function Pages() {
  const { settings } = useContext(Studio);
  if (!page) return <Home />;
  if (page === "work") return <Work />;
  if (page === "services") {
    const i = services.findIndex((x) => x[0] === slug),
      s = services[i];
    return s ? (
      <>
        <Title
          tag="Studio services"
          desc={settings.serviceDescriptions?.[slug] || s[2]}
        >
          {s[1]}
        </Title>
        <section>
          <div className="grid">
            {s[3].split("|").map((f) => (
              <article className="card" key={f}>
                <h3>{f}</h3>
              </article>
            ))}
          </div>
          <CTA to={"start?plan=" + i}>Discuss your project</CTA>
          <a className="project" href={"/playground?tab=" + slug}>
            <img
              src={"/assets/work-" + [2, 1, 6][i] + ".webp"}
              alt="Concept interface preview"
            />
            Try an interface ↗
          </a>
        </section>
      </>
    ) : (
      <>
        <Title tag="Capabilities">Services built around your business.</Title>
        <section>
          <ServiceCards />
        </section>
      </>
    );
  }
  if (page === "pricing")
    return (
      <>
        <Title tag="Pricing" desc="Final pricing depends on your requirements.">
          A clear place to start.
        </Title>
        <section>
          <Prices />
          <details>
            <summary>Compare packages side by side</summary>
            <table>
              <tbody>
                {plans.map((p, i) => (
                  <tr key={p[0]}>
                    <th>{p[0]}</th>
                    <td>{p[1]}</td>
                    <td>
                      {money(
                        settings.base?.[i] ?? Number(p[2].replace(",", "")),
                      )}
                    </td>
                    <td>{p[4].split("|")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <details>
            <summary>What costs are quoted separately?</summary>
            <p>
              Maintenance, hosting, third-party services and extra modules.
              Native apps and app-store publication are scoped during
              consultation.
            </p>
          </details>
          <CTA to="start?plan=3">Request a custom quote</CTA>
        </section>
      </>
    );
  if (page === "about")
    return (
      <>
        <Title
          tag="About the studio"
          desc="Premium technology. Accessible pricing. Limitless possibilities."
        >
          Your Vision. Our Code. <i>Extraordinary Results.</i>
        </Title>
        <section>
          <h2>How we work.</h2>
          <Timeline />
          <h2>Technology in the studio.</h2>
          <div className="strip">React · Three.js · Firebase · GitHub</div>
          <h2>Built for your business.</h2>
          <Industries />
          <button
            onClick={async () =>
              (await import("./pdf.js")).pdf(
                "Studio services",
                plans
                  .map(
                    (p) =>
                      p[1] +
                      " — from ₹" +
                      p[2] +
                      "\n" +
                      p[4].replaceAll("|", ", "),
                  )
                  .join("\n\n"),
              )
            }
          >
            Download service brochure ↓
          </button>
        </section>
      </>
    );
  if (page === "contact" || page === "start")
    return (
      <>
        <Title tag="Project inquiries">
          {page === "contact"
            ? "Start a conversation."
            : "Build your digital solution."}
        </Title>
        <Inquiry settings={settings} page={page} />
      </>
    );
  if (page === "playground")
    return (
      <>
        <Title
          tag="Interactive lab"
          desc="Explore working interfaces with fictional demonstration data."
        >
          WebNora Live Playground.
        </Title>
        <Lab />
      </>
    );
  if (["admin", "portal"].includes(page))
    return (
      <>
        <Title tag="WebNora workspace">
          {page === "admin" ? "Studio administration." : "Client portal."}
        </Title>
        <Workspace staff={page === "admin"} />
      </>
    );
  if (page === "privacy" || page === "terms")
    return (
      <Title
        tag="Studio information"
        desc={
          page === "privacy"
            ? "WebNora uses inquiry details to respond to project requests. Authorized staff manage records in Firebase. Contact the studio to request correction or removal."
            : "Scope, timing, fees and ongoing support are agreed in writing before work begins."
        }
      >
        {page === "privacy" ? "Privacy policy" : "Terms of service"}
      </Title>
    );
  return (
    <>
      <Title tag="404">Page not found.</Title>
      <CTA to="">Back to the studio</CTA>
    </>
  );
}
function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      bar.current.style.transform =
        "scaleX(" + (height > 0 ? window.scrollY / height : 0) + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div className="scrollprogress" aria-hidden="true" ref={bar} />;
}
function App() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    let active = true;
    import("./db.js")
      .then((m) => m.read("content", "published"))
      .then((v) => {
        if (active && v) setSettings(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const projects = (settings.portfolio || seeds).filter(
    (p) =>
      Array.isArray(p) &&
      p.length === 7 &&
      !settings.projectDetails?.[p[0]]?.hidden,
  );
  return (
    <Studio.Provider value={{ settings, projects }}>
      <div
        style={{
          "--accent": /^#[a-f0-9]{6}$/i.test(settings.color)
            ? settings.color
            : undefined,
        }}
      >
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <Header />
        <main id="main">
          <Suspense fallback={<p role="status">Loading workspace…</p>}>
            <Pages />
          </Suspense>
        </main>
        <Footer />
        <a className="shortcut" aria-label="Contact WebNora" href="/contact">
          ↗
        </a>
      </div>
    </Studio.Provider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
