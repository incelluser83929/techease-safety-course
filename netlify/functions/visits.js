// Real, server-recorded visit counter backed by Netlify Blobs.
// POST increments the count once (called only the first time a browser
// visits in a given session — see assets/js/impact-counter.js); GET just
// reads the current value. This is an actual counted number, not a
// simulation — deliberately kept as simple as possible (no auth, no
// analytics vendor) since a nonprofit course site has no need for more.

import { getStore } from "@netlify/blobs";

const KEY = "homepage-visits";

export default async (request) => {
  const store = getStore("site-stats");

  if (request.method === "GET") {
    const current = (await store.get(KEY, { type: "json" })) || { count: 0 };
    return Response.json(current, { headers: { "Cache-Control": "no-store" } });
  }

  if (request.method === "POST") {
    const current = (await store.get(KEY, { type: "json" })) || { count: 0 };
    const updated = { count: current.count + 1 };
    await store.setJSON(KEY, updated);
    return Response.json(updated, { headers: { "Cache-Control": "no-store" } });
  }

  return new Response("Method Not Allowed", { status: 405 });
};
