// Disciplinas e horários do semestre: próxima aula, agenda, calendário, disciplinas e plano de cada turma.
// Dados em disciplinas-dados.js (CAL), gerados por build.js a partir da planilha do calendário acadêmico.
"use strict";
(() => {
const { sessoes: S, disc: DISC, turmas: TURMAS, plano: PLANO, versao } = CAL;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEM = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const ler = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const st = { turma: ler("ppgau-turma", "todas"), aba: ler("ppgau-aba", "agenda"), dia: null };
const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
const dt = s => { const [a, m, d] = s.split("-").map(Number); return new Date(a, m - 1, d); };
const hora = h => { const m = /(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/.exec(h); return m ? [+m[1], +m[2], +m[3], +m[4]] : [0, 0, 0, 0]; };
const ini = s => hora(s.h);
const inicio = s => { const d = dt(s.data), [h, m] = ini(s); d.setHours(h, m); return d; };
const fim = s => { const d = dt(s.data), [, , h, m] = ini(s); d.setHours(h, m); return d; };
const daTurma = s => st.turma === "todas" || s.turmas.includes("todas") || s.turmas.includes(st.turma);
const dataLonga = d => `${SEM[d.getDay()]}, ${d.getDate()} de ${MES[d.getMonth()]}`;
const horaCurta = h => h.replace(/\s*h\b/g, "h").replace(/:00h/g, "h").replace(/ às /, "–");
const disc = s => DISC[s.d];
const cap = t => t[0].toUpperCase() + t.slice(1);
const fotos = d => d.prof.every(p => !p.foto) && d.prof.length === 1 ? "" : `<span class="dc-fotos">${d.prof.map(p => p.foto ? `<img src="${esc(p.foto)}" alt="" title="${esc(p.n)}" width="36" height="36">` : `<span class="dc-ini" title="${esc(p.n)}">${esc(p.n.split(" ").map(w => w[0]).slice(0, 2).join(""))}</span>`).join("")}</span>`;
const localTag = s => `<span class="tag ${/campus/i.test(s.local) ? "gold" : ""}">${/campus/i.test(s.local) ? "Presencial no campus" : "Híbrida: presencial e on-line ao vivo"}</span>`;
const turmasTag = s => s.turmas.includes("todas") ? `<span class="tag">Todas as turmas</span>` : s.turmas.map(t => `<span class="tag t${t}">Turma ${t}</span>`).join("");

// ---------- próxima aula ----------
function proxima() {
  const agora = new Date();
  const fut = S.filter(s => s.data && daTurma(s) && fim(s) > agora).sort((a, b) => inicio(a) - inicio(b));
  const box = $("dc-prox");
  if (!fut.length) { box.innerHTML = `<div class="dc-prox-v"><h2>Semestre encerrado</h2><p>As aulas do 2º semestre de 2026 terminaram em 12 de dezembro.</p></div>`; return; }
  const s = fut[0], d = disc(s), i = inicio(s), dias = Math.round((dt(s.data) - hoje) / 864e5);
  const agoraAula = i <= agora;
  const quando = agoraAula ? "Acontecendo agora" : dias === 0 ? "Hoje" : dias === 1 ? "Amanhã" : `Em ${dias} dias`;
  const mesmoDia = fut.filter(x => x.data === s.data && x.d === s.d);
  const realizadas = S.filter(x => x.d === s.d && x.data && fim(x) <= agora).reduce((a, x) => a + (x.ch || 0), 0);
  box.style.setProperty("--dc", d.cor);
  box.innerHTML = `<div class="dc-prox-q"><span class="eyebrow">${quando}</span><b>${i.getDate()}</b><span>${MES[i.getMonth()]}</span><small>${SEM[i.getDay()]}</small></div>
  <div class="dc-prox-v"><span class="eyebrow">Próxima aula${st.turma !== "todas" ? " da Turma " + st.turma : ""}</span><h2>${esc(d.nome)}</h2>
  <p class="dc-h">${mesmoDia.map(x => horaCurta(x.h)).join(" e ")}</p>
  <p>${localTag(s)} ${turmasTag(s)}</p>
  <div class="dc-prof">${fotos(d)}<span>${esc(d.prof.map(p => p.n).join(", "))}</span></div>
  ${d.ch ? `<div class="dc-barra" title="${realizadas} de ${d.ch} horas realizadas"><i style="width:${Math.min(100, 100 * realizadas / d.ch)}%"></i></div><p class="meta">${realizadas} de ${d.ch} horas realizadas</p>` : ""}
  <p class="dc-acoes"><button type="button" class="btn" data-ics="${s.d}">Adicionar a disciplina ao meu calendário</button></p></div>`;
}

// ---------- agenda ----------
function agenda() {
  const l = S.filter(s => s.data && daTurma(s));
  const porDia = new Map(); l.forEach(s => { if (!porDia.has(s.data)) porDia.set(s.data, []); porDia.get(s.data).push(s); });
  const meses = [...new Set([...porDia.keys()].map(k => k.slice(0, 7)))];
  const indef = S.filter(s => !s.data && daTurma(s));
  const agora = new Date();
  $("dc-agenda").innerHTML = meses.map(m => `<section class="dc-mes"><h3>${cap(MES[+m.slice(5) - 1])} de ${m.slice(0, 4)}</h3><ol class="dc-dias">
  ${[...porDia].filter(([k]) => k.startsWith(m)).map(([k, ss]) => { const d = dt(k), passou = ss.every(s => fim(s) <= agora), eh = +d === +hoje;
    return `<li class="${passou ? "passou" : ""}${eh ? " hoje" : ""}" id="dia-${k}"><div class="dc-data"><b>${d.getDate()}</b><span>${SEM[d.getDay()].slice(0, 3)}</span></div><div class="dc-sess">${ss.map(s => `<div class="dc-s" style="--dc:${disc(s).cor}"><span class="dc-hr">${horaCurta(s.h)}</span><span class="dc-n"><b>${esc(disc(s).nome)}</b><small>${esc(disc(s).prof.map(p => p.n).join(", "))}</small></span><span class="dc-tg">${localTag(s)}${st.turma === "todas" ? turmasTag(s) : ""}</span></div>`).join("")}</div></li>`; }).join("")}</ol></section>`).join("")
  + (indef.length ? `<section class="dc-mes"><h3>Datas a definir</h3><ul class="dc-ind">${[...new Set(indef.map(s => s.d))].map(k => `<li style="--dc:${DISC[k].cor}"><b>${esc(DISC[k].nome)}</b>: ${indef.filter(s => s.d === k).length} ${indef.filter(s => s.d === k).length > 1 ? "encontros" : "encontro"} das ${horaCurta(indef.find(s => s.d === k).h)}, com data a ser definida pela coordenação.</li>`).join("")}</ul></section>` : "");
}

// ---------- calendário ----------
function calendario() {
  const meses = [7, 8, 9, 10, 11];
  const porDia = new Map(); S.filter(s => s.data && daTurma(s)).forEach(s => { if (!porDia.has(s.data)) porDia.set(s.data, []); porDia.get(s.data).push(s); });
  $("dc-cal").innerHTML = `<div class="dc-cal-g">${meses.map(m => {
    const p = new Date(2026, m, 1), n = new Date(2026, m + 1, 0).getDate(), vaz = p.getDay();
    let cel = Array.from({ length: vaz }, () => `<span></span>`).join("");
    for (let d = 1; d <= n; d++) {
      const k = `2026-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, ss = porDia.get(k) || [];
      const cores = [...new Set(ss.map(s => disc(s).cor))];
      const eh = +new Date(2026, m, d) === +hoje;
      cel += ss.length ? `<button type="button" class="dc-c tem${eh ? " hoje" : ""}${st.dia === k ? " sel" : ""}" data-dia="${k}" aria-label="${d} de ${MES[m]}: ${ss.length} ${ss.length > 1 ? "aulas" : "aula"}" style="--dc:${cores[0]}">${d}<i>${cores.map(c => `<em style="background:${c}"></em>`).join("")}</i></button>` : `<span class="dc-c${eh ? " hoje" : ""}">${d}</span>`;
    }
    return `<div class="dc-m"><h3>${cap(MES[m])}</h3><div class="dc-sem">${["D", "S", "T", "Q", "Q", "S", "S"].map(x => `<span>${x}</span>`).join("")}</div><div class="dc-grade">${cel}</div></div>`;
  }).join("")}</div>
  <div class="dc-leg">${Object.entries(DISC).map(([k, d]) => `<span><i style="background:${d.cor}"></i>${esc(d.curto)}</span>`).join("")}</div>
  <div id="dc-dia" class="card dc-dia" ${st.dia ? "" : "hidden"}></div>`;
  if (st.dia) mostraDia(st.dia);
}
function mostraDia(k) {
  const ss = S.filter(s => s.data === k && daTurma(s)), d = dt(k);
  const el = $("dc-dia"); el.hidden = false;
  el.innerHTML = `<h3>${cap(dataLonga(d))}</h3>${ss.map(s => `<div class="dc-s" style="--dc:${disc(s).cor}"><span class="dc-hr">${horaCurta(s.h)}</span><span class="dc-n"><b>${esc(disc(s).nome)}</b><small>${esc(disc(s).prof.map(p => p.n).join(", "))}</small></span><span class="dc-tg">${localTag(s)}${turmasTag(s)}</span></div>`).join("")}`;
}

// ---------- disciplinas ----------
function disciplinas() {
  const agora = new Date();
  const ks = Object.keys(DISC).filter(k => S.some(s => s.d === k && daTurma(s)));
  $("dc-disc").innerHTML = `<div class="grid g2">${ks.map(k => {
    const d = DISC[k], ss = S.filter(s => s.d === k), datas = ss.filter(s => s.data).map(s => s.data).sort();
    const feitas = ss.filter(s => s.data && fim(s) <= agora).reduce((a, s) => a + (s.ch || 0), 0);
    const dias = new Set(datas).size, pres = new Set(ss.filter(s => s.data && /campus/i.test(s.local)).map(s => s.data)).size;
    const comp = Object.entries(PLANO).flatMap(([t, p]) => p.itens.filter(i => i.nome === d.nome).map(i => `${i.comp} · Turma ${t}`));
    const st_ = !datas.length ? "" : agora < inicio(ss.find(s => s.data === datas[0])) ? "Vai começar" : feitas >= (d.ch || 1e9) ? "Concluída" : agora > fim(ss.filter(s => s.data).slice(-1)[0]) ? (ss.some(s => !s.data) ? "Falta encontro com data a definir" : "Concluída") : "Em andamento";
    return `<article class="card dc-card" style="--dc:${d.cor}"><div class="dc-card-t"><span class="tag ${st_ === "Em andamento" ? "ok" : st_ === "Concluída" ? "" : "gold"}">${st_}</span>${comp.map(c => `<span class="tag">${esc(c)}</span>`).join("")}</div>
    <h3>${esc(d.nome)}</h3>
    <div class="dc-prof">${fotos(d)}<span>${esc(d.prof.map(p => p.n).join(", "))}</span></div>
    <dl class="dc-num"><div><dt>Carga horária</dt><dd>${d.ch ? d.ch + " h" : "—"}</dd></div><div><dt>Encontros</dt><dd>${dias}</dd></div><div><dt>Presenciais no campus</dt><dd>${pres}</dd></div></dl>
    ${datas.length ? `<p class="meta">De ${dataLonga(dt(datas[0]))} a ${dataLonga(dt(datas[datas.length - 1]))}. ${ss.some(s => !s.data) ? "Há encontros com data a definir." : ""}</p>` : ""}
    ${d.ch ? `<div class="dc-barra"><i style="width:${Math.min(100, 100 * feitas / d.ch)}%"></i></div><p class="meta">${feitas} de ${d.ch} horas realizadas até hoje</p>` : ""}
    <p class="dc-acoes"><button type="button" class="btn ghost2" data-ics="${k}">Adicionar ao calendário</button><button type="button" class="lnk" data-ver="${k}">Ver as datas</button></p></article>`;
  }).join("")}</div>`;
}

// ---------- plano da turma ----------
function plano() {
  const ts = st.turma === "todas" ? Object.keys(PLANO) : [st.turma];
  $("dc-plano").innerHTML = `<div class="grid g2">${ts.map(t => { const p = PLANO[t], tot = p.itens.reduce((a, i) => a + (i.ch || 0), 0), tm = TURMAS.find(x => x.id === t);
    return `<article class="card dc-pl"><span class="eyebrow">${esc(tm ? tm.rotulo : "")}</span><h3>Turma ${t}</h3>
    <table class="tbl"><thead><tr><th>Componente</th><th>Atividade</th><th>CH</th></tr></thead><tbody>${p.itens.map(i => { const d = Object.values(DISC).find(x => x.nome === i.nome);
      return `<tr><td data-l="Componente"><i class="dc-pt" style="background:${d ? d.cor : "var(--line)"}"></i>${esc(i.comp)}</td><td><b>${esc(i.nome)}</b>${i.prof ? `<br><small class="meta">${esc(i.prof)}</small>` : ""}</td><td data-l="CH">${i.ch ? i.ch + " h" : "—"}</td></tr>`; }).join("")}
    <tr class="dc-tot"><td colspan="2">Total no semestre</td><td>${tot} h</td></tr></tbody></table></article>`; }).join("")}</div>`;
}

// ---------- .ics ----------
function ics(k) {
  const d = DISC[k], ss = S.filter(s => s.d === k && s.data && daTurma(s));
  const f = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0") + "T" + String(x.getHours()).padStart(2, "0") + String(x.getMinutes()).padStart(2, "0") + "00";
  const tx = s => String(s).replace(/[,;\\]/g, m => "\\" + m);
  const ev = ss.map((s, i) => ["BEGIN:VEVENT", `UID:ppgau-${k}-${s.data}-${i}@univag`, `DTSTART;TZID=America/Cuiaba:${f(inicio(s))}`, `DTEND;TZID=America/Cuiaba:${f(fim(s))}`, `SUMMARY:${tx(d.nome)}`, `DESCRIPTION:${tx("PPGAU UNIVAG · " + d.prof.map(p => p.n).join(", "))}`, `LOCATION:${tx(/campus/i.test(s.local) ? "UNIVAG Centro Universitário, Av. Dom Orlando Chaves, 2655, Várzea Grande, MT" : "Sala híbrida UNIVAG (presencial e on-line)")}`, "END:VEVENT"].join("\r\n"));
  const txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PPGAU UNIVAG//Calendario//PT", "CALSCALE:GREGORIAN", ...ev, "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })); a.download = `ppgau-${k}.ics`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ---------- controles ----------
function tudo() {
  document.querySelectorAll("[data-turma]").forEach(b => b.setAttribute("aria-pressed", b.dataset.turma === st.turma));
  document.querySelectorAll("[data-aba]").forEach(b => b.setAttribute("aria-selected", b.dataset.aba === st.aba));
  ["agenda", "cal", "disc", "plano"].forEach(a => $("dc-" + a).hidden = a !== st.aba);
  proxima(); ({ agenda, cal: calendario, disc: disciplinas, plano })[st.aba]();
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-turma]"); if (t) { st.turma = t.dataset.turma; gravar("ppgau-turma", st.turma); tudo(); return; }
  const a = e.target.closest("[data-aba]"); if (a) { st.aba = a.dataset.aba; gravar("ppgau-aba", st.aba); tudo(); return; }
  const c = e.target.closest("[data-dia]"); if (c) { st.dia = c.dataset.dia; calendario(); $("dc-dia").scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
  const i = e.target.closest("[data-ics]"); if (i) { ics(i.dataset.ics); return; }
  const v = e.target.closest("[data-ver]"); if (v) { st.aba = "agenda"; tudo(); const pr = S.find(s => s.d === v.dataset.ver && s.data && daTurma(s)); if (pr) document.getElementById("dia-" + pr.data).scrollIntoView({ behavior: "smooth", block: "center" }); }
});
$("dc-versao").textContent = versao;
tudo();
})();
