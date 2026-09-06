/* Flat (equal-area-ish, top-down) world map showing real per-country visit
   counts. Data comes from netlify/functions/visits-by-country.js, which is
   built from Netlify's server-side IP geolocation on real visits (see
   netlify/functions/visits.js) — no client-side location permission is
   requested, and only a per-country running count is stored, never
   individual visitor locations.

   Map boundaries: world-atlas's public-domain 110m country topology.
   Country codes: a local ISO 3166-1 alpha-2 <-> numeric lookup
   (assets/data/iso-country-codes.json), since the topology's feature ids
   are ISO numeric codes but Netlify's geo API reports alpha-2. */

(async function initVisitsMap() {
  const container = document.getElementById("visits-map");
  const tooltip = document.getElementById("visits-map-tooltip");
  if (!container || !tooltip || !window.d3 || !window.topojson) return;

  let world;
  let isoMap;
  let byCountry;
  try {
    [world, isoMap, byCountry] = await Promise.all([
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((r) => r.json()),
      fetch("/assets/data/iso-country-codes.json").then((r) => r.json()),
      fetch("/.netlify/functions/visits-by-country")
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
    ]);
  } catch {
    container.innerHTML =
      '<p style="text-align:center; color: var(--muted-foreground);">Map data unavailable right now.</p>';
    return;
  }

  const numericToAlpha2 = {};
  Object.entries(isoMap).forEach(([alpha2, info]) => {
    numericToAlpha2[info.numeric] = alpha2;
  });

  // The topology stores ids as zero-padded strings (e.g. "076" for Brazil,
  // "036" for Australia), but our mapping table's keys have no leading
  // zeros — normalize through Number() before lookup either way.
  const normalizeId = (id) => String(Number(id));

  const countFor = (featureId) => {
    const alpha2 = numericToAlpha2[normalizeId(featureId)];
    return alpha2 ? byCountry[alpha2] || 0 : 0;
  };
  const nameFor = (feature) => {
    const alpha2 = numericToAlpha2[normalizeId(feature.id)];
    return (alpha2 && isoMap[alpha2] && isoMap[alpha2].name) || feature.properties?.name || "Unknown";
  };

  const features = window.topojson.feature(world, world.objects.countries).features;
  const maxCount = Math.max(1, ...features.map((f) => countFor(f.id)));

  const rootStyles = getComputedStyle(document.documentElement);
  const emptyColor = rootStyles.getPropertyValue("--muted").trim() || "#e5ecf1";
  const primaryColor = rootStyles.getPropertyValue("--primary").trim() || "#0079b8";
  const strokeColor = rootStyles.getPropertyValue("--card").trim() || "#ffffff";

  const width = container.clientWidth || 800;
  const height = Math.round(width * 0.52);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "World map showing which countries this site's visitors came from");

  const projection = d3.geoNaturalEarth1().fitSize([width, height], { type: "Sphere" });
  const path = d3.geoPath(projection);
  const colorScale = d3.scaleSequential().domain([0, maxCount]).interpolator(d3.interpolateRgb(emptyColor, primaryColor));

  svg
    .selectAll("path.country")
    .data(features)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", (d) => {
      const count = countFor(d.id);
      return count > 0 ? colorScale(count) : emptyColor;
    })
    .attr("stroke", strokeColor)
    .attr("stroke-width", 0.6)
    .on("mousemove", function (event, d) {
      const count = countFor(d.id);
      const name = nameFor(d);
      tooltip.hidden = false;
      tooltip.textContent = `${name}: ${count.toLocaleString()} visit${count === 1 ? "" : "s"}`;
      const rect = container.getBoundingClientRect();
      tooltip.style.left = `${event.clientX - rect.left}px`;
      tooltip.style.top = `${event.clientY - rect.top}px`;
      d3.select(this).attr("stroke", primaryColor).attr("stroke-width", 1.6).raise();
    })
    .on("mouseleave", function () {
      tooltip.hidden = true;
      d3.select(this).attr("stroke", strokeColor).attr("stroke-width", 0.6);
    });
})();
