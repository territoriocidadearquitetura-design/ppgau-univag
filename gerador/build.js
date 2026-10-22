// Gera o site institucional estático do PPGAU UNIVAG a partir dos dados do portal "em dados".
// Uso: node build.js <pasta do portal PPGAU-DADOS> <pasta de saída>
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const [SRC, OUT] = process.argv.slice(2).map(p => path.resolve(p));
if (!SRC || !OUT) { console.error("uso: node build.js <portal> <saida>"); process.exit(1); }

// ---------- dados do portal ----------
const ctx = { console, window: {}, document: { getElementById: () => null, addEventListener() {} }, location: { hash: "" } };
vm.createContext(ctx);
for (const f of ["questoes", "ficha", "emdados", "fichas", "impacto", "pessoas", "historia", "projlattes", "prodlattes", "prod"])
  vm.runInContext(fs.readFileSync(path.join(SRC, f + ".js"), "utf8"), ctx, { filename: f + ".js" });
const D = n => vm.runInContext(n, ctx);
const BASE = D("BASE"), PG_INFO = D("PG_INFO"), PG_DOCS = D("PG_DOCS"), FICHA_DOC = D("FICHA_DOC"), PESSOAS = D("PESSOAS"),
  HIST = D("HIST"), HIST_CAT = D("HIST_CAT"), PROJ = D("PROJ"), IMPACTO = D("IMPACTO"), EVENTOS = D("EVENTOS"), REDE = D("REDE"), ATUALIZ = D("ATUALIZ");

const WIX = "https://www.univag-ppgau.com";
// PDFs do site antigo que a coordenação enviou: servidos do próprio site (pasta docs/); os demais seguem no Wix.
const PDF_LOCAL = { "3d11ab1fd9d74f5ca3c9e8883a53069a": "docs/autoavaliacao-2021-2024.pdf", c9868e03fc454c169e8471920264f98a: "docs/planejamento-estrategico-2021-2024.pdf", c7daeecd74004ba99c64154df7877580: "docs/memorando-aulas-remotas.pdf", c32c56de7e2a4fdabd1ddb64cb534d62: "docs/edital-mestrado-2026-2-remanescentes.pdf", "250868416ab44b9c932939923d3c11a4": "docs/regulamento-pos-doutorado.pdf", "5e7fb1b2d12c48ed8cfc1a8fdc623c1b": "docs/calendario-2025-1.pdf", a3d1f7f3c3c347288876767e1a9ac492: "docs/anais-tcha-pesquisa.pdf", "175ba2c2abf545dd953c4d4797ee185f": "docs/e-book-100-pracas-de-cuiaba.pdf" };
const PDF = id => PDF_LOCAL[id] || `${WIX}/_files/ugd/036f6f_${id}.pdf`;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slugN = n => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\W+/g, "-").replace(/^-|-$/g, "");
const semAc = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ext = (href, txt) => `<a href="${esc(href)}" target="_blank" rel="noopener">${txt}</a>`;
const titulo = s => String(s).toLowerCase().replace(/(^|[\s(\-–:"“])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase())
  .replace(/\b(De|Da|Do|Das|Dos|E|Em|Na|No|Nas|Nos|A|O|As|Os|Para|Por|Com|Sua|Seu|Um|Uma|Ao|Aos|À|Às|Sobre|Entre)\b/g, w => w.toLowerCase())
  .replace(/^./, c => c.toUpperCase()).replace(/\b(Mt|Sp|Ms)\b/g, w => w.toUpperCase()).replace(/\bcuiabá\b/gi, "Cuiabá");
const iniciais = n => n.split(" ").filter(w => w.length > 2).map(w => w[0]).slice(0, 2).join("");
const linhas = BASE.programa.find(x => x[0] === "Linhas de pesquisa")[1].split("; ");
const dados = (hash = "inicio") => `dados/#/portal/${hash}`;

// Data de atualização mostrada em cada página: a data dos dados de que ela é feita (portal, Lattes, calendário)
// ou, nas páginas editadas aqui, a data em que o site foi gerado.
const HOJE = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Cuiaba" }), AZ = ATUALIZ.secoes || {};
const ATZ = {
  "programa.html": [AZ.programa, "portal PPGAU em dados"], "pessoas.html": [AZ.pessoas, "portal PPGAU em dados e Lattes"], "egressos.html": [AZ.pessoas, "portal PPGAU em dados e Lattes"],
  "producao.html": [AZ.producao, "Currículos Lattes e portal PPGAU em dados"], "mapa.html": [AZ.producao, "Currículos Lattes dos docentes"], "eventos.html": [AZ.impacto, "portal PPGAU em dados"], "impacto.html": [AZ.impacto, "Lattes dos docentes, site do programa, Even3 e ANAP"], "titulacao.html": [AZ.formacao, "Coleta CAPES e site do programa"],
  "linha-do-tempo.html": [AZ.historia, "portal PPGAU em dados"], "disciplinas.html": ["22/07/2026", "Calendário Acadêmico do II Semestre de 2026, versão 7"],
  "revista.html": [HOJE, "site da Revista Vernácula (último número: v. 3, n. 11)"], "area-professor.html": ["20/10/2026", "painel dos professores do portal"], "painel-coordenacao.html": [AZ.capes, "Ficha de Avaliação CAPES, Quadrienal 2025"]
};
const atzDe = arq => ATZ[arq] || (/^docente-/.test(arq) ? [AZ.docentes, "Currículo Lattes e portal PPGAU em dados"] : [HOJE, "coordenação do PPGAU"]);

// ---------- layout ----------
const VER = Date.now().toString(36);
const NAV = [
  ["index.html", "Início"], ["programa.html", "O programa"], ["pessoas.html", "Pessoas"], ["ingresso.html", "Ingresso"], ["academico.html", "Acadêmico"], ["disciplinas.html", "Disciplinas"], ["titulacao.html", "Ingresso e titulação"], ["bancas.html", "Bancas"], ["producao.html", "Produção"], ["impacto.html", "Impacto"],
  ["premiacoes.html", "Premiações"], ["eventos.html", "Eventos"], ["revista.html", "Revista"], ["livros.html", "Livros"], ["mapa.html", "Mapa da produção"], ["linha-do-tempo.html", "Linha do tempo"], ["dados/", "PPGAU em dados"], ["contato.html", "Contato"]
];
const svg = (d, w = 20) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICO = {
  busca: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 18),
  lua: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', 18).replace("<svg", '<svg class="i-lua"'),
  sol: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 18).replace("<svg", '<svg class="i-sol"'),
  subir: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  programa: svg('<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>', 26),
  pessoas: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 6 4.8"/>', 26),
  producao: svg('<path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5M8 13h8M8 17h6"/>', 26),
  tempo: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 26),
  rede: svg('<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M11 7.2 6.2 15.8M13 7.2l4.8 8.6M7.5 18h9"/>', 26),
  eventos: svg('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>', 26),
  agenda: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h3M14 14h3"/>', 26),
  academico: svg('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>', 26),
  dados: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', 26),
  seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
  baixar: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', 16),
  prancheta: svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4"/>', 18),
  cadeado: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 18),
  imprimir: svg('<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z"/>', 18),
  relogio: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 15),
  livros: svg('<path d="M4 19V5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2zM11 3h3v18h-3M14 5l4-1 3 15-4 1z"/>', 26)
};
const BUSCA_VIVA = (dicas = []) => `<form class="busca-viva" action="busca.html" role="search"><label class="bv-campo">${ICO.busca}<input name="q" type="search" placeholder="O que você procura? Professor, disciplina, edital, livro…" autocomplete="off" aria-label="Buscar no site" aria-expanded="false" aria-autocomplete="list"><button type="submit">Buscar</button></label><ul class="bv-sug" role="listbox" hidden></ul>${dicas.length ? `<div class="bv-dicas"><span>Experimente:</span>${dicas.map(d => `<button type="button">${d}</button>`).join("")}</div>` : ""}</form>`;
// Linhas de nível (curvas topográficas) que se movem devagar no fundo das faixas de título.
const DECO = `<svg class="hero-deco" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2">${Array.from({ length: 9 }, (_, i) => { const r = 60 + i * 46; return `<path d="M${900 - r} 200 C ${900 - r} ${200 - r * 1.1}, ${900 + r * 1.2} ${200 - r * .9}, ${900 + r} 200 S ${900 - r * .7} ${200 + r * 1.15}, ${900 - r} 200 Z"/>`; }).join("")}${Array.from({ length: 6 }, (_, i) => { const r = 40 + i * 38; return `<path d="M${180 - r} 330 C ${180 - r} ${330 - r}, ${180 + r * 1.3} ${330 - r * .8}, ${180 + r} 330 S ${180 - r * .6} ${330 + r}, ${180 - r} 330 Z"/>`; }).join("")}</g></svg>`;
const REDES = [["Facebook do UNIVAG", "https://www.facebook.com/univag", '<path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H8.3v3.2h2.6V22H14v-10.3h2.6l.4-3.2z" fill="currentColor"/>'],
  ["Instagram do PPGAU", "https://www.instagram.com/ppgau.univag/", '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/>'],
  ["YouTube da TV UNIVAG", "https://www.youtube.com/@TVUNIVAG1", '<path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z" fill="currentColor"/>'],
  ["LinkedIn do UNIVAG", "https://www.linkedin.com/company/univag-oficial/home/", '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z" fill="currentColor"/>']];
const redesHtml = cls => `<ul class="redes ${cls}" aria-label="Redes sociais">${REDES.map(([n, u, d]) => `<li><a href="${u}" target="_blank" rel="noopener" title="${n}" aria-label="${n}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${d}</svg></a></li>`).join("")}</ul>`;
// Faixa institucional do UNIVAG, como no site antigo
const UNIVAG_MENU = [["Graduação", "https://www.univag.com.br/cursos/1/graduacao/areas/"], ["Pós-Graduação", "https://www.univag.com.br/cursos/2/pos-graduacao/areas/"], ["Extensão", "https://portalmatricula.univag.edu.br/cursos.aspx?portal=extensao"], ["Pesquisa", "https://www.univag.com.br/pesquisa-e-extensao/4/pesquisa-cientifica-e-producao-de-conhecimento/"], ["Publicações", "https://periodicos.univag.com.br/index.php/index/index"], ["Avaliação Institucional", "https://www.univag.com.br/sobre-o-univag/20/avaliacao-institucional/"], ["Univag EAD", "https://univagead.com.br/"], ["Univag Idiomas", "https://univagidiomas.com.br/"], ["Estrutura", "https://www.univag.com.br/sobre-o-univag/19/conheca-o-campus/"], ["Ouvidoria", "https://portalouvidoria.univag.edu.br"]];
function pagina({ arq, titulo: t, desc, hero, corpo, js, scripts }) {
  const navLi = ([h, l]) => `<li><a href="${h}"${h === arq ? ' aria-current="page"' : ""}>${l}</a></li>`;
  const acadSub = () => `<div class="nav-sub" role="menu">${(globalThis.__ACAD || []).map(([g, L]) => `<div><b>${g}</b>${L.map(([t, h]) => `<a role="menuitem" href="${h}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : /^docs\//.test(h) ? " download" : ""}>${t}${/^https?:/.test(h) ? " ↗" : /^docs\//.test(h) ? ` <small class="nav-fmt">${h.split(".").pop().toUpperCase()}</small>` : ""}</a>`).join("")}</div>`).join("")}</div>`;
  const nav = NAV.filter(([h]) => h !== "contato.html").map(([h, l]) => `${h === "premiacoes.html" ? '<li class="nav-quebra" aria-hidden="true"></li>' : ""}${h === "academico.html" ? `<li class="nav-dd"><a href="${h}"${h === arq ? ' aria-current="page"' : ""} aria-haspopup="true">${l} <i aria-hidden="true">▾</i></a>${acadSub()}</li>` : `<li><a href="${h}"${h === arq ? ' aria-current="page"' : ""}>${l}</a></li>`}`).join("");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}${arq === "index.html" ? "" : " · PPGAU UNIVAG"}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#02205f">
<link rel="icon" href="img/logo-ppgau.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="site.css?v=${VER}">
<script>try{var l=new URLSearchParams(location.search).get("lang")||localStorage.getItem("ppgau-lang");if(l&&l!=="pt"&&/^(en|es|fr|it)$/.test(l))document.documentElement.classList.add("trad")}catch(e){}</script>
</head>
<body${arq === "relatorio.html" ? ' class="relatorio-pg"' : ""}>
<a class="skip" href="#conteudo">Ir para o conteúdo</a>
<div class="print-cab" aria-hidden="true"><img src="img/logo-ppgau.png" alt=""><div><b>${esc(t)}</b><span>PPGAU UNIVAG · Informações atualizadas em ${atzDe(arq)[0] || HOJE} (${atzDe(arq)[1]}) · <span class="pc-data"></span></span></div><img src="img/logo-univag.png" alt=""></div>
<nav class="univag-barra" aria-label="UNIVAG"><div class="wrap"><a class="ub-marca" href="https://www.univag.com.br/" target="_blank" rel="noopener">UNIVAG</a>${UNIVAG_MENU.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join("")}</div></nav>
<div class="brand"><div class="wrap"><a href="index.html"><img class="lg-ppgau" src="img/logo-ppgau.png" width="600" height="154" alt="PPGAU, Programa de Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo"></a><div class="brand-dir"><nav class="restrito" aria-label="Acesso restrito"><span class="rs-t">Acesso restrito</span><a class="prof-btn" href="painel-coordenacao.html"${arq === "painel-coordenacao.html" ? ' aria-current="page"' : ""} title="Painel da coordenação (acesso restrito)">${ICO.prancheta}<span>Painel da coordenação</span></a><a class="prof-btn" href="area-professor.html"${arq === "area-professor.html" ? ' aria-current="page"' : ""} title="Painel dos professores (acesso restrito)">${ICO.cadeado}<span>Painel dos professores</span></a></nav><div class="brand-un"><img class="lg-univag" src="img/logo-univag.png" width="327" height="169" alt="UNIVAG Centro Universitário">${redesHtml("rd-topo")}</div></div></div></div>
<header class="top" id="top"><div class="wrap">
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Menu</button>
<nav aria-label="Principal"><ul class="nav" id="menu">${nav}${NAV.filter(([h]) => h === "contato.html").map(navLi).join("")}</ul></nav>
<div class="acoes"><details class="idioma-dd"><summary aria-label="Idioma / Language" title="Idioma / Language"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg><b translate="no">PT</b><i class="dd-seta" aria-hidden="true">▾</i></summary><nav class="idiomas" aria-label="Idioma" translate="no"><a href="?lang=pt" data-lang="pt" hreflang="pt-BR" lang="pt-BR" title="Português">PT</a><a href="?lang=en" data-lang="en" hreflang="en" lang="en" title="English">EN</a><a href="?lang=es" data-lang="es" hreflang="es" lang="es" title="Español">ES</a><a href="?lang=fr" data-lang="fr" hreflang="fr" lang="fr" title="Français">FR</a><a href="?lang=it" data-lang="it" hreflang="it" lang="it" title="Italiano">IT</a></nav></details><button class="busca-btn" type="button" aria-label="Buscar no site (Ctrl+K)" title="Buscar no site (Ctrl+K)">${ICO.busca}<span>Buscar</span></button><button class="tema-btn" type="button" aria-label="Modo escuro" aria-pressed="false" title="Alternar modo claro e escuro">${ICO.lua}${ICO.sol}</button></div>
</div><div class="progresso" aria-hidden="true"><i></i></div></header>
<div class="hero${hero.kpis ? " has-kpis" : ""}${hero.lado ? " hero-lado" : ""}"><div class="hero-fundo" aria-hidden="true">${DECO}</div><div class="wrap"><div class="hero-t">${hero.crumb ? `<div class="crumb"><a href="index.html">Início</a> / ${esc(t)}</div>` : ""}<div class="eyebrow">${hero.eyebrow || "Mestrado acadêmico · Várzea Grande, MT"}</div><h1>${hero.h1 || esc(t)}</h1>${hero.p ? `<p>${hero.p}</p>` : ""}${hero.btns || ""}<p class="impr-hero"><button type="button" class="impr-btn2">${ICO.imprimir}Imprimir ou salvar esta página em PDF</button>${arq === "relatorio.html" ? "" : `<a href="relatorio.html">Relatório geral do programa</a>`}</p></div>${hero.lado || ""}</div></div>
<main id="conteudo"><div class="wrap">
${corpo}
</div></main>
<footer class="rodape">
<div class="wrap">
<div><h4>PPGAU UNIVAG</h4><p>Programa de Pós-Graduação <em>Stricto Sensu</em> em Arquitetura e Urbanismo</p><p>Mestrado acadêmico · Código CAPES 50014013001P9 · Nota 3</p>${redesHtml("rd-rodape")}</div>
<div><h4>Endereço</h4><p>UNIVAG Centro Universitário<br>Av. Dom Orlando Chaves, 2.655<br>Cristo Rei, Várzea Grande, MT<br>CEP 78118-900</p></div>
<div><h4>Contato</h4><ul class="rd-ct"><li><a href="tel:+556536886110">(65) 3688-6110</a></li><li><a href="mailto:jeane.godoy@univag.edu.br">jeane.godoy@univag.edu.br</a></li><li><a href="mailto:angelo.palmisano@univag.edu.br">angelo.palmisano@univag.edu.br</a></li></ul></div>
<div class="rd-nav"><h4>Navegue</h4><ul><li><a href="disciplinas.html">Disciplinas e horários</a></li><li><a href="academico.html">Acadêmico</a></li><li><a href="dados/">PPGAU em dados</a></li><li><a href="dados/#/responder">Autoavaliação</a></li><li><a href="bancas.html">Bancas e defesas</a></li><li><a href="egressos.html">Egressos</a></li><li><a href="noticias.html">Notícias</a></li><li><a href="premiacoes.html">Premiações</a></li><li><a href="galeria.html">Galeria de fotos</a></li><li><a href="documentos.html">Documentos</a></li><li><a href="revista.html">Revista Vernácula</a></li><li>${ext("https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/issue/archive", "Repositório de dissertações")}</li></ul></div>
</div>
<div class="legal"><div class="wrap"><p>© 2026 PPGAU/UNIVAG · Coordenação: Profa. Dra. Jeane Aparecida Rombi de Godoy · Coordenação adjunta: Prof. Dr. Angelo Palmisano</p><p>Desenvolvimento, programação e implementação do website institucional: Profa. Dra. Sandra Medina Benini (PPGAU/UNIVAG, 2026)</p></div></div>
</footer>
<button class="subir" type="button" aria-label="Voltar ao topo">${ICO.subir}</button>
<dialog id="busca" aria-label="Buscar no site"><div class="busca-box"><div class="busca-topo"><label class="busca-campo">${ICO.busca}<input id="busca-q" type="search" placeholder="Buscar pessoas, disciplinas, dissertações, páginas…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="busca-res"></label><button class="busca-fechar" type="button" aria-label="Fechar a busca"><kbd>Esc</kbd></button></div><ul id="busca-res" role="listbox"></ul><p class="busca-dica"><kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Ctrl</kbd>+<kbd>K</kbd> ou <kbd>/</kbd> para buscar de qualquer página</p></div></dialog>
<script>
document.querySelector(".menu-btn").addEventListener("click",e=>{const t=document.getElementById("top"),o=t.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",o)});
${js || ""}</script>
${(scripts || []).map(f => `<script src="${f}"></script>`).join("\n")}
<script src="busca-dados.js" defer></script><script src="ui.js?v=${VER}" defer></script>
<!-- VLibras: tradução para Libras (Governo Federal) -->
<div vw class="enabled" translate="no"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>
<script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
<script>try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) {}</script>
</body>
</html>
`;
}
// Filtro de lista por texto e seleção, usado em páginas com listas longas.
const FILTRO_JS = `
document.querySelectorAll("[data-filtro]").forEach(f=>{const alvo=document.getElementById(f.dataset.filtro),itens=[...alvo.querySelectorAll("[data-busca]")],vz=document.querySelector('[data-vazio="'+f.dataset.filtro+'"]');
const norm=s=>s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();
const ap=()=>{const q=norm(f.querySelector("input").value),s=[...f.querySelectorAll("select")];let n=0;itens.forEach(i=>{const ok=norm(i.dataset.busca).includes(q)&&s.every(x=>!x.value||(i.dataset[x.name]||"").split("|").includes(x.value));i.hidden=!ok;if(ok)n++});if(vz)vz.style.display=n?"none":"block"};
f.addEventListener("input",ap)});`;

// ---------- blocos reutilizados ----------
const corpo = BASE.corpo.map(([n, tit, lat, orc, foto]) => ({ n, tit, lat, orc, foto, f: FICHA_DOC[n] || {} }));
const coord = ["Jeane Aparecida Rombi de Godoy", "Angelo Palmisano"].map(n => corpo.find(d => d.n === n));
function cartaoDocente(d) {
  const links = [["Lattes", d.lat], ["ORCID", d.orc], ...(d.f.links || []).filter(l => !/lattes|orcid/i.test(l[0]))].filter(l => l[1]);
  return `<article class="card pessoa" id="${esc(d.n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\W+/g, "-"))}">
  ${d.foto ? `<img src="img/${esc(d.foto)}" width="84" height="84" loading="lazy" alt="Foto de ${esc(d.n)}">` : `<span class="ini">${iniciais(d.n)}</span>`}
  <div><h3><a href="docente-${slugN(d.n)}.html">${esc(d.n)}</a></h3><p class="meta">${esc(d.tit)}</p>
  ${d.f.email ? `<p class="links"><a href="mailto:${esc(d.f.email)}">${esc(d.f.email)}</a></p>` : ""}
  <p class="links">${links.map(([l, h]) => ext(h, esc(l))).join("")}<a href="docente-${slugN(d.n)}.html">Página completa</a><a href="${dados("docentes/" + encodeURIComponent(d.n))}">Produção em dados</a></p></div></article>`;
}
const docCard = (href, t, d, out) => `<li>${out ? ext(href, esc(t) + " ↗") : `<a href="${esc(href)}">${esc(t)}</a>`}${d ? ` <span class="meta">${esc(d)}</span>` : ""}</li>`;

// Mapa de localização do UNIVAG Sede, com rotas.
const END = "UNIVAG Centro Universitário, Av. Dom Orlando Chaves, 2655, Cristo Rei, Várzea Grande, MT, 78118-900";
const LOCAL = `<div class="local card"><div class="local-map"><p class="local-alt">Mapa do UNIVAG Sede, Várzea Grande, MT. Se não aparecer, use os botões ao lado.</p><iframe title="Mapa: localização do UNIVAG Centro Universitário em Várzea Grande, MT" src="https://maps.google.com/maps?q=${encodeURIComponent(END)}&z=15&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
<div class="local-info"><h3>Onde fica o UNIVAG</h3><p>UNIVAG Centro Universitário, Sede, Bloco C<br>Av. Dom Orlando Chaves, 2.655, Cristo Rei<br>Várzea Grande, MT, CEP 78118-900</p><p class="meta">As aulas do mestrado são às sextas à noite e aos sábados de manhã e à tarde.</p>
<p class="local-btns">${ext("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(END), "Como chegar (Google Maps)")}${ext("https://waze.com/ul?q=" + encodeURIComponent("UNIVAG Centro Universitário Várzea Grande") + "&navigate=yes", "Abrir no Waze")}${ext("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(END), "Ver mapa ampliado")}</p></div></div>`;

// ---------- páginas ----------
// Banners e páginas do Even3 enviados pela coordenação para eventos que já estão no portal (chave: início do nome).
const AJUSTE = { "1º Seminário Nacional sobre a Educação Ambiental": { pagina: "https://www.even3.com.br/e/ea_cidadeverde-322673", banner: ["img/eventos/cidade-verde-2023.jpg", 1100, 440] },
  "1º Simpósio Brasileiro \"Território": { pagina: "https://www.even3.com.br/e/1-simposio-brasileiro-de-territorio-cidade-e-arquitetura-351668", banner: ["img/eventos/territorio-2023.jpg", 1100, 440] },
  "3º Simpósio Brasileiro \"Território": { nome: "3º Simpósio Brasileiro \"Arquitetura, Cidade e Território\"", ano: 2026, datas: "04 a 06/11/2026", local_formato: "Várzea Grande-MT (cidade anfitriã)", ppgau_papel: "organizador", organizacao: ["PPGAU UNIVAG"], lema: "Territórios em transformação, cidades em construção.", pagina: "https://www.even3.com.br/3-simposio-brasileiro-territorio-cidade-e-arquitetura-757882/", banner: ["img/eventos/territorio-2026.jpg", 1100, 440] },
  "IV Simpósio Brasileiro Cidade, Paisagem": { nome: "IV Simpósio Brasileiro Cidade, Paisagem e a Natureza e 1st International Congress Landscape, Urban Space and Sustainability", pagina: "https://www.even3.com.br/e/congress-landscape-568015", banner: ["img/eventos/paisagem-2025.jpg", 1100, 440],
    organizacao: ["ANAP; PPGARQ, FAAC e UNESP; PPGAU UNIVAG"], apoio: "cerca de 30 instituições, entre elas ABAP, UFC, FAU-USP, UFBA, UFMG, UnB, UFSCar, IFSP, UNILINS, Mackenzie, PUC-Campinas, UFRJ, Uninove, São Judas, UFPR, Universidade do Porto, UEMA, Universidad Nacional de La Plata, Universidad Central e Universidad Politécnica de Madrid",
    abrangencia: "nacional e internacional, com comissão de Brasil, Espanha, Argentina, Portugal e Guatemala", paises: REDE.congresso.paises.map(([p, n]) => `${p} (${n})`).join(", "), coord: REDE.congresso.coord, parcerias: ["img/eventos/paisagem-2025-parcerias.jpg", 743, 832] },
  "1st International Congress Landscape": { oculto: true },
  "2º Simpósio Brasileiro \"Território": { pagina: "https://www.even3.com.br/e/simposio-territorio-2024-446534", banner: ["img/eventos/territorio-2024.jpg", 1100, 440] },
  "IV Encontro Técnico e Científico": { pagina: "https://www.even3.com.br/e/cidadesverdes2024-412828", banner: ["img/eventos/cidades-verdes-2024.jpg", 1100, 440] },
  "Tchá Pesquisa": { pagina: "https://www.even3.com.br/e/tcha-pesquisa-431418", banner: ["img/eventos/tcha-2024.jpg", 1100, 440], anais: { link: "docs/anais-tcha-pesquisa.pdf" } },
  "II Latin American Symposium": { pagina: "https://www.even3.com.br/e/city-architecture-and-sustainability-2024-427680", banner: ["img/eventos/latin-american-2024.jpg", 1100, 440] },
  "II Congresso Brasileiro \"Mudanças": { pagina: "https://www.even3.com.br/e/congresso-resilienciaurbana2025", banner: ["img/eventos/resiliencia-2025.jpg", 1100, 440] },
  "I Congresso Brasileiro \"Mudanças": { banner: ["img/eventos/resiliencia-2024.jpg", 1100, 440] } };
for (const e of EVENTOS) { const k = Object.keys(AJUSTE).find(k => e.nome.startsWith(k)); if (k) Object.assign(e, AJUSTE[k]); }

// Destaque do próximo evento organizado pelo programa (Início e Eventos).
const SIMP_DEST = id => `<section class="blk sd" aria-labelledby="${id}"><h2 id="${id}">Próximo evento do programa</h2>
<div class="sd-card"><a class="sd-ban" href="https://www.even3.com.br/3-simposio-brasileiro-territorio-cidade-e-arquitetura-757882/" target="_blank" rel="noopener"><img src="img/eventos/territorio-2026.jpg" width="1100" height="440" alt="3º Simpósio Brasileiro Arquitetura, Cidade e Território, 4 a 6 de novembro de 2026, Várzea Grande (MT)"></a>
<div class="sd-t"><div class="sd-l"><span class="eyebrow">Organização do PPGAU UNIVAG · 3ª edição</span><h3>3º Simpósio Brasileiro “Arquitetura, Cidade e Território”</h3>
<p class="sd-lema">Territórios em transformação, cidades em construção.</p>
<div class="evd-cont" data-contagem="2026-11-04T09:00:00-04:00" data-modo="caixas" aria-live="off"></div>
<div class="evd-btns"><a class="btn" href="https://www.even3.com.br/3-simposio-brasileiro-territorio-cidade-e-arquitetura-757882/" target="_blank" rel="noopener">Inscrições, programação e submissão ${ICO.seta}</a><a class="btn sec" href="simposio-2026.ics" download>Salvar na agenda</a></div></div><dl class="sd-dl"><div><dt>Quando</dt><dd>4, 5 e 6 de novembro de 2026, das 9h às 17h</dd></div><div><dt>Onde</dt><dd>Centro Universitário UNIVAG, Várzea Grande (MT), cidade anfitriã. Sala híbrida: presencial e ao vivo on-line</dd></div><div><dt>Para quem</dt><dd>Pesquisadores, docentes, estudantes e profissionais de arquitetura, urbanismo e áreas afins. Faz parte do calendário acadêmico de todas as turmas do mestrado</dd></div><div><dt>Edições anteriores</dt><dd><a href="https://static.even3.com/download/AnaisdoSimpsioBrasileiro-TerritrioCidadeeArquitetura.331cc8799c1f4ff1b580.pdf" target="_blank" rel="noopener">Anais 2023</a> · <a href="https://static.even3.com/download/Anaisdo2SimpsioBrasileiro-TerritrioCidadeeArquitetura.1cea4b89573843ac88e7.pdf" target="_blank" rel="noopener">Anais 2024</a></dd></div></dl></div></div></section>`;
const P = [];

// Início
{
  const k = BASE.kpis;
  const ev = [...EVENTOS].sort((a, b) => b.ano - a.ano).slice(0, 3);
  const CALI = JSON.parse(fs.readFileSync(path.join(__dirname, "calendario.json"), "utf8"));
  const corCat = n => /Semin[áa]rios Avan/i.test(n) ? "#8e5cd9" : /Arquitetura e Cidade/i.test(n) ? "#2a78d6" : /Teoria e Hist/i.test(n) ? "#eb6834" : /Pol[íi]ticas/i.test(n) ? "#1baf7a" : /Semin[áa]rio de Pesquisa/i.test(n) ? "#c99700" : /Simp[óo]sio/i.test(n) ? "#b4447a" : "#febf01";
  const hCurta = h => String(h || "").replace(/\s*h\b/g, "h").replace(/:00h/g, "h").replace(/\s*às\s*/, "–");
  const vistos = new Set(), AGENDA = [];
  for (const x of CALI.sessoes) { if (!x.data) continue; const k = x.data + x.nome; if (vistos.has(k)) continue; vistos.add(k); AGENDA.push({ d: x.data, h: hCurta(x.h), n: x.nome, c: corCat(x.cat + " " + x.nome) }); }
  AGENDA.sort((a, b) => a.d.localeCompare(b.d) || a.h.localeCompare(b.h));
  const lado = `<div class="chamadas" aria-roledescription="carrossel" aria-label="Chamadas do programa">
<div class="ch-item ch-agenda" id="agenda-viva"><div class="ch-cab"><span class="ao-vivo"><i></i>Agenda do semestre</span><a href="disciplinas.html">Ver tudo</a></div><ol class="ag-lista"><li class="ag-fim">Veja as próximas aulas em <a href="disciplinas.html">Disciplinas e horários</a>.</li></ol></div>
<div class="ch-item"><span class="ch-tag">4 a 6 de novembro de 2026</span><h2>3º Simpósio Brasileiro Arquitetura, Cidade e Território</h2><p class="ch-cont" data-contagem="2026-11-04T09:00:00-04:00"></p><a class="btn" href="https://www.even3.com.br/3-simposio-brasileiro-territorio-cidade-e-arquitetura-757882/" target="_blank" rel="noopener">Inscrições e programação ${ICO.seta}</a></div>
<div class="ch-item"><span class="ch-tag">Até 03/11/2026</span><h2>Autoavaliação 2026</h2><p>Questionário anônimo para estudantes, egressos, docentes e equipe. Leva poucos minutos.</p><a class="btn" href="dados/#/responder">Responder ${ICO.seta}</a></div>
<div class="ch-item"><span class="ch-tag">Revista Vernácula · Qualis B2</span><h2>Publique na Vernácula</h2><p>Revista trimestral do programa, com DOI em todos os artigos. Conheça os 11 números publicados.</p><a class="btn" href="revista.html">Conhecer a revista ${ICO.seta}</a></div>
<div class="ch-pontos">${["Agenda", "Simpósio", "Autoavaliação", "Revista"].map((l, i) => `<button type="button" aria-label="${l}"><span>${l}</span></button>`).join("")}</div>
</div>`;
  P.push({
    arq: "index.html", titulo: "PPGAU UNIVAG",
    desc: "Programa de Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo do UNIVAG, Várzea Grande, MT. Mestrado acadêmico, nota CAPES 3.",
    hero: { kpis: true, eyebrow: "Mestrado acadêmico · Várzea Grande, MT · Nota CAPES 3", h1: "Programa de Pós-Graduação em Arquitetura e Urbanismo",
      p: "Área de concentração Arquitetura, Cidade e Território. Aulas híbridas às sextas à noite e aos sábados, em 24 meses, no UNIVAG Centro Universitário.",
      btns: `<a class="auto-dest" href="dados/#/responder"><span class="ad-ic">${ICO.academico}</span><span><b>Autoavaliação 2026 · responda até 03/11</b><small>Questionário anônimo para estudantes, egressos, docentes e equipe. Leva poucos minutos.</small></span><span class="ad-seta">${ICO.seta}</span></a>${BUSCA_VIVA()}`, lado },
    js: "globalThis.AGENDA = " + JSON.stringify(AGENDA) + ";",
    corpo: `
<div class="kpis"><div class="kpi gold"><span>Nota CAPES</span><b>3</b><small>Quadrienal 2025 · 2021–2024</small></div>
${k.map(x => `<div class="kpi"><span>${esc(x[0])}</span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div>`).join("")}</div>

<section class="blk" aria-labelledby="h-dest"><h2 id="h-dest" class="vh">Destaques</h2>
<a class="atlas" href="https://editoraanap-tupa.github.io/atlas/" target="_blank" rel="noopener">
${(() => { const AM = JSON.parse(fs.readFileSync(path.join(__dirname, "atlas-mapas.json"), "utf8")); return `<figure class="atlas-map" data-atlas-roda>${AM.leg.map((l, i) => `<img class="${i ? "" : "on"}" src="img/atlas-mapa-${l.k}.svg" width="${AM.W}" height="${AM.H}" ${i ? 'loading="lazy" ' : ""}alt="Mapa dos setores urbanos da conurbação Cuiabá–Várzea Grande: ${esc(l.t)}, com o Rio Cuiabá e o Rio Coxipó em azul">`).join("")}
<span class="atlas-onde">Conurbação Cuiabá–Várzea Grande</span>
<figcaption>${AM.leg.map((l, i) => `<span class="atlas-cap${i ? "" : " on"}"><span>${esc(l.t)}</span>${l.itens ? `<span class="atlas-leg-i">${l.itens.map(([c, t, f]) => `<small><i class="${f}" style="--c:${c}"></i>${esc(t)}</small>`).join("")}</span>` : `<span class="atlas-leg">${l.cor.map(c => `<i style="background:${c}"></i>`).join("")}</span><span class="atlas-leg-t"><small>${esc(l.ini)}</small><small>${esc(l.fim)}</small></span>`}</span>`).join("")}<span class="atlas-pts" aria-hidden="true">${AM.leg.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</span></figcaption></figure>`; })()}
<div class="atlas-t"><span class="eyebrow">Novo · Atlas digital interativo</span><h3>Atlas Socioambiental da Região Metropolitana do Vale do Rio Cuiabá</h3>
<p>Indicadores socioambientais dos 1.940 setores censitários dos sete municípios da RMVRC: Censo 2022, vegetação, temperatura de superfície, inundação, APP, saúde ambiental e ODS. Com metodologia, fontes e dados abertos.</p>
<dl class="atlas-n"><div><dt>Setores censitários</dt><dd>1.940</dd></div><div><dt>Municípios</dt><dd>7</dd></div><div><dt>Indicadores do Censo auditados</dt><dd>24</dd></div></dl>
<p class="meta">Pesquisa de pós-doutorado de Ricardo Miranda dos Santos, com supervisão de Sandra Medina Benini, PPGAU-UNIVAG, 2026.</p>
<span class="btn">Explorar o Atlas ↗</span></div>
</a>
<div class="grid g2 dest2">
<a class="card dest vern vn-home" href="revista.html"><div><span class="eyebrow">Periódico do programa · Qualis B2</span><h3>Revista Vernácula · Territórios Contemporâneos</h3><p>Publicação trimestral do PPGAU sobre arquitetura, cidade e território. ISSN 2965-6125, 11 números desde 2023, DOI em todos os artigos.</p><span class="btn">Conhecer a revista</span></div><div class="vn-mini" aria-hidden="true"><!--VERN_CAPAS--></div></a>
<a class="card dest auto" href="dados/#/responder"><span class="eyebrow">Em coleta até 03/11/2026</span><h3>Autoavaliação 2026</h3><p>Questionário anônimo para estudantes, egressos, docentes, pós-doutorandos, equipe técnica e gestão. Sua resposta orienta o planejamento do programa.</p><span class="btn">Responder agora</span></a>
</div></section>

<section class="blk lv-home" aria-labelledby="h-lvh"><div class="lv-home-cab"><h2 id="h-lvh">Livros e anais</h2><a class="btn sec" href="livros.html">Ver a estante completa ${ICO.seta}</a></div>
<p class="lead">Coletâneas e anais organizados pelo programa e por seus docentes, com download gratuito.</p>
<ul class="lv-rolo"><!--LIV_HOME--></ul></section>

<!--PREMIO_HOME-->
<!--BANCA_HOME-->
${SIMP_DEST("h-prox")}

<section class="blk" aria-labelledby="h-not"><div class="lv-home-cab"><h2 id="h-not">Notícias</h2><a class="btn sec" href="noticias.html">Todas as notícias ${ICO.seta}</a></div>
<div class="grid g3 noti2"><!--NOT_HOME--></div>
</section>
<!--GAL_HOME-->
<section hidden></section>

<section class="blk" aria-labelledby="h-acesso"><h2 id="h-acesso">Acesso rápido</h2>
<div class="grid">
<a class="card ac" href="programa.html"><span class="ac-ic">${ICO.programa}</span><h3>O programa</h3><p>Histórico, missão, área de concentração, linhas e grupos de pesquisa.</p></a>
<a class="card ac" href="pessoas.html"><span class="ac-ic">${ICO.pessoas}</span><h3>Pessoas</h3><p>Coordenação, conselho, ${corpo.length} docentes, discentes, pós-doutorandos e egressos.</p></a>
<a class="card ac" href="livros.html"><span class="ac-ic">${ICO.livros}</span><h3>Livros e anais</h3><p>Coletâneas e anais do programa com capa, referência e download gratuito.</p></a>
<a class="card ac" href="producao.html"><span class="ac-ic">${ICO.producao}</span><h3>Produção</h3><p>${BASE.dissertacoes.length} dissertações defendidas, projetos de pesquisa e extensão.</p></a>
<a class="card ac" href="linha-do-tempo.html"><span class="ac-ic">${ICO.tempo}</span><h3>Linha do tempo</h3><p>As ações do programa desde 2018: marcos, eventos, defesas, turmas e projetos.</p></a>
<a class="card ac" href="mapa.html"><span class="ac-ic">${ICO.rede}</span><h3>Mapa da produção</h3><p>Rede de produção dos docentes com discentes, egressos e pós-doutorandos.</p></a>
<a class="card ac" href="eventos.html"><span class="ac-ic">${ICO.eventos}</span><h3>Eventos</h3><p>Congressos, simpósios e seminários organizados pelo programa.</p></a>
<a class="card ac" href="disciplinas.html"><span class="ac-ic">${ICO.agenda}</span><h3>Disciplinas e horários</h3><p>Próxima aula, agenda e calendário do semestre para a sua turma, com os professores.</p></a>
<a class="card ac" href="academico.html"><span class="ac-ic">${ICO.academico}</span><h3>Vida acadêmica</h3><p>Calendário, disciplinas, créditos, qualificação, defesa e bolsas.</p></a>
<a class="card ac" href="dados/"><span class="ac-ic">${ICO.dados}</span><h3>PPGAU em dados</h3><p>Indicadores, avaliação CAPES, produção do Lattes e autoavaliação, com as fontes citadas.</p></a>
</div></section>

<section class="blk" aria-labelledby="h-linhas"><h2 id="h-linhas">Linhas de pesquisa</h2>
<div class="grid">${linhas.map((l, i) => `<div class="card"><span class="tag${i === 2 ? " gold" : ""}">Linha ${i + 1}</span><h3>${esc(l.replace(/ \(a partir de 2026\)$/, ""))}</h3>${/2026/.test(l) ? `<p class="meta">A partir de 2026</p>` : ""}</div>`).join("")}</div>
</section>

<section class="blk" aria-labelledby="h-eventos"><h2 id="h-eventos">Eventos recentes</h2>
<div class="grid">${ev.map(e => `<div class="card"><span class="tag">${e.ano}</span><h3>${esc(e.nome)}</h3><p class="meta">${esc(String(e.datas || "").replace(/\s*\(.*\)$/, ""))}</p></div>`).join("")}</div>
<p style="margin-top:14px"><a href="eventos.html">Todos os eventos e destaques →</a></p>
</section>

<section class="blk" aria-labelledby="h-local"><h2 id="h-local">Como chegar</h2>${LOCAL}</section>

<section class="blk" aria-labelledby="h-fale"><h2 id="h-fale">Fale com a coordenação</h2>
<div class="grid g2">${coord.map(d => `<div class="card pessoa ct-card"><img src="img/${esc(d.foto)}" width="84" height="84" alt="Foto de ${esc(d.n)}"><div><span class="tag">${/Jeane/.test(d.n) ? "Coordenadora" : "Coordenador adjunto"}</span><h3>${/Jeane/.test(d.n) ? "Profa. Dra. " : "Prof. Dr. "}${esc(d.n)}</h3><p class="links"><a href="mailto:${esc(d.f.email)}">${esc(d.f.email)}</a></p></div></div>`).join("")}</div>
</section>`
  });
}

// O programa
{
  const docsInst = PG_DOCS.find(x => x[0] === "Institucional")[1];
  P.push({
    arq: "programa.html", titulo: "O programa", desc: "Histórico, área de concentração, linhas e grupos de pesquisa do PPGAU UNIVAG.",
    hero: { crumb: true, p: "Mestrado acadêmico recomendado pela CAPES em 2018, em funcionamento desde 2019 no UNIVAG Centro Universitário." },
    corpo: `
<ul class="sub"><li><a href="#historico">Histórico</a></li><li><a href="#missao">Missão e objetivos</a></li><li><a href="#area">Área e linhas</a></li><li><a href="#grupos">Grupos de pesquisa</a></li><li><a href="#parcerias">Parcerias</a></li><li><a href="#linha-do-tempo">Linha do tempo</a></li></ul>
<section class="blk" id="historico"><h2>Histórico</h2>
<dl class="ficha">${PG_INFO.filter(x => !/Contato|Conselho|Coordenação/.test(x[0])).map(([a, b]) => `<dt>${esc(a)}</dt><dd>${b}</dd>`).join("")}</dl></section>
<section class="blk" id="missao"><h2>Missão e objetivos</h2>
<div class="grid g2"><div class="card"><h3>Objetivo geral</h3><p>Capacitar recursos humanos dedicados à pesquisa científica e ao exercício da docência no ensino superior, formando docentes e pesquisadores de excelência intelectual na região Centro-Oeste e difundindo novos conhecimentos sobre arquitetura, cidade e território.</p></div>
<div class="card"><h3>Objetivos específicos</h3><ol class="ob-lista"><li>Desenvolver habilidades de pesquisa para projetos que beneficiem as cidades e suas comunidades, com ênfase na criatividade, na análise, no pensamento crítico e no uso do desenho e da modelagem física e computacional.</li><li>Expandir e fortalecer a pesquisa em Arquitetura e Urbanismo na região Centro-Oeste.</li><li>Oferecer formação acadêmico-científica voltada à cidade, ao território e à governança, apoiando políticas públicas para a qualidade de vida e do ambiente.</li></ol></div></div></section>
<section class="blk" id="area"><h2>Área de concentração e linhas de pesquisa</h2>
<p class="lead"><b>Arquitetura, Cidade e Território.</b></p>
<div class="grid">${linhas.map((l, i) => `<div class="card"><span class="tag${i === 2 ? " gold" : ""}">Linha ${i + 1}</span><h3>${esc(l.replace(/ \(a partir de 2026\)$/, ""))}</h3>${/2026/.test(l) ? `<p class="meta">A partir de 2026</p>` : ""}</div>`).join("")}</div></section>
<section class="blk" id="grupos"><h2>Grupos de pesquisa</h2>
<div class="grid g2">${BASE.grupos.map(([n, lid, tema, mem, url]) => `<div class="card"><h3>${url ? ext(url, esc(n)) : esc(n)}</h3><p>${esc(tema)}</p><p class="meta">Líder: ${esc(lid)} · Docentes: ${esc(mem)}</p></div>`).join("")}</div></section>
<section class="blk" id="parcerias"><h2>Parcerias e acordos de cooperação</h2>
<div class="grid g2">${REDE.parceiros.map(([n, onde, , o]) => `<div class="card"><h3>${esc(n)}</h3><p class="meta">${esc(onde)}</p><p>${esc(o)}</p></div>`).join("")}</div></section>
<section class="blk" id="linha-do-tempo"><h2>Linha do tempo</h2>
<ol class="tl">${HIST.map(h => `<li><span class="ano">${esc(h.ano)}</span><span class="tag" style="background:none;border:1px solid currentColor;color:${HIST_CAT[h.cat] ? HIST_CAT[h.cat][1] : "inherit"}">${esc((HIST_CAT[h.cat] || [""])[0])}</span><h3 style="margin:.2em 0">${esc(h.t)}</h3><p>${esc(h.d)}</p></li>`).join("")}</ol>
<p><a href="linha-do-tempo.html">Linha do tempo detalhada, com eventos, defesas, turmas e projetos →</a></p></section>`
  });
}

// Pessoas
{
  const grupoP = c => PESSOAS.filter(p => p.c === c).sort((a, b) => a.n.localeCompare(b.n, "pt-BR"));
  const pessoaLi = p => {
    const ori = [p.or && "Orientação: " + p.or, p.co && "Coorientação: " + p.co].filter(Boolean).join(" · ");
    return `<li data-busca="${esc([p.n, p.or, p.co, p.ti].join(" "))}" data-turma="${esc(p.in)}"><b>${esc(p.n)}</b> <span class="meta">${p.c === "egresso" ? "Defesa em " + esc(p.de) : (p.c === "pos-doc" ? "Desde " : "Turma ") + esc(p.in)}</span>
    ${p.ti ? `<div>${p.re ? ext(p.re, esc(titulo(p.ti))) : esc(titulo(p.ti))}</div>` : ""}${ori ? `<div class="meta">${esc(ori)}</div>` : ""}
    ${p.ob.length ? `<details class="mais"><summary>${p.ob.length} ${p.ob.length > 1 ? "publicações" : "publicação"}</summary><ul>${p.ob.map(o => `<li>${o[0]} · ${o[3] ? ext(o[3], esc(o[1])) : esc(o[1])} <span class="meta">${esc(o[2])}</span></li>`).join("")}</ul></details>` : ""}${p.la ? `<div class="links">${ext(p.la, "Lattes")}</div>` : ""}</li>`;
  };
  const dis = grupoP("discente"), turmas = [...new Set(dis.map(p => p.in))].sort().reverse();
  P.push({
    arq: "pessoas.html", titulo: "Pessoas", desc: "Coordenação, conselho, corpo docente, discentes, pós-doutorandos e egressos do PPGAU UNIVAG.",
    hero: { crumb: true, p: `${corpo.length} docentes, ${dis.length} discentes em curso, ${grupoP("pos-doc").length} pós-doutorandos e ${grupoP("egresso").length} egressos.` },
    js: FILTRO_JS,
    corpo: `
<ul class="sub"><li><a href="#coordenacao">Coordenação</a></li><li><a href="#conselho">Conselho</a></li><li><a href="#docentes">Corpo docente</a></li><li><a href="#discentes">Discentes</a></li><li><a href="#posdoc">Pós-doutorandos</a></li><li><a href="#egressos">Egressos</a></li></ul>
<section class="blk" id="coordenacao"><h2>Coordenação</h2>
<div class="grid g2">${coord.map(d => `<div class="card pessoa ct-card"><img src="img/${esc(d.foto)}" width="84" height="84" alt="Foto de ${esc(d.n)}"><div><span class="tag">${/Jeane/.test(d.n) ? "Coordenadora" : "Coordenador adjunto"}</span><h3>${esc(d.n)}</h3><p class="links"><a href="mailto:${esc(d.f.email)}">${esc(d.f.email)}</a></p></div></div>`).join("")}</div></section>
<section class="blk" id="conselho"><h2>Conselho de Pós-Graduação</h2>
<p>${esc(PG_INFO.find(x => x[0] === "Conselho de Pós-Graduação")[1])}.</p></section>
<section class="blk" id="docentes"><h2>Corpo docente</h2>
<div class="grid g2">${corpo.map(cartaoDocente).join("")}</div></section>
<section class="blk" id="discentes"><h2>Discentes em curso</h2>
<div class="filtro" data-filtro="l-dis"><input type="search" placeholder="Buscar por nome, orientador ou tema" aria-label="Buscar discentes"><select name="turma" aria-label="Turma"><option value="">Todas as turmas</option>${turmas.map(t => `<option>${t}</option>`).join("")}</select></div>
<ul class="lista card" id="l-dis">${dis.map(pessoaLi).join("")}</ul><p class="vazio" data-vazio="l-dis">Nenhum resultado.</p></section>
<section class="blk" id="posdoc"><h2>Pós-doutorandos</h2>
<ul class="lista card">${grupoP("pos-doc").map(pessoaLi).join("")}</ul></section>
<section class="blk" id="egressos"><h2>Egressos</h2>
<p><a class="btn sec" href="egressos.html">Página dos egressos, com o mapa dos territórios estudados ${ICO.seta}</a></p>
<div class="filtro" data-filtro="l-egr"><input type="search" placeholder="Buscar por nome, orientador ou título" aria-label="Buscar egressos"></div>
<ul class="lista card" id="l-egr">${grupoP("egresso").sort((a, b) => String(b.de).localeCompare(String(a.de)) || a.n.localeCompare(b.n, "pt-BR")).map(pessoaLi).join("")}</ul><p class="vazio" data-vazio="l-egr">Nenhum resultado.</p></section>`
  });
}

// Produção
{
  const diss = [...BASE.dissertacoes].sort((a, b) => b[0].localeCompare(a[0]) || a[2].localeCompare(b[2], "pt-BR"));
  const anos = [...new Set(diss.map(d => d[0]))];
  // "Graduação: (6) / Mestrado acadêmico: (1)" → { grad: 6, mest: 1, dout: 0 }
  const alunos = p => { const n = re => +((String(p.al || "").match(re) || [])[1] || 0); return { grad: n(/Gradua[çc][ãa]o: \((\d+)\)/), mest: n(/Mestrado acad[êe]mico: \((\d+)\)/), dout: n(/Doutorado: \((\d+)\)/) }; };
  const ordem = (a, b) => (b.sit === "Em andamento") - (a.sit === "Em andamento") || b.ini - a.ini;
  const proj = t => PROJ.filter(p => p.t === t).sort(ordem);
  const periodo = p => `${p.ini}${p.fim && p.fim !== "Atual" ? "–" + esc(p.fim) : p.fim === "Atual" ? " – atual" : ""}`;
  const projCard = p => { const a = alunos(p); return `<div class="card pj" data-busca="${esc([p.tit, p.coord, ...(p.eq || []), p.desc].join(" "))}" data-sit="${esc(p.sit)}"><div class="pj-tags"><span class="tag${p.sit === "Em andamento" ? " ok" : ""}">${esc(p.sit)}</span><span class="tag">${periodo(p)}</span>${a.grad ? `<span class="tag gold">${a.grad} ${a.grad === 1 ? "graduando" : "graduandos"}</span>` : ""}${a.mest ? `<span class="tag">${a.mest} ${a.mest === 1 ? "mestrando" : "mestrandos"}</span>` : ""}</div>
    <h3>${esc(p.tit)}</h3>${p.desc ? `<details class="pj-desc"><summary>${esc(p.desc.length > 180 ? p.desc.slice(0, 177).replace(/\s+\S*$/, "") + "…" : p.desc)}</summary>${p.desc.length > 180 ? `<p>${esc(p.desc)}</p>` : ""}</details>` : ""}<p class="meta">Coordenação: ${esc(p.coord || "não informada")}${p.eq && p.eq.length ? " · Equipe: " + esc(p.eq.join(", ")) : ""}${p.fin ? " · Financiamento: " + esc(p.fin) : ""}</p></div>`; };
  const pesq = proj("pesquisa"), extn = proj("extensão"), outros = PROJ.filter(p => p.t === "ensino" || p.t === "outro").sort(ordem);
  const ic = pesq.filter(p => alunos(p).grad > 0), soma = (L, k) => L.reduce((s, p) => s + alunos(p)[k], 0);
  const PLATp = D("PLAT"), icProd = PLATp.itens.filter(i => /inicia[cç][aã]o cient/i.test(i[2])).sort((a, b) => b[1] - a[1]);
  const docsProd = PG_DOCS.find(x => x[0] === "Produção e difusão")[1];
  const filtro = (id, ph) => `<div class="filtro" data-filtro="${id}"><input type="search" placeholder="${ph}" aria-label="${ph}"><select name="sit" aria-label="Situação"><option value="">Todas as situações</option><option>Em andamento</option><option>Concluído</option></select></div>`;
  const resumo = itens => `<div class="pj-res">${itens.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("")}</div>`;
  const ABAS = [["dissertacoes", "Dissertações", diss.length], ["pesquisa", "Pesquisa", pesq.length], ["iniciacao", "Iniciação científica", ic.length], ["extensao", "Extensão", extn.length], ["outros", "Ensino e outros", outros.length], ["periodicos", "Periódicos e difusão", ""]];
  P.push({
    arq: "producao.html", titulo: "Produção", desc: "Dissertações defendidas, projetos de pesquisa, iniciação científica, extensão e produção do PPGAU UNIVAG.",
    hero: { crumb: true, p: `${diss.length} dissertações defendidas, ${pesq.length} projetos de pesquisa (${ic.length} com iniciação científica) e ${extn.length} projetos de extensão registrados no Lattes dos docentes.` },
    js: FILTRO_JS + `
(()=>{const abas=[...document.querySelectorAll(".abas [role=tab]")],pain=[...document.querySelectorAll(".aba-p")];
const vai=(id,foca)=>{if(!document.getElementById("p-"+id))id="dissertacoes";abas.forEach(a=>{const on=a.dataset.a===id;a.setAttribute("aria-selected",on);a.tabIndex=on?0:-1;if(on&&foca)a.focus()});pain.forEach(p=>p.hidden=p.id!=="p-"+id);};
abas.forEach((a,i)=>{a.addEventListener("click",()=>{vai(a.dataset.a);history.replaceState(null,"","#"+a.dataset.a)});a.addEventListener("keydown",e=>{const d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();const n=abas[(i+d+abas.length)%abas.length];vai(n.dataset.a,true);history.replaceState(null,"","#"+n.dataset.a)})});
const h=()=>vai((location.hash||"#dissertacoes").slice(1).replace(/^p-/,""));addEventListener("hashchange",h);h();})();`,
    corpo: `
<div class="abas" role="tablist" aria-label="Seções da produção">${ABAS.map(([id, l, n]) => `<button type="button" role="tab" id="t-${id}" data-a="${id}" aria-controls="p-${id}">${l}${n !== "" ? ` <b>${n}</b>` : ""}</button>`).join("")}</div>

<section class="blk aba-p" id="p-dissertacoes" role="tabpanel" aria-labelledby="t-dissertacoes"><h2 id="dissertacoes">Dissertações defendidas</h2>
<div class="filtro" data-filtro="t-diss"><input type="search" placeholder="Buscar por autor, orientador ou título" aria-label="Buscar dissertações"><select name="ano" aria-label="Ano"><option value="">Todos os anos</option>${anos.map(a => `<option>${a}</option>`).join("")}</select></div>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Defesa</th><th>Autor(a)</th><th>Título</th><th>Orientação</th></tr></thead><tbody id="t-diss">
${diss.map(([ano, dia, aut, ori, tit, url]) => `<tr data-busca="${esc([aut, ori, tit].join(" "))}" data-ano="${ano}"><td data-l="Defesa">${dia ? esc(dia) + "/" : ""}${ano}</td><td data-l="Autor(a)"><b>${esc(aut)}</b></td><td>${url ? ext(url, esc(titulo(tit))) : esc(titulo(tit))}</td><td data-l="Orientação">${esc(ori)}</td></tr>`).join("")}
</tbody></table></div><p class="vazio" data-vazio="t-diss">Nenhuma dissertação encontrada.</p>
<p style="margin-top:12px">${ext("https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/issue/archive", "Repositório Digital UNIVAG ↗")}</p></section>

<section class="blk aba-p" id="p-pesquisa" role="tabpanel" aria-labelledby="t-pesquisa" hidden><h2 id="pesquisa">Projetos de pesquisa</h2>
${resumo([[pesq.length, "projetos"], [pesq.filter(p => p.sit === "Em andamento").length, "em andamento"], [soma(pesq, "mest"), "participações de mestrandos"], [soma(pesq, "grad"), "participações de graduandos"]])}
${filtro("g-pesq", "Buscar por título, tema ou docente")}
<div class="grid g2" id="g-pesq">${pesq.map(projCard).join("")}</div><p class="vazio" data-vazio="g-pesq">Nenhum projeto encontrado.</p></section>

<section class="blk aba-p" id="p-iniciacao" role="tabpanel" aria-labelledby="t-iniciacao" hidden><h2 id="iniciacao">Iniciação científica</h2>
<p class="lead">Projetos de pesquisa dos docentes que integram alunos da graduação em iniciação científica, aproximando a graduação do mestrado.</p>
${resumo([[ic.length, "projetos com IC"], [ic.filter(p => p.sit === "Em andamento").length, "em andamento"], [soma(ic, "grad"), "participações de graduandos"], [new Set(ic.flatMap(p => p.docs || [p.coord])).size, "docentes orientadores"]])}
${filtro("g-ic", "Buscar projeto de iniciação científica")}
<div class="grid g2" id="g-ic">${ic.map(projCard).join("")}</div><p class="vazio" data-vazio="g-ic">Nenhum projeto encontrado.</p>
${icProd.length ? `<h3 class="pj-sub">Trabalhos e relatórios de iniciação científica</h3><ul class="pj-lista">${icProd.map(i => `<li><span class="tag">${i[1]}</span> ${esc(i[2].length > 260 ? i[2].slice(0, 257) + "…" : i[2])}</li>`).join("")}</ul>` : ""}
<p class="meta">Critério: projetos de pesquisa cadastrados no Lattes dos docentes com alunos de graduação na equipe. Fonte: ${esc(PLATp.fonte)}.</p></section>

<section class="blk aba-p" id="p-extensao" role="tabpanel" aria-labelledby="t-extensao" hidden><h2 id="extensao">Projetos de extensão</h2>
<p class="lead">Ações com a comunidade: educação, habitação, patrimônio, meio ambiente e direito à cidade.</p>
${resumo([[extn.length, "projetos de extensão"], [extn.filter(p => p.sit === "Em andamento").length, "em andamento"], [soma(extn, "grad"), "participações de graduandos"], [soma(extn, "mest"), "participações de mestrandos"]])}
${filtro("g-ext", "Buscar projeto de extensão")}
<div class="grid g2" id="g-ext">${extn.map(projCard).join("")}</div><p class="vazio" data-vazio="g-ext">Nenhum projeto encontrado.</p></section>

<section class="blk aba-p" id="p-outros" role="tabpanel" aria-labelledby="t-outros" hidden><h2 id="outros">Projetos de ensino e outros</h2>
<div class="grid g2">${outros.map(projCard).join("")}</div></section>

<section class="blk aba-p" id="p-periodicos" role="tabpanel" aria-labelledby="t-periodicos" hidden><h2 id="periodicos">Produção em periódicos e difusão</h2>
<p>A produção completa de cada docente, com Qualis e coautoria de discentes, está no <a href="${dados("producao")}">PPGAU em dados</a>. Veja também os <a href="livros.html">livros e anais</a> e a <a href="revista.html">Revista Vernácula</a>.</p>
<ul class="docs">${docsProd.filter(x => !/Dissertações defendidas|^Eventos$/.test(x[0])).map(([t, h]) => docCard(h, t, "", true)).join("")}</ul></section>`
  });
}

// Eventos
{
  const ANO_ATUAL = new Date().getFullYear();
  // Eventos do programa que ainda não estão no portal "em dados".
  const EXTRA = [{ nome: "V Seminário de Pesquisa em Arquitetura e Urbanismo do PPGAU UNIVAG", ano: 2026, datas: "15/08/2026", local_formato: "presencial, Centro Universitário UNIVAG, Várzea Grande-MT", ppgau_papel: "organizador", fontes: ["https://www.even3.com.br/v-seminario-de-pesquisa-em-arquitetura-e-urbanismo-do-ppgau-univag-764604/"], anais: {},
      banner: ["img/eventos/seminario-v-2026.jpg", 1100, 440], lema: "Pesquisa, inovação e transformação do território." },
    { nome: "III Congresso Brasileiro \"Mudanças Climáticas e a Resiliência Urbana\"", ano: 2026, datas: "23 a 25/09/2026", ppgau_papel: "coorganizador", fontes: ["https://www.even3.com.br/iii-congresso-brasileiro-mudancas-climaticas-e-a-resiliencia-urbana-741291/"], anais: {},
      banner: ["img/eventos/resiliencia-2026.jpg", 1100, 440], lema: "Ciência, políticas e ação por cidades preparadas para os desafios climáticos.", organizacao: ["ANAP", "PPGAU UNIVAG"], abrangencia: "nacional" },
    { nome: "III Latin American Symposium \"City, Architecture and Sustainability\"", ano: 2026, datas: "26 a 28/08/2026", ppgau_papel: "coorganizador", fontes: ["https://www.even3.com.br/city-architecture-and-sustainability-2026-715004/"], anais: {},
      banner: ["img/eventos/latin-american-2026.jpg", 1100, 440], organizacao: ["ANAP", "PPGAU UNIVAG"], abrangencia: "latino-americana" }];
  EXTRA[0].organizacao = ["PPGAU UNIVAG"];
  // Ficha curta de cada evento, sem as notas de apuração ("inferido", "não verificado"...).
  const limpa = t => String(t || "").replace(/\s*\((?:[^()]*(?:inferid|verificad|conhecimento geral|pelo nome|logo em)[^()]*)\)/gi, "").replace(/\s*\((?:[^()]*\([^()]*\))*[^()]*(?:inferid|verificad|pelo nome)[^()]*\)/gi, "").trim();
  const util = t => t && !/^(não verificado|não informad)/i.test(t) && !/^—$/.test(t);
  const orgEv = e => e.ppgau_papel === "organizador" || e.ppgau_papel === "coorganizador";
  const fichaEv = e => { const lin = [["Datas", limpa(String(e.datas || "").replace(/\s*\(.*\)$/, ""))], ["Formato", limpa(e.local_formato)], ["Realização", (e.organizacao || []).map(limpa).filter(util).join("; ")], ["Coordenação", e.coord || ""], ["Apoio", e.apoio || ""], ["Países participantes", e.paises || ""], ["Abrangência", limpa(e.abrangencia)], ["Números", limpa(e.numeros)], ["Equipe do PPGAU", [...(e.docentes_ppgau || []), ...(e.discentes_ppgau || [])].map(limpa).filter(util).join("; ")]].filter(([, v]) => util(v));
    return `<article class="card ev-card">${e.banner ? `<a class="ev-c-ban" href="${pagEv(e)}" target="_blank" rel="noopener"><img src="${e.banner[0]}" width="${e.banner[1]}" height="${e.banner[2]}" loading="lazy" alt="${esc(e.nome)}"></a>` : `<div class="ev-c-ban ev-c-sem" aria-hidden="true"><span>${e.ano}</span><b>${esc(e.nome)}</b></div>`}<div class="ev-c-info"><p class="ev-sup">${e.ano} · ${esc(papel[e.ppgau_papel] || "Participação")}</p><h3>${esc(e.nome)}</h3><dl>${lin.map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join("")}</dl>${e.parcerias ? `<details class="ev-parc"><summary>Ver as parcerias institucionais</summary><img src="${e.parcerias[0]}" width="${e.parcerias[1]}" height="${e.parcerias[2]}" loading="lazy" alt="Logos da organização e do apoio institucional do evento"></details>` : ""}<p class="links">${linksEv(e).replace(/^—$/, "")}</p></div></article>`; };
  const mesEv = e => { const d = String(e.datas || ""), m = d.match(/\/(\d{2})\/\d{4}/); if (m) return +m[1]; const i = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].findIndex(x => d.toLowerCase().includes(x + ".")); return i + 1; };
  const ev = [...EVENTOS, ...EXTRA].filter(e => !e.oculto).sort((a, b) => b.ano - a.ano || mesEv(b) - mesEv(a));
  // Página oficial: o primeiro link do Even3 nas fontes. Anais: só os endereços completos.
  const pagEv = e => e.pagina || (e.fontes || []).find(u => /even3\.com\.br/.test(u) && !/618697/.test(u));
  const anaisEv = e => String((e.anais || {}).link || "").split(/\s*;\s*/).filter(u => /^(https?:\/\/|docs\/)/.test(u));
  const linksEv = e => { const a = anaisEv(e), p = pagEv(e); return [p ? ext(p, "Página do evento") : "", ...a.map((u, i) => ext(u, a.length > 1 ? `Anais ${["vol. I", "vol. II", "3", "4"][i]}` : "Anais"))].filter(Boolean).join("") || "—"; };
  const dest = IMPACTO.impacto.filter(x => x.tipo !== "evento");
  const papel = { organizador: "Organização", coorganizador: "Coorganização", participante: "Participação" };
  P.push({
    arq: "eventos.html", titulo: "Eventos", desc: "Eventos organizados pelo PPGAU UNIVAG e participação do programa em eventos externos.",
    hero: { crumb: true, p: "Congressos, simpósios e seminários organizados ou coorganizados pelo programa, e a participação em eventos externos." },
    corpo: `
${SIMP_DEST("h-sd")}
<ul class="sub"><li><a href="#eventos">Eventos organizados</a></li><li><a href="#participacao">Participação em eventos</a></li></ul>
<section class="blk" id="eventos"><h2>Eventos organizados pelo programa</h2>
<p class="meta">Eventos que o PPGAU UNIVAG organiza ou coorganiza, do mais recente para o mais antigo. Clique em "Página do evento" para ver a programação no Even3 e em "Anais" para ler os trabalhos publicados.</p>
<div class="ev-cards">${ev.filter(orgEv).map(fichaEv).join("")}</div></section>
<section class="blk" id="participacao"><h2>Participação em eventos</h2>
<p class="meta">Eventos externos com participação de docentes e discentes do programa.</p>
<div class="tbl-wrap"><table class="tbl ev-part"><thead><tr><th>Ano</th><th>Evento</th><th>Datas e local</th><th>Participação do PPGAU</th><th>Link</th></tr></thead><tbody>
${ev.filter(e => !orgEv(e)).map(e => { const p = pagEv(e), q = [...(e.docentes_ppgau || []), ...(e.discentes_ppgau || [])].map(limpa).filter(util).join("; "); return `<tr><td data-l="Ano">${e.ano}</td><td><b>${esc(e.nome)}</b></td><td data-l="Datas e local">${esc([limpa(String(e.datas || "").replace(/\s*\(.*\)$/, "")), limpa(e.local_formato)].filter(util).join(" · ") || "—")}</td><td data-l="Participação">${esc(q || "—")}</td><td data-l="Link">${p ? ext(p, "Página do evento") : "—"}</td></tr>`; }).join("")}
</tbody></table></div></section>`
  });
}

// Ingresso
{
  const sel = [
    ["Discente: vagas remanescentes 2º/2026", "/discente-vagasremanescentes2026", "Edital nº 05/2026", PDF("c32c56de7e2a4fdabd1ddb64cb534d62")],
    ["Discente: resultado 2º semestre de 2026", "/discente-2º-sem-2026"],
    ["Seleção de bolsista PIBPG/CNPq 2026", "/bolsista2026"],
    ["Pós-doutorado: 1º semestre de 2025", "/pos-doutorado-1º-sem-2025", "Regulamento do pós-doutorado", PDF("250868416ab44b9c932939923d3c11a4")],
    ["Proficiência: 1º semestre de 2025", "/proficiência-1º-sem-2025"]
  ];
  P.push({
    arq: "ingresso.html", titulo: "Ingresso", desc: "Processos seletivos do mestrado, pós-doutorado, proficiência e bolsas do PPGAU UNIVAG.",
    hero: { crumb: true, p: "Editais, resultados e seleções de bolsistas. O mestrado tem 24 meses, com aulas às sextas à noite e aos sábados." },
    corpo: `
<section class="blk"><h2>Seleções</h2>
<div class="grid g2">${sel.map(([t, p, dt, dh]) => `<div class="card"><h3>${esc(t)}</h3><p class="links">${dh ? ext(dh, esc(dt) + " (PDF)") : ""}</p></div>`).join("")}</div></section>
<section class="blk" id="bolsas"><h2>Bolsas</h2>
<p>A Comissão de Bolsas acompanha a distribuição e a renovação das bolsas do programa.</p><div class="grid g2"><div class="card"><h3>Comissão de Bolsas · docentes</h3><p>Prof. Dr. Angelo Palmisano, Profa. Dra. Jeane Aparecida Rombi de Godoy, Profa. Dra. Rosana Lia Ravache e Profa. Dra. Natallia Sanches e Souza</p></div><div class="card"><h3>Comissão de Bolsas · discentes</h3><p>Rafaela Ferreira Rosso e Marcelo Luiz Perini Tarachuk</p></div></div></section>
<section class="blk"><h2>Ingresso em números</h2><p>Vagas, inscritos, matrículas e titulações de cada ano estão em <a href="titulacao.html">Ingresso e titulação</a>.</p></section>`
  });
}

// Acadêmico: textos transcritos dos documentos da coordenação (academico-textos.js); guia, atas e memorando como anexos.
{
  const AT = require("./academico-textos.js");
  const tamDoc = f => { try { const b = fs.statSync(path.join(__dirname, "docs", f)).size; return b > 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1e3)) + " KB"; } catch (e) { return ""; } };
  const ARQ = { guia: "guia-procedimentos-mestrado.pdf", ataQ: "ata-exame-qualificacao.docx", ataD: "ata-exame-defesa.docx", remotas: "memorando-aulas-remotas.pdf" };
  const anexo = k => ["docs/" + ARQ[k], ARQ[k].split(".").pop().toUpperCase() + " · " + tamDoc(ARQ[k])];
  // Itens: [título, destino, descrição, tipo] · tipo "pg" página/seção, "dl" anexo para baixar.
  const GR = [
    ["Curso e calendário", ICO.agenda, [["Estrutura curricular", "#estrutura", "semestres e créditos", "pg"], ["Disciplinas", "#disciplinas", "obrigatórias, eletivas e seminários", "pg"], ["Disciplinas e horários do semestre", "disciplinas.html", "agenda e calendário das turmas", "pg"], ["Aulas remotas", ...anexo("remotas"), "dl"], ["Guia de procedimentos acadêmicos", ...anexo("guia"), "dl"]]],
    ["Créditos e matrícula", ICO.producao, [["Créditos", "#creditos", "34 créditos, 510 horas", "pg"], ["Atividades obrigatórias", "#atividades", "produção científica", "pg"], ["Aproveitamento de créditos", "#aproveitamento", "", "pg"], ["Trancamento de matrícula", "#trancamento", "", "pg"]]],
    ["Qualificação e defesa", ICO.academico, [["Orientações para qualificação", "qualificacao.html", "etapas, banca e memorial", "pg"], ["Ata de exame de qualificação", ...anexo("ataQ"), "dl"], ["Orientações para defesa", "defesa.html", "agendamento e versão definitiva", "pg"], ["Ata de exame de defesa", ...anexo("ataD"), "dl"], ["Bancas e defesas", "bancas.html", "próximas e realizadas", "pg"]]]];
  globalThis.__ACAD = GR.map(([g, , L]) => [g, L.map(([t, h]) => [t, h.startsWith("#") ? "academico.html" + h : h])]);
  const item = ([t, h, d, tp]) => `<li><a class="ac-it${tp === "dl" ? " ac-dl" : ""}" href="${esc(h)}"${tp === "dl" ? " download" : ""}><span class="ac-it-t">${esc(t)}</span>${d ? `<span class="ac-it-d">${tp === "dl" ? "Baixar · " : ""}${esc(d)}</span>` : ""}<span class="ac-it-i" aria-hidden="true">${tp === "dl" ? ICO.baixar : "›"}</span></a></li>`;
  const sumDisc = c => AT.DISC.filter(x => x[3] === c);
  const tabDisc = (c, tit) => `<div class="card ac-disc"><h3>${tit} <span class="tag">${sumDisc(c).length}</span></h3><ul>${sumDisc(c).map(([n, ch, cr]) => `<li><span>${esc(n)}</span><span class="meta">${ch} h · ${cr} créditos</span></li>`).join("")}</ul></div>`;
  const SEM = [["1º semestre", ["2 disciplinas obrigatórias", "1 disciplina eletiva", "1 seminário avançado em pesquisa e dissertação", "Orientação"]], ["2º semestre", ["2 disciplinas eletivas", "1 seminário avançado em pesquisa e dissertação", "Orientação"]], ["3º semestre", ["1 disciplina eletiva", "1 seminário avançado em pesquisa e dissertação", "Orientação"]], ["4º semestre", ["Orientação para o exame de Defesa, que deverá ocorrer até o final desse semestre"]]];
  const ATIV = [["Publicação de artigo completo em revista indexada no Qualis CAPES da área de Arquitetura e Urbanismo", "2"], ["Publicação de artigo completo em anais de eventos científicos", "1"], ["Publicação de resumo em anais de eventos científicos", "0,5"], ["Apresentação em eventos científicos", "0,5"], ["Participação em evento científico", "0,25"], ["Publicação de livro, manual ou software", "2"], ["Publicação de capítulo de livro ou normas técnicas", "1,5"]];
  const crPl = c => `<span class="ac-cr">${c} ${c === "1" || /^0/.test(c) ? "crédito" : "créditos"}</span>`;
  P.push({
    arq: "academico.html", titulo: "Acadêmico", desc: "Estrutura curricular, disciplinas, créditos, qualificação, defesa e procedimentos acadêmicos do PPGAU UNIVAG.",
    hero: { crumb: true, p: "Regras, documentos e procedimentos para quem já é aluno do mestrado." },
    corpo: `
<div class="aviso info"><div><b>Disciplinas do 2º semestre de 2026</b> · Horários, professores e turmas, com a próxima aula da sua turma.</div><div><a href="disciplinas.html">Abrir</a></div></div>
<div class="ac-grupos">${GR.map(([g, ic, L]) => `<section class="card ac-g"><h2><span class="ac-g-ic">${ic}</span>${g}</h2><ul>${L.map(item).join("")}</ul></section>`).join("")}</div>
<ul class="sub"><li><a href="#estrutura">Estrutura curricular</a></li><li><a href="#creditos">Créditos</a></li><li><a href="#disciplinas">Disciplinas</a></li><li><a href="#atividades">Atividades obrigatórias</a></li><li><a href="#aproveitamento">Aproveitamento</a></li><li><a href="#trancamento">Trancamento</a></li></ul>
<section class="blk tx" id="estrutura"><h2>Estrutura curricular</h2>
<p>O regulamento do Mestrado Acadêmico em Arquitetura e Urbanismo do UNIVAG prevê, no mínimo, 34 créditos para o mestrado. A proposta curricular inclui disciplinas obrigatórias e optativas. O programa tem duração mínima de 24 (vinte e quatro) meses e máxima de 30 (trinta) meses. A conclusão, prevista em 4 semestres, está assim estruturada:</p>
<ol class="ac-sem">${SEM.map(([s, L]) => `<li class="card"><b>${s}</b><ul>${L.map(x => `<li>${x}</li>`).join("")}</ul></li>`).join("")}</ol>
<p>A inclusão de disciplinas obrigatórias proporciona fundamentos epistemológicos, teóricos, metodológicos e éticos essenciais para a realização da pesquisa acadêmica, frequentemente a primeira experiência de investigação dos estudantes. Adicionalmente, o plano de estudos inclui disciplinas optativas. Estas disciplinas abordam temas e tópicos específicos, alinhados com os objetivos do Programa e a particularidade das suas linhas de pesquisa.</p></section>
<section class="blk tx" id="creditos"><h2>Créditos</h2>
<p>O mestrado está estruturado em <b>34 créditos acadêmicos</b>, e cada crédito corresponde a 15 horas, num total de <b>510 horas</b>. Os créditos estão assim distribuídos:</p>
<div class="ac-barra" role="img" aria-label="Distribuição dos 34 créditos">${AT.CRED.map(([a, , , tc], i) => `<span style="flex:${tc}" class="c${i}"><b>${tc}</b>${esc(a)}</span>`).join("")}</div>
<div class="tbl-wrap"><table class="tbl ac-tbl"><thead><tr><th>Atividade</th><th class="num">Quantidade</th><th class="num">Créditos por atividade</th><th class="num">Total de créditos</th><th class="num">C.H. por atividade</th><th class="num">C.H. total</th></tr></thead><tbody>
${AT.CRED.map(([a, q, c, tc, ch, cht]) => `<tr><td>${esc(a)}</td><td class="num" data-l="Quantidade">${q}</td><td class="num" data-l="Créditos por atividade">${c}</td><td class="num" data-l="Total de créditos">${tc}</td><td class="num" data-l="C.H. por atividade">${ch} h</td><td class="num" data-l="C.H. total">${cht} h</td></tr>`).join("")}
<tr class="tot"><td>Total</td><td></td><td></td><td class="num" data-l="Total de créditos">34</td><td></td><td class="num" data-l="C.H. total">510 h</td></tr></tbody></table></div></section>
<section class="blk tx" id="disciplinas"><h2>Disciplinas</h2>
<p>Todas as disciplinas têm 45 horas e 3 créditos; os seminários avançados têm 30 horas e 2 créditos. Horários e turmas do semestre estão em <a href="disciplinas.html">Disciplinas e horários</a>.</p>
<div class="ac-discs">${tabDisc("Obrigatória", "Obrigatórias")}${tabDisc("Seminários", "Seminários avançados")}${tabDisc("Eletiva", "Eletivas")}</div></section>
<section class="blk tx" id="atividades"><h2>Atividades obrigatórias</h2>
<p>São consideradas atividades obrigatórias de produção científica, que somam os 2 créditos exigidos:</p>
<ul class="ac-ativ">${ATIV.map(([a, c]) => `<li><span>${a}</span>${crPl(c)}</li>`).join("")}</ul></section>
<section class="blk tx" id="aproveitamento"><h2>Aproveitamento de créditos</h2>
<p>Podem ser aproveitados créditos obtidos em outros programas de pós-graduação <em>stricto sensu</em>, até um terço (1/3) do total de créditos exigidos para a conclusão do mestrado. O aproveitamento depende de aprovação da Pró-Reitoria de Pós-Graduação, Pesquisa e Extensão do UNIVAG. Prazos e documentos estão no <a href="docs/${ARQ.guia}" download>Guia de procedimentos acadêmicos</a>.</p></section>
<section class="blk tx" id="trancamento"><h2>Trancamento de matrícula</h2>
<p>O discente poderá, com anuência do Orientador, solicitar ao Conselho do Programa o trancamento da matrícula no prazo previsto no calendário acadêmico do Programa, fundamentando seu pedido.</p>
<p>Para solicitar o trancamento de matrícula o aluno deverá ter concluído com aprovação, no mínimo, 1 disciplina.</p></section>`
  });
  const pgTx = (arq, titulo, desc, p, S, ata, outra) => P.push({
    arq, titulo, desc, hero: { crumb: true, eyebrow: "Acadêmico · Qualificação e defesa", p },
    corpo: `<div class="tx-pg"><aside class="tx-lado"><div class="card"><h3>Nesta página</h3>${AT.sumario(S).replace('class="sub"', 'class="tx-sum"')}</div>
<div class="card"><h3>Documentos</h3><ul class="tx-docs">${item(ata)}${item(["Guia de procedimentos acadêmicos", ...anexo("guia"), "dl"])}${item(outra)}</ul></div></aside>
<div class="tx-corpo">${AT.secoes(S)}</div></div>`
  });
  pgTx("qualificacao.html", "Orientações para qualificação", "Etapas, banca, proficiência, memorial e atribuições do aluno e do orientador no Exame de Qualificação do PPGAU UNIVAG.", "Etapas do agendamento do Exame de Qualificação, do 12º ao 18º mês do curso.", AT.QUALI, ["Ata de exame de qualificação", ...anexo("ataQ"), "dl"], ["Orientações para defesa", "defesa.html", "próxima etapa", "pg"]);
  pgTx("defesa.html", "Orientações para defesa", "Agendamento, banca, versão definitiva e atribuições do aluno e do orientador na Defesa da Dissertação do PPGAU UNIVAG.", "Etapas do agendamento do Exame de Defesa da Dissertação e entrega da versão definitiva.", AT.DEFESA, ["Ata de exame de defesa", ...anexo("ataD"), "dl"], ["Orientações para qualificação", "qualificacao.html", "etapa anterior", "pg"]);
}

// Contato
P.push({
  arq: "contato.html", titulo: "Contato", desc: "Endereço, telefone e e-mails da coordenação do PPGAU UNIVAG.",
  hero: { crumb: true, p: "Fale com a coordenação do programa." },
  corpo: `
<section class="blk">${LOCAL}</section>
<h2 class="ct-tit">Fale com o programa</h2>
<div class="ct-grid">
<div class="card ct-card"><span class="tag">Secretaria</span><h3>Telefone</h3><p><a href="tel:+556536886110">(65) 3688-6110</a></p><p class="meta">Atendimento da secretaria do programa.</p></div>
${coord.map(d => `<div class="card pessoa ct-card"><img src="img/${esc(d.foto)}" width="84" height="84" alt="Foto de ${esc(d.n)}"><div><span class="tag">${/Jeane/.test(d.n) ? "Coordenadora" : "Coordenador adjunto"}</span><h3>${esc(d.n)}</h3><p class="links"><a href="mailto:${esc(d.f.email)}">${esc(d.f.email)}</a></p></div></div>`).join("")}
</div>`
});

// Disciplinas e horários do semestre, a partir de calendario.json (gerado por calendario.py da planilha da coordenação).
{
  const CALJ = JSON.parse(fs.readFileSync(path.join(__dirname, "calendario.json"), "utf8"));
  const CORES = [["Seminários Avançados", "Seminários avançados", "#8e5cd9"], ["Arquitetura e Cidade", "Arquitetura e Cidade", "#2a78d6"], ["Teoria e História", "Teoria e História do Urbanismo", "#eb6834"], ["Políticas Públicas", "Políticas Públicas", "#1baf7a"], ["Seminário de Pesquisa", "V Seminário de Pesquisa", "#c99700"], ["Simpósio", "3º Simpósio TCA", "#b4447a"]];
  const slug = t => semAcentoB(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  function semAcentoB(t) { return t.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  const fotoDe = n => { const w = semAcentoB(n).toLowerCase().split(/\s+/); const d = corpo.find(c => { const v = semAcentoB(c.n).toLowerCase().split(/\s+/); return v[0] === w[0] && w.slice(1).some(x => x.length > 3 && v.some(y => y.slice(0, 5) === x.slice(0, 5))); }); return d ? { n: d.n, foto: "img/" + d.foto } : { n, foto: "" }; };
  const disc = {};
  CALJ.sessoes.forEach(x => {
    const k = slug(x.nome); x.d = k;
    if (!disc[k]) {
      const c = CORES.find(c => x.nome.includes(c[0])) || ["", x.nome, "#7a8494"];
      const plano = Object.values(CALJ.plano).flatMap(p => p.itens).find(i => i.nome === x.nome);
      const profs = /^Todos/.test(x.prof) || /Simpósio/.test(x.nome) ? [{ n: x.prof && !/Simpósio/.test(x.prof) ? x.prof : "Docentes e discentes do programa", foto: "" }] : x.prof.split(/\s*\/\s*/).filter(Boolean).map(fotoDe);
      disc[k] = { nome: x.nome, curto: c[1], cor: c[2], prof: profs, ch: plano && plano.ch ? plano.ch : null, cat: x.cat };
    }
  });
  Object.values(disc).forEach(d => { if (!d.ch) { const t = CALJ.sessoes.filter(x => x.nome === d.nome).reduce((a, x) => a + (x.ch || 0), 0); d.ch = t || null; } });
  const turmas = CALJ.turmas.map(t => { const m = /Turma (\d+) - (.*)/.exec(t); return { id: m[1], rotulo: m[2].replace(" - Calouros", ", calouros") }; });
  const sess = CALJ.sessoes.map(({ data, h, d, ch, turmas, local }) => ({ data, h, d, ch, turmas, local }));
  const versao = CALJ.titulo.replace(/^.*Versão\s*/, "Versão ").replace(/\s+-\s+/, ", de ");
  globalThis.__CAL = "const CAL = " + JSON.stringify({ sessoes: sess, disc, turmas, plano: CALJ.plano, versao }) + ";\n";
  P.push({
    arq: "disciplinas.html", titulo: "Disciplinas e horários", desc: "Disciplinas, horários, professores e turmas do 2º semestre de 2026 do Mestrado em Arquitetura e Urbanismo do UNIVAG.",
    hero: { crumb: true, eyebrow: "2º semestre de 2026 · Mestrado acadêmico", p: `${Object.keys(disc).length} disciplinas e atividades, ${new Set(sess.filter(x => x.data).map(x => x.data)).size} dias de aula de agosto a dezembro, às sextas à noite e aos sábados. Escolha a sua turma para ver só o que é seu.` },
    corpo: `
<div class="dc-turmas" role="group" aria-label="Escolha a turma"><span>Sou da</span><button type="button" data-turma="todas">Todas as turmas</button>${turmas.map(t => `<button type="button" data-turma="${t.id}"><b>Turma ${t.id}</b><small>${esc(t.rotulo.replace("Ingressantes ", "ingresso "))}</small></button>`).join("")}</div>
<section class="dc-prox card" id="dc-prox" aria-live="polite"></section>
<div class="dc-abas" role="tablist"><button role="tab" data-aba="agenda">Agenda</button><button role="tab" data-aba="cal">Calendário</button><button role="tab" data-aba="disc">Disciplinas</button><button role="tab" data-aba="plano">Plano da turma</button></div>
<div id="dc-agenda"></div><div id="dc-cal" hidden></div><div id="dc-disc" hidden></div><div id="dc-plano" hidden></div>
<p class="meta" style="margin-top:20px">Fonte: Calendário Acadêmico do 2º semestre de 2026 da coordenação, <span id="dc-versao"></span>. Aulas híbridas pela Instrução Normativa CAPES nº 2/2024: presenciais e on-line ao vivo, com encontros obrigatórios no campus. Outras normas em <a href="academico.html">Acadêmico</a>.</p>`,
    scripts: ["disciplinas-dados.js", "disciplinas.js"]
  });
}

// Linha do tempo detalhada: marcos do programa, eventos, defesas, ingressos, projetos, prêmios e mídia.
{
  const CAT = { ...HIST_CAT, proj: ["Projetos", "#0f7b6c"], imp: ["Prêmios, mídia e financiamento", "#b4447a"] };
  const ev = [];
  const dataDe = (txt, ano) => { const m = /(\d{1,2})\/(\d{2})\/(\d{4})/.exec(txt || "") || /(\d{1,2})\/(\d{2})/.exec(txt || ""); return m ? [+m[2], +m[1]] : [0, 0]; };
  const add = (ano, mes, dia, cat, t, d, extra = {}) => ev.push({ ano: +ano, mes, dia, cat, t, d, ...extra });
  HIST.filter(h => +h.ano <= 2026).forEach(h => add(h.ano, 0, 0, h.cat, h.t, h.d, { f: h.f }));
  const papel = { organizador: "Organização do PPGAU", coorganizador: "Coorganização do PPGAU", participante: "Participação do PPGAU" };
  EVENTOS.forEach(e => { const [m, d] = dataDe(e.datas); add(e.ano, m, d, "rede", e.nome, [String(e.datas || "").replace(/\s*\(.*\)$/, "").replace(/^não informadas.*$/, ""), papel[e.ppgau_papel]].filter(Boolean).join(" · "), { f: "Página de eventos do programa" }); });
  IMPACTO.impacto.filter(x => x.tipo !== "evento" && x.ano).forEach(x => add(x.ano, 0, 1, x.tipo === "extensão/comunidade" ? "proj" : x.tipo === "parceria" ? "rede" : "imp", x.titulo, x.descricao, { links: (x.links || []).slice(0, 2) }));
  BASE.dissertacoes.forEach(([ano, dia, aut, ori, tit, url]) => { const [d, m] = dia.split("/").map(Number); add(ano, m, d, "form", `Defesa: ${aut}`, `${titulo(tit)}. Orientação: ${ori}.`, { links: url ? [url] : [] }); });
  const turmas = {}; PESSOAS.forEach(p => { const t = p.c === "pos-doc" ? null : p.in1 || p.in; if (t) (turmas[t] = turmas[t] || []).push(p.n); });
  Object.entries(turmas).forEach(([t, l]) => { const [a, sem] = t.split("/"); add(a, sem === "2" ? 8 : 3, 0, "form", `Ingresso da turma ${t}: ${l.length} ${l.length > 1 ? "mestrandos" : "mestrando"}`, l.sort((x, y) => x.localeCompare(y, "pt-BR")).join(", ") + ".", { f: "Lista oficial de alunos do programa" }); });
  const pos = PESSOAS.filter(p => p.c === "pos-doc"); pos.forEach(p => add(p.in, 0, 2, "form", `Pós-doutorado: ${p.n}`, `${p.ti ? titulo(p.ti) + ". " : ""}Supervisão: ${p.or}.`));
  const porAno = {}; PROJ.filter(p => p.ini >= 2019 && p.ini <= 2026 && (p.t === "pesquisa" || p.t === "extensão")).forEach(p => (porAno[p.ini] = porAno[p.ini] || []).push(p));
  Object.entries(porAno).forEach(([a, l]) => add(a, 0, 3, "proj", `${l.length} ${l.length > 1 ? "projetos iniciados" : "projeto iniciado"} pelos docentes`, "", { lista: l.map(p => `${p.tit} (${p.t}; coordenação: ${p.coord || "não informada"})`), f: "Currículos Lattes dos docentes" }));
  ev.sort((a, b) => a.ano - b.ano || a.mes - b.mes || a.dia - b.dia);
  const anos = [...new Set(ev.map(e => e.ano))];
  const MES = ["", "jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  const quando = e => e.mes ? `${e.dia ? e.dia + " de " : ""}${MES[e.mes]} ${e.ano}` : String(e.ano);
  const usados = Object.keys(CAT).filter(c => ev.some(e => e.cat === c));
  P.push({
    arq: "linha-do-tempo.html", titulo: "Linha do tempo", desc: "Linha do tempo detalhada das ações do PPGAU UNIVAG desde 2018: marcos, eventos, defesas, ingressos, projetos, prêmios e mídia.",
    hero: { crumb: true, p: `${ev.length} registros de ${anos[0]} a ${anos[anos.length - 1]}: marcos institucionais, eventos, defesas, turmas, pós-doutorados, projetos, prêmios e o programa na mídia.` },
    js: `
const ativos=new Set(${JSON.stringify(usados)});
document.querySelectorAll(".tl-f button").forEach(b=>b.addEventListener("click",()=>{const c=b.dataset.c;
 if(c==="todos"){usadas.forEach(x=>ativos.add(x))}else if(ativos.size===usadas.length){ativos.clear();ativos.add(c)}else if(ativos.has(c)){ativos.delete(c);if(!ativos.size)usadas.forEach(x=>ativos.add(x))}else ativos.add(c);
 document.querySelectorAll(".tl-f button[data-c]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.c==="todos"?ativos.size===usadas.length:ativos.has(x.dataset.c)&&ativos.size<usadas.length));
 document.querySelectorAll(".tl2 li[data-c]").forEach(li=>li.hidden=!ativos.has(li.dataset.c));
 document.querySelectorAll(".tl-ano").forEach(s=>{const n=s.querySelectorAll("li[data-c]:not([hidden])").length;s.hidden=!n;s.querySelector(".tl-n").textContent=n+(n>1?" registros":" registro")})}));
const usadas=${JSON.stringify(usados)};`,
    corpo: `
<nav class="tl-anos" aria-label="Anos">${anos.map(a => `<a href="#a${a}">${a}</a>`).join("")}</nav>
<div class="tl-f" role="group" aria-label="Filtrar por tipo"><button type="button" data-c="todos" aria-pressed="true">Tudo</button>${usados.map(c => `<button type="button" data-c="${c}" aria-pressed="false"><i style="background:${CAT[c][1]}"></i>${esc(CAT[c][0])}</button>`).join("")}</div>
${anos.map(a => { const l = ev.filter(e => e.ano === a); return `<section class="tl-ano" id="a${a}"><h2><span>${a}</span><small class="tl-n">${l.length} ${l.length > 1 ? "registros" : "registro"}</small></h2>
<ol class="tl2">${l.map(e => `<li data-c="${e.cat}" style="--c:${CAT[e.cat][1]}"><div class="tl-q"><time>${esc(quando(e))}</time><span class="tl-c">${esc(CAT[e.cat][0])}</span></div><h3>${esc(e.t)}</h3>${e.d ? `<p>${esc(e.d)}</p>` : ""}${e.lista ? `<details class="mais"><summary>Ver os ${e.lista.length} projetos</summary><ul>${e.lista.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}${(e.links || []).length || e.f ? `<p class="meta">${e.f ? "Fonte: " + esc(e.f) : ""}${(e.links || []).map((h, i) => " " + ext(h, i ? "Outra fonte" : "Ver ↗")).join("")}</p>` : ""}</li>`).join("")}</ol></section>`; }).join("")}`
  });
}

// Mapa da produção: obras do Lattes (PLAT) e equipes de projeto (PROJ), com autores identificados por sobrenome e inicial.
{
  const { autores, chave, chavesNome, semAcento } = require("./autores.js");
  const PLAT = D("PLAT"), PL_CAT = D("PL_CAT");
  const TEC = new Set([...PL_CAT.tec.map(c => c[0]), "apr"]);
  const curto = n => { const w = n.split(" "); return w[0] + " " + (/^(Filho|Junior|Neto)$/.test(w[w.length - 1]) ? w[w.length - 2] + " " + w[w.length - 1] : w[w.length - 1]); };
  const doc = PLAT.nomes.map(n => { const c = corpo.find(d => d.n === n); return { n, curto: curto(n), foto: c && c.foto ? "img/" + c.foto : "", ini: n.split(" ").filter(w => w.length > 2)[0][0] + n.split(" ").filter(w => w.length > 2 && !/^(Filho|Junior)$/.test(w)).slice(-1)[0][0] }; });
  // Identidade das pessoas: sobrenome + iniciais dos dois primeiros prenomes (SILVA L H ≠ SILVA L F).
  // Uma referência só com a primeira inicial (SILVA L) vai para a única pessoa compatível, se houver só uma.
  const PARTIC = /^(de|da|do|das|dos|e|di|del)$/i;
  // "E" maiúsculo isolado é inicial (E. A. G.), não a partícula "e".
  const naoPart = t => t && !(PARTIC.test(t) && (t.length > 1 || t === t.toLowerCase()));
  const iniDe = pre => semAcento(pre).replace(/\./g, " ").split(/\s+/).filter(naoPart).map(t => t[0].toUpperCase()).filter(c => /[A-Z]/.test(c));
  const iniNome = n => semAcento(n).split(/\s+/).filter(naoPart).slice(0, -1).map(t => t[0].toUpperCase());
  const chaveDoc = new Map(); PLAT.nomes.forEach((n, i) => chavesNome(n).forEach(k => chaveDoc.set(k, i)));
  const ehDoc = (x, ini) => { if (!chaveDoc.has(x.k)) return -1; const i = chaveDoc.get(x.k), m = iniNome(PLAT.nomes[i]); return ini.length > 1 && m.length > 1 && ini[1] !== m[1] && !alias.has(x.k) ? -1 : i; };
  const alias = new Set();
  // prenomes invertidos no próprio Lattes: "RAVACHE, LIA ROSANA" é a Profa. Rosana Lia Ravache
  [["RAVACHE L", "Rosana Lia Ravache"]].forEach(([k, n]) => { const i = PLAT.nomes.indexOf(n); if (i >= 0) { chaveDoc.set(k, i); alias.add(k); } });
  const k2 = (k, ini) => ini.length > 1 ? k + " " + ini[1] : k;
  const tit = s => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  // "ROSIN, P. D. J. A. R. G." é a Profa. Dra. Jeane (Godoy Rosin) com o título antes das iniciais
  const fixa = ref => ref.replace(/^([A-ZÀ-Ý]+)\. (?=[A-ZÀ-Ý]\.)/, "$1, ").replace(/ROSIN, P\. ?D\. ?(?=J\.)/g, "ROSIN, ");
  // Grafias do próprio docente que não batem com o nome (ex.: sobrenome de solteira): a chave externa
  // mais frequente nas obras do docente em que ele não foi reconhecido pelo nome.
  {
    const cont = PLAT.nomes.map(() => new Map()), falta = PLAT.nomes.map(() => 0);
    PLAT.itens.forEach(([, , ref, ds]) => {
      const xs = autores(fixa(ref));
      ds.forEach(i => { if (xs.some(x => ehDoc(x, iniDe(x.pre)) === i)) return; falta[i]++; xs.filter(x => ehDoc(x, iniDe(x.pre)) < 0).forEach(x => cont[i].set(x.k, (cont[i].get(x.k) || 0) + 1)); });
    });
    cont.forEach((m, i) => [...m].filter(([k, n]) => n >= 3 && n >= falta[i] * .3 && k.slice(-1) === semAcento(PLAT.nomes[i])[0].toUpperCase()).forEach(([k]) => { chaveDoc.set(k, i); alias.add(k); console.log("grafia de", PLAT.nomes[i], "→", k); }));
  }
  // Link de acesso de cada obra: DOI ou endereço citado na referência; DOI do OpenAlex (FICHA_2025) pelo título;
  // senão, busca do título no Google Acadêmico (só produção bibliográfica).
  const nT = x => semAcento(String(x || "")).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const OA = Object.values(D("FICHA_2025")).flat().filter(x => x.doi && nT(x.titulo).length >= 20).map(x => [nT(x.titulo), x.doi]);
  const tituloRef = ref => { let r = ref.includes(" . ") ? ref.slice(ref.indexOf(" . ") + 3) : ref.replace(/^([^.;]*?[A-ZÀ-Ý]{2,}[^.;]*?(\.\s?[A-ZÀ-Ý]\.?)*\s*;\s*)*[^.]*?\.\s+/, ""); const m = r.match(/^(.{12,}?[^\s.]{2,})\.\s/); return (m ? m[1] : r.slice(0, 160)).trim(); };
  const linkObra = (ref, tec) => {
    const doi = ref.match(/\b(10\.\d{4,9}\/[^\s;,]+[^\s;,.)])/); if (doi) return ["https://doi.org/" + doi[1], "doi"];
    const u = ref.match(/https?:\/\/[^\s;,]+[^\s;,.)]/); if (u) return [u[0], "link"];
    const n = nT(ref), o = OA.find(([t]) => n.includes(t)); if (o) return [o[1], "doi"];
    if (tec) return "";
    const t = tituloRef(ref); return t.length >= 8 ? ["https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + t + '"'), "busca"] : "";
  };
  const AUD = []; globalThis.__AUD = AUD;
  const MAX_AUT = 12; // listas maiores são comissões e pareceres coletivos, não coautoria
  const brutos = [];
  PLAT.itens.forEach(([cat, ano, ref, ds, q]) => {
    const d = new Set(ds), a = [], xs = autores(fixa(ref));
    const au = [];
    xs.forEach(x => { const ini = iniDe(x.pre), i = ehDoc(x, ini); au.push([x.sob, x.pre, i >= 0 ? "D" + i : k2(x.k, ini)]); if (i >= 0) d.add(i); else if (xs.length <= MAX_AUT) a.push([k2(x.k, ini), tit(x.sob) + ", " + x.pre]); });
    AUD.push({ ref, ds, au });
    brutos.push([TEC.has(cat) ? "tec" : "pub", cat, ano, ref, q || "", [...d].sort((x, y) => x - y), a, linkObra(ref, TEC.has(cat))]);
  });
  PROJ.forEach(p => {
    const d = new Set((p.docs || []).map(n => PLAT.nomes.indexOf(n)).filter(i => i >= 0)), a = [];
    (p.eq || []).forEach(n => { const i = PLAT.nomes.indexOf(n); if (i >= 0) { d.add(i); return; } const w = n.split(" "), k = chave(w[w.length - 1], w[0]); if (k) a.push([k2(k, iniNome(n)), n]); });
    brutos.push(["proj", p.t, Math.max(2021, Math.min(2026, p.ini)), `Projeto de ${p.t}: ${p.tit} (${p.ini}–${p.fim === "Atual" ? "atual" : p.fim}). Coordenação: ${p.coord || "não informada"}.`, "", [...d].sort((x, y) => x - y), a]);
  });
  // Junta "SILVA L" à única "SILVA L x" existente; discentes reconhecidos pela chave completa.
  const completas = new Map();
  brutos.forEach(w => w[6].forEach(([k]) => { const b = k.split(" ").length; if (/ [A-Z] [A-Z]$/.test(k)) { const base = k.slice(0, -2); if (!completas.has(base)) completas.set(base, new Set()); completas.get(base).add(k); } }));
  const TIPO_AL = { discente: "dis", egresso: "egr", "pos-doc": "pos" };
  const alunos = new Map(); PESSOAS.forEach(p => { const w = p.n.split(" "), k = chave(w[w.length - 1], w[0]); if (k) alunos.set(k2(k, iniNome(p.n)), [p.n, TIPO_AL[p.c] || "dis"]); });
  // Confere o nome da referência com o nome completo do discente/egresso/pós-doc: o sobrenome precisa estar no nome,
  // os prenomes ou iniciais precisam aparecer na ordem, e em sobrenomes comuns (SILVA, SOUZA...) a referência
  // precisa trazer todas as iniciais da pessoa, para não juntar homônimos ("SILVA, M. S." ≠ Marcos de Sá Fernandes da Silva).
  const COMUNS = /^(SILVA|SANTOS|OLIVEIRA|SOUZA|SOUSA|LIMA|PEREIRA|COSTA|RODRIGUES|ALMEIDA|FERREIRA|ALVES|CARVALHO|GOMES|MARTINS|ARAUJO|RIBEIRO|BARBOSA|ROCHA|DIAS|NASCIMENTO|PAULA|MOURA|MACHADO|MARQUES|LOPES|MENDES|CASTRO|BARROS|FREITAS|CARDOSO|TEIXEIRA|CORREA|NUNES|SOARES|VIEIRA|MONTEIRO|MOREIRA|CAVALCANTI|ARRUDA|DUARTE|FERNANDES|JESUS|PINTO|REIS|ANDRADE)$/;
  const pal = x => semAcento(x).toUpperCase().replace(/[^A-Z.\s]/g, " ").replace(/\./g, ". ").split(/\s+/).filter(t => t && !/^(DE|DA|DO|DAS|DOS|E)$/.test(t)).map(t => t.replace(/(.)\1/g, "$1"));
  // diferença de no máximo uma letra (erro de digitação: "Sayouri" = "Sayuri")
  const lev1 = (a, b) => { if (Math.abs(a.length - b.length) > 1) return false; let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(i + 1) === b.slice(i + 1) || a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i); };
  const confere = (cheio, ref) => {
    let sob, pre; if (ref.includes(",")) [sob, pre] = ref.split(/,\s*/); else { const w = ref.trim().split(/\s+/); sob = w.pop(); pre = w.join(" "); }
    const w = pal(cheio).map(t => t.replace(".", "")), sw = pal(sob).map(t => t.replace(".", "")).filter(t => !/^(FILHO|JUNIOR|NETO)$/.test(t));
    const js = w.indexOf(sw[sw.length - 1]); if (js < 0) return false;
    const antes = w.slice(0, js).filter(t => !sw.includes(t)), p = pal(pre || "");
    if (!p.length) return false;
    let j = 0;
    for (const t of p) { const ini = t.endsWith(".") || t.length === 1, c = t.replace(".", ""); let ok = false;
      while (j < antes.length) { const x = antes[j++]; if (ini ? x[0] === c[0] : x === c || (c.length > 4 && x[0] === c[0] && lev1(x, c))) { ok = true; break; } }
      if (!ok) return false; }
    return !COMUNS.test(sw[sw.length - 1]) || p.length >= antes.length;
  };
  const recusados = new Map();
  const resolve = k => { if (/ [A-Z] [A-Z]$/.test(k)) return k; const c = completas.get(k); return c && c.size === 1 ? [...c][0] : k; };
  const pes = {}, W = [];
  brutos.forEach(w => {
    const ks = new Set();
    w[6].forEach(([k, nome]) => {
      let r = resolve(k);
      if (alunos.has(r) && !confere(alunos.get(r)[0], nome)) { recusados.set(alunos.get(r)[0] + " ≠ " + nome, (recusados.get(alunos.get(r)[0] + " ≠ " + nome) || 0) + 1); r = k + " ~" + semAcento(nome).toUpperCase().replace(/[^A-Z ]/g, ""); }
      ks.add(r);
      if (alunos.has(r)) pes[r] = [...alunos.get(r)];
      else if (!pes[r] || (pes[r][1] === "ext" && nome.length > pes[r][0].length)) pes[r] = [nome, "ext"];
      pes[r].bruto = 1;
    });
    W.push([...w.slice(0, 6), [...ks], w[7] || ""]);
  });
  // Nome para exibir: "Sobrenome, Prenome Completo" vira "Prenome Completo Sobrenome"; com iniciais, fica como no Lattes.
  for (const v of Object.values(pes)) {
    delete v.bruto;
    if (v[1] !== "ext" || !v[0].includes(",")) continue;
    const [sob, pre] = v[0].split(/,\s*/);
    v[0] = /\b[A-ZÀ-Ý]\.(\s|$)/.test(pre) || !pre ? tit(sob) + ", " + pre.toUpperCase() : tit(pre.replace(/\.$/, "")).replace(/ (De|Da|Do|Dos|Das|E) /g, m => m.toLowerCase()) + " " + tit(sob).replace(/^(De|Da|Do) /, m => m.toLowerCase());
  }
  { const L = W.map(w => w[7] && w[7][1] || "sem"); console.log("links do mapa:", ["doi", "link", "busca", "sem"].map(k => k + " " + L.filter(x => x === k).length).join(", ")); }
  globalThis.__MAPA = "const MAPA = " + JSON.stringify({ doc, pes, W }) + ";\n";
  globalThis.__REDE = { doc, pes, W };
  if (recusados.size) console.log("homônimos separados de discentes/egressos:", [...recusados].map(([k, n]) => k + (n > 1 ? " (" + n + ")" : "")).join("; "));
  if (process.env.AUDIT) fs.writeFileSync(process.env.AUDIT, JSON.stringify({ AUD, doc, pes, W, alunos: [...alunos], completas: [...completas].map(([k, v]) => [k, [...v]]), alias: [...alias], nomes: PLAT.nomes }));
  const nPes = Object.keys(pes).length;
  P.push({
    arq: "mapa.html", titulo: "Mapa da produção", desc: "Rede de coautoria e de equipes de projeto dos docentes do PPGAU UNIVAG, com a lista da produção registrada no Lattes.",
    hero: { crumb: true, p: `Quem produz com quem: ${W.length} obras e projetos dos ${doc.length} docentes, de 2021 a 2026, ligados a ${nPes} coautores e membros de equipe. Fonte: ${esc(PLAT.fonte)}.` },
    corpo: `
<section class="blk" aria-labelledby="h-rede"><h2 id="h-rede">Rede de colaboração · coautoria e projetos</h2>
<p class="lead">A rede mostra a produção feita pelo programa: os docentes, com foto, e os discentes, egressos e pós-doutorandos que produziram com eles. Cada linha liga um docente a quem dividiu obras com ele; a espessura mostra quantas. Clique em uma pessoa para ver as obras.</p>
<ul class="rd-leg" aria-label="Legenda"><li><i class="doc"></i>Docentes do programa</li><li><i class="dis"></i>Discentes</li><li><i class="egr"></i>Egressos</li><li><i class="pos"></i>Pós-doutorandos</li><li><i class="ext"></i>Colaboradores externos</li></ul>
<div class="rd-ctl card">
<label>De <select id="f-de"></select></label><label>Até <select id="f-ate"></select></label>
<fieldset><legend>Tipos</legend><label><input type="checkbox" name="f-tipo" value="pub" checked> Publicações</label><label><input type="checkbox" name="f-tipo" value="tec" checked> Produção técnica e apresentações</label><label><input type="checkbox" name="f-tipo" value="proj" checked> Equipes de projeto</label></fieldset>
<label>Colaboradores externos <select id="f-min"><option value="0">Não mostrar</option><option value="3" selected>Com 3 ou mais obras</option><option value="1">Todos</option></select></label>
<label>Docente em foco <select id="f-foco"></select></label>
<label class="rd-busca">Encontrar pessoa <input id="f-busca" list="f-pessoas" type="search" placeholder="Digite um nome"></label><datalist id="f-pessoas"></datalist>
</div>
<p class="meta" id="rd-resumo"></p>
<div class="rd-grid"><div class="rd-box card" id="rd-box"></div>
<aside class="rd-lado"><div class="card"><h3>Discentes, egressos e pós-docs que mais produzem com os docentes</h3><ol class="rd-l" id="rd-top"></ol></div><div class="card"><h3>Coautoria entre docentes</h3><ol class="rd-l" id="rd-dd"></ol></div></aside></div>
<p class="meta">Os nomes são agrupados pelo sobrenome e pela inicial, como aparecem nas referências do Lattes. Nomes parecidos podem se juntar, e grafias diferentes da mesma pessoa podem aparecer separadas.</p>
</section>
<section class="blk" id="lista" aria-labelledby="h-lista"><h2 id="h-lista">Produção</h2>
<div class="filtro"><select id="l-doc" aria-label="Docente"></select><select id="l-ano" aria-label="Ano"></select><select id="l-q" aria-label="Qualis"><option value="">Qualquer Qualis</option><option value="A">Só estratos A</option><option value="q">Com estrato Qualis</option></select><input id="l-busca" type="search" placeholder="Buscar por título, revista ou autor" aria-label="Buscar na produção"></div>
<p class="ls-chip" id="ls-chip" hidden></p><p class="meta" id="ls-n"></p>
<ol class="lista card ls" id="ls"></ol><p><button type="button" class="btn" id="ls-mais" hidden>Mostrar mais</button></p>
<p class="meta">Produção completa por docente, com gráficos e indicadores CAPES, no <a href="${dados("producao")}">PPGAU em dados</a>.</p>
</section>`,
    scripts: ["mapa-dados.js", "mapa.js"]
  });
}

// ---------- saída ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "img/fotos"), { recursive: true });
// ---------- Livros ----------
// Livros e anais organizados pelo programa e por seus docentes (Lattes 2021–2026), com capa e acesso ao arquivo.
// Para incluir um livro: acrescente uma linha em LIVROS. capa = id da imagem na Estante ANAP (static.wixstatic.com/media/<id>).
const EST = "https://www.estantedaanap.org/product-page/", E3 = "https://even3.blob.core.windows.net/download/";
const LIVROS = [
  { t: "Anais do 2º Simpósio Brasileiro Território, Cidade e Arquitetura", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini", ed: "UNIVAG", loc: "Várzea Grande", ano: 2024, pg: 468, tipo: "anais", prog: 1, pdf: E3 + "Anaisdo2SimpsioBrasileiro-TerritrioCidadeeArquitetura.1cea4b89573843ac88e7.pdf" },
  { t: "Anais do Latin American Symposium City, Architecture and Sustainability", v: "Volume I", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini", ed: "ANAP/UNIVAG", loc: "Várzea Grande", ano: 2024, tipo: "anais", prog: 1, pdf: E3 + "...ANAIS-volumeI-CityArchitectureandSustainability.c85d06935fed4092b2a4.pdf" },
  { t: "Anais do Latin American Symposium City, Architecture and Sustainability", v: "Volume II", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini", ed: "ANAP/UNIVAG", loc: "Várzea Grande", ano: 2024, pg: 810, tipo: "anais", prog: 1, pdf: E3 + "...ANAIS-volumeII-CityArchitectureandSustainability.2f17bc5b7fe74dd2a879.pdf" },
  { t: "Anais do Encontro Técnico e Científico para Construção de Cidades Verdes", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini; Gisele Carignani; Erica Lemos Gulinelli", ed: "ANAP", loc: "Tupã", ano: 2024, edn: "4. ed.", pg: 524, tipo: "anais", prog: 1, pdf: E3 + "CidadesVerdes.a2ab2c3b1650448ca197.pdf" },
  { t: "Anais Tchá Pesquisa", org: "Natallia Sanches e Souza; Diana Carolina Jesus de Paula; Jeane Aparecida Rombi de Godoy; Carmelina Suquerê de Moraes", ed: "UNIVAG/ANAP", loc: "Várzea Grande", ano: 2024, tipo: "anais", prog: 1, pdf: PDF("a3d1f7f3c3c347288876767e1a9ac492") },
  { t: "Desafios da ampliação da pesquisa no Centro-Oeste", sub: "a experiência da associação da PUC-Campinas na criação do Programa de Pós-Graduação em Arquitetura e Urbanismo do UNIVAG", org: "Laura Machado de Mello Bueno; Jeane Aparecida Rombi de Godoy; Manoel Lemes da Silva Neto; Daniel Ribeiro; Erica Lemos Gulinelli; Sandra Medina Benini; Lucas Vicente", ed: "Splendet/PUC-Campinas", loc: "Campinas", ano: 2024, pg: 505, isbn: "978-65-89946-37-3", tipo: "colet", prog: 1, pdf: "" },
  { t: "Brasil Urbano", sub: "desenvolvimento, desafios habitacionais e sustentabilidade", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini; Erica Lemos Gulinelli", ed: "Editora ANAP", loc: "Tupã", ano: 2024, pg: 169, isbn: "978-65-86753-80-6", tipo: "colet", prog: 1, capa: "f414e0_78f3541d4a5540b2b11d0b36491bf166~mv2.png", est: "brasil-urbano" },
  { t: "Infraestrutura, planejamento e meio ambiente", sub: "perspectivas urbanas no Brasil", org: "Jeane Aparecida Rombi de Godoy; Angelo Palmisano; Sandra Medina Benini; Erica Lemos Gulinelli", ed: "Editora ANAP", loc: "Tupã", ano: 2024, pg: 132, isbn: "978-65-86753-81-3", tipo: "colet", prog: 1, capa: "f414e0_16d88e8580d14c1c9c3d1b3f9e4cd315~mv2.png", est: "infraestrutura-planejamento-e-meio-ambiente" },
  { t: "100 Praças de Cuiabá", sub: "materialização da apropriação do espaço público", org: "Joel Marcos Gatto", autor: 1, ed: "Editora ANAP", loc: "Tupã", ano: 2024, isbn: "978-65-83518-00-2", tipo: "livro", prog: 1, nota: "Prefácio de Jeane Aparecida Rombi de Godoy.", capa: "f414e0_bf2ef1e9368c426eaf0789f9765211be~mv2.jpg", pdf: PDF("175ba2c2abf545dd953c4d4797ee185f"), est: "100-praças-de-cuiabá-materialização-da-apropriação-do-espaço-público" },
  { t: "Quadrinhos para pensar a cidade", sub: "uma experiência de extensão universitária", org: "Jéssica Seabra; Diana Carolina Jesus de Paula; Natallia Sanches e Souza; Fábio Friol Guedes de Paiva", autor: 1, ed: "UNIVAG Centro Universitário", loc: "Várzea Grande", ano: 2026, pg: 78, tipo: "livro", prog: 1, ler: "https://online.fliphtml5.com/lvrxv/kxpi/", capa: "https://online.fliphtml5.com/lvrxv/kxpi/files/shot.jpg" },
  { t: "Anais do Simpósio Brasileiro Cidade, Paisagem e a Natureza", v: "Vol. I", org: "Marta Enokibara; Jeane Aparecida Rombi de Godoy", ed: "ANAP", loc: "Tupã", ano: 2025, edn: "4. ed.", isbn: "978-65-83518-04-0", tipo: "anais", capa: "f414e0_9e9c1bc5683b4207b473e823515406ab~mv2.png", est: "anais-do-simpósio-brasileiro-cidade-paisagem-e-a-natureza-vol-i" },
  { t: "Anais do Simpósio Brasileiro Cidade, Paisagem e a Natureza", v: "Vol. II", org: "Marta Enokibara; Jeane Aparecida Rombi de Godoy", ed: "ANAP", loc: "Tupã", ano: 2025, edn: "4. ed.", pg: 725, isbn: "978-65-83518-05-7", tipo: "anais", capa: "f414e0_dec1281d874b4b229a25e5d4b4561f4b~mv2.png", est: "anais-do-simpósio-brasileiro-cidade-paisagem-e-a-natureza" },
  ...[["I", "06-4", "234ddd50280d42cfbf4c23a2fb02d9fd", "vol-i"], ["II", "07-1", "4b1fc31d71d9436ea8f68baa83f53372", "vol-ii"], ["III", "08-8", "22f5476e883244aabf3fc3144afb087b", "vol-iii"]].map(([v, i, c, s]) => ({ t: "Anais do Congresso Latino-americano de Desenvolvimento Sustentável", v: "Vol. " + v, org: "Sandra Medina Benini; Allan Leon Casemiro da Silva; Geise Brizotti Pasquotto; Graziella Plaça Orosco de Souza; Ricardo Miranda dos Santos", ed: "ANAP", loc: "Tupã", ano: 2025, isbn: "978-65-83518-" + i, tipo: "anais", capa: `f414e0_${c}~mv2.png`, est: "anais-do-congresso-latino-americano-de-desenvolvimento-sustentável-" + s })),
  { t: "Meio Ambiente", sub: "temas emergentes da contemporaneidade", org: "Juliana Heloisa Pinê Américo-Pinheiro; Sandra Medina Benini; Jeane Aparecida Rombi de Godoy; Rafael Silvio Bonilha Pinheiro", ed: "Editora ANAP", loc: "Tupã", ano: 2024, pg: 132, isbn: "978-65-86753-85-1", tipo: "colet", capa: "f414e0_629c6fdf76a2432eaa5d1c3d754b4878~mv2.png", est: "meio-ambiente-temas-emergentes-da-contemporaneidade" },
  { t: "Paisagem", sub: "métodos e técnicas de análise e intervenção no Brasil, Portugal e Espanha", org: "Marta Enokibara; Geise Brizotti Pasquotto; Sandra Medina Benini", ed: "ANAP", loc: "Tupã", ano: 2024, pg: 305, isbn: "978-65-86753-76-9", tipo: "colet", capa: "f414e0_e94b3c02446e481a87eb9b1aa36fe1bf~mv2.jpg", est: "paisagem" },
  { t: "Estatuto da Cidade", sub: "avanços e desafios", org: "Jeane Aparecida Rombi de Godoy; Celso Maran de Oliveira", ed: "ANAP", loc: "Tupã", ano: 2023, edn: "2. ed.", pg: 218, isbn: "978-65-86753-74-5", tipo: "colet", capa: "f414e0_0828f10cc8a7404d8859d8d30d943ce5~mv2.jpg", est: "estatuto-da-cidade-avanços-e-desafios-2-ed" },
  { t: "Drenagem Urbana", sub: "soluções alternativas sustentáveis", org: "Adacto Benedicto Ottoni; Jeane Aparecida Rombi de Godoy; Fernanda Moço Foloni", ed: "ANAP", loc: "Tupã", ano: 2023, edn: "2. ed.", pg: 118, isbn: "978-65-86753-73-8", tipo: "colet", capa: "f414e0_58e3faf3489347a8a31d0ae18870e3e3~mv2.jpg", est: "drenagem-urbana-soluções-alternativas-sustentáveis-2-ed" },
  { t: "Estruturas ambientais urbanas e a ambiência", org: "Sandra Medina Benini; Geise Brizotti Pasquotto; Jeane Aparecida Rombi de Godoy", ed: "ANAP", loc: "Tupã", ano: 2021, pg: 159, isbn: "978-65-86753-45-5", tipo: "colet", capa: "f414e0_e0d07faffe40478cac8df688fc237188~mv2.jpg", est: "estruturas-ambientais-urbanas-e-a-ambiência" },
  { t: "Múltiplos olhares sobre a cidade contemporânea", org: "Geise Brizotti Pasquotto; Jeane Aparecida Rombi de Godoy; Sandra Medina Benini", ed: "ANAP", loc: "Tupã", ano: 2021, pg: 131, isbn: "978-65-86753-46-2", tipo: "colet", capa: "f414e0_477de2d21ef147f0a1658330a57471b7~mv2.jpg", est: "múltiplos-olhares-sobre-a-cidade-contemporânea" },
];
const TIPO_LIV = { anais: "Anais", colet: "Coletânea", livro: "Livro" };
const capaURL = id => /^https?:/.test(id) ? id : `https://static.wixstatic.com/media/${id}/v1/fit/w_480,h_680,q_85/${id.replace(/^.*\./, "file.")}`;
// Referência ABNT do livro: SOBRENOME, Nome; ... (org.). Título: subtítulo. ed. Local: Editora, ano.
const abnt = l => { const ps = l.org.split("; "); const nm = n => { const w = n.split(" "); return w.pop().toUpperCase() + ", " + w.join(" "); }; return `${ps.length > 3 ? nm(ps[0]) + " et al." : ps.map(nm).join("; ")}${l.autor ? "" : " (org.)"}. ${l.t}${l.sub ? ": " + l.sub : ""}${l.v ? ", " + l.v.toLowerCase() : ""}. ${l.edn ? l.edn + " " : ""}${l.loc}: ${l.ed}, ${l.ano}.${l.isbn ? " ISBN " + l.isbn + "." : ""}`; };
// Capa local (gerador/midia/livros/<slug do título e volume>.jpg) tem prioridade sobre a imagem hospedada fora.
const capaLocal = l => { const f = "livros/" + slugN(l.t + (l.v ? " " + l.v : "")) + ".jpg"; return fs.existsSync(path.join(__dirname, "midia", f)) ? "img/" + f : null; };
const capaLivro = (l, cls = "") => `<span class="lv-capa${cls}" style="--h:${(l.t.length * 37 + l.ano) % 360}"><span class="lv-fb" aria-hidden="true"><small>${TIPO_LIV[l.tipo]} · ${l.ano}</small><b>${esc(l.t)}</b>${l.v ? `<i>${esc(l.v)}</i>` : ""}<em>${esc(l.ed)}</em></span>${capaLocal(l) || l.capa ? `<img src="${capaLocal(l) || capaURL(l.capa)}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>`;
{
  const L = [...LIVROS].sort((a, b) => (b.prog || 0) - (a.prog || 0) || b.ano - a.ano), anos = [...new Set(L.map(l => l.ano))].sort((a, b) => b - a);
  const nPdf = L.filter(l => l.pdf).length, nEst = L.filter(l => l.est || l.ler).length;
  const card = (l, i) => `<li class="lv" data-i="${i}" data-busca="${esc([l.t, l.sub, l.v, l.org, l.ed, l.isbn].join(" "))}" data-tipo="${l.tipo}" data-ano="${l.ano}" data-prog="${l.prog ? "sim" : ""}">
<button type="button" class="lv-abre" aria-haspopup="dialog">${capaLivro(l)}<span class="lv-t"><span class="lv-tags">${l.prog ? '<span class="tag gold">PPGAU</span>' : ""}<span class="tag">${TIPO_LIV[l.tipo]}</span></span><b>${esc(l.t)}${l.v ? " · " + esc(l.v) : ""}</b><small>${l.ano} · ${esc(l.ed)}</small></span></button>
<div class="lv-acoes">${l.ler ? `<a class="lv-dl" href="${esc(l.ler)}" target="_blank" rel="noopener">${ICO.livros.replace(/width="26" height="26"/, 'width="16" height="16"')}Ler</a>` : l.pdf ? `<a class="lv-dl" href="${esc(l.pdf)}" target="_blank" rel="noopener" download>${ICO.baixar}PDF</a>` : l.est ? `<a class="lv-dl" href="${esc(EST + l.est)}" target="_blank" rel="noopener">${ICO.baixar}Grátis</a>` : `<span class="lv-sem">Impresso</span>`}</div></li>`;
  globalThis.__LIV_HOME = L.filter(l => l.capa).slice(0, 10);
  P.push({
    arq: "livros.html", titulo: "Livros e anais", desc: `${L.length} livros, coletâneas e anais organizados pelo PPGAU UNIVAG e por seus docentes, com capa, referência e download gratuito.`,
    hero: { crumb: true, kpis: true, eyebrow: "Produção bibliográfica · acesso aberto", h1: "Livros e anais do programa",
      p: "Coletâneas, livros autorais e anais de eventos organizados pelo PPGAU e por seus docentes. Quase todos têm download gratuito: em PDF direto ou pela Estante da Editora ANAP, que envia o arquivo por e-mail." },
    corpo: `
<div class="kpis">
<div class="kpi gold"><b>${L.length}</b><span>publicações</span><small>de ${anos[anos.length - 1]} a ${anos[0]}</small></div>
<div class="kpi"><b>${L.filter(l => l.prog).length}</b><span>do próprio programa</span><small>organizadas pelo PPGAU/UNIVAG</small></div>
<div class="kpi"><b>${L.filter(l => l.tipo === "anais").length}</b><span>volumes de anais</span><small>de simpósios e congressos</small></div>
<div class="kpi"><b>${nPdf + nEst - L.filter(l => l.pdf && l.est).length}</b><span>com download gratuito</span><small>${nPdf} em PDF direto</small></div>
</div>
<section class="blk" aria-labelledby="h-lv"><h2 id="h-lv">Estante</h2>
<div class="lv-filtros" data-filtro="lv-lista">
<div class="lv-chips" role="group" aria-label="Filtrar por tipo">${[["", "Todos"], ["prog", "Do programa"], ["anais", "Anais"], ["colet", "Coletâneas"], ["livro", "Livros autorais"]].map(([v, l], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
<label class="lv-q">${ICO.busca}<input type="search" placeholder="Buscar título, organizador ou ISBN" aria-label="Buscar livros"></label>
<select name="ano" aria-label="Ano"><option value="">Todos os anos</option>${anos.map(a => `<option>${a}</option>`).join("")}</select>
<select name="tipo" hidden aria-hidden="true"><option value=""></option>${Object.keys(TIPO_LIV).map(k => `<option value="${k}">${k}</option>`).join("")}</select>
<select name="prog" hidden aria-hidden="true"><option value=""></option><option value="sim">sim</option></select>
</div>
<p class="meta lv-cont" aria-live="polite"></p>
<ul class="lv-grade" id="lv-lista">${L.map(card).join("")}</ul>
<p class="meta" data-vazio="lv-lista" style="display:none">Nenhum livro encontrado com esses filtros.</p>
</section>
<section class="blk"><div class="aviso info"><div><b>Como baixar</b> · Os botões <b>PDF</b> abrem o arquivo direto. Os botões <b>Grátis</b> levam à Estante da Editora ANAP: adicione o livro ao carrinho, finalize sem pagar e o link de download chega no seu e-mail.</div></div>
<p class="meta">Lista montada a partir do Lattes dos docentes (2021–2026), das publicações do site anterior e da Estante ANAP. A produção completa, com capítulos e artigos, está no ${ext(dados("producao"), "PPGAU em dados")}.</p></section>
<dialog id="lv-dlg" aria-labelledby="lv-dt"><div class="lv-dbox"><button type="button" class="lv-x" aria-label="Fechar">×</button><div class="lv-dcapa"></div><div class="lv-dinfo"><div class="lv-dtags"></div><h2 id="lv-dt"></h2><p class="lv-dsub"></p><dl class="lv-ddl"></dl><div class="lv-dbtns"></div><div class="lv-ref"><span>Como citar (ABNT)</span><p></p><button type="button" class="lv-cop">Copiar referência</button></div></div></div></dialog>`,
    js: `${FILTRO_JS}
const LIV=${JSON.stringify(L.map(l => ({ t: l.t + (l.v ? " · " + l.v : ""), sub: l.sub || "", org: l.org, aut: !!l.autor, ed: l.ed, loc: l.loc, ano: l.ano, edn: l.edn || "", pg: l.pg || "", isbn: l.isbn || "", tipo: TIPO_LIV[l.tipo], prog: !!l.prog, nota: l.nota || "", pdf: l.pdf || "", ler: l.ler || "", est: l.est ? EST + l.est : "", ref: abnt(l) })))};
(()=>{const F=document.querySelector(".lv-filtros"),inp=F.querySelector("input"),selT=F.querySelector("[name=tipo]"),selP=F.querySelector("[name=prog]"),cont=document.querySelector(".lv-cont"),itens=[...document.querySelectorAll(".lv")];
const conta=()=>{const n=itens.filter(i=>!i.hidden).length;cont.textContent=n+" de "+itens.length+" publicações"};
F.querySelectorAll(".lv-chips button").forEach(b=>b.addEventListener("click",()=>{F.querySelectorAll(".lv-chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));selT.value=b.dataset.v==="prog"?"":b.dataset.v;selP.value=b.dataset.v==="prog"?"sim":"";inp.dispatchEvent(new Event("input",{bubbles:true}))}));
F.addEventListener("input",()=>setTimeout(conta));F.addEventListener("change",()=>{inp.dispatchEvent(new Event("input",{bubbles:true}))});conta();
const d=document.getElementById("lv-dlg"),q=s=>d.querySelector(s),e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
document.getElementById("lv-lista").addEventListener("click",ev=>{const b=ev.target.closest(".lv-abre");if(!b)return;const li=b.closest(".lv"),l=LIV[+li.dataset.i];
q(".lv-dcapa").innerHTML=li.querySelector(".lv-capa").outerHTML;q(".lv-dtags").innerHTML=(l.prog?'<span class="tag gold">PPGAU</span>':"")+'<span class="tag">'+l.tipo+'</span>';
q("#lv-dt").textContent=l.t;q(".lv-dsub").textContent=l.sub?l.sub.charAt(0).toUpperCase()+l.sub.slice(1):"";
q(".lv-ddl").innerHTML=[[l.aut?"Autoria":"Organização",l.org.split("; ").join(", ")],["Editora",l.ed+", "+l.loc],["Ano",l.ano+(l.edn?" · "+l.edn:"")],["Páginas",l.pg],["ISBN",l.isbn],["Nota",l.nota]].filter(x=>x[1]).map(x=>"<div><dt>"+x[0]+"</dt><dd>"+e(x[1])+"</dd></div>").join("");
q(".lv-dbtns").innerHTML=(l.ler?'<a class="btn" href="'+e(l.ler)+'" target="_blank" rel="noopener">Ler on-line</a>':"")+(l.pdf?'<a class="btn" href="'+e(l.pdf)+'" target="_blank" rel="noopener" download>Baixar PDF</a>':"")+(l.est?'<a class="btn'+(l.pdf?" sec":"")+'" href="'+e(l.est)+'" target="_blank" rel="noopener">'+(l.pdf?"Ver na Estante ANAP":"Baixar grátis na Estante ANAP")+'</a>':"")+(!l.pdf&&!l.est&&!l.ler?'<p class="meta">Edição impressa. Peça um exemplar à coordenação.</p>':"");
q(".lv-ref p").textContent=l.ref;q(".lv-cop").textContent="Copiar referência";d.showModal()});
q(".lv-x").addEventListener("click",()=>d.close());d.addEventListener("click",ev=>{if(ev.target===d)d.close()});
q(".lv-cop").addEventListener("click",ev=>{const t=q(".lv-ref p").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>ev.target.textContent="Referência copiada ✓",()=>{const r=document.createRange();r.selectNodeContents(q(".lv-ref p"));getSelection().removeAllRanges();getSelection().addRange(r);ev.target.textContent="Selecionada: use Ctrl+C"})});
document.addEventListener("pointermove",ev=>{const c=ev.target.closest&&ev.target.closest(".lv-abre .lv-capa");if(!c)return;const r=c.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;c.style.transform="perspective(700px) rotateY("+(x*16)+"deg) rotateX("+(-y*12)+"deg) translateY(-6px)"},{passive:true});
document.addEventListener("pointerout",ev=>{const c=ev.target.closest&&ev.target.closest(".lv-abre .lv-capa");if(c&&!c.contains(ev.relatedTarget))c.style.transform=""});
})();`
  });
}

// ---------- Revista Vernácula ----------
{
  const VB = "https://periodicos.univag.com.br/index.php/Vernacula";
  const semAcentoB = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ED = [[199, 3, 11, 2025, "01/11/2025"], [193, 3, 10, 2025], [183, 3, 9, 2025], [169, 2, 8, 2024], [151, 2, 7, 2024], [150, 2, 6, 2024], [149, 2, 5, 2024], [127, 1, 4, 2023], [126, 1, 3, 2023], [125, 1, 2, 2023], [124, 1, 1, 2023]];
  const capa = ([id, v, n, a], cls = "") => `<a class="vn-capa${cls}" href="${VB}/issue/view/${id}" target="_blank" rel="noopener" aria-label="Vernácula v. ${v}, n. ${n} (${a})"><span class="vn-fb" aria-hidden="true"><b>VERNÁCULA</b><small>Territórios Contemporâneos</small><i>v. ${v} · n. ${n}</i><em>${a}</em></span><img src="${fs.existsSync(path.join(__dirname, "midia/vernacula", `v${n}.jpg`)) ? `img/vernacula/v${n}.jpg` : `https://periodicos.univag.com.br/public/journals/16/cover_issue_${id}_pt_BR.jpg`}" alt="" loading="lazy" onerror="this.remove()"></a>`;
  const ULT = [
    ["Análise das contribuições do conceito de mobilidade urbana como serviço (MaaS) no planejamento e gestão", "Diego Vieira Ramos, Tais Muller", 3295],
    ["Análise geoespacial e térmica das áreas de preservação permanente na Mata do Buraquinho: impactos ambientais e urbanos", "Ellen Priscila Nunes de Souza, Rani Karine Rodrigues Silva", 3296],
    ["Construção civil sustentável como resposta à emergência climática: práticas e desafios", "Marcos de Oliveira Valin Jr, Joelson Viana Sodré", 3297],
    ["Emergência climática e a construção de cidades resilientes: o caso da cidade de Petrópolis, RJ", "Ronaldo Raemy Rangel, Alessandro Marco Rosini", 3298],
    ["Entre a vaga ofertada e a atuação efetiva: a participação social no Comitê de Bacia Hidrográfica do Alto Rio Cuiabá após 2020", "Douglas Bezerra Gonçalves, Leonardo Gomes de Vasconcelos", 3301],
    ["Leitura urbana e diagnóstico participativo em Barra do Bugres: aplicação da metodologia CPE no ensino", "Caio Cesar Tomaz de Oliveira, Bruna Eduarda Isidorio Rosa, Esther Debora Fioresi Cardoso, Jeziane Aragão Ponte, Nivalda da Costa Nunes", 3302],
    ["Um estudo acerca do programa Minha Casa, Minha Vida (MCMV): o desenho universal como “palco” de uma experiência inclusiva", "Ana Caroline Gonçalves de Moura, Ellen Priscila Nunes de Souza, Janille Valentim de Andrade, Thifany Lima da Silva, Renata Rocha Quaresma", 3303],
    ["Análise de práticas de desenho universal no projeto padrão de casa popular da Caixa Econômica Federal", "Ellen Priscila Nunes de Souza, Luana Deográcia do Nascimento Fernandes, Maysa Rodrigues Gonçalves, Stephany Hannele Morais Magalhães", 3304],
    ["O planejamento da mobilidade urbana e a gestão territorial: o conceito TOD (transit-oriented development)", "Diego Vieira Ramos, Tais Muller", 3305],
    ["Caracterização da ventilação natural para planejamento em projetos sustentáveis: o caso de Tangará da Serra, MT", "João Carlos Machado Sanches, Alynne Cristina Sacoman, Emeli Aparecida Lalesca da Guarda, Renata Mansuelo Alves Domingos", 3306]];
  const EQ = [["Jeane Aparecida Rombi de Godoy", "Editora-chefe"], ["Sandra Medina Benini", "Editora associada"], ["Angelo Palmisano", "Conselho editorial"], ["Lucia Helena Gaeta Aleixo", "Conselho editorial"], ["Rosana Lia Ravache", "Conselho editorial"]];
  const COM = [["Ana Luiza Carvalho da Rocha", "UFRGS"], ["Angélica Benatti Alvim", "Mackenzie"], ["Beatriz Mugayar Kühl", "FAU-USP"], ["Betânia Brendle", "UFS"], ["Caio Boucinhas", "FAU-USP"], ["Eunice Helena Sguizzardi Abascal", "Mackenzie"], ["Helena Napoleon Degreas", "USCS"], ["Jane Victal Ferreira", "PUC-Campinas"], ["Jeferson Tavares", ""], ["Jonathas Magalhães Pereira da Silva", "PUC-Campinas"], ["Laura Machado de Mello Bueno", "PUC-Campinas"], ["Lucia Helena Gaeta Aleixo", "UNIVAG"], ["Luciane Cleonice Durante", "UFMT"], ["Lucília Siqueira", "UNIFESP"], ["Luiz Augusto Maia Costa", "PUC-Campinas"], ["Luiz Carlos de Laurentiz", "UFU"], ["Manoel Lemes da Silva Neto", "PUC-Campinas"], ["Maria Lucia Bressan Pinheiro", "FAU-USP"], ["Nelson Pôrto Ribeiro", "UFES"], ["Paulo César Garcez Marins", "Museu Paulista, USP"], ["Paulo Sergio Scarazzato", "FAU-USP"], ["Raquel da Silva Pereira", "USCS"], ["Sylvia Adriana Dobry Pronsato", "FAU-USP"], ["Tania da Rocha Pitta", "UFPE e CeaQ/Sorbonne"], ["Tomás Antonio Moreira", "IAU-USP"], ["Vitale Joanoni Neto", "UFMT"]];
  const nInst = new Set(COM.map(c => c[1].split(/[ ,]/)[0].replace(/^FAU-|^IAU-/, "")).filter(Boolean)).size;
  const IDX = [["ISSN Portal", "https://portal.issn.org/resource/ISSN/2965-6125"], ["Crossref (DOI)", "https://search.crossref.org/?q=+2965-6125&from_ui=yes"], ["Google Acadêmico", "https://scholar.google.com/citations?hl=pt-BR&user=emcOgXcAAAAJ"], ["OpenAlex", "https://openalex.org/sources/S4389157920"], ["Sudoc/ABES", "https://www.sudoc.abes.fr/cbs/DB=2.1//SRCH?IKT=12&TRM=273784463"], ["Scilit", "https://www.scilit.com/sources/140485"], ["Semantic Scholar", "https://www.semanticscholar.org/search?q=Vern%C3%A1cula%2C%20territ%C3%B3rios%20contempor%C3%A2neos&sort=relevance"], ["ROAD", ""]];
  const fotoEq = n => { const c = corpo.find(d => semAcentoB(d.n).toLowerCase().split(" ")[0] === semAcentoB(n).toLowerCase().split(" ")[0] && semAcentoB(d.n).toLowerCase().split(" ").pop() === semAcentoB(n).toLowerCase().split(" ").pop()); return c && c.foto ? "img/" + c.foto : ""; };
  const anos = [...new Set(ED.map(e => e[3]))];
  globalThis.__VERN_CAPAS = ED.slice(0, 5).reverse().map(e => capa(e)).join("");
  globalThis.__VERN_RES = { ed: ED.length, idx: IDX.map(x => x[0]) };
  globalThis.__VERN_IDX = [...ED.map(([id, v, n, a]) => ["Revista", `Vernácula v. ${v}, n. ${n} (${a})`, "Número da Revista Vernácula", `${VB}/issue/view/${id}`]), ...ULT.map(([t, a, id]) => ["Artigo", t, a + " · Vernácula v. 3, n. 11", `${VB}/article/view/${id}`])];
  P.push({
    arq: "revista.html", titulo: "Revista Vernácula", desc: "Vernácula · Territórios Contemporâneos, periódico trimestral do PPGAU UNIVAG. ISSN 2965-6125, Qualis B2, 11 números publicados desde 2023.",
    hero: { crumb: true, kpis: true, eyebrow: "Periódico científico do PPGAU UNIVAG · ISSN 2965-6125", h1: "Vernácula · Territórios Contemporâneos",
      p: "Revista trimestral sobre projeto, gestão e produção do espaço urbano, com ênfase nas intervenções regionais e locais e nos processos sustentáveis. Ponte entre o conhecimento técnico, a prática profissional e a academia.",
      btns: `<p class="hero-btns"><a class="btn" href="${VB}/about/submissions" target="_blank" rel="noopener">Submeter artigo ↗</a> <a class="btn ghost" href="${VB}/issue/archive" target="_blank" rel="noopener">Ler todas as edições ↗</a></p>` },
    corpo: `
<div class="kpis">
<div class="kpi gold"><b>B2</b><span>Qualis CAPES</span><small>Quadriênio 2021–2024</small></div>
<div class="kpi"><b>${ED.length}</b><span>números publicados</span><small>${anos.length} volumes, de ${anos[anos.length - 1]} a ${anos[0]}</small></div>
<div class="kpi"><b>${ULT.length}</b><span>artigos no último número</span><small>v. 3, n. 11, nov. 2025</small></div>
<div class="kpi"><b>${COM.length}</b><span>pareceristas no comitê científico</span><small>de ${nInst} instituições do Brasil e do exterior</small></div>
</div>

<section class="blk vn-why" aria-labelledby="h-vw"><h2 id="h-vw">Por que a Vernácula importa</h2>
<div class="grid">
<div class="card"><h3>Produção qualificada</h3><p>Com Qualis B2, cada artigo publicado conta como produção bibliográfica qualificada para quem publica, e a revista dá visibilidade à pesquisa feita no Centro-Oeste.</p></div>
<div class="card"><h3>Formação de pesquisadores</h3><p>Docentes e discentes atuam como autores, editores e avaliadores. A revista é parte da formação do mestrando, do projeto à publicação.</p></div>
<div class="card"><h3>Rede nacional</h3><p>O comitê científico reúne docentes da USP, Mackenzie, PUC-Campinas, UFMT, UFES, UFU, UFPE, UNIFESP e outras instituições.</p></div>
<div class="card"><h3>Ciência aberta</h3><p>Acesso aberto, DOI da Crossref em cada artigo e presença no Google Acadêmico, OpenAlex, Semantic Scholar e outros indexadores.</p></div>
</div></section>

<section class="blk" aria-labelledby="h-ve"><h2 id="h-ve">Estante de edições</h2>
<p class="lead">Clique em uma capa para abrir o número no portal de periódicos do UNIVAG.</p>
${anos.map(a => `<div class="vn-ano"><h3>${a}<small>Volume ${ED.find(e => e[3] === a)[1]}</small></h3><div class="vn-estante">${ED.filter(e => e[3] === a).map(e => capa(e)).join("")}</div></div>`).join("")}
</section>

<section class="blk vn-ult" aria-labelledby="h-vu">
<div class="vn-ult-c">${capa(ED[0], " grande")}<p class="meta">Publicado em 01/11/2025<br>DOI ${ext("https://doi.org/10.18312/verncula.v3i11", "10.18312/verncula.v3i11")}</p></div>
<div><span class="eyebrow">Último número</span><h2 id="h-vu">v. 3, n. 11 (2025)</h2>
<ol class="vn-art">${ULT.map(([t, a, id]) => `<li><a class="vn-art-t" href="${VB}/article/view/${id}" target="_blank" rel="noopener"><b>${esc(t)}</b></a><span>${esc(a)}</span><a class="vn-art-lk" href="${VB}/article/view/${id}" target="_blank" rel="noopener">Ler o artigo ↗</a></li>`).join("")}</ol>
<a class="btn" href="${VB}/issue/view/199" target="_blank" rel="noopener">Ler o número completo ↗</a></div>
</section>

<section class="blk" aria-labelledby="h-vd"><div class="card vn-dossie"><span class="eyebrow">Próximo dossiê · 2º semestre de 2026</span><h2 id="h-vd">Território e Clima: Desafios à Produção do Espaço</h2><p>Organizado pelo grupo de pesquisa Ambiente Construído, Tecnologia e Sustentabilidade. Submissões encerradas em 10/05/2026; artigos em avaliação para publicação no segundo semestre de 2026.</p></div></section>

<section class="blk" aria-labelledby="h-vq"><h2 id="h-vq">Equipe editorial</h2>
<div class="vn-eq">${EQ.map(([n, r]) => { const f = fotoEq(n); return `<div class="vn-p">${f ? `<img src="${f}" alt="" width="72" height="72">` : `<span class="vn-ini" aria-hidden="true">${n.split(" ").filter(w => w.length > 2).map(w => w[0]).slice(0, 2).join("")}</span>`}<b>${esc(n)}</b><small>${r}</small></div>`; }).join("")}</div>
<details class="vn-com"><summary>Comitê científico (${COM.length} membros)</summary><ul>${COM.map(([n, i]) => `<li>${esc(n)}${i ? ` <small>${esc(i)}</small>` : ""}</li>`).join("")}</ul></details>
</section>

<section class="blk" aria-labelledby="h-vi"><h2 id="h-vi">Indexação e métricas</h2>
<div class="vn-idx">${IDX.map(([n, u]) => u ? ext(u, n + " ↗") : `<span>${n}</span>`).join("")}</div>
</section>

<section class="blk"><div class="vn-cta"><div><h2>Publique na Vernácula</h2><p>Recebemos artigos sobre planejamento urbano, paisagem, direito ambiental e urbanístico, patrimônio arquitetônico, mobilidade e acessibilidade, design de produto e do espaço.</p></div><div class="vn-cta-b"><a class="btn" href="${VB}/about/submissions" target="_blank" rel="noopener">Diretrizes e submissão ↗</a><a class="btn ghost" href="${VB}/about" target="_blank" rel="noopener">Sobre a revista ↗</a></div></div></section>
`
  });
}

// ---------- Bancas e defesas ----------
// Para divulgar uma banca: acrescente uma linha em BANCAS (dt no horário de Cuiabá, -04:00). Bancas futuras aparecem
// na página inicial com contagem regressiva e saem sozinhas depois do horário.
const BANCAS = [
  { al: "Emili Sayuri Takimoto", ti: "Vulnerabilidade climática: uma análise sobre o Córrego do Barbado em Cuiabá-MT", dt: "2026-10-21T14:00:00-04:00", h: "14h (Cuiabá) · 15h (Brasília)", or: "Diana Carolina Jesus de Paula", co: "Natallia Sanches e Souza",
    banca: [["Diana Carolina Jesus de Paula", "PPGAU UNIVAG", "presidente e orientadora"], ["Natallia Sanches e Souza", "PPGAU UNIVAG", "coorientadora"], ["Erica Lemos Gulinelli", "PPGAU UNIVAG", "membro interno"], ["Carlina Maciel", "FAU Mackenzie", "membro externo"]], sala: "Zoom", link: "https://us02web.zoom.us/j/84047081679" },
  { al: "Tatiane Cristine Silva Kono de Oliveira", ti: "Matriz de maturidade BIM na administração pública municipal: adaptação e aplicação como instrumento de gestão estratégica", dt: "2026-08-28T13:00:00-04:00", h: "13h (Cuiabá) · 14h (Brasília)", or: "Fábio Friol Guedes de Paiva", co: "Angelo Palmisano",
    banca: [["Jessica Seabra", "PPGAU UNIVAG", "membro interno"], ["Jacqueline Roberta Tamashiro", "UNOESTE", "membro externo"]], sala: "Zoom", link: "https://us02web.zoom.us/j/81195007153?pwd=30mu6dOxQEsGzbEguJb7p7fDc24evg.1" },
  { al: "Bruno Kimura", ti: "Empreendedorismo gastronômico e sustentabilidade: um olhar sobre restaurantes da Região Metropolitana do Vale do Rio Cuiabá", dt: "2025-12-19", h: "", or: "Fábio Friol Guedes de Paiva", co: "Flávio Henrique dos Santos Foguel",
    banca: [["Diogo Barbosa Leite", "PROFNIT/IFMT", "membro externo"], ["Angelo Palmisano", "PPGAU UNIVAG", "membro interno"]], sala: "Google Meet" },
  { al: "Marcelo Luiz Perini Tarachuk", ti: "Transformações na paisagem e sustentabilidade na bacia hidrográfica do Rio Cuiabá: uma análise de 1985 a 2023", dt: "2025-12-19T14:00:00-04:00", h: "14h (Cuiabá)", or: "Jeane Aparecida Rombi de Godoy", co: "Diana Carolina Jesus de Paula",
    banca: [["Jeane Aparecida Rombi de Godoy", "PPGAU UNIVAG", "orientadora"], ["Diana Carolina Jesus de Paula", "PPGAU UNIVAG", "coorientadora"], ["Edson Piroli", "UNESP Ourinhos", "membro externo"], ["Sandra Medina Benini", "PPGAU UNIVAG", "membro interno"]], sala: "Zoom" },
  { al: "Victória Ferreira Galvão", ti: "Avaliação da inserção urbana do empreendimento MCMV: estudo de caso do Residencial Nova Canaã, Cuiabá-MT", dt: "2025-12-16T13:30:00-04:00", h: "13h30 (Cuiabá)", or: "Jeane Aparecida Rombi de Godoy", co: "Natallia Sanches e Souza",
    banca: [["Jeane Aparecida Rombi de Godoy", "PPGAU UNIVAG", "orientadora"], ["Natallia Sanches e Souza", "PPGAU UNIVAG", "coorientadora"], ["Flávia Maria de Moura Santos", "UFMT", "membro externo"], ["Sandra Medina Benini", "PPGAU UNIVAG", "membro interno"]], sala: "Zoom" },
  { al: "Geisianie Arruda de Almeida", ti: "Análise da transformação das paisagens fluviais urbanas: estudos de caso dos córregos do Barbado e do Gambá", dt: "2025-12-15T13:30:00-04:00", h: "13h30 (Cuiabá) · 14h30 (Brasília)", or: "Sandra Medina Benini", co: "Jeane Aparecida Rombi de Godoy",
    banca: [["Geise Brizotti Pasquotto", "PPGARQ/UNESP", "membro externo"], ["Erica Lemos Gulinelli", "PPGAU UNIVAG", "membro interno"]], sala: "Google Meet" },
  { al: "Yuri de Souza Lopes", ti: "Planejamento integrado dos parques urbanos: estudo de caso de Cuiabá-MT, Várzea Grande-MT e Chapada dos Guimarães-MT", dt: "2025-12-09T13:30:00-04:00", h: "13h30 (Cuiabá) · 14h30 (Brasília)", or: "Sandra Medina Benini", co: "Jeane Aparecida Rombi de Godoy",
    banca: [["Norma Regina Truppel Constantino", "PPGARQ/UNESP", "membro externo"], ["Rosana Lia Ravache", "PPGAU UNIVAG", "membro interno"]], sala: "Google Meet" },
  { al: "Leily Francy Leite de Oliveira Monteiro da Silva", ti: "Avaliação da qualidade ambiental urbana: um estudo de caso do Bairro Cristo Rei, Várzea Grande-MT", dt: "2025-12-03T13:30:00-04:00", h: "13h30 (Cuiabá) · 14h30 (Brasília)", or: "Sandra Medina Benini", co: "Jeane Aparecida Rombi de Godoy",
    banca: [["Geise Brizotti Pasquotto", "PPGARQ/UNESP", "membro externo"], ["Natallia Sanches e Souza", "PPGAU UNIVAG", "membro interno"]], sala: "Google Meet" }
].map(b => ({ ...b, ini: new Date(b.dt.length > 10 ? b.dt : b.dt + "T12:00:00-04:00") }));
const AGORA = new Date();
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
// Data no fuso de Cuiabá (UTC-4, sem horário de verão).
const cuiaba = d => new Date(d.getTime() - 4 * 36e5);
const dataLonga = d => { const c = cuiaba(d); return `${SEMANA[c.getUTCDay()]}, ${c.getUTCDate()} de ${MESES[c.getUTCMonth()]} de ${c.getUTCFullYear()}`; };
const pagDoc = n => { const d = corpo.find(x => semAc(x.n) === semAc(n)); return d ? `docente-${slugN(d.n)}.html` : ""; };
const nomeLink = n => { const h = pagDoc(n); return h ? `<a href="${h}">${esc(n)}</a>` : esc(n); };
const icsBanca = b => ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PPGAU UNIVAG//Site//PT", "BEGIN:VEVENT", `UID:banca-${slugN(b.al)}@ppgau-univag`, "DTSTAMP:" + AGORA.toISOString().replace(/[-:]|\.\d+/g, ""),
  "DTSTART:" + b.ini.toISOString().replace(/[-:]|\.\d+/g, ""), "DTEND:" + new Date(b.ini.getTime() + 2 * 36e5).toISOString().replace(/[-:]|\.\d+/g, ""), `SUMMARY:Defesa de dissertação: ${b.al}`,
  `DESCRIPTION:${b.ti.replace(/[,;]/g, "\\$&")}`, `LOCATION:${b.sala}${b.link ? " " + b.link : ""}`, b.link ? "URL:" + b.link : "", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n") + "\r\n";
const proxBancas = BANCAS.filter(b => b.ini.getTime() + 3 * 36e5 > AGORA.getTime()).sort((a, b) => a.ini - b.ini);
// Cartão de banca futura, usado na página de bancas e na página inicial.
const bancaProx = b => { const c = cuiaba(b.ini); return `<div class="evd bk-prox" data-ate="${b.ini.getTime() + 3 * 36e5}"><div class="evd-data" aria-hidden="true"><span>${MESES[c.getUTCMonth()].slice(0, 3)}</span><b>${c.getUTCDate()}</b><span>${c.getUTCFullYear()}</span></div>
<div class="evd-t"><span class="eyebrow">Defesa de dissertação · aberta ao público</span><h3>${esc(b.ti)}</h3>
<p><b>${esc(b.al)}</b> · ${dataLonga(b.ini)}${b.h ? ", " + esc(b.h) : ""} · on-line pelo ${esc(b.sala)}</p>
<ul class="bk-banca">${b.banca.map(([n, i, p]) => `<li><b>${esc(n)}</b><span>${esc(i)} · ${esc(p)}</span></li>`).join("")}</ul>
<div class="evd-cont" data-contagem="${b.dt}" data-modo="caixas" data-rotulo="para a defesa" data-dur="3" data-fim="Defesa realizada" aria-live="off"></div>
<div class="evd-btns">${b.link ? `<a class="btn" href="${esc(b.link)}" target="_blank" rel="noopener">Entrar na sala (${esc(b.sala)}) ${ICO.seta}</a>` : ""}<a class="btn sec" href="banca-${slugN(b.al)}.ics" download>${ICO.agenda.replace(/width="26" height="26"/, 'width="18" height="18"')}Salvar na agenda</a></div></div></div>`; };
globalThis.__BANCA_HOME = proxBancas.length ? `<section class="blk" aria-labelledby="h-banca"><h2 id="h-banca">Próxima defesa</h2>${bancaProx(proxBancas[0])}<p style="margin-top:12px"><a href="bancas.html">Todas as bancas e defesas →</a></p></section>` : "";
{
  const pass = BANCAS.filter(b => !proxBancas.includes(b)).sort((a, b) => b.ini - a.ini);
  const diss = [...BASE.dissertacoes].sort((a, b) => b[0].localeCompare(a[0]) || a[2].localeCompare(b[2], "pt-BR"));
  const porAno = {}; diss.forEach(d => porAno[d[0]] = (porAno[d[0]] || 0) + 1);
  const anos = Object.keys(porAno).sort(), max = Math.max(...Object.values(porAno));
  const ext_ = new Set(BANCAS.flatMap(b => b.banca.filter(m => /extern/.test(m[2])).map(m => m[1])));
  P.push({
    arq: "bancas.html", titulo: "Bancas e defesas", desc: "Agenda das próximas defesas de dissertação do PPGAU UNIVAG, com link da sala, e histórico das bancas e defesas desde 2021.",
    hero: { crumb: true, kpis: true, eyebrow: "Defesas de dissertação · abertas ao público", p: "As defesas do mestrado são públicas e transmitidas on-line. Veja a próxima banca, salve na sua agenda e entre na sala no horário." },
    corpo: `
<div class="kpis">
<div class="kpi gold"><b>${diss.length}</b><span>dissertações defendidas</span><small>de ${anos[0]} a ${anos[anos.length - 1]}</small></div>
<div class="kpi"><b>${proxBancas.length}</b><span>${proxBancas.length === 1 ? "defesa agendada" : "defesas agendadas"}</span><small>${proxBancas.length ? "próxima em " + cuiaba(proxBancas[0].ini).getUTCDate() + "/" + (cuiaba(proxBancas[0].ini).getUTCMonth() + 1) : "novas datas em breve"}</small></div>
<div class="kpi"><b>${ext_.size}</b><span>instituições externas</span><small>nas bancas divulgadas aqui</small></div>
<div class="kpi"><b>${porAno[anos[anos.length - 1]] || 0}</b><span>defesas em ${anos[anos.length - 1]}</span><small>até agora</small></div>
</div>
<section class="blk" aria-labelledby="h-prox"><h2 id="h-prox">Próximas defesas</h2>
${proxBancas.length ? proxBancas.map(bancaProx).join("") : `<div class="card"><p>Não há defesas agendadas no momento. As próximas bancas aparecem aqui assim que a coordenação divulga.</p></div>`}
<p class="meta" style="margin-top:12px">Para assistir, basta entrar pelo link no horário. Câmera e microfone desligados durante a apresentação.</p></section>

<section class="blk" aria-labelledby="h-real"><h2 id="h-real">Bancas realizadas</h2>
<p class="lead">Bancas divulgadas pela coordenação, com a composição de cada uma.</p>
<div class="grid g2 bk-grade">${pass.map(b => `<article class="card bk"><div class="bk-cab"><time datetime="${b.dt.slice(0, 10)}"><b>${cuiaba(b.ini).getUTCDate()}</b>${MESES[cuiaba(b.ini).getUTCMonth()].slice(0, 3)} ${cuiaba(b.ini).getUTCFullYear()}</time><span class="tag ok">Realizada</span></div>
<h3>${esc(b.ti)}</h3><p><b>${esc(b.al)}</b></p><p class="meta">Orientação: ${nomeLink(b.or)}${b.co ? " · Coorientação: " + nomeLink(b.co) : ""}</p>
<details class="mais"><summary>Banca examinadora</summary><ul>${b.banca.map(([n, i, p]) => `<li>${nomeLink(n)} <span class="meta">${esc(i)} · ${esc(p)}</span></li>`).join("")}</ul></details></article>`).join("")}</div></section>

<section class="blk" aria-labelledby="h-hist"><h2 id="h-hist">Defesas por ano</h2>
<div class="bk-barras" role="img" aria-label="Dissertações defendidas por ano: ${anos.map(a => a + ", " + porAno[a]).join("; ")}">${anos.map(a => `<div><b>${porAno[a]}</b><i style="height:${Math.round(porAno[a] / max * 100)}%"></i><span>${a}</span></div>`).join("")}</div>
<div class="filtro" data-filtro="l-def"><input type="search" placeholder="Buscar por aluno, orientador ou título" aria-label="Buscar defesas"><select name="ano" aria-label="Ano"><option value="">Todos os anos</option>${[...anos].reverse().map(a => `<option>${a}</option>`).join("")}</select></div>
<ol class="lista card" id="l-def">${diss.map(d => `<li data-busca="${esc(d.slice(2, 5).join(" "))}" data-ano="${d[0]}"><span class="tag">${d[1] ? esc(d[1]) + "/" : ""}${d[0]}</span> <b>${esc(d[2])}</b><div>${d[5] ? ext(d[5], esc(titulo(d[4]))) : esc(titulo(d[4]))}</div><div class="meta">Orientação: ${esc(d[3])}</div></li>`).join("")}</ol>
<p class="vazio" data-vazio="l-def">Nenhum resultado.</p>
<p class="meta">Textos completos no ${ext("https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/issue/archive", "Repositório Digital UNIVAG")}. Veja também a página de <a href="egressos.html">egressos</a>.</p></section>`,
    js: FILTRO_JS
  });
}

// ---------- Notícias ----------
// Para publicar uma notícia: acrescente uma linha em NOTICIAS (d = data AAAA-MM-DD). A página inicial mostra as três mais recentes.
// Ingresso e titulação e Impacto na sociedade: páginas próprias, reproduzidas do portal (paginas-dados.js).
P.push(...require("./paginas-dados.js")({ BASE, PROJ, IMPACTO, EVENTOS, REDE, PESSOAS, BANCAS, esc, ext, nomeLink, titulo, atualizado: s => (AZ[s] || HOJE) }));

const NOTICIAS = [
  ...BANCAS.filter(b => b.ini > new Date("2026-08-01")).map(b => ({ d: b.dt.slice(0, 10), tag: proxBancas.includes(b) ? "Banca" : "Defesa", t: proxBancas.includes(b) ? `Defesa de ${b.al.split(" ")[0]} ${b.al.split(" ").slice(-1)[0]} em ${cuiaba(b.ini).getUTCDate()}/${cuiaba(b.ini).getUTCMonth() + 1}` : `${b.al.split(" ")[0]} ${b.al.split(" ").slice(-1)[0]} defendeu a dissertação`, p: `“${b.ti}”. Orientação de ${b.or}${b.co ? ", coorientação de " + b.co : ""}.`, links: [["Ver a banca", "bancas.html"]] })),
  { d: "2026-10-21", tag: "Livro", t: "Quadrinhos para pensar a cidade", p: "Livro de Jessica Seabra com Diana Carolina Jesus de Paula, Natallia Sanches e Souza e Fábio Friol Guedes de Paiva. Mostra o processo, os resultados e uma reflexão crítica sobre o projeto de extensão “Cuiabá e o Direito à Cidade: da teoria à educação em quadrinhos”.", links: [["Ler on-line", "https://online.fliphtml5.com/lvrxv/kxpi/"], ["Na estante", "livros.html"]] },
  { d: "2026-10-01", tag: "Capacitação", t: "Capacitação gratuita para usar o Sidac", p: "O CBCS oferece o Programa de Capacitação no Sidac, Sistema de Informação do Desempenho Ambiental da Construção, em três módulos: Usuários, Fabricantes e Revisores. A formação fica disponível de 01/10 a 31/10/2026. As inscrições foram até 15/10.", links: [["Matéria no site do CBCS", "https://www.cbcs.org.br"]] }
].sort((a, b) => b.d.localeCompare(a.d));
const dataCurta = d => { const [a, m, dd] = d.split("-"); return `${+dd} ${MESES[+m - 1].slice(0, 3)} ${a}`; };
const notCard = n => `<article class="card nt2"><div class="nt2-cab"><span class="tag">${esc(n.tag)}</span><time datetime="${n.d}">${dataCurta(n.d)}</time></div><h3>${esc(n.t)}</h3><p>${esc(n.p)}</p><p class="nt2-links">${n.links.map(([l, h]) => /^https?:/.test(h) ? ext(h, esc(l) + " ↗") : `<a href="${h}">${esc(l)} →</a>`).join("")}</p></article>`;
globalThis.__NOT_HOME = NOTICIAS.slice(0, 3).map(notCard).join("");
P.push({
  arq: "noticias.html", titulo: "Notícias", desc: "Notícias, defesas, lançamentos e eventos do PPGAU UNIVAG e de parceiros.",
  hero: { crumb: true, p: "Defesas, lançamentos de livros, eventos e oportunidades para a comunidade do programa." },
  corpo: `<section class="blk"><div class="grid g2 noti2">${NOTICIAS.map(notCard).join("")}</div>
<p class="meta" style="margin-top:16px">Mais registros na <a href="linha-do-tempo.html">linha do tempo</a> e em <a href="eventos.html">eventos e destaques</a>.</p></section>`
});

// ---------- Egressos ----------
{
  const TER = { cuiaba: "Cuiabá", vg: "Várzea Grande", chapada: "Chapada dos Guimarães", rmvrc: "Região Metropolitana (RMVRC)", caceres: "Cáceres", sinop: "Sinop", mt: "Mato Grosso", geral: "Sem recorte territorial" };
  // Território estudado, lido do título da dissertação.
  const terr = ti => {
    const s = semAc(ti).toUpperCase(), t = new Set();
    if (/REGIAO METROPOLITANA|RMVRC|BAIXADA CUIABANA|VALE DO RIO CUIABA|BACIA HIDROGRAFICA DO RIO CUIABA/.test(s)) t.add("rmvrc");
    if (/CACERES|VILA MARIA/.test(s)) t.add("caceres");
    if (/SINOP/.test(s)) t.add("sinop");
    if (/CHAPADA DOS GUIMARAES/.test(s)) t.add("chapada");
    if (/VARZEA GRANDE/.test(s)) t.add("vg");
    if (/CUIABA/.test(s.replace(/(VALE DO )?RIO CUIABA|BAIXADA CUIABANA/g, "")) || /BARBADO|GAMBA|CAJU/.test(s)) t.add("cuiaba");
    if (/EM MATO GROSSO\b/.test(s)) t.add("mt");
    if (!t.size) t.add("geral");
    return [...t];
  };
  const eg = PESSOAS.filter(p => p.c === "egresso").map(p => ({ ...p, ter: terr(p.ti) })).sort((a, b) => String(b.de).localeCompare(String(a.de)) || a.n.localeCompare(b.n, "pt-BR"));
  const cont = {}; eg.forEach(p => p.ter.forEach(t => cont[t] = (cont[t] || 0) + 1));
  const anos = [...new Set(eg.map(p => p.de))].sort().reverse(), ors = [...new Set(eg.map(p => p.or).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const nPub = eg.reduce((s, p) => s + p.ob.length, 0), comPub = eg.filter(p => p.ob.length).length;
  // Mapa dos municípios da RMVRC (mun.geojson do Atlas), com a quantidade de dissertações sobre cada um.
  const G = JSON.parse(fs.readFileSync(path.join(__dirname, "mun.geojson"), "utf8"));
  let bb = [180, 90, -180, -90]; const vis = c => typeof c[0] === "number" ? (bb = [Math.min(bb[0], c[0]), Math.min(bb[1], c[1]), Math.max(bb[2], c[0]), Math.max(bb[3], c[1])]) : c.forEach(vis);
  G.features.forEach(f => vis(f.geometry.coordinates));
  const WM = 560, k = Math.cos((bb[1] + bb[3]) / 2 * Math.PI / 180), sc = WM / ((bb[2] - bb[0]) * k), HM = Math.round((bb[3] - bb[1]) * sc);
  const pr = ([x, y]) => [(x - bb[0]) * k * sc, (bb[3] - y) * sc];
  const anel = r => { let o = [], u; for (const p of r) { const q = pr(p); if (u && Math.hypot(q[0] - u[0], q[1] - u[1]) < 1.6) continue; o.push(q); u = q; } return "M" + o.map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + "Z"; };
  const MUN_ID = { "Cuiabá": "cuiaba", "Várzea Grande": "vg", "Chapada dos Guimarães": "chapada" };
  const maxC = Math.max(...Object.keys(MUN_ID).map(n => cont[MUN_ID[n]] || 0));
  const cor = n => n ? ["#cbd5ec", "#8aa0d4", "#4f6fb8", "#1f418f", "#02205f"][Math.min(4, Math.ceil(n / maxC * 5) - 1)] : "";
  const munSvg = G.features.map(f => {
    const n = f.properties.nome, id = MUN_ID[n], c = id ? cont[id] || 0 : 0, polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const d = polys.map(pg => pg.map(anel).join("")).join("");
    let cx = 0, cy = 0, m = 0; polys[0][0].forEach(p => { const q = pr(p); cx += q[0]; cy += q[1]; m++; }); cx /= m; cy /= m;
    if (n === "Várzea Grande") cx -= 6;
    return { n, id, c, d, cx, cy };
  }).sort((a, b) => !!a.id - !!b.id);
  const mapa = `<svg class="eg-svg" viewBox="0 0 ${WM} ${HM}" role="group" aria-label="Mapa dos municípios da Região Metropolitana do Vale do Rio Cuiabá com a quantidade de dissertações sobre cada um">
${munSvg.map(m => m.id ? `<path class="eg-m on" d="${m.d}" style="fill:${cor(m.c)}" data-ter="${m.id}" tabindex="0" role="button" aria-label="${esc(m.n)}: ${m.c} ${m.c === 1 ? "dissertação" : "dissertações"}"><title>${esc(m.n)}: ${m.c} ${m.c === 1 ? "dissertação" : "dissertações"}</title></path>` : `<path class="eg-m" d="${m.d}"><title>${esc(m.n)}</title></path>`).join("")}
${munSvg.map(m => `<g class="eg-rot${m.id ? " on" : ""}"${m.id ? ` data-ter="${m.id}"` : ""} transform="translate(${m.cx.toFixed(0)} ${m.cy.toFixed(0)})" aria-hidden="true">${m.id ? `<circle r="${(13 + m.c * 1.6).toFixed(0)}"/><text class="n" dy="5">${m.c}</text><text class="l" dy="${(30 + m.c * 1.6).toFixed(0)}">${esc(m.n)}</text>` : `<text class="l2">${esc(m.n)}</text>`}</g>`).join("")}</svg>`;
  const fora = ["rmvrc", "caceres", "sinop", "mt", "geral"].filter(t => cont[t]);
  const card = p => `<li class="card eg" data-busca="${esc([p.n, p.or, p.co, p.ti].join(" "))}" data-ano="${esc(p.de)}" data-or="${esc(p.or)}" data-ter="${p.ter.join("|")}">
<div class="eg-cab"><span class="ini" aria-hidden="true">${iniciais(p.n)}</span><div><h3>${esc(p.n)}</h3><p class="meta">Turma ${esc(p.in)} · defesa em ${esc(p.de)}</p></div></div>
<p class="eg-ti">${p.re ? ext(p.re, esc(titulo(p.ti)) + " ↗") : esc(titulo(p.ti))}</p>
<p class="eg-ter">${p.ter.map(t => `<span class="tag${t === "geral" ? "" : " gold"}">${TER[t]}</span>`).join("")}</p>
<p class="meta">Orientação: ${nomeLink(p.or)}${p.co ? " · Coorientação: " + nomeLink(p.co) : ""}</p>
${p.ob.length ? `<details class="mais"><summary>${p.ob.length} ${p.ob.length > 1 ? "publicações" : "publicação"} com docentes do programa</summary><ul>${p.ob.map(o => `<li>${o[0]} · ${o[3] ? ext(o[3], esc(o[1])) : esc(o[1])} <span class="meta">${esc(o[2])}</span></li>`).join("")}</ul></details>` : ""}
${p.la ? `<p class="links">${ext(p.la, "Currículo Lattes")}</p>` : ""}</li>`;
  P.push({
    arq: "egressos.html", titulo: "Egressos", desc: `Os ${eg.length} mestres formados pelo PPGAU UNIVAG: dissertação, orientação, território estudado e publicações com os docentes.`,
    hero: { crumb: true, kpis: true, eyebrow: "Mestres formados pelo PPGAU", p: "Quem se formou no programa, o que pesquisou, com quem e sobre qual território. Clique no mapa para ver as dissertações de cada lugar." },
    js: FILTRO_JS + `
(()=>{const f=document.querySelector('[data-filtro="l-eg"]'),s=f.querySelector("select[name=ter]"),vai=t=>{s.value=s.value===t?"":t;s.dispatchEvent(new Event("input",{bubbles:true}));marca();document.getElementById("l-eg").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})},
marca=()=>document.querySelectorAll("[data-ter].eg-m,.eg-chip").forEach(e=>e.classList.toggle("sel",e.dataset.ter===s.value));
document.querySelectorAll(".eg-m.on,.eg-rot.on,.eg-chip").forEach(e=>{e.addEventListener("click",()=>vai(e.dataset.ter));e.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();vai(e.dataset.ter)}})});
s.addEventListener("change",()=>{s.dispatchEvent(new Event("input",{bubbles:true}));marca()});f.querySelectorAll("select:not([name=ter])").forEach(x=>x.addEventListener("change",()=>x.dispatchEvent(new Event("input",{bubbles:true}))));
const n=document.querySelector(".eg-n"),it=[...document.querySelectorAll("#l-eg>li")],c=()=>{const v=it.filter(i=>!i.hidden).length;n.textContent=v+" de "+it.length+" egressos"};f.addEventListener("input",()=>setTimeout(c));c()})();`,
    corpo: `
<div class="kpis">
<div class="kpi gold"><b>${eg.length}</b><span>mestres formados</span><small>de ${anos[anos.length - 1]} a ${anos[0]}</small></div>
<div class="kpi"><b>${comPub}</b><span>publicaram com docentes</span><small>${Math.round(comPub / eg.length * 100)}% dos egressos</small></div>
<div class="kpi"><b>${nPub}</b><span>publicações conjuntas</span><small>artigos e dados com DOI</small></div>
<div class="kpi"><b>${(cont.cuiaba || 0) + (cont.vg || 0) + (cont.chapada || 0) + (cont.rmvrc || 0)}</b><span>estudam a Baixada Cuiabana</span><small>Cuiabá, Várzea Grande e região</small></div>
</div>
<section class="blk" aria-labelledby="h-ter"><h2 id="h-ter">Território das dissertações</h2>
<p class="lead">Onde estão os lugares pesquisados. O território vem do título de cada dissertação; uma mesma pesquisa pode tratar de mais de um município.</p>
<div class="eg-mapa card"><div class="eg-svgw">${mapa}</div>
<div class="eg-fora"><h3>Fora do mapa</h3><ul>${fora.map(t => `<li><button type="button" class="eg-chip" data-ter="${t}"><b>${cont[t]}</b>${TER[t]}</button></li>`).join("")}</ul>
<p class="meta">Clique em um município ou em um item para filtrar a lista. Clique de novo para limpar.</p></div></div></section>
<section class="blk" aria-labelledby="h-eg"><h2 id="h-eg">Egressos e dissertações</h2>
<div class="filtro" data-filtro="l-eg"><input type="search" placeholder="Buscar por nome, orientador ou tema" aria-label="Buscar egressos">
<select name="ano" aria-label="Ano de defesa"><option value="">Todos os anos</option>${anos.map(a => `<option>${a}</option>`).join("")}</select>
<select name="or" aria-label="Orientação"><option value="">Toda orientação</option>${ors.map(o => `<option>${esc(o)}</option>`).join("")}</select>
<select name="ter" aria-label="Território"><option value="">Todo território</option>${Object.keys(TER).filter(t => cont[t]).map(t => `<option value="${t}">${TER[t]}</option>`).join("")}</select></div>
<p class="meta eg-n" aria-live="polite"></p>
<ul class="grid g2 eg-lista" id="l-eg">${eg.map(card).join("")}</ul><p class="vazio" data-vazio="l-eg">Nenhum egresso com esses filtros.</p></section>
<section class="blk"><div class="vn-cta"><div><h2>Onde atuam nossos egressos?</h2><p>Ainda não temos dados sobre onde cada egresso trabalha hoje. Se você se formou no PPGAU, responda o questionário de egressos da autoavaliação e mantenha o Lattes atualizado: assim sua trajetória aparece aqui.</p></div><div class="vn-cta-b"><a class="btn" href="dados/#/responder">Responder como egresso</a><a class="btn ghost" href="bancas.html">Bancas e defesas</a></div></div></section>`
  });
}

// ---------- Páginas dos docentes ----------
// Ano de entrada no programa quando a Coleta CAPES (que começa em 2021) não mostra: a Profa. Jeane está desde a abertura, em 2019.
const ENTRADA = { "Jeane Aparecida Rombi de Godoy": 2019 }, FICHA_2025 = D("FICHA_2025");
{
  const R = globalThis.__REDE, PL_CAT = D("PL_CAT"), CAT = Object.fromEntries([...PL_CAT.bib, ...PL_CAT.tec].map(c => [c[0], c[1]]));
  const PES_T = { dis: "Discente", egr: "Egresso", pos: "Pós-doutorado" };
  corpo.forEach(d => {
    const i = R.doc.findIndex(x => x.n === d.n), W = R.W.filter(w => w[5].includes(i));
    const obras = W.filter(w => w[0] !== "proj"), cats = {}; obras.forEach(w => cats[w[1]] = (cats[w[1]] || 0) + 1);
    const catL = Object.entries(cats).sort((a, b) => b[1] - a[1]), maxCat = catL.length ? catL[0][1] : 1;
    const coD = {}, coA = {}; W.forEach(w => { w[5].forEach(j => j !== i && (coD[j] = (coD[j] || 0) + 1)); w[6].forEach(k => { const p = R.pes[k]; if (p && PES_T[p[1]]) coA[k] = (coA[k] || 0) + 1; }); });
    const topD = Object.entries(coD).sort((a, b) => b[1] - a[1]).slice(0, 6), topA = Object.entries(coA).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const mesmo = n => semAc(n) === semAc(d.n);
    const egr = PESSOAS.filter(p => p.c === "egresso" && (mesmo(p.or) || mesmo(p.co))).sort((a, b) => String(b.de).localeCompare(String(a.de)));
    const dis = PESSOAS.filter(p => (p.c === "discente" || p.c === "pos-doc") && (mesmo(p.or) || mesmo(p.co))).sort((a, b) => a.n.localeCompare(b.n, "pt-BR"));
    const prj = PROJ.filter(p => (p.docs || []).some(mesmo) || mesmo(p.coord)).sort((a, b) => (b.sit === "Em andamento") - (a.sit === "Em andamento") || b.ini - a.ini);
    const liv = LIVROS.filter(l => l.org.split("; ").some(mesmo)).sort((a, b) => b.ano - a.ano);
    // Artigos: 2021–2024 da Coleta CAPES (só anos em que o docente estava no programa) e, desde 2025, OpenAlex por ORCID (com DOI).
    const yD = BASE.anoDoc[d.n], k0 = yD ? yD.ar.findIndex(v => v !== null) : -1;
    const entrada = ENTRADA[d.n] || (k0 >= 0 ? +BASE.anos[k0] : 2025);
    const vistos = new Set(), chaveT = t => semAc(String(t)).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    const arts = [...(d.f.arts || []).map(a => ({ ano: +a[0], t: a[1], rev: a[2], issn: a[3], doi: "" })),
      ...(FICHA_2025[d.n] || []).filter(x => x.cat === "per").map(x => ({ ano: +x.ano, t: x.titulo, rev: x.periodico, issn: "", doi: x.doi || "" }))]
      .filter(a => a.ano >= entrada && !vistos.has(chaveT(a.t)) && vistos.add(chaveT(a.t)))
      .sort((a, b) => b.ano - a.ano || titulo(a.t).localeCompare(titulo(b.t), "pt-BR"));
    const anosArt = Array.from({ length: 2026 - entrada + 1 }, (_, j) => entrada + j);
    const artLi = a => { const tt = titulo(a.t), href = a.doi || `https://scholar.google.com/scholar?q=${encodeURIComponent('"' + tt + '"')}`;
      return `<li data-ano="${a.ano}"><span class="tag">${a.ano}</span> <a class="art-t" href="${esc(href)}" target="_blank" rel="noopener">${esc(tt)}</a> <span class="meta">${esc(a.rev)}${a.issn ? " · ISSN " + esc(a.issn) : ""}</span> <a class="art-lk" href="${esc(href)}" target="_blank" rel="noopener">${a.doi ? "Abrir pelo DOI ↗" : "Localizar no Google Acadêmico ↗"}</a></li>`; };
    const ultAno = arts.length ? arts[0].ano : 2026;
    const artHtml = `<div class="ano-abas" data-filtro-ano="art-${slugN(d.n)}" role="tablist" aria-label="Artigos por ano">${anosArt.map(y => { const n = arts.filter(a => a.ano === y).length; return `<button type="button" role="tab" data-ano="${y}" aria-selected="${y === ultAno}">${y} <small>${n}</small></button>`; }).join("")}<button type="button" role="tab" data-ano="todos" aria-selected="false">Todos <small>${arts.length}</small></button></div>
<ul class="lista card art-lista" id="art-${slugN(d.n)}">${arts.map(artLi).join("")}<li class="art-vazio" hidden>Nenhum artigo registrado neste ano.${entrada < 2021 ? " A base do site começa em 2021 (Coleta CAPES); os anos anteriores entram quando o Lattes completo for carregado." : ""}</li></ul>
<p class="meta">Desde ${entrada}, ano de entrada no programa. 2021–2024: Coleta CAPES; desde 2025: OpenAlex pelo ORCID, com DOI. Quando não há DOI, o link procura o título no Google Acadêmico.</p>`;
    const bks = BANCAS.filter(b => b.banca.some(m => mesmo(m[0])) || mesmo(b.or) || mesmo(b.co));
    const links = [["Lattes", d.lat], ["ORCID", d.orc], ...(d.f.links || []).filter(l => !/lattes|orcid/i.test(l[0]))].filter(l => l[1]);
    const oE = egr.filter(p => mesmo(p.or)), oD = dis.filter(p => mesmo(p.or)), cE = egr.filter(p => !mesmo(p.or) && mesmo(p.co)), cD = dis.filter(p => !mesmo(p.or) && mesmo(p.co));
    const oriBloco = (E, Dm) => `<div class="grid g2">${E.length ? `<div class="card"><h3>Concluídas</h3><ul class="lista">${E.map(oriLi).join("")}</ul></div>` : ""}${Dm.length ? `<div class="card"><h3>Em curso</h3><ul class="lista">${Dm.map(oriLi).join("")}</ul></div>` : ""}</div>`;
    const oriLi = p => `<li><b>${esc(p.n)}</b> <span class="meta">${p.c === "egresso" ? "defesa em " + esc(p.de) : p.c === "pos-doc" ? "pós-doutorado desde " + esc(p.in) : "turma " + esc(p.in)}${mesmo(p.co) && !mesmo(p.or) && p.or ? " · orientação de " + esc(p.or) : ""}</span>${p.ti ? `<div>${p.re ? ext(p.re, esc(titulo(p.ti))) : esc(titulo(p.ti))}</div>` : ""}</li>`;
    const sec = (id, t, n, html) => n ? `<section class="blk" id="${id}" aria-labelledby="h-${id}"><h2 id="h-${id}">${t} <span class="dc-n">${n}</span></h2>${html}</section>` : "";
    const mais = (L, n, f) => L.slice(0, n).map(f).join("") + (L.length > n ? `</ul><details class="mais"><summary>Ver mais ${L.length - n}</summary><ul class="lista">${L.slice(n).map(f).join("")}</ul></details><ul hidden>` : "");
    P.push({
      arq: `docente-${slugN(d.n)}.html`, titulo: d.n, desc: `${d.n}, docente do PPGAU UNIVAG: formação, orientações, projetos, livros, artigos e rede de colaboração.`,
      hero: { kpis: true, eyebrow: `<a href="pessoas.html#docentes">Corpo docente</a> · PPGAU UNIVAG`, h1: esc(d.n), p: esc(d.tit) + (d.f.form && d.f.form[0] && !semAc(d.tit).includes(semAc(d.f.form[0]).slice(0, 12)) ? " · " + esc(d.f.form[0]) : ""),
        btns: `<p class="dc-links">${d.f.email ? `<a class="btn" href="mailto:${esc(d.f.email)}">${esc(d.f.email)}</a>` : ""}${links.map(([l, h]) => `<a class="btn sec" href="${esc(h)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join("")}</p>`,
        lado: `<div class="dc-foto">${d.foto ? `<img src="img/${esc(d.foto)}" width="220" height="220" alt="Foto de ${esc(d.n)}">` : `<span class="ini">${iniciais(d.n)}</span>`}</div>` },
      corpo: `
<div class="kpis">
<div class="kpi gold"><b>${egr.filter(p => mesmo(p.or)).length}</b><span>orientações concluídas</span><small>${cE.length} ${cE.length === 1 ? "coorientação concluída" : "coorientações concluídas"}</small></div>
<div class="kpi"><b>${oD.length}</b><span>orientações em curso</span><small>${cD.length} ${cD.length === 1 ? "coorientação" : "coorientações"} em curso</small></div>
<div class="kpi"><b>${obras.length}</b><span>produções no Lattes</span><small>2021 a 2026</small></div>
<div class="kpi"><b>${prj.length}</b><span>projetos</span><small>${prj.filter(p => p.sit === "Em andamento").length} em andamento</small></div>
</div>
<ul class="sub">${[["formacao", "Formação", 1], ["orientacoes", "Orientações", oE.length + oD.length], ["coorientacoes", "Coorientações", cE.length + cD.length], ["projetos", "Projetos", prj.length], ["livros", "Livros", liv.length], ["artigos", "Artigos", arts.length], ["producao", "Produção", obras.length], ["rede", "Rede", topD.length + topA.length], ["bancas", "Bancas", bks.length]].filter(x => x[2]).map(([h, l]) => `<li><a href="#${h}">${l}</a></li>`).join("")}</ul>
${d.f.form && d.f.form.length ? `<section class="blk" id="formacao" aria-labelledby="h-formacao"><h2 id="h-formacao">Formação</h2><ol class="dc-form">${d.f.form.map(f => `<li>${esc(f)}</li>`).join("")}</ol></section>` : ""}
${sec("orientacoes", "Orientações", oE.length + oD.length, oriBloco(oE, oD))}
${sec("coorientacoes", "Coorientações", cE.length + cD.length, oriBloco(cE, cD))}
${sec("projetos", "Projetos", prj.length, `<ul class="lista card">${mais(prj, 6, p => `<li><span class="tag${p.sit === "Em andamento" ? " ok" : ""}">${esc(p.sit)}</span><span class="tag">${esc(p.t)}</span> <b>${esc(p.tit)}</b><div class="meta">${p.ini}${p.fim === "Atual" ? " – atual" : p.fim ? "–" + esc(p.fim) : ""} · Coordenação: ${nomeLink(p.coord || "não informada")}</div></li>`)}</ul>`)}
${sec("livros", "Livros e anais", liv.length, `<ul class="lv-rolo">${liv.map(l => `<li><a href="livros.html" title="${esc(l.t + (l.v ? " · " + l.v : ""))}">${capaLivro(l)}<span>${esc(l.t)}${l.v ? " · " + esc(l.v) : ""}</span></a></li>`).join("")}</ul>`)}
${sec("artigos", "Artigos em periódicos", arts.length, artHtml)}
${sec("producao", "Produção por tipo", obras.length, `<div class="card dc-barras">${catL.map(([c, n]) => `<div><span>${esc(CAT[c] || c)}</span><i style="--w:${Math.round(n / maxCat * 100)}%"></i><b>${n}</b></div>`).join("")}</div><p class="meta">Produção declarada no Lattes de 2021 a 2026. Lista completa e filtros no <a href="mapa.html?foco=${i}#lista">mapa da produção</a> e no ${ext(dados("docentes/" + encodeURIComponent(d.n)), "PPGAU em dados")}.</p>`)}
${sec("rede", "Rede de colaboração", topD.length + topA.length, `<div class="grid g2">${topD.length ? `<div class="card"><h3>Com outros docentes</h3><ol class="rd-l">${topD.map(([j, n]) => `<li>${nomeLink(R.doc[j].n)} <span class="meta">${n} ${n > 1 ? "obras" : "obra"}</span></li>`).join("")}</ol></div>` : ""}${topA.length ? `<div class="card"><h3>Com discentes, egressos e pós-docs</h3><ol class="rd-l">${topA.map(([k, n]) => `<li>${esc(R.pes[k][0])} <span class="meta">${PES_T[R.pes[k][1]]} · ${n} ${n > 1 ? "obras" : "obra"}</span></li>`).join("")}</ol></div>` : ""}</div><p><a class="btn sec" href="mapa.html?foco=${i}">Ver a rede no mapa da produção ${ICO.seta}</a></p>`)}
${sec("bancas", "Bancas divulgadas", bks.length, `<ul class="lista card">${bks.map(b => `<li><span class="tag">${cuiaba(b.ini).getUTCDate()}/${cuiaba(b.ini).getUTCMonth() + 1}/${cuiaba(b.ini).getUTCFullYear()}</span> <b>${esc(b.al)}</b> · ${esc(b.ti)} <span class="meta">${mesmo(b.or) ? "orientação" : mesmo(b.co) ? "coorientação" : "membro da banca"}</span></li>`).join("")}</ul><p><a href="bancas.html">Todas as bancas →</a></p>`)}
<p class="meta" style="margin-top:24px"><a href="pessoas.html#docentes">← Voltar ao corpo docente</a></p>`
    });
  });
}

// ---------- Relatório geral ----------
// Uma página feita para imprimir ou salvar em PDF, com o retrato do programa montado dos mesmos dados do site.
// O build também grava relatorio-ppgau.pdf pronto (gerador/pdf.mjs), linkado nesta página.
{
  const R = globalThis.__REDE, CATL = Object.fromEntries([...D("PL_CAT").bib, ...D("PL_CAT").tec].map(c => [c[0], c[1]]));
  const mesmo = (a, b) => semAc(a) === semAc(b);
  const eg = PESSOAS.filter(p => p.c === "egresso"), dis = PESSOAS.filter(p => p.c === "discente"), pos = PESSOAS.filter(p => p.c === "pos-doc");
  const diss = [...BASE.dissertacoes].sort((a, b) => a[0].localeCompare(b[0]) || a[2].localeCompare(b[2], "pt-BR"));
  const porAno = {}; diss.forEach(d => porAno[d[0]] = (porAno[d[0]] || 0) + 1);
  const turmas = {}; dis.forEach(p => turmas[p.in] = (turmas[p.in] || 0) + 1);
  const obras = R.W.filter(w => w[0] !== "proj"), cats = {}; obras.forEach(w => cats[w[1]] = (cats[w[1]] || 0) + 1);
  const porAnoObra = {}; obras.forEach(w => porAnoObra[w[2]] = (porAnoObra[w[2]] || 0) + 1);
  const tProj = t => PROJ.filter(p => p.t === t);
  const tab = (cab, linhas, cls = "") => `<table class="rl-t ${cls}"><thead><tr>${cab.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const hoje = AGORA.toLocaleDateString("pt-BR", { timeZone: "America/Cuiaba" });
  const sec = (n, id, t, html) => `<section class="rl-sec" id="${id}"><h2><span>${n}</span>${t}</h2>${html}</section>`;
  const doc = corpo.map(d => { const i = R.doc.findIndex(x => x.n === d.n); return [d, eg.filter(p => mesmo(p.or, d.n)).length, PESSOAS.filter(p => p.c !== "egresso" && mesmo(p.or, d.n)).length, R.W.filter(w => w[0] !== "proj" && w[5].includes(i)).length, PROJ.filter(p => (p.docs || []).some(n => mesmo(n, d.n))).length]; });
  const SUM = [["1", "programa", "O programa"], ["2", "docentes", "Corpo docente"], ["3", "formacao", "Formação: discentes, egressos e dissertações"], ["4", "projetos", "Projetos de pesquisa, iniciação científica e extensão"], ["5", "producao", "Produção intelectual 2021–2026"], ["6", "livros", "Livros e anais"], ["7", "revista", "Revista Vernácula"], ["8", "eventos", "Eventos e bancas"]];
  P.push({
    arq: "relatorio.html", titulo: "Relatório geral do programa", desc: "Relatório geral do PPGAU UNIVAG para imprimir ou salvar em PDF: programa, docentes, formação, projetos, produção, livros, revista e eventos.",
    hero: { crumb: true, eyebrow: "Relatório para imprimir ou salvar em PDF", p: `Retrato completo do programa em um só documento, montado com os mesmos dados do site. Atualizado em ${hoje}.`,
      btns: `<p class="rl-btns"><a class="btn" href="relatorio-ppgau.pdf" download>${ICO.baixar.replace(/width="16" height="16"/, 'width="18" height="18"')}Baixar o relatório em PDF</a></p>` },
    corpo: `<article class="rl">
<header class="rl-capa"><img src="img/logo-ppgau.png" width="600" height="154" alt="PPGAU"><p class="rl-k">Relatório geral</p><h1>Programa de Pós-Graduação <i>Stricto Sensu</i> em Arquitetura e Urbanismo</h1><p>UNIVAG Centro Universitário · Várzea Grande, MT · Mestrado acadêmico · Nota CAPES 3</p>
<div class="rl-kpis">${[[corpo.length, "docentes"], [dis.length, "discentes em curso"], [eg.length, "mestres formados"], [pos.length, "pós-doutorandos"], [PROJ.length, "projetos"], [obras.length, "produções 2021–2026"], [LIVROS.length, "livros e anais"], [globalThis.__VERN_RES.ed, "números da Vernácula"]].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("")}</div>
<p class="rl-data">Gerado em ${hoje} a partir do site do programa e do portal PPGAU em dados (Lattes, Sucupira e registros da coordenação).</p>
<nav class="rl-sum" aria-label="Sumário"><h2>Sumário</h2><ol>${SUM.map(([n, id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol></nav></header>
${sec(1, "programa", "O programa", `<dl class="rl-dl">${PG_INFO.filter(x => !/Contato/.test(x[0])).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${b}</dd></div>`).join("")}</dl>
<h3>Linhas de pesquisa</h3><ol>${linhas.map(l => `<li>${esc(l)}</li>`).join("")}</ol>
<h3>Grupos de pesquisa</h3>${tab(["Grupo", "Liderança", "Tema"], BASE.grupos.map(([n, lid, tema]) => [esc(n), esc(lid), esc(tema)]))}`)}
${sec(2, "docentes", "Corpo docente", tab(["Docente", "Titulação", "Orientações concluídas", "Orientações em curso", "Produções 2021–2026", "Projetos"], doc.map(([d, a, b, c, e]) => [`<b>${esc(d.n)}</b>${d.f.email ? `<br><small>${esc(d.f.email)}</small>` : ""}`, esc(d.tit), a, b, c, e]), "rl-num"))}
${sec(3, "formacao", "Formação: discentes, egressos e dissertações", `<div class="rl-2"><div><h3>Discentes em curso por turma</h3>${tab(["Turma", "Discentes"], Object.keys(turmas).sort().map(t => [t, turmas[t]]), "rl-num")}</div><div><h3>Dissertações defendidas por ano</h3>${tab(["Ano", "Defesas"], Object.keys(porAno).sort().map(a => [a, porAno[a]]), "rl-num")}</div></div>
<h3>Dissertações defendidas (${diss.length})</h3>${tab(["Ano", "Mestre(a)", "Título", "Orientação"], diss.map(d => [d[1] ? d[1] + "/" + d[0] : d[0], esc(d[2]), esc(titulo(d[4])), esc(d[3])]))}
${pos.length ? `<h3>Pós-doutorado</h3>${tab(["Pesquisador(a)", "Desde", "Supervisão"], pos.map(p => [esc(p.n), esc(p.in), esc(p.or)]))}` : ""}`)}
${sec(4, "projetos", "Projetos de pesquisa, iniciação científica e extensão", `<p>${tProj("pesquisa").length} projetos de pesquisa, ${tProj("extensão").length} de extensão e ${PROJ.length - tProj("pesquisa").length - tProj("extensão").length} de ensino e outros. ${PROJ.filter(p => p.sit === "Em andamento").length} estão em andamento.</p>
${["pesquisa", "extensão"].map(t => `<h3>Projetos de ${t}</h3>${tab(["Projeto", "Período", "Coordenação", "Situação"], tProj(t).sort((a, b) => b.ini - a.ini).map(p => [esc(p.tit), `${p.ini}${p.fim === "Atual" ? "–atual" : p.fim ? "–" + esc(p.fim) : ""}`, esc(p.coord || "–"), esc(p.sit)]))}`).join("")}`)}
${sec(5, "producao", "Produção intelectual 2021–2026", `<p>Produção declarada no Currículo Lattes dos docentes, contada uma vez por obra mesmo quando há mais de um docente autor.</p>
<div class="rl-2"><div><h3>Por tipo</h3>${tab(["Tipo", "Quantidade"], Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => [esc(CATL[c] || c), n]), "rl-num")}</div><div><h3>Por ano</h3>${tab(["Ano", "Quantidade"], Object.keys(porAnoObra).sort().map(a => [a, porAnoObra[a]]), "rl-num")}</div></div>`)}
${sec(6, "livros", "Livros e anais", `<ol class="rl-ref">${[...LIVROS].sort((a, b) => b.ano - a.ano).map(l => `<li>${esc(abnt(l))}${l.pdf ? " Disponível em PDF." : l.ler ? " Leitura on-line." : l.est ? " Download gratuito na Estante ANAP." : ""}</li>`).join("")}</ol>`)}
${sec(7, "revista", "Revista Vernácula", `<p><b>Vernácula · Territórios Contemporâneos</b>, periódico trimestral do PPGAU UNIVAG. ISSN 2965-6125, Qualis B2, DOI em todos os artigos. ${globalThis.__VERN_RES.ed} números publicados desde 2023.</p><p>Indexação e visibilidade: ${globalThis.__VERN_RES.idx.join(", ")}.</p>`)}
${sec(8, "eventos", "Eventos e bancas", `<h3>Eventos do programa</h3>${tab(["Ano", "Evento", "Datas"], [...EVENTOS].sort((a, b) => b.ano - a.ano).map(e => [e.ano, esc(e.nome), esc(String(e.datas || "").replace(/\s*\(.*\)$/, ""))]))}
<h3>Bancas divulgadas</h3>${tab(["Data", "Mestrando(a)", "Título", "Banca"], BANCAS.map(b => [`${cuiaba(b.ini).getUTCDate()}/${cuiaba(b.ini).getUTCMonth() + 1}/${cuiaba(b.ini).getUTCFullYear()}`, esc(b.al), esc(b.ti), b.banca.map(m => esc(m[0]) + " (" + esc(m[1]) + ")").join("; ")]))}`)}
<p class="rl-fim">PPGAU UNIVAG · Av. Dom Orlando Chaves, 2.655, Cristo Rei, Várzea Grande, MT · (65) 3688-6110. Desenvolvimento, programação e implementação do website institucional e do relatório: Profa. Dra. Sandra Medina Benini (PPGAU/UNIVAG, 2026).</p>
</article>`
  });
}

// ---------- Painel dos professores (area-professor.html) ----------
// Conteúdo do painel dos professores do portal (Metas 2025–2028, Metas para o Doutorado, Análise da produção docente),
// copiado por gerador/restrito.mjs e cifrado com a mesma senha em restrito-prof.bin. A página decifra e mostra aqui mesmo.
const LOGIN_JS = `const b64=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));
// Decifra o pacote (AES-GCM, chave PBKDF2-SHA256). Sem a senha certa o conteúdo não existe na página.
const abrePacote=async(arq,s)=>{const r=await fetch(arq,{cache:"no-store"});if(!r.ok)throw new Error("rede");const d=await r.json();
const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(s),"PBKDF2",false,["deriveKey"]);
const k=await crypto.subtle.deriveKey({name:"PBKDF2",salt:b64(d.sal),iterations:d.it,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["decrypt"]);
let t;try{t=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(d.iv)},k,b64(d.ct))}catch(e){throw new Error("senha")}return JSON.parse(new TextDecoder().decode(t))};
const estilo=css=>{if(!document.getElementById("pt-css")){const st=document.createElement("style");st.id="pt-css";st.textContent=css;document.head.appendChild(st)}};
const login=(K,arq,mostra)=>{const $=id=>document.getElementById(id);
const entra=async s=>{const o=await abrePacote(arq,s);estilo(o.css);mostra(o);$("ap-login").hidden=true;$("ap-painel").hidden=false};
$("ap-f").addEventListener("submit",async e=>{e.preventDefault();const s=$("ap-s").value,m=$("ap-m");m.textContent="Abrindo…";
try{await entra(s);try{sessionStorage.setItem(K,s)}catch(x){}m.textContent=""}catch(x){m.textContent=x.message==="senha"?"Senha incorreta. Confira e tente de novo.":"Não foi possível carregar o painel. Verifique a conexão."}});
$("ap-sair").addEventListener("click",()=>{try{sessionStorage.removeItem(K)}catch(e){}location.replace(location.pathname.split("/").pop())});
let s=null;try{s=sessionStorage.getItem(K)}catch(e){}if(s)entra(s).catch(()=>{try{sessionStorage.removeItem(K)}catch(e){}})};`;
P.push({
  arq: "area-professor.html", titulo: "Painel dos professores", desc: "Acesso restrito dos docentes do PPGAU UNIVAG: metas para a Quadrienal 2025–2028, metas para a proposta de doutorado (APCN) e análise da produção docente.",
  hero: { crumb: true, eyebrow: "Acesso restrito · docentes do PPGAU", p: "Metas do programa para a Quadrienal 2025–2028, metas para a proposta de doutorado (APCN) e análise da produção docente. Entre com a senha do painel dos professores." },
  corpo: `<div class="ap-login card" id="ap-login"><span class="ap-ic">${ICO.cadeado}</span><h2>Entrar no painel dos professores</h2>
<form id="ap-f"><label for="ap-s">Senha</label><div class="ap-row"><input id="ap-s" type="password" autocomplete="current-password" required><button class="btn" type="submit">Entrar</button></div><p class="meta ap-msg" id="ap-m" role="alert"></p></form>
<p class="meta">O conteúdo é cifrado: sem a senha ele não existe no site. A senha fica guardada só nesta aba do navegador e some ao fechá-la.</p></div>
<div class="ap-painel" id="ap-painel" hidden>
<div class="ap-cab card"><span class="ap-rot">${ICO.cadeado}Painel dos professores</span><div class="ap-topo"><div class="abas" role="tablist" aria-label="Painel dos professores" id="ap-abas"></div><button type="button" class="btn sec" id="ap-sair">Sair</button></div></div>
<div class="pt" id="ap-intro"></div>
<div class="ap-sub abas" role="tablist" id="ap-sub" hidden></div>
<div class="pt" id="ap-cont"></div></div>`,
  js: `(()=>{${LOGIN_JS}
login("ppgau-adm","restrito-prof.bin",o=>{const ab=document.getElementById("ap-abas"),sb=document.getElementById("ap-sub"),ct=document.getElementById("ap-cont");
if(o.intro)document.getElementById("ap-intro").innerHTML=o.intro;
const vai=(id,sub)=>{const a=o.abas.find(x=>x.id===id)||o.abas[0];ab.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",b.dataset.h===a.id));
if(a.partes){const i=Math.max(0,Math.min(a.partes.length-1,+sub||0));sb.hidden=false;sb.innerHTML=a.partes.map((p,k)=>'<button type="button" role="tab" data-s="'+k+'" aria-selected="'+(k===i)+'">'+p.t+'</button>').join("");ct.innerHTML=a.partes[i].html}
else{sb.hidden=true;ct.innerHTML=a.html}history.replaceState(null,"","#"+a.id+(a.partes&&sub?"/"+sub:""))};
ab.innerHTML=o.abas.map(a=>'<button type="button" role="tab" data-h="'+a.id+'">'+a.t+'</button>').join("");
ab.onclick=e=>{const b=e.target.closest("button");if(b)vai(b.dataset.h)};
sb.onclick=e=>{const b=e.target.closest("button");if(b)vai(ab.querySelector("[aria-selected=true]").dataset.h,b.dataset.s)};
const [h,sub]=location.hash.slice(1).split("/");vai(h||"metas",sub)});})();`
});

// ---------- Painel da coordenação ----------
// Só a Avaliação CAPES 2021–2024 (resultado da Quadrienal 2025), copiada do painel da coordenação do portal por
// gerador/restrito.mjs e cifrada com a mesma senha em restrito-coord.bin. Não traz nada da coleta da autoavaliação.
P.push({
  arq: "painel-coordenacao.html", titulo: "Painel da coordenação", desc: "Acesso restrito da coordenação do PPGAU UNIVAG: Avaliação CAPES 2021–2024, com os conceitos e apontamentos da Quadrienal 2025.",
  hero: { crumb: true, eyebrow: "Acesso restrito · coordenação", p: "Avaliação CAPES 2021–2024: os conceitos de cada quesito da Quadrienal 2025, os pontos fortes e fracos apontados pela comissão e o que fazer em cada item. Entre com a senha do painel da coordenação." },
  corpo: `<div class="ap-login card" id="ap-login"><span class="ap-ic">${ICO.prancheta}</span><h2>Entrar no painel da coordenação</h2>
<form id="ap-f"><label for="ap-s">Senha</label><div class="ap-row"><input id="ap-s" type="password" autocomplete="current-password" required><button class="btn" type="submit">Entrar</button></div><p class="meta ap-msg" id="ap-m" role="alert"></p></form>
<p class="meta">O conteúdo é cifrado: sem a senha ele não existe no site. A senha fica guardada só nesta aba do navegador.</p></div>
<div class="ap-painel" id="ap-painel" hidden>
<div class="ap-topo"><span class="ap-cap"><b>Avaliação CAPES 2021–2024</b><small>resultado da Quadrienal 2025</small></span><button type="button" class="btn sec" id="ap-sair">Sair</button></div>
<p class="meta">Registro do resultado da Quadrienal 2025 (ciclo 2021–2024). É um resultado já publicado pela CAPES e não muda.</p>
<div class="pt" id="ap-cont"></div></div>`,
  js: `(()=>{${LOGIN_JS}
login("ppgau-site-coord","restrito-coord.bin",o=>{document.getElementById("ap-cont").innerHTML=o.html});})();`
});

// ---------- Galeria de fotos ----------
// Fotos enviadas pela coordenação (as mesmas do site antigo), em gerador/midia/galeria/<grupo>/NN.jpg e NN-p.jpg (miniatura).
// Grupos e títulos em gerador/galeria.json. A Início mostra um mosaico com uma foto de cada grupo.
{
  const GAL = JSON.parse(fs.readFileSync(path.join(__dirname, "galeria.json"), "utf8"));
  const src = (g, f, p) => `img/galeria/${g.k}/${f[0]}${p ? "-p" : ""}.jpg`;
  const foto = (g, f, i) => `<a class="gl-f" href="${src(g, f)}" data-gal="${g.k}" data-i="${i}" style="--r:${(f[1] / f[2]).toFixed(3)}"><img src="${src(g, f, 1)}" width="${f[1]}" height="${f[2]}" loading="lazy" alt="${esc(g.t)}${g.d ? ", " + esc(g.d) : ""}: foto ${i + 1} de ${g.f.length}"></a>`;
  const tot = GAL.reduce((a, g) => a + g.f.length, 0);
  // Na página da galeria, do mais recente para o mais antigo (o campus fica no fim).
  const GALP = [...GAL.filter(g => g.k !== "campus").reverse(), ...GAL.filter(g => g.k === "campus")];
  globalThis.__GAL_HOME = `<section class="blk" aria-labelledby="h-gal"><div class="lv-home-cab"><h2 id="h-gal">Destaques em fotos</h2><a class="btn sec" href="galeria.html">Ver a galeria completa ${ICO.seta}</a></div>
<div class="gl-mos">${GAL.filter(g => g.k !== "campus").reverse().slice(0, 8).map(g => { const h = { "seminarios-2025-08": { capa: ["capa", 900, 605], inteira: 1 }, "atividades-2025-2": { i: 2 }, "seminario-v-2026": { i: 6, pos: "50% 62%" } }[g.k] || {}; const f = h.capa || g.f[Math.min(g.f.length - 1, h.i || 0)]; const im = h.capa ? src(g, f) : src(g, f, 1); return `<a class="gl-m${h.inteira ? " inteira" : ""}" href="galeria.html#${g.k}"${h.inteira ? ` style="--fundo:url('${im}')"` : ""}><img src="${im}" width="${f[1]}" height="${f[2]}" loading="lazy" alt=""${h.pos ? ` style="object-position:${h.pos}"` : ""}><span><b>${esc(g.t)}</b>${g.d ? `<small>${esc(g.d)}</small>` : ""}</span></a>`; }).join("")}</div></section>`;
  P.push({
    arq: "galeria.html", titulo: "Galeria de fotos", desc: `Fotos das atividades do PPGAU UNIVAG: seminários, aulas, eventos, premiações e o campus. ${tot} fotos.`,
    hero: { crumb: true, eyebrow: "Memória do programa", p: `Seminários de pesquisa, aulas, eventos, premiações e o campus do UNIVAG: ${tot} fotos em ${GAL.length} álbuns. Clique em uma foto para ampliar.`, kpis: [[tot, "fotos"], [GAL.length, "álbuns"]] },
    corpo: `<nav class="gl-ind" aria-label="Álbuns">${GALP.map(g => `<a href="#${g.k}">${esc(g.t)}${g.d ? ` <small>${esc(g.d)}</small>` : ""}</a>`).join("")}</nav>
${GALP.map(g => `<section class="blk gl-alb" id="${g.k}" aria-labelledby="h-${g.k}"><h2 id="h-${g.k}">${esc(g.t)}${g.d ? ` <small>${esc(g.d)}</small>` : ""}</h2>${g.txt ? `<div class="gl-intro"><div class="gl-txt">${g.txt.map(t => `<p>${esc(t)}</p>`).join("")}</div>${g.ficha || g.dl || g.link || g.links ? `<aside class="card gl-ficha">${g.ficha ? `<dl>${g.ficha.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl>` : ""}${g.dl ? `<a class="btn" href="${g.dl[1]}" download>${esc(g.dl[0])}</a>` : ""}${g.link ? `<a class="btn" href="${g.link[1]}" target="_blank" rel="noopener">${esc(g.link[0])}</a>` : ""}${(g.links || []).map(([l, h]) => `<a class="btn" href="${h}" target="_blank" rel="noopener">${esc(l)}</a>`).join("")}</aside>` : ""}</div>` : ""}<p class="meta">${g.f.length} ${g.f.length > 1 ? "fotos" : "foto"}</p><div class="gl-grade">${g.f.map((f, i) => foto(g, f, i)).join("")}</div></section>`).join("\n")}
<dialog class="gl-dlg" id="gl-dlg" aria-label="Foto ampliada"><img alt=""><p class="gl-leg"></p><button type="button" class="gl-x" aria-label="Fechar">×</button><button type="button" class="gl-ant" aria-label="Foto anterior">‹</button><button type="button" class="gl-prox" aria-label="Próxima foto">›</button></dialog>`,
    js: `(()=>{const d=document.getElementById("gl-dlg"),im=d.querySelector("img"),lg=d.querySelector(".gl-leg");let l=[],i=0;
const mostra=()=>{const a=l[i];im.src=a.getAttribute("href");im.alt=a.querySelector("img").alt;lg.textContent=a.querySelector("img").alt};
document.addEventListener("click",e=>{const a=e.target.closest(".gl-f");if(!a)return;e.preventDefault();l=[...document.querySelectorAll('.gl-f[data-gal="'+a.dataset.gal+'"]')];i=+a.dataset.i;mostra();d.showModal()});
const vai=n=>{i=(i+n+l.length)%l.length;mostra()};d.querySelector(".gl-ant").onclick=()=>vai(-1);d.querySelector(".gl-prox").onclick=()=>vai(1);d.querySelector(".gl-x").onclick=()=>d.close();
d.addEventListener("click",e=>{if(e.target===d)d.close()});d.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")vai(-1);if(e.key==="ArrowRight")vai(1)});})();`
  });
}

// ---------- Premiações ----------
// Prêmios, menções e homenagens de docentes e discentes no período em que estão no PPGAU UNIVAG, em gerador/premios.json.
// Fotos: um álbum de galeria.json (campo "fotos"). O item com "destaque" aparece na Início.
{
  const PR = JSON.parse(fs.readFileSync(path.join(__dirname, "premios.json"), "utf8")).sort((a, b) => b.ano - a.ano);
  const GAL = JSON.parse(fs.readFileSync(path.join(__dirname, "galeria.json"), "utf8"));
  const fotosDe = p => (GAL.find(g => g.k === p.fotos) || { f: [] }).f.map(f => `img/galeria/${p.fotos}/${f[0]}`);
  const docLink = n => corpo.find(d => d.n === n) ? `<a href="docente-${slugN(n)}.html">${esc(n)}</a>` : esc(n);
  const ICO_TROFEU = svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a4 4 0 0 1-4 4M7 5H4v2a4 4 0 0 0 4 4"/>', 26);
  const cartao = p => { const fs_ = fotosDe(p); return `<article class="card pr-card" id="${p.k}">
  <div class="pr-fotos">${fs_.map((f, i) => `<a class="gl-f" href="${f}.jpg" data-gal="${p.k}" data-i="${i}"><img src="${f}-p.jpg" loading="lazy" alt="${esc(p.tit)}: foto ${i + 1}"></a>`).join("")}</div>
  <div class="pr-txt"><p class="pr-selo">${ICO_TROFEU}<span>${esc(p.tipo)} · ${p.ano}</span></p><h3>${esc(p.tit)}</h3>
  <p class="pr-quem">${p.quem.map(docLink).join(" e ")}${p.outros ? `, com ${esc(p.outros)}` : ""}</p>
  ${p.obra ? `<p class="pr-obra">Trabalho premiado: <i>${esc(p.obra)}</i></p>` : ""}
  ${[].concat(p.desc).map(t => `<p>${esc(t)}</p>`).join("")}<p class="meta">${esc(p.orgao)} · ${esc(p.data)}</p>
  <p class="links">${p.links.map(([l, h]) => ext(h, esc(l))).join("")}</p></div></article>`; };
  const dest = PR.find(p => p.destaque);
  if (dest) { const f = fotosDe(dest)[1] || fotosDe(dest)[0];
    globalThis.__PREMIO_HOME = `<section class="blk pr-home" aria-labelledby="h-prh"><a class="pr-banner" href="premiacoes.html#${dest.k}">${f ? `<img src="${f}-p.jpg" alt="" loading="lazy">` : ""}<span class="pr-b-txt"><span class="eyebrow">${ICO_TROFEU} Premiação · ${dest.ano}</span><b id="h-prh">${esc(dest.tit)}</b><span>${dest.quem.map(esc).join(" e ")}${dest.outros ? `, com ${esc(dest.outros)}` : ""}</span><span class="pr-b-mais">Ver premiações ${ICO.seta}</span></span></a></section>`; }
  P.push({
    arq: "premiacoes.html", titulo: "Premiações", desc: "Prêmios, menções honrosas e reconhecimentos recebidos por docentes e discentes do PPGAU UNIVAG.",
    hero: { crumb: true, eyebrow: "Reconhecimento", p: "Prêmios, menções honrosas e homenagens recebidos por docentes e discentes do programa, no período em que fazem parte do PPGAU UNIVAG.", kpis: [[PR.length, PR.length > 1 ? "premiações" : "premiação"]] },
    corpo: `<section class="blk pr-lista">${PR.map(cartao).join("\n")}</section>
<p class="meta pr-nota">Lista em atualização a partir dos currículos Lattes dos docentes. Recebeu um prêmio ou menção? Envie para a coordenação.</p>
<dialog class="gl-dlg" id="gl-dlg" aria-label="Foto ampliada"><img alt=""><p class="gl-leg"></p><button type="button" class="gl-x" aria-label="Fechar">×</button><button type="button" class="gl-ant" aria-label="Foto anterior">‹</button><button type="button" class="gl-prox" aria-label="Próxima foto">›</button></dialog>`,
    js: `(()=>{const d=document.getElementById("gl-dlg"),im=d.querySelector("img"),lg=d.querySelector(".gl-leg");let l=[],i=0;
const mostra=()=>{const a=l[i];im.src=a.getAttribute("href");im.alt=a.querySelector("img").alt;lg.textContent=a.querySelector("img").alt};
document.addEventListener("click",e=>{const a=e.target.closest(".gl-f");if(!a)return;e.preventDefault();l=[...document.querySelectorAll('.gl-f[data-gal="'+a.dataset.gal+'"]')];i=+a.dataset.i;mostra();d.showModal()});
const vai=n=>{i=(i+n+l.length)%l.length;mostra()};d.querySelector(".gl-ant").onclick=()=>vai(-1);d.querySelector(".gl-prox").onclick=()=>vai(1);d.querySelector(".gl-x").onclick=()=>d.close();
d.addEventListener("click",e=>{if(e.target===d)d.close()});d.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")vai(-1);if(e.key==="ArrowRight")vai(1)});})();`
  });
}

// ---------- Documentos ----------
// Editais, resultados, regulamentos e relatórios do site antigo, servidos de docs/ (cópias em gerador/docs).
{
  const D = [
    ["Institucional", [["Planejamento Estratégico PPGAU-UNIVAG, ciclo avaliativo 2021–2024", "planejamento-estrategico-2021-2024.pdf"], ["Processos, procedimentos e resultados da autoavaliação (2021–2024)", "autoavaliacao-2021-2024.pdf"], ["Apresentação do PPGAU-UNIVAG, 2º semestre de 2025", "apresentacao-ppgau-2025-2.pdf"], ["Relatório da produção docente", "relatorio-producao-docente.pdf"], ["Política de privacidade", "politica-de-privacidade.pdf"]]],
    ["Processo seletivo de discentes", [["Edital nº 05/2026: vagas remanescentes, 2º semestre de 2026", "edital-mestrado-2026-2-remanescentes.pdf"], ["Relação dos candidatos aprovados em 18/06/2026", "aprovados-2026-2.pdf"], ["Edital do processo seletivo, 2º semestre de 2026", "edital-mestrado-2026-2.pdf"], ["Edital do processo seletivo, 1º semestre de 2026", "edital-mestrado-2026-1.pdf"], ["Aprovados, 2º semestre de 2025: resultado final", "aprovados-2025-2-final.pdf"], ["Aprovados, 2º semestre de 2025: Edital 01/2025", "aprovados-2025-2-edital-01-2025.pdf"], ["Edital do processo seletivo, 2º semestre de 2025", "edital-mestrado-2025-2.pdf"], ["Aprovados, 1º semestre de 2025", "aprovados-2025-1.pdf"], ["Edital do processo seletivo, 1º semestre de 2025", "edital-mestrado-2025-1.pdf"], ["Edital do processo seletivo, 2º semestre de 2024", "edital-mestrado-2024-2.pdf"], ["Ficha de inscrição do processo seletivo (Word)", "ficha-de-inscricao-mestrado.docx"]]],
    ["Bolsas", [["Edital nº 03/2026: seleção de bolsista (PIBPG/CNPq)", "edital-03-2026-bolsa-cnpq.pdf"], ["Resultado do Edital nº 03/2026", "resultado-edital-03-2026-bolsa.pdf"]]],
    ["Processo seletivo de docentes", [["Edital nº 4/2025: processo seletivo docente para o 1º semestre de 2026", "edital-docente-2026.pdf"]]],
    ["Pós-doutorado", [["Regulamento de Pós-Doutorado do UNIVAG (v. 5)", "regulamento-pos-doutorado.pdf"], ["Edital do processo seletivo para pós-doutorado, ingresso em 2025", "edital-pos-doutorado-2025.pdf"], ["Edital nº 15/2024 do processo seletivo para pós-doutorado", "edital-pos-doutorado-2024.pdf"], ["Lista dos supervisores do pós-doutorado, 2025", "supervisores-pos-doutorado-2025.pdf"], ["Lista dos supervisores do pós-doutorado, 2024", "supervisores-pos-doutorado-2024.pdf"], ["Termo de aprovação de projeto de pós-doutorado", "termo-aprovacao-projeto-pos-doutorado.pdf"]]],
    ["Acadêmico", [["Calendário do 1º semestre de 2025", "calendario-2025-1.pdf"], ["Memorando: orientações de postura para discentes em aulas remotas", "memorando-aulas-remotas.pdf"], ["Guia de procedimentos acadêmicos do mestrado", "guia-procedimentos-mestrado.pdf"], ["Ata de exame de qualificação (modelo)", "ata-exame-qualificacao.docx"], ["Ata de exame de defesa (modelo)", "ata-exame-defesa.docx"]]],
    ["Publicações", [["Anais Tchá Pesquisa (1ª edição)", "anais-tcha-pesquisa.pdf"], ["E-book 100 Praças de Cuiabá", "e-book-100-pracas-de-cuiaba.pdf"], ["Jornalzinho do PPGAU", "jornalzinho-ppgau.pdf"], ["Declaração de direitos autorais (Word)", "declaracao-direitos-autorais.docx"]]]];
  const tam = f => { try { const b = fs.statSync(path.join(__dirname, "docs", f)).size; return b > 1e6 ? (b / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1e3)) + " KB"; } catch (e) { return ""; } };
  const n = D.reduce((a, g) => a + g[1].length, 0);
  P.push({
    arq: "documentos.html", titulo: "Documentos", desc: `Editais, resultados, regulamentos, relatórios e publicações do PPGAU UNIVAG para baixar. ${n} arquivos.`,
    hero: { crumb: true, eyebrow: "Arquivos do programa", p: "Editais e resultados dos processos seletivos, bolsas, pós-doutorado, regulamentos, calendário, relatórios e publicações para baixar." },
    corpo: D.map(([t, l]) => `<section class="blk"><h2>${t}</h2><ul class="doc-l">${l.map(([nm, f]) => `<li><a href="docs/${f}" target="_blank" rel="noopener"><span class="doc-ic" aria-hidden="true">${/\.docx$/.test(f) ? "DOC" : "PDF"}</span><span>${esc(nm)}<small>${/\.docx$/.test(f) ? "Word" : "PDF"} · ${tam(f)}</small></span></a></li>`).join("")}</ul></section>`).join("\n")
  });
  globalThis.__DOCS_IDX = D.flatMap(([t, l]) => l.map(([nm, f]) => ["Documento", nm, t, "docs/" + f]));
}

// Busca no site: página de resultados completa, com filtro por tipo e link compartilhável (busca.html?q=...).
P.push({
  arq: "busca.html", titulo: "Buscar no site", desc: "Busque pessoas, disciplinas, dissertações, projetos, livros, artigos da revista, eventos e páginas do PPGAU UNIVAG.",
  hero: { crumb: true, eyebrow: "Busca", p: "Encontre professores, alunos, dissertações, projetos, disciplinas, livros, artigos da Revista Vernácula, eventos e páginas do site." },
  corpo: `<div class="bp-topo">${BUSCA_VIVA().replace('class="busca-viva"', 'class="busca-viva bp-form"')}</div>
<div class="bp-tipos" role="group" aria-label="Filtrar por tipo"></div>
<p class="meta bp-cont" aria-live="polite"></p>
<ul class="bp-res" id="bp-res"></ul>
<p class="bp-mais-w"><button type="button" class="btn sec bp-mais" hidden>Mostrar mais resultados</button></p>
<div class="bp-vazio card" hidden><h3>Nenhum resultado</h3><p>Tente uma palavra mais curta ou o sobrenome de alguém. Você também pode navegar pelo <a href="index.html#h-acesso">acesso rápido</a>.</p></div>`,
  js: `document.addEventListener("DOMContentLoaded",()=>{const B=globalThis.PPGAU;if(!B)return;const f=document.querySelector(".bp-form"),inp=f.querySelector("input"),tipos=document.querySelector(".bp-tipos"),res=document.getElementById("bp-res"),cont=document.querySelector(".bp-cont"),mais=document.querySelector(".bp-mais"),vazio=document.querySelector(".bp-vazio");
let tipo="",lim=40,todos=[];
const pinta=()=>{const q=inp.value.trim(),vis=tipo?todos.filter(r=>r[0]===tipo):todos;res.innerHTML=vis.slice(0,lim).map((r,i)=>B.linha(r,q,i).replace(/ id="br-\\d+"/,"").replace(' aria-selected="true"',"")).join("");mais.hidden=vis.length<=lim;vazio.hidden=!q||vis.length>0;cont.textContent=q?vis.length+(vis.length===1?" resultado":" resultados")+" para “"+q+"”"+(tipo?" em "+tipo:""):"Digite algo para buscar.";};
const roda=()=>{const q=inp.value.trim();todos=B.busca(q);const c={};todos.forEach(r=>c[r[0]]=(c[r[0]]||0)+1);if(tipo&&!c[tipo])tipo="";tipos.innerHTML=q?['<button type="button" data-t="" aria-pressed="'+(!tipo)+'">Tudo <b>'+todos.length+'</b></button>'].concat(Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([t,n])=>'<button type="button" data-t="'+t+'" aria-pressed="'+(t===tipo)+'">'+t+' <b>'+n+'</b></button>')).join(""):"";lim=40;pinta();history.replaceState(null,"",q?"?q="+encodeURIComponent(q):location.pathname);};
tipos.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;tipo=b.dataset.t;tipos.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));lim=40;pinta();});
mais.addEventListener("click",()=>{lim+=40;pinta();});
f.addEventListener("submit",e=>{e.preventDefault();f.querySelector(".bv-sug").hidden=true;roda();});
let t;inp.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(roda,180);});
f.querySelectorAll(".bv-dicas button").forEach(b=>b.addEventListener("click",()=>{inp.value=b.textContent;roda();}));
inp.value=new URLSearchParams(location.search).get("q")||"";roda();if(!inp.value)inp.focus();});`
});

// O site novo substitui o Wix: nenhum link aponta para univag-ppgau.com. Páginas que já existem aqui viram links
// internos; o que não tem equivalente sai da página (o link inteiro).
const WIX_MAP = { "/hist%C3%B3rico": "programa.html#historico", "/histórico": "programa.html#historico", "/missao-e-objetivos": "programa.html#missao", "/coordenacao": "pessoas.html#coordenacao", "/conselho": "pessoas.html#conselho", "/comissao-de-bolsas": "ingresso.html#bolsas", "/premiacao-cau": "premiacoes.html", "/dezembro2025": "bancas.html#h-real", "/atividades-obrigatória": "academico.html#atividades", "/aproveitamento-de-creditos": "academico.html#aproveitamento", "/trancamento-de-matricula": "academico.html#trancamento" };
const semWix = h => h.replace(/<a [^>]*href="https?:\/\/(?:www\.)?univag-ppgau\.com([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (m, cam, txt) => {
  const c = decodeURI(cam.replace(/\/$/, "")), alvo = WIX_MAP[cam] || WIX_MAP[c];
  return alvo ? `<a href="${alvo}">${txt.replace(/\s*↗\s*$/, "")}</a>` : "";
}).replace(/<li>\s*<\/li>/g, ""); // item que ficou sem link some da lista
for (const p of P) fs.writeFileSync(path.join(OUT, p.arq), semWix(pagina(p).replace("<!--GAL_HOME-->", globalThis.__GAL_HOME || "").replace("<!--LIV_HOME-->", globalThis.__LIV_HOME.map(l => `<li><a href="livros.html" title="${esc(l.t + (l.v ? " · " + l.v : ""))}">${capaLivro(l)}<span>${esc(l.t)}${l.v ? " · " + esc(l.v) : ""}</span></a></li>`).join("")).replace("<!--BANCA_HOME-->", globalThis.__BANCA_HOME).replace("<!--PREMIO_HOME-->", globalThis.__PREMIO_HOME || "").replace("<!--NOT_HOME-->", globalThis.__NOT_HOME).replace("<!--VERN_CAPAS-->", globalThis.__VERN_CAPAS.replace(/<a /g, "<span ").replace(/<\/a>/g, "</span>").replace(/ href="[^"]*" target="_blank" rel="noopener"/g, ""))));
fs.copyFileSync(path.join(__dirname, "site.css"), path.join(OUT, "site.css"));
fs.mkdirSync(path.join(OUT, "i18n"), { recursive: true });
for (const l of ["en", "es", "fr", "it"]) fs.copyFileSync(path.join(__dirname, "i18n", l + ".json"), path.join(OUT, "i18n", l + ".json"));
fs.copyFileSync(path.join(__dirname, "mapa.js"), path.join(OUT, "mapa.js"));
fs.copyFileSync(path.join(__dirname, "disciplinas.js"), path.join(OUT, "disciplinas.js"));
fs.copyFileSync(path.join(__dirname, "ui.js"), path.join(OUT, "ui.js"));
fs.writeFileSync(path.join(OUT, "simposio-2026.ics"), ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PPGAU UNIVAG//Site//PT", ...[4, 5, 6].flatMap(d => ["BEGIN:VEVENT", `UID:simposio-tca-2026-${d}@ppgau-univag`, "DTSTAMP:20261021T000000Z", `DTSTART:202611${String(d).padStart(2, "0")}T130000Z`, `DTEND:202611${String(d).padStart(2, "0")}T210000Z`, `SUMMARY:3º Simpósio Brasileiro Território, Cidade e Arquitetura (dia ${d - 3})`, "LOCATION:UNIVAG Centro Universitário, Várzea Grande, MT (híbrido)", "URL:https://www.even3.com.br/3-simposio-brasileiro-territorio-cidade-e-arquitetura-757882/", "END:VEVENT"]), "END:VCALENDAR"].join("\r\n") + "\r\n");
for (const b of proxBancas) fs.writeFileSync(path.join(OUT, `banca-${slugN(b.al)}.ics`), icsBanca(b));
// Índice da busca rápida: [tipo, título, detalhe, link].
{
  const B = [], slugD = n => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\W+/g, "-");
  // Palavras que as pessoas costumam digitar e não aparecem no título da página.
  const KW = { "premiacoes.html": "prêmio premiação menção honrosa homenagem reconhecimento CAU concurso artigo 2º lugar Jessica Seabra", "galeria.html": "fotos imagens álbum seminário aula evento premiação CAU campus", "documentos.html": "edital resultado aprovados regulamento calendário pdf baixar download ficha inscrição pós-doutorado bolsa", "ingresso.html": "processo seletivo edital inscrição vagas seleção bolsa bolsista proficiência pós-doutorado", "contato.html": "telefone email e-mail endereço secretaria coordenação", "titulacao.html": "ingresso titulação processo seletivo vagas inscritos aprovados matriculados titulados bolsistas bolsas tempo médio defesa dissertações orientador", "impacto.html": "impacto sociedade quesito 3 projetos extensão pesquisa financiamento cnpq fapemat parcerias redes eventos anais isbn eco legal educaanap mídia prêmio", "academico.html": "créditos trancamento matrícula qualificação defesa aproveitamento regulamento estrutura curricular disciplinas eletivas obrigatórias guia ata", "qualificacao.html": "exame de qualificação memorial proficiência banca comissão julgadora turnitin ata", "defesa.html": "defesa dissertação versão definitiva ficha catalográfica banca turnitin homologação diploma ata", "disciplinas.html": "horário aula calendário turma agenda semestre professor", "programa.html": "histórico missão objetivos linhas área de concentração grupos parcerias", "index.html": "início home como chegar mapa localização onde fica univag", "producao.html": "dissertações projetos pesquisa extensão iniciação científica ic periódicos", "livros.html": "livros anais e-book ebook download pdf isbn coletânea", "revista.html": "periódico qualis issn artigo submissão vernácula", "mapa.html": "rede coautoria colaboração", "eventos.html": "simpósio congresso seminário prêmio mídia", "bancas.html": "defesa banca qualificação zoom transmissão agenda", "egressos.html": "ex-alunos mestres formados trajetória onde atuam território", "noticias.html": "novidades avisos lançamento", "painel-coordenacao.html": "coordenação coordenador capes avaliação 2021 2024 quadrienal ficha apontamentos restrito senha", "relatorio.html": "relatório pdf imprimir documento resumo geral", "area-professor.html": "professor docente metas quadrienal 2025 2028 doutorado apcn restrito senha painel" };
  for (const p of P) B.push(["Página", p.titulo, p.desc, p.arq, KW[p.arq] || ""]);
  for (const d of corpo) B.push(["Docente", d.n, d.tit, `docente-${slugN(d.n)}.html`, (d.f.form || []).join(" ")]);
  const GR = { discente: ["Discente", "discentes"], egresso: ["Egresso", "egressos"], "pos-doc": ["Pós-doutorado", "posdoc"] };
  for (const x of PESSOAS) if (GR[x.c]) B.push([GR[x.c][0], x.n, [x.in && "Ingresso " + x.in, x.or && "Orientação: " + x.or].filter(Boolean).join(" · "), "pessoas.html#" + GR[x.c][1]]);
  for (const d of BASE.dissertacoes) B.push(["Dissertação", titulo(d[4]), `${d[2]} · ${d[0]} · orientação ${d[3]}`, d[5] || "producao.html#dissertacoes"]);
  const CJ = JSON.parse(fs.readFileSync(path.join(__dirname, "calendario.json"), "utf8"));
  for (const n of new Set(CJ.sessoes.map(x => x.nome).filter(Boolean))) { const x = CJ.sessoes.find(y => y.nome === n); B.push(["Disciplina", n, x.prof || "", "disciplinas.html"]); }
  for (const e of EVENTOS) B.push(["Evento", e.nome, String(e.datas || e.ano).replace(/\s*\(.*\)$/, ""), "eventos.html"]);
  for (const pr of PROJ) B.push([pr.t === "extensão" ? "Projeto de extensão" : "Projeto de pesquisa", pr.tit, pr.coord || "", "producao.html#" + (pr.t === "extensão" ? "extensao" : pr.t === "pesquisa" ? "pesquisa" : "outros")]);
  for (const h of HIST) B.push(["Linha do tempo", h.t, h.ano + " · " + String(h.d || "").slice(0, 120), "linha-do-tempo.html#a" + h.ano]);
  for (const x of IMPACTO.impacto) if (x.tipo !== "evento") B.push(["Destaque", x.titulo, x.tipo + (x.ano ? " · " + x.ano : ""), "eventos.html"]);
  for (const l of LIVROS) B.push([TIPO_LIV[l.tipo] === "Anais" ? "Anais" : "Livro", l.t + (l.v ? " · " + l.v : ""), `${l.org.split("; ").slice(0, 2).join(", ")}${l.org.split("; ").length > 2 ? " et al." : ""} · ${l.ano}`, "livros.html", [l.sub, l.isbn, l.org].join(" ")]);
  B.push(...globalThis.__VERN_IDX);
  B.push(...(globalThis.__DOCS_IDX || []));
  for (const b of BANCAS) B.push(["Banca", b.al + ": " + b.ti, (proxBancas.includes(b) ? "Agendada · " : "Realizada · ") + dataLonga(b.ini) + " · orientação " + b.or, "bancas.html", b.banca.map(m => m[0]).join(" ") + " defesa"]);
  for (const n of NOTICIAS) B.push(["Notícia", n.t, dataCurta(n.d) + " · " + n.tag, "noticias.html", n.p]);
  B.push(["Revista", "Revista Vernácula · Territórios Contemporâneos", "ISSN 2965-6125 · Qualis B2", "revista.html"], ["Atlas", "Atlas Socioambiental da RMVRC", "Mapa interativo dos setores censitários", "https://editoraanap-tupa.github.io/atlas/"], ["Página", "Autoavaliação 2026", "Questionário anônimo, até 03/11/2026", "dados/#/responder"]);
  fs.writeFileSync(path.join(OUT, "busca-dados.js"), "globalThis.BUSCA = " + JSON.stringify(B.map(r => r.map(v => esc(v)))) + ";\n");
}
fs.writeFileSync(path.join(OUT, "disciplinas-dados.js"), globalThis.__CAL);
for (const f of fs.readdirSync(__dirname).filter(f => /^atlas-mapa-\w+\.svg$/.test(f))) fs.copyFileSync(path.join(__dirname, f), path.join(OUT, "img", f));
fs.writeFileSync(path.join(OUT, "mapa-dados.js"), globalThis.__MAPA);
for (const f of ["logo-ppgau.png", "logo-univag.png"]) fs.copyFileSync(path.join(SRC, f), path.join(OUT, "img", f));
fs.cpSync(path.join(__dirname, "midia"), path.join(OUT, "img"), { recursive: true });
fs.cpSync(path.join(__dirname, "docs"), path.join(OUT, "docs"), { recursive: true });
for (const f of ["restrito-prof.bin", "restrito-coord.bin"]) if (fs.existsSync(path.join(__dirname, f))) fs.copyFileSync(path.join(__dirname, f), path.join(OUT, f));
for (const f of fs.readdirSync(path.join(SRC, "fotos"))) fs.copyFileSync(path.join(SRC, "fotos", f), path.join(OUT, "img/fotos", f));
// Portal "em dados" completo em /dados, sem alteração de código.
fs.cpSync(SRC, path.join(OUT, "dados"), { recursive: true, filter: s => !/[\\/]\.git($|[\\/])/.test(s) });
// Na cópia do portal, as fontes que citavam o site antigo (Wix) passam a apontar para as páginas deste site.
// Só troca endereços: dados, questionários e coleta da autoavaliação ficam como estão.
{
  const M = { "/eventos": "eventos.html", "/eventos-externos": "eventos.html", "/ciap": "eventos.html", "/projetocnpq": "linha-do-tempo.html", "/projeto-de-extensao": "linha-do-tempo.html", "/portalvg": "linha-do-tempo.html", "/premiacao-cau": "premiacoes.html", "/missao-e-objetivos": "programa.html#missao", "/hist%C3%B3rico": "programa.html#historico", "/dissertacao-defendidas": "egressos.html", "/corpo-docente": "pessoas.html#docentes", "/discentes": "pessoas.html#discentes", "/conselho": "pessoas.html#conselho", "/coordenacao": "pessoas.html#coordenacao", "/comissao-de-bolsas": "ingresso.html#bolsas", "": "index.html" };
  const NOVO = "https://territoriocidadearquitetura-design.github.io/ppgau-univag/";
  for (const f of ["index.html", "emdados.js", "impacto.js"]) {
    const arq = path.join(OUT, "dados", f); if (!fs.existsSync(arq)) continue;
    const t = fs.readFileSync(arq, "utf8").replace(/https?:\/\/(?:www\.)?univag-ppgau\.com(\/_files\/ugd\/036f6f_([0-9a-f]{32})\.pdf|\/[^"'\s)<,]*)?/g, (m, cam, id) => {
      if (id) return NOVO + (PDF_LOCAL[id] || "documentos.html");
      const c = (cam || "").replace(/\/$/, ""); return NOVO + (M[c] ?? "index.html");
    }).replace(/>www\.univag-ppgau\.com ↗</g, ">Site do PPGAU UNIVAG ↗<");
    fs.writeFileSync(arq, t);
  }
}
// Volta do portal para o site: o logo do PPGAU no topo do portal leva à página inicial.
const pi = path.join(OUT, "dados/index.html");
fs.writeFileSync(pi, "<!doctype html>\n" + fs.readFileSync(pi, "utf8").replace('<div class="brandbar"><div class="wrap"><img class="lg-ppgau" src="logo-ppgau.png"', '<div class="brandbar"><div class="wrap"><a href="../index.html" title="Voltar ao site do programa"><img class="lg-ppgau" src="logo-ppgau.png"').replace('alt="PPGAU, Programa de Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo"><div class="bb-dir">', 'alt="PPGAU, Programa de Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo"></a><div class="bb-dir">'));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("páginas:", P.map(p => p.arq).join(", "));
