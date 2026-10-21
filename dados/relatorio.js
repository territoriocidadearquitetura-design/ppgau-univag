// Relatório executivo em PDF: texto analítico e gráficos, feitos com os mesmos dados das páginas do portal.
// relExecPublico() monta o relatório público. O administrativo (relExecAdm) vem no pacote cifrado e usa os auxiliares rx* daqui.
// Depende de: esc, BASE, ATUALIZ (emdados.js), PESSOAS, PLAT, PL_CAT, PL_GRP, PL_ANOS, PROJ, IMPACTO, EVENTOS, REDE.

const RXC = { azul: "#2a78d6", verde: "#1baf7a", laranja: "#eb6834", roxo: "#8e5cd9", cinza: "#7a8494", navy: "#02205f", ouro: "#c99700" };
let rxFigN = 0, rxSvgN = 0;
const rxN = v => typeof v === "number" ? v.toLocaleString("pt-BR") : esc(String(v));
const rxPc = (a, b) => b ? Math.round(100 * a / b) : 0;
const rxSoma = l => l.reduce((s, v) => s + (+v || 0), 0);
const rxPlural = (n, s, p) => `${rxN(n)} ${n === 1 ? s : p}`;

// ---------- Blocos de texto ----------
const rxSec = (n, titulo, corpo) => `<div class="rx"><h2 class="rx-h"><span>${n}</span>${esc(titulo)}</h2>${corpo}</div>`;
const rxP = (...t) => t.filter(Boolean).map(x => `<p>${x}</p>`).join("");
const rxKpis = l => `<div class="rx-kpis">${l.map(([v, t, s]) => `<div><b>${v}</b><span>${t}</span>${s ? `<small>${s}</small>` : ""}</div>`).join("")}</div>`;
// tipo: ok (pontos fortes), at (atenção), info (neutro), ac (ações recomendadas, numeradas).
const rxCaixa = (tipo, titulo, itens) => !itens.length ? "" : `<div class="rx-cx ${tipo}"><b>${titulo}</b>${tipo === "ac" ? "<ol>" : "<ul>"}${itens.map(i => `<li>${i}</li>`).join("")}${tipo === "ac" ? "</ol>" : "</ul>"}</div>`;
const rxFig = (titulo, corpo, fonte, nota) => `<figure class="rx-fig"><figcaption><b>Figura ${++rxFigN}.</b> ${esc(titulo)}</figcaption>${corpo}${nota ? `<p class="rx-nota">${nota}</p>` : ""}<p class="rx-fonte"><b>Fonte:</b> ${fonte}</p></figure>`;
const rxTab = (cab, linhas, fonte, cls) => `<div class="rx-tw"><table class="rx-tab ${cls || ""}"><thead><tr>${cab.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${fonte ? `<p class="rx-fonte"><b>Fonte:</b> ${fonte}</p>` : ""}`;
const rxLeg = l => `<div class="rx-leg">${l.map(([t, c, hach]) => `<span><i style="background:${c}"${hach ? ` class="h"` : ""}></i>${esc(t)}</span>`).join("")}</div>`;

// ---------- Gráficos (SVG, uma escala só, valor escrito em cada coluna) ----------
// Coluna com a ponta de cima arredondada (4 px) e a base reta no eixo.
function rxColPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
function rxHachura(id, cor) { return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${cor}" opacity=".35"/><rect width="2.6" height="6" fill="${cor}"/></pattern>`; }
// rot: rótulos do eixo x; val: valores; o: { cor, suf, parcial: [índices], ref: { v, t }, h, fmt }.
function rxColunas(rot, val, o = {}) {
  const W = o.w || 640, H = o.h || (W < 400 ? 170 : 190), top = 22, base = H - 26, n = rot.length, gut = o.ref ? 92 : 0, band = (W - 20 - gut) / n, bw = Math.min(64, band * .58);
  const mx = Math.max(1, ...val.map(v => +v || 0), o.ref ? o.ref.v : 0) * 1.05, y = v => base - (base - top) * (v / mx);
  const cor = o.cor || RXC.azul, id = "rxh" + (++rxSvgN), fmt = o.fmt || (v => rxN(v) + (o.suf || ""));
  const cols = rot.map((r, i) => {
    const v = val[i], x = 10 + band * i + (band - bw) / 2, par = (o.parcial || []).includes(i);
    const c = Array.isArray(o.cor) ? o.cor[i] : cor;
    return (v == null ? "" : `<path d="${rxColPath(x, y(v), bw, base - y(v), 4)}" fill="${par ? `url(#${id})` : c}"/><text x="${x + bw / 2}" y="${y(v) - 6}" class="rx-v">${fmt(v)}</text>`) +
      `<text x="${x + bw / 2}" y="${H - 8}" class="rx-x">${esc(r)}${par ? "*" : ""}</text>`;
  }).join("");
  const ref = o.ref ? `<line x1="6" x2="${W - gut}" y1="${y(o.ref.v)}" y2="${y(o.ref.v)}" class="rx-ref"/>${String(o.ref.t).split(": ").map((t, k, a) => `<text x="${W - gut + 6}" y="${y(o.ref.v) + 4 + (k - (a.length - 1) / 2) * 13}" class="rx-reft">${esc(t)}${k < a.length - 1 ? ":" : ""}</text>`).join("")}` : "";
  return `<svg class="rx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.alt || "")}"><defs>${rxHachura(id, cor)}</defs><line x1="6" x2="${W - 6}" y1="${base}" y2="${base}" class="rx-eixo"/>${cols}${ref}</svg>`;
}
// Colunas empilhadas: series = [{ nome, cor, v: [...] }]; total no topo; 2 px de respiro entre as partes.
function rxPilha(rot, series, o = {}) {
  const W = o.w || 640, H = o.h || 210, top = 22, base = H - 26, n = rot.length, band = (W - 20) / n, bw = Math.min(64, band * .58);
  const tot = rot.map((_, i) => rxSoma(series.map(s => s.v[i]))), mx = Math.max(1, ...tot) * 1.05, k = (base - top) / mx;
  const defs = series.map((s, j) => rxHachura(`rxp${rxSvgN + 1}_${j}`, s.cor)).join(""), sid = ++rxSvgN;
  const cols = rot.map((r, i) => {
    const x = 10 + band * i + (band - bw) / 2, par = (o.parcial || []).includes(i);
    let yb = base, segs = "";
    const vis = series.map((s, j) => [s, j]).filter(([s]) => s.v[i] > 0);
    vis.forEach(([s, j], m) => {
      const h = s.v[i] * k, ult = m === vis.length - 1, hh = Math.max(.5, h - (m ? 2 : 0));
      const yy = yb - h + (m ? 0 : 0);
      segs += ult ? `<path d="${rxColPath(x, yy, bw, hh, 4)}" fill="${par ? `url(#rxp${sid}_${j})` : s.cor}"/>` : `<rect x="${x}" y="${yy}" width="${bw}" height="${hh}" fill="${par ? `url(#rxp${sid}_${j})` : s.cor}"/>`;
      yb -= h;
    });
    return segs + `<text x="${x + bw / 2}" y="${yb - 6}" class="rx-v">${rxN(tot[i])}</text><text x="${x + bw / 2}" y="${H - 8}" class="rx-x">${esc(r)}${par ? "*" : ""}</text>`;
  }).join("");
  return `<svg class="rx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.alt || "")}"><defs>${defs}</defs><line x1="6" x2="${W - 6}" y1="${base}" y2="${base}" class="rx-eixo"/>${cols}</svg>` + rxLeg(series.map(s => [s.nome, s.cor]));
}
// Linhas (progressão ano a ano): series = [{ nome, cor, v, forte }]; o último ponto parcial fica tracejado.
function rxLinhas(rot, series, o = {}) {
  const W = o.w || 640, H = o.h || 230, L = 30, Rg = 150, top = 24, base = H - 26, n = rot.length;
  const mx = Math.max(1, ...series.flatMap(s => s.v)) * 1.08, x = i => L + i * (W - L - Rg) / Math.max(1, n - 1), y = v => base - (base - top) * v / mx;
  const par = o.parcial, grade = [0, .5, 1].map(f => `<line x1="${L}" x2="${W - Rg + 8}" y1="${y(mx / 1.08 * f)}" y2="${y(mx / 1.08 * f)}" class="rx-grade"/>`).join("");
  const ls = series.map(s => { const pts = s.v.map((v, i) => [x(i), y(v)]), ult = par != null ? par : n; const cheio = pts.slice(0, Math.min(ult, n) + (ult < n ? 0 : 0)).filter((_, i) => i < ult).map(p => p.join(",")).join(" ");
    const tr = ult < n ? pts.slice(ult - 1).map(p => p.join(",")).join(" ") : "";
    return `<polyline points="${cheio}" fill="none" stroke="${s.cor}" stroke-width="${s.forte ? 3 : 2}" stroke-linejoin="round"/>${tr ? `<polyline points="${tr}" fill="none" stroke="${s.cor}" stroke-width="${s.forte ? 3 : 2}" stroke-dasharray="5 4"/>` : ""}${pts.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="${s.forte ? 4.5 : 3.5}" fill="${s.cor}" stroke="#fff" stroke-width="1.5"/>`).join("")}${s.forte ? s.v.map((v, i) => `<text x="${x(i)}" y="${y(v) - 9}" class="rx-v">${rxN(v)}</text>`).join("") : ""}`; }).join("");
  const fim = series.map(s => ({ s, yy: y(s.v[n - 1]) })).sort((a, b) => a.yy - b.yy); fim.forEach((f, k) => { if (k && f.yy - fim[k - 1].yy < 14) f.yy = fim[k - 1].yy + 14; }); const exc = fim.length ? fim[fim.length - 1].yy - (base - 4) : 0; if (exc > 0) fim.forEach(f => f.yy -= exc);
  const rot2 = fim.map(f => `<text x="${x(n - 1) + 12}" y="${f.yy + 4}" class="rx-fim" fill="${f.s.cor}"><tspan font-weight="700">${rxN(f.s.v[n - 1])}</tspan> <tspan fill="#3b4456">${esc(f.s.nome)}</tspan></text>`).join("");
  const eixo = rot.map((r, i) => `<text x="${x(i)}" y="${H - 8}" class="rx-x">${esc(r)}${par != null && i >= par ? "*" : ""}</text>`).join("");
  return `<svg class="rx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.alt || "")}">${grade}<line x1="${L}" x2="${W - Rg + 8}" y1="${base}" y2="${base}" class="rx-eixo"/>${ls}${rot2}${eixo}</svg>` + rxLeg(series.map(s => [s.nome, s.cor]));
}
// Barras horizontais em HTML: itens = [{ t, v, cor, txt }].
function rxBarras(itens, o = {}) {
  const mx = o.max || Math.max(1, ...itens.map(i => i.v));
  return `<div class="rx-hb">${itens.map(i => `<div class="rx-hbl"><span class="rx-hbt">${i.t}</span><span class="rx-hbb"><i style="width:${Math.max(i.v ? 1.5 : 0, 100 * i.v / mx)}%;background:${i.cor || o.cor || RXC.azul}"></i></span><span class="rx-hbv">${i.txt != null ? i.txt : rxN(i.v) + (o.suf || "")}</span></div>`).join("")}</div>`;
}
// Barra única dividida (parte de um todo): partes = [[rótulo, valor, cor]].
function rxParte(partes) {
  const tot = rxSoma(partes.map(p => p[1])) || 1;
  return `<div class="rx-parte">${partes.filter(p => p[1]).map(([t, v, c]) => `<i style="width:${100 * v / tot}%;background:${c}" title="${esc(t)}"></i>`).join("")}</div>` + rxLeg(partes.map(([t, v, c]) => [`${t}: ${rxN(v)} (${rxPc(v, tot)}%)`, c]));
}

// ---------- Relatório executivo público ----------
function relExecPublico() {
  rxFigN = 0;
  const B = BASE, S = B.series, A = B.anos, ult = l => l[l.length - 1];
  const P = typeof PESSOAS === "object" ? PESSOAS : [];
  const nDisc = P.filter(p => p.c === "discente").length, nEgr = P.filter(p => p.c === "egresso").length, nPos = P.filter(p => p.c === "pos-doc").length;
  const comOb = P.filter(p => (p.ob || []).length).length, nOb = rxSoma(P.map(p => (p.ob || []).length));
  const nDoc = B.corpo.length, nPerm = ult(S.permanentes.valores);
  const DA = [2021, 2022, 2023, 2024, 2025, 2026], dPor = DA.map(a => B.dissertacoes.filter(d => +d[0] === a).length), nDef = rxSoma(dPor);
  const at = (typeof ATUALIZ === "object" && ATUALIZ) || { geral: "", secoes: {}, coleta: "" }, dt = id => at.secoes[id] || at.geral;
  const artQ = rxSoma(S.artigos.valores), coQ = rxSoma(S.coautoria.valores);
  const sel = B.selecao.map(x => x[1] / x[0]), f1 = v => v.toFixed(1).replace(".", ",");
  const tempo = S.tempo.valores, mat = S.matriculados.valores, tit = S.titulados.valores;
  const anosTxt = `${A[0]} a ${ult(A)}`;

  // Produção nos Lattes (obras em coautoria entre docentes contam uma vez).
  const it = typeof PLAT === "object" ? PLAT.itens : [];
  const grupoDe = (tipo, cat) => ((PL_CAT[tipo] || []).find(c => c[0] === cat) || [])[3];
  const pilha = tipo => PL_GRP[tipo].map(([g, nome, cor], j) => ({ nome, cor: [RXC.azul, RXC.roxo, RXC.verde, RXC.laranja, RXC.cinza, "#b8860b"][j] || cor, v: PL_ANOS.map(a => it.filter(x => x[1] === a && grupoDe(tipo, x[0]) === g).length) }));
  const bib = pilha("bib"), tec = pilha("tec");
  const totBib = bib.map((_, j) => 0) && PL_ANOS.map((_, i) => rxSoma(bib.map(s => s.v[i])));
  const arts = it.filter(x => x[0] === "art"), q = e => arts.filter(x => x[4] === e).length;
  const qA = ["A1", "A2", "A3", "A4"].reduce((s, e) => s + q(e), 0), qB = ["B1", "B2", "B3", "B4", "C"].reduce((s, e) => s + q(e), 0), qS = arts.length - qA - qB;
  const ano26 = PL_ANOS.indexOf(2026);

  // Impacto e inserção.
  const ev = typeof EVENTOS === "object" ? EVENTOS : [], evA = [2023, 2024, 2025, 2026], evPor = evA.map(a => ev.filter(e => +e.ano === a).length);
  const imp = typeof IMPACTO === "object" ? IMPACTO.impacto.filter(x => x.tipo !== "evento") : [];
  const parc = typeof REDE === "object" ? REDE.parceiros : [];
  const pj = (typeof PROJ === "object" ? PROJ : []).filter(p => p.fim === "Atual" || +p.fim >= 2021);
  const pjNat = {}; pj.forEach(p => pjNat[p.nat || p.t] = (pjNat[p.nat || p.t] || 0) + 1);
  const pjFin = pj.filter(p => (p.fin || "").trim()).length, pjMest = pj.filter(p => /Mestrado/.test(p.al || "")).length;

  const partes = [];
  const add = (titulo, html) => partes.push({ titulo, html: rxSec(partes.length + 1, titulo, html) });

  add("Síntese executiva", rxKpis([
    ["3", "Nota CAPES", "mantida na Quadrienal 2025"],
    [rxN(nDoc), "Docentes", `${nPerm} permanentes em dez./2024`],
    [rxN(nDef), "Mestres titulados", "de 2021 a 2026"],
    [rxN(nDisc), "Mestrandos em curso", `e ${nEgr} egressos no portal`],
    [rxN(artQ), "Artigos em periódicos", anosTxt],
    [rxN(ev.length), "Eventos organizados", "de 2023 a 2026"]]) +
    rxP(`O Programa de Pós-Graduação em Arquitetura e Urbanismo do UNIVAG chega ao segundo ano do quadriênio 2025–2028 com nota 3, mantida na Quadrienal 2025, corpo docente próprio de ${nDoc} professores e ${nDisc} mestrandos em curso. Este relatório resume o que o portal <i>PPGAU UNIVAG em dados</i> mostra, com a fonte de cada número, e aponta o que os dados sugerem para os próximos anos.`,
      `De ${anosTxt}, o programa ganhou escala. Os matriculados passaram de ${mat[0]} para ${ult(mat)}, a procura no processo seletivo foi de ${f1(sel[0])} para ${f1(ult(sel))} inscritos por vaga e os artigos em periódicos foram de ${S.artigos.valores[0]} para ${ult(S.artigos.valores)} por ano. Desde 2021, ${nDef} mestres foram titulados, ${dPor[4] + dPor[5]} deles em 2025 e 2026.`) +
    `<div class="rx-2">` +
    rxCaixa("ok", "O que avançou", [
      `Produção em periódicos multiplicada por ${Math.round(ult(S.artigos.valores) / Math.max(1, S.artigos.valores[0]))} entre 2021 e 2024, com ${rxPc(qA, arts.length)}% dos artigos de 2021 a 2026 em estratos A1 a A4 do Qualis.`,
      `Mais discentes como autores: os artigos com discente ou egresso entre os autores foram de ${S.coautoria.valores[0]} em 2021 para ${ult(S.coautoria.valores)} em 2024.`,
      `${ev.length} eventos científicos organizados ou coorganizados desde 2023, com parceiros no Brasil e na Espanha.`,
      `Terceira linha de pesquisa, Gestão, Inovação e Tecnologias, a partir de 2026.`]) +
    rxCaixa("at", "Pontos de atenção", [
      `O tempo médio até a defesa subiu de ${tempo[0]} para ${ult(tempo)} meses, acima do prazo regular de 24 meses.`,
      `Bolsas: ${ult(S.bolsas.valores)} bolsistas para ${ult(mat)} matriculados em 2024.`,
      `Concentração editorial: ${esc((S.artigos.nota.match(/(\d+%[^.]*)/) || ["parte dos artigos em poucas editoras"])[1])}.`,
      `Os números de 2026 são parciais: o ano ainda não terminou e a autoavaliação está em coleta.`]) + `</div>`);

  add("O programa e sua trajetória",
    rxP(`O mestrado acadêmico foi recomendado pela CAPES em 2018 e começou em 2019, em associação com a PUC-Campinas. A associação terminou no quadriênio 2021–2024, e desde 2024 o programa funciona com corpo docente próprio. A área de concentração é <b>Arquitetura, Cidade e Território</b>, organizada em ${B.programa.find(x => x[0] === "Linhas de pesquisa") ? "três linhas de pesquisa" : "linhas de pesquisa"}, e a produção se apoia em ${B.grupos.length} grupos de pesquisa cadastrados no CNPq.`) +
    rxTab(["Aspecto", "Situação"], B.programa.map(([a, b]) => [`<b>${esc(a)}</b>`, esc(b)]), "site do programa e Plataforma Sucupira; seção O programa do portal, atualizada em " + dt("programa") + ".") +
    `<h3 class="rx-h3">Marcos</h3><ol class="rx-tl">${B.trajetoria.map(([a, t]) => `<li><b>${esc(a)}</b><span>${esc(t)}</span></li>`).join("")}</ol>` +
    `<h3 class="rx-h3">Grupos de pesquisa</h3>` +
    rxTab(["Grupo", "Liderança"], B.grupos.map(g => [esc(g[0]), esc(g[1])]), "Diretório dos Grupos de Pesquisa do CNPq e site do programa."));

  const turm = S.turmas.valores;
  add("Corpo docente",
    rxP(`O programa tem hoje ${nDoc} docentes: ${nDoc - 1} permanentes e uma colaboradora. No quadriênio 2021–2024, o número de permanentes com vínculo em 31 de dezembro ficou entre ${Math.min(...S.permanentes.valores)} e ${Math.max(...S.permanentes.valores)}, numa fase de troca intensa: ${esc((B.perfil.find(p => /entradas/.test(p[1])) || ["9 e 11"])[0])} ${esc((B.perfil.find(p => /entradas/.test(p[1])) || ["", "entradas e saídas de docentes"])[1])}.`,
      `A participação dos permanentes no ensino subiu de ${turm[0]}% para ${ult(turm)}% entre os que deram ao menos uma turma no ano. A ficha de avaliação 2025–2028 pede no mínimo 50%, e o programa está acima disso em todos os anos.`) +
    `<div class="rx-2">` +
    rxFig("Docentes permanentes em 31 de dezembro", rxColunas(A, S.permanentes.valores, { cor: RXC.navy, w: 340, alt: "Docentes permanentes por ano" }), "relatórios do Coleta CAPES, 2021 a 2024.", esc(S.permanentes.nota)) +
    rxFig("Permanentes com ao menos uma turma no ano", rxColunas(A, turm, { cor: RXC.azul, w: 340, suf: "%", ref: { v: 50, t: "mínimo: 50%" }, alt: "Percentual de permanentes com turma" }), "relatórios do Coleta CAPES, 2021 a 2024; Ficha de Avaliação 2025–2028.") +
    `</div>` +
    rxTab(["Docente", "Titulação"], B.corpo.map(c => [`<b>${esc(c[0])}</b>`, esc(c[1])]), `site do programa e Currículo Lattes; seção Corpo docente, atualizada em ${dt("docentes")}.`));

  add("Ingresso, seleção e titulação",
    rxP(`A procura pelo mestrado cresceu de forma contínua. Em ${A[0]} houve ${B.selecao[0][1]} inscritos para ${B.selecao[0][0]} vagas; em ${ult(A)}, ${ult(B.selecao)[1]} inscritos para ${ult(B.selecao)[0]} vagas. Os matriculados chegaram a ${ult(mat)} em ${ult(A)}, o dobro do início do quadriênio.`,
      `As defesas acompanham esse crescimento com atraso: foram ${dPor.slice(0, 4).join(", ").replace(/, (\d+)$/, " e $1")} dissertações por ano de 2021 a 2024, e ${dPor[4]} em 2025. Em 2026 já são ${dPor[5]} até a data desta versão. O tempo médio do ingresso à defesa subiu de ${tempo[0]} para ${ult(tempo)} meses, o principal ponto de atenção na formação.`) +
    `<div class="rx-2">` +
    rxFig("Inscritos por vaga no processo seletivo", rxColunas(A, sel, { cor: RXC.azul, w: 340, fmt: f1, alt: "Inscritos por vaga" }), "Proposta do programa no Coleta CAPES, 2021 a 2024.") +
    rxFig("Dissertações defendidas por ano", rxColunas(DA, dPor, { cor: RXC.verde, w: 340, parcial: [5], alt: "Defesas por ano" }), `Repositório Digital UNIVAG; seção Ingresso e titulação, atualizada em ${dt("formacao")}.`, "*2026 até a data desta versão, ano incompleto (coluna hachurada).") +
    `</div>` +
    rxFig("Tempo médio do ingresso à defesa, em meses", rxColunas(A, tempo, { cor: RXC.laranja, ref: { v: 24, t: "prazo regular: 24 meses" }, alt: "Tempo médio até a defesa", h: 170 }), "relatórios do Coleta CAPES, 2021 a 2024.", esc(S.tempo.nota)));

  add("Discentes e egressos",
    rxKpis([[rxN(nDisc), "Mestrandos em curso"], [rxN(nEgr), "Egressos"], [rxN(nPos), "Pós-doutorandos"], [rxN(comOb), "Com produção registrada", `${nOb} obras no portal`]]) +
    rxP(`O portal acompanha ${nDisc + nEgr + nPos} pessoas ligadas ao programa, cada uma com orientador e, quando há, coorientador. A participação de discentes e egressos na produção cresceu: de ${artQ} artigos publicados de ${anosTxt}, ${coQ} (${rxPc(coQ, artQ)}%) têm discente ou egresso entre os autores, e a série anual mostra que isso se concentrou nos dois últimos anos do quadriênio.`,
      `A iniciação científica também se ampliou, de ${S.ic.valores[0]} para ${ult(S.ic.valores)} estudantes de graduação nos projetos do programa. As bolsas não acompanharam o número de matriculados: ${S.bolsas.valores.join(", ").replace(/, (\d+)$/, " e $1")} bolsistas por ano, todas da CAPES.`) +
    `<div class="rx-2">` +
    rxFig("Artigos com discente ou egresso entre os autores", rxColunas(A, S.coautoria.valores, { cor: RXC.verde, w: 340, alt: "Artigos com discentes" }), "relatórios do Coleta CAPES, 2021 a 2024.", esc(S.coautoria.nota)) +
    rxFig("Bolsistas e matriculados", rxPilhaLado(A, [["Matriculados", mat, RXC.azul], ["Bolsistas", S.bolsas.valores, RXC.laranja]], { w: 340 }), "relatórios do Coleta CAPES, 2021 a 2024.") +
    `</div>`);

  add("Produção intelectual",
    rxP(`Os currículos Lattes dos ${PLAT.nomes.length} docentes registram ${rxN(rxSoma(totBib))} itens de produção bibliográfica de 2021 a 2026, contando uma vez as obras em coautoria entre docentes. O ano de ${PL_ANOS[totBib.indexOf(Math.max(...totBib))]} é o pico (${rxN(Math.max(...totBib))} itens), coincidindo com o fechamento do quadriênio avaliado.`,
      `Dos ${rxN(arts.length)} artigos em periódicos do período, ${qA} (${rxPc(qA, arts.length)}%) saíram em estratos A1 a A4 do Qualis 2021–2024, ${qB} em B1 a C e ${qS} não têm o estrato informado no Lattes. Manter a regularidade de 2024 em 2025–2028 e diversificar os periódicos são os desafios para o próximo ciclo, em que a CAPES julga as produções destacadas pela aderência às linhas e pelo impacto.`) +
    rxFig("Produção bibliográfica por ano: total e principais tipos", rxLinhas(PL_ANOS, [{ nome: "Total", cor: RXC.navy, v: totBib, forte: true }, ...bib.filter(x => rxSoma(x.v) >= 10)], { parcial: ano26, alt: "Produção bibliográfica por ano" }), `Currículos Lattes dos docentes (${esc(PLAT.fonte.replace(/^Currículos Lattes dos \d+ docentes, /, ""))}); seção Produção, atualizada em ${dt("producao")}.`, "*2026 até a data da versão dos currículos, ano incompleto (trecho tracejado).") +
    `<div class="rx-2">` +
    rxFig("Artigos em periódicos por estrato Qualis, 2021–2026", rxBarras(["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C"].map(e => ({ t: e, v: q(e), cor: /^A/.test(e) ? RXC.azul : RXC.cinza })).concat([{ t: "Sem estrato", v: qS, cor: "#c5cad3" }])), "estrato informado no Currículo Lattes (Qualis CAPES 2021–2024).") +
    rxFig("Produção técnica por tipo, 2021–2026", rxBarras(tec.map(s => ({ t: esc(s.nome), v: rxSoma(s.v), cor: s.cor }))), "Currículos Lattes dos docentes.") +
    `</div>`);

  add("Impacto e inserção social",
    rxP(`O impacto do programa aparece sobretudo na organização de eventos científicos em rede, na extensão e na divulgação. Desde 2023 foram ${ev.length} eventos organizados ou coorganizados, ${evPor[2]} deles em 2025, incluindo um congresso internacional. Os parceiros vão da ANAP, que coedita os anais com ISBN, à Universidad de Córdoba, parceira no projeto aprovado na Chamada CNPq Universal 2024.`,
      `Os docentes mantêm ${pj.length} projetos ativos desde 2021 nos currículos Lattes${pjMest ? `, ${pjMest} com mestrandos na equipe` : ""}. ${pjFin ? `${pjFin} registram financiamento.` : "Nenhum registra financiamento externo no Lattes, o que é uma frente de trabalho para o quadriênio."}`) +
    `<div class="rx-2">` +
    rxFig("Eventos organizados ou coorganizados por ano", rxColunas(evA, evPor, { cor: RXC.roxo, w: 340, parcial: [3], alt: "Eventos por ano" }), `site do programa e páginas dos eventos; seção Impacto, atualizada em ${dt("impacto")}.`, "*2026 até a data desta versão.") +
    rxFig("Projetos ativos desde 2021, por natureza", rxBarras(Object.entries(pjNat).sort((a, b) => b[1] - a[1]).map(([t, v]) => ({ t: esc(t), v, cor: RXC.navy }))), "Currículos Lattes dos docentes, seção Projetos.") +
    `</div>` +
    rxTab(["Parceiro", "Onde", "Papel"], parc.map(p => [`<b>${esc(p[0])}</b>`, esc(p[1]), esc(p[3] || "")]), "site do programa e páginas dos eventos.") +
    rxCaixa("info", "Registros de impacto no portal", imp.map(x => `${esc(x.titulo)}${x.ano ? ` (${esc(x.ano)})` : ""}`)));

  add("Autoavaliação 2026",
    rxP(`A autoavaliação 2026 está <b>em coleta até 3 de novembro de 2026</b>. Os questionários são anônimos e separados por público: estudantes, docentes, pós-doutorandos, egressos, equipe técnica e gestão. A lista de participantes e as respostas ficam em tabelas diferentes, sem vínculo entre elas.`,
      `Os resultados só são publicados depois do encerramento da coleta e apenas para questionários com cinco respostas ou mais, para que ninguém seja identificado. Eles vão orientar o planejamento estratégico do programa e o relatório do Coleta CAPES de 2026.`) +
    rxCaixa("info", "Situação", [esc(at.coleta), "Resultados por tema e por questionário: aba Autoavaliação do portal, após o encerramento."]));

  add("Perspectivas para 2025–2028",
    rxP(`Os dados do portal apontam quatro frentes para o restante do quadriênio. A primeira é a formação: reduzir o tempo até a defesa e manter o ritmo de titulações de 2025 e 2026. A segunda é a produção, mantendo a escala alcançada em 2024 com mais periódicos de estratos superiores e mais coautoria de discentes e egressos.`,
      `A terceira é o impacto, registrando o efeito concreto de eventos, projetos e ações de extensão, e ampliando as parcerias com o exterior. A quarta é a consolidação da terceira linha de pesquisa, com projetos e orientações próprios. A autoavaliação em curso vai acrescentar a visão de estudantes, docentes, egressos e equipe a essa leitura.`));

  add("Fontes e metodologia",
    rxP(`Cada número deste relatório vem de uma fonte pública ou de um documento oficial do programa, listados abaixo. Os gráficos de 2021 a 2024 usam os relatórios enviados ao Coleta CAPES; os de 2025 e 2026 usam os currículos Lattes e o Repositório Digital UNIVAG e são parciais. Obras em coautoria entre docentes contam uma vez. Os dados foram atualizados em ${esc(at.geral)}.`) +
    rxTab(["Documento", "Origem", "Data"], B.fontes.map(f => [`<b>${esc(f[0])}</b>`, esc(f[1]), esc(f[4] || "")]), "seção Fontes do portal."));
  return partes;
}
// Duas séries lado a lado por ano (barras agrupadas, mesma escala): l = [[nome, valores, cor]].
function rxPilhaLado(rot, l, o = {}) {
  const W = o.w || 640, H = W < 400 ? 170 : 190, top = 22, base = H - 26, band = (W - 20) / rot.length, bw = Math.min(28, band * .3), mx = Math.max(1, ...l.flatMap(s => s[1])) * 1.05, y = v => base - (base - top) * v / mx;
  const g = rot.map((r, i) => l.map(([, v, c], j) => { const x = 10 + band * i + band / 2 - bw * l.length / 2 - 1 + j * (bw + 2); return `<path d="${rxColPath(x, y(v[i]), bw, base - y(v[i]), 4)}" fill="${c}"/><text x="${x + bw / 2}" y="${y(v[i]) - 6}" class="rx-v">${rxN(v[i])}</text>`; }).join("") + `<text x="${10 + band * i + band / 2}" y="${H - 8}" class="rx-x">${esc(r)}</text>`).join("");
  return `<svg class="rx-svg" viewBox="0 0 ${W} ${H}" role="img"><line x1="6" x2="${W - 6}" y1="${base}" y2="${base}" class="rx-eixo"/>${g}</svg>` + rxLeg(l.map(([n, , c]) => [n, c]));
}
