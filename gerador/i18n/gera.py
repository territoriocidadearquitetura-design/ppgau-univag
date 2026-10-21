# Gera en.json, es.json e fr.json a partir de dic.py e regras.py. Uso: python3 gera.py (na pasta i18n)
import json, re, os
from dic import D
from regras import R
norm = lambda s: re.sub(r"\s+", " ", s).strip()
for i, lg in enumerate(["en", "es", "fr"]):
    d = {}
    for e in D:
        d[norm(e[0])] = e[i + 1]
    r = [[p, e[i]] for p, *e in R if e[i] is not None]
    json.dump({"d": d, "r": r}, open(f"{lg}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    print(lg, len(d), "termos,", len(r), "regras", os.path.getsize(f"{lg}.json") // 1024, "KB")
