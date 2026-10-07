// Inlines the demo build (one JS + one CSS file) into dist-demo/umrah-companion.html,
// a self-contained page with no external requests.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("dist-demo/assets");
const files = readdirSync(dir);
const js = files.filter((f) => f.endsWith(".js"));
const css = files.filter((f) => f.endsWith(".css"));
if (js.length !== 1 || css.length !== 1) throw new Error(`Expected one JS and one CSS file, found ${files.join(", ")}`);

const script = readFileSync(path.join(dir, js[0]), "utf8").replace(/<\/script/gi, "<\\/script");
const style = readFileSync(path.join(dir, css[0]), "utf8").replace(/<\/style/gi, "<\\/style");

const page = `<title>Umrah Companion</title>
<meta name="theme-color" content="#1f5135" />
<style>${style}</style>
<div id="root"></div>
<script type="module">${script}</script>
`;
const out = path.resolve("dist-demo/umrah-companion.html");
writeFileSync(out, page);
console.info(`Wrote ${out} (${(page.length / 1024).toFixed(0)} KB)`);
