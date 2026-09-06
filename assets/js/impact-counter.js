/* Real, disclosed impact model. "Site visits since launch" is a genuine
   server-recorded count from a Netlify Function backed by Netlify Blobs
   (see netlify/functions/visits.js) — not a simulation or borrowed number.
   It increments once per browser session (via sessionStorage) so refreshing
   the page doesn't inflate it. The "scams avoided" / "money protected"
   figures are still illustrative extrapolations from that real count — we
   have no way to measure actual scam outcomes — but are now grounded in
   real, cited sources rather than round guesses (see the page's "How we
   calculate this" disclosure for the reasoning and links):
   - 3% avoidance rate: Microsoft's Digital Defense Report finding that
     basic security-awareness training alone (no ongoing reinforcement)
     reduces phishing susceptibility by about that much.
   - $500 avoided loss: a deliberately conservative fraction of the FBI
     IC3 2024 report's $19,372 average loss per complaint ($33,231 for
     victims 60+) — that average is skewed way up by large-dollar categories
     (investment fraud, BEC) this basic course doesn't really address. */

const AVOIDANCE_RATE = 0.03;
const AVG_LOSS_AVOIDED = 500;
const SESSION_FLAG = "techease-visit-counted";

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

async function fetchRealVisitCount() {
  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(SESSION_FLAG) === "1";
  } catch {
    /* sessionStorage unavailable (private browsing) — fall back to GET-only */
    alreadyCounted = true;
  }

  const response = await fetch("/.netlify/functions/visits", {
    method: alreadyCounted ? "GET" : "POST",
  });
  if (!response.ok) throw new Error(`visits function returned ${response.status}`);
  const data = await response.json();

  if (!alreadyCounted) {
    try {
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      /* ignore — non-critical */
    }
  }

  return data.count;
}

document.addEventListener("DOMContentLoaded", async () => {
  const reachEl = document.getElementById("impact-reach");
  const scamsEl = document.getElementById("impact-scams");
  const moneyEl = document.getElementById("impact-money");
  const noteEl = document.getElementById("impact-note");
  if (!reachEl || !scamsEl || !moneyEl) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let reach;
  try {
    reach = await fetchRealVisitCount();
  } catch {
    reachEl.textContent = "—";
    scamsEl.textContent = "—";
    moneyEl.textContent = "—";
    if (noteEl) noteEl.textContent = "Live counter is temporarily unavailable — check back soon.";
    return;
  }

  function render(animate) {
    const scams = reach * AVOIDANCE_RATE;
    const money = scams * AVG_LOSS_AVOIDED;
    if (animate && !prefersReducedMotion) {
      animateCount(reachEl, reach, formatNumber, 1200);
      animateCount(scamsEl, scams, formatNumber, 1200);
      animateCount(moneyEl, money, (v) => `$${formatNumber(v)}`, 1200);
    } else {
      reachEl.textContent = formatNumber(reach);
      scamsEl.textContent = formatNumber(scams);
      moneyEl.textContent = `$${formatNumber(money)}`;
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
        if (entry.isIntersecting) {
          render(true);
          io.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(section);
});
