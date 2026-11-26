import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const services = ["websites", "applications", "software"];
const labels = [
  "Website development",
  "Application development",
  "Business software",
];

function display(index) {
  const canvas = document.createElement("canvas");
  canvas.width = index === 1 ? 260 : 640;
  canvas.height = index === 1 ? 510 : 380;
  const c = canvas.getContext("2d");
  const width = canvas.width,
    height = canvas.height;
  const gradient = c.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, ["#28184b", "#251334", "#1c1538"][index]);
  gradient.addColorStop(1, ["#5d2b94", "#513260", "#32285b"][index]);
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);
  function text(s, x, y, size, color = "#f3ebff") {
    c.fillStyle = color;
    c.font = "500 " + size + "px system-ui";
    c.fillText(s, x, y);
  }
  const title = ["Studio / WebNora", "My workspace", "Revenue overview"][index];
  text(title, 24, 43, 24);
  c.fillStyle = "#76608e";
  c.fillRect(24, 60, width - 48, 1);
  if (index === 0) {
    text("Your vision.", 32, 168, 69);
    text("Taking shape.", 32, 249, 69, "#dfbdff");
    c.fillStyle = "#d6b4fa";
    c.beginPath();
    c.roundRect(32, 296, 176, 42, 21);
    c.fill();
    text("Explore the studio", 49, 323, 16, "#34194e");
  } else if (index === 1) {
    text("Today", 20, 124, 40);
    ["Design review", "Feedback", "Preview links"].forEach((s, i) => {
      c.fillStyle = "#694880";
      c.beginPath();
      c.roundRect(18, 161 + i * 92, 224, 72, 14);
      c.fill();
      text(s, 33, 205 + i * 92, 21);
    });
  } else {
    text("Monthly activity", 24, 112, 26, "#dbc7fd");
    const heights = [54, 71, 62, 94, 104, 91, 121, 110, 157, 169, 144, 193];
    heights.forEach((h, i) => {
      c.fillStyle = i === 11 ? "#e9ccff" : "#b884ec";
      c.fillRect(26 + i * 50, 335 - h, 31, h);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function mountScene(element) {
  if (!element) return () => {};
  const links = document.createElement("div");
  links.style.cssText =
    "position:absolute;inset:0;display:flex;align-items:stretch;z-index:1";
  const anchors = services.map((service, i) => {
    const a = document.createElement("a");
    a.href = "/services/" + service;
    a.setAttribute("aria-label", labels[i]);
    a.title = labels[i];
    a.style.cssText =
      "display:block;flex:" + [1.22, 0.6, 1][i] + ";border-radius:12px";
    links.append(a);
    return a;
  });
  if (getComputedStyle(element).position === "static")
    element.style.position = "relative";
  element.append(links);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    links.style.cssText =
      "display:flex;gap:.75rem;align-items:center;justify-content:center;text-align:center";
    anchors.forEach((a, i) => {
      a.textContent = labels[i];
    });
    return () => links.remove();
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.domElement.style.cssText =
    "display:block;width:100%;height:100%;pointer-events:none";
  element.append(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-5, 5, 2, -2, 0.1, 50);
  cam.position.set(0, 0, 10);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xffeaff, 0x634e8d, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 3.5);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const metal = new THREE.MeshStandardMaterial({
    color: 0x85758f,
    metalness: 0.53,
    roughness: 0.25,
  });
  const bezel = new THREE.MeshStandardMaterial({
    color: 0x201827,
    metalness: 0.4,
    roughness: 0.23,
  });
  function box(parent, w, h, d, r, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 2, r),
      material,
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  const devices = services.map((_, i) => {
    const device = new THREE.Group();
    const w = [3.6, 0.99, 2.8][i],
      h = [2.2, 2.05, 1.74][i];
    box(device, w, h, 0.16, 0.09, metal);
    box(device, w - 0.04, h - 0.04, 0.1, 0.06, bezel, 0, 0, 0.07);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.17, h - 0.17),
      new THREE.MeshBasicMaterial({ map: display(i) }),
    );
    plane.position.z = 0.125;
    device.add(plane);
    if (i === 0) {
      const keyboard = box(
        device,
        w + 0.12,
        0.09,
        1.55,
        0.04,
        metal,
        0,
        -h / 2,
        0.7,
      );
      keyboard.rotation.x = 0.17;
      box(keyboard, w * 0.84, 0.014, 0.65, 0.006, bezel, 0, 0.055, -0.12);
    }
    device.position.set([-2.05, 0.47, 2.67][i], [0.13, -0.18, 0.04][i], 0);
    device.rotation.set(
      [0.09, -0.1, -0.08][i],
      [-0.28, -0.27, -0.19][i],
      [-0.06, -0.08, 0.08][i],
    );
    group.add(device);
    return device;
  });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    active = false,
    pointer = 0,
    scroll = 0,
    hovered = -1;
  const render = (time = 0) => {
    const t = reduce.matches ? 0 : time * 0.001;
    group.rotation.y = reduce.matches ? 0 : pointer * 0.14;
    group.rotation.x = reduce.matches ? 0 : scroll * 0.12;
    devices.forEach((d, i) => {
      d.position.y =
        [0.13, -0.18, 0.04][i] +
        (reduce.matches ? 0 : 0.09 * Math.sin(t * 0.7 + i)) +
        (hovered === i ? 0.12 : 0);
    });
    renderer.render(scene, cam);
    frame = active && !reduce.matches ? requestAnimationFrame(render) : 0;
  };
  function refresh() {
    if (active && !frame) frame = requestAnimationFrame(render);
  }
  function resize() {
    const w = element.clientWidth,
      h = element.clientHeight;
    if (!w || !h) return;
    const halfW = Math.max(4.4, (1.55 * w) / h);
    cam.left = -halfW;
    cam.right = halfW;
    cam.top = (halfW * h) / w;
    cam.bottom = -cam.top;
    cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    refresh();
  }
  function move(e) {
    const rect = element.getBoundingClientRect();
    pointer = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  }
  const ac = new AbortController(),
    opts = { signal: ac.signal };
  element.addEventListener("pointermove", move, opts);
  element.addEventListener(
    "pointerleave",
    () => {
      pointer = 0;
      hovered = -1;
      refresh();
    },
    opts,
  );
  anchors.forEach((a, i) => {
    for (const name of ["focus", "pointerenter"])
      a.addEventListener(
        name,
        () => {
          hovered = i;
          refresh();
        },
        opts,
      );
    a.addEventListener(
      "blur",
      () => {
        hovered = -1;
        refresh();
      },
      opts,
    );
  });
  window.addEventListener(
    "scroll",
    () => {
      if (active) scroll = Math.min(1, window.scrollY / innerHeight);
    },
    { passive: true, signal: ac.signal },
  );
  reduce.addEventListener("change", refresh, opts);
  const size = new ResizeObserver(resize);
  size.observe(element);
  const visibility = new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    if (active) refresh();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  visibility.observe(element);
  resize();
  const dispose = () => {
    active = false;
    cancelAnimationFrame(frame);
    ac.abort();
    size.disconnect();
    visibility.disconnect();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        o.material.map?.dispose();
        o.material.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
    links.remove();
  };
  window.addEventListener(
    "pagehide",
    (e) => {
      if (!e.persisted) dispose();
    },
    opts,
  );
  return dispose;
}
