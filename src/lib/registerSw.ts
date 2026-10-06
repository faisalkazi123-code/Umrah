export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch((err: unknown) => console.error("Service worker registration failed", err));
  if (document.readyState === "complete") void register();
  else window.addEventListener("load", () => void register(), { once: true });
}
