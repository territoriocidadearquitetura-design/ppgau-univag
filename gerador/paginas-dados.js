// Páginas "Ingresso e titulação" (titulacao.html) e "Impacto na sociedade" (impacto.html), reproduzidas do portal
// PPGAU em dados (seções formacao e impacto) com os mesmos dados (BASE, PROJ, IMPACTO, EVENTOS, REDE), para o site
// não depender do portal depois do fim das coletas. Nada aqui lê dados/banco nem a coleta da autoavaliação.
module.exports = ({ BASE, PROJ, IMPACTO, EVENTOS, REDE, PESSOAS, BANCAS, esc, ext, nomeLink, titulo, atualizado }) => {
  const anos = BASE.anos, ser = BASE.series;
  const leit = (L, rot = ["O que os dados mostram", "O que a CAPES avalia", "Ponto de atenção"]) => `<div class="dd-leit">${L.map((t, i) => `<div class="card dd-l dd-l${i}"><span class="dd-rot">${rot[i]}</span><p>${esc(t)}</p></div>`).join("")}</div>`;
  const kpis = L => `<div class="kpis${L.length > 4 ? " k3" : ""}">${L.map(([v, t, s], i) => `<div class="kpi${i ? "" : " gold"}"><b>${esc(v)}</b><span>${esc(t)}</span>${s ? `<small>${esc(s)}</small>` : ""}</div>`).join("")}</div>`;
  // Colunas simples, a última (ano mais recente) em destaque.
  const colunas = (k, tit) => { const s = ser[k], mx = Math.max(...s.valores), suf = s.sufixo || ""; return `<div class="card dd-ch"><h3>${esc(tit)}</h3>
<div class="dd-cols" role="img" aria-label="${esc(tit)}: ${s.valores.map((v, i) => `${anos[i]}, ${v}${suf}`).join("; ")}">${s.valores.map((v, i) => `<div class="dd-col${i === s.valores.length - 1 ? " ult" : ""}"><b>${v}${suf}</b><i style="height:${Math.max(4, v / mx * 100)}%"></i><span>${anos[i]}</span></div>`).join("")}</div>
<p class="meta">${esc(s.nota)}</p></div>`; };
  const hbar = (L, mx = Math.max(...L.map(x => x[1]))) => `<div class="dd-hb">${L.map(([r, n, c]) => `<div><span>${esc(r)}</span><i><em class="${c || ""}" style="width:${n / mx * 100}%"></em></i><b>${n}</b></div>`).join("")}</div>`;
  const P = [];

  // ---------- Ingresso e titulação ----------
  // 2021–2024: Coleta CAPES (BASE). 2025–2026: cadastro de discentes e egressos do site (PESSOAS), bancas divulgadas
  // (BANCAS) e editais do programa. As defesas já realizadas que estão só nas bancas entram na lista de dissertações.
  {
    const nm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/);
    const mesma = (a, b) => { const x = nm(a), y = nm(b); return x[0] === y[0] && x[x.length - 1] === y[y.length - 1]; };
    const hoje = Date.now();
    const bk = BANCAS.filter(b => b.ini.getTime() < hoje);
    const extra = bk.filter(b => !BASE.dissertacoes.some(d => mesma(d[2], b.al))).map(b => { const c = new Date(b.ini.getTime() - 4 * 36e5); return [String(c.getUTCFullYear()), String(c.getUTCDate()).padStart(2, "0") + "/" + String(c.getUTCMonth() + 1).padStart(2, "0"), b.al, b.or + (b.co ? ` (coorientação de ${b.co})` : ""), b.ti.toUpperCase(), ""]; });
    const diss = [...BASE.dissertacoes, ...extra];
    const anosD = [...new Set(diss.map(d => d[0]))].sort().reverse();
    const ANOS = [...anos, "2025", "2026"], ANO_ATUAL = String(new Date().getFullYear());
    const tit = a => diss.filter(d => d[0] === a).length;
    // Data da defesa: a da lista, senão a da banca; sem data conhecida, meio do ano (estimativa).
    const dataDef = d => { if (d[1]) return +d[1].split("/")[1]; const b = BANCAS.find(b => mesma(b.al, d[2])); return b ? new Date(b.ini.getTime() - 4 * 36e5).getUTCMonth() + 1 : 0; };
    const PES = PESSOAS.filter(p => p.c !== "pos-doc");
    const tempo = a => { const L = diss.filter(d => d[0] === a).map(d => { const p = PES.find(p => mesma(p.n, d[2])); if (!p || !p.in) return null; const [ia, is] = p.in.split("/"), m = dataDef(d); return { m: (+a - +ia) * 12 + ((m || 6) - (is === "2" ? 8 : 3)), est: !m }; }).filter(Boolean); return L.length ? { v: L.reduce((s, x) => s + x.m, 0) / L.length, n: L.length, est: L.filter(x => x.est).length } : null; };
    const defendeu = p => { const d = diss.find(d => mesma(d[2], p.n)); return d ? +d[0] : p.c === "egresso" ? +p.de : 0; };
    const ingAno = a => PES.filter(p => p.in && p.in.startsWith(a)).length;
    const matAno = a => PES.filter(p => p.in && +p.in.slice(0, 4) <= +a && (!defendeu(p) || defendeu(p) >= +a)).length;
    const t25 = tempo("2025"), t26 = tempo("2026");
    const S = {
      matriculados: { v: [...ser.matriculados.valores, matAno("2025"), matAno("2026")], nota: `Ingressantes: 6, 5, 9 e 18 no quadriênio (Coleta); ${ingAno("2025")} em 2025 e ${ingAno("2026")} em 2026 (cadastro do programa).` },
      titulados: { v: ANOS.map((a, i) => i < 4 ? ser.titulados.valores[i] : tit(a)), nota: `17 mestres no quadriênio 2021–2024; ${tit("2025")} em 2025 e ${tit("2026")} em 2026, até a data desta versão.` },
      tempo: { v: [...ser.tempo.valores, Math.round(t25.v), Math.round(t26.v)], nota: `Meses do ingresso à defesa, em média: 25,4, 28,8, 34,3 e 38,4 (Coleta); ${t25.v.toFixed(1).replace(".", ",")} em 2025 e ${t26.v.toFixed(1).replace(".", ",")} em 2026, calculados pelo semestre de ingresso e pela data da banca (estimada no meio do ano quando não divulgada). O prazo regular é de 24 meses.` },
      bolsas: { v: ser.bolsas.valores, nota: ser.bolsas.nota + " 2025 e 2026 ainda não consolidados no Coleta." },
      ic: { v: ser.ic.valores, nota: ser.ic.nota + " 2025 e 2026 ainda não consolidados no Coleta." }
    };
    const col = (k, t) => { const s = S[k], A = ANOS.slice(0, s.v.length), mx = Math.max(...s.v); return `<div class="card dd-ch"><h3>${esc(t)}</h3>
<div class="dd-cols" role="img" aria-label="${esc(t)}: ${s.v.map((v, i) => `${A[i]}, ${v}`).join("; ")}">${s.v.map((v, i) => `<div class="dd-col${i >= 4 ? " novo" : ""}${A[i] === ANO_ATUAL ? " parc" : ""}"><b>${v}</b><i style="height:${Math.max(4, v / mx * 100)}%"></i><span>${A[i]}${A[i] === ANO_ATUAL ? "*" : ""}</span></div>`).join("")}</div>
<p class="meta">${esc(s.nota)}</p></div>`; };
    // Defesas por orientador(a) principal, 2021 até hoje.
    const ori = {}; diss.forEach(d => { const o = d[3].replace(/\s*\(.*$/, ""); ori[o] = (ori[o] || 0) + 1; });
    const SAIU = /Manoel|Soukef|Metello|Maíra|Rodrigo Nogueira/;
    const oriL = Object.entries(ori).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
    const atuais = oriL.filter(([o]) => !SAIU.test(o)), antigos = oriL.filter(([o]) => SAIU.test(o));
    const barras = [...atuais.map(([o, n]) => [o, n]), [`Docentes que deixaram o programa (${antigos.length})`, antigos.reduce((s, x) => s + x[1], 0), "cz"]];
    const sel = [["2025/1", "Edital 2025/1", "10", ""], ["2025/2", "Editais 001 e 002/2025", "5 remanescentes no edital 002", "12"], ["2026/1", "Editais 003 e 004/2025", "3 remanescentes no edital 004", "7 no edital 003"], ["2026/2", "Editais 2026/2 e 005/2026", "10 + 5 remanescentes", "5 no edital 2026/2"]];
    const nTot = diss.length, n2526 = tit("2025") + tit("2026");
    P.push({
      arq: "titulacao.html", titulo: "Ingresso e titulação", desc: "Processo seletivo, matrículas, bolsas, tempo até o título e dissertações defendidas no mestrado do PPGAU UNIVAG, de 2021 a 2026.",
      hero: { crumb: true, kpis: true, eyebrow: "Formação · 2021 a 2026", h1: "Ingresso e titulação dos mestres", p: "Do processo seletivo à defesa: vagas, matrículas, bolsas, tempo até o título e dissertações defendidas, de 2021 a 2026." },
      corpo: `
${kpis([[String(38 + ingAno("2025") + ingAno("2026")), "ingressantes de 2021 a 2026", `38 no quadriênio 2021–2024, ${ingAno("2025")} em 2025 e ${ingAno("2026")} em 2026`], [String(nTot), "mestres titulados de 2021 a 2026", `17 no quadriênio, ${tit("2025")} em 2025 e ${tit("2026")} em 2026 até agora`], [String(matAno("2026")), "discentes no programa em 2026", `eram 30 em 2024 e ${matAno("2025")} em 2025`], [t25.v.toFixed(0) + " meses", "tempo médio até a defesa em 2025", "eram 38 meses em 2024; o prazo regular é de 24"]])}
${leit([`De 2021 a 2026 o programa titulou ${nTot} mestres, ${n2526} deles em 2025 e 2026. A entrada cresceu: ${ingAno("2026")} ingressantes em 2026, contra 6 em 2021, e o número de discentes no programa passou de 15 para ${matAno("2026")}.`, BASE.leitura.formacao[1], `Depois de subir até 38 meses em 2024, o tempo médio até a defesa caiu para cerca de ${t25.v.toFixed(0)} meses em 2025, ainda acima dos 24 meses previstos. Com ${matAno("2026")} discentes em curso, o fluxo de qualificações e defesas precisa de acompanhamento.`])}
<section class="blk" id="selecao"><h2>Processo seletivo</h2>
<div class="tbl-wrap"><table class="tbl dd-tbl"><thead><tr><th>Ano</th><th class="num">Vagas</th><th class="num">Inscritos</th><th class="num">Aprovados</th><th class="num">Inscritos por vaga</th></tr></thead><tbody>
${BASE.selecao.map((x, i) => `<tr><td><b>${anos[i]}</b></td><td class="num" data-l="Vagas">${x[0]}</td><td class="num" data-l="Inscritos">${x[1]}</td><td class="num" data-l="Aprovados">${x[2]}</td><td class="num" data-l="Inscritos por vaga">${(x[1] / x[0]).toFixed(1).replace(".", ",")}</td></tr>`).join("")}
</tbody></table></div>
<p class="meta">2021–2024: proposta do programa no Coleta CAPES. A procura triplicou de 2021 a 2024; em 2021 houve menos inscritos que vagas.</p>
<h3 class="ip-h3">2025 e 2026, por semestre</h3>
<div class="tbl-wrap"><table class="tbl dd-tbl"><thead><tr><th>Ingresso</th><th>Editais</th><th>Vagas</th><th class="num">Aprovados nas listas publicadas</th><th class="num">Ingressantes no cadastro</th></tr></thead><tbody>
${sel.map(([s, e, v, ap]) => `<tr><td><b>${s}</b></td><td data-l="Editais">${esc(e)}</td><td data-l="Vagas">${esc(v)}</td><td class="num" data-l="Aprovados">${esc(ap || "lista não publicada")}</td><td class="num" data-l="Ingressantes">${PES.filter(p => p.in === s).length}</td></tr>`).join("")}
</tbody></table></div>
<p class="meta">Editais e listas de aprovados publicados pelo programa (ver <a href="documentos.html">Documentos</a>) e cadastro de discentes do site, outubro de 2026. O número de inscritos de 2025 e 2026 ainda não foi informado ao Coleta. Nem todo aprovado se matricula, e o cadastro registra o semestre de matrícula.</p></section>
<section class="blk" id="fluxo"><h2>Matrículas, titulações e bolsas</h2>
<p class="meta">Colunas azul-claras: Coleta CAPES (2021–2024). Colunas azul-escuras: cadastro do programa e bancas divulgadas (2025–2026). *2026 até outubro, ano incompleto.</p>
<div class="dd-grid">${col("matriculados", "Discentes no programa")}${col("titulados", "Mestres titulados")}${col("tempo", "Tempo médio até a defesa (meses)")}${col("bolsas", "Bolsistas CAPES")}${col("ic", "Iniciação científica nos projetos")}
<div class="card dd-ch"><h3>Defesas por orientador(a), 2021–2026</h3>${hbar(barras)}
<p class="meta">Orientação principal. Em cinza, docentes que já deixaram o programa (${esc(antigos.map(([o]) => o).join("; "))}).</p></div></div></section>
<section class="blk" id="dissertacoes"><h2>Dissertações defendidas, 2021–2026</h2>
<div class="dd-anos">${anosD.map(a => { const L = diss.filter(d => d[0] === a); return `<details class="card dd-ano"${a === anosD[0] ? " open" : ""}><summary><b>${a}</b><span>${L.length} ${L.length === 1 ? "defesa" : "defesas"}</span></summary><ol>${L.map(d => `<li><strong>${d[5] ? ext(d[5], esc(titulo(d[4])) + " ↗") : esc(titulo(d[4]))}</strong><span class="meta">${esc(d[2])} · orientação de ${nomeLink(d[3].replace(/\s*\(.*$/, ""))}${/\(/.test(d[3]) ? " " + esc(d[3].replace(/^[^(]*/, "")) : ""} · defesa ${d[1] ? `em ${esc(d[1])}/${a}` : `em ${a}`}</span></li>`).join("")}</ol></details>`; }).join("")}</div>
<p class="meta">2021–2024: Coleta CAPES, módulo Trabalhos de Conclusão. Desde 2025: site do programa e bancas divulgadas em <a href="bancas.html">Bancas e defesas</a>. Os títulos com link levam ao texto no Repositório Digital do UNIVAG. A comissão de área pediu que 4 dissertações sejam destacadas com justificativa e que o programa informe prêmios e distinções.</p></section>
<p class="meta">Dados atualizados em ${esc(atualizado("formacao"))}. Veja também <a href="bancas.html">Bancas e defesas</a>, <a href="egressos.html">Egressos</a> e <a href="ingresso.html">Ingresso</a>.</p>`
    });
  }

  // ---------- Impacto na sociedade ----------
  {
    const I = IMPACTO.impacto, PJ = IMPACTO.projetos, outros = I.filter(x => x.tipo !== "evento");
    const DIM = { "prêmio": ["Reconhecimento", "3.1"], "mídia": ["Popularização e mídia", "3.1"], "financiamento": ["Financiamento e redes", "3.2"], "evento": ["Eventos e difusão", "3.1"], "extensão/comunidade": ["Impacto social e educacional", "3.3"], "parceria": ["Parcerias", "3.2"] };
    const links = l => (l || []).filter(u => /^https?:/.test(u)).slice(0, 2).map((u, i) => ext(u, (i ? "Mais" : "Ver") + " ↗")).join(" · ");
    const docentes = [...new Set(PROJ.flatMap(p => p.docs))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const grupo = p => ["pesquisa", "extensão"].includes(p.t) ? p.t : "outros";
    const alunos = p => { const n = re => +((String(p.al || "").match(re) || [])[1] || 0); return { g: n(/Gradua[çc][ãa]o: \((\d+)\)/), m: n(/Mestrado acad[êe]mico: \((\d+)\)/), d: n(/Doutorado: \((\d+)\)/) }; };
    const alTxt = p => { const a = alunos(p), t = a.g + a.m + a.d; return t ? [t, "alunos: " + [a.g && `graduação ${a.g}`, a.m && `mestrado ${a.m}`, a.d && `doutorado ${a.d}`].filter(Boolean).join("; ")] : ["–", "sem alunos registrados"]; };
    const nomeP = n => docentes.includes(n) ? `<strong>${nomeLink(n)}</strong>` : esc(n);
    const ordem = (a, b) => (b.sit === "Em andamento") - (a.sit === "Em andamento") || b.ini - a.ini || a.tit.localeCompare(b.tit, "pt-BR");
    const projs = [...PROJ].sort(ordem);
    const cnt = f => PROJ.filter(f).length;
    const TIPO = { pesquisa: "Pesquisa", "extensão": "Extensão", ensino: "Ensino", outro: "Outro projeto" };
    const card = p => { const a = alTxt(p), integ = 1 + (p.eq || []).length; return `<article class="card ip-pj" data-tipo="${grupo(p)}" data-sit="${esc(p.sit)}" data-docs="${esc(p.docs.join("|"))}" data-cint="${docentes.includes(p.coord) ? 1 : 0}">
<div class="ip-pj-h"><span class="ip-t ${grupo(p) === "outros" ? "ou" : grupo(p) === "extensão" ? "ex" : "pe"}">${esc(TIPO[p.t] || p.t)}</span><span class="ip-s${p.sit === "Em andamento" ? " and" : ""}">${esc(p.sit)}</span>${p.coord && !docentes.includes(p.coord) ? `<span class="ip-s ext">Coordenação externa</span>` : ""}<span class="ip-per">${p.ini}–${p.fim === "Atual" ? "atual" : esc(p.fim)}</span></div>
<h3>${esc(p.tit)}</h3>
<div class="ip-num"><div><b>${p.docs.length}</b><span>${p.docs.length === 1 ? "docente do programa" : "docentes do programa"}</span></div><div><b>${integ}</b><span>integrantes</span></div><div><b>${a[0]}</b><span>${esc(a[1])}</span></div></div>
<dl class="ip-dl"><div><dt>Coordenação</dt><dd>${p.coord ? nomeP(p.coord) : "não informada"}</dd></div>${(p.eq || []).length ? `<div><dt>Equipe</dt><dd>${p.eq.map(nomeP).join("; ")}</dd></div>` : ""}<div><dt>Financiamento</dt><dd>${esc(p.fin || "não informado")}</dd></div></dl>
${p.desc ? `<details class="ip-desc"><summary>Ler a descrição</summary><p>${esc(p.desc)}</p></details>` : ""}
<p class="meta">Fonte: currículo Lattes de ${esc(p.docs.map(n => n.split(" ")[0]).join(", "))}.</p></article>`; };
    const evOrd = [...EVENTOS].sort((a, b) => String(b.ano).localeCompare(String(a.ano)));
    const PAPEL = { organizador: ["ok", "Organizador"], coorganizador: ["co", "Coorganizador"], participante: ["pa", "Participante"] };
    const c = REDE.congresso, maxP = Math.max(...c.paises.map(x => x[1]));
    const chips = l => `<div class="ip-chips">${l.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div>`;
    const JS = `(()=>{const L=[...document.querySelectorAll(".ip-pj")];if(!L.length)return;const st={t:"",s:"",d:""};
const bt=[...document.querySelectorAll("[data-ip-t]")],ss=document.getElementById("ip-sit"),sd=document.getElementById("ip-doc"),n=document.getElementById("ip-n"),pv=document.getElementById("ip-ver");
const f=()=>{let k=0;const base=L.filter(e=>!st.d||e.dataset.docs.split("|").includes(st.d));L.forEach(e=>{const ok=(!st.t||e.dataset.tipo===st.t)&&(!st.s||e.dataset.sit===st.s)&&(!st.d||e.dataset.docs.split("|").includes(st.d));e.hidden=!ok;if(ok)k++});
bt.forEach(b=>{const v=b.dataset.ipT;b.setAttribute("aria-pressed",String(st.t===v));const c=b.querySelector("i");if(c)c.textContent=base.filter(e=>!v||e.dataset.tipo===v).length});
n.textContent=k+(k===1?" projeto":" projetos")+" na seleção, em andamento primeiro.";
const q=s=>base.filter(s).length;pv.querySelector("h3").textContent=st.d||"Todos os docentes do programa";pv.querySelector(".ip-ver-s").textContent=st.d?"Projetos em que participa, como coordenação ou equipe.":"${docentes.length} docentes. Para ver uma pessoa, escolha o nome no filtro acima.";
const v=pv.querySelectorAll("b");v[0].textContent=base.length;v[1].textContent=q(e=>e.dataset.cint==="1");v[2].textContent=q(e=>e.dataset.sit==="Em andamento")};
bt.forEach(b=>b.addEventListener("click",()=>{st.t=b.dataset.ipT;f()}));ss.addEventListener("change",()=>{st.s=ss.value;f()});sd.addEventListener("change",()=>{st.d=sd.value;f()});f();})();`;
    P.push({
      arq: "impacto.html", titulo: "Impacto na sociedade", desc: "Projetos de pesquisa e extensão, prêmios, mídia, eventos e parcerias que mostram o efeito do PPGAU UNIVAG fora da universidade.",
      hero: { crumb: true, kpis: true, eyebrow: "Quesito 3 da avaliação CAPES", h1: "Impacto na sociedade", p: "Projetos de pesquisa e extensão, prêmios, mídia, eventos e parcerias que mostram o efeito do programa fora da universidade." },
      js: JS,
      corpo: `
${kpis([[String(PROJ.length), "projetos dos docentes", `desde 2021, ${cnt(p => p.sit === "Em andamento")} em andamento`], [String(cnt(p => p.fin)), "projetos com financiamento", "CNPq, FAPEMAT e outros"], ["2", "parceiros internacionais e nacionais", "Universidad de Córdoba (Espanha) e UNESP"], ["1", "prêmio nacional", "2º lugar no concurso de artigos do CAU/BR"], [String(EVENTOS.filter(e => /organizador/.test(e.ppgau_papel)).length), "eventos organizados ou coorganizados", "em rede com a ANAP, a PUC-Campinas, a UNESP e universidades de 5 países"], ["1", "projeto com escolas", "jornal ECO LEGAL para crianças de 6 a 10 anos"]])}
<div class="dd-leit um"><div class="card dd-l dd-l1"><span class="dd-rot">Por que importa</span><p>O Quesito 3, Impacto na sociedade, recebeu conceito Regular na Quadrienal 2025. A comissão escreveu que o programa "não apresenta adequadamente" o impacto da produção e não indicou prêmios, mídia, palestras nem incorporação do conhecimento pela sociedade. Esta página reúne essas evidências para o relatório de 2025–2028.</p></div></div>
<ul class="sub"><li><a href="#destaques">Projetos em destaque</a></li><li><a href="#projetos">Todos os projetos</a></li><li><a href="#evidencias">Evidências de impacto</a></li><li><a href="#redes">Parcerias e redes</a></li><li><a href="#eventos">Eventos e difusão</a></li></ul>
<section class="blk" id="destaques"><h2>Projetos em destaque</h2>
<div class="ip-dest">${PJ.map(p => `<article class="card ip-d"><span class="ip-t ${p.tipo === "pesquisa" ? "pe" : "ex"}">${p.tipo === "pesquisa" ? "Pesquisa" : "Extensão"}</span><h3>${esc(p.titulo)}</h3><p>${esc(p.resumo)}</p>
${(p.numeros || []).length ? `<div class="ip-num q">${p.numeros.map(([v, t]) => `<div><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : ""}
${p.site ? `<p>${ext(p.site, esc(p.siteTxt || "Acessar o portal " + p.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")) + " ↗").replace("<a ", '<a class="btn" ')}</p>` : ""}
<dl class="ip-dl"><div><dt>Coordenação</dt><dd>${nomeLink(p.coordenador)}</dd></div><div><dt>Equipe</dt><dd>${esc((p.membros || []).join("; ") || "não informada")}</dd></div><div><dt>Financiamento</dt><dd>${esc(p.financiamento)}</dd></div>${(p.parceiros || []).length ? `<div><dt>Parceiros</dt><dd>${esc(p.parceiros.join("; "))}</dd></div>` : ""}<div><dt>Grupo e situação</dt><dd>${esc(p.grupo_pesquisa || "não informado")} · ${esc(p.situacao.replace(" (provavelmente em andamento; inferência)", ", provavelmente em andamento"))}</dd></div></dl>
<p class="meta">${links(p.links)} · Fonte: ${esc(p.fonteTxt || "site do programa.")}</p></article>`).join("")}</div></section>
<section class="blk" id="projetos"><h2>Todos os projetos dos docentes, 2021–2026</h2>
<p>Projetos registrados nos currículos Lattes dos ${docentes.length} docentes, ativos em algum momento desde 2021. Um projeto com vários docentes aparece uma vez. Nomes em negrito são docentes do programa. "Coordenação externa" indica projeto de outra instituição em que o docente participa.</p>
<div class="pj-res ip-res">${[[PROJ.length, "projetos desde 2021"], [cnt(p => p.sit === "Em andamento"), "em andamento"], [cnt(p => p.t === "pesquisa"), "de pesquisa"], [cnt(p => p.t === "extensão"), "de extensão"], [cnt(p => docentes.includes(p.coord)), "coordenados por docentes do programa"], [cnt(p => p.fin), "com financiamento"], [cnt(p => p.al), "com alunos envolvidos"]].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("")}</div>
<div class="ip-filtros"><div class="ip-bts" role="group" aria-label="Tipo de projeto">${[["", "Todos"], ["pesquisa", "Pesquisa"], ["extensão", "Extensão"], ["outros", "Ensino e outros"]].map(([v, l]) => `<button type="button" data-ip-t="${v}" aria-pressed="${!v}">${l} <i></i></button>`).join("")}</div>
<select id="ip-sit" aria-label="Situação"><option value="">Todas as situações</option><option>Em andamento</option><option>Concluído</option><option>Desativado</option></select>
<select id="ip-doc" aria-label="Docente"><option value="">Todos os docentes</option>${docentes.map(d => `<option>${esc(d)}</option>`).join("")}</select></div>
<p class="meta" id="ip-n" aria-live="polite"></p>
<div class="ip-ver" id="ip-ver"><span class="ip-ver-r">Você está vendo os projetos de</span><h3>Todos os docentes do programa</h3><p class="ip-ver-s"></p><div class="ip-ver-n"><div><b></b><span>projetos desde 2021</span></div><div><b></b><span>coordenados por docentes do programa</span></div><div><b></b><span>em andamento</span></div></div></div>
<div class="ip-lista">${projs.map(card).join("")}</div></section>
<section class="blk" id="evidencias"><h2>Evidências de impacto</h2>
<div class="ip-ev">${outros.map(x => `<article class="card ip-e"><div class="ip-e-h"><span class="tag gold">${esc(DIM[x.tipo] ? DIM[x.tipo][0] : x.tipo)}</span><span class="meta">item ${esc(DIM[x.tipo] ? DIM[x.tipo][1] : "3")} · ${esc(x.ano || "ano não informado")}</span></div>
<h3>${esc(x.titulo)}</h3><p>${esc(x.descricao)}</p>${(x.pessoas || []).filter(Boolean).length ? `<p class="meta">${esc(x.pessoas.join("; "))}</p>` : ""}<p class="meta">${links(x.links)}</p></article>`).join("")}</div></section>
<section class="blk" id="redes"><h2>Parcerias e redes</h2>
<p>Os eventos do PPGAU são feitos em rede, com outros programas de pós-graduação, universidades e associações. A ficha 2025–2028 valoriza essa inserção (itens 3.1 e 3.3): ela mostra visibilidade nacional e internacional e cooperação entre programas.</p>
<article class="card ip-rede"><span class="tag gold">Destaque 2025 · internacional, em rede</span><h3>${esc(c.nome)}</h3><p class="meta">${esc(c.quando)} · coordenação geral compartilhada: ${esc(c.coord)}</p>
<div class="ip-num c5">${[[c.nComissao, "membros na comissão científica"], [c.paises.length, "países"], [c.nInst, "instituições na comissão"], [c.nTrab, "trabalhos apresentados"], [2, "volumes de anais com ISBN"]].map(([n, t]) => `<div><b>${n}</b><span>${esc(t)}</span></div>`).join("")}</div>
<div class="ip-rede-g"><div><h4>Realização</h4>${chips(c.realiz)}<h4>Comissão organizadora</h4>${chips(c.org)}<h4>Apoio institucional</h4>${chips(c.apoio)}</div>
<div><h4>Comissão científica por país</h4>${hbar(c.paises, maxP)}<p class="meta">Instituições estrangeiras: ${esc(c.inst_ext.join(", "))}.</p></div></div>
<p><strong>PPGAU/UNIVAG:</strong> ${esc(c.univag.join("; "))}.</p><p><strong>Anais:</strong> ${esc(c.isbn)}.</p>
<p class="meta">${ext(c.link, "Página do evento ↗")} · ${ext(c.anais, "Anais ↗")} · Fonte: Even3 e Estante da ANAP, consulta em 17/10/2026.</p></article>
<h3 class="ip-h3">Parceiros recorrentes</h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Parceiro</th><th>Onde</th><th class="num">Eventos em conjunto</th><th>O que fazem juntos</th></tr></thead><tbody>${REDE.parceiros.map(r => `<tr><td><b>${esc(r[0])}</b></td><td data-l="Onde">${esc(r[1])}</td><td class="num" data-l="Eventos em conjunto">${r[2] || "–"}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody></table></div></section>
<section class="blk" id="eventos"><h2>Eventos e difusão</h2>
<div class="pj-res">${[["organizador", "organizados pelo PPGAU"], ["coorganizador", "coorganizados pelo PPGAU"], ["participante", "com participação do PPGAU"], ["anais", "com anais com ISBN ou ISSN"]].map(([k, t]) => `<div><b>${k === "anais" ? EVENTOS.filter(e => e.anais && (e.anais.isbn || e.anais.issn)).length : EVENTOS.filter(e => e.ppgau_papel === k).length}</b><span>${t}</span></div>`).join("")}</div>
<div class="tbl-wrap"><table class="tbl ip-evt"><thead><tr><th>Ano</th><th>Evento</th><th>Papel do PPGAU</th><th>Organização</th><th>Anais</th></tr></thead><tbody>${evOrd.map(e => { const an = e.anais || {}, pp = PAPEL[e.ppgau_papel] || ["pa", "Não identificado"], pes = [...(e.docentes_ppgau || []), ...(e.discentes_ppgau || [])].join("; ");
  return `<tr><td data-l="Ano"><b>${esc(e.ano)}</b></td><td><b>${esc(e.nome)}</b><br><span class="meta">${esc([e.datas, e.local_formato, e.abrangencia].filter(Boolean).join(" · "))}</span>${pes ? `<br><span class="meta">PPGAU: ${esc(pes)}</span>` : ""}${e.numeros ? `<br><span class="meta">${esc(e.numeros)}</span>` : ""}</td><td data-l="Papel"><span class="ip-papel ${pp[0]}">${pp[1]}</span></td><td data-l="Organização" class="meta">${esc((e.organizacao || []).join("; ") || "não informada")}</td><td data-l="Anais" class="meta">${an.titulo ? esc(an.titulo) + "<br>" : ""}${an.isbn ? "ISBN " + esc(an.isbn) + "<br>" : ""}${an.issn ? "ISSN " + esc(an.issn) + "<br>" : ""}${an.doi ? "DOI " + esc(an.doi) + "<br>" : ""}${an.link ? ext(an.link, "Abrir anais ↗") : an.isbn || an.issn ? "" : "não localizados"}${(e.fontes || [])[0] ? "<br>" + ext(e.fontes[0], "Fonte ↗") : ""}</td></tr>`; }).join("")}</tbody></table></div>
<p class="meta">Fontes: site do programa, Even3, portal de publicações da ANAP e Estante da ANAP, consulta em 17/10/2026. Onde o papel do PPGAU ou a data foi deduzido, a origem está indicada na própria linha.</p></section>
<p class="meta">Dados atualizados em ${esc(atualizado("impacto"))}. Veja também <a href="premiacoes.html">Premiações</a>, <a href="eventos.html">Eventos</a> e <a href="producao.html">Produção</a>.</p>`
    });
  }
  return P;
};
