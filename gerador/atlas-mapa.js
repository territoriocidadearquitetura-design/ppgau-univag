// Gera os mapas da chamada do Atlas na Início: setores urbanos da conurbação Cuiabá–Várzea Grande coloridos por
// quatro indicadores (dados abertos do Atlas Socioambiental da RMVRC). Uso: node atlas-mapa.js <pasta dados do atlas> <pasta de saída>
// Grava atlas-mapa-<chave>.svg e atlas-mapas.json (legendas) na pasta de saída.
"use strict";
const fs = require("fs");
const [DIR, OUT] = process.argv.slice(2);
const set = JSON.parse(fs.readFileSync(DIR + "/setores_rmvrc.geojson"));
const hid = JSON.parse(fs.readFileSync(DIR + "/hidro.geojson"));
const fs_ = set.features.filter(f => f.properties.sit === "Urbana" && /^(Cuiabá|Várzea Grande)$/.test(f.properties.mun) && f.properties.ivsa != null);
const IND = [
  { k: "ivsa", t: "Vulnerabilidade socioambiental (IVSA) por setor censitário", cor: ["#f1eef8", "#cbc3e3", "#9e8fcb", "#7151ad", "#46207f"], ini: "muito baixa", fim: "muito alta" },
  { k: "lst", t: "Temperatura de superfície (satélite Landsat, agosto de 2026)", cor: ["#fff3cf", "#fdd08a", "#f99d59", "#e2563a", "#a51f2d"], un: " °C" },
  { k: "verde", t: "Cobertura vegetal do setor (Sentinel-2)", cor: ["#f3f8ec", "#cbe6ae", "#8fcb7c", "#47a052", "#16683a"], un: "%" },
  { k: "inund", t: "Área do setor sujeita a inundação", cor: ["#f2f6fb", "#c8dcef", "#8db9df", "#4a8cc6", "#17589a"], cortes: [0.5, 5, 20, 50], un: "%" }];
const rings = g => g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
// Recorte na mancha urbana contínua: percentis 4–96 dos centros dos setores, com folga.
const cx = [], cy = [];
fs_.forEach(f => { const r = rings(f.geometry)[0]; cx.push(r.reduce((a, c) => a + c[0], 0) / r.length); cy.push(r.reduce((a, c) => a + c[1], 0) / r.length); });
const pq = (a, p) => a.slice().sort((m, n) => m - n)[Math.floor(p * (a.length - 1))];
let x0 = pq(cx, .04), x1 = pq(cx, .96), y0 = pq(cy, .04), y1 = pq(cy, .96);
const fx = (x1 - x0) * .08, fy = (y1 - y0) * .08; x0 -= fx; x1 += fx; y0 -= fy; y1 += fy;
const kx = Math.cos((y0 + y1) / 2 * Math.PI / 180), W = 640, s = W / ((x1 - x0) * kx), H = Math.round((y1 - y0) * s);
const P = ([x, y]) => [((x - x0) * kx * s).toFixed(0), ((y1 - y) * s).toFixed(0)];
const caminho = rs => rs.map(r => { let ult = "", out = []; r.forEach(c => { const p = P(c).join(" "); if (p !== ult) out.push(p); ult = p; }); return out.length > 2 ? "M" + out.join("L") + "Z" : ""; }).join("");
const dentro = ([x, y]) => x >= x0 - .02 && x <= x1 + .02 && y >= y0 - .02 && y <= y1 + .02;
const rios = hid.features.filter(f => f.geometry.type === "Polygon" && f.properties.ak === "rio" && rings(f.geometry).flat().some(dentro));
const linhas = hid.features.filter(f => f.geometry.type === "LineString" && /^Rio (Cuiabá|Coxipó)/.test(f.properties.n || "") && f.geometry.coordinates.some(dentro));
const fundo = `<path fill="#2f7fd1" fill-opacity=".9" stroke="none" d="${rios.map(f => caminho(rings(f.geometry))).join("")}"/>
<path fill="none" stroke="#2f7fd1" stroke-width="2.2" stroke-linecap="round" d="${linhas.map(f => "M" + f.geometry.coordinates.map(c => P(c).join(" ")).join("L")).join("")}"/>`;
const leg = [];
IND.forEach(I => {
  const fi = fs_.filter(f => f.properties[I.k] != null), vals = fi.map(f => f.properties[I.k]).sort((a, b) => a - b), q = p => vals[Math.floor(p * (vals.length - 1))];
  // Quintis, como na ficha do Atlas (muito baixa a muito alta), salvo cortes fixos.
  const cortes = I.cortes || [q(1 / 5), q(2 / 5), q(3 / 5), q(4 / 5)];
  const grupos = I.cor.map(() => []);
  fi.forEach(f => { const v = f.properties[I.k]; grupos[cortes.filter(c => v > c).length].push(caminho(rings(f.geometry))); });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa dos setores urbanos de Cuiabá e Várzea Grande: ${I.t}">
${grupos.map((g, i) => `<path fill="${I.cor[i]}" stroke="rgba(0,0,0,.18)" stroke-width=".35" d="${g.join("")}"/>`).join("\n")}
${fundo}
</svg>`;
  fs.writeFileSync(`${OUT}/atlas-mapa-${I.k}.svg`, svg);
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString("pt-BR") + (I.un || "");
  leg.push({ k: I.k, t: I.t, cor: I.cor, ini: I.ini || (I.cortes ? "0" + I.un : fmt(vals[0])), fim: I.fim || (I.cortes ? "mais de " + fmt(I.cortes[3]) : fmt(vals[vals.length - 1])) });
  console.log(I.k, Math.round(svg.length / 1024) + " KB", cortes.map(fmt).join(" | "));
});
fs.writeFileSync(`${OUT}/atlas-mapas.json`, JSON.stringify({ W, H, leg }));
