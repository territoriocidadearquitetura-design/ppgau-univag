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
  for (const seg of segs) {
    const m = /^\s*([^,.;]{2,60}),\s*(.*)$/s.exec(seg);
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
