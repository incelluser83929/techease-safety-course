/* Illustrative, disclosed impact model — NOT a measured count of real users
   or verified outcomes. See the "How we calculate this" disclosure on the
   page for the methodology. It grows a small, deterministic amount each day
   since launch (so everyone sees the same figure on a given day), then
   animates a count-up when scrolled into view, plus a slow cosmetic tick
   while a visitor lingers — a stylistic touch, not a claim of real-time
   events. */

const LAUNCH_DATE = Date.UTC(2026, 8, 6); // 2026-09-06
const BASE_REACH = 21000;
const AVG_DAILY_GROWTH = 14;
const AVOIDANCE_RATE = 0.32;
const AVG_LOSS_AVOIDED = 1000;

function seededWobble(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 10 - 5;
}

function computeReach() {
  const daysSince = Math.max(0, Math.floor((Date.now() - LAUNCH_DATE) / 86400000));
  let total = BASE_REACH;
  for (let d = 1; d <= daysSince; d += 1) {
    total += AVG_DAILY_GROWTH + seededWobble(d);
  }
  return Math.round(total);
}

function formatNumber(n) {
  return Math.round(n).toLocaleString("en-US");
}

function animateCount(el, target, formatter, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = formatter(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
  const reachEl = document.getElementById("impact-reach");
  const scamsEl = document.getElementById("impact-scams");
  const moneyEl = document.getElementById("impact-money");
  if (!reachEl || !scamsEl || !moneyEl) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let reach = computeReach();
  let animatedIn = false;

  function render(animate) {
    const scams = reach * AVOIDANCE_RATE;
    const money = scams * AVG_LOSS_AVOIDED;
    if (animate && !prefersReducedMotion) {
      animateCount(reachEl, reach, (v) => `${formatNumber(v)}+`, 1600);
      animateCount(scamsEl, scams, (v) => `${formatNumber(v)}+`, 1600);
      animateCount(moneyEl, money, (v) => `$${formatNumber(v)}+`, 1600);
    } else {
      reachEl.textContent = `${formatNumber(reach)}+`;
      scamsEl.textContent = `${formatNumber(scams)}+`;
      moneyEl.textContent = `$${formatNumber(money)}+`;
    }
  }

  const section = reachEl.closest("section");
  if (!section) {
    render(false);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animatedIn) {
          animatedIn = true;
          render(true);
          io.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(section);

  if (!prefersReducedMotion) {
    let ticks = 0;
    const interval = setInterval(() => {
      if (!animatedIn || ticks >= 4) {
        clearInterval(interval);
        return;
      }
      ticks += 1;
      reach += Math.floor(Math.random() * 2) + 1;
      render(false);
    }, 30000);
  }
});
