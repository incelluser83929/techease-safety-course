/* Small procedural 3D icons for lesson headers. No external models —
   each icon type is built from simple primitives so the whole site stays
   dependency-light and works offline. Auto-initializes every element with
   [data-icon-type] found on the page. */

import * as THREE from "three";

const primary = 0x0079b8;
const accent = 0x00b8a1;
const danger = 0xb3121a;

function buildLock(group) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.0, 0.6),
    new THREE.MeshStandardMaterial({ color: primary, roughness: 0.4, flatShading: true })
  );
  body.position.y = -0.25;
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.14, 12, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 })
  );
  shackle.position.y = 0.45;
  shackle.rotation.z = Math.PI;
  group.add(body, shackle);
}

function buildMail(group) {
  const envelope = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.0, 0.08),
    new THREE.MeshStandardMaterial({ color: primary, roughness: 0.5, flatShading: true })
  );
  const flap = new THREE.Mesh(
    new THREE.ConeGeometry(0.85, 0.75, 4),
    new THREE.MeshStandardMaterial({ color: danger, roughness: 0.5, flatShading: true })
  );
  flap.rotation.x = Math.PI;
  flap.rotation.y = Math.PI / 4;
  flap.scale.set(1, 0.62, 1);
  flap.position.z = 0.05;
  group.add(envelope, flap);
}

function buildKey(group) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.15, 12, 24),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 })
  );
  ring.position.x = -0.5;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: primary, roughness: 0.4 })
  );
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = 0.25;
  const tooth = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.3, 0.2),
    new THREE.MeshStandardMaterial({ color: primary, roughness: 0.4 })
  );
  tooth.position.set(0.75, -0.2, 0);
  group.add(ring, shaft, tooth);
}

function buildShieldCheck(group) {
  const shield = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.95, 0),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35, flatShading: true })
  );
  shield.scale.set(0.85, 1.1, 0.6);
  group.add(shield);
}

function buildRefresh(group) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.13, 12, 28, Math.PI * 1.5),
    new THREE.MeshStandardMaterial({ color: primary, roughness: 0.4 })
  );
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 })
  );
  arrow.position.set(0.7, 0, 0);
  arrow.rotation.z = -Math.PI / 2.4;
  group.add(ring, arrow);
}

function buildAlert(group) {
  const tri = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 1.3, 3),
    new THREE.MeshStandardMaterial({ color: danger, roughness: 0.4, flatShading: true })
  );
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  dot.position.y = -0.35;
  group.add(tri, dot);
}

const BUILDERS = {
  lock: buildLock,
  mail: buildMail,
  key: buildKey,
  shield: buildShieldCheck,
  refresh: buildRefresh,
  alert: buildAlert,
};

function initIcon(el) {
  const type = el.dataset.iconType;
  const builder = BUILDERS[type] || buildShieldCheck;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  el.appendChild(renderer.domElement);

  const group = new THREE.Group();
  builder(group);
  scene.add(group);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(3, 3, 4);
  scene.add(key);

  function resize() {
    const size = el.clientWidth;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(el);
  resize();

  const clock = new THREE.Clock();
  let running = false;

  function renderFrame() {
    const delta = clock.getDelta();
    group.rotation.y += delta * 0.6;
    group.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.2;
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    renderFrame();
    requestAnimationFrame(loop);
  }

  if (prefersReducedMotion) {
    renderFrame();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !running) {
          running = true;
          clock.start();
          requestAnimationFrame(loop);
        } else if (!entry.isIntersecting) {
          running = false;
        }
      });
    },
    { threshold: 0.05 }
  );
  io.observe(el);
}

document.querySelectorAll("[data-icon-type]").forEach(initIcon);
