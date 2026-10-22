# Gera en.json, es.json, fr.json e it.json a partir de dic.py e regras.py. Uso: python3 gera.py (na pasta i18n)
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
# Italiano: textos em it1..it4.py (por índice de D) e regras em regras_it.py (na ordem de R)
from it1 import IT1; from it2 import IT2; from it3 import IT3; from it4 import IT4
from regras_it import RIT
IT1[512] = "Coordinamento:"
IT = {**IT1, **IT2, **IT3, **IT4}
d = {norm(e[0]): IT[i] for i, e in enumerate(D) if i in IT}
r = [[p, t] for (p, *_), t in zip(R, RIT) if t is not None]
json.dump({"d": d, "r": r}, open("it.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("it", len(d), "termos,", len(r), "regras; faltam", [i for i in range(len(D)) if i not in IT][:20])
