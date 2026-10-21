// Gera os mapas da chamada do Atlas na Início: setores urbanos da conurbação Cuiabá–Várzea Grande coloridos por
// quatro indicadores (IVSA, APP, adensamento e renda) (dados abertos do Atlas Socioambiental da RMVRC). Uso: node atlas-mapa.js <pasta dados do atlas> <pasta de saída>
// Grava atlas-mapa-<chave>.svg e atlas-mapas.json (legendas) na pasta de saída.
"use strict";
const fs = require("fs");
const [DIR, OUT] = process.argv.slice(2);
const set = JSON.parse(fs.readFileSync(DIR + "/setores_rmvrc.geojson"));
const hid = JSON.parse(fs.readFileSync(DIR + "/hidro.geojson"));
const fs_ = set.features.filter(f => f.properties.sit === "Urbana" && /^(Cuiabá|Várzea Grande)$/.test(f.properties.mun) && f.properties.ivsa != null);
const IND = [
  { k: "ivsa", t: "Vulnerabilidade socioambiental (IVSA) por setor censitário", cor: ["#f1eef8", "#cbc3e3", "#9e8fcb", "#7151ad", "#46207f"], ini: "muito baixa", fim: "muito alta" },
  { k: "app_pct", t: "Área do setor em APP (faixas de proteção de rios e nascentes)", cor: ["#f2f6fb", "#c6e4e1", "#7fc4bb", "#2f9488", "#0d5e57"], cortes: [0.5, 5, 20, 50], un: "%" },
  { k: "dens", t: "Adensamento: densidade demográfica (hab./km², Censo 2022)", cor: ["#fdf1e4", "#f9cf9f", "#f0a35e", "#d4682b", "#97380f"], ini: "menos denso", fim: "mais denso" },
  { k: "renda", t: "Rendimento médio do responsável pelo domicílio (Censo 2022)", cor: ["#fbf6dc", "#e8dc97", "#bfbd5c", "#7f9a3b", "#3f6a26"], ini: "menor renda", fim: "maior renda" }];
const rings = g => g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
// Recorte: a mancha urbana inteira de Cuiabá e Várzea Grande (percentis 0,5–99,5 dos centros dos setores), com folga,
// ajustado a um quadro quase quadrado como o da chamada na Início.
const cx = [], cy = [];
fs_.forEach(f => { const r = rings(f.geometry)[0]; cx.push(r.reduce((a, c) => a + c[0], 0) / r.length); cy.push(r.reduce((a, c) => a + c[1], 0) / r.length); });
const pq = (a, p) => a.slice().sort((m, n) => m - n)[Math.floor(p * (a.length - 1))];
let x0 = pq(cx, .005), x1 = pq(cx, .995), y0 = pq(cy, .005), y1 = pq(cy, .995);
const fx = (x1 - x0) * .1, fy = (y1 - y0) * .1; x0 -= fx; x1 += fx; y0 -= fy; y1 += fy;
const kx = Math.cos((y0 + y1) / 2 * Math.PI / 180), RAZ = .95;
{ const w = (x1 - x0) * kx, h = y1 - y0; if (h / w < RAZ) { const d = (w * RAZ - h) / 2; y0 -= d; y1 += d; } else { const d = (h / RAZ - w) / 2 / kx; x0 -= d; x1 += d; } }
const W = 640, s = W / ((x1 - x0) * kx), H = Math.round((y1 - y0) * s);
const P = ([x, y]) => [((x - x0) * kx * s).toFixed(0), ((y1 - y) * s).toFixed(0)];
const caminho = rs => rs.map(r => { let ult = "", out = []; r.forEach(c => { const p = P(c).join(" "); if (p !== ult) out.push(p); ult = p; }); return out.length > 2 ? "M" + out.join("L") + "Z" : ""; }).join("");
const dentro = ([x, y]) => x >= x0 - .02 && x <= x1 + .02 && y >= y0 - .02 && y <= y1 + .02;
const traco = cs => { let ult = "", out = []; cs.forEach(c => { const p = P(c).join(" "); if (p !== ult) out.push(p); ult = p; }); return out.length > 1 ? "M" + out.join("L") : ""; };
const agua = hid.features.filter(f => f.geometry.type === "Polygon" && /rio|lago|res/.test(f.properties.ak) && rings(f.geometry).flat().some(dentro));
const corr = hid.features.filter(f => f.geometry.type === "LineString" && f.geometry.coordinates.some(dentro));
const princ = corr.filter(f => /^Rio (Cuiabá|Coxipó)/.test(f.properties.n || ""));
const MUN = JSON.parse(fs.readFileSync(__dirname + "/mun.geojson"));
const limites = MUN.features.filter(f => /^(Cuiabá|Várzea Grande)$/.test(f.properties.nome)).map(f => rings(f.geometry).map(traco).join("")).join("");
// fundo claro com córregos finos e limites municipais tracejados; por cima, rios principais e nomes das cidades
const base = `<rect width="100%" height="100%" fill="#eef3fa"/>
<path fill="none" stroke="#7fb0e0" stroke-width=".7" d="${corr.map(f => traco(f.geometry.coordinates)).join("")}"/>`;
const topo = `<path fill="#8fc0ea" stroke="none" d="${agua.map(f => caminho(rings(f.geometry))).join("")}"/>
<path fill="none" stroke="#1f5fa8" stroke-width="2" stroke-linecap="round" d="${princ.map(f => traco(f.geometry.coordinates)).join("")}"/>
<path fill="none" stroke="#1c2b3a" stroke-width="1.1" stroke-dasharray="5 4" d="${limites}"/>
<g font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="15" letter-spacing="2" fill="#1c2b3a" stroke="#fff" stroke-width="3" paint-order="stroke" text-anchor="middle">
<text x="${P([-56.075, -15.60])[0]}" y="${P([-56.075, -15.60])[1]}">CUIABÁ</text><text x="${P([-56.155, -15.655])[0]}" y="${P([-56.155, -15.655])[1]}">VÁRZEA GRANDE</text></g>`;
const leg = [];
IND.forEach(I => {
  const fi = fs_.filter(f => f.properties[I.k] != null), vals = fi.map(f => f.properties[I.k]).sort((a, b) => a - b), q = p => vals[Math.floor(p * (vals.length - 1))];
  // Quintis, como na ficha do Atlas (muito baixa a muito alta), salvo cortes fixos.
  const cortes = I.cortes || [q(1 / 5), q(2 / 5), q(3 / 5), q(4 / 5)];
  const grupos = I.cor.map(() => []);
  fi.forEach(f => { const v = f.properties[I.k]; grupos[cortes.filter(c => v > c).length].push(caminho(rings(f.geometry))); });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa dos setores urbanos de Cuiabá e Várzea Grande: ${I.t}">
${base}
${grupos.map((g, i) => `<path fill="${I.cor[i]}" stroke="rgba(0,0,0,.18)" stroke-width=".3" d="${g.join("")}"/>`).join("\n")}
${topo}
</svg>`;
  fs.writeFileSync(`${OUT}/atlas-mapa-${I.k}.svg`, svg);
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString("pt-BR") + (I.un || "");
  leg.push({ k: I.k, t: I.t, cor: I.cor, ini: I.ini || (I.cortes ? "0" + I.un : fmt(vals[0])), fim: I.fim || (I.cortes ? "mais de " + fmt(I.cortes[3]) : fmt(vals[vals.length - 1])) });
  console.log(I.k, Math.round(svg.length / 1024) + " KB", cortes.map(fmt).join(" | "));
});
fs.writeFileSync(`${OUT}/atlas-mapas.json`, JSON.stringify({ W, H, leg }));
