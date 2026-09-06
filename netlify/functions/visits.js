// Real, server-recorded visit counter backed by Netlify Blobs.
// POST increments the count once (called only the first time a browser
// visits in a given session — see assets/js/impact-counter.js); GET just
// reads the current value. This is an actual counted number, not a
// simulation — deliberately kept as simple as possible (no auth, no
// analytics vendor) since a nonprofit course site has no need for more.
//
// POST also records which country the visit came from, using Netlify's
// built-in server-side geolocation (derived from the request IP — no
// client-side location permission or script is involved). Only a country
// code and a running per-country count are stored; no per-visitor location
// history is kept. See netlify/functions/visits-by-country.js for the map
// that reads this data.

import { getStore } from "@netlify/blobs";

const TOTAL_KEY = "homepage-visits";
const COUNTRY_KEY = "visits-by-country";

export default async (request, context) => {
  // "strong" consistency: reads always hit the authoritative copy rather
  // than a possibly-stale edge replica. Blobs default to eventual
  // consistency, which caused visible lag/races between GET and POST here.
  const store = getStore({ name: "site-stats", consistency: "strong" });

  if (request.method === "GET") {
    const current = (await store.get(TOTAL_KEY, { type: "json" })) || { count: 0 };
    return Response.json(current, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "POST") {
    const current = (await store.get(TOTAL_KEY, { type: "json" })) || { count: 0 };
    const updated = { count: current.count + 1 };
    await store.setJSON(TOTAL_KEY, updated);

    const countryCode = context.geo?.country?.code || "XX";
    const byCountry = (await store.get(COUNTRY_KEY, { type: "json" })) || {};
    byCountry[countryCode] = (byCountry[countryCode] || 0) + 1;
    await store.setJSON(COUNTRY_KEY, byCountry);

    return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
  }

  return new Response("Method Not Allowed", { status: 405 });
};
