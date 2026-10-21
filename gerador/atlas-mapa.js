// Gera os mapas da chamada do Atlas na Início: setores urbanos da conurbação Cuiabá–Várzea Grande coloridos por
// três indicadores (IVSA, adensamento e renda), mais um mapa da rede hídrica com as faixas de APP e as nascentes (dados abertos do Atlas Socioambiental da RMVRC). Uso: node atlas-mapa.js <pasta dados do atlas> <pasta de saída>
// Grava atlas-mapa-<chave>.svg e atlas-mapas.json (legendas) na pasta de saída.
"use strict";
const fs = require("fs");
const [DIR, OUT] = process.argv.slice(2);
const set = JSON.parse(fs.readFileSync(DIR + "/setores_rmvrc.geojson"));
const hid = JSON.parse(fs.readFileSync(DIR + "/hidro.geojson"));
const fs_ = set.features.filter(f => f.properties.sit === "Urbana" && /^(Cuiabá|Várzea Grande)$/.test(f.properties.mun) && f.properties.ivsa != null);
const IND = [
  { k: "ivsa", t: "Vulnerabilidade socioambiental (IVSA) por setor censitário", cor: ["#f1eef8", "#cbc3e3", "#9e8fcb", "#7151ad", "#46207f"], ini: "muito baixa", fim: "muito alta" },
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
// Mapa de APP: só a malha dos setores (contorno), a rede hídrica, as faixas de APP e as nascentes, sem colorir setores.
{
  const mpx = 1 / (s / 111320); // metros por unidade do desenho
  // Na escala da chamada (~50 m por ponto) a faixa real teria 1 ponto; amplia-se mantendo a proporção entre 30, 50, 100 e 200 m.
  const larg = m => Math.max(2 * m / mpx, 3 * Math.sqrt(m / 30)).toFixed(2);
  const linhas = hid.features.filter(f => f.geometry.type === "LineString" && f.geometry.coordinates.some(dentro));
  const porFaixa = {}; linhas.forEach(f => { const a = f.properties.app || 30; (porFaixa[a] = porFaixa[a] || []).push(traco(f.geometry.coordinates)); });
  const poligs = hid.features.filter(f => f.geometry.type === "Polygon" && f.properties.ap > 0 && rings(f.geometry).flat().some(dentro));
  const polPorFaixa = {}; poligs.forEach(f => { (polPorFaixa[f.properties.ap] = polPorFaixa[f.properties.ap] || []).push(caminho(rings(f.geometry))); });
  const nasc = hid.features.filter(f => f.geometry.type === "Point" && f.properties.t === "n" && dentro(f.geometry.coordinates));
  const VERDE = "#2f9e6e";
  const faixas = Object.entries(porFaixa).map(([a, ds]) => `<path d="${ds.join("")}" stroke-width="${larg(+a)}"/>`).join("")
    + Object.entries(polPorFaixa).map(([a, ds]) => `<path d="${ds.join("")}" stroke-width="${larg(+a)}" fill="${VERDE}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa da conurbação Cuiabá–Várzea Grande: rede hídrica, faixas de APP e nascentes">
<rect width="100%" height="100%" fill="#eef3fa"/>
<path fill="none" stroke="#b9c4d0" stroke-width=".35" d="${fs_.map(f => caminho(rings(f.geometry))).join("")}"/>
<g fill="none" stroke="${VERDE}" stroke-opacity=".55" stroke-linecap="round" stroke-linejoin="round">${faixas}</g>
<path fill="none" stroke="#3d86cf" stroke-width=".8" d="${linhas.map(f => traco(f.geometry.coordinates)).join("")}"/>
<g fill="#fff" stroke="#0d5e57" stroke-width="1.3">${nasc.map(f => { const [x, y] = P(f.geometry.coordinates); return `<circle cx="${x}" cy="${y}" r="2.6"/>`; }).join("")}</g>
${topo}
</svg>`;
  fs.writeFileSync(`${OUT}/atlas-mapa-app.svg`, svg);
  console.log("app", Math.round(svg.length / 1024) + " KB", linhas.length, "cursos d'água,", nasc.length, "nascentes, m/px", mpx.toFixed(1));
  leg.splice(1, 0, { k: "app", t: "Rede hídrica, faixas de APP e nascentes", itens: [["#3d86cf", "Rios e córregos", "l"], ["rgba(47,158,110,.55)", "Faixa de APP (largura ampliada)", "f"], ["#0d5e57", "Nascente", "n"]] });
}
fs.writeFileSync(`${OUT}/atlas-mapas.json`, JSON.stringify({ W, H, leg }));
