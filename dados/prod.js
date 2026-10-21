// Produção em três janelas: 2021–2024 (avaliado), 2025–2028 (em andamento) e evolução 2021–2028.
// Depende de: BASE, FICHA_2025 (fichas.js), PESSOAS (pessoas.js), EVENTOS e IMPACTO (impacto.js), helpers de emdados.js.

const PJAN = [["q1", "2021–2024", "quadriênio avaliado"], ["q2", "2025–2028", "em andamento"], ["ev", "2021–2028", "evolução do programa"]];

function prodArtigosAtuais() {
  const u = new Map();
  for (const [n, l] of Object.entries(typeof FICHA_2025 === "object" ? FICHA_2025 : {}))
    for (const x of l.filter(x => x.cat === "per")) {
      const k = (x.doi || x.titulo).toLowerCase();
      if (!u.has(k)) u.set(k, Object.assign({}, x, { docs: [n] })); else if (!u.get(k).docs.includes(n)) u.get(k).docs.push(n);
    }
  const tn = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
  const tit = new Map();
  (typeof PESSOAS === "object" ? PESSOAS : []).forEach(p => p.ob.forEach(o => { const k = tn(o[1]); if (!tit.has(k)) tit.set(k, []); tit.get(k).push(p); }));
  return [...u.values()].map(a => Object.assign(a, { alunos: tit.get(tn(a.titulo)) || [] })).sort((a, b) => b.ano.localeCompare(a.ano) || a.titulo.localeCompare(b.titulo));
}

const PTIPO = [["bib", "Produção bibliográfica", "artigos, livros, capítulos, anais"], ["tec", "Produção técnica", "pareceres, cursos, editoração, patentes"], ["ind", "Indicadores CAPES", "quadriênios e evolução"]];
function prodJanelas(q1) {
  const t = PTIPO.some(x => x[0] === st.ptipo) ? st.ptipo : "bib";
  const abas = `<div class="pl-abas" role="tablist">${PTIPO.map(([k, a, d]) => `<button role="tab" data-pt="${k}" aria-selected="${k === t}"><b>${a}</b><span>${d}</span></button>`).join("")}</div>`;
  if (t !== "ind") return abas + prodLattes(t);
  const j = PJAN.some(x => x[0] === st.pjan) ? st.pjan : "q1";
  const tabs = `<div class="pgtabs pjan" role="tablist">${PJAN.map(([k, a, t]) => `<button role="tab" data-pj="${k}" aria-selected="${k === j}">${a} <b>${t}</b></button>`).join("")}</div>`;
  return abas + tabs + (j === "q1" ? q1 : j === "q2" ? prodAtual() : prodEvolucao());
}

function prodAtual() {
  const arts = prodArtigosAtuais();
  const a25 = arts.filter(a => a.ano === "2025"), a26 = arts.filter(a => a.ano === "2026");
  const comAl = arts.filter(a => a.disc || a.alunos.length).length, coaut = arts.filter(a => a.docs.length > 1).length;
  const PS = typeof PESSOAS === "object" ? PESSOAS : [];
  const obAl = PS.flatMap(p => p.ob.filter(o => +o[0] >= 2025).map(o => ({ p, o })));
  const u = new Map(); obAl.forEach(x => { const k = (x.o[3] || x.o[1]).toLowerCase(); if (!u.has(k)) u.set(k, x); });
  const al = [...u.values()];
  const evs = (typeof EVENTOS === "object" ? EVENTOS : []).filter(e => +e.ano >= 2025);
  const def = BASE.dissertacoes.filter(x => x[0] >= "2025");
  const per = {}; arts.forEach(a => { per[a.periodico] = (per[a.periodico] || 0) + 1; });
  const meses = 21.5, ritmo = arts.length / meses * 12;
  const tiles = [
    [arts.length, "artigos em periódicos", "2025 e 2026, sem repetir coautorias"],
    [comAl, "com discente ou egresso", `${Math.round(100 * comAl / Math.max(1, arts.length))}% dos artigos`],
    [al.length, "trabalhos de discentes, egressos e pós-docs", "desde 2025"],
    [def.length, "dissertações concluídas", "edições 2025 e 2026 do repositório"],
    [evs.length, "eventos em 2025 e 2026", `${evs.filter(e => /organizador/.test(e.ppgau_papel)).length} organizados ou coorganizados pelo PPGAU`],
    [Object.keys(per).length, "periódicos diferentes", "nos artigos dos docentes"]
  ];
  const uTipo = new Map(); Object.values(FICHA_2025).flat().forEach(x => uTipo.set((x.doi || x.titulo).toLowerCase().slice(0, 80), x));
  const todos = [...uTipo.values()];
  const tipos = CAT25.map(([k, t, nota]) => [t, nota, todos.filter(x => x.cat === k && x.ano === "2025").length, todos.filter(x => x.cat === k && x.ano === "2026").length]);
  const lk = d => d ? `<a href="${esc(/^http/.test(d) ? d : "https://doi.org/" + d)}" target="_blank" rel="noopener">DOI ↗</a>` : "";
  return `
    <div class="leit" style="grid-template-columns:1fr"><div class="lt mostra"><span class="dim">Quadriênio em andamento</span><p>Estamos em ${Math.round(meses)} dos 48 meses do quadriênio 2025–2028. Os números abaixo vêm de bases abertas (OpenAlex e site do programa) e são um piso: a produção completa aparece quando o Coleta 2025 e o Lattes de cada docente forem conferidos.</p></div></div>
    <div class="qdest imp">${tiles.map(([n, t, s]) => `<div class="card"><strong>${esc(n)}</strong><span>${esc(t)}</span><span class="small muted">${esc(s)}</span></div>`).join("")}</div>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:6px">Produção por tipo, 2025–2026</div><div style="overflow-x:auto"><table class="ftab"><thead><tr><th>Tipo</th><th>2025</th><th>2026*</th><th>Total</th><th>Como a CAPES pontua</th></tr></thead><tbody>${tipos.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${r[2] || "–"}</td><td>${r[3] || "–"}</td><td><strong>${r[2] + r[3] || "–"}</strong></td><td class="small">${esc(r[1])}</td></tr>`).join("")}</tbody></table></div><p class="fonte">Cada tipo tem peso próprio na avaliação e é contado à parte. Artigos em anais e trabalhos de iniciação científica não entram na conta de artigos em periódicos. Livros e capítulos ainda não aparecem porque o OpenAlex quase não indexa livros nacionais: entram com o Lattes de cada docente. Fonte: OpenAlex e site do programa, 17/10/2026.</p></div>
    <div class="cols" style="margin-top:14px">
      <div class="card"><div class="dim" style="margin-bottom:8px">Artigos em periódicos por ano no quadriênio</div>${vbarras([a25.length, a26.length], ["2025", "2026*"], 1)}<p class="fonte">*2026 até 17/10. No ritmo atual, o quadriênio fecharia com cerca de ${Math.round(ritmo * 4)} artigos (${Math.round(ritmo)} por ano), contra 117 em 2021–2024. Fonte: OpenAlex, pelo ORCID dos docentes.</p></div>
      <div class="card"><div class="dim" style="margin-bottom:8px">Artigos em periódicos desde 2025, por docente</div>${hbarras(Object.entries(BASE.ar2025).filter(([, v]) => v).sort((a, b) => b[1] - a[1]).map(([n, v]) => [n, v, "b"]))}<p class="fonte">Um artigo com dois docentes conta para os dois. ${coaut} artigos foram escritos em parceria entre docentes do programa.</p></div>
    </div>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:6px">Artigos em periódicos dos docentes, 2025–2026</div><div style="overflow-x:auto"><table class="ftab"><thead><tr><th>Ano</th><th>Artigo</th><th>Docentes</th><th>Discentes e egressos</th></tr></thead><tbody>${arts.map(a => `<tr><td class="nw">${esc(a.ano)}</td><td><strong>${esc(a.titulo)}</strong><br><span class="small muted">${esc(a.periodico)}</span> ${lk(a.doi)}</td><td class="small">${a.docs.map(docLink).join("; ")}</td><td class="small">${a.alunos.length ? esc([...new Set(a.alunos.map(p => p.n))].join(", ")) : (a.alunosN || []).length ? esc(a.alunosN.join(", ")) : "–"}</td></tr>`).join("")}</tbody></table></div><p class="fonte">Fonte: OpenAlex, consulta pelo ORCID de cada docente em 17/10/2026; discentes e egressos identificados pelo cruzamento com as listas do site.</p></div>
    <div class="card" style="margin-top:14px"><div class="dim">Trabalhos de discentes, egressos e pós-doutorandos desde 2025</div>${alunosPorTipo(al, lk)}<p class="fonte">Tipo identificado pelo veículo de publicação: periódico (revista científica), evento (seminário, congresso, anais), livro ou capítulo, e dados de pesquisa. Fonte: OpenAlex, busca pelo nome de cada pessoa listada no site do programa.</p></div>`;
}

function prodEvolucao() {
  const arts = prodArtigosAtuais();
  const n25 = arts.filter(a => a.ano === "2025").length, n26 = arts.filter(a => a.ano === "2026").length;
  const d25 = arts.filter(a => a.ano === "2025" && (a.disc || a.alunos.length)).length, d26 = arts.filter(a => a.ano === "2026" && (a.disc || a.alunos.length)).length;
  const tit25 = BASE.dissertacoes.filter(x => x[0] === "2025").length, tit26 = BASE.dissertacoes.filter(x => x[0] === "2026").length;
  const anos = ["2021", "2022", "2023", "2024", "2025", "2026*"];
  const evs = typeof EVENTOS === "object" ? EVENTOS : [];
  const orgAno = a => evs.filter(e => +e.ano === a && /organizador/.test(e.ppgau_papel)).length;
  const marcos = [
    ["2019", "Criação do mestrado, em associação com a PUC-Campinas"],
    ["2021–2022", "Saída dos docentes da PUC-Campinas e formação do corpo docente próprio"],
    ["2023", "Lançamento da revista Vernácula (ISSN 2965-6125) e 1º Simpósio Território, Cidade e Arquitetura"],
    ["2024", "Entrada de seis novos docentes; produção bibliográfica quase quadruplica; primeiros pós-doutorandos"],
    ["2024", "Projeto aprovado no CNPq Universal com a Universidad de Córdoba e a UNESP; 2º lugar no concurso do CAU/BR"],
    ["2025", "Nota 3 mantida na Quadrienal, com Muito Bom no quesito Programa; 1st International Congress Landscape, Urban Space and Sustainability, em rede com o PPGARQ/UNESP e a ANAP, com comissão científica de 5 países"],
    ["2026", "Autoavaliação contínua neste portal e novos ingressantes em 2026/2"]
  ];
  return `
    <div class="leit" style="grid-template-columns:1fr"><div class="lt mostra"><span class="dim">Como o programa cresce</span><p>De 2021 a 2024 os artigos dos docentes passaram de 6 para 80 por ano, o número de mestres titulados chegou a 17 e o programa passou a ter pós-doutorandos, projeto financiado pelo CNPq e eventos próprios. Em 2025 e 2026 as bases abertas já registram ${n25 + n26} artigos, mas esse número é um piso: o OpenAlex não indexa boa parte das revistas nacionais que aparecem no Coleta. A comparação definitiva com 2024 vem com o Coleta 2025 e o Lattes de cada docente.</p></div></div>
    <div class="perfil">${[["117 → " + (n25 + n26), "artigos em 2021–2024 e em 2025–2026 até agora"], [`${17 + tit25 + tit26}`, "mestres titulados desde 2021"], ["0 → 5", "pós-doutorandos (2021 → 2025)"], [`${evs.filter(e => /organizador/.test(e.ppgau_papel)).length}`, "eventos organizados ou coorganizados desde 2023"]].map(([v, t]) => `<div><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join("")}</div>
    <div class="chleg" aria-hidden="true"><span><i class="hi"></i>Maior valor de 2021–2024</span><span><i></i>Coleta CAPES, 2021–2024</span><span><i class="pi"></i>Bases abertas, 2025–2026 (piso, ainda incompleto)</span></div>
    <div class="evgrid">
      <div class="card"><h4>Artigos dos docentes</h4><p class="sub">Por ano de publicação. ${6 + 8 + 23 + 80} no quadriênio 2021–2024.</p>${vbarras([6, 8, 23, 80, n25, n26], anos, 3, "", 4)}</div>
      <div class="card"><h4>Artigos com discentes ou egressos</h4><p class="sub">Artigos em que ao menos um autor é aluno ou ex-aluno do programa.</p>${vbarras([1, 2, 14, 25, d25, d26], anos, 3, "", 4)}</div>
      <div class="card"><h4>Mestres titulados</h4><p class="sub">Dissertações defendidas. 2025–2026 pelo repositório digital.</p>${vbarras([4, 6, 5, 2, tit25, tit26], anos, 1, "", 4)}</div>
      <div class="card"><h4>Eventos organizados ou coorganizados</h4><p class="sub">Simpósios, congressos e seminários com o PPGAU na organização.</p>${vbarras([null, null, orgAno(2023), orgAno(2024), orgAno(2025), orgAno(2026)], anos, 3, "", 4)}</div>
    </div>
    <p class="fonte">*2026 até 17/10. Barras hachuradas contam só o que está nas bases abertas (OpenAlex, site e repositório); as de 2021–2024 contam tudo o que foi declarado ao Coleta. Uma barra menor em 2025–2026 vem da diferença de fonte, não de queda da produção.</p>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:6px">Indicadores ano a ano, 2021–2026</div>
      <div class="tbl" style="margin-top:8px"><table><thead><tr><th>Indicador</th>${anos.map(a => `<th>${a}</th>`).join("")}</tr></thead><tbody>${[["Artigos dos docentes", 6, 8, 23, 80, n25, n26], ["Artigos com discentes ou egressos", 1, 2, 14, 25, d25, d26], ["Mestres titulados", 4, 6, 5, 2, tit25, tit26], ["Docentes permanentes", 11, 10, 10, 12, BASE.corpo.length, BASE.corpo.length], ["Eventos organizados ou coorganizados", "–", "–", orgAno(2023), orgAno(2024), orgAno(2025), orgAno(2026)]].map(r => `<tr><td>${esc(r[0])}</td>${r.slice(1).map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="fonte">Docentes em 2025 e 2026: corpo docente do site (13). Titulados 2025–2026: edições do repositório digital do PPGAU. Eventos: seção Impacto.</p></div>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:10px">Marcos do programa</div><ol class="marcos">${marcos.map(([a, t]) => `<li><span>${esc(a)}</span><p>${esc(t)}</p></li>`).join("")}</ol><p class="fonte">Fontes: Ficha de Avaliação da Quadrienal 2025, relatórios do Coleta, site do programa e seção Impacto.</p></div>`;
}

// Trabalhos de discentes, egressos e pós-doutorandos separados por tipo de veículo, com gráfico por ano.
const TIPO_AL = [["per", "Artigos em periódicos", "var(--c1)"], ["ev", "Trabalhos em eventos", "var(--c2)"], ["liv", "Livros e capítulos", "var(--c3)"], ["dad", "Dados de pesquisa e outros", "var(--c4)"]];
function tipoAl(v) {
  v = String(v || "");
  if (/semin[aá]rio|congress|simp[oó]sio|encontro|anais|jornada|confer[eê]ncia|proceedings|col[oó]quio|workshop/i.test(v)) return "ev";
  if (/editora|livro|cap[ií]tulo|book|e-book/i.test(v)) return "liv";
  if (/data|dataverse|zenodo|figshare|reposit/i.test(v)) return "dad";
  return "per";
}
function alunosPorTipo(al, lk) {
  const anos = [...new Set(al.map(x => x.o[0]))].sort();
  const cnt = (k, a) => al.filter(x => tipoAl(x.o[2]) === k && (!a || x.o[0] === a)).length;
  const tipos = TIPO_AL.filter(([k]) => cnt(k));
  const max = Math.max(1, ...anos.map(a => al.filter(x => x.o[0] === a).length));
  const rot = a => a === "2026" ? "2026*" : a;
  const grafico = `<div class="al-graf">${anos.map(a => { const tot = al.filter(x => x.o[0] === a).length; return `<div class="al-lin"><span class="al-ano">${rot(a)}</span><div class="al-bar" style="width:${Math.round(100 * tot / max)}%">${tipos.map(([k, t, c]) => { const v = cnt(k, a); return v ? `<span style="flex:${v};background:${c}" title="${esc(t)}, ${rot(a)}: ${v}">${v}</span>` : ""; }).join("")}</div><b>${tot}</b></div>`; }).join("")}</div>
    <div class="al-leg">${tipos.map(([k, t, c]) => `<span><i style="background:${c}"></i>${esc(t)} <b>${cnt(k)}</b></span>`).join("")}</div>`;
  const listas = tipos.map(([k, t, c]) => { const l = al.filter(x => tipoAl(x.o[2]) === k).sort((a, b) => b.o[0] - a.o[0] || String(a.o[1]).localeCompare(b.o[1])); return `<div class="al-sec"><h4 style="--tc:${c}"><i></i>${esc(t)} <span>${l.length}</span></h4><div style="overflow-x:auto"><table class="ftab"><thead><tr><th>Ano</th><th>Trabalho</th><th>Autor do programa</th><th>Com docente</th></tr></thead><tbody>${l.map(x => `<tr><td class="nw">${esc(x.o[0])}</td><td><strong>${esc(x.o[1])}</strong>${x.o[2] ? `<br><span class="small muted">${esc(x.o[2])}</span>` : ""} ${lk(x.o[3])}</td><td class="small">${esc(x.p.n)}<br><span class="muted">${esc({ "pos-doc": "pós-doc", egresso: "egresso", discente: "discente" }[x.p.c])}</span></td><td class="small">${x.o[4].length ? x.o[4].map(docLink).join("; ") : "–"}</td></tr>`).join("")}</tbody></table></div></div>`; }).join("");
  return `<p class="small muted" style="margin:0 0 10px">${al.length} trabalhos desde 2025, por ano e tipo. *2026 até a data da consulta.</p>${grafico}${listas}`;
}

// Produção bibliográfica e técnica pelos currículos Lattes (prodlattes.js), por categoria e ano.
const PL_CAT = {
  bib: [
    ["art", "Artigos em periódicos", "Artigos completos publicados em revistas científicas, com o estrato Qualis 2021–2024 quando o Lattes informa", "per"],
    ["acei", "Artigos aceitos para publicação", "Aprovados pela revista e ainda não publicados", "per"],
    ["liv", "Livros publicados ou organizados", "Livros autorais, coletâneas organizadas e anais editados em livro", "liv"],
    ["cap", "Capítulos de livros", "Capítulos em livros e coletâneas", "liv"],
    ["tc", "Trabalhos completos em anais", "Textos completos publicados nos anais de congressos e simpósios", "ana"],
    ["rex", "Resumos expandidos em anais", "Resumos expandidos publicados em anais de eventos", "ana"],
    ["res", "Resumos em anais", "Resumos simples publicados em anais de eventos", "ana"],
    ["apr", "Apresentações de trabalho", "Comunicações, palestras e conferências apresentadas", "apr"],
    ["jor", "Textos em jornais e revistas", "Textos de divulgação em jornais e revistas não científicas", "out"],
    ["out", "Prefácios e outras", "Prefácios, posfácios, apresentações de livros e outras produções", "out"]],
  tec: [
    ["ass", "Assessoria, consultoria e pareceres", "Pareceres para revistas e eventos, comitês e consultorias", "ass"],
    ["tt", "Trabalhos técnicos", "Documentos técnicos e institucionais: planos, editais, relatórios de gestão, comissões", "tt"],
    ["cur", "Cursos de curta duração ministrados", "Minicursos e cursos de extensão ministrados pelos docentes", "cur"],
    ["did", "Material didático ou instrucional", "Guias, cadernos, formulários e jornais pedagógicos", "cur"],
    ["edi", "Editoração", "Organização editorial de anais, revistas e coletâneas", "edi"],
    ["rel", "Relatórios de pesquisa", "Relatórios de projetos e de iniciação científica", "edi"],
    ["mid", "Entrevistas, mesas e programas na mídia", "Programas de rádio e TV, entrevistas e mesas-redondas", "mid"],
    ["web", "Redes sociais, sites e blogs", "Conteúdo de divulgação em sites, blogs e redes", "mid"],
    ["pat", "Patentes", "Pedidos de patente de invenção depositados", "pat"],
    ["sw", "Programas de computador", "Software e jogos desenvolvidos, sem registro", "pat"],
    ["prj", "Projetos de arquitetura", "Projetos arquitetônicos e laudos registrados como produção técnica", "pat"],
    ["dem", "Demais produções técnicas", "Outras produções técnicas declaradas no Lattes", "pat"]]
};
const PL_GRP = {
  bib: [["per", "Periódicos", "var(--c1)"], ["liv", "Livros e capítulos", "#8e5cd9"], ["ana", "Anais de eventos", "var(--c3)"], ["apr", "Apresentações", "var(--c4)"], ["out", "Outras", "#7a8494"]],
  tec: [["ass", "Pareceres e assessoria", "var(--c1)"], ["tt", "Trabalhos técnicos", "var(--c2)"], ["cur", "Cursos e material didático", "var(--c3)"], ["edi", "Editoração e relatórios", "#8e5cd9"], ["mid", "Mídia e redes", "var(--c4)"], ["pat", "Patentes, software e outras", "#7a8494"]]
};
const PL_ANOS = [2021, 2022, 2023, 2024, 2025, 2026];

function prodLattes(tipo) {
  if (typeof PLAT !== "object") return "";
  const cats = PL_CAT[tipo], grps = PL_GRP[tipo], ck = new Set(cats.map(c => c[0]));
  const di = PLAT.nomes.indexOf(st.pdoc);
  const it = PLAT.itens.filter(x => ck.has(x[0]) && (di < 0 || x[3].includes(di)));
  const grpDe = Object.fromEntries(cats.map(c => [c[0], c[3]]));
  const cor = Object.fromEntries(grps.map(g => [g[0], g[2]]));
  const n = (f) => it.filter(f).length;
  const rot = a => a === 2026 ? "2026*" : a;
  const nome = t => tipo === "bib" ? "produção bibliográfica" : "produção técnica";
  const filtro = `<label class="pl-filtro">Docente <select data-pdoc><option value="">Todos os docentes (${PLAT.nomes.length})</option>${PLAT.nomes.map(x => `<option value="${esc(x)}" ${x === st.pdoc ? "selected" : ""}>${esc(x)}${/^Lucia/.test(x) ? " (colaboradora)" : ""}</option>`).join("")}</select></label>`;
  const tiles = `<div class="pl-tiles">${cats.filter(c => n(x => x[0] === c[0])).map(c => `<div style="--tc:${cor[c[3]]}"><b>${n(x => x[0] === c[0])}</b><span>${esc(c[1])}</span></div>`).join("")}</div>`;
  const gr = grps.filter(g => n(x => grpDe[x[0]] === g[0]));
  const max = Math.max(1, ...PL_ANOS.map(a => n(x => x[1] === a)));
  const mini = (t, c, f) => { const v = PL_ANOS.map(a => n(x => x[1] === a && f(x))); return `<div class="pl-mini" style="--tc:${c}"><div class="pl-mh"><b>${esc(t)}</b><span>${v.reduce((a, b) => a + b, 0)} no total</span></div>${vbarras(v, PL_ANOS.map(rot), v.indexOf(Math.max(...v)))}</div>`; };
  const LIN = { bib: ["per", "liv", "ana", "apr"], tec: ["ass", "tt", "mid", "edi"] }[tipo];
  const serie = f => PL_ANOS.map(a => n(x => x[1] === a && f(x)));
  const linhas = graficoLinhas([["Total", serie(() => true), "c0"], ...LIN.map((g, k) => [grps.find(x => x[0] === g)[1], serie(x => grpDe[x[0]] === g), "c" + (k + 1)])], PL_ANOS.map(rot));
  const grafico = `<div class="pl-minis">${mini("Total por ano", "var(--accent)", () => true)}${gr.map(([g, t, c]) => mini(t, c, x => grpDe[x[0]] === g)).join("")}</div>`;
  const tabela = `<div style="overflow-x:auto"><table class="ftab pl-tab"><thead><tr><th>Categoria</th>${PL_ANOS.map(a => `<th>${rot(a)}</th>`).join("")}<th>Total</th></tr></thead><tbody>${cats.filter(c => n(x => x[0] === c[0])).map(c => `<tr><td><span class="pl-dot" style="background:${cor[c[3]]}"></span><strong>${esc(c[1])}</strong><br><span class="small muted">${esc(c[2])}</span></td>${PL_ANOS.map(a => { const v = n(x => x[0] === c[0] && x[1] === a); return `<td>${v || "–"}</td>`; }).join("")}<td><strong>${n(x => x[0] === c[0])}</strong></td></tr>`).join("")}<tr class="pl-tot"><td><strong>Total</strong></td>${PL_ANOS.map(a => `<td><strong>${n(x => x[1] === a) || "–"}</strong></td>`).join("")}<td><strong>${it.length}</strong></td></tr></tbody></table></div>`;
  const porDoc = di < 0 ? `<div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:8px">${tipo === "bib" ? "Produção bibliográfica" : "Produção técnica"} por docente, 2021–2026</div>${hbarras(PLAT.nomes.map((x, i) => [x, it.filter(y => y[3].includes(i)).length, "b"]).filter(r => r[1]).sort((a, b) => b[1] - a[1]))}<p class="fonte">Uma obra escrita por dois docentes conta para os dois aqui, mas só uma vez nos totais acima.</p></div>` : "";
  const docs = l => l.map(i => esc(PLAT.nomes[i].split(" ")[0])).join(", ");
  const listas = cats.filter(c => n(x => x[0] === c[0])).map((c, k) => {
    const l = it.filter(x => x[0] === c[0]).sort((a, b) => b[1] - a[1] || a[2].localeCompare(b[2]));
    const aberto = ["liv", "cap"].includes(c[0]);
    return `<details class="al-sec pl-sec" ${aberto ? "open" : ""}><summary><h4 style="--tc:${cor[c[3]]}"><i></i>${esc(c[1])} <span>${l.length}</span></h4></summary><div style="overflow-x:auto"><table class="ftab"><thead><tr><th>Ano</th><th>Referência, como está no Lattes</th>${c[0] === "art" ? "<th>Qualis</th>" : ""}<th>Docentes do programa</th></tr></thead><tbody>${l.map(x => `<tr><td class="nw">${x[1]}</td><td class="small">${esc(x[2])}</td>${c[0] === "art" ? `<td class="nw">${x[4] || "–"}</td>` : ""}<td class="small">${docs(x[3])}</td></tr>`).join("")}</tbody></table></div></details>`;
  }).join("");
  const faixa = di >= 0 ? faixaDocente(st.pdoc, [[it.length, tipo === "bib" ? "itens de produção bibliográfica" : "itens de produção técnica"], [n(x => x[1] >= 2025), "desde 2025"], [it.filter(x => x[3].length > 1).length, "em coautoria com colegas do programa"]], "data-pdoc-limpa") : faixaPrograma([[it.length, tipo === "bib" ? "itens de produção bibliográfica" : "itens de produção técnica"], [n(x => x[1] >= 2025), "desde 2025"], [it.filter(x => x[3].length > 1).length, "em coautoria entre docentes"]], "a produção");
  return `<div class="pl-top"><p class="small muted" style="margin:0">${it.length} itens de ${nome()} de 2021 a 2026${di >= 0 ? ` de ${esc(st.pdoc)}` : ", somando os 13 docentes"}. *2026 até 18/10.</p>${filtro}</div>
    ${faixa}
    ${tiles}
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:8px">${tipo === "bib" ? "Produção bibliográfica" : "Produção técnica"} por ano, 2021–2026</div><p class="small muted" style="margin:0 0 8px">Evolução ano a ano do total e dos principais tipos. Passe o mouse sobre o gráfico para ver os números de cada ano. *2026 até 18/10, ano ainda incompleto.</p>${linhas}<p class="fonte">Obras em coautoria entre docentes contam uma vez. Os demais tipos estão nos gráficos e na tabela abaixo.</p></div>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:8px">Cada tipo, ano a ano</div>${grafico}<p class="fonte">Um gráfico para cada tipo, com a quantidade de cada ano em cima da barra. A barra mais escura é o ano com mais itens.</p></div>
    <div class="card" style="margin-top:14px"><div class="dim" style="margin-bottom:8px">Quantidade por categoria e ano</div>${tabela}<p class="fonte">Categorias do Currículo Lattes, as mesmas que o Coleta CAPES usa. Fonte: ${esc(PLAT.fonte)}.</p></div>
    ${porDoc}
    <div class="card" style="margin-top:14px"><div class="dim">Listas por categoria</div><p class="small muted" style="margin:4px 0 0">Clique no nome da categoria para abrir ou fechar a lista. Livros e capítulos já vêm abertos.</p>${listas}<p class="fonte">Fonte: ${esc(PLAT.fonte)}, lidos por programa e conferidos por amostragem. Os totais podem diferir do Coleta CAPES, que conta só a produção do período em que o docente estava vinculado ao programa e passa pela validação da coordenação.</p></div>`;
}

// Faixa de destaque do docente escolhido no filtro: foto, nome, titulação e resumo do que aparece abaixo.
function faixaDocente(n, numeros, limpar) {
  const c = (typeof BASE === "object" ? BASE.corpo : []).find(x => x[0] === n) || [n, ""];
  const ini = n.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("");
  const colab = /^Lucia/.test(n) ? `<span class="fd-chip">Docente colaboradora</span>` : `<span class="fd-chip">Docente permanente</span>`;
  return `<div class="fd" role="status"><span class="fd-av" aria-hidden="true">${esc(ini)}${c[4] ? `<img src="${c[4]}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}</span>
    <div class="fd-t"><span class="fd-k">Você está vendo a produção de</span><b>${esc(n)}</b><span class="fd-s">${colab}${esc(c[1] || "")}</span></div>
    <div class="fd-n">${numeros.map(([v, r]) => `<div><b>${v}</b><span>${esc(r)}</span></div>`).join("")}</div>
    <div class="fd-a">${typeof docLink === "function" ? `<button type="button" class="fd-b" data-doc="${esc(n)}">Ver ficha completa</button>` : ""}<button type="button" class="fd-b sec" ${limpar}>Ver todos os docentes</button></div></div>`;
}
// Mesma faixa quando o filtro está em "Todos": deixa claro que os números somam o corpo docente inteiro.
function faixaPrograma(numeros, oque) {
  const corpo = typeof BASE === "object" ? BASE.corpo : [];
  return `<div class="fd fd-todos" role="status"><div class="fd-t" style="grid-column:1 / 3"><span class="fd-k">Você está vendo ${esc(oque)} de</span><b>Todos os docentes do programa</b><span class="fd-s"><span class="fd-chip">${corpo.length} docentes</span>12 permanentes e 1 colaboradora. Para ver uma pessoa, escolha o nome no filtro acima.</span></div>
    <div class="fd-n">${numeros.map(([v, r]) => `<div><b>${v}</b><span>${esc(r)}</span></div>`).join("")}</div></div>`;
}
