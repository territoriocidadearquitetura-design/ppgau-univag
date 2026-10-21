"use strict";
// Portal de transparência (ficha CAPES) e análise do Currículo Lattes.
// Depende de: FICHA, REFERENCIA, CONCEITOS (ficha.js); PUBLICOS, ESCALAS (questoes.js);
// e de st, db, esc, pct, toCsv, baixar, itensTodos, minhasCats (script principal).

const CONCEITO_COR = { "Muito bom": "var(--ok)", "Bom": "var(--c1)", "Regular": "var(--c4)", "Fraco": "var(--c2)", "Insuficiente": "var(--err)" };

// ---------- indicadores ----------
function respostasValidas() { return st.docs.filter(d => !d.piloto); }
function mediaEscala(pub, filtro) {
  let soma = 0, n = 0;
  const p = PUBLICOS.find(x => x.id === pub); if (!p) return null;
  p.secoes.forEach(s => s.qs.forEach(q => {
    if (q.type !== "scale" || q.scale !== "S" || (filtro && !filtro(s, q))) return;
    respostasValidas().filter(d => d.publico === pub).forEach(d => {
      const i = ESCALAS.S.opts.indexOf(d.respostas[q.key]);
      if (i >= 0 && i < 5) { soma += i + 1; n++; }
    });
  }));
  return n ? { media: soma / n, n } : null;
}
const fmtMedia = m => m ? `${m.media.toFixed(1).replace(".", ",")} (${m.n} avaliações)` : "sem dados";
const nPub = id => respostasValidas().filter(d => d.publico === id).length;
function prodItens(filtro) { return itensTodos().filter(it => !filtro || filtro(it)); }

function evidencias(chave) {
  const todos = prodItens();
  const temProd = st.podeEditar;
  switch (chave) {
    case "autoavaliacao": return [
      ["Respostas aos questionários", String(respostasValidas().length)],
      ...PUBLICOS.map(p => [p.nome, String(nPub(p.id))])];
    case "questionarios-organizacao": return [
      ["Satisfação dos estudantes com a organização das disciplinas (1–5)", fmtMedia(mediaEscala("A", s => s.id === "A3"))],
      ["Avaliação docente da organização das disciplinas (1–5)", fmtMedia(mediaEscala("B", s => s.id === "B2"))]];
    case "questionarios-infra": {
      const e = respostasValidas().filter(d => d.publico === "E");
      let suf = 0, val = 0;
      e.forEach(d => Object.entries(d.respostas).forEach(([k, v]) => { const i = ESCALAS.C.opts.indexOf(v); if (i >= 0 && i < 4) { val++; if (i === 0) suf++; } }));
      return [
        ["Estudantes: encontros híbridos e apoio (1–5)", fmtMedia(mediaEscala("A", s => s.id === "A2" || s.id === "A5"))],
        ["Docentes: condições de trabalho (1–5)", fmtMedia(mediaEscala("B", s => s.id === "B1"))],
        ["Equipe técnica: processos e condições (1–5)", fmtMedia(mediaEscala("D"))],
        ["Gestão: condições “disponíveis e suficientes”", val ? `${pct(suf, val)}% de ${val} itens avaliados` : "sem dados"]];
    }
    case "questionarios-gestao": return [["Respostas da gestão institucional", String(nPub("E"))]];
    case "cadastro-docentes": return temProd ? [
      ["Docentes cadastrados", String(st.cadastros.filter(c => (c.publicos || []).includes("B")).length)],
      ["Pós-doutorandos cadastrados", String(st.cadastros.filter(c => (c.publicos || []).includes("P")).length)],
      ["Referência da área", "mínimo de 10 docentes permanentes"]] : [];
    case "producao-dissertacao": { const d = todos.filter(i => i.dissertacao).length; return temProd ? [["Itens decorrentes de dissertação", `${d} de ${todos.length} (${pct(d, todos.length)}%)`]] : []; }
    case "producao-discentes": {
      const de = todos.filter(i => i.categoria === "Discente" || i.categoria === "Egresso").length;
      const co = todos.filter(i => (i.coautoria || []).some(c => c === "Discente do PPGAU" || c === "Egresso do PPGAU")).length;
      return temProd ? [["Itens registrados por discentes e egressos", `${de} (${pct(de, todos.length)}% do total)`], ["Itens com coautoria de discente ou egresso", `${co} (${pct(co, todos.length)}%)`]] : [];
    }
    case "questionarios-egressos": {
      const c = respostasValidas().filter(d => d.publico === "C");
      const rec = c.filter(d => d.respostas["C.25"] === "Sim").length;
      return [["Egressos respondentes", String(c.length)], ["Recomendariam o mestrado", c.length ? `${pct(rec, c.length)}%` : "sem dados"]];
    }
    case "questionarios-egressos-impacto": {
      const c = respostasValidas().filter(d => d.publico === "C");
      return [["Egressos que conhecem uso social dos resultados da pesquisa", String(c.filter(d => d.respostas["C.21"] === "Sim").length)]];
    }
    case "producao-docentes": {
      const doc = todos.filter(i => i.categoria === "Docente");
      const art = doc.filter(i => i.tipo === "Artigo em periódico");
      const topo = art.filter(i => ["A1", "A2", "A3", "A4"].includes(i.qualis)).length;
      return temProd ? [["Itens registrados por docentes", String(doc.length)], ["Artigos em periódicos", String(art.length)], ["Artigos em estratos A1–A4", `${topo}`],
        ["Livros e capítulos", String(doc.filter(i => i.tipo === "Livro" || i.tipo === "Capítulo de livro").length)]] : [];
    }
    case "lattes": return temProd ? [["Currículos Lattes analisados", String(st.analises.length)]] : [];
    case "questionarios-docentes": return [["Docentes respondentes", String(nPub("B"))]];
    case "producao-tecnica": {
      const tec = TIPOS_PTT;
      return temProd ? [["Produtos técnicos e tecnológicos registrados", String(todos.filter(i => tec.includes(i.tipo)).length)], ["Produção artística ou cultural", String(todos.filter(i => i.tipo === "Produção artística ou cultural").length)]] : [];
    }
    case "producao-coautoria": {
      const intl = todos.filter(i => (i.coautoria || []).includes("Pesquisador estrangeiro")).length;
      const nac = todos.filter(i => (i.coautoria || []).includes("Pesquisador externo nacional")).length;
      return temProd ? [["Coautoria internacional", `${intl} itens (${pct(intl, todos.length)}%)`], ["Coautoria com outras instituições brasileiras", `${nac} itens (${pct(nac, todos.length)}%)`]] : [];
    }
  }
  return [];
}
function evidenciasItem(item) { return item.evid.flatMap(evidencias); }

// ---------- portal ----------
function itemDoc(id) { return st.portal[id] || {}; }
function pillConceito(c) {
  if (!c) return `<span class="pill" style="background:var(--surface-2);color:var(--muted)">Não avaliado</span>`;
  return `<span class="pill" style="background:var(--surface-2);color:var(--ink)"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CONCEITO_COR[c]};margin-right:6px"></i>${esc(c)}</span>`;
}
function dataBR(iso) { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }

// Os itens da ficha entram no portal depois, a pedido da coordenação (17/10/2026).
const PORTAL_FICHA_ATIVA = false;

function renderPortal() {
  if (!PORTAL_FICHA_ATIVA) return renderEmDados();
  const todosItens = FICHA.flatMap(q => q.itens);
  const avaliados = todosItens.filter(i => itemDoc(i.id).conceito);
  const dist = CONCEITOS.map(c => ({ c, n: avaliados.filter(i => itemDoc(i.id).conceito === c).length }));
  const ultima = todosItens.map(i => itemDoc(i.id).atualizadoEm).filter(Boolean).sort().pop();
  $view.innerHTML = `
    <section class="card" style="display:grid;gap:10px">
      <div class="dim">Portal de transparência e autoavaliação</div>
      <h2 style="font-size:24px">${esc(REFERENCIA.programa)}</h2>
      <div class="tiles">
        <div class="tile" style="cursor:default"><span class="dim">Nota CAPES vigente</span><span class="num">${esc(REFERENCIA.notaAtual)}</span><span class="lbl">Quadrienal 2025, ciclo ${esc(REFERENCIA.cicloAvaliado.split(" ")[0])}</span></div>
        <div class="tile" style="cursor:default"><span class="dim">Ciclo em acompanhamento</span><span class="num">${esc(REFERENCIA.cicloAtual)}</span><span class="lbl">próxima Quadrienal</span></div>
        ${PORTAL_FICHA_ATIVA ? `<div class="tile" style="cursor:default"><span class="dim">Itens da ficha analisados</span><span class="num">${avaliados.length}/${todosItens.length}</span><span class="lbl">${ultima ? "última atualização " + esc(dataBR(ultima)) : "nenhuma análise publicada"}</span></div>` : ""}
        <div class="tile" style="cursor:default"><span class="dim">Respostas à autoavaliação</span><span class="num">${respostasValidas().length}</span><span class="lbl">sem contar o piloto</span></div>
      </div>
      ${PORTAL_FICHA_ATIVA && avaliados.length ? `<div class="stack" style="height:14px" role="img" aria-label="${dist.map(d => `${d.c}: ${d.n}`).join(", ")}">${dist.map(d => d.n ? `<span style="flex:${d.n};background:${CONCEITO_COR[d.c]}" data-tip="${d.c}: ${d.n} itens"></span>` : "").join("")}</div>
        <div class="legend" style="margin:0">${dist.map(d => `<span><i style="background:${CONCEITO_COR[d.c]}"></i>${d.c} (${d.n})</span>`).join("")}</div>` : ""}
      ${PORTAL_FICHA_ATIVA ? `<p class="small muted" style="margin:0">Estrutura e critérios: ficha de avaliação dos programas acadêmicos da área de Arquitetura, Urbanismo e Design. Fonte: ${esc(REFERENCIA.fonte)} Os conceitos abaixo são a autoavaliação do programa, não notas da CAPES. Cada alteração fica registrada com data e autor.</p>` : `<p class="small muted" style="margin:0">Critérios de referência: ${esc(REFERENCIA.fonte)}</p>`}
    </section>
    ${PORTAL_FICHA_ATIVA ? "" : `
      <section class="card" style="margin-top:22px">
        <div class="dim">Autoavaliação</div>
        <h2>Participação nos questionários</h2>
        ${respostasValidas().length ? barras(PUBLICOS.map(p => ({ label: p.nome, n: nPub(p.id) })), respostasValidas().length) : `<p class="muted">Ainda não há respostas. Os resultados aparecem aqui e na aba Resultados à medida que os questionários são enviados.</p>`}
      </section>`}
    ${!PORTAL_FICHA_ATIVA ? "" : FICHA.map(q => `
      <section style="margin-top:22px">
        <div class="dim">Quesito ${q.id}</div>
        <h2 style="font-size:24px;font-stretch:88%;margin-bottom:4px">${esc(q.nome)}</h2>
        <p class="muted small" style="margin:0 0 12px">${esc(q.desc)}</p>
        ${q.itens.map(renderItemPortal).join("")}
      </section>`).join("")}`;
  ligarPortal();
}

function renderItemPortal(item) {
  const d = itemDoc(item.id);
  const ed = st.editItem === item.id;
  const ev = st.podeEditar ? evidenciasItem(item) : (d.indicadores || []);
  const evEm = st.podeEditar ? "agora (dados ao vivo)" : (d.indicadoresEm ? dataBR(d.indicadoresEm) : "");
  return `<article class="card" id="item-${item.id.replace(/\./g, "-")}">
    <div class="row spread" style="align-items:flex-start">
      <div style="min-width:0;flex:1"><div class="dim">Item ${item.id} · peso ${item.peso}% no quesito</div><h3 style="font-size:18px;font-weight:650;margin-top:2px">${esc(item.titulo)}</h3></div>
      ${pillConceito(d.conceito)}
    </div>
    <details style="margin-top:10px"><summary class="small" style="cursor:pointer;color:var(--accent)">O que a CAPES avalia neste item</summary>
      <ul class="small" style="margin:8px 0 0;padding-left:18px;display:grid;gap:4px">${item.subitens.map(s => `<li><span class="qn">${esc(s[0])} · ${s[1]}%</span>${esc(s[2])}</li>`).join("")}</ul></details>
    ${ev.length ? `<div style="margin-top:12px"><div class="dim" style="margin-bottom:6px">Evidências da plataforma${evEm ? " · " + esc(evEm) : ""}</div>
      <div class="evid">${ev.map(([k, v]) => `<div><span class="small muted">${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div></div>` : ""}
    ${ed ? renderEditorItem(item, d) : `
      ${d.analise ? `<div class="bloco"><div class="dim">Análise crítica</div><p>${esc(d.analise).replace(/\n/g, "<br>")}</p></div>` : `<p class="small muted" style="margin:12px 0 0">Análise ainda não publicada.</p>`}
      ${d.acoes ? `<div class="bloco"><div class="dim">Ações e metas</div><p>${esc(d.acoes).replace(/\n/g, "<br>")}</p></div>` : ""}
      ${d.fontes ? `<div class="bloco"><div class="dim">Fontes e documentos</div><p class="small">${esc(d.fontes).replace(/\n/g, "<br>")}</p></div>` : ""}
      <div class="row spread" style="margin-top:12px">
        ${(d.historico || []).length ? `<details class="small"><summary style="cursor:pointer;color:var(--accent)">Histórico de alterações (${d.historico.length})</summary><ul style="margin:6px 0 0;padding-left:18px;display:grid;gap:4px">${d.historico.slice().reverse().map(h => `<li>${esc(dataBR(h.em))} · <span data-uid="${esc(h.por || "")}">${esc(nomeDe(h.por))}</span> · ${esc(h.resumo || "")}</li>`).join("")}</ul></details>` : "<span></span>"}
        ${st.podeEditar ? `<button class="btn small" data-editar="${item.id}">${d.atualizadoEm ? "Editar análise" : "Escrever análise"}</button>` : ""}
      </div>`}
  </article>`;
}

function renderEditorItem(item, d) {
  const r = st.rascunhoItem || {};
  const v = k => r[k] !== undefined ? r[k] : (d[k] || "");
  return `<form class="editor" data-form="${item.id}" style="margin-top:12px;display:grid;gap:10px">
    <label class="qt" for="pi-conceito">Conceito autoavaliado</label>
    <select id="pi-conceito"><option value="">Não avaliado</option>${CONCEITOS.map(c => `<option ${v("conceito") === c ? "selected" : ""}>${c}</option>`).join("")}</select>
    <label class="qt" for="pi-analise">Análise crítica</label>
    <textarea id="pi-analise" style="min-height:160px">${esc(v("analise"))}</textarea>
    <label class="qt" for="pi-acoes">Ações e metas</label>
    <textarea id="pi-acoes">${esc(v("acoes"))}</textarea>
    <label class="qt" for="pi-fontes">Fontes e documentos (links, atas, relatórios)</label>
    <textarea id="pi-fontes" style="min-height:70px">${esc(v("fontes"))}</textarea>
    ${st.itemMsg ? `<div class="notice ${st.itemMsgErro ? "" : "info"}" role="status">${esc(st.itemMsg)}</div>` : ""}
    <div class="row spread">
      <button type="button" class="btn small" id="pi-claude" ${st.gerandoItem ? "disabled" : ""}>${st.gerandoItem ? "Gerando rascunho…" : "Gerar rascunho com Claude"}</button>
      <div class="row"><button type="button" class="btn" id="pi-cancelar">Cancelar</button><button type="submit" class="btn primary">Publicar análise</button></div>
    </div>
    <p class="small muted" style="margin:0">Ao publicar, os indicadores acima são gravados junto com a análise, com data e autor, para auditoria.</p>
  </form>`;
}

function nomeDe(uid) { return (uid && st.nomes[uid]) || (uid === st.uid ? "Você" : "Coordenação"); }

function ligarPortal() {
  $view.querySelectorAll("[data-editar]").forEach(b => b.onclick = () => { st.editItem = b.dataset.editar; st.rascunhoItem = null; st.itemMsg = null; renderPortalKeep(); });
  const f = $view.querySelector("form.editor");
  if (f) {
    const item = FICHA.flatMap(q => q.itens).find(i => i.id === f.dataset.form);
    const ler = () => ({ conceito: f.querySelector("#pi-conceito").value, analise: f.querySelector("#pi-analise").value, acoes: f.querySelector("#pi-acoes").value, fontes: f.querySelector("#pi-fontes").value });
    f.querySelector("#pi-cancelar").onclick = () => { st.editItem = null; st.rascunhoItem = null; renderPortalKeep(); };
    f.querySelector("#pi-claude").onclick = () => { st.rascunhoItem = ler(); gerarRascunhoItem(item); };
    f.addEventListener("submit", e => { e.preventDefault(); publicarItem(item, ler()); });
  }
  resolverNomes();
}
function renderPortalKeep() { const y = window.scrollY; renderPortal(); window.scrollTo(0, y); }

async function publicarItem(item, v) {
  const antes = itemDoc(item.id);
  const mud = [];
  if ((antes.conceito || "") !== v.conceito) mud.push(`conceito: ${antes.conceito || "não avaliado"} → ${v.conceito || "não avaliado"}`);
  ["analise", "acoes", "fontes"].forEach(k => { if ((antes[k] || "") !== v[k].trim()) mud.push({ analise: "análise", acoes: "ações", fontes: "fontes" }[k] + " atualizada"); });
  if (!mud.length) { st.itemMsg = "Nada mudou desde a última publicação."; st.itemMsgErro = false; return renderPortalKeep(); }
  const agora = new Date().toISOString();
  const doc = {
    item: item.id, conceito: v.conceito, analise: v.analise.trim().slice(0, 12000), acoes: v.acoes.trim().slice(0, 6000), fontes: v.fontes.trim().slice(0, 4000),
    indicadores: evidenciasItem(item), indicadoresEm: agora, atualizadoEm: agora, atualizadoPor: st.uid || "",
    historico: [...(antes.historico || []), { em: agora, por: st.uid || "", resumo: mud.join("; "), conceito: v.conceito }].slice(-100)
  };
  try {
    await db.doc("portal/" + item.id.replace(/\./g, "-")).set(doc);
    st.portal[item.id] = doc; st.editItem = null; st.rascunhoItem = null; st.itemMsg = null;
  } catch (e) {
    st.itemMsg = e && e.code === "invalid_argument" ? "Só quem edita a página pode publicar análises." : "A análise não foi publicada por uma instabilidade. Tente novamente.";
    st.itemMsgErro = true; st.rascunhoItem = v;
  }
  renderPortalKeep();
}

async function gerarRascunhoItem(item) {
  if (!sample) { st.itemMsg = "O Claude não está disponível nesta visualização."; st.itemMsgErro = true; return renderPortalKeep(); }
  st.gerandoItem = true; st.itemMsg = null; renderPortalKeep();
  const ev = evidenciasItem(item).map(([k, v]) => `- ${k}: ${v}`).join("\n") || "- Nenhum indicador disponível na plataforma para este item.";
  const prompt = `Você é avaliador experiente da área de Arquitetura, Urbanismo e Design da CAPES e apoia a autoavaliação de um programa.
Programa: ${REFERENCIA.programa}. Nota CAPES vigente: ${REFERENCIA.notaAtual} (Quadrienal 2025, ciclo 2021–2024). Ciclo em acompanhamento: ${REFERENCIA.cicloAtual}.
Contexto do programa: mestrado acadêmico em Várzea Grande (MT); disciplinas concentradas em um mês, cinco encontros com três professores, quatro híbridos e o quinto presencial obrigatório; o programa estuda a viabilidade de um doutorado.

Item ${item.id} da ficha (peso ${item.peso}% no quesito): ${item.titulo}
Subitens avaliados:
${item.subitens.map(s => `- ${s[0]} (${s[1]}%): ${s[2]}`).join("\n")}

Indicadores coletados na plataforma do programa:
${ev}

Notas atuais da coordenação (podem estar vazias):
Análise: ${st.rascunhoItem.analise || "(vazia)"}
Ações: ${st.rascunhoItem.acoes || "(vazia)"}

Escreva em português do Brasil, em tom técnico e crítico, sem exageros. Use apenas os dados acima; quando faltarem dados para um subitem, diga quais evidências o programa precisa reunir. Não invente números.
Responda somente com um objeto JSON: {"conceito_sugerido": um de ${JSON.stringify(CONCEITOS)} ou "" se não houver base, "analise": texto de 2 a 4 parágrafos curtos cobrindo os subitens, "acoes": lista de 3 a 5 ações e metas verificáveis, uma por linha, começando com "- "}`;
  try {
    const r = await sample.json(prompt, { modelTier: "complex" });
    st.rascunhoItem = { ...st.rascunhoItem, conceito: CONCEITOS.includes(r.conceito_sugerido) ? r.conceito_sugerido : st.rascunhoItem.conceito, analise: String(r.analise || ""), acoes: Array.isArray(r.acoes) ? r.acoes.join("\n") : String(r.acoes || "") };
    st.itemMsg = "Rascunho gerado pelo Claude. Revise antes de publicar."; st.itemMsgErro = false;
  } catch (e) {
    st.itemMsg = msgSample(e); st.itemMsgErro = true;
  }
  st.gerandoItem = false; renderPortalKeep();
}

function msgSample(e) {
  const c = e && e.code;
  return c === "not_granted" ? "O acesso ao Claude não foi autorizado nesta página."
    : c === "rate_limited" ? "Muitos pedidos ao Claude em pouco tempo. Aguarde um minuto e tente de novo."
    : c === "prompt_too_large" ? "O texto enviado é grande demais para uma análise."
    : c === "sampling_disabled" ? "O Claude não está disponível para esta conta."
    : c === "invalid_json" ? "A resposta do Claude veio incompleta. Tente novamente."
    : "O Claude não respondeu agora. Tente novamente.";
}

async function resolverNomes() {
  if (!userCap) return;
  const ids = [...new Set(Object.values(st.portal).flatMap(d => (d.historico || []).map(h => h.por)).filter(id => id && !st.nomes[id]))];
  if (!ids.length) return;
  try {
    const ps = await userCap.profiles(ids);
    let mudou = false;
    ids.forEach(id => { const n = ps[id] && ps[id].name; if (n) { st.nomes[id] = n; mudou = true; } });
    if (mudou) $view.querySelectorAll("[data-uid]").forEach(el => { el.textContent = nomeDe(el.dataset.uid); });
  } catch {}
}

// ---------- análise do Lattes ----------
let pdfjsPromise = null;
function carregarScript(src) {
  return new Promise((ok, erro) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => erro(new Error("script")); document.head.appendChild(s); });
}
function carregarPdfjs() {
  if (!pdfjsPromise) pdfjsPromise = (async () => {
    // O worker roda na própria página (sem Web Worker), o que o pdf.js aceita quando pdfjsWorker já está carregado.
    await carregarScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js");
    await carregarScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js");
    return window.pdfjsLib;
  })();
  return pdfjsPromise;
}
async function textoDoPdf(file) {
  const lib = await carregarPdfjs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const partes = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const tc = await pg.getTextContent();
    let linha = "", ultY = null;
    tc.items.forEach(it => { const y = it.transform[5]; if (ultY !== null && Math.abs(y - ultY) > 2) { partes.push(linha); linha = ""; } linha += it.str; ultY = y; });
    partes.push(linha);
  }
  return { texto: partes.join("\n").replace(/\n{3,}/g, "\n\n"), paginas: pdf.numPages };
}

const RUBRICA_LATTES = `CRITÉRIOS DA ÁREA 29 (ARQUITETURA, URBANISMO E DESIGN), SUBÁREA ARQUITETURA E URBANISMO, QUADRIÊNIO 2025–2028 (Ficha de Avaliação e Documento de Área):
- Programa acadêmico de mestrado: a produção predominante esperada é bibliográfica. A produção é avaliada de forma qualitativa a partir de produções DESTACADAS, não por pontuação de estratos.
- Fatores da produção bibliográfica (Documento de Área): temática e avanço conceitual; aderência à área de concentração, à linha e ao projeto do docente; inovação; impacto ou relevância econômica, social ou cultural; participação de discentes e egressos; periódico com selo diamante; índice H5 do Google Acadêmico; indexação em Web of Science, SciELO, Scopus, Latindex, DOAJ, Redalyc, Diadorim, MIAR ou OpenAlex. O Qualis 2021–2024 serve apenas como referência histórica.
- Item 2.4.2: 4 produções docentes destacadas, sem repetir docente, julgadas por (i) estratos superiores, (ii) coesão com o projeto do docente, (iii) identidade com área e linha, (iv) impacto ou relevância econômica ou social, (v) premiação ou reconhecimento. A distribuição da produção entre os docentes (homogeneidade) é considerada; colaboradores contam de forma secundária.
- Item 2.4.1: percentual de docentes permanentes que coordenam projetos de pesquisa vinculados ao programa, com participação discente e financiamento interno ou externo.
- Item 1.1.2 (corpo docente): todos os permanentes em projetos vinculados às linhas; ≥20% em redes nacionais ou internacionais; ≥60% com orientação concluída no quadriênio; ≥60% com orientação em andamento; ≥50% ministrando ao menos uma disciplina por ano; ≥70% em dedicação integral (40 h na IES) e ≥70% com 20 h semanais no programa; no máximo 30% atuando em outros programas (até 3). Docentes em licença-maternidade ou parental nos 24 meses anteriores podem ser excluídos do cálculo.
- Itens 2.3.1 e 2.3.2: 5 produções com discentes e 5 com egressos, publicadas, com identidade com área e linha, coesão com o projeto do docente e impacto.
- Item 2.1.1: dissertações que resultaram em produção intelectual.
- Produtos técnicos e tecnológicos aceitos pela área (PTT): produto bibliográfico técnico-tecnológico, patente e outros ativos de propriedade intelectual, tecnologia social, curso de formação profissional, produto de editoração, material didático, software ou aplicativo, evento organizado, norma ou marco regulatório, relatório técnico conclusivo, manual ou protocolo, processo ou tecnologia não patenteável, tradução, acervo, base de dados técnico-científica, produto de comunicação, carta ou mapa, empresa ou organização social inovadora, produtos em sigilo. Na subárea AU pesam mais: produto técnico bibliográfico, ativos de PI, tecnologia social, editoração, evento organizado, relatório técnico conclusivo, acervo, base de dados, produto de comunicação e carta ou mapa. Aulas, orientações, bancas e pareceres internos NÃO são PTT.
- Quesito 3: 3.1 internacionalização, inserção nacional e visibilidade (Lattes, Google Acadêmico, ORCID); 3.2 inovação e transferência (8 produtos destacados), contribuição à teoria, crítica e projeto, incorporação pela sociedade, reconhecimento; 3.3 impactos econômico, sociocultural, educacional, artístico e técnico.`;

async function analisarLattes(file) {
  const out = document.getElementById("lt-status");
  const status = t => { if (out) out.textContent = t; };
  st.lattesErro = null; st.analisando = true; renderProducao();
  try {
    if (!sample) throw { code: "sem_claude" };
    status("Lendo o PDF…");
    const { texto, paginas } = await textoDoPdf(file);
    if (texto.replace(/\s/g, "").length < 500) throw { code: "pdf_vazio" };
    status(`PDF lido (${paginas} páginas). Enviando o arquivo à coordenação…`);
    let arquivo = null;
    if (assetsCap) { try { const a = await assetsCap.upload(file); arquivo = { id: a.id, url: a.url, nome: file.name.slice(0, 120), bytes: a.sizeBytes }; } catch {} }
    status("Analisando a produção com os critérios da área. Isso pode levar alguns minutos…");
    const cats = minhasCats();
    const prompt = `Você é consultor da CAPES na área de Arquitetura, Urbanismo e Design. Analise o Currículo Lattes abaixo para a autoavaliação do ${REFERENCIA.programa} (nota ${REFERENCIA.notaAtual}), pelos critérios do quadriênio ${REFERENCIA.cicloAtual}; use o ciclo 2021–2024 só como comparação.
Vínculo declarado com o programa: ${cats.join(", ") || "não informado"}.

${RUBRICA_LATTES}

Regras: use somente o que está no currículo; não invente estratos, números ou títulos. Indexação, selo diamante e estrato Qualis 2021–2024 são ESTIMATIVAS e devem vir com confiança "baixa", "média" ou "alta"; diga que precisam ser conferidos nas bases oficiais. Se o currículo não permitir afirmar algo, use null. Escreva em português do Brasil, em tom profissional e crítico.

Responda somente com um objeto JSON com esta forma:
{
 "nome": string,
 "vinculo_inferido": string,
 "cadastro": {"nome": string, "email": string|null, "vinculos": [um ou mais de "Docente", "Discente", "Pós-doutorando", "Egresso"], "justificativa_vinculo": string} (vínculo com o Mestrado em Arquitetura e Urbanismo do UNIVAG (PPGAU), deduzido da atuação profissional, da formação em andamento ou concluída e do pós-doutorado; "Egresso" = mestrado concluído no PPGAU UNIVAG; se não houver vínculo com o PPGAU, lista vazia),
 "orientacoes": {"andamento": [{"nome": string, "nivel": string, "inicio": string, "titulo": string, "instituicao": string}], "concluidas": [{"nome": string, "nivel": string, "ano": string, "titulo": string, "instituicao": string}]} (mestrado e doutorado, mais recentes primeiro, no máximo 40 cada; inclua coorientações indicando em "nivel"),
 "periodo_analisado": string,
 "resumo_executivo": string (1 parágrafo),
 "indicadores": {"2021-2024": {...}, "2025-2028": {...}} onde cada um tem os números: artigos_periodicos, artigos_ingles, livros, capitulos, trabalhos_completos_anais, resumos_anais, ptt, producao_artistica, orientacoes_mestrado_concluidas, orientacoes_mestrado_andamento, orientacoes_doutorado, projetos_pesquisa, projetos_com_financiamento, coautorias_discentes_egressos, coautorias_internacionais,
 "requisitos_docente": {"projeto_vinculado": bool|null, "rede_pesquisa": bool|null, "orientacao_concluida": bool|null, "orientacao_andamento": bool|null, "disciplina_por_ano": bool|null, "projeto_com_discente_e_financiamento": bool|null, "outros_programas": number|null, "observacao": string} (itens 1.1.2 e 2.4.1; preencha só para docentes),
 "artigos": [{"ano": string, "titulo": string, "periodico": string, "issn": string, "idioma": string, "bases_provaveis": [string], "selo_diamante": bool|null, "estrato_estimado": string (Qualis 2021–2024, referência), "confianca": string}] (todos de 2021 em diante, no máximo 40),
 "melhores_produtos": [{"titulo": string, "tipo": string, "ano": string, "item": "2.3.1"|"2.3.2"|"2.4.2"|"3.2"|"3.3", "justificativa": string (pelos fatores i a v e pelos fatores do Documento de Área)}] (até 4, candidatos a destaque),
 "contribuicao_ficha": [{"item": "1.1"|"2.1"|"2.3"|"2.4"|"3.1"|"3.2"|"3.3", "analise": string}],
 "pontos_fortes": [string], "fragilidades": [string], "recomendacoes": [string], "alertas_registro": [string] (itens que provavelmente não seriam classificados ou estão mal registrados),
 "producao_2025_2028": [{"tipo": um de ${JSON.stringify(TIPOS)}, "ano": string, "titulo": string, "autores": string, "veiculo": string, "issn": string, "doi": string}] (no máximo 60)
}

CURRÍCULO LATTES (texto extraído do PDF):
${texto.slice(0, 200000)}`;
    const r = await sample.json(prompt, { modelTier: "complex" });
    const ml = texto.match(/https?:\/\/lattes\.cnpq\.br\/\d{16}/);
    if (ml) r.lattes_url = ml[0];
    const doc = { autor: { nome: (st.cad && st.cad.nome) || r.nome || "", email: (st.cad && st.cad.email) || "", categorias: cats }, arquivo, paginas, resultado: r, analisadoEm: new Date().toISOString() };
    const tam = JSON.stringify(doc).length;
    if (tam > 240000) doc.resultado = { ...r, producao_2025_2028: (r.producao_2025_2028 || []).slice(0, 20), artigos: (r.artigos || []).slice(0, 20) };
    if (db && st.uid) await db.doc("analises/" + st.uid).set(doc);
    st.minhaAnalise = doc;
  } catch (e) {
    st.lattesErro = e && e.code === "pdf_vazio" ? "Não foi possível ler texto neste PDF. Gere o PDF pela própria Plataforma Lattes (opção Imprimir currículo) e tente de novo."
      : e && e.code === "sem_claude" ? "O Claude não está disponível nesta visualização. Abra a página pelo claude.ai."
      : e && e.message === "script" ? "Não foi possível carregar o leitor de PDF. Verifique a conexão e tente de novo."
      : e && e.code === "invalid_argument" ? "A análise foi feita, mas sua conta não tem permissão para salvá-la. Peça acesso de Colaborador à coordenação."
      : msgSample(e);
  }
  st.analisando = false; renderProducao();
}

function listaHtml(t, arr) { return arr && arr.length ? `<div class="bloco"><div class="dim">${t}</div><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""; }
const ROTULOS_IND = { artigos_periodicos: "Artigos em periódicos", artigos_ingles: "Artigos em inglês", livros: "Livros", capitulos: "Capítulos", trabalhos_completos_anais: "Trabalhos completos em anais", resumos_anais: "Resumos em anais", ptt: "Produção técnica (PTT)", producao_artistica: "Produção artística", orientacoes_mestrado_concluidas: "Orientações de mestrado concluídas", orientacoes_mestrado_andamento: "Orientações de mestrado em andamento", orientacoes_doutorado: "Orientações de doutorado", projetos_pesquisa: "Projetos de pesquisa", projetos_com_financiamento: "Projetos com financiamento", coautorias_discentes_egressos: "Coautorias com discentes ou egressos", coautorias_internacionais: "Coautorias internacionais" };

const ROTULOS_REQ = { projeto_vinculado: "Projeto vinculado às linhas", rede_pesquisa: "Participação em rede nacional ou internacional", orientacao_concluida: "Orientação concluída no quadriênio", orientacao_andamento: "Orientação em andamento", disciplina_por_ano: "Ao menos uma disciplina por ano", projeto_com_discente_e_financiamento: "Coordena projeto com discente e financiamento (2.4.1)" };
function renderRequisitos(q) {
  if (!q || !Object.keys(ROTULOS_REQ).some(k => q[k] != null)) return "";
  const v = x => x === true ? "Atende" : x === false ? "Não atende" : "Sem evidência no currículo";
  return `<div class="table-wrap bloco"><div class="dim">Requisitos do docente (itens 1.1.2 e 2.4.1)</div><table><tbody>
    ${Object.keys(ROTULOS_REQ).map(k => `<tr><td>${ROTULOS_REQ[k]}</td><td>${v(q[k])}</td></tr>`).join("")}
    ${q.outros_programas != null ? `<tr><td>Outros programas em que atua</td><td class="n">${esc(q.outros_programas)}</td></tr>` : ""}</tbody></table>${q.observacao ? `<p class="small">${esc(q.observacao)}</p>` : ""}</div>`;
}
function renderLaudo(doc, comImportar) {
  const r = doc.resultado || {};
  const ind = r.indicadores || {};
  const periodos = ["2021-2024", "2025-2028"].filter(p => ind[p]);
  return `<div class="laudo">
    <div class="row spread"><div><div class="dim">Parecer sobre a produção · ${esc(dataBR(doc.analisadoEm))}</div><h3 style="font-size:19px;margin-top:2px">${esc((doc.autor && doc.autor.nome) || r.nome || "")}</h3>
      <div class="small muted">${esc(r.vinculo_inferido || "")}${r.periodo_analisado ? " · " + esc(r.periodo_analisado) : ""}</div></div>
      ${doc.arquivo ? `<a class="btn small" href="${esc(doc.arquivo.url)}" target="_blank" rel="noopener">Abrir PDF enviado</a>` : ""}</div>
    ${r.resumo_executivo ? `<div class="bloco"><div class="dim">Resumo</div><p>${esc(r.resumo_executivo)}</p></div>` : ""}
    ${periodos.length ? `<div class="table-wrap bloco"><table><thead><tr><th>Indicador</th>${periodos.map(p => `<th class="n">${p.replace("-", "–")}</th>`).join("")}</tr></thead><tbody>
      ${Object.keys(ROTULOS_IND).map(k => `<tr><td>${ROTULOS_IND[k]}</td>${periodos.map(p => `<td class="n">${esc(ind[p][k] ?? "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
    ${(r.melhores_produtos || []).length ? `<div class="bloco"><div class="dim">Candidatos a produção de destaque</div><ol>${r.melhores_produtos.map(m => `<li><b>${esc(m.titulo)}</b> <span class="small muted">${esc(m.tipo || "")} · ${esc(m.ano || "")}${m.item ? " · item " + esc(m.item) : ""}</span><div class="small">${esc(m.justificativa || "")}</div></li>`).join("")}</ol></div>` : ""}
    ${renderRequisitos(r.requisitos_docente)}
    ${r.orientacoes && ((r.orientacoes.andamento || []).length || (r.orientacoes.concluidas || []).length) ? `<div class="bloco"><div class="dim">Orientações encontradas no currículo</div><div class="cols"><div><b class="oh">Em andamento · ${(r.orientacoes.andamento || []).length}</b><ul class="olist">${(r.orientacoes.andamento || []).map(o => `<li>${esc(o.nome)}<span class="small muted">${esc([o.nivel, o.inicio && "desde " + o.inicio, o.instituicao].filter(Boolean).join(" · "))}</span></li>`).join("")}</ul></div><div><b class="oh">Concluídas · ${(r.orientacoes.concluidas || []).length}</b><ul class="olist">${(r.orientacoes.concluidas || []).map(o => `<li>${esc(o.nome)}<span class="small muted">${esc([o.nivel, o.ano, o.instituicao].filter(Boolean).join(" · "))}</span></li>`).join("")}</ul></div></div></div>` : ""}
    ${(r.contribuicao_ficha || []).length ? `<div class="bloco"><div class="dim">Contribuição para os itens da ficha</div><ul>${r.contribuicao_ficha.map(c => `<li><span class="qn">${esc(c.item)}</span>${esc(c.analise)}</li>`).join("")}</ul></div>` : ""}
    ${listaHtml("Pontos fortes", r.pontos_fortes)}${listaHtml("Fragilidades", r.fragilidades)}${listaHtml("Recomendações", r.recomendacoes)}${listaHtml("Alertas de registro", r.alertas_registro)}
    ${(r.artigos || []).length ? `<details class="bloco"><summary class="small" style="cursor:pointer;color:var(--accent)">Artigos desde 2021 com indexação estimada (${r.artigos.length})</summary><div class="table-wrap"><table><thead><tr><th>Ano</th><th>Título</th><th>Periódico</th><th>Indexação provável</th><th>Qualis 2021–2024</th></tr></thead><tbody>
      ${r.artigos.map(a => `<tr><td class="n">${esc(a.ano)}</td><td>${esc(a.titulo)}</td><td>${esc(a.periodico)}${a.issn ? `<div class="small muted">${esc(a.issn)}</div>` : ""}</td><td>${esc((a.bases_provaveis || []).join(", "))}${a.selo_diamante ? ` <span class="small muted">· diamante</span>` : ""}</td><td>${esc(a.estrato_estimado || "")} <span class="small muted">${esc(a.confianca || "")}</span></td></tr>`).join("")}</tbody></table></div></details>` : ""}
    <p class="small muted" style="margin:10px 0 0">Parecer gerado pelo Claude a partir do PDF enviado, com base na Ficha de Avaliação e no Documento de Área 2025–2028. Indexação e estratos são estimativas e devem ser conferidos nas bases oficiais antes de qualquer uso formal.</p>
    ${comImportar && (r.producao_2025_2028 || []).length ? `<div class="row" style="margin-top:10px"><button class="btn small" id="lt-importar">Adicionar à minha produção os itens de 2025–2028 encontrados (${r.producao_2025_2028.length})</button></div>` : ""}
  </div>`;
}

function renderCardLattes() {
  const doc = st.minhaAnalise;
  return `<div class="card" id="card-lattes">
    <div class="dim">Ficha 2025–2028, itens 1.1.2, 2.3 e 2.4</div>
    <h2>Análise do Currículo Lattes</h2>
    <p class="small muted" style="margin:6px 0 12px;max-width:66ch">Anexe o PDF do seu Lattes atualizado, gerado na Plataforma Lattes. O Claude lê o currículo e produz um parecer pela Ficha de Avaliação e pelo Documento de Área 2025–2028 de Arquitetura, Urbanismo e Design. O arquivo e o parecer ficam disponíveis para a coordenação do PPGAU.</p>
    <div class="row">
      <input type="file" id="lt-arquivo" accept="application/pdf,.pdf" ${st.analisando ? "disabled" : ""}>
      <button class="btn primary" id="lt-analisar" ${st.analisando ? "disabled" : ""}>${st.analisando ? "Analisando…" : doc ? "Analisar novo PDF" : "Analisar Lattes"}</button>
    </div>
    <div id="lt-status" class="small muted" style="margin-top:8px" role="status">${st.analisando ? "Preparando…" : ""}</div>
    ${st.lattesErro ? `<div class="notice" role="alert" style="margin-top:8px">${esc(st.lattesErro)}</div>` : ""}
    ${st.lattesMsg ? `<div class="notice info" role="status" style="margin-top:8px">${esc(st.lattesMsg)}</div>` : ""}
    ${doc ? renderLaudo(doc, true) : ""}
  </div>`;
}

function ligarLattes() {
  const b = document.getElementById("lt-analisar");
  if (b) b.onclick = () => {
    const f = document.getElementById("lt-arquivo").files[0];
    if (!f) { st.lattesErro = "Escolha o arquivo PDF do seu Currículo Lattes."; return renderProducao(); }
    if (f.size > 20 * 1024 * 1024) { st.lattesErro = "O PDF tem mais de 20 MB. Gere o currículo novamente pela Plataforma Lattes."; return renderProducao(); }
    st.lattesMsg = null; analisarLattes(f);
  };
  const imp = document.getElementById("lt-importar");
  if (imp) imp.onclick = async () => {
    const novos = (st.minhaAnalise.resultado.producao_2025_2028 || []).filter(x => x && x.titulo);
    const atuais = (st.prod && st.prod.itens) || [];
    const chave = t => String(t || "").toLowerCase().replace(/\W+/g, "");
    const existentes = new Set(atuais.map(i => chave(i.titulo)));
    const add = novos.filter(x => !existentes.has(chave(x.titulo))).map(x => ({
      id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      tipo: TIPOS.includes(x.tipo) ? x.tipo : "Outro", ano: ANOS.includes(String(x.ano)) ? String(x.ano) : "2025",
      titulo: String(x.titulo).slice(0, 500), autores: String(x.autores || "").slice(0, 1000), veiculo: String(x.veiculo || "").slice(0, 300),
      issn: String(x.issn || "").slice(0, 40), doi: String(x.doi || "").slice(0, 300), qualis: "", categoria: minhasCats()[0],
      coautoria: [], dissertacao: false, projeto: "", origem: "Lattes", atualizadoEm: new Date().toISOString()
    }));
    if (!add.length) { st.lattesMsg = "Todos esses itens já estão na sua produção."; return renderProducao(); }
    await salvarProducao(atuais.concat(add), `${add.length} itens adicionados. Revise o Qualis e a coautoria de cada um.`);
    st.lattesMsg = st.prodErro ? null : `${add.length} ${add.length === 1 ? "item adicionado" : "itens adicionados"} à sua produção. Revise o Qualis e a coautoria de cada um na lista abaixo.`;
    renderProducao();
  };
}

function renderAnalisesAdmin() {
  if (!st.analises.length) return `<section class="card"><h2>Análises de Lattes</h2><p class="muted">Nenhum currículo analisado ainda. Cada docente, pós-doutorando, discente ou egresso envia o PDF na aba Produção, em Minha produção.</p></section>`;
  const linhas = st.analises.slice().sort((a, b) => ((a.autor && a.autor.nome) || "").localeCompare((b.autor && b.autor.nome) || "", "pt-BR"));
  const tot = k => linhas.reduce((s, d) => s + (Number(((d.resultado || {}).indicadores || {})["2025-2028"]?.[k]) || 0), 0);
  return `<section class="card"><div class="row spread"><h2>Análises de Lattes</h2><button class="btn small" id="csv-lattes">Exportar indicadores (CSV)</button></div>
    <p class="small muted">Somatório 2025–2028 dos currículos analisados: ${tot("artigos_periodicos")} artigos, ${tot("livros")} livros, ${tot("capitulos")} capítulos, ${tot("ptt")} produtos técnicos, ${tot("coautorias_discentes_egressos")} coautorias com discentes ou egressos.</p>
    ${linhas.map((d, i) => `<details class="qblock"><summary style="cursor:pointer"><b>${esc((d.autor && d.autor.nome) || "—")}</b> <span class="small muted">${esc(((d.autor && d.autor.categorias) || []).join(", "))} · ${esc(dataBR(d.analisadoEm))}</span></summary>${renderLaudo(d, false)}</details>`).join("")}
  </section>`;
}
function csvLattes() {
  const ks = Object.keys(ROTULOS_IND);
  const rows = [["nome", "email", "vinculo", "analisado_em", "periodo", ...ks]];
  st.analises.forEach(d => ["2021-2024", "2025-2028"].forEach(p => {
    const ind = ((d.resultado || {}).indicadores || {})[p] || {};
    rows.push([(d.autor || {}).nome, (d.autor || {}).email, ((d.autor || {}).categorias || []).join(", "), d.analisadoEm, p, ...ks.map(k => ind[k] ?? "")]);
  }));
  return toCsv(rows);
}
