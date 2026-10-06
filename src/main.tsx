import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initI18n } from "./i18n";
import { startSync } from "./lib/sync";
import { applyFontSize, applyTheme } from "./lib/prefs";
import { registerServiceWorker } from "./lib/registerSw";
import { useBookmarkStore } from "./store/bookmarkStore";
import { useJourneyStore } from "./store/journeyStore";
import { usePrefsStore } from "./store/prefsStore";
import "./styles/index.css";

const prefs = usePrefsStore.getState();
initI18n(prefs.language);
applyTheme(prefs.theme);
applyFontSize(prefs.fontSize);
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme(usePrefsStore.getState().theme));

// Restore exact progress from IndexedDB before rendering, so a restart never shows a reset journey.
await Promise.all([useJourneyStore.getState().hydrate(), useBookmarkStore.getState().hydrate()]).catch((err: unknown) => {
  console.error("Failed to restore saved progress", err);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

startSync();
registerServiceWorker();
