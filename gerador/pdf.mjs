// Grava o relatório geral em PDF (relatorio-ppgau.pdf) a partir de relatorio.html já gerado, com número de página no rodapé.
// Uso: node pdf.mjs <pasta do site gerado>
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import path from "path";
const SITE = path.resolve(process.argv[2] || "../site");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage();
await p.goto("file://" + path.join(SITE, "relatorio.html"), { waitUntil: "networkidle" }).catch(() => {});
await p.emulateMedia({ media: "print" }); await p.waitForTimeout(800);
await p.pdf({ path: path.join(SITE, "relatorio-ppgau.pdf"), format: "A4", printBackground: true, margin: { top: "16mm", bottom: "18mm", left: "14mm", right: "14mm" }, displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: '<div style="width:100%;font:8px Arial,sans-serif;color:#666;padding:0 14mm;display:flex;justify-content:space-between"><span>PPGAU UNIVAG · Relatório geral do programa</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>' });
await b.close();
console.log("PDF gravado em", path.join(SITE, "relatorio-ppgau.pdf"));
