// "PPGAU UNIVAG em dados": página inicial do portal. Linha de base 2021–2024 tirada da Ficha de
// Avaliação da Quadrienal 2025 e dos relatórios de dados enviados ao Coleta (2021–2024).
// Depende de: st, esc, nPub, respostasValidas, PUBLICOS, barras (index.html / portal.js).
// Data da última atualização dos dados de cada seção, mostrada no topo do site e em cada seção.
// Ao atualizar o portal, trocar ATUALIZ.geral e a data das seções que mudaram.
const ATUALIZ = {
  geral: "19/10/2026",
  secoes: { historia: "19/10/2026", programa: "19/10/2026", capes: "19/10/2026", docentes: "18/10/2026", formacao: "19/10/2026", pessoas: "19/10/2026", producao: "18/10/2026", impacto: "17/10/2026", fontes: "19/10/2026" },
  coleta: "Autoavaliação 2026 em coleta até 03/11/2026"
};
function carimbo(id) {
  const ic = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  if (id === "autoavaliacao") return `<p class="atz coleta">${ic}${esc(ATUALIZ.coleta)}; participação atualizada a cada acesso</p>`;
  const d = ATUALIZ.secoes[id] || ATUALIZ.geral;
  return `<p class="atz">${ic}Dados atualizados em ${d}</p>`;
}
const BASE = {
  // Fontes para auditoria: [documento, de onde foi extraído, link, o que alimenta no portal, data].
  fontes: [
    ["Ficha de Avaliação do programa, Quadrienal 2025", "Plataforma Sucupira, área da Coleta CAPES do programa (publicada em 12/01/2026)", "https://sucupira.capes.gov.br/", "Documento de referência da coordenação", "12/01/2026"],
    ["Relatório de Avaliação 2021–2024 da área Arquitetura, Urbanismo e Design", "Portal da CAPES, área do administrador do programa", "", "Documento de referência da coordenação", "2025"],
    ["Relatórios de dados enviados ao Coleta CAPES, 2021 a 2024", "Plataforma Sucupira, relatórios do Coleta CAPES do programa", "https://sucupira.capes.gov.br/", "Séries 2021–2024: docentes, turmas, projetos, matrículas, titulações, produção, bolsas, ficha de cada docente", "2021–2024"],
    ["Autoavaliação do PPGAU UNIVAG", "Site do programa, menu Institucional", "https://www.univag-ppgau.com/_files/ugd/036f6f_3d11ab1fd9d74f5ca3c9e8883a53069a.pdf", "Histórico da autoavaliação e metas do programa", "03/02/2025"],
    ["Planejamento Estratégico do PPGAU UNIVAG", "Site do programa, menu Institucional", "https://www.univag-ppgau.com/_files/ugd/036f6f_c9868e03fc454c169e8471920264f98a.pdf", "Documento de referência do programa (consulta)", "consulta em 17/10/2026"],
    ["Fichas de Avaliação 2025–2028 e Documento de Área (Arquitetura, Urbanismo e Design)", "Portal da CAPES, documentos da área 29", "", "Documento de referência da coordenação", "2025"],
    ["Corpo docente", "Site do programa, página Corpo Docente", "https://www.univag-ppgau.com/corpo-docente", "Nomes, titulação, fotos, links do Lattes e do ORCID", "consulta em 17/10/2026"],
    ["Discentes e orientações em andamento", "Lista oficial de alunos do programa (turmas 2019/2 a 2026/2), currículos Lattes dos docentes (18/10/2026) e página Discentes do site do programa", "https://www.univag-ppgau.com/discentes", "Quem é discente e turma de ingresso (lista oficial); orientandos de cada docente e indicadores de orientação (Lattes)", "lista recebida em 19/10/2026"],
    ["Dissertações defendidas", "Site do programa e Repositório Digital UNIVAG", "https://www.univag-ppgau.com/dissertacao-defendidas", "Lista de dissertações, defesas por docente", "consulta em 17/10/2026"],
    ["Grupos de pesquisa", "Diretório dos Grupos de Pesquisa do CNPq e sites dos grupos", "http://dgp.cnpq.br/dgp/", "Grupos, líderes e links", "consulta em 17/10/2026"],
    ["Produção desde 2025", "OpenAlex, consulta pelo ORCID de cada docente (base aberta; não substitui o Lattes)", "https://openalex.org/", "Artigos 2025 e 2026 por docente, coautoria com discentes", "consulta em 17/10/2026"],
    ["Revista Vernácula", "Portal de periódicos da UNIVAG", "https://periodicos.univag.com.br/index.php/Vernacula/index", "Periódico do programa", "consulta em 19/10/2026 (edições anteriores: v. 1 a 3, n. 1 a 11)"],
    ["Questionários da autoavaliação 2026", "Respostas anônimas registradas neste portal", "", "Aba Resultados e meta de autoavaliação", "atualização contínua"]
  ],
  programa: [
    ["Nível", "Mestrado acadêmico, recomendado em 2018 e em funcionamento desde 2019"],
    ["Área de concentração", "Arquitetura, Cidade e Território"],
    ["Linhas de pesquisa", "Ambiente Construído e Sustentabilidade; Desenvolvimento Territorial e Local; Gestão, Inovação e Tecnologias (a partir de 2026)"],
    ["Implantação", "Em associação com a PUC-Campinas, encerrada no quadriênio 2021–2024"],
    ["Periódico do programa", "Vernácula – Territórios Contemporâneos (ISSN 2965-6125), Qualis B2 (2021–2024); 11 números: 4 em 2023, 4 em 2024 e 3 em 2025"],
    ["Avaliação CAPES", "Nota 3, mantida na Quadrienal 2025"]
  ],
  quesitos: [], // na área Professores e gestão (restrito.bin)
  // Texto de leitura de cada aba: o que os dados mostram, o que a CAPES avalia em 2025–2028 e o ponto de atenção.
  leitura: {
    programa: ["Área de concentração Arquitetura, Cidade e Território, com três linhas de pesquisa desde 2026. Corpo docente próprio desde 2024, quando terminou a associação com a PUC-Campinas.",
      "No quesito 1, a coerência entre linhas, projetos e disciplinas, o perfil do corpo docente, a infraestrutura, a autoavaliação e o planejamento estratégico.",
      "Na avaliação 2021–2024, o planejamento da inserção local, regional, nacional e internacional recebeu Regular (subitem 1.3.4). É o ponto a fortalecer no novo ciclo."],
    docentes: ["O corpo docente foi renovado com o fim da associação: dos 15 docentes de 2021, 6 seguiam em 2024. Os permanentes passaram de 11 para 12 e os projetos, de 25 para 43.",
      "A ficha 2025–2028 pede todos os permanentes em projetos vinculados às linhas, ao menos 50% com disciplina no ano, 60% com orientação concluída e em andamento e no mínimo 10 permanentes.",
      "Nenhum projeto registrou financiamento, e uma docente coordena cerca de 4 em cada 10 projetos. A distribuição entre os docentes conta na avaliação."],
    formacao: ["17 mestres titulados de 2021 a 2024, e a matrícula dobrou em 2024 com 18 ingressantes. O tempo médio até a titulação subiu de 25 para 38 meses.",
      "A área analisa 4 dissertações destacadas, quantas geraram produção, prêmios e distinções e o acompanhamento de 5 egressos com trajetória relevante.",
      "Só 2 titulações em 2024 e o prazo crescente pedem atenção ao fluxo. O módulo de egressos no Coleta tem poucos dados sobre onde eles atuam."],
    producao: ["A produção cresceu de 6 artigos em 2021 para 80 em 2024, e 36% dos artigos do quadriênio têm discente ou egresso entre os autores.",
      "Em 2025–2028 a área julga as produções destacadas: aderência às linhas, avanço conceitual, inovação, impacto, indexação, selo diamante e participação de discentes. A distribuição entre docentes também conta.",
      "56% dos artigos saíram em periódicos de uma mesma editora, e há títulos repetidos nos registros. Diversificar os periódicos e revisar o Coleta são prioridades."],
    autoavaliacao: ["Os questionários de 2026 ouvem seis públicos. As respostas são anônimas e os resultados completos ficam na aba Resultados.",
      "Na ficha 2025–2028 a autoavaliação é o item 1.2: objetivos, métodos, comissão, divulgação dos resultados e uso no planejamento estratégico.",
      "Em 2021–2024 a comissão não encontrou o relatório-síntese da autoavaliação. Publicar a síntese neste portal resolve esse ponto."]
  },
  trajetoria: [
    ["2019", "Início do mestrado, em associação com a PUC-Campinas"],
    ["2021", "Primeiras defesas de dissertação e Comissão de Autoavaliação na CPA"],
    ["2023", "Revista Vernácula, bolsas para todos os ingressantes e 9º Seminário de Habitação de Interesse Social"],
    ["2024", "Fim da associação, corpo docente próprio, ementas revistas e novo site"],
    ["2026", "Resultado da Quadrienal 2025: nota 3 mantida, quesito Programa Muito Bom; terceira linha de pesquisa, Gestão, Inovação e Tecnologias"]
  ],
  guia: {}, // na área Professores e gestão (restrito.bin)
  // Grupos de pesquisa no Diretório do CNPq, conforme a Proposta enviada ao Coleta em 2024.
  grupos: [
    ["Cidades, Sociedade e Paisagem", "Jeane Aparecida Rombi de Godoy", "Paisagem urbana, governança territorial e infraestrutura verde; processos de produção e apropriação do espaço urbano.", "Sandra Medina Benini, Erica Lemos Gulinelli e Gisele Carignani", "https://www.gp-paisagem.org/"],
    ["Ambiente Construído, Tecnologia e Sustentabilidade", "Diana Carolina Jesus de Paula", "Tecnologias aplicadas ao ambiente construído, mudanças climáticas e desenvolvimento sustentável.", "Natallia Sanches e Souza e Fábio Friol Guedes de Paiva", "https://amb-tec-sus4.webnode.page/"],
    ["Direito à Cidade: Dinâmicas Socioespaciais", "Antonio Busnardo Filho", "Justiça espacial, direito à moradia, inclusão urbana e políticas de desenvolvimento urbano.", "Jessica Seabra", "https://sites.google.com/view/grupodireitocidade/"],
    ["Empreendedorismo, Governança e Sustentabilidade no Ambiente Construído em Municípios de Mato Grosso", "Angelo Palmisano", "Desenvolvimento urbano sustentável, inovação e empreendedorismo na construção civil.", "Rosana Lia Ravache", "http://dgp.cnpq.br/dgp/espelhogrupo/6414964508559334"]
  ],
  // Indicadores por docente tirados dos relatórios do Coleta 2021–2024: [no programa desde, categoria e horas semanais em 2024,
  // grupo, artigos 2021–2024, orientações concluídas 2021–2024, orientandos em 31/12/2024, coorientações em 2024, projetos coordenados em 2024, turmas em 2024].
  indDoc: {
    "Angelo Palmisano": ["2021 ou antes", "Permanente, 40 h", 4, 18, 4, 5, 5, 4, 0],
    "Antonio Busnardo Filho": ["2021 ou antes", "Permanente, 20 h", 3, 11, 2, 3, 1, 3, 1],
    "Diana Carolina Jesus de Paula": ["2022", "Permanente, 34 h", 2, 22, 1, 2, 5, 1, 1],
    "Erica Lemos Gulinelli": ["2024", "Permanente, 40 h", 1, 7, 0, 2, 2, 1, 2],
    "Fábio Friol Guedes de Paiva": ["2024", "Permanente, 40 h", 2, 14, 0, 2, 1, 2, 3],
    "Flávio Henrique dos Santos Foguel": ["depois de 2024", "Sem registro no Coleta 2021–2024", 0],
    "Gisele Carignani": ["2024", "Permanente, 30 h", 1, 11, 0, 2, 3, 1, 2],
    "Jeane Aparecida Rombi de Godoy": ["2021 ou antes", "Permanente, 40 h", 1, 45, 3, 6, 2, 18, 1],
    "Jessica Seabra": ["2024", "Permanente, 40 h", 3, 9, 0, 2, 1, 3, 3],
    "Lucia Helena Gaeta Aleixo": ["2021 ou antes", "Colaboradora, 8 h", 0, 0, 0, 0, 0, 0, 0],
    "Natallia Sanches e Souza": ["2022", "Permanente, 28 h", 2, 18, 0, 3, 5, 3, 1],
    "Rosana Lia Ravache": ["2021 ou antes", "Permanente, 40 h", 4, 15, 1, 1, 2, 3, 2],
    "Sandra Medina Benini": ["2024", "Permanente, 20 h", 1, 26, 0, 2, 3, 0, 2]
  },
  // Por ano (2021, 2022, 2023, 2024); null = ainda não estava no programa. Fonte: Coleta.
  // ar artigos; or orientandos em 31/12; de defesas orientadas; pj projetos coordenados; tu turmas.
  anoDoc: {
    "Angelo Palmisano": { ar: [2, 1, 2, 13], or: [2, 2, 4, 5], de: [2, 0, 1, 1], pj: [4, 4, 5, 4], tu: [2, 0, 6, 0] },
    "Antonio Busnardo Filho": { ar: [2, 0, 4, 5], or: [2, 0, 2, 3], de: [0, 2, 0, 0], pj: [1, 1, 2, 3], tu: [1, 2, 2, 1] },
    "Diana Carolina Jesus de Paula": { ar: [null, 1, 9, 12], or: [null, 1, 1, 2], de: [null, 0, 1, 0], pj: [null, 0, 0, 1], tu: [null, 0, 3, 1] },
    "Erica Lemos Gulinelli": { ar: [null, null, null, 7], or: [null, null, null, 2], de: [null, null, null, 0], pj: [null, null, null, 1], tu: [null, null, null, 2] },
    "Fábio Friol Guedes de Paiva": { ar: [null, null, null, 14], or: [null, null, null, 2], de: [null, null, null, 0], pj: [null, null, null, 2], tu: [null, null, null, 3] },
    "Gisele Carignani": { ar: [null, null, null, 11], or: [null, null, null, 2], de: [null, null, null, 0], pj: [null, null, null, 1], tu: [null, null, null, 2] },
    "Jeane Aparecida Rombi de Godoy": { ar: [2, 4, 10, 29], or: [2, 3, 4, 6], de: [1, 1, 0, 1], pj: [13, 12, 11, 18], tu: [3, 2, 3, 1] },
    "Jessica Seabra": { ar: [null, null, null, 9], or: [null, null, null, 2], de: [null, null, null, 0], pj: [null, null, null, 3], tu: [null, null, null, 3] },
    "Lucia Helena Gaeta Aleixo": { ar: [0, 0, 0, 0], or: [0, 0, 0, 0], de: [0, 0, 0, 0], pj: [0, 0, 0, 0], tu: [0, 0, 0, 0] },
    "Natallia Sanches e Souza": { ar: [null, 0, 5, 13], or: [null, 0, 1, 3], de: [null, 0, 0, 0], pj: [null, 0, 0, 3], tu: [null, 0, 8, 1] },
    "Rosana Lia Ravache": { ar: [0, 2, 4, 9], or: [1, 1, 1, 1], de: [0, 0, 1, 0], pj: [0, 1, 1, 3], tu: [4, 2, 1, 2] },
    "Sandra Medina Benini": { ar: [null, null, null, 26], or: [null, null, null, 2], de: [null, null, null, 0], pj: [null, null, null, 0], tu: [null, null, null, 2] }
  },
  // Artigos de 2025 até hoje por docente (OpenAlex, por ORCID); preenchido quando o levantamento termina.
  ar2025: {"Angelo Palmisano": 5, "Antonio Busnardo Filho": 2, "Diana Carolina Jesus de Paula": 4, "Erica Lemos Gulinelli": 6, "Fábio Friol Guedes de Paiva": 7, "Flávio Henrique dos Santos Foguel": 0, "Gisele Carignani": 11, "Jeane Aparecida Rombi de Godoy": 9, "Jessica Seabra": 2, "Lucia Helena Gaeta Aleixo": 2, "Natallia Sanches e Souza": 8, "Rosana Lia Ravache": 4, "Sandra Medina Benini": 16},
  // Resumo do levantamento OpenAlex (artigos em periódicos com o ORCID dos docentes, sem duplicar coautorias).
  oa: { total: 52, a2025: 31, a2026: 21, eventos: 8, coautoria: 18, outros: 14 },
  perfil: [
    ["12 + 1", "permanentes e colaboradora em dezembro de 2024"],
    ["14 de 15", "permanentes declarados em 2024 com 20 h ou mais no programa"],
    ["9 e 11", "entradas e saídas de docentes de 2021 a 2024, com o fim da associação com a PUC-Campinas"],
    ["30", "orientações de mestrado em andamento em 31/12/2024, contra 14 em 2021"]
  ],
  // Seleção: vagas, inscritos e aprovados declarados na Proposta (Coleta).
  selecao: [[10, 7, 6], [10, 12, 10], [10, 17, 10], [15, 21, 15]],
  // Dissertações do Repositório Digital UNIVAG (edições 2021 a 2026, consulta em 17/10/2026), conferidas com os Lattes (18/10/2026);
  // Frederico Rasga, Yuri Lopes e Tatiane Kono vêm do Lattes (ainda sem link no repositório): [ano da edição, data da defesa quando conhecida, autor(a), orientação, título, link].
  dissertacoes: [
    ["2021", "25/08", "Andrieli Caroline Lima", "Angelo Palmisano", "A PRODUÇÃO DO ESPAÇO URBANO EM SINOP MATO GROSSO E SUA RELAÇÃO COM O DESENVOLVIMENTO DAS ATIVIDADES ECONÔMICAS NO PERÍODO DE 2000 A 2020", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1619"],
    ["2021", "30/08", "Cezar Clemente Pires dos Santos", "Manoel Lemes da Silva Neto", "MAPEAMENTO DE ÁREAS DE RISCO DE INUMDAÇÕES E ALAGAMENTOS NO PERÍMETRO URBANO DE CUIABÁ - MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1624"],
    ["2021", "04/02", "Daniel Silva Campos", "Antônio Soukef Junior (coorientação de Antonio Busnardo Filho)", "CASA DE BEM BEM: ESTUDO DE CASO DE ARQUITETURA DE TERRA CRUA", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1745"],
    ["2021", "10/12", "Fabiana Zili Salmoria", "Jeane Aparecida Rombi de Godoy", "CIDADES DE COSTAS PARA O RIO: O DESCASO COM AS APPs URBANAS NA REGIÃO METROPOLITANA DO VALE DO RIO CUIABÁ- RMVRC/MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1621"],
    ["2021", "15/12", "Franciele Cavalheiro Novack", "Angelo Palmisano", "INFRAESTRUTURA VERDE: POSSIBILIDADES E DESAFIOS PARA A SUSTENTABILIDADE URBANA NOS CONJUNTOS HABITACIONAIS DE INTERESSE SOCIAL EM CUIABÁ/MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1623"],
    ["2022", "15/12", "Abelar Santana Moraes", "Antonio Busnardo Filho", "URBANIZAÇÃO CONTEMPORÂNEA EM CUIABÁ CONQUISTA E FORMAÇÃO DO TERRITÓRIO URBANO: O CASO DO CÓRREGO DO CAJU", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1702"],
    ["2022", "24/10", "Adriana Fátima Dussel dos Santos", "Maíra Vieira Dias", "ANÁLISE E ADEQUAÇÃO DE AMBIENTE ESCOLAR EM CUIABÁ-MT PARA OBTENÇÃO DA CLASSE \"A\" DE EFICIÊNCIA ENERGÉTICA PELA APLICAÇÃO DA INI-C", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1954"],
    ["2022", "18/07", "Elson Eduardo de Oliveira Paulo", "Humberto da Silva Metello", "INSULATED CONCRETE FORMS – TECNOLOGIA ALTERNATIVA NA QUALIDADE DE VIDA PELA OTIMIZAÇÃO DO CONFORTO TÉRMICO HABITACIONAL", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1953"],
    ["2022", "04/02", "Joel Marcos Gatto", "Jeane Aparecida Rombi de Godoy", "APROPRIAÇÃO DO ESPAÇO PÚBLICO: O CASO DE 100 PRAÇAS EM CUIABÁ (2017-2020)", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1620"],
    ["2022", "", "Willian Jonas Mininel", "Antonio Busnardo Filho", "DE VILA MARIA DO PARAGUAI À CÁCERES: ESTUDO DO DESENVOLVIMENTO DO TRAÇADO URBANO", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1622"],
    ["2023", "29/09", "Angelica Pereira Pinheiro", "Rodrigo Nogueira Lima", "MÉTODO APLICADO DE ACESSIBILIDADE EM PARQUES URBANOS: O CASO DO PARQUE DAS ÁGUAS EM CUIABÁ, MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1855"],
    ["2023", "25/05", "Brunna Camargo Battaini", "Maíra Vieira Dias", "PARÂMETROS MONTESSORIANOS NA CONCEPÇÃO DA ARQUITETURA ESCOLAR", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1856"],
    ["2023", "", "Giovanna Erina da Silva Moraes", "Rosana Lia Ravache (coorientação de Jeane Aparecida Rombi de Godoy)", "URBANIZAÇÃO E MEIO AMBIENTE: PERSPECTIVAS DO PLANEJAMENTO URBANO EM ASSENTAMENTOS PRECÁRIOS, VÁRZEA GRANDE - MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1857"],
    ["2023", "", "Hortência Santos Teixeira Bonfante", "Angelo Palmisano", "A UTILIZAÇÃO DA METODOLOGIA BIM NO ENSINO EM CURSOS DE GRADUAÇÃO EM ARQUITETURA E URBANISMO NAS INSTITUIÇÕES DE ENSINO SUPERIOR DA BAIXADA CUIABANA", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1956"],
    ["2023", "15/09", "Poema Bidarra Oliveira", "Diana Carolina Jesus de Paula (coorientação de Jeane Aparecida Rombi de Godoy)", "INVESTIGAÇÃO DOS PARQUES URBANOS E A RELAÇÃO COM O MERCADO IMOBILIÁRIO EM CUIABÁ/MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1854"],
    ["2024", "25/03", "Marilene Oliveira Santos", "Angelo Palmisano", "CENTRO DE REABILITAÇÃO MOTORA INFANTOJUVENIL: ESTUDO DO TRATAMENTO ESPECIALIZADO EM CUIABÁ-MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1957"],
    ["2024", "17/12", "Rosivane Fernandes", "Jeane Aparecida Rombi de Godoy (coorientação de Diana Carolina Jesus de Paula)", "ESTUDO DE IMPACTO DE VIZINHANÇA (EIV): DESAFIOS E POTENCIALIDADES DE UMA METODOLOGIA MATEMÁTICA APLICADA AO PLANEJAMENTO URBANO", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/1996"],
    ["2025", "", "Geisianie Arruda de Almeida", "Sandra Medina Benini (coorientação de Jeane Aparecida Rombi de Godoy)", "ANÁLISE DA TRANSFORMAÇÃO DAS PAISAGENS FLUVIAIS URBANAS: ESTUDOS DE CASO DOS CÓRREGOS DO BARBADO E DO GAMBA", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2037"],
    ["2025", "", "Leily Francy Leite de Oliveira Monteiro Silva", "Sandra Medina Benini (coorientação de Jeane Aparecida Rombi de Godoy)", "AVALIAÇÃO DA QUALIDADE AMBIENTAL URBANA – UM ESTUDO DE CASO DO BAIRRO CRISTO REI/ VÁRZEA GRANDE - MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2036"],
    ["2025", "", "Marcelo Luiz Perini Tarachuk", "Jeane Aparecida Rombi de Godoy (coorientação de Diana Carolina Jesus de Paula)", "TRANSFORMAÇÕES NA PAISAGEM E SUSTENTABILIDADE NA BACIA HIDROGRÁFICA DO RIO CUIABÁ: UMA ANÁLISE 1985 A 2023", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2042"],
    ["2025", "", "Rafaela Ferreira Rosso", "Natallia Sanches e Souza (coorientação de Rosana Lia Ravache)", "VULNERABILIDADE SOCIAL: UM VIÉS A PARTIR DA MORADIA DIGNA EM MATO GROSSO E CUIABÁ", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2035"],
    ["2025", "16/12", "Victória Ferreira Galvão", "Jeane Aparecida Rombi de Godoy (coorientação de Natallia Sanches e Souza)", "AVALIAÇÃO DA INSERÇÃO URBANA DO EMPREENDIMENTO MCMV: FERRAMENTA PARA PLANEJAMENTO URBANO SUSTENTÁVEL", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2038"],
    ["2025", "", "Frederico Cezar Giuberti Sucena Rasga", "Antonio Busnardo Filho (coorientação de Angelo Palmisano)", "O TEMPLO CATÓLICO: DA TRANSCENDÊNCIA MÍSTICA MEDIEVAL À IMANÊNCIA RACIONAL MODERNA", ""],
    ["2025", "", "Yuri de Souza Lopes", "Sandra Medina Benini (coorientação de Jeane Aparecida Rombi de Godoy)", "PLANEJAMENTO INTEGRADO DOS PARQUES URBANOS: ESTUDO DE CASO DE CUIABÁ-MT, VÁRZEA GRANDE-MT E CHAPADA DOS GUIMARÃES-MT", ""],
    ["2026", "", "Eliane Augusta Gonçalves de Souza", "Natallia Sanches e Souza (coorientação de Erica Lemos Gulinelli)", "ROTATÓRIAS URBANAS: BARREIRAS E CONECTIVIDADE NA ESTRUTURA VIÁRIA DE CUIABÁ-MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2088"],
    ["2026", "", "Priscila Wolff Sampaio Santiago", "Jeane Aparecida Rombi de Godoy (coorientação de Sandra Medina Benini)", "PLANEJAMENTO SISTÊMICO DOS ESPAÇOS LIVRES PÚBLICOS PARA CUIABÁ/MT: REFLEXÕES E CAMINHOS NA PROPOSIÇÃO DE DIRETRIZES", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2041"],
    ["2026", "", "Rafaela Alves Bernardes", "Diana Carolina Jesus de Paula (coorientação de Natallia Sanches e Souza)", "SOMBREAMENTO DE EDIFÍCIOS VERTICAIS: EFEITOS SOBRE O FATOR DE VISÃO DE CÉU E A EXPOSIÇÃO SOLAR", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2055"],
    ["2026", "", "Taynara Barreto Macedo", "Jessica Seabra", "TETO, CHÃO E HORIZONTE: REGULARIZAÇÃO FUNDIÁRIA PLENA EM CUIABÁ-MT", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2043"],
    ["2026", "", "Tatiane Cristine Silva Kono de Oliveira", "Fábio Friol Guedes de Paiva", "MATRIZ DE MATURIDADE BIM NA ADMINISTRAÇÃO PÚBLICA MUNICIPAL: ADAPTAÇÃO E APLICAÇÃO COMO INSTRUMENTO DE GESTÃO ESTRATÉGICA", ""],
    ["2026", "", "Thais Lara Pinto de Arruda", "Gisele Carignani (coorientação de Rosana Lia Ravache)", "LEITURAS MORFOLÓGICAS DE CÁCERES: HISTÓRIA, FORMA E ESPAÇO", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/article/view/2039"]
  ],
  // Orientações de mestrado em andamento conferidas nos currículos Lattes dos 13 docentes (PDFs de 18/10/2026):
  // [discente, orientação (primeiro nome), coorientações, ano de início, observação]. Observação "site": consta na página
  // Discentes do site do programa, mas em nenhum Lattes. Concluíram e saíram da lista: Frederico Rasga, Tatiane Kono e Yuri Lopes.
  andamento: [["Alex Sandro Morais do Nascimento", "Gisele", ["Natallia"], "2025", ""], ["Allan Augusto Rocha Allan", "Flávio", [], "2026", ""], ["Ana Carolina de Oliveira Lima", "Fábio", [], "2026", ""], ["Ângela Cristina Goes dos Santos", "Diana", ["Fábio"], "2025", ""], ["Bruno Kimura", "Fábio", ["Flávio"], "2024", ""], ["Cacio Zanatta", "Sandra", ["Jeane"], "2025", "No Lattes do prof. Fábio consta como orientando dele desde 2025, com coorientação da profa. Diana (2026) e outro título."], ["Charles Fabiano Araújo Quadro", "Flávio", [], "2026", ""], ["Cíntia Paulino da Silva", "Gisele", [], "2024", ""], ["Claudio Mirrair Farias Donoso Facheti", "Sandra", [], "2024", ""], ["Deborah Karen Mansilha Guebara", "Natallia", ["Diana"], "2024", ""], ["Deivis Ceslei Maggi", "Flávio", [], "2026", ""], ["Edmar Celestino de Souza Neto", "Natallia", [], "2026", ""], ["Emili Sayuri Takimoto", "Diana", ["Natallia"], "2024", ""], ["Fernanda Moreira Rondon Foguel", "Angelo", ["Jessica"], "2025", ""], ["Guilherme Brescancim", "Flávio", [], "2026", ""], ["Isabel Leticia Machado", "Natallia", [], "2025", ""], ["Isabela Machado Pereira Morgado", "Fábio", ["Natallia"], "2025", ""], ["Isabella Helwig Alves", "Jessica", [], "2026", ""], ["João Paulo Kayoli", "Rosana", ["Jessica"], "2025", "Os Lattes das profas. Rosana e Jessica registram as duas como orientadoras."], ["Jonath Elias Duarte", "Antonio", [], "2024", ""], ["Jorge Luis Almeida de Barros", "Antonio", [], "2026", ""], ["Kethylin Vanessa Melo", "Jeane", [], "2023", "Primeira matrícula em 2020/1 e nova matrícula em 2023/1, segundo a lista oficial de alunos do programa."], ["Lauro Boa Sorte Carneiro", "Flávio", ["Jessica"], "2025", ""], ["Lucas Vicente Nunes", "Angelo", ["Jeane"], "2023", ""], ["Marcos de Sá Fernandes da Silva", "Flávio", [], "2026", ""], ["Maria Augusta Fonseca Dias Ribeiro", "Angelo", ["Antonio"], "2024", ""], ["Maxwel Pires Pedroso", "Antonio", [], "2023", ""], ["Mayara Kauany Silva Fagundes", "Erica", [], "2024", ""], ["Nátali de Paula", "Erica", ["Gisele", "Sandra"], "2024", ""], ["Nycolas Martins de Araújo Braga de Moraes", "Fábio", ["Diana"], "2026", ""], ["Otavio Henrique Ribeiro França", "Jeane", ["Sandra"], "2026", ""], ["Paulo Franco Teles de Oliveira", "Sandra", ["Jeane"], "2024", ""], ["Priscila Tábida Silva Enoré", "Angelo", ["Jeane", "Natallia"], "2023", ""], ["Reginete Maria Rondon da Silva", "Rosana", [], "2026", ""], ["Renan Antônio Lorenzon Rigotti", "Antonio", [], "2024", ""], ["Tarsila Athena Borba Oliveira da Cunha Fernandes", "Gisele", [], "2026", ""], ["Thaiz Freitas Pessoa", "Jeane", ["Sandra"], "2026", ""], ["Vandréia Cristine Fernandes Santos Pironnet", "Sandra", ["Jeane"], "2025", ""], ["Vanessa Knutzen Lourenço", "Erica", ["Gisele"], "2025", ""], ["Vicente Paulo José da Silva Justo", "Jessica", [], "2024", ""], ["Viviane Lucia de Quadros", "Jeane", ["Sandra"], "2026", ""]],
  // Corpo docente conforme o site do programa (univag-ppgau.com/corpo-docente), outubro de 2026.
  corpo: [
    ["Angelo Palmisano", "Doutorado em Ciências Sociais; pós-doutorado em Ciências Sociais Aplicadas", "http://lattes.cnpq.br/6569832225168001", "https://orcid.org/0000-0003-4139-6366", "fotos/palmisano.jpg"],
    ["Antonio Busnardo Filho", "Doutorado em Educação; pós-doutorado em Ciências Humanas", "https://lattes.cnpq.br/2235013674233375", "https://orcid.org/0000-0001-8454-1135", "fotos/busnardo.jpg"],
    ["Diana Carolina Jesus de Paula", "Doutorado em Física Ambiental", "http://lattes.cnpq.br/1250796395513644", "https://orcid.org/0000-0001-5989-8562", "fotos/diana.jpg"],
    ["Erica Lemos Gulinelli", "Doutorado em Arquitetura e Urbanismo", "http://lattes.cnpq.br/0218527663555090", "https://orcid.org/0000-0002-6003-3504", "fotos/erica.jpg"],
    ["Fábio Friol Guedes de Paiva", "Doutorado em Meio Ambiente e Desenvolvimento Regional; pós-doutorado na Unoeste e na Universidad de Córdoba", "http://lattes.cnpq.br/5006706886735096", "https://orcid.org/0000-0001-5143-2952", "fotos/fabio.jpg"],
    ["Flávio Henrique dos Santos Foguel", "Doutorado em Administração", "http://lattes.cnpq.br/9659940213926380", "https://orcid.org/0000-0003-3378-6903", "fotos/flavio.jpg"],
    ["Gisele Carignani", "Doutorado em Urbanismo; pós-doutorado em Ciências Sociais Aplicadas", "http://lattes.cnpq.br/1138942613997317", "https://orcid.org/0009-0002-7156-579X", "fotos/gisele.jpg"],
    ["Jeane Aparecida Rombi de Godoy", "Doutorado e pós-doutorado em Arquitetura e Urbanismo", "http://lattes.cnpq.br/0523103672261680", "https://orcid.org/0000-0003-4577-4651", "fotos/jeane.jpg"],
    ["Jessica Seabra", "Doutorado em Arquitetura e Urbanismo", "http://lattes.cnpq.br/1485109054536917", "https://orcid.org/0000-0002-5890-5676", "fotos/jessica.jpg"],
    ["Lucia Helena Gaeta Aleixo", "Doutorado em História Econômica", "http://lattes.cnpq.br/5843344255616459", "", "fotos/lucia.jpg"],
    ["Natallia Sanches e Souza", "Doutorado em Física Ambiental", "http://lattes.cnpq.br/2878290401700822", "https://orcid.org/0000-0002-2950-4611", "fotos/natallia.jpg"],
    ["Rosana Lia Ravache", "Doutorado em Geografia; pós-doutorado em Arquitetura e Urbanismo", "http://lattes.cnpq.br/6071624372540188", "https://orcid.org/0000-0003-2900-8850", "fotos/rosana.jpg"],
    ["Sandra Medina Benini", "Doutorado em Arquitetura e Urbanismo e em Geografia; pós-doutorado em Arquitetura e Urbanismo", "http://lattes.cnpq.br/5064986560402627", "https://orcid.org/0000-0002-7109-8717", "fotos/sandra.jpg"]
  ],
  explica: {}, // na área Professores e gestão (restrito.bin)
  // Números de 2021–2024: preenchidos a partir das coletas (ver memória da avaliação).
  anos: ["2021", "2022", "2023", "2024"],
  series: {
    permanentes: { valores: [11, 10, 10, 12], nota: "Permanentes com vínculo em 31/12 de cada ano. Declarados no ano: 13, 10, 12 e 15." },
    turmas: { valores: [69, 60, 67, 73], sufixo: "%", nota: "Percentual de permanentes que deram ao menos uma turma no ano. Na ficha 2025–2028 o mínimo é 50%." },
    projetos: { valores: [25, 25, 25, 43], nota: "Nenhum projeto com financiador registrado. Em 2024, 18 dos 43 eram coordenados pela mesma docente." },
    matriculados: { valores: [15, 11, 14, 30], nota: "Ingressantes: 6, 5, 9 e 18 (38 no quadriênio)." },
    titulados: { valores: [4, 6, 5, 2], nota: "17 mestres no quadriênio. Tempo médio até a titulação subiu de 25 para 38 meses." },
    artigos: { valores: [6, 8, 23, 80], nota: "117 artigos em 39 periódicos; 56% em periódicos de uma mesma editora." },
    coautoria: { valores: [1, 2, 14, 25], nota: "Artigos com discente ou egresso entre os autores: 42 de 117 (36%)." },
    bibliografica: { valores: [29, 13, 48, 179], nota: "Artigos, livros e capítulos, e trabalhos em anais. Inclui duplicidades encontradas nos registros." },
    tempo: { valores: [25, 29, 34, 38], nota: "Meses do ingresso à defesa, em média: 25,4, 28,8, 34,3 e 38,4. O prazo regular do mestrado é de 24 meses." },
    bolsas: { valores: [3, 3, 2, 4], nota: "Todas CAPES (PROSUP, REDE-PPGs e PDPG). Em 2024, 4 bolsistas para 30 matriculados." },
    ic: { valores: [21, 21, 33, 33], nota: "Estudantes de graduação em iniciação científica registrados nos projetos do programa." },
    tecnica: { valores: [60, 47, 55, 86], nota: "Sobretudo serviços técnicos e apresentações de trabalho; 1 patente em 2024." }
  },
  // Produção 2021–2024 por tipo (relatórios do Coleta; contagens sem remover duplicidades).
  tipos: [
    ["Artigos em periódicos", 117, "b"], ["Trabalhos em anais de eventos", 90, "b"], ["Livros e capítulos", 58, "b"],
    ["Serviços técnicos", 89, "t"], ["Apresentações de trabalho", 60, "t"], ["Organização de eventos", 24, "t"],
    ["Material didático", 16, "t"], ["Cursos de curta duração", 13, "t"], ["Relatórios de pesquisa", 12, "t"],
    ["Editoria", 12, "t"], ["Programas de rádio ou TV", 8, "t"], ["Outros (inclui 1 patente e 2 produções artísticas)", 20, "o"]
  ],
  pilha: { partes: ["Artigos", "Livros e capítulos", "Anais", "Outros"], anos: [[6, 7, 16, 0], [8, 2, 2, 1], [23, 6, 19, 0], [80, 43, 53, 3]] },
  kpis: [
    // Até 2026 (pedido de 19/10/2026): titulados = egressos por ano de defesa em PESSOAS (17 em 2021–2024, 7 em 2025, 6 em 2026);
    // artigos = Coleta CAPES 2021–2024 (117) + Lattes 2025 (27) e 2026 (12), sem livros, anais e capítulos lançados como artigo.
    ["Docentes permanentes", "12", "em 2026, mais 1 colaboradora", "docentes"],
    ["Grupos de pesquisa", "4", "cadastrados no CNPq em 2026", "programa", "grupos"],
    ["Mestres titulados", "30", "de 2021 a 2026", "formacao"],
    ["Artigos em periódicos", "156", "de 2021 a 2026*", "producao"]
  ],
  destaques: []
};

const CPILL = { "Muito Bom": "mb", "Bom": "b", "Regular": "r", "Fraco": "f", "Insuficiente": "i" };
const cpill = c => `<span class="cpill ${CPILL[c] || "r"}">${esc(c)}</span>`;

function vbarras(valores, rotulos, destaque, suf = "", piso = 99) {
  const max = Math.max(1, ...valores.map(v => v || 0));
  const hi = destaque ?? valores.length - 1;
  return `<div class="vbars" role="img" aria-label="${rotulos.map((r, i) => `${r}: ${valores[i] ?? "sem dado"}`).join(", ")}">${valores.map((v, i) => `
    <div class="vb ${i === hi ? "hi" : ""} ${i >= piso ? "pi" : ""} ${i === piso ? "pi0" : ""}" title="${esc(rotulos[i])}: ${v ?? "sem dado"}${suf}"><span class="t"><span class="v">${v == null ? "—" : v + suf}</span><i style="height:${Math.max(1.5, (v || 0) / max * 100)}%"></i></span><span class="x">${esc(rotulos[i])}</span></div>`).join("")}</div>`;
}
function hbarras(itens) {
  const max = Math.max(...itens.map(x => x[1]));
  return `<div class="hbars">${itens.map(([r, v, g]) => `<div class="hb"><span class="r">${esc(r)}</span><span class="t"><i class="${g}" style="width:${v / max * 100}%"></i></span><b>${v}</b></div>`).join("")}</div>`;
}
function graficoLinhas(series, anos) {
  const W = 880, H = 330, L = 44, R = 150, T = 30, B = 36, max = Math.ceil(Math.max(...series.flatMap(x => x[1])) / 50) * 50;
  const x = i => L + i * (W - L - R) / (anos.length - 1), y = v => T + (H - T - B) * (1 - v / max), base = y(0);
  const grade = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - R + 12}" y1="${y(max * f)}" y2="${y(max * f)}" class="${f ? "gl" : "g0"}"/><text x="${L - 10}" y="${y(max * f) + 4}" text-anchor="end" class="ax">${Math.round(max * f)}</text>`).join("");
  const eixo = anos.map((a, i) => `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" class="ax">${a}</text>`).join("");
  const [tn, tv, tc] = series[0];
  const area = `<path d="M${x(0)},${base} ${tv.map((d, i) => `L${x(i)},${y(d)}`).join(" ")} L${x(tv.length - 1)},${base} Z" class="ar ${tc}"/>`;
  const ls = series.map(([n, v, c]) => `<polyline points="${v.map((d, i) => `${x(i)},${y(d)}`).join(" ")}" class="ln ${c}"/>${v.map((d, i) => `<circle cx="${x(i)}" cy="${y(d)}" r="4" class="pt ${c}"/>`).join("")}`).join("");
  const vals = tv.map((d, i) => i < tv.length - 1 ? `<text x="${x(i)}" y="${y(d) - 12}" text-anchor="middle" class="vl">${d}</text>` : "").join("");
  // Rótulos diretos no fim de cada linha, afastados para não se sobrepor.
  const fim = series.map(([n, v, c]) => ({ n, c, v: v[v.length - 1], yy: y(v[v.length - 1]) })).sort((a, b) => a.yy - b.yy);
  fim.forEach((f, k) => { if (k && f.yy - fim[k - 1].yy < 18) f.yy = fim[k - 1].yy + 18; });
  const rot = fim.map(f => `<g class="el"><line x1="${x(anos.length - 1) + 8}" x2="${x(anos.length - 1) + 20}" y1="${y(f.v)}" y2="${f.yy}" class="ld"/><circle cx="${x(anos.length - 1) + 26}" cy="${f.yy}" r="4" class="pt ${f.c}"/><text x="${x(anos.length - 1) + 36}" y="${f.yy + 4}" class="en"><tspan class="env">${f.v}</tspan> ${esc(f.n)}</text></g>`).join("");
  const alvo = anos.map((a, i) => `<rect x="${x(i) - (W - L - R) / (anos.length - 1) / 2}" y="${T - 10}" width="${(W - L - R) / (anos.length - 1)}" height="${base - T + 10}" class="hit" data-i="${i}"/>`).join("");
  const dados = esc(JSON.stringify({ anos, s: series.map(([n, v, c]) => [n, v, c]) }));
  return `<div class="lwrap" data-serie="${dados}"><svg class="lchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${series.map(([n, v]) => `${n}: ${v.join(", ")}`).join("; ")}"><defs><linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" class="ga0"/><stop offset="1" class="ga1"/></linearGradient></defs>${grade}${area}<line class="xh" x1="0" x2="0" y1="${T - 10}" y2="${base}"/>${ls}${vals}${rot}${eixo}${alvo}</svg><div class="ltip" hidden></div></div><div class="leg">${series.map(([n, , c]) => `<span><i class="lc ${c}"></i>${esc(n)}</span>`).join("")}</div>`;
}
// Cruz de leitura e dica ao passar o mouse sobre o gráfico de linhas.
if (!window.__lchartHover) {
  window.__lchartHover = true;
  const sai = w => { const t = w.querySelector(".ltip"), h = w.querySelector(".xh"); t.hidden = true; h.style.opacity = 0; };
  document.addEventListener("pointerover", e => {
    const r = e.target.closest && e.target.closest(".lwrap .hit"); if (!r) return;
    const w = r.closest(".lwrap"), d = JSON.parse(w.dataset.serie), i = +r.dataset.i, t = w.querySelector(".ltip"), h = w.querySelector(".xh");
    const cx = +r.getAttribute("x") + +r.getAttribute("width") / 2;
    h.setAttribute("x1", cx); h.setAttribute("x2", cx); h.style.opacity = 1;
    t.innerHTML = `<b>${d.anos[i]}</b>${d.s.map(([n, v, c]) => `<span><i class="lc ${c}"></i>${n}<em>${v[i]}</em></span>`).join("")}`;
    const box = w.getBoundingClientRect(), sc = box.width / 880, px = cx * sc;
    t.hidden = false; t.style.left = Math.min(Math.max(px - t.offsetWidth / 2, 0), box.width - t.offsetWidth) + "px";
  });
  document.addEventListener("pointerout", e => { const w = e.target.closest && e.target.closest(".lwrap"); if (w && !w.contains(e.relatedTarget)) sai(w); });
}
function pilha(p, anos) {
  const tot = p.anos.map(a => a.reduce((x, y) => x + y, 0)), max = Math.max(...tot);
  return `<div class="stack" role="img" aria-label="${anos.map((a, i) => `${a}: ${p.partes.map((n, j) => `${n} ${p.anos[i][j]}`).join(", ")}`).join("; ")}">${p.anos.map((v, i) => `<div class="sc"><span class="v">${tot[i]}</span><span class="t" style="height:${tot[i] / max * 100}%">${v.map((x, j) => x ? `<i class="p${j}" style="flex:${x}" title="${esc(p.partes[j])}: ${x}"></i>` : "").join("")}</span><span class="x">${esc(anos[i])}</span></div>`).join("")}</div><div class="leg">${p.partes.map((n, j) => `<span><i class="p${j}"></i>${esc(n)}</span>`).join("")}</div>`;
}
function serieCard(chave, titulo, nota) {
  const s = BASE.series[chave];
  if (!s) return "";
  return `<div class="card"><div class="dim">${esc(titulo)}</div>${vbarras(s.valores.map(v => v), BASE.anos, undefined, s.sufixo)}${nota || s.nota ? `<p class="fonte">${esc(nota || s.nota)}</p>` : ""}</div>`;
}

const ICONE = {
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  impacto: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  inicio: '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"/>',
  programa: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
  historia: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  capes: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  docentes: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.8-1.9-5.1-4.5-5.8"/>',
  formacao: '<path d="M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"/>',
  producao: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  autoavaliacao: '<path d="M9 4h6v3H9zM7 5H5v16h14V5h-2M8 12l2 2 4-4M8 17h8"/>',
  fontes: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13"/>',
  responder: '<path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/>',
  grupos: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M10.8 7.2 6.2 15.8M13.2 7.2l4.6 8.6M7.5 18h9"/>',
  lattes: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'
};
const ico = k => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONE[k] || ""}</svg>`;
const NIVEL = { "Muito Bom": 5, "Bom": 4, "Regular": 3, "Fraco": 2, "Insuficiente": 1 };
const medidor = c => `<span class="meter" title="${esc(c)}" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= (NIVEL[c] || 0) ? "on " + (CPILL[c] || "") : ""}"></i>`).join("")}</span>`;
const temSerie = (...ks) => ks.some(k => BASE.series[k]);


// Ficha institucional e documentos do programa. Fonte: univag-ppgau.com (consulta 18/10/2026) e Relatório de Avaliação CAPES 2021–2024.
const PG_INFO = [
  ["Programa", "Programa de Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo (PPGAU), mestrado acadêmico"],
  ["Instituição", "UNIVAG Centro Universitário, Várzea Grande, MT"],
  ["Código CAPES", "50014013001P9 · área de avaliação Arquitetura, Urbanismo e Design"],
  ["Aprovação", "Recomendado pela CAPES na 182ª Reunião do CTC-ES, de 12 a 14 de dezembro de 2018"],
  ["Implantação", "Início em 2019, em associação com a Pontifícia Universidade Católica de Campinas (PUC-Campinas); associação encerrada no quadriênio 2021–2024"],
  ["Nota CAPES", "3, mantida na Quadrienal 2025 (avaliação 2021–2024)"],
  ["Formato", "Presencial, com aulas híbridas conforme a Instrução Normativa CAPES nº 2/2024; 24 meses"],
  ["Aulas", "Sexta-feira à noite e sábado de manhã e à tarde, UNIVAG Sede, Bloco C"],
  ["Coordenação", "Coordenadora: Profa. Dra. Jeane Aparecida Rombi de Godoy · Coordenador adjunto: Prof. Dr. Angelo Palmisano"],
  ["Conselho de Pós-Graduação", "Angelo Palmisano, Jeane Aparecida Rombi de Godoy e Antonio Busnardo Filho (docentes); Rosana Lia Ravache (suplente); Marcelo Luiz Perini Tarachuk (discente)"],
  ["Contato", '<a href="mailto:jeane.godoy@univag.edu.br">jeane.godoy@univag.edu.br</a> · <a href="mailto:angelo.palmisano@univag.edu.br">angelo.palmisano@univag.edu.br</a> · (65) 3688-6110 · Av. Dom Orlando Chaves, 2.655, Cristo Rei, Várzea Grande, MT, 78118-900']
];
const PG_DOCS = [
  ["Institucional", [["Histórico", "https://www.univag-ppgau.com/hist%C3%B3rico"], ["Missão e objetivos", "https://www.univag-ppgau.com/missao-e-objetivos"], ["Relatório de autoavaliação (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_3d11ab1fd9d74f5ca3c9e8883a53069a.pdf"], ["Planejamento estratégico (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_c9868e03fc454c169e8471920264f98a.pdf"], ["Conselho de Pós-Graduação", "https://www.univag-ppgau.com/conselho"], ["Coordenação", "https://www.univag-ppgau.com/coordenacao"]]],
  ["Acadêmico", [["Estrutura curricular", "https://drive.google.com/file/d/14l3rqlu84-EewD0CoGo94xtBRaVA6Ac3/view"], ["Disciplinas", "https://drive.google.com/file/d/1jNmYdGNX2pObQhjvrja1SV-e1GY2L3Y_/view"], ["Créditos", "https://drive.google.com/file/d/1RN9UhdakmpnvCs-ZMoMZXW93e5fpmqgq/view"], ["Guia de procedimentos acadêmicos", "https://drive.google.com/file/d/1AfHxzZUwdQt8febUw_IXyUsUjdATmcS1/view"], ["Orientações para qualificação", "https://drive.google.com/file/d/1jqhQTQzLZlTlci0UB4UD02NjG6atHGbF/view"], ["Orientações para defesa", "https://drive.google.com/file/d/1Gv8a3HNBVgYfBxXreIBVKPsMI7Rab5O1/view"], ["Aulas remotas (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_c7daeecd74004ba99c64154df7877580.pdf"]]],
  ["Seleção e pós-doutorado", [["Edital nº 05/2026, vagas remanescentes (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_c32c56de7e2a4fdabd1ddb64cb534d62.pdf"], ["Regulamento do pós-doutorado (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_250868416ab44b9c932939923d3c11a4.pdf"], ["Comissão de bolsas", "https://www.univag-ppgau.com/comissao-de-bolsas"]]],
  ["Produção e difusão", [["Dissertações defendidas", "https://www.univag-ppgau.com/dissertacao-defendidas"], ["Repositório digital das dissertações", "https://www.repositoriodigital.univag.com.br/index.php/mestradoarq/issue/archive"], ["Revista Vernácula", "https://periodicos.univag.com.br/index.php/Vernacula/index"], ["Produção em periódicos (PDF)", "https://www.univag-ppgau.com/_files/ugd/036f6f_3823c18f1f2a4a22b7c201f32e1bb84f.pdf"], ["Eventos", "https://www.univag-ppgau.com/eventos"]]]
];

function renderEmDados(soCapesCoord) {
  const resp = respostasValidas().length;
  const k = BASE.kpis || [];
  const secoes = [
    ["inicio", "Início", true], ["programa", "O programa", true], ["historia", "Linha do tempo", typeof HIST === "object"], ["capes", "Avaliação CAPES", true],
    ["docentes", "Corpo docente", temSerie("permanentes", "projetos")],
    ["formacao", "Ingresso e titulação", temSerie("matriculados", "titulados")],
    ["pessoas", "Discentes e egressos", typeof PESSOAS === "object"],
    ["producao", "Produção", temSerie("artigos", "bibliografica", "tecnica")],
    ["impacto", "Impacto", typeof IMPACTO === "object"],
    ["fontes", "Fontes", true]
  ].filter(x => x[2]);
  // A Avaliação CAPES 2021–2024 fica só no painel da coordenação (resultado já concluído, não muda); as demais seções ficam em Em dados.
  const soCapes = !!soCapesCoord;
  const navSec = secoes.filter(x => x[0] !== "capes");
  if (!soCapes && st.psec === "capes") st.psec = "inicio";
  const atual = soCapes ? "capes" : st.psec;
  const num = id => id === "capes" ? "" : String(navSec.findIndex(x => x[0] === id)).padStart(2, "0");
  const DESC = { historia: "Os marcos do programa, de 2018 até hoje, ano a ano", pessoas: "Discentes, egressos e pós-doutorandos, com orientação e produção", impacto: "Projetos, prêmios, mídia, eventos e parcerias", programa: "Área de concentração, três linhas de pesquisa e histórico", capes: "Conceitos oficiais da Quadrienal 2025, item por item", docentes: "Os 13 docentes, permanentes e projetos de pesquisa", formacao: "Processo seletivo, matrículas, bolsas, defesas e dissertações", producao: "Artigos, livros e produção técnica de 2021 a 2024", autoavaliacao: "Participação nos questionários de 2026", fontes: "Documentos oficiais usados no portal" };
  const atalhos = [...secoes.filter(x => x[0] !== "inicio" && x[0] !== "capes").map(([id, t]) => id === "capes" ? { goto: "capes", ic: "capes", t: "Avaliação CAPES 2021–2024", d: DESC[id] } : { ir: id, t, d: DESC[id] }),
    { goto: "responder", ic: "responder", t: "Responder à autoavaliação", d: "Questionário anônimo para cada público", cta: true }];
  if (!secoes.some(x => x[0] === st.psec)) st.psec = "inicio";
  const leitura = id => { const l = id === "producao" && st.pjan && st.pjan !== "q1" ? null : BASE.leitura[id]; return l ? `<div class="leit">${[["O que os dados mostram", "mostra"], ["O que a CAPES avalia", "capes"], ["Ponto de atenção", "atencao"]].map(([t, c], i) => `<div class="lt ${c}"><span class="dim">${t}</span><p>${esc(l[i])}</p></div>`).join("")}</div>` : ""; };
  const sec = (id, titulo, sub, corpo) => atual === id ? `<section class="psec" id="ps-${id}" role="tabpanel" aria-labelledby="pt-${id}"><header><span class="idx">${num(id)}</span><h2>${esc(titulo)}</h2><p>${esc(sub)}</p>${carimbo(id)}</header>${leitura(id)}${corpo}</section>` : "";
  const linhas = BASE.programa.find(x => x[0] === "Linhas de pesquisa")[1].split("; ").map(l => l.replace(/ \(a partir de 2026\)$/, ""));
  const todosItens = BASE.quesitos.flatMap(q => q.itens.map(i => [...i, q.id]));
  $view.innerHTML = `
    ${atual === "inicio" ? `<div class="kpis">
      <div class="kpi gold"><span class="ki">${ico("capes")}</span><span class="dim">Nota CAPES</span><span class="num">3</span><span class="lbl">Quadrienal 2025 · 2021–2024</span></div>
      ${k.map(x => `<div class="kpi" role="button" tabindex="0" data-ir="${x[3]}"><span class="ki">${ico(x[4] || x[3] || "producao")}</span><span class="dim">${esc(x[0])}</span><span class="num">${esc(x[1])}</span><span class="lbl">${esc(x[2])}</span></div>`).join("")}
    </div><p class="fonte" style="margin:-22px 0 22px">Fontes: Coleta CAPES 2021–2024; para 2025 e 2026, currículos Lattes dos docentes (versão de 18/10/2026) e defesas registradas no repositório digital e no site do programa. *2026 até outubro.</p>` : ""}
    ${soCapes ? "" : `<nav class="pnav" role="tablist" aria-label="Seções do portal"><span class="pnav-t">Navegue pelas seções</span><div class="pnav-g">${navSec.map(([id, t]) => `<button role="tab" id="pt-${id}" aria-selected="${st.psec === id}" data-ir="${id}">${ico(id)}<span>${id === "inicio" ? "" : `<b>${num(id)}</b>`}${t}</span></button>`).join("")}</div></nav>`}
    <div class="pcont">
    ${atual === "inicio" ? `
      <div class="dest">
        <div class="dcard auto"><span class="dim">Agora · participe</span><strong>Autoavaliação 2026 aberta</strong><p>Estudantes, docentes, pós-doutorandos, egressos, equipe técnica e gestão: a sua resposta orienta o planejamento do programa. Leva de 10 a 20 minutos, no celular, sem login.</p><span class="auto-prazo">Prazo final: <b>3 de novembro de 2026</b></span><button class="auto-btn" data-goto="responder">Responder agora →</button></div>
        <div class="dcard gold"><span class="dim">Destaque</span><strong>Revista Vernácula: 11 números desde 2023</strong><p>O periódico do programa, ISSN 2965-6125, Qualis B2 (2021–2024), publicou 4 números em 2023, 4 em 2024 e 3 em 2025.</p><a class="lnk" href="https://periodicos.univag.com.br/index.php/Vernacula/index" target="_blank" rel="noopener">Acessar a revista ↗</a></div>
      </div>
      <h3 class="sub">Atalhos</h3>
      <div class="atalhos">${atalhos.map(a => `<button class="atl ${a.cta ? "cta" : ""}" ${a.ir ? `data-ir="${a.ir}"` : `data-goto="${a.goto}"`}><span class="ai">${ico(a.ic || a.ir)}</span><span class="at"><strong>${esc(a.t)}</strong><span>${esc(a.d)}</span></span><span class="ar" aria-hidden="true">→</span></button>`).join("")}</div>` : ""}
    ${sec("programa", "O programa", "Mestrado acadêmico em Arquitetura e Urbanismo do UNIVAG Centro Universitário, em Várzea Grande, MT. Recomendado pela CAPES em 2018, em funcionamento desde 2019.", `
      <a class="pg-site" href="https://www.univag-ppgau.com" target="_blank" rel="noopener"><span class="lni">${ico("programa")}</span><span><strong>Site oficial do PPGAU UNIVAG</strong><span class="small">univag-ppgau.com · editais, documentos, corpo docente e dissertações</span></span><b>↗</b></a>
      <section class="fi card"><div class="dim" style="margin-bottom:12px">Ficha institucional</div>
        <div class="fi-hl">${[["50014013001P9", "Código CAPES", "Arquitetura, Urbanismo e Design"], ["3", "Nota CAPES", "mantida na Quadrienal 2025"], ["2018", "Aprovação CAPES", "182ª Reunião do CTC-ES, 12 a 14/12"], ["24 meses", "Duração do mestrado", "presencial, com aulas híbridas"]].map(([n, t, d]) => `<div><b>${esc(n)}</b><strong>${esc(t)}</strong><span>${esc(d)}</span></div>`).join("")}</div>
        <div class="fi-g">
          <div class="fi-b"><h4>${ico("programa")}Identificação</h4><dl>${[["Programa", "Pós-Graduação Stricto Sensu em Arquitetura e Urbanismo (PPGAU), mestrado acadêmico"], ["Instituição", "UNIVAG Centro Universitário, Várzea Grande, MT"], ["Implantação", "2019, em associação com a PUC-Campinas, encerrada no quadriênio 2021–2024"]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl></div>
          <div class="fi-b"><h4>${ico("formacao")}Funcionamento</h4><dl>${[["Formato", "Presencial, com aulas híbridas (Instrução Normativa CAPES nº 2/2024)"], ["Aulas", "Sexta-feira à noite e sábado de manhã e à tarde"], ["Local", "UNIVAG Sede, Bloco C, Várzea Grande"]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl></div>
        </div>
        <h4 class="fi-t">${ico("docentes")}Coordenação do programa</h4>
        <div class="fi-coord">${[["Jeane Aparecida Rombi de Godoy", "Coordenadora", "jeane.godoy@univag.edu.br"], ["Angelo Palmisano", "Coordenador adjunto", "angelo.palmisano@univag.edu.br"]].map(([n, r, e], i) => { const c = (BASE.corpo || []).find(x => x[0] === n) || []; return `<div class="fc ${i ? "adj" : "tit"}"><span class="fc-av">${esc(n.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join(""))}${c[4] ? `<img src="${c[4]}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span><div><span class="fc-r">${esc(r)}</span><strong>${docLink(n)}</strong>${c[1] ? `<span class="fc-t">${esc(c[1])}</span>` : ""}<span class="fc-l"><a href="mailto:${e}">✉ ${e}</a>${c[2] ? `<a href="${c[2]}" target="_blank" rel="noopener">Lattes ↗</a>` : ""}</span></div></div>`; }).join("")}</div>
        <div class="fi-cons"><div class="fi-ch"><span class="dim">Conselho de Pós-Graduação</span><a class="small" href="https://www.univag-ppgau.com/conselho" target="_blank" rel="noopener">composição no site ↗</a></div>
          <ul>${[["Jeane Aparecida Rombi de Godoy", "Presidente, como coordenadora"], ["Angelo Palmisano", "Docente"], ["Antonio Busnardo Filho", "Docente"], ["Rosana Lia Ravache", "Docente suplente"], ["Marcelo Luiz Perini Tarachuk", "Representante discente"]].map(([n, r], i) => `<li><strong>${i < 4 ? docLink(n) : esc(n)}</strong><span>${esc(r)}</span></li>`).join("")}</ul></div>
        <div class="fi-c"><a href="tel:+556536886110">☎ Secretaria (65) 3688-6110</a><a href="https://www.univag-ppgau.com" target="_blank" rel="noopener">⌂ www.univag-ppgau.com</a><span>Av. Dom Orlando Chaves, 2.655, Cristo Rei, Várzea Grande, MT, 78118-900</span></div>
        <p class="fonte">Fontes: site do programa (Histórico, Coordenação, Conselho de Pós-Graduação e Contato), Edital nº 05/2026 e Relatório de Avaliação 2021–2024 da CAPES. Consulta em 18/10/2026. O número da portaria do MEC que reconhece o curso não está publicado no site.</p></section>
      <div class="card"><div class="dim" style="margin-bottom:8px">Missão e objetivos</div><p><strong>Objetivo geral.</strong> Capacitar recursos humanos para a pesquisa científica e a docência no ensino superior, buscando excelência na pós-graduação do Centro-Oeste, e produzir e difundir conhecimento em arquitetura, cidade e território.</p><p class="small" style="margin:8px 0 4px"><strong>Objetivos específicos</strong></p><ol class="small" style="margin:0;padding-left:20px;display:grid;gap:4px"><li>Desenvolver competências de pesquisa para projetos que beneficiem as cidades e suas comunidades, com criatividade, análise crítica, desenho e modelagem física e computacional.</li><li>Expandir e fortalecer a pesquisa em Arquitetura e Urbanismo no Centro-Oeste.</li><li>Formar para os temas contemporâneos de cidade, território e governança, apoiando políticas públicas que melhorem a qualidade de vida e o ambiente.</li></ol><p class="fonte">Fonte: <a href="https://www.univag-ppgau.com/missao-e-objetivos" target="_blank" rel="noopener">Missão e Objetivos, site do programa ↗</a> (texto resumido).</p></div>
      <div class="card pg-ac"><span class="dim">Área de concentração</span><strong>Arquitetura, Cidade e Território</strong>
        <p>Pesquisas sobre os processos de desenvolvimento e planejamento territorial, históricos e contemporâneos, em um território de grande diversidade sociocultural, econômica, política e ambiental no Centro-Oeste.</p></div>
      <div class="pg-ln">${linhas.map((l, i) => `<div class="card lnc l${i + 1}"><span class="lni">${ico(["fontes", "programa", "impacto"][i] || "programa")}</span><div><span class="dim">Linha de pesquisa ${i + 1}${i === 2 ? ` <span class="novo">Nova em 2026</span>` : ""}</span><strong>${esc(l)}</strong><span class="small muted">${i < 2 ? [6, 5][i] + " docentes vinculados no relatório de 2024" : "Já regulamentada pelo programa (Edital nº 05/2026) e considerada internamente desde 2026. Ainda será registrada na CAPES, pela Coleta de 2026, a ser enviada em 2027"}</span></div></div>`).join("")}</div>
      <p class="small muted" style="margin:-4px 0 16px">A terceira linha, Gestão, Inovação e Tecnologias, já foi regulamentada pelo programa, é considerada internamente desde 2026 e consta do <a href="https://www.univag-ppgau.com/_files/ugd/036f6f_c32c56de7e2a4fdabd1ddb64cb534d62.pdf" target="_blank" rel="noopener">Edital nº 05/2026 ↗</a>. Na CAPES, ela ainda será registrada: entra na Plataforma Sucupira com a Coleta referente a 2026, a ser enviada em 2027. Na avaliação 2021–2024 o programa tinha duas linhas.</p>
      <div class="card"><div class="dim" style="margin-bottom:12px" id="grupos">Grupos de pesquisa no CNPq</div><div class="gp-g">${BASE.grupos.map(([n, l, d, m, u], gi) => { const av = (nm, big) => { const c = (BASE.corpo || []).find(x => x[0] === nm) || []; return `<span class="gp-av${big ? " big" : ""}" title="${esc(nm)}">${esc(nm.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join(""))}${c[4] ? `<img src="${c[4]}" alt="" loading="lazy" onerror="this.remove()">` : ""}</span>`; }; const ms = String(m || ""); const mem = (BASE.corpo || []).map(c => c[0]).filter(x => ms.includes(x)).sort((x, y) => ms.indexOf(x) - ms.indexOf(y)); return `<article class="gp g${gi + 1}"><div class="gp-h"><span class="gp-n">${String(gi + 1).padStart(2, "0")}</span><strong>${esc(n)}</strong></div><p>${esc(d)}</p><div class="gp-eq"><div class="gp-lid">${av(l, true)}<span><i>Líder</i><b>${docLink(l)}</b></span></div>${mem.length ? `<div class="gp-mem"><i>Participam</i><div>${mem.map(x => `<span class="gp-p">${av(x)}${docLink(x)}</span>`).join("")}</div></div>` : ""}</div>${u ? `<a class="gpl" href="${u}" target="_blank" rel="noopener">${u.includes("dgp.cnpq") ? "Ver no Diretório do CNPq" : "Site do grupo"} ↗</a>` : ""}</article>`; }).join("")}</div><p class="fonte">Descrição: Proposta do programa enviada ao Coleta CAPES em 2024. Links: menu Grupos de Pesquisa do site do programa.</p></div>
      <div class="pg-fx">${[["Nível", "Mestrado acadêmico"], ["Início", "2019"], ["Sede", "Várzea Grande, MT"], ["Periódico", "Vernácula · ISSN 2965-6125"]].map(([a, b]) => `<div><span class="dim">${a}</span><b>${a === "Periódico" ? `<a href="https://periodicos.univag.com.br/index.php/Vernacula/index" target="_blank" rel="noopener">${b} ↗</a>` : b}</b></div>`).join("")}</div>
      <div class="card"><div class="dim" style="margin-bottom:10px">Documentos e normas do programa</div><div class="pg-docs">${PG_DOCS.map(([g, l]) => `<div><span class="small muted">${esc(g)}</span><ul>${l.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a></li>`).join("")}</ul></div>`).join("")}</div><p class="fonte">Todos os links levam aos documentos publicados no site do programa, consulta em 18/10/2026.</p></div>
      <div class="card"><div class="dim" style="margin-bottom:10px">Trajetória</div><ol class="tl">${BASE.trajetoria.map((t, i, a) => `<li class="${i === a.length - 1 ? "hi" : ""}"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></li>`).join("")}</ol></div>`)}
    ${typeof historiaCorpo === "function" ? sec("historia", "Linha do tempo", "A história do PPGAU UNIVAG ano a ano, de 2018 até as metas de 2028, com a fonte de cada marco.", historiaCorpo()) : ""}
    ${sec("capes", "Avaliação CAPES 2021–2024", "Resultado oficial da Quadrienal 2025, linha de base para medir o avanço no ciclo 2025–2028.", `
      <div class="escala"><p>Clique em um item para ver o que ele avalia, como a comissão justificou o conceito e onde ele aparece na ficha de 2025–2028.</p><p class="small muted">Conceitos, do maior para o menor: Muito Bom, Bom, Regular, Fraco e Insuficiente. O peso indica quanto o item conta no conceito do quesito.</p></div>
      ${BASE.quesitos.map(q => `<div class="qpanel">
        <div class="qhead"><span class="qn">${q.id}</span><div class="qt"><span>Quesito ${q.id}</span><strong>${esc(q.nome)}</strong></div><span class="badge ${CPILL[q.conceito]}">${esc(q.conceito)}</span></div>${q.desc ? `<p class="qdesc">${esc(q.desc)}</p>` : ""}
        ${q.itens.map(([id, nm, c]) => { const e = BASE.explica[id] || {}; return `<details class="itd"><summary><span class="iid">${id}</span><span class="nm">${esc(nm)}${e.peso ? `<small>peso ${e.peso}%</small>` : ""}</span><span class="badge ${CPILL[c]}">${esc(c)}</span><span class="chev" aria-hidden="true"></span></summary>
          <div class="exp">${BASE.guia[id] ? `<div class="guia"><div><span class="dim">O que este item avalia</span><p>${esc(BASE.guia[id][0])}</p></div><div class="nv"><span class="dim">Na ficha 2025–2028</span><p>${esc(BASE.guia[id][1])}</p></div></div>` : ""}<span class="dim jt">Justificativa da comissão em 2021–2024</span>${e.txt ? `<p>${esc(e.txt)}</p>` : ""}${(e.sub || []).map(([sid, sc, st]) => `<div class="sub"><span class="sid">${esc(sid)}</span><span class="stx">${esc(st)}</span><span class="badge sm ${CPILL[sc]}">${esc(sc)}</span></div>`).join("")}</div></details>`; }).join("")}
      </div>`).join("")}
      ${BASE.destaques.length ? `<div class="card"><div class="dim">O que a comissão apontou</div><ul class="lst">${BASE.destaques.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div>` : ""}`)}
    ${sec("docentes", "Corpo docente", "Quem são os docentes do programa e os números declarados à CAPES.", st.docente && typeof fichaDocente === "function" ? fichaDocente(st.docente) : `
      <div class="perfil">${BASE.perfil.map(([v, t]) => `<div><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join("")}</div>
      <div class="card"><div class="dim" style="margin-bottom:4px">Docentes do programa</div><p class="small muted" style="margin:0 0 12px">Clique em um docente para abrir a ficha completa, com formação, atuação por ano, orientações e lista de artigos. Artigos 2021–2024: Coleta CAPES; desde 2025: OpenAlex, pelo ORCID.</p><div class="doc-g">${BASE.corpo.map(([n, t, l, o, f]) => `<div class="doc" role="button" tabindex="0" data-doc="${esc(n)}" title="Abrir a ficha de ${esc(n)}"><span class="av" aria-hidden="true">${esc(n.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join(""))}${f ? `<img src="${f}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}</span><div><strong>${esc(n)}</strong><span class="small muted">${esc(t)}</span>${(() => { const d = BASE.indDoc[n]; if (!d) return ""; const g = d[2] ? BASE.grupos[d[2] - 1][0] : ""; return `<span class="dmeta">${vincDoc(n).txt}</span><span class="dsrc">${vincDoc(n).fonte}</span>${g ? `<span class="gchip">${esc(g.length > 52 ? g.slice(0, 50).replace(/\s\S*$/, "") + "…" : g)}</span>` : ""}${(() => { const y = BASE.anoDoc[n], a25 = BASE.ar2025[n], soma = a => a.reduce((x, v) => x + (v || 0), 0); return `<div class="dnum3">${[[y ? soma(y.ar) : "–", "artigos 2021–24"], [a25 ?? "–", "artigos desde 2025"], [typeof primeiro === "function" ? BASE.andamento.filter(x => x[1] === primeiro(n)).length : "–", "orientandos hoje"]].map(([v, r]) => `<span><b>${v}</b><i>${r}</i></span>`).join("")}</div>`; })()}`; })()}<span class="dl"><span class="fic">Ver ficha completa →</span><a href="${l}" target="_blank" rel="noopener">Lattes</a>${o ? `<a href="${o}" target="_blank" rel="noopener">ORCID</a>` : ""}</span></div></div>`).join("")}</div><p class="fonte">Nomes, titulação e fotos: site do programa (univag-ppgau.com/corpo-docente), outubro de 2026. Números: relatórios enviados ao Coleta CAPES de 2021 a 2024; o professor Flávio Foguel ainda não aparece nesses relatórios. Uma docente aparece com mais de 40% dos projetos e das publicações, ponto que a ficha avalia pela distribuição entre os docentes.</p></div>
      <div class="cols">${serieCard("permanentes", "Docentes permanentes")}${serieCard("turmas", "Permanentes com disciplina no ano")}${serieCard("projetos", "Projetos de pesquisa")}</div>`)}
    ${sec("formacao", "Ingresso e titulação dos mestres", "Do processo seletivo à defesa: vagas, matrículas, bolsas, tempo até o título e dissertações defendidas, de 2021 a 2026.", `
      <div class="perfil">${[["38", "ingressantes de 2021 a 2024, 18 só em 2024"], ["17", "mestres titulados no quadriênio, todos com dissertação em português"], ["38 meses", "tempo médio até a defesa em 2024, acima dos 24 meses previstos"], ["1", "abandono registrado no quadriênio, em 2023"]].map(([v, t]) => `<div><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join("")}</div>
      <div class="card"><div class="dim" style="margin-bottom:10px">Processo seletivo</div><div class="tbl"><table><thead><tr><th>Ano</th><th>Vagas</th><th>Inscritos</th><th>Aprovados</th><th>Inscritos por vaga</th></tr></thead><tbody>${BASE.selecao.map((x, i) => `<tr><td>${BASE.anos[i]}</td><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${(x[1] / x[0]).toFixed(1).replace(".", ",")}</td></tr>`).join("")}</tbody></table></div><p class="fonte">Proposta do programa no Coleta. A procura triplicou de 2021 a 2024; em 2021 houve menos inscritos que vagas.</p></div>
      <div class="cols">${serieCard("matriculados", "Discentes matriculados")}${serieCard("titulados", "Mestres titulados")}${serieCard("tempo", "Tempo médio até a defesa (meses)")}${serieCard("bolsas", "Bolsistas CAPES")}${serieCard("ic", "Iniciação científica nos projetos")}<div class="card"><div class="dim">Defesas por orientador(a), 2021–2024</div><div style="margin-top:12px">${hbarras([["Angelo Palmisano", 4, "b"], ["Jeane A. R. de Godoy", 3, "b"], ["Antonio Busnardo Filho", 2, "b"], ["Maira Vieira Dias", 2, "o"], ["Outros 6 docentes", 6, "o"]])}</div><p class="fonte">Em cinza, docentes que já deixaram o programa ou orientaram uma defesa cada (Manoel Lemes, Antonio Soukef, Humberto Metello, Rosana Ravache, Diana de Paula e Rodrigo Lima).</p></div></div>
      <div class="card"><div class="dim" style="margin-bottom:10px">Dissertações defendidas, 2021–2026</div>${[...BASE.anos, "2025", "2026"].reverse().map(a => `<details class="dis" ${a === "2025" ? "open" : ""}><summary><b>${a}</b><span class="small muted">${BASE.dissertacoes.filter(d => d[0] === a).length} defesas</span></summary><ol>${BASE.dissertacoes.filter(d => d[0] === a).map(d => `<li><strong>${d[5] ? `<a href="${d[5]}" target="_blank" rel="noopener">${esc(d[4])} ↗</a>` : esc(d[4])}</strong><span class="small muted">${esc(d[2])} · orientação de ${esc(d[3])} · defesa ${d[1] ? `em ${esc(d[1])}/${a}` : `em ${a}`}</span></li>`).join("")}</ol></details>`).join("")}<p class="fonte">2021–2024: Coleta CAPES, módulo Trabalhos de Conclusão. 2025: site do programa. Os títulos levam ao texto no Repositório Digital do UNIVAG. A comissão de área pediu que 4 dissertações sejam destacadas com justificativa e que o programa informe prêmios e distinções.</p></div>`)}
    ${typeof pessoasCorpo === "function" ? sec("pessoas", "Discentes, egressos e pós-doutorandos", "Quem está no programa e quem já passou por ele, com a orientação e os trabalhos publicados de cada um.", pessoasCorpo()) : ""}
    ${sec("producao", "Produção intelectual", "Organizada em abas: a produção bibliográfica e a produção técnica dos docentes, por categoria e ano, lidas nos currículos Lattes; e os indicadores da CAPES por quadriênio.", (typeof prodJanelas === "function" ? prodJanelas : x => x)(`
      <div class="perfil">${[["519", "registros de produção de 2021 a 2024"], ["2,9×", "produção total de 2024 (265) em relação a 2021 (90)"], ["13×", "artigos em periódicos: de 6 em 2021 para 80 em 2024"], ["36%", "dos artigos com discentes ou egressos entre os autores"]].map(([v, t]) => `<div><b>${esc(v)}</b><span>${esc(t)}</span></div>`).join("")}</div>
      <div class="card"><div class="dim">Evolução anual da produção, 2021–2024</div><p class="small muted" style="margin:4px 0 8px">Número de registros por ano. A queda de 2022 coincide com a saída dos docentes da PUC-Campinas; o salto de 2024, com a entrada de seis novos docentes.</p>${graficoLinhas([["Total", [90, 61, 103, 265], "c0"], ["Bibliográfica", [29, 13, 48, 179], "c1"], ["Técnica", [60, 47, 55, 86], "c2"], ["Artigos", [6, 8, 23, 80], "c3"]], BASE.anos)}<div class="tbl" style="margin-top:8px"><table><thead><tr><th>Tipo</th>${BASE.anos.map(a => `<th>${a}</th>`).join("")}<th>Variação 2021→2024</th></tr></thead><tbody>${[["Artigos em periódicos", 6, 8, 23, 80], ["Livros e capítulos", 7, 2, 6, 43], ["Trabalhos em anais", 16, 2, 19, 53], ["Produção técnica", 60, 47, 55, 86], ["Total", 90, 61, 103, 265]].map(r => `<tr${r[0] === "Total" ? ' class="tot"' : ""}><td>${r[0]}</td>${r.slice(1).map(v => `<td>${v}</td>`).join("")}<td>${r[4] >= r[1] ? "+" : ""}${Math.round((r[4] / r[1] - 1) * 100)}%</td></tr>`).join("")}</tbody></table></div></div>
      <div class="card"><div class="dim">O que foi publicado de 2021 a 2024, por tipo</div><p class="small muted" style="margin:4px 0 14px">519 registros no quadriênio: 269 bibliográficos, 248 técnicos e 2 artísticos.</p>${hbarras(BASE.tipos)}<div class="leg"><span><i class="b"></i>Bibliográfica</span><span><i class="t"></i>Técnica</span><span><i class="o"></i>Outros</span></div><p class="fonte">Relatórios enviados ao Coleta CAPES, 2021 a 2024. As contagens incluem registros duplicados encontrados nos relatórios (49 títulos repetidos no mesmo ano).</p></div>
      <div class="card"><div class="dim">Produção bibliográfica por ano e tipo</div>${pilha(BASE.pilha, BASE.anos)}<p class="fonte">Em 2024 a produção bibliográfica quase quadruplicou, com a entrada de novos docentes.</p></div>
      <div class="cols">${serieCard("artigos", "Artigos em periódicos")}${serieCard("coautoria", "Artigos com discentes ou egressos")}${serieCard("tecnica", "Produção técnica")}</div>${typeof qualisBloco === "function" ? qualisBloco() : ""}`))}
    ${typeof impactoCorpo === "function" ? sec("impacto", "Impacto na sociedade", "Projetos de pesquisa e extensão, prêmios, mídia, eventos e parcerias que mostram o efeito do programa fora da universidade.", impactoCorpo()) : ""}
    ${sec("autoavaliacao", "Autoavaliação", "Questionários de 2026 para estudantes, docentes, pós-doutorandos, egressos, equipe técnica e gestão.", `
      <div class="card">${resp ? barras(PUBLICOS.map(p => ({ label: p.nome, n: nPub(p.id) })), resp) : `<p class="muted" style="margin:0">Ainda não há respostas. Os resultados aparecem aqui e na aba Resultados à medida que os questionários são enviados.</p>`}
        <div class="row" style="margin-top:14px"><button class="btn primary" data-goto="responder">Responder à autoavaliação</button><button class="btn" data-goto="resultados">Ver resultados</button></div></div>`)}
    ${sec("fontes", "Fontes", "Documentos e bases de onde vêm os números desta página, com a origem de cada um, para auditoria.", `
      <div class="card"><div style="overflow-x:auto"><table class="ftab"><thead><tr><th>Fonte</th><th>De onde foi extraída</th><th>O que alimenta no portal</th><th>Data</th></tr></thead><tbody>${BASE.fontes.map(([n, o, l, u, d]) => `<tr><td><strong>${l ? `<a href="${esc(l)}" target="_blank" rel="noopener">${esc(n)} ↗</a>` : esc(n)}</strong></td><td>${esc(o)}</td><td>${esc(u)}</td><td class="nw">${esc(d)}</td></tr>`).join("")}</tbody></table></div><p class="fonte">Lista mantida para a auditoria dos dados: cada número do portal vem de uma destas fontes, indicada também abaixo de cada gráfico.</p></div>`)}
    </div>`;
  $view.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => { st.tab = b.dataset.goto; render(); window.scrollTo(0, 0); });
  $view.querySelectorAll("[data-vai-doc]").forEach(a => a.onclick = e => { e.preventDefault(); st.tab = "portal"; st.psec = "docentes"; st.pessoa = null; st.docente = a.dataset.vaiDoc; render(); const n = $view.querySelector(".pnav"); if (n) n.scrollIntoView(); });
  $view.querySelectorAll("[data-doc]").forEach(a => { const ir = e => { if (e.target.closest("a")) return; st.docente = a.dataset.doc || null; renderEmDados(); const n = $view.querySelector(".pnav"); if (n) n.scrollIntoView(); }; a.onclick = ir; a.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(e); } }; });
  $view.querySelectorAll("[data-pj]").forEach(b => b.onclick = () => { st.pjan = b.dataset.pj; renderEmDados(); });
  $view.querySelectorAll("[data-pjt]").forEach(b => b.onclick = () => { st.pjT = b.dataset.pjt; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pjs]").forEach(s => s.onchange = () => { st.pjS = s.value; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pjd]").forEach(s => s.onchange = () => { st.pjD = s.value; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pdoc-limpa]").forEach(b => b.onclick = () => { st.pdoc = ""; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pjd-limpa]").forEach(b => b.onclick = () => { st.pjD = ""; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  if (typeof ligarHistoria === "function") ligarHistoria($view);
  $view.querySelectorAll("[data-hcat]").forEach(b => b.onclick = () => { st.hcat = b.dataset.hcat; st.hano = null; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pt]").forEach(b => b.onclick = () => { st.ptipo = b.dataset.pt; renderEmDados(); });
  $view.querySelectorAll("[data-pdoc]").forEach(s => s.onchange = () => { st.pdoc = s.value; const y = window.scrollY; renderEmDados(); window.scrollTo(0, y); });
  $view.querySelectorAll("[data-pg]").forEach(b => b.onclick = () => { st.pgrupo = b.dataset.pg; st.pessoa = null; renderEmDados(); });
  $view.querySelectorAll("[data-pes]").forEach(b => b.onclick = () => { st.pessoa = b.dataset.pes || null; renderEmDados(); const n = $view.querySelector(".pgtabs"); if (n) n.scrollIntoView(); });
  $view.querySelectorAll("[data-ir]").forEach(a => a.onclick = () => { st.docente = null; st.pessoa = null; st.psec = a.dataset.ir; if (st.tab !== "portal") { st.tab = "portal"; render(); window.scrollTo(0, 0); return; } renderEmDados(); const n = $view.querySelector(".pnav"); if (n.getBoundingClientRect().top < 0) n.scrollIntoView(); });
}

// Vínculo, carga horária e ano de entrada de cada docente, com a fonte de cada dado.
// Carga horária: horas semanais no programa declaradas nos relatórios do Coleta CAPES (2024).
// Ano de entrada: primeiro relatório do Coleta 2021–2024 em que o docente aparece ("2021 ou antes" = já estava no relatório de 2021).
function vincDoc(n) {
  const d = BASE.indDoc[n] || [];
  const m = String(d[1] || "").match(/^(Permanente|Colaboradora?|Colaborador), (\d+) h/);
  if (!m) return { txt: "Entrou depois de 2024 · ainda não aparece no Coleta CAPES", fonte: "Fonte: site do programa (Corpo Docente), out/2026" };
  const desde = d[0] === "2021 ou antes" ? "desde 2021 ou antes" : `desde ${esc(d[0])}`;
  return { txt: `${esc(m[1])} · ${m[2]} h semanais no programa · ${desde}`, fonte: "Fontes: titulação, site do programa; categoria, horas e ano de entrada, relatórios do Coleta CAPES 2021–2024 (dados de 2024)" };
}
