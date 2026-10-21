// Mapa da produção: rede de coautoria e equipes de projeto dos docentes, com a lista das obras.
// Dados em mapa-dados.js (MAPA), gerados por build.js a partir do Lattes dos docentes.
"use strict";
(() => {
const { doc: DOC, pes: PES, W } = MAPA;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const GRP = { pub: "Publicação", tec: "Produção técnica e apresentação", proj: "Equipe de projeto" };
const st = { de: 2021, ate: 2026, tipos: new Set(["pub", "tec", "proj"]), min: 3, foco: -1, sel: null, ld: "", lano: "", lq: "", lbusca: "", mostrar: 40 };
const nid = d => "d" + d;
const nomeNo = id => id[0] === "d" ? DOC[+id.slice(1)].n : PES[id.slice(1)][0];

function obrasFiltradas() {
  return W.filter(w => w[2] >= st.de && w[2] <= st.ate && st.tipos.has(w[0]));
}
function rede() {
  const ws = obrasFiltradas(), arestas = new Map(), peso = new Map(), obrasNo = new Map();
  const soma = (a, b, i) => {
    const k = a < b ? a + "|" + b : b + "|" + a;
    if (!arestas.has(k)) arestas.set(k, []);
    arestas.get(k).push(i);
  };
  ws.forEach(w => {
    const i = W.indexOf(w), ds = w[5].map(nid), ps = w[6].map(k => "p" + k);
    ds.forEach((a, x) => { ps.forEach(p => soma(a, p, i)); ds.slice(x + 1).forEach(b => soma(a, b, i)); });
    [...ds, ...ps].forEach(n => { if (!obrasNo.has(n)) obrasNo.set(n, new Set()); obrasNo.get(n).add(i); });
  });
  // Peso de cada pessoa externa: obras que divide com algum docente.
  for (const [k, l] of arestas) { const [a, b] = k.split("|"); [a, b].forEach(n => { if (n[0] === "p") peso.set(n, (peso.get(n) || new Set())); }); l.forEach(i => { if (a[0] === "p") peso.get(a).add(i); if (b[0] === "p") peso.get(b).add(i); }); }
  const prog = n => n[0] === "d" || PES[n.slice(1)][1] !== "ext";
  const vis = n => prog(n) || (st.min > 0 && (peso.get(n) || new Set()).size >= st.min);
  let es = [...arestas].map(([k, l]) => { const [a, b] = k.split("|"); return { a, b, n: l.length, l }; }).filter(e => vis(e.a) && vis(e.b));
  if (st.foco >= 0) { const f = nid(st.foco); es = es.filter(e => e.a === f || e.b === f); }
  const nos = new Set(DOC.map((_, i) => nid(i)));
  es.forEach(e => { nos.add(e.a); nos.add(e.b); });
  return { es, nos: [...nos], peso, obrasNo, ws };
}

// Layout radial: docentes num círculo fixo (sem sobreposição), ordenados para que quem produz junto fique lado a lado;
// cada pessoa fica perto dos docentes com quem produziu (dentro do círculo se tem vários, fora se tem um só).
let H_ = 700, WV = 1000, RD = 250;
let pos = new Map();
function layout(nos, es) {
  const estreito = ($("rd-box").clientWidth || 1000) < 640;
  WV = estreito ? 640 : 1000; H_ = estreito ? 820 : 700; RD = estreito ? 175 : 250;
  const cx = WV / 2, cy = H_ / 2;
  // ordem dos docentes: guloso pelo peso das ligações docente–docente
  const w = DOC.map(() => DOC.map(() => 0));
  es.forEach(e => { if (e.a[0] === "d" && e.b[0] === "d") { const i = +e.a.slice(1), j = +e.b.slice(1); w[i][j] += e.n; w[j][i] += e.n; } });
  const tot = DOC.map((_, i) => w[i].reduce((a, b) => a + b, 0));
  const ordem = [tot.indexOf(Math.max(...tot))], resta = new Set(DOC.map((_, i) => i)); resta.delete(ordem[0]);
  while (resta.size) { const u = ordem[ordem.length - 1]; let m = -1, mi = -1; resta.forEach(j => { if (w[u][j] > m) { m = w[u][j]; mi = j; } }); ordem.push(mi); resta.delete(mi); }
  const ang = new Map(); ordem.forEach((d, k) => ang.set(d, -Math.PI / 2 + k * 2 * Math.PI / DOC.length));
  const P = new Map();
  DOC.forEach((_, i) => P.set(nid(i), { x: cx + Math.cos(ang.get(i)) * RD, y: cy + Math.sin(ang.get(i)) * RD * (estreito ? 1.65 : .92), fixo: true }));
  const anc = new Map();
  es.forEach(e => { [[e.a, e.b], [e.b, e.a]].forEach(([p, d]) => { if (p[0] === "p" && d[0] === "d") { if (!anc.has(p)) anc.set(p, []); anc.get(p).push([+d.slice(1), e.n]); } }); });
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  nos.filter(id => id[0] === "p").forEach(id => {
    const l = anc.get(id) || [], ext = PES[id.slice(1)][1] === "ext";
    let vx = 0, vy = 0, sw = 0; l.forEach(([d, n]) => { const a = ang.get(d); vx += Math.cos(a) * n; vy += Math.sin(a) * n; sw += n; });
    const a = Math.atan2(vy, vx) + (rnd() - .5) * (l.length > 1 ? .25 : .5), m = sw ? Math.hypot(vx, vy) / sw : 0;
    const r = l.length > 1 ? RD * Math.max(.15, m * .8) : RD + (ext ? 95 : 55) + rnd() * 40;
    P.set(id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * (estreito ? 1.65 : .92), ox: 0, oy: 0 });
  });
  // afasta círculos que se tocam
  const arr = nos.map(id => [id, P.get(id), id[0] === "d" ? 30 : PES[id.slice(1)][1] === "ext" ? 4 : 10]);
  for (let it = 0; it < 60; it++) for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    const [, a, ra] = arr[i], [, b, rb] = arr[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .1, min = ra + rb + 2;
    if (d >= min) continue;
    const f = (min - d) / d / 2;
    if (!a.fixo) { a.x -= dx * f * (b.fixo ? 2 : 1); a.y -= dy * f * (b.fixo ? 2 : 1); }
    if (!b.fixo) { b.x += dx * f * (a.fixo ? 2 : 1); b.y += dy * f * (a.fixo ? 2 : 1); }
  }
  arr.forEach(([, p]) => { p.x = Math.max(12, Math.min(WV - 12, p.x)); p.y = Math.max(12, Math.min(H_ - 12, p.y)); });
  pos = new Map(nos.map(id => [id, P.get(id)]));
  pos.ang = ang; pos.c = [cx, cy];
}

function desenhar() {
  const { es, nos, peso, obrasNo, ws } = rede();
  layout(nos, es);
  const sel = st.sel, viz = new Set(sel ? es.filter(e => e.a === sel || e.b === sel).flatMap(e => [e.a, e.b]) : []);
  const maxN = Math.max(1, ...es.filter(e => !((e.a[0] === "p" && PES[e.a.slice(1)][1] === "ext") || (e.b[0] === "p" && PES[e.b.slice(1)][1] === "ext"))).map(e => e.n));
  // Com uma pessoa selecionada, só os 10 vizinhos com mais obras ganham nome no desenho.
  const rot = new Set(sel ? es.filter(e => e.a === sel || e.b === sel).map(e => [e.a === sel ? e.b : e.a, e.n]).filter(([id]) => id[0] === "d" || PES[id.slice(1)][1] !== "ext").sort((a, b) => b[1] - a[1]).slice(0, 12).map(x => x[0]) : []);
  const tam = id => id[0] === "d" ? 27 : PES[id.slice(1)][1] === "ext" ? 3 : 5 + Math.sqrt((peso.get(id) || new Set()).size) * 1.8;
  const ord = id => id[0] === "d" ? 2 : PES[id.slice(1)][1] === "ext" ? 0 : 1;
  const svg = `<svg viewBox="0 0 ${WV} ${H_}" class="rd${sel ? " foco" : ""}" role="img" aria-label="Rede de colaboração: ${nos.length} pessoas e ${es.length} ligações"><defs><clipPath id="rd-cf"><circle r="25"/></clipPath></defs>
  <g>${es.slice().sort((x, y) => (x.a[0] === "d" && x.b[0] === "d") - (y.a[0] === "d" && y.b[0] === "d")).map(e => { const a = pos.get(e.a), b = pos.get(e.b), on = sel && (e.a === sel || e.b === sel); const ex = (e.a[0] === "p" && PES[e.a.slice(1)][1] === "ext") || (e.b[0] === "p" && PES[e.b.slice(1)][1] === "ext");
    return `<line data-a="${e.a}" data-b="${e.b}" class="${on ? "on" : ""}${e.a[0] === "d" && e.b[0] === "d" ? " dd" : ""}${ex ? " ex" : ""}" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke-width="${ex ? .6 : (.8 + 4.5 * e.n / maxN).toFixed(2)}"><title>${esc(nomeNo(e.a))} e ${esc(nomeNo(e.b))}: ${e.n} ${e.n > 1 ? "obras" : "obra"}</title></line>`; }).join("")}</g>
  <g>${nos.slice().sort((a, b) => ord(a) - ord(b)).map(id => { const p = pos.get(id), d = id[0] === "d", t = d ? "doc" : PES[id.slice(1)][1], r = tam(id), on = !sel || id === sel || viz.has(id);
    const nome = nomeNo(id), n = (obrasNo.get(id) || new Set()).size;
    return `<g class="no ${t}${on ? " on" : ""}${id === sel ? " sel" : ""}" data-id="${id}" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(nome)}, ${n} obras"><circle r="${r.toFixed(1)}"/>${d ? `${DOC[+id.slice(1)].foto ? `<image href="${esc(DOC[+id.slice(1)].foto)}" x="-25" y="-25" width="50" height="50" clip-path="url(#rd-cf)" preserveAspectRatio="xMidYMid slice"/>` : `<text class="ini" dy="4.5">${esc(DOC[+id.slice(1)].ini)}</text>`}${(() => { const a = pos.ang.get(+id.slice(1)), dx = Math.cos(a) * (r + 10), dy = Math.sin(a) * (r + 10), an = Math.abs(Math.cos(a)) < .3 ? "middle" : Math.cos(a) > 0 ? "start" : "end"; return `<text class="lb dl" x="${dx.toFixed(1)}" y="${(dy + (Math.sin(a) > .3 ? 12 : Math.sin(a) < -.3 ? -4 : 4)).toFixed(1)}" text-anchor="${an}">${esc(WV < 700 && DOC[+id.slice(1)].curto.length > 15 ? DOC[+id.slice(1)].curto.replace(/^(\S)\S*/, "$1.") : DOC[+id.slice(1)].curto)}</text>`; })()}` : (id === sel || rot.has(id) ? `<text class="lb" dy="${r + 13}">${esc(nome)}</text>` : "")}<title>${esc(nome)}: ${n} ${n > 1 ? "obras" : "obra"} no período</title></g>`; }).join("")}</g></svg>`;
  $("rd-box").innerHTML = svg;
  anima(es);
  const conta = t => nos.filter(id => id[0] === "p" && PES[id.slice(1)][1] === t).length;
  $("rd-resumo").textContent = `${ws.length} obras no período · ${DOC.length} docentes · ${conta("dis")} discentes · ${conta("egr")} egressos · ${conta("pos")} pós-doutorandos` + (st.min > 0 ? ` · ${conta("ext")} colaboradores externos` : "");
  // Quem mais colabora
  const top = nos.filter(id => id[0] === "p" && PES[id.slice(1)][1] !== "ext").map(id => [id, (peso.get(id) || new Set()).size]).sort((a, b) => b[1] - a[1]).slice(0, 12);
  $("rd-top").innerHTML = top.length ? top.map(([id, n]) => `<li><button type="button" data-id="${id}" class="${PES[id.slice(1)][1]}"><span>${esc(PES[id.slice(1)][0])}<small>${{ dis: "discente", egr: "egresso", pos: "pós-doutorado" }[PES[id.slice(1)][1]]}</small></span><b>${n}</b></button></li>`).join("") : `<li class="meta">Nenhum discente, egresso ou pós-doc no filtro.</li>`;
  // Coautoria entre docentes
  const dd = es.filter(e => e.a[0] === "d" && e.b[0] === "d").sort((a, b) => b.n - a.n).slice(0, 12);
  $("rd-dd").innerHTML = dd.length ? dd.map(e => `<li><button type="button" data-par="${e.a}|${e.b}"><span>${esc(DOC[+e.a.slice(1)].curto)} e ${esc(DOC[+e.b.slice(1)].curto)}</span><b>${e.n}</b></button></li>`).join("") : `<li class="meta">Sem coautoria entre docentes no filtro.</li>`;
  st.obrasSel = sel ? obrasNo.get(sel) || new Set() : null;
  st.par = null;
  lista();
}

// Movimento: os nós flutuam devagar, entram voando do centro, podem ser arrastados (os vizinhos acompanham como elásticos)
// e, ao passar o mouse, a pessoa e suas ligações se destacam. Respeita "reduzir movimento" do sistema.
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
let anim = null, entrou = false, arrastou = false;
function anima(es) {
  if (anim) cancelAnimationFrame(anim.raf);
  const svg = $("rd-box").querySelector("svg"), N = new Map(), viz = new Map();
  const [cx, cy] = pos.c;
  svg.querySelectorAll(".no").forEach((g, k) => {
    const id = g.dataset.id, h = pos.get(id), d = id[0] === "d";
    const ini = entrou || calmo ? 1 : 0;
    N.set(id, { g, hx: h.x, hy: h.y, x: ini ? h.x : cx + (h.x - cx) * .08, y: ini ? h.y : cy + (h.y - cy) * .08, vx: 0, vy: 0, ox: 0, oy: 0, d, f: (k * 2.39) % 6.28, amp: d ? 5 : 8, k: d ? .07 : .035, atraso: d ? 0 : 6 + (k % 40) });
    viz.set(id, []);
  });
  const L = [...svg.querySelectorAll("line")].map(l => { const a = N.get(l.dataset.a), b = N.get(l.dataset.b); viz.get(l.dataset.a).push(l.dataset.b); viz.get(l.dataset.b).push(l.dataset.a); return { l, a, b }; });
  entrou = true;
  const st2 = { arr: null, t0: performance.now(), visivel: true, quadro: 0 };
  let mexeu = false;
  let btVolta = $("rd-volta");
  if (!btVolta) { btVolta = document.createElement("button"); btVolta.type = "button"; btVolta.id = "rd-volta"; btVolta.className = "btn sec rd-volta"; btVolta.textContent = "Voltar ao círculo"; $("rd-box").after(btVolta); btVolta.addEventListener("click", () => desenhar()); }
  btVolta.hidden = true;
  // pulsos: só nas ligações do programa (sem colaboradores externos)
  const LP = L.filter(e => !e.l.classList.contains("ex"));
  let LT = LP;
  const gq = document.createElementNS("http://www.w3.org/2000/svg", "g"); gq.setAttribute("class", "pulsos");
  svg.children[1].after(gq);
  const Q = calmo ? [] : Array.from({ length: Math.min(36, Math.max(10, LP.length)) }, () => { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); gq.appendChild(c); return { c, e: null, t: 1 }; });
  st2.anelG = document.createElementNS("http://www.w3.org/2000/svg", "g"); st2.anelG.setAttribute("class", "anel"); st2.anelG.innerHTML = `<circle r="30"/><circle r="30"/>`;
  svg.lastElementChild.before(st2.anelG);
  // passeio automático: a cada poucos segundos um docente e suas ligações se acendem
  const docs = [...N.keys()].filter(id => id[0] === "d" && viz.get(id).length);
  let iTour = 0;
  const limpaTour = () => { svg.classList.remove("tour"); svg.querySelectorAll(".tv").forEach(x => x.classList.remove("tv")); st2.tour = null; st2.anel = null; st2.anelG.classList.remove("on"); LT = LP; };
  const tour = () => {
    if (anim !== st2) return clearInterval(st2.iv);
    limpaTour();
    if (calmo || st.sel || st2.hov || st2.arr || !docs.length || !st2.visivel) return;
    const id = docs[iTour++ % docs.length], n = N.get(id);
    st2.tour = id; svg.classList.add("tour"); n.g.classList.add("tv");
    viz.get(id).forEach(v => N.get(v).g.classList.add("tv"));
    LT = L.filter(e => e.a === n || e.b === n); LT.forEach(e => e.l.classList.add("tv"));
    if (!LT.length) LT = LP;
    Q.forEach(q => q.t = 1);
    st2.anel = n; st2.anelG.classList.remove("on"); void st2.anelG.getBBox(); st2.anelG.classList.add("on");
  };
  st2.iv = setInterval(tour, 4200); setTimeout(tour, 1800);
  anim = st2;
  const pt = ev => { const m = svg.getScreenCTM().inverse(), p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(m); };
  const passo = t => {
    const s = (t - st2.t0) / 1000;
    st2.quadro++;
    for (const [id, n] of N) {
      if (st2.arr && st2.arr.n === n) continue;
      if (st2.quadro < n.atraso) continue;
      // deslocamento médio dos vizinhos puxa o nó (efeito elástico quando alguém é arrastado)
      let dx = 0, dy = 0, c = 0;
      if (st2.arr) for (const v of viz.get(id)) { const m = N.get(v); dx += m.x - m.hx; dy += m.y - m.hy; c++; }
      const pux = c ? (n.d ? .18 : .45) / Math.max(1, c * .6) : 0;
      const tx = n.hx + dx * pux + (calmo ? 0 : Math.sin(s * 1.1 + n.f) * n.amp), ty = n.hy + dy * pux + (calmo ? 0 : Math.cos(s * .85 + n.f * 1.3) * n.amp);
      n.vx = (n.vx + (tx - n.x) * n.k) * .86; n.vy = (n.vy + (ty - n.y) * n.k) * .86;
      n.x += n.vx; n.y += n.vy;
    }
    for (const n of N.values()) n.g.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
    for (const e of L) { e.l.setAttribute("x1", e.a.x.toFixed(1)); e.l.setAttribute("y1", e.a.y.toFixed(1)); e.l.setAttribute("x2", e.b.x.toFixed(1)); e.l.setAttribute("y2", e.b.y.toFixed(1)); }
    // pulsos que correm pelas ligações, como produção circulando entre as pessoas
    for (const q of Q) {
      if (!q.e || q.t >= 1) { const ls = st2.tour ? LT : LP; q.e = ls.length ? ls[Math.floor(Math.random() * ls.length)] : null; q.t = -Math.random() * .6; q.v = .006 + Math.random() * .008; q.ida = Math.random() < .5; }
      if (!q.e) { q.c.setAttribute("r", 0); continue; }
      q.t += q.v; const u = Math.max(0, q.t), [a, b] = q.ida ? [q.e.a, q.e.b] : [q.e.b, q.e.a];
      q.c.setAttribute("cx", (a.x + (b.x - a.x) * u).toFixed(1)); q.c.setAttribute("cy", (a.y + (b.y - a.y) * u).toFixed(1));
      q.c.setAttribute("r", q.t < 0 ? 0 : (Math.sin(u * Math.PI) * 3.2 + .6).toFixed(2));
    }
    if (st2.anel) { const n = st2.anel; st2.anelG.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`); }
    st2.raf = st2.visivel && !document.hidden ? requestAnimationFrame(passo) : 0;
  };
  const retoma = () => { if (!st2.raf && st2.visivel && !document.hidden && anim === st2) st2.raf = requestAnimationFrame(passo); };
  new IntersectionObserver(([e]) => { st2.visivel = e.isIntersecting; retoma(); }).observe(svg);
  document.addEventListener("visibilitychange", retoma);
  st2.raf = requestAnimationFrame(passo);
  // arrastar
  svg.addEventListener("pointerdown", ev => {
    const g = ev.target.closest(".no"); if (!g) return;
    ev.preventDefault();
    const n = N.get(g.dataset.id), p = pt(ev);
    limpaTour();
    st2.arr = { n, id: g.dataset.id, dx: n.x - p.x, dy: n.y - p.y, x0: ev.clientX, y0: ev.clientY, hx0: n.hx, hy0: n.hy }; arrastou = false;
    svg.setPointerCapture(ev.pointerId); svg.classList.add("arrasta");
  });
  svg.addEventListener("pointermove", ev => {
    if (st2.arr) {
      if (Math.hypot(ev.clientX - st2.arr.x0, ev.clientY - st2.arr.y0) > 4) arrastou = true;
      const p = pt(ev), n = st2.arr.n; n.x = Math.max(10, Math.min(WV - 10, p.x + st2.arr.dx)); n.y = Math.max(10, Math.min(H_ - 10, p.y + st2.arr.dy)); n.vx = n.vy = 0;
      retoma(); return;
    }
    const g = ev.target.closest(".no"), id = g && g.dataset.id;
    if (id === st2.hov) return;
    st2.hov = id;
    if (id) limpaTour();
    svg.querySelectorAll(".hv").forEach(x => x.classList.remove("hv"));
    svg.classList.toggle("hov", !!id);
    if (id) { g.classList.add("hv"); viz.get(id).forEach(v => N.get(v).g.classList.add("hv")); L.forEach(e => { if (e.a === N.get(id) || e.b === N.get(id)) e.l.classList.add("hv"); }); }
  });
  // Ao soltar, a pessoa fica onde foi deixada (o círculo se deforma) e quem produz só com ela vai junto, em parte.
  const solta = () => {
    const a = st2.arr; if (!a) return;
    st2.arr = null; svg.classList.remove("arrasta");
    if (!arrastou) return;
    const n = a.n, dx = n.x - a.hx0, dy = n.y - a.hy0;
    n.hx = n.x; n.hy = n.y;
    for (const v of viz.get(a.id)) { if (v[0] === "d") continue; const m = N.get(v), docs = viz.get(v).filter(x => x[0] === "d").length || 1; m.hx += dx * .7 / docs; m.hy += dy * .7 / docs; }
    mexeu = true; btVolta.hidden = false;
  };
  svg.addEventListener("pointerup", solta); svg.addEventListener("pointercancel", solta);
  svg.addEventListener("pointerleave", () => { if (!st2.arr && st2.hov) { st2.hov = null; svg.classList.remove("hov"); svg.querySelectorAll(".hv").forEach(x => x.classList.remove("hv")); } });
}

function lista(par) {
  let ws = obrasFiltradas();
  const chip = $("ls-chip");
  if (par) { const [a, b] = par.split("|").map(x => +x.slice(1)); ws = ws.filter(w => w[5].includes(a) && w[5].includes(b)); chip.innerHTML = `Obras em comum: <b>${esc(DOC[a].curto)} e ${esc(DOC[b].curto)}</b> <button type="button" id="ls-limpa">Limpar</button>`; chip.hidden = false; }
  else if (st.sel) { const s = st.obrasSel; ws = ws.filter(w => s.has(W.indexOf(w))); chip.innerHTML = `Obras de <b>${esc(nomeNo(st.sel))}</b> no mapa <button type="button" id="ls-limpa">Limpar</button>`; chip.hidden = false; }
  else chip.hidden = true;
  if (st.ld !== "") ws = ws.filter(w => w[5].includes(+st.ld));
  if (st.lano) ws = ws.filter(w => w[2] === +st.lano);
  if (st.lq === "A") ws = ws.filter(w => /^A/.test(w[4])); else if (st.lq === "q") ws = ws.filter(w => w[4]);
  if (st.lbusca) { const q = norm(st.lbusca); ws = ws.filter(w => norm(w[3]).includes(q)); }
  ws = ws.slice().sort((a, b) => b[2] - a[2]);
  $("ls-n").textContent = `${ws.length} ${ws.length === 1 ? "obra" : "obras"}`;
  $("ls").innerHTML = ws.slice(0, st.mostrar).map(w => `<li><div class="ls-t"><span class="tag">${w[2]}</span><span class="tag ${w[0]}">${GRP[w[0]]}</span>${w[4] ? `<span class="tag gold">Qualis ${esc(w[4])}</span>` : ""}</div><p>${esc(w[3])}</p><p class="meta">${w[5].map(d => esc(DOC[d].curto)).join(", ")}</p></li>`).join("") || `<li class="meta">Nenhuma obra com esses filtros.</li>`;
  $("ls-mais").hidden = ws.length <= st.mostrar;
}

// controles
const anos = [...new Set(W.map(w => w[2]))].sort();
$("f-de").innerHTML = anos.map(a => `<option${a === st.de ? " selected" : ""}>${a}</option>`).join("");
$("f-ate").innerHTML = anos.map(a => `<option${a === st.ate ? " selected" : ""}>${a}</option>`).join("");
$("f-foco").innerHTML = `<option value="-1">Todos os docentes</option>` + DOC.map((d, i) => `<option value="${i}">${esc(d.n)}</option>`).join("");
$("l-doc").innerHTML = `<option value="">Todos os docentes</option>` + DOC.map((d, i) => `<option value="${i}">${esc(d.n)}</option>`).join("");
$("l-ano").innerHTML = `<option value="">Todos os anos</option>` + anos.slice().reverse().map(a => `<option>${a}</option>`).join("");
const pessoas = Object.entries(PES).map(([k, v]) => [k, v[0]]);
$("f-pessoas").innerHTML = [...DOC.map(d => d.n), ...pessoas.map(p => p[1])].map(n => `<option value="${esc(n)}">`).join("");

const redesenha = () => { st.mostrar = 40; desenhar(); };
$("f-de").onchange = e => { st.de = +e.target.value; if (st.ate < st.de) { st.ate = st.de; $("f-ate").value = st.de; } redesenha(); };
$("f-ate").onchange = e => { st.ate = +e.target.value; if (st.de > st.ate) { st.de = st.ate; $("f-de").value = st.ate; } redesenha(); };
document.querySelectorAll("[name=f-tipo]").forEach(c => c.onchange = () => { st.tipos = new Set([...document.querySelectorAll("[name=f-tipo]:checked")].map(x => x.value)); redesenha(); });
$("f-min").onchange = e => { st.min = +e.target.value; redesenha(); };
$("f-foco").onchange = e => { st.foco = +e.target.value; st.sel = st.foco >= 0 ? nid(st.foco) : null; pos = new Map(); redesenha(); };
$("f-busca").onchange = e => {
  const q = norm(e.target.value); if (!q) return;
  const d = DOC.findIndex(x => norm(x.n) === q || norm(x.n).includes(q));
  const p = pessoas.find(x => norm(x[1]) === q) || pessoas.find(x => norm(x[1]).includes(q));
  st.sel = d >= 0 ? nid(d) : p ? "p" + p[0] : null;
  if (st.sel && st.sel[0] === "p" && PES[st.sel.slice(1)][1] === "ext") st.min = 1, $("f-min").value = 1;
  redesenha(); $("rd-box").scrollIntoView({ behavior: "smooth", block: "center" });
};
const escolhe = id => { st.sel = st.sel === id ? null : id; desenhar(); };
$("rd-box").addEventListener("click", e => { if (arrastou) { arrastou = false; return; } const g = e.target.closest(".no"); escolhe(g ? g.dataset.id : null); });
$("rd-box").addEventListener("keydown", e => { const g = e.target.closest(".no"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); escolhe(g.dataset.id); } });
$("rd-top").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { escolhe(b.dataset.id); $("lista").scrollIntoView({ behavior: "smooth" }); } });
$("rd-dd").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { st.sel = null; desenhar(); lista(b.dataset.par); $("lista").scrollIntoView({ behavior: "smooth" }); } });
$("ls-chip").addEventListener("click", e => { if (e.target.id === "ls-limpa") { st.sel = null; desenhar(); } });
$("l-doc").onchange = e => { st.ld = e.target.value; st.mostrar = 40; lista(); };
$("l-ano").onchange = e => { st.lano = e.target.value; st.mostrar = 40; lista(); };
$("l-q").onchange = e => { st.lq = e.target.value; st.mostrar = 40; lista(); };
$("l-busca").oninput = e => { st.lbusca = e.target.value; st.mostrar = 40; lista(); };
$("ls-mais").onclick = () => { st.mostrar += 60; lista(); };
desenhar();
// mapa.html?foco=<índice do docente>: abre a rede já focada em um docente (link das páginas de docente).
const fq = new URLSearchParams(location.search).get("foco");
if (fq !== null && DOC[+fq]) { $("f-foco").value = fq; $("f-foco").onchange({ target: $("f-foco") }); }
})();
