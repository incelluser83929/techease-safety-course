/* Hero 3D scene: a field of small glowing phones scattered across the hero
   background. Hovering one wakes its screen up (emissive glow + scale +
   a soft point light). Kept deliberately light (low poly counts, capped
   pixel ratio, paused when off-screen/tab-hidden/reduced-motion) since this
   site's audience often runs older laptops and tablets. */

import * as THREE from "three";

const mount = document.getElementById("hero-canvas");
if (mount) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  mount.appendChild(renderer.domElement);

  const bodyColor = 0x0e1e27;
  const accent = 0x00cab1;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(4, 6, 8);
  scene.add(key);

  const hoverLight = new THREE.PointLight(accent, 0, 5, 2);
  hoverLight.position.set(0, 0, 2);
  scene.add(hoverLight);

  function buildPhone() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.28, 0.1),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, metalness: 0.3 })
    );
    group.add(body);

    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x02181a,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.1,
      roughness: 0.35,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.06, 0.02), screenMaterial);
    screen.position.z = 0.055;
    group.add(screen);

    const notch = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.03, 0.03),
      new THREE.MeshStandardMaterial({ color: bodyColor })
    );
    notch.position.set(0, 0.49, 0.066);
    group.add(notch);

    group.userData.screenMaterial = screenMaterial;
    group.userData.hoverT = 0;
    return group;
  }

  const PHONE_COUNT = 24;
  const phones = [];
  // On desktop the canvas sits full-bleed behind the text column, which is
  // masked out by a scrim (see .hero-scrim, styles.css) — so phones are
  // biased screen-right to stay clear of it. On mobile the canvas is its
  // own band above the text (no overlap), so phones spread evenly instead.
  const isDesktopLayout = window.matchMedia("(min-width: 901px)").matches;

  for (let i = 0; i < PHONE_COUNT; i += 1) {
    const phone = buildPhone();
    const x = isDesktopLayout ? Math.random() * 8 + 4 : (Math.random() - 0.5) * 11;
    const y = (Math.random() - 0.5) * 9.5;
    const z = (Math.random() - 0.5) * 6 - 1;
    phone.position.set(x, y, z);
    phone.rotation.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.35);
    const scale = 0.7 + Math.random() * 0.95;
    phone.scale.setScalar(scale);
    phone.userData.baseScale = scale;
    phone.userData.baseY = y;
    phone.userData.baseRotY = phone.rotation.y;
    phone.userData.floatPhase = Math.random() * Math.PI * 2;
    phone.userData.floatSpeed = 0.35 + Math.random() * 0.35;
    scene.add(phone);
    phones.push(phone);
  }

  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(mount);
  resize();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) {
      pointer.set(-10, -10);
      return;
    }
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("touchmove", (event) => {
    if (event.touches[0]) onPointerMove(event.touches[0]);
  });

  let running = false;
  const clock = new THREE.Clock();

  function renderFrame() {
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(phones, true);
    const hovered = hits.length ? hits[0].object.parent : null;

    let hoverTarget = null;
    phones.forEach((phone) => {
      const isHovered = phone === hovered;
      if (isHovered) hoverTarget = phone;
      phone.userData.hoverT += ((isHovered ? 1 : 0) - phone.userData.hoverT) * Math.min(delta * 6, 1);
      const t = phone.userData.hoverT;

      phone.userData.screenMaterial.emissiveIntensity = 0.1 + t * 1.7;
      phone.scale.setScalar(phone.userData.baseScale * (1 + t * 0.25));

      phone.position.y =
        phone.userData.baseY + Math.sin(elapsed * phone.userData.floatSpeed + phone.userData.floatPhase) * 0.18;
      phone.rotation.y =
        phone.userData.baseRotY + Math.sin(elapsed * 0.2 + phone.userData.floatPhase) * 0.12 + t * 0.18;
    });

    if (hoverTarget) {
      hoverLight.position.copy(hoverTarget.position);
      hoverLight.intensity += (2.2 - hoverLight.intensity) * 0.15;
    } else {
      hoverLight.intensity *= 0.85;
    }

    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.02;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.02;
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
      (entries) => entries.forEach((entry) => (entry.isIntersecting ? start() : stop())),
      { threshold: 0.05 }
    );
    io.observe(mount);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (mount.getBoundingClientRect().top < window.innerHeight) start();
    });
  }
}
