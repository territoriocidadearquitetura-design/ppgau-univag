// Extrai os autores de uma referência no formato do Lattes ("SOBRENOME, A. B. ; OUTRO, C. . Título...").
"use strict";
const semAcento = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const SUF = /^(FILHO|JUNIOR|JR|NETO|SOBRINHO)$/;
const PART = /^(DE|DA|DO|DAS|DOS|E|DI|DEL|VAN|VON)$/;
function chave(sobrenome, prenome) {
  const w = semAcento(sobrenome).toUpperCase().replace(/[^A-Z\s]/g, " ").split(/\s+/).filter(x => x && !PART.test(x));
  if (!w.length) return null;
  let s = w[w.length - 1];
  if (SUF.test(s) && w.length > 1) s = w[w.length - 2] + " " + s;
  const ini = semAcento(prenome).toUpperCase().replace(/[^A-Z]/g, "")[0];
  return ini ? s + " " + ini : null;
}
// Chaves possíveis de um nome completo ("Natallia Sanches e Souza" -> SOUZA N, SANCHES N).
function chavesNome(nome) {
  const w = semAcento(nome).toUpperCase().split(/\s+/).filter(Boolean);
  const ini = w[0][0], out = new Set();
  w.slice(1).forEach((x, i, a) => {
    if (PART.test(x) || x.length < 3) return;
    if (SUF.test(x) && i > 0) { out.add(a[i - 1] + " " + x + " " + ini); return; }
    out.add(x + " " + ini);
  });
  return [...out];
}
function autores(ref) {
  const segs = ref.split(";"), out = [];
  for (let si = 0; si < segs.length; si++) {
    // "(Org.)" e "JR." não encerram o nome; "GODOY. J. A. R." é "GODOY, J. A. R." com ponto no lugar da vírgula
    const seg = segs[si].replace(/\s*\((?:Orgs?|Ed|Eds|Coord)\.?\)/gi, "").replace(/\b(JR|Jr)\.(?=\s*,)/, "JUNIOR").replace(/^(\s*[A-ZÀ-Ý][A-ZÀ-Ý' -]+)\. (?=[A-ZÀ-Ý]\.)/, "$1, ");
    let m = /^\s*([^,.;]{2,60}),\s*(.*)$/s.exec(seg);
    // nome por extenso sem vírgula ("Fabio Friol Guedes de Paiva"), só no meio da lista de autores
    if (!m && si < segs.length - 1 && /^\s*[A-ZÀ-Ý][\p{L}]+(\s+(de|da|do|dos|das|e|[A-ZÀ-Ý][\p{L}]+)){1,5}\s*$/u.test(seg)) {
      const w = seg.trim().split(/\s+/); m = [null, w[w.length - 1], w.slice(0, -1).join(" ")];
    }
    if (!m) break;
    const tok = m[2].trim().split(/\s+/);
    const pre = []; let fim = false;
    for (let i = 0; i < tok.length; i++) {
      const t = tok[i];
      if (t === "." || t === "..") { fim = true; break; }
      if (/^([A-ZÀ-Ý]\.)+\.?$/.test(t) || /^[A-ZÀ-Ý]$/.test(t)) { pre.push(t); if (/\.\.$/.test(t)) { fim = true; break; } continue; }
      if (pre.length && /^([A-ZÀ-Ý]\.)/.test(pre[pre.length - 1]) && !/^(de|da|do|dos|das|e)$/i.test(t)) { fim = true; break; }
      if (/\.$/.test(t)) { pre.push(t); fim = true; break; }
      pre.push(t);
      if (pre.length > 5) { fim = true; break; }
    }
    const k = chave(m[1], pre.join(" "));
    if (k) out.push({ k, sob: m[1].trim(), pre: pre.join(" ").replace(/\.+$/, ".") });
    if (fim) break;
  }
  return out;
}
module.exports = { autores, chave, chavesNome, semAcento };
