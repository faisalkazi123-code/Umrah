/**
 * `npm run build:demo` produces a single-file preview that runs inside a sandboxed page:
 * in-memory routing, no service worker and no server sync. Progress still saves to IndexedDB.
 */
export const IS_DEMO = import.meta.env.MODE === "demo";
