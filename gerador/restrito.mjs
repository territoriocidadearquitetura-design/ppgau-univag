// Traz o conteúdo dos painéis restritos do portal "em dados" para o site, cifrado com as mesmas senhas.
// Abre o portal num navegador sem tela, entra com a senha, copia o que cada painel mostra (HTML e o CSS do portal,
// restrito à classe .pt) e grava restrito-prof.bin e restrito-coord.bin nesta pasta (AES-GCM, chave PBKDF2).
// Não acessa a planilha da autoavaliação: as chamadas ao Apps Script ficam bloqueadas durante a cópia.
// Uso: node restrito.mjs <URL do portal, ex. http://localhost:8765/site/dados/index.html> <senha professores> <senha coordenação>
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs"; import path from "path"; import crypto from "crypto"; import { fileURLToPath } from "url";
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const [URL_P, S_PROF, S_COORD] = process.argv.slice(2);
if (!URL_P || !S_PROF || !S_COORD) { console.error("uso: node restrito.mjs <url do portal> <senha professores> <senha coordenação>"); process.exit(1); }

// CSS do portal, com cada seletor preso a .pt para não afetar o resto do site.
function escopo(css) {
  const out = []; let i = 0;
  const sel = s => s.split(",").map(x => x.trim()).filter(Boolean).map(x => {
    const m = x.match(/^(:root(?::not\(\[data-theme="light"\]\)|\[data-theme="dark"\])?)\s*(.*)$/);
    if (m) return m[1] === ":root" ? (m[2] ? ".pt " + m[2] : ".pt") : `${m[1]} .pt${m[2] ? " " + m[2] : ""}`;
    if (/^(html|body)\b/.test(x)) return ".pt" + x.replace(/^(html|body)/, "");
    return ".pt " + x;
  }).join(", ");
  const bloco = (txt) => { let o = "", j = 0; while (j < txt.length) {
    const a = txt.indexOf("{", j); if (a < 0) break;
    const cab = txt.slice(j, a).trim(); let n = 1, k = a + 1; while (n && k < txt.length) { if (txt[k] === "{") n++; else if (txt[k] === "}") n--; k++; }
    const dentro = txt.slice(a + 1, k - 1);
    if (/^@(media|supports)/.test(cab)) o += `${cab}{${bloco(dentro)}}`;
    else if (/^@(keyframes|font-face)/.test(cab)) o += `${cab}{${dentro}}`;
    else if (/^@(page|import)/.test(cab)) {}
    else if (cab) o += `${sel(cab)}{${dentro}}`;
    j = k; } return o; };
  return bloco(css.replace(/\/\*[\s\S]*?\*\//g, ""));
}
function cifra(obj, senha) {
  const sal = crypto.randomBytes(16), iv = crypto.randomBytes(12), it = 250000;
  const k = crypto.pbkdf2Sync(senha, sal, it, 32, "sha256"), c = crypto.createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final(), c.getAuthTag()]);
  return JSON.stringify({ v: 1, it, sal: sal.toString("base64"), iv: iv.toString("base64"), ct: ct.toString("base64") });
}
// Tira controles que dependem do código do portal (filtros, PDF, "mostrar mais") e ids que poderiam colidir.
const LIMPA = () => { const v = document.getElementById("view").cloneNode(true);
  v.querySelectorAll("button:not(.keep), select, input, .pdfbar, script").forEach(e => { const lab = e.closest("label"); (lab && lab.querySelectorAll("select,input").length === 1 ? lab : e).remove(); });
  v.querySelectorAll("[id]").forEach(e => e.removeAttribute("id")); v.querySelectorAll("[onclick]").forEach(e => e.removeAttribute("onclick"));
  return v.innerHTML; };

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.route(/script\.google\.com|googleusercontent/, r => r.abort());
const espera = ms => p.waitForTimeout(ms);
await p.goto(URL_P + "#/metas"); await espera(1500);
await p.fill("#adm-s", S_PROF); await p.press("#adm-s", "Enter"); await espera(5000);
if (!(await p.evaluate(() => typeof renderMetas === "function"))) throw new Error("senha dos professores não abriu o painel");
const css = escopo(await p.evaluate(() => [...document.querySelectorAll("style")].map(s => s.textContent).join("\n")));
const prof = { css, abas: [] };
// Quadro "Para que serve este painel", que o portal mostra acima das abas.
await p.evaluate(() => { location.hash = "#/metas"; }); await espera(2500);
prof.intro = await p.evaluate(() => { const x = document.querySelector("#subnav .pb-box"); if (!x) return ""; const c = x.cloneNode(true); c.querySelectorAll("[id]").forEach(e => e.removeAttribute("id")); return c.outerHTML; });
for (const [h, t] of [["metas", "Metas 2025–2028"], ["doutorado", "Metas para o Doutorado"]]) {
  await p.evaluate(h => { location.hash = "#/" + h; }, h); await espera(2500); prof.abas.push({ id: h, t, html: await p.evaluate(LIMPA) });
}
await p.evaluate(() => { location.hash = "#/analise"; }); await espera(2500);
const subs = await p.evaluate(() => [...document.querySelectorAll("#view [data-asub]")].map(b => [b.dataset.asub, b.textContent.trim()]));
const partes = [];
for (const [s, t] of subs) {
  await p.click(`#view [data-asub="${s}"]`); await espera(1800);
  for (let n = 0; n < 5; n++) { const ok = await p.evaluate(() => { const b = [...document.querySelectorAll("#view button")].find(x => /^Mostrar (todos|mais)/.test(x.textContent.trim())); if (b) b.click(); return !!b; }); if (!ok) break; await espera(700); }
  partes.push({ t, html: await p.evaluate(LIMPA) });
}
prof.abas.push({ id: "analise", t: "Análise da produção docente", partes });
// Coordenação: só a Avaliação CAPES 2021–2024, sem o login do portal (que consulta a planilha).
await p.goto(URL_P + "#/portal/inicio"); await espera(1500);
const ok = await p.evaluate(async s => { try { await decifrarPacote("restrito_coord.bin", s); } catch (e) { return false; } renderEmDados(true); if (typeof capesRaioX === "function") $view.insertAdjacentHTML("beforeend", capesRaioX()); return true; }, S_COORD);
if (!ok) throw new Error("senha da coordenação não abriu a Avaliação CAPES");
await espera(1500);
const coord = { css, html: await p.evaluate(LIMPA) };
await b.close();
fs.writeFileSync(path.join(AQUI, "restrito-prof.bin"), cifra(prof, S_PROF));
fs.writeFileSync(path.join(AQUI, "restrito-coord.bin"), cifra(coord, S_COORD));
console.log("intro:", prof.intro.length, "| professores:", prof.abas.map(a => a.t + " " + (a.html ? a.html.length : a.partes.map(x => x.t + " " + x.html.length).join("/"))).join(" · "), "| coordenação:", coord.html.length, "| css:", css.length);
