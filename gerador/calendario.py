# Converte a planilha do calendário do semestre em calendario.json (sessões e plano por turma).
import sys, json, re, openpyxl, datetime
wb = openpyxl.load_workbook(sys.argv[1], data_only=True); ws = wb.active
# valor de célula mesclada = valor da célula superior esquerda
mval = {}
for rg in ws.merged_cells.ranges:
    if rg.max_col > 20: continue
    v = ws.cell(rg.min_row, rg.min_col).value
    for r in range(rg.min_row, rg.max_row + 1):
        for c in range(rg.min_col, rg.max_col + 1): mval[(r, c)] = v
V = lambda r, c: mval.get((r, c), ws.cell(r, c).value)
lim = lambda s: re.sub(r"\s+", " ", str(s).replace("\xa0", " ")).strip() if s is not None else ""
MES = {"Agosto": 8, "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12}
titulo = lim(V(1, 1)); turmas = [lim(V(r, 1)) for r in range(2, 6)]
hdr = {lim(V(7, c)): c for c in range(1, 16) if V(7, c)}
col = lambda k: next(c for h, c in hdr.items() if h.startswith(k))
sess, mes, dia, sem = [], None, None, None
for r in range(8, 68):
    m, d, s = V(r, col("Mês")), V(r, col("Dia")), V(r, col("Semana"))
    if not any(V(r, c) for c in range(1, 13)): continue
    if m: mes = MES[lim(m)]
    if d is not None and d != dia: dia = d
    if s: sem = lim(s)
    h = lim(V(r, col("Horário"))); cat = lim(V(r, col("Categoria"))); nome = lim(V(r, col("Nome")))
    if not h: continue
    data = None
    if isinstance(dia, int): data = datetime.date(2026, mes, dia).isoformat()
    tur = lim(V(r, col("Turma"))); loc = lim(V(r, col("Local")))
    if not nome and cat.startswith("3º Simpósio"): nome, cat = cat, "Evento científico"
    sess.append({"data": data, "semana": sem if data else "", "mes": mes, "h": h, "cat": cat, "nome": nome, "prof": lim(V(r, col("Professores"))), "ch": V(r, col("Carga")) if isinstance(V(r, col("Carga")), (int, float)) else None, "turmas": tur, "local": loc, "linha": r})
# turma e local valem para o dia todo (ficam só na primeira linha do dia)
ult = {}
for x in sess:
    k = (x["data"], x["nome"]) if x["data"] else ("?" + str(x["linha"]), x["nome"])
    if x["turmas"]: ult[x["nome"], x["data"]] = (x["turmas"], x["local"])
    elif (x["nome"], x["data"]) in ult: x["turmas"], x["local"] = ult[x["nome"], x["data"]]
for x in sess:
    if not x["turmas"]:
        prev = [y for y in sess if y["nome"] == x["nome"] and y["turmas"] and y["linha"] < x["linha"]]
        if prev: x["turmas"], x["local"] = prev[-1]["turmas"], prev[-1]["local"]
    t = x["turmas"]; x["turmas"] = sorted(set(re.findall(r"Turma (\d+)", t))) if "Todas" not in t else ["todas"]
    x["local"] = "Presencial no campus UNIVAG" if "Presencial Campus" in x["local"] else "Sala híbrida: presencial e virtual ao vivo" if "Híbrida" in x["local"] else x["local"]
# plano por turma (bloco INGRESSO): componente (col. B), nome (E), professores (G), carga horária (I)
plano, atual = {}, None
for r in range(70, 89):
    a = lim(V(r, 1))
    if a and "Turma" in a:
        t = re.search(r"Turma (\d+)", a).group(1)
        if t != atual: atual = t; plano[t] = {"rotulo": re.sub(r"\s+Turma \d+", "", a), "itens": []}
    comp = lim(ws.cell(r, 2).value)
    if atual and comp: plano[atual]["itens"].append({"comp": comp, "nome": lim(ws.cell(r, 5).value), "prof": lim(ws.cell(r, 7).value), "ch": ws.cell(r, 9).value})
json.dump({"titulo": titulo, "turmas": turmas, "sessoes": sess, "plano": plano}, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(len(sess), {k: len(v["itens"]) for k, v in plano.items()})
