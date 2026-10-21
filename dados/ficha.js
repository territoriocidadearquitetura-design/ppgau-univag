// Ficha de Avaliação — Programas Acadêmicos e Profissionais, subárea Arquitetura e Urbanismo,
// Área 29 (Arquitetura, Urbanismo e Design), quadriênio 2025–2028. Fonte: CAPES/DAV, "Fichas de
// Avaliação Acadêmico e Profissional — Arquitetura, Urbanismo e Design, referente ao quadriênio
// 2025-2028" e Documento de Área. Os textos abaixo resumem os fatores de cada subitem.
const REFERENCIA = {
  programa: "PPGAU/UNIVAG — Mestrado acadêmico em Arquitetura e Urbanismo",
  codigo: "50014013001P9",
  notaAtual: "3",
  cicloAvaliado: "2021–2024 (Quadrienal 2025)",
  cicloAtual: "2025–2028",
  porte: "até 20 docentes permanentes, só mestrado",
  fonte: "Ficha de Avaliação da Área 29 para o quadriênio 2025–2028 (subárea Arquitetura e Urbanismo) e Documento de Área. Nota vigente: Relatório da Quadrienal 2025, Anexo I."
};

const CONCEITOS = ["Muito bom", "Bom", "Regular", "Fraco", "Insuficiente"];

// Quantidades que o programa precisa destacar, para o porte do PPGAU/UNIVAG.
const DESTAQUES = [
  ["Dissertações destacadas (2.1.2)", "4"],
  ["Egressos com trajetórias relevantes (2.2.2)", "5"],
  ["Produções com discentes (2.3.1)", "5"],
  ["Produções com egressos (2.3.2)", "5"],
  ["Produções docentes, sem repetir docente (2.4.2)", "4"],
  ["Produtos para inovação e impacto (3.2 e 3.3)", "8"]
];

const FICHA = [
  { id: "1", nome: "Programa", desc: "Identidade, condições de funcionamento, autoavaliação e planejamento estratégico.", itens: [
    { id: "1.1", peso: 60, titulo: "Identidade e condições de funcionamento: missão, corpo docente, infraestrutura, articulação entre áreas de concentração, linhas e projetos, e estrutura curricular",
      subitens: [
        ["1.1.1", 40, "Missão, identidade e objetivos: inserção na instituição; identidade reconhecível nas áreas e linhas; aderência entre área, linhas e proposta curricular; integralização compatível; coesão dos projetos docentes com as linhas; aproveitamento e creditação de atividades; consonância com a subárea AU, o nível e a modalidade. Qualitativo."],
        ["1.1.2", 50, "Corpo docente: todos os permanentes em projetos vinculados às linhas; ≥20% em redes nacionais ou internacionais; ≥60% com orientação concluída no quadriênio; ≥60% com orientação em andamento ao final; ≥50% com ao menos uma disciplina por ano; mínimo de 10 permanentes (8 em casos de assimetria regional); ≥70% permanentes e ≤30% colaboradores; ≤30% em outros programas (até 3); ≥70% em dedicação integral; ≥70% com 20 h semanais no programa. Os tópicos sobre proporção de permanentes, outros programas e dedicação integral são pré-requisito para Muito Bom. Quantitativo, estratificado pela distribuição."],
        ["1.1.3", 10, "Infraestrutura: laboratórios, acervos, salas com audiovisual, internet e sistemas acadêmicos, internos ou externos. A acessibilidade de todos os fatores é pré-requisito para Muito Bom."]],
      evid: ["cadastro-docentes", "lattes-docentes", "questionarios-organizacao", "questionarios-infra"] },
    { id: "1.2", peso: 20, titulo: "Princípios, procedimentos e usos dos resultados da autoavaliação alinhados ao planejamento estratégico",
      subitens: [
        ["1.2.1", 60, "Princípios e procedimentos: objetivos claros; métodos quantitativos, qualitativos e participativos explícitos; etapas e comissão definidas; alinhamento à autoavaliação da IES; consonância com o planejamento do programa e da área."],
        ["1.2.2", 40, "Impacto da autoavaliação: implantação; sistematização e análise dos resultados; divulgação; incorporação ao planejamento estratégico; monitoramento."]],
      evid: ["autoavaliacao"] },
    { id: "1.3", peso: 20, titulo: "Planejamento estratégico articulado ao PDI, incluindo políticas afirmativas e de promoção de equidade",
      subitens: [
        ["1.3.1", 10, "Consonância com o PDI: perfil institucional, PPI, posição do programa na estrutura, na infraestrutura e nas políticas de pós-graduação da IES."],
        ["1.3.2", 40, "Atividades formativas previstas no PE: conjunto apresentado, alinhamento ao perfil do egresso, interdisciplinaridade, vínculo com pesquisa e extensão, interação com o campo profissional."],
        ["1.3.3", 20, "Ações afirmativas e equidade: políticas e iniciativas; ações no processo seletivo; acompanhamento da permanência; ações afirmativas em bolsas e oportunidades; ações compensatórias para mães e parentalidade."],
        ["1.3.4", 30, "Atuação local, regional, nacional ou internacional no PE: visibilidade; atuação nos escopos de inserção; acompanhamento de desempenho; alinhamento às diretrizes institucionais; redes e parcerias com IES e setores não acadêmicos."]],
      evid: ["questionarios-permanencia", "questionarios-gestao"] }
  ]},
  { id: "2", nome: "Formação e produção intelectual", desc: "Dissertações, egressos e a produção intelectual de discentes, egressos e docentes.", itens: [
    { id: "2.1", peso: 25, titulo: "Qualidade das dissertações e adequação às áreas de concentração e linhas",
      subitens: [
        ["2.1.1", 30, "Percentual de dissertações que resultaram em produção intelectual (bibliográfica, técnica ou artística). Quantitativo."],
        ["2.1.2", 50, "Análise qualitativa de 4 dissertações destacadas: contribuição à subárea; aderência à área, linha e projeto; impacto e relevância econômica e social; produção associada; indicação ou premiação."],
        ["2.1.3", 20, "Avaliações externas: inscrição e seleção em concursos e prêmios; citações externas ou em políticas públicas; finalistas; distinções e premiações."]],
      evid: ["producao-dissertacao"] },
    { id: "2.2", peso: 20, titulo: "Destino e atuação dos egressos em relação à formação recebida",
      subitens: [
        ["2.2.1", 40, "Interação sistemática com egressos: dados atualizados e monitoramento da produção; canais ativos; egressos e dissertações acessíveis no site; ações voltadas aos egressos; outras formas de interação."],
        ["2.2.2", 60, "Justificativa de 5 egressos com trajetórias mais relevantes e o papel da formação no destino, atuação e impacto."]],
      evid: ["questionarios-egressos"] },
    { id: "2.3", peso: 20, titulo: "Qualidade da produção intelectual de discentes e egressos",
      subitens: [
        ["2.3.1", 60, "5 produções destacadas com participação de discentes: publicadas; identidade com área e linha; coesão com o projeto do docente; estratos superiores; impacto ou relevância econômica ou social."],
        ["2.3.2", 40, "5 produções destacadas com participação de egressos, pelos mesmos fatores."]],
      evid: ["producao-discentes"] },
    { id: "2.4", peso: 35, titulo: "Qualidade das atividades de pesquisa e da produção intelectual do corpo docente",
      subitens: [
        ["2.4.1", 50, "Percentual de permanentes que coordenam projetos de pesquisa vinculados ao programa, com participação discente e financiamento interno ou externo. Quantitativo."],
        ["2.4.2", 50, "4 produções docentes destacadas, sem repetir docente: estratos superiores; coesão com o projeto do docente; identidade com área e linha; impacto ou relevância econômica ou social; premiação ou reconhecimento. Fatores da produção bibliográfica no Documento de Área: avanço conceitual, inovação, participação de discentes e egressos, selo diamante, índice H5 do Google Scholar e indexação (WoS, SciELO, Scopus, Latindex, DOAJ, Redalyc, Diadorim, MIAR, OpenAlex)."]],
      evid: ["producao-docentes", "lattes", "lattes-docentes"] }
  ]},
  { id: "3", nome: "Impacto (local, regional, nacional, internacional)", desc: "Inserção e visibilidade, inovação e transferência de conhecimento, e impactos para a sociedade.", itens: [
    { id: "3.1", peso: 30, titulo: "Inserção, visibilidade e popularização da ciência",
      subitens: [
        ["3.1.1", 35, "Internacionalização: estrangeiros matriculados ou visitantes, acordos; projetos com financiamento ou equipes internacionais; publicações em língua estrangeira e coautorias estrangeiras; mobilidade docente e atuação no exterior; mobilidade discente."],
        ["3.1.2", 35, "Inserção no cenário brasileiro: alunos da missão local e regional; projetos com outras IES e redes; coautoria com outras IES; atuação acadêmica em outras IES; mobilidade discente nacional."],
        ["3.1.3", 30, "Visibilidade: site e redes com linhas, estrutura curricular, docentes com Lattes, Google Acadêmico e ORCID, editais, relatório de autoavaliação e PE, dissertações on-line, acessibilidade e outros idiomas, divulgação de produtos e popularização da ciência."]],
      evid: ["producao-coautoria"] },
    { id: "3.2", peso: 35, titulo: "Inovação, transferência e compartilhamento de conhecimento",
      subitens: [
        ["3.2.1", 30, "Inovação em produtos, serviços ou processos (8 produtos destacados): teoria e prática; abordagens interdisciplinares; avanço teórico, metodológico ou aplicado; inovações; novo produto ou aperfeiçoamento."],
        ["3.2.2", 25, "Contribuição à sociedade e valorização do projeto: teoria e crítica do ambiente construído e do projeto; metodologia de projeto; planos e projetos de paisagem, cidade e edifício; patentes e bens intangíveis."],
        ["3.2.3", 25, "Incorporação pela sociedade: parcerias com empresas e governo; assessoria a comunidades e ONGs; tecnologia social; arranjos produtivos locais."],
        ["3.2.4", 20, "Reconhecimento: mídia, aulas magnas em outras IES, palestras, prêmios, homenagens."]],
      evid: ["producao-tecnica"] },
    { id: "3.3", peso: 35, titulo: "Impactos do programa para a sociedade",
      subitens: [
        ["3.3.1", 25, "Impacto econômico e sociocultural: tecnologias para melhoria das condições de vida; políticas públicas; extensão e cooperação; presença social e na mídia; atuação em setores não acadêmicos."],
        ["3.3.2", 25, "Impacto educacional: integração com outros níveis de ensino e com a sociedade; produção técnica de apoio escolar; espaços educativos; educação urbana."],
        ["3.3.3", 25, "Impacto artístico e cultural: atividades artísticas; curadoria e museografia; representações bi e tridimensionais; processos artísticos de pesquisa; atividades culturais em AU."],
        ["3.3.4", 25, "Impacto técnico e tecnológico: métodos e produtos de impacto; tecnologias sociais e assistência técnica; técnicas inovadoras; sustentabilidade."]],
      evid: ["producao-tecnica", "questionarios-egressos-impacto"] }
  ]}
];
