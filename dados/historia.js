// Linha do tempo do programa: marcos com fonte, por ano, e os números de cada ano calculados dos dados do portal.
// cat: inst (institucional), doc (corpo docente), form (formação), prod (produção), rede (eventos e redes), aval (avaliação)
const HIST_CAT = {
  inst: ["Institucional", "#02205f"],
  doc: ["Corpo docente", "#2a6fdb"],
  form: ["Formação", "#2e8b57"],
  prod: ["Produção", "#7a4fc4"],
  rede: ["Eventos e redes", "#c48a00"],
  aval: ["Avaliação", "#c62828"]
};
const HIST = [
  { ano: "2018", cat: "inst", t: "Mestrado aprovado pela CAPES", d: "Aprovado na 182ª Reunião do CTC-ES da CAPES, de 12 a 14 de dezembro de 2018. Curso presencial de 24 meses, oferecido pelo UNIVAG em associação com a PUC-Campinas, com aulas às sextas-feiras à noite e aos sábados de manhã e à tarde.", f: "Site do programa, página Histórico" },
  { ano: "2019", cat: "inst", t: "Início das atividades, em associação com a PUC-Campinas", d: "Primeira turma do mestrado, com duas linhas de pesquisa: Ambiente Construído e Sustentabilidade, e Desenvolvimento Territorial e Local.", f: "Site do programa; Coleta CAPES" },
  { ano: "2021", cat: "form", t: "Primeiras defesas de dissertação", d: "Cinco dissertações defendidas no ano, no repositório digital do UNIVAG.", f: "Repositório digital UNIVAG" },
  { ano: "2021", cat: "aval", t: "Comissão de Autoavaliação vinculada à CPA", d: "A autoavaliação do programa passa a ter comissão própria, ligada à Comissão Própria de Avaliação da instituição.", f: "Site do programa" },
  { ano: "2022", cat: "doc", t: "Saída dos docentes da PUC-Campinas (2021–2022)", d: "Início da formação de um corpo docente próprio do UNIVAG. A produção de 2022 cai com a transição.", f: "Coleta CAPES 2021–2022; Ficha de avaliação 2021–2024" },
  { ano: "2023", cat: "prod", t: "Lançamento da revista Vernácula", d: "Vernácula – Territórios Contemporâneos (ISSN 2965-6125), periódico do programa, com 4 números em 2023, 4 em 2024 e 3 em 2025 (11 até outubro de 2026).", f: "Site da revista; Coleta CAPES" },
  { ano: "2023", cat: "form", t: "Bolsas para todos os ingressantes", d: "Todos os ingressantes do ano recebem bolsa.", f: "Site do programa" },
  { ano: "2023", cat: "rede", t: "1º Simpósio Brasileiro Território, Cidade e Arquitetura", d: "Primeiro evento científico organizado pelo próprio programa. No mesmo ano, o programa foi coorganizador do 1º Seminário Nacional sobre a Educação Ambiental e a Cidade + Verde, promovido pela ANAP, e houve o 9º Seminário de Habitação de Interesse Social.", f: "Anais dos eventos; site do programa" },
  { ano: "2024", cat: "inst", t: "Fim da associação e corpo docente próprio", d: "O programa passa a funcionar só com docentes do UNIVAG. Ementas revistas e novo site do programa.", f: "Site do programa; Coleta CAPES 2024" },
  { ano: "2024", cat: "doc", t: "Entrada de seis novos docentes", d: "O programa fecha 2024 com 12 docentes permanentes. A produção bibliográfica quase quadruplica: 80 artigos no ano, contra 6 em 2021.", f: "Coleta CAPES 2024" },
  { ano: "2024", cat: "form", t: "Primeiros pós-doutorandos", d: "Quatro pós-doutorandos iniciam em 2024 e mais um em 2025.", f: "Página Pós-Doutorandos do site do programa" },
  { ano: "2024", cat: "rede", t: "Cinco eventos organizados", d: "Organizados pelo próprio programa: 2º Simpósio Território, Cidade e Arquitetura e 1º Tchá Pesquisa, voltado à graduação. Em parceria com a ANAP, como coorganizador: II Latin American Symposium City, Architecture and Sustainability, I Congresso Brasileiro Mudanças Climáticas e a Resiliência Urbana e IV Encontro para Construção de Cidades Verdes.", f: "Anais dos eventos; site do programa; Even3" },
  { ano: "2024", cat: "rede", t: "Parceria com a ANAP", d: "Parceria do PPGAU com a Associação Amigos da Natureza da Alta Paulista em ações ligadas aos Objetivos de Desenvolvimento Sustentável.", f: "Site do programa" },
  { ano: "2024", cat: "prod", t: "Pesquisa do programa na imprensa", d: "Estudo sobre as paradas de ônibus de Cuiabá (mais de 53% sem abrigo) é noticiado pelo VG Notícias.", f: "VG Notícias, 15/09/2024" },
  { ano: "2025", cat: "prod", t: "Projeto aprovado no CNPq Universal", d: "Cinza da palha do milho como material cimentício sustentável (Chamada CNPq/MCTI/FNDCT 44/2024; processo 401735/2025-7; R$ 117.240,82), com a Universidad de Córdoba e a UNESP.", f: "CNPq; Lattes dos docentes; site do programa" },
  { ano: "2025", cat: "rede", t: "1st International Congress Landscape, Urban Space and Sustainability", d: "Organizado em rede com a ANAP e o PPGARQ/UNESP, com comissão científica de cinco países. Também em parceria com a ANAP: IV Simpósio Cidade, Paisagem e a Natureza e II Congresso Mudanças Climáticas e a Resiliência Urbana. Organizado pelo próprio programa: 3º Simpósio Território, Cidade e Arquitetura.", f: "Anais dos eventos" },
  { ano: "2026", cat: "aval", t: "Resultado da Quadrienal 2025", d: "Nota 3 mantida para o período 2021–2024, com conceito Muito Bom no quesito Programa.", f: "CAPES, Avaliação Quadrienal 2025, área Arquitetura, Urbanismo e Design" },
  { ano: "2026", cat: "inst", t: "Terceira linha de pesquisa", d: "Gestão, Inovação e Tecnologias, criada pelo Edital 05/2026. Entra na Sucupira com a Coleta 2026.", f: "Edital 05/2026 do programa" },
  { ano: "2026", cat: "aval", t: "Portaria CAPES nº 246/2026", d: "Permite que mestrado nota 3 proponha doutorado; a proposta é julgada com os dados do quadriênio em curso.", f: "Diário Oficial da União, 03/06/2026" },
  { ano: "2026", cat: "aval", t: "Autoavaliação 2026 e portal PPGAU UNIVAG em dados", d: "Questionários para seis públicos, com coleta até 3 de novembro de 2026, e este portal com os dados do programa e as fontes citadas.", f: "Este portal" },
  { ano: "2026", cat: "form", t: "Maior turma de ingressantes", d: "Vinte novos mestrandos em 2026: 13 na turma de 2026/1 e 7 na de 2026/2.", f: "Lista oficial de alunos do programa" },
  { ano: "2027", cat: "aval", t: "Proposta de doutorado", d: "Preparar regimento, matriz e edital, e submeter a proposta (APCN) se os dados sustentarem nota 4.", f: "Aba Metas para o Doutorado", plano: true },
  { ano: "2028", cat: "aval", t: "Fim do quadriênio 2025–2028", d: "Meta: chegar à nota 4 na Quadrienal, com Bom em Formação.", f: "Aba Metas 2025–2028", plano: true }
];

// Números de cada ano a partir dos dados do portal (Coleta CAPES até 2024; Lattes e site depois).
function histNumeros() {
  const S = BASE.series || {}, out = {};
  const ing = [6, 5, 9, 18];
  const def = {}; (BASE.dissertacoes || []).forEach(x => def[x[0]] = (def[x[0]] || 0) + 1);
  const art = {}; if (typeof PLAT === "object") PLAT.itens.filter(x => x[0] === "art").forEach(x => art[x[1]] = (art[x[1]] || 0) + 1);
  const ingP = {}; if (typeof PESSOAS === "object") PESSOAS.filter(p => p.c === "discente" && /^20\d\d/.test(p.in)).forEach(p => { const a = p.in.slice(0, 4); ingP[a] = (ingP[a] || 0) + 1; });
  (BASE.anos || []).forEach((a, i) => { out[a] = { doc: S.permanentes ? S.permanentes.valores[i] : null, ing: ing[i], def: def[a] || 0, art: S.artigos ? S.artigos.valores[i] : null }; });
  ["2025", "2026"].forEach(a => { out[a] = { doc: null, ing: ingP[a] || null, def: def[a] || 0, art: art[+a] || art[a] || null }; });
  return out;
}

const HIST_MET = [["doc", "Docentes permanentes"], ["ing", "Ingressantes"], ["def", "Defesas"], ["art", "Artigos"]];

// Linha do tempo interativa: régua de anos (fixa no topo ao rolar), gráfico de evolução clicável,
// marcos que abrem e fecham, e o botão "Percorrer" que passa pelos anos sozinho.
function historiaCorpo() {
  const filtro = st.hcat || "", met = st.hmet || "art";
  const nums = histNumeros();
  const itens = HIST.filter(h => !filtro || h.cat === filtro);
  const anos = [...new Set(itens.map(h => h.ano))];
  const todos = []; for (let a = +HIST[0].ano; a <= +HIST[HIST.length - 1].ano; a++) todos.push(String(a));
  const chip = c => `<span class="hl-cat" style="--hc:${HIST_CAT[c][1]}">${esc(HIST_CAT[c][0])}</span>`;
  const n = nums => !nums ? "" : `<div class="hl-num">${HIST_MET.filter(([k]) => nums[k] != null).map(([k, r]) => `<span><b>${nums[k]}</b>${r.toLowerCase()}</span>`).join("")}</div>`;
  const regua = todos.map(a => {
    const doAno = itens.filter(h => h.ano === a), plano = doAno.length && doAno.every(h => h.plano);
    return `<button type="button" class="hl-r${doAno.length ? "" : " vazio"}${plano ? " plano" : ""}" data-hano="${a}" ${doAno.length ? "" : "disabled"} aria-label="${a}: ${doAno.length} marco${doAno.length === 1 ? "" : "s"}"><span class="hl-ry">${a}</span><span class="hl-rd">${doAno.map(h => `<i style="--hc:${HIST_CAT[h.cat][1]}"></i>`).join("")}</span></button>`;
  }).join("");
  const serie = Object.keys(nums).sort().map(a => [a, nums[a][met]]).filter(x => x[1] != null);
  const mx = Math.max(1, ...serie.map(x => x[1]));
  const graf = `<div class="hl-graf card">
      <div class="hl-gh"><span class="dim">Evolução por ano</span><div class="hl-gm" role="group" aria-label="Indicador">${HIST_MET.map(([k, t]) => `<button type="button" data-hmet="${k}" aria-pressed="${k === met}">${t}</button>`).join("")}</div></div>
      <div class="hl-bars">${serie.map(([a, v]) => `<button type="button" class="hl-b" data-hano="${a}" title="${a}: ${v} ${esc(HIST_MET.find(m => m[0] === met)[1].toLowerCase())}"><span class="hl-bv">${v}</span><span class="hl-bb" style="height:${Math.max(3, Math.round(v / mx * 100))}%"></span><span class="hl-by">${a}${a === "2026" && met === "art" ? "*" : ""}</span></button>`).join("")}</div>
      <p class="small muted" style="margin:6px 0 0">Clique em um ano, no gráfico ou na régua, para ir aos marcos daquele ano.</p>
    </div>`;
  return `
    <div class="hl-top">
      <div class="hl-resumo">${[["2018", "recomendação pela CAPES"], ["2019", "primeira turma"], [String((BASE.dissertacoes || []).length), "dissertações defendidas desde 2021"], ["2024", "corpo docente próprio"], ["3", "linhas de pesquisa em 2026"]].map(([v, r]) => `<div><b>${v}</b><span>${r}</span></div>`).join("")}</div>
      ${graf}
      <div class="hl-filtro" role="group" aria-label="Filtrar por tema"><button data-hcat="" aria-pressed="${!filtro}">Todos</button>${Object.entries(HIST_CAT).map(([k, [t, c]]) => `<button data-hcat="${k}" aria-pressed="${filtro === k}" style="--hc:${c}"><i></i>${t}</button>`).join("")}</div>
    </div>
    <div class="hl-regua-w"><div class="hl-ctl"><button type="button" class="hl-cb" data-hpasso="-1" aria-label="Ano anterior">‹</button><button type="button" class="hl-cb hl-play" data-hplay aria-pressed="false">▶ Percorrer</button><button type="button" class="hl-cb" data-hpasso="1" aria-label="Próximo ano">›</button><button type="button" class="hl-cb hl-abre" data-habre>Abrir todos</button></div><div class="hl-regua">${regua}</div></div>
    <ol class="hl">${anos.map(a => {
      const doAno = itens.filter(h => h.ano === a), plano = doAno.every(h => h.plano);
      return `<li class="hl-ano${plano ? " plano" : ""}" id="hl-y-${a}" data-ano="${a}"><div class="hl-marca"><span class="hl-y">${esc(a)}</span>${plano ? `<span class="hl-pl">planejado</span>` : ""}</div>
        <div class="hl-it">${n(nums[a])}${doAno.map(h => `<details class="hl-card" style="--hc:${HIST_CAT[h.cat][1]}"><summary>${chip(h.cat)}<h4>${esc(h.t)}</h4></summary><p>${esc(h.d)}</p><span class="fonte">Fonte: ${esc(h.f)}</span></details>`).join("")}</div></li>`;
    }).join("")}</ol>
    <p class="fonte">Números por ano: docentes permanentes, ingressantes e artigos de 2021 a 2024 pela Coleta CAPES; defesas pelo repositório digital do UNIVAG; ingressantes de 2025 e 2026 pela lista oficial de alunos do programa; artigos de 2025 e 2026 pelos currículos Lattes de 18/10/2026 (*2026 até outubro). Os marcos de 2027 e 2028 são metas do planejamento, não fatos.</p>`;
}

// Liga a interação depois que a seção é desenhada (chamada por renderEmDados).
function ligarHistoria($v) {
  const ol = $v.querySelector("ol.hl"); if (!ol) return;
  const anos = [...ol.querySelectorAll(".hl-ano")].map(li => li.dataset.ano);
  const marca = (a, rolar, abrir) => {
    st.hano = a;
    $v.querySelectorAll("[data-hano]").forEach(b => b.classList.toggle("on", b.dataset.hano === a));
    ol.querySelectorAll(".hl-ano").forEach(li => li.classList.toggle("ativo", li.dataset.ano === a));
    const li = $v.querySelector("#hl-y-" + a); if (!li) return;
    if (abrir) li.querySelectorAll("details").forEach(d => d.open = true);
    if (rolar) { const r = $v.querySelector(".hl-regua-w"); const off = (r ? r.offsetHeight : 0) + 16; window.scrollTo({ top: li.getBoundingClientRect().top + window.scrollY - off, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
    const rb = $v.querySelector(`.hl-r[data-hano="${a}"]`), rg = rb && rb.parentElement; if (rg) rg.scrollLeft = rb.offsetLeft - rg.offsetLeft - rg.clientWidth / 2 + rb.offsetWidth / 2;
  };
  let timer = null;
  const play = $v.querySelector("[data-hplay]");
  const para = () => { clearInterval(timer); timer = null; if (play) { play.textContent = "▶ Percorrer"; play.setAttribute("aria-pressed", "false"); } };
  $v.querySelectorAll("[data-hano]").forEach(b => b.onclick = () => { para(); if (anos.includes(b.dataset.hano)) marca(b.dataset.hano, true, true); });
  $v.querySelectorAll("[data-hpasso]").forEach(b => b.onclick = () => { para(); const i = anos.indexOf(st.hano), d = +b.dataset.hpasso; const j = i < 0 ? (d > 0 ? 0 : anos.length - 1) : Math.min(anos.length - 1, Math.max(0, i + d)); marca(anos[j], true, true); });
  if (play) play.onclick = () => {
    if (timer) return para();
    play.textContent = "❚❚ Pausar"; play.setAttribute("aria-pressed", "true");
    let i = Math.max(0, anos.indexOf(st.hano)); if (i >= anos.length - 1) i = 0;
    marca(anos[i], true, true);
    timer = setInterval(() => { i++; if (i >= anos.length || !document.body.contains(ol)) return para(); marca(anos[i], true, true); }, 3200);
  };
  const ab = $v.querySelector("[data-habre]");
  if (ab) ab.onclick = () => { const abrir = ab.textContent === "Abrir todos"; ol.querySelectorAll("details").forEach(d => d.open = abrir); ab.textContent = abrir ? "Fechar todos" : "Abrir todos"; };
  $v.querySelectorAll("[data-hmet]").forEach(b => b.onclick = () => { para(); st.hmet = b.dataset.hmet; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  // Ao rolar, a régua acompanha o ano que está na tela; cada ano aparece com uma leve animação.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); if (!timer) { const a = e.target.dataset.ano; $v.querySelectorAll(".hl-r").forEach(b => b.classList.toggle("on", b.dataset.ano === a || b.dataset.hano === a)); $v.querySelectorAll(".hl-b").forEach(b => b.classList.toggle("on", b.dataset.hano === a)); } } }), { rootMargin: "-35% 0px -55% 0px" });
    ol.querySelectorAll(".hl-ano").forEach(li => io.observe(li));
    const io2 = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("vis")), { rootMargin: "0px 0px -8% 0px" });
    ol.querySelectorAll(".hl-ano").forEach(li => io2.observe(li));
  } else ol.querySelectorAll(".hl-ano").forEach(li => li.classList.add("vis"));
  if (st.hano && anos.includes(st.hano)) marca(st.hano, false, true);
}
