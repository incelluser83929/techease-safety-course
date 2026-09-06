/* Hero 3D scene: a protected "network" motif — a glowing shield-like core
   wrapped in an orbiting wireframe lattice, floating in a field of soft
   particles. Kept deliberately light (low poly counts, capped pixel ratio,
   paused when off-screen/tab-hidden/reduced-motion) since this site's
   audience often runs older laptops and tablets. */

import * as THREE from "three";

const mount = document.getElementById("hero-canvas");
if (mount) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  mount.appendChild(renderer.domElement);

  const primary = new THREE.Color(0x0079b8);
  const accent = new THREE.Color(0x00b8a1);

  // Soft core representing a protected device/account
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshStandardMaterial({
      color: primary,
      emissive: primary,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.1,
      flatShading: true,
    })
  );
  scene.add(core);

  // Orbiting wireframe "shield" lattice
  const lattice = new THREE.Mesh(
new THREE.IcosahedronGeometry(2.35, 1),
    new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.55 })
  );
  scene.add(lattice);

  // Ambient particle field
  const PARTICLE_COUNT = 220;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const radius = 4.5 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: accent,
    size: 0.045,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(4, 4, 6);
  scene.add(key);

  let width = 0;
  let height = 0;

  function resize() {
    width = mount.clientWidth;
    height = mount.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let targetX = 0;
  let targetY = 0;
  window.addEventListener("pointermove", (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = false;
  let clock = new THREE.Clock();

  function renderFrame() {
    const delta = clock.getDelta();
    core.rotation.y += delta * 0.18;
    core.rotation.x += delta * 0.08;
    lattice.rotation.y -= delta * 0.1;
    lattice.rotation.x += delta * 0.05;
    particles.rotation.y += delta * 0.03;

    camera.position.x += (targetX * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (-targetY * 1.2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    renderFrame();
    requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }

  if (prefersReducedMotion) {
    renderFrame();
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
      },
      { threshold: 0.05 }
    );
    io.observe(mount);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (mount.getBoundingClientRect().top < window.innerHeight) start();
    });
  }
}
