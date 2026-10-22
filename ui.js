// Interações comuns a todas as páginas: tema, busca rápida, efeitos de rolagem, contadores e agenda da Início.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const guarda = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } };
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // Tema claro/escuro, com preferência guardada no navegador.
  const raiz = document.documentElement, btTema = $(".tema-btn");
  const escuro = () => raiz.dataset.theme ? raiz.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const marcaTema = () => btTema && btTema.setAttribute("aria-pressed", escuro());
  const salvo = guarda("ppgau-tema"); if (salvo) raiz.dataset.theme = salvo;
  marcaTema();
  btTema && btTema.addEventListener("click", () => { raiz.dataset.theme = escuro() ? "light" : "dark"; guarda("ppgau-tema", raiz.dataset.theme); marcaTema(); });

  // Cabeçalho compacto, barra de leitura e botão de voltar ao topo.
  const topo = $("#top"), barra = $(".progresso i"), subir = $(".subir");
  const rolagem = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    topo.classList.toggle("rolou", y > 40);
    if (barra) barra.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    if (subir) subir.classList.toggle("on", y > 700);
  };
  addEventListener("scroll", rolagem, { passive: true }); rolagem();
  subir && subir.addEventListener("click", () => scrollTo({ top: 0, behavior: calmo ? "auto" : "smooth" }));

  // Entrada suave dos blocos ao rolar a página.
  const alvos = $$("main .card, main .kpi, main section.blk > h2, main .atlas, main .vn-capa, main .tl-ano, main .local");
  if (!calmo && "IntersectionObserver" in window) {
    raiz.classList.add("rv-on");
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    alvos.forEach(el => { const irm = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0; el.style.setProperty("--d", Math.min(irm, 8) * 60 + "ms"); el.classList.add("rv"); io.observe(el); });
  }

  // Contadores animados nos indicadores.
  const conta = el => {
    const txt = el.textContent.trim(), m = txt.match(/^(\d{1,3}(?:\.\d{3})*|\d+)$/);
    if (!m || calmo) return;
    const alvo = +txt.replace(/\./g, ""), t0 = performance.now(), dur = 1100;
    const passo = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(alvo * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString("pt-BR"); if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  if ("IntersectionObserver" in window) {
    const ic = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { conta(e.target); ic.unobserve(e.target); } }), { threshold: .6 });
    $$(".kpi b").forEach(b => ic.observe(b));
  }

  // Brilho que acompanha o ponteiro nos cartões clicáveis.
  document.addEventListener("pointermove", e => {
    const c = e.target.closest && e.target.closest("a.card, .atlas, .btn");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // Busca: motor único usado pela janela rápida (Ctrl+K ou /), pela barra da Início e pela página busca.html.
  // Cada registro é [tipo, título, detalhe, link, palavras-chave]. Pontua título acima de detalhe e palavras-chave.
  const IDX = (globalThis.BUSCA || []).map(r => ({ r, t: norm(r[1]), k: norm(r.join(" ")) }));
  const PESO = { "Página": 30, "Docente": 18, "Disciplina": 14, "Livro": 8, "Anais": 8, "Revista": 8 };
  const busca = q => {
    const termos = norm(q).split(/[^a-z0-9@.]+/).filter(t => t.length > 1 || /\d/.test(t));
    if (!termos.length) return [];
    return IDX.map(x => {
      let p = 0;
      for (const t of termos) {
        if (!x.k.includes(t)) return null;
        p += x.t.includes(t) ? (new RegExp("(^|\\W)" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(x.t) ? 12 : 7) : 2;
      }
      return { r: x.r, p: p + (PESO[x.r[0]] || 0) / 3 };
    }).filter(Boolean).sort((a, b) => b.p - a.p).map(x => x.r);
  };
  const realca = (txt, q) => { const ts = norm(q).split(/[^a-z0-9@.]+/).filter(t => t.length > 1); if (!ts.length) return txt; const n = norm(txt); const marcas = new Array(txt.length).fill(false); ts.forEach(t => { let i = n.indexOf(t); while (i > -1) { for (let j = i; j < i + t.length; j++) marcas[j] = true; i = n.indexOf(t, i + t.length); } }); let out = "", ab = false; for (let i = 0; i < txt.length; i++) { if (marcas[i] && !ab) { out += "<mark>"; ab = true; } if (!marcas[i] && ab) { out += "</mark>"; ab = false; } out += txt[i]; } return out + (ab ? "</mark>" : ""); };
  const fora = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : "";
  const linha = ([tp, t, s, h], q, i) => `<li role="option" id="br-${i}"${i === 0 ? ' aria-selected="true"' : ""}><a href="${h}"${fora(h)}><span class="br-tp">${tp}</span><b>${realca(t, q)}</b>${s ? `<small>${realca(s, q)}</small>` : ""}</a></li>`;
  globalThis.PPGAU = { busca, realca, linha, norm };

  const dlg = $("#busca"), campo = $("#busca-q"), lista = $("#busca-res");
  let sel = 0;
  const desenha = () => {
    const q = campo.value.trim(), todos = busca(q);
    const achados = q ? todos.slice(0, 30) : IDX.filter(x => x.r[0] === "Página").map(x => x.r);
    sel = 0;
    lista.innerHTML = achados.length ? achados.map((r, i) => linha(r, q, i)).join("") + (todos.length > 30 ? `<li class="br-mais"><a href="busca.html?q=${encodeURIComponent(q)}">Ver todos os ${todos.length} resultados →</a></li>` : "") : `<li class="br-vazio">Nada encontrado para “${q.replace(/</g, "&lt;")}”. Tente outra palavra, como o nome de um professor ou de uma disciplina.</li>`;
    campo.setAttribute("aria-activedescendant", achados.length ? "br-0" : "");
  };
  const marca = n => { const it = $$("li[role=option]", lista); if (!it.length) return; sel = (n + it.length) % it.length; it.forEach((li, i) => li.setAttribute("aria-selected", i === sel)); it[sel].scrollIntoView({ block: "nearest" }); campo.setAttribute("aria-activedescendant", "br-" + sel); };
  const abre = (q = "") => { if (!dlg) return; dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); campo.value = q; desenha(); campo.focus(); };
  if (dlg) {
    $$(".busca-btn").forEach(b => b.addEventListener("click", () => abre()));
    campo.addEventListener("input", desenha);
    campo.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); marca(sel + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marca(sel - 1); }
      else if (e.key === "Enter") { const a = $$("li[role=option] a", lista)[sel]; e.preventDefault(); if (a) { a.click(); dlg.close(); } else if (campo.value.trim()) location.href = "busca.html?q=" + encodeURIComponent(campo.value.trim()); }
    });
    dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".busca-fechar")) dlg.close(); });
    document.addEventListener("keydown", e => {
      const digitando = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !digitando)) { e.preventDefault(); abre(); }
    });
  }

  // Barras de busca com sugestões enquanto a pessoa digita (Início e outras páginas).
  $$("form.busca-viva:not(.bp-form)").forEach(f => {
    const inp = $("input", f), sug = $(".bv-sug", f);
    let at = -1;
    const capa = f.closest(".hero");
    const fecha = () => { sug.hidden = true; inp.setAttribute("aria-expanded", "false"); at = -1; capa && capa.classList.remove("sug-on"); };
    const mostra = () => {
      const q = inp.value.trim(), rs = busca(q);
      if (!q) return fecha();
      sug.innerHTML = rs.slice(0, 7).map((r, i) => linha(r, q, i).replace(/ id="br-\d+"/, "").replace(' aria-selected="true"', "")).join("") + `<li class="br-mais"><a href="busca.html?q=${encodeURIComponent(q)}">${rs.length ? `Ver todos os ${rs.length} resultados →` : `Nenhum resultado para “${q.replace(/</g, "&lt;")}”`}</a></li>`;
      sug.hidden = false; inp.setAttribute("aria-expanded", "true"); at = -1; capa && capa.classList.add("sug-on");
    };
    inp.addEventListener("input", mostra);
    inp.addEventListener("focus", () => inp.value.trim() && mostra());
    inp.addEventListener("keydown", e => {
      const it = $$("a", sug);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { if (sug.hidden || !it.length) return; e.preventDefault(); at = (at + (e.key === "ArrowDown" ? 1 : -1) + it.length) % it.length; it.forEach((a, i) => a.parentElement.toggleAttribute("aria-selected", i === at)); }
      else if (e.key === "Enter" && at > -1 && it[at]) { e.preventDefault(); it[at].click(); }
      else if (e.key === "Escape") fecha();
    });
    document.addEventListener("click", e => { if (!f.contains(e.target)) fecha(); });
    $$(".bv-dicas button", f).forEach(b => b.addEventListener("click", () => { inp.value = b.textContent; inp.focus(); mostra(); }));
  });

  // Agenda ao vivo na capa da Início: próximas aulas e eventos do semestre.
  const ag = $("#agenda-viva");
  if (ag && globalThis.AGENDA) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const prox = AGENDA.map(x => ({ ...x, dt: new Date(x.d + "T00:00:00") })).filter(x => x.dt >= hoje).slice(0, 4);
    const falta = dt => { const n = Math.round((dt - hoje) / 864e5); return n === 0 ? "hoje" : n === 1 ? "amanhã" : `em ${n} dias`; };
    $(".ag-lista", ag).innerHTML = prox.length ? prox.map((x, i) => `<li${i === 0 ? ' class="ag-1"' : ""} style="--c:${x.c}"><time datetime="${x.d}"><b>${x.dt.getDate()}</b>${MES[x.dt.getMonth()]}</time><div><span class="ag-q">${SEM[x.dt.getDay()]} · ${x.h} · ${falta(x.dt)}</span><span class="ag-n">${x.n}</span></div></li>`).join("")
      : `<li class="ag-fim">O semestre terminou. O calendário do próximo semestre sai em breve.</li>`;
  }

  // Carrossel de chamadas na capa da Início.
  const car = $(".chamadas");
  if (car) {
    const itens = $$(".ch-item", car), pontos = $$(".ch-pontos button", car);
    let at = 0, timer;
    const vai = n => { at = (n + itens.length) % itens.length; itens.forEach((it, i) => { it.classList.toggle("on", i === at); it.setAttribute("aria-hidden", i !== at); it.querySelectorAll("a").forEach(a => a.tabIndex = i === at ? 0 : -1); }); pontos.forEach((p, i) => p.setAttribute("aria-current", i === at)); };
    const roda = () => { clearInterval(timer); if (!calmo) timer = setInterval(() => vai(at + 1), 6000); };
    pontos.forEach((p, i) => p.addEventListener("click", () => { vai(i); roda(); }));
    car.addEventListener("mouseenter", () => clearInterval(timer)); car.addEventListener("mouseleave", roda);
    car.addEventListener("focusin", () => clearInterval(timer));
    vai(0); roda();
  }
})();

// Contagem regressiva para eventos: <… data-contagem="AAAA-MM-DDTHH:MM:SS-04:00" [data-modo="caixas"]>.
(() => {
  const els = [...document.querySelectorAll("[data-contagem]")];
  if (!els.length) return;
  const pl = (n, s, p) => n + " " + (n === 1 ? s : p);
  const tick = () => els.forEach(el => {
    const ms = new Date(el.dataset.contagem) - Date.now();
    // data-dur: horas em que o evento segue "acontecendo"; data-fim: texto depois disso; data-rotulo: legenda das caixas.
    if (ms <= 0) { el.innerHTML = ms > -(+el.dataset.dur || 72) * 36e5 ? "<b>Acontecendo agora</b>" : (el.dataset.fim || "Evento encerrado"); return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    el.innerHTML = el.dataset.modo === "caixas"
      ? [[d, "dias"], [h, "horas"], [m, "min"]].map(([n, l]) => `<span><b>${n}</b>${l}</span>`).join("") + '<small>' + (el.dataset.rotulo || "para a abertura") + '</small>'
      : `Faltam <b>${pl(d, "dia", "dias")}</b> e ${pl(h, "hora", "horas")} para a abertura. Sala híbrida: presencial e ao vivo.`;
  });
  tick(); setInterval(tick, 30000);
  // Banca da página inicial: sai da capa quando termina.
  document.querySelectorAll("[data-ate]").forEach(el => { if (Date.now() > +el.dataset.ate) (el.closest("section[aria-labelledby=h-banca]") || el).remove(); });
})();

// Imprimir ou salvar em PDF: abre tudo o que está recolhido, mostra todas as abas e põe a data no cabeçalho do relatório.
(() => {
  const abertos = [];
  const antes = () => {
    const d = new Date(), c = document.querySelector(".print-cab .pc-data");
    if (c) c.textContent = "Gerado em " + d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " · " + location.href.replace(/[?#].*$/, "");
    document.querySelectorAll("details:not([open]):not(.pj-desc)").forEach(x => { x.open = true; abertos.push(x); });
    document.querySelectorAll(".rv").forEach(x => x.classList.add("in"));
    document.querySelectorAll("img[loading=lazy]").forEach(x => { x.loading = "eager"; });
  };
  const depois = () => { abertos.splice(0).forEach(x => { x.open = false; }); };
  addEventListener("beforeprint", antes); addEventListener("afterprint", depois);
  document.querySelectorAll(".impr-btn, .impr-btn2").forEach(b => b.addEventListener("click", () => { antes(); setTimeout(() => print(), 120); }));
})();

// Atlas na Início: troca o mapa a cada 5 s (pausa quando o cartão sai da tela ou a aba fica oculta).
(() => {
  const f = document.querySelector("[data-atlas-roda]"); if (!f) return;
  const im = [...f.querySelectorAll("img")], cp = [...f.querySelectorAll(".atlas-cap")], pt = [...f.querySelectorAll(".atlas-pts i")];
  let i = 0, vis = false, t = 0;
  const vai = () => { i = (i + 1) % im.length; [im, cp, pt].forEach(l => l.forEach((e, k) => e.classList.toggle("on", k === i))); };
  const liga = () => { clearInterval(t); if (vis && !document.hidden) t = setInterval(vai, 5000); };
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; liga(); }).observe(f);
  document.addEventListener("visibilitychange", liga);
  im.slice(1).forEach(x => { x.loading = "eager"; });
})();

// Idiomas: PT (original), EN, ES, FR e IT. A escolha fica guardada no navegador (ou vem de ?lang=xx).
// As traduções estão em i18n/<idioma>.json (gerado por gerador/i18n/gera.py): um dicionário de frases e regras
// para textos com números e nomes. Títulos de obras, nomes e referências ficam no original.
(() => {
  const L = ["pt", "en", "es", "fr", "it"], K = "ppgau-lang";
  const le = () => { try { return localStorage.getItem(K); } catch (e) { return null; } };
  const gr = v => { try { localStorage.setItem(K, v); return true; } catch (e) { return false; } };
  const q = new URLSearchParams(location.search).get("lang");
  if (q && L.includes(q)) gr(q);
  const lg = L.includes(q) ? q : L.includes(le()) ? le() : "pt";
  const html = document.documentElement;
  document.querySelectorAll(".idiomas a").forEach(a => {
    const on = a.dataset.lang === lg; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "true");
    a.addEventListener("click", e => { e.preventDefault(); const u = new URL(location.href); if (gr(a.dataset.lang)) u.searchParams.delete("lang"); else u.searchParams.set("lang", a.dataset.lang); location.href = u.href; });
  });
  document.querySelectorAll(".idioma-dd").forEach(d => {
    const b = d.querySelector("summary b"); if (b) b.textContent = lg.toUpperCase();
    document.addEventListener("click", e => { if (d.open && !d.contains(e.target)) d.open = false; });
    d.addEventListener("keydown", e => { if (e.key === "Escape") { d.open = false; d.querySelector("summary").focus(); } });
  });
  if (lg === "pt") { html.classList.remove("trad"); return; }
  const mostra = () => html.classList.remove("trad");
  setTimeout(mostra, 2500);
  fetch("i18n/" + lg + ".json").then(r => r.json()).then(T => {
    html.lang = lg;
    const D = T.d, R = T.r.map(([p, t]) => [new RegExp(p), t]), memo = new Map();
    const tr = s => {
      if (memo.has(s)) return memo.get(s);
      let o = D[s];
      if (o === undefined) for (const [re, t] of R) { const m = s.match(re); if (!m) continue;
        const g = (n, x) => { const v = m[+n] || ""; return x ? (tr(v) ?? v) : v; };
        o = t.replace(/\{(\d+)\?((?:[^{}]|\{\d+\*?\})*)\}/g, (_, n, dentro) => m[+n] ? dentro.replace(/\{(\d+)(\*)?\}/g, (_, k, x) => g(k, x)) : "")
             .replace(/\{(\d+)(\*)?\}/g, (_, k, x) => g(k, x));
        break; }
      memo.set(s, o ?? null); return o ?? null;
    };
    const traduz = txt => { const n = txt.replace(/\s+/g, " "), m = n.match(/^([\s/·←,]*)(.*?)([\s↗→·]*)$/); if (!m || !m[2]) return null; const o = tr(m[2]); return o == null ? null : m[1] + o + m[3]; };
    const PULA = "script,style,textarea,code,[translate=no]", AT = ["placeholder", "aria-label", "title", "alt"];
    const feito = new WeakMap();
    const faz = raiz => {
      const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); let n; const ns = [];
      while ((n = w.nextNode())) ns.push(n);
      for (const t of ns) { if (feito.get(t) === t.nodeValue) continue; const el = t.parentElement; if (!el || el.closest(PULA)) continue; const o = traduz(t.nodeValue); if (o != null && o !== t.nodeValue) t.nodeValue = o; feito.set(t, t.nodeValue); }
      const els = raiz.querySelectorAll ? [raiz, ...raiz.querySelectorAll("[placeholder],[aria-label],[title],img[alt]")] : [];
      for (const e of els) { if (!e.getAttribute || e.closest(PULA)) continue; for (const a of AT) { const v = e.getAttribute(a); if (!v || feito.get(e) === a + v) continue; const o = traduz(v); if (o != null && o !== v) e.setAttribute(a, o); } }
    };
    const t0 = traduz(document.title); if (t0) document.title = t0;
    faz(document.body); mostra();
    let fila = new Set(), agendado = 0;
    new MutationObserver(ms => { for (const m of ms) { if (m.type === "characterData") fila.add(m.target.parentElement || document.body); else m.addedNodes.forEach(x => fila.add(x.nodeType === 3 ? x.parentElement || document.body : x)); }
      if (!agendado) agendado = requestAnimationFrame(() => { agendado = 0; const f = fila; fila = new Set(); f.forEach(x => x && x.isConnected && faz(x)); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }).catch(mostra);
})();

// Abas por ano (artigos nas páginas dos docentes): mostra só os itens do ano escolhido, ou todos.
document.querySelectorAll("[data-filtro-ano]").forEach(box => {
  const lista = document.getElementById(box.dataset.filtroAno); if (!lista) return;
  const itens = [...lista.querySelectorAll("li[data-ano]")], vazio = lista.querySelector(".art-vazio");
  const mostra = y => { let n = 0; itens.forEach(li => { const ok = y === "todos" || li.dataset.ano === y; li.hidden = !ok; n += ok; });
    if (vazio) vazio.hidden = n > 0; box.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", b.dataset.ano === y)); };
  box.addEventListener("click", e => { const b = e.target.closest("button[data-ano]"); if (b) mostra(b.dataset.ano); });
  const ini = box.querySelector('button[aria-selected="true"]'); mostra(ini ? ini.dataset.ano : "todos");
});
