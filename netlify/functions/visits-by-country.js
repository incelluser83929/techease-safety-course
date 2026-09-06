// Read-only endpoint for the world map on the home page. Returns the real
// per-country visit counts recorded by netlify/functions/visits.js, e.g.
// { "US": 42, "CA": 3, "GB": 1 }. Country codes are ISO 3166-1 alpha-2,
// from Netlify's server-side geolocation of the visitor's IP.

import { getStore } from "@netlify/blobs";

const COUNTRY_KEY = "visits-by-country";

export default async (request) => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const store = getStore({ name: "site-stats", consistency: "strong" });
  const byCountry = (await store.get(COUNTRY_KEY, { type: "json" })) || {};

  return Response.json(byCountry, { headers: { "Cache-Control": "no-store" } });
};
