# Novo site do PPGAU UNIVAG

- `site-ppgau.zip`: o site completo, pronto para hospedar (GitHub Pages, Netlify ou qualquer servidor). Abra `index.html`.
  - Cerca de 30 páginas: Início, O programa, Pessoas, Disciplinas, Produção, Revista, Livros, Mapa da produção, Linha do tempo, Eventos, Bancas, Notícias, Egressos, uma página por docente, Relatório geral, Busca, Área do professor e Painel da coordenação.
  - Toda página tem o botão "Imprimir ou salvar esta página em PDF" e mostra a data de atualização das informações.
  - `relatorio.html` é o relatório geral do programa; `relatorio-ppgau.pdf` é o mesmo relatório em PDF pronto.
  - `dados/`: o portal PPGAU em dados inteiro, com todas as funções (indicadores, Lattes, autoavaliação, painéis restritos).
- `relatorio-ppgau.pdf`: cópia do relatório geral em PDF.
- `gerador/`: os scripts que montam o site a partir dos dados do portal. Ao atualizar o portal, rode:
  1. `node gerador/build.js <pasta do PPGAU-DADOS> <pasta de saída>`
  2. `node gerador/pdf.mjs <pasta de saída>`, que refaz o relatorio-ppgau.pdf.
  Novas bancas entram no array BANCAS e novas notícias no array NOTICIAS, ambos no build.js.

Organização e diagramação do site: Profa. Dra. Sandra Medina Benini (PPGAU/UNIVAG, 2026).
