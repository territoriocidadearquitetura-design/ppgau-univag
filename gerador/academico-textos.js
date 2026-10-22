// Textos transcritos dos documentos da coordenação (Orientações para qualificação, Orientações para defesa,
// Estrutura curricular, Créditos e Disciplinas), enviados pela usuária em 22/10/2026.
// Cada seção: [id, título, blocos]. Bloco: texto = parágrafo; ["ul", ...itens] = lista; ["obs", ...itens] = observação;
// ["h3", texto] = subtítulo. Item de lista pode ser [texto, [subitens]].
const li = x => Array.isArray(x) ? `<li>${x[0]}<ul>${x[1].map(y => `<li>${y}</li>`).join("")}</ul></li>` : `<li>${x}</li>`;
const bloco = b => typeof b === "string" ? `<p>${b}</p>`
  : b[0] === "ul" ? `<ul class="tx-lista">${b.slice(1).map(li).join("")}</ul>`
  : b[0] === "obs" ? `<div class="tx-obs"><b>Observação</b><ul>${b.slice(1).map(li).join("")}</ul></div>`
  : b[0] === "h3" ? `<h3>${b[1]}</h3>` : "";
const secoes = S => S.map(([id, t, B]) => `<section class="blk tx" id="${id}"><h2>${t}</h2>${B.map(bloco).join("")}</section>`).join("");
const sumario = S => `<ul class="sub">${S.map(([id, t]) => `<li><a href="#${id}">${t.replace(/^[IVX]+\. /, "")}</a></li>`).join("")}</ul>`;

const BANCA = [
  "A Comissão Julgadora deverá ser composta pelo Orientador, que preside a banca e mais dois membros, no mínimo, com o título de Doutor. O segundo membro titular deve ser do Programa e o terceiro membro titular deve ser externo.",
  ["ul", "O Orientador participará da Comissão Julgadora como presidente, mas não será membro examinador (sem direito a voto).", "Somente poderão compor a banca aqueles que além de possuírem título de doutor também tiverem vínculo com programas de <em>stricto sensu</em>."],
  "É responsabilidade do Orientador solicitar a aprovação da Comissão Julgadora. Para tanto, o Orientador deverá encaminhar para o e-mail da coordenação do curso o formulário com a INDICAÇÃO DE NOMES PARA A COMISSÃO JULGADORA (Apêndice C)."];
const CEP = [
  "É responsabilidade do aluno declarar a Autorização do Comitê de Ética em Pesquisa (CEP), caso o trabalho tenha sido submetido ao mesmo.",
  "A declaração deve ser realizada até o momento da solicitação da Comissão Julgadora e o aluno deverá enviar para o e-mail da coordenação os seguintes documentos:",
  ["ul", "A Autorização do CEP para a realização da pesquisa;", "A aprovação dos relatórios de pesquisa submetidos ao CEP;", "A inexistência de pendências junto ao CEP."]];
const TURNITIN = "Relatório de originalidade e similaridade do Turnitin indicando até 24% de similaridade para liberação do agendamento. Relatórios com indicação entre 25 e 49% deverão ser acompanhados de uma justificativa do Orientador, que será analisada pela coordenação do Programa e somente após análise, o agendamento será realizado";
const SERVIDORES = "É importante lembrar que os servidores não podem exercer atividades administrativas e de magistério nos períodos de férias, licença e afastamento.";
const ONLINE = x => `Em situações em que o ${x} ocorrer de forma online, fica a cargo do Orientador o agendamento da sala virtual e o envio do convite com o link de acesso à plataforma para os membros da banca.`;
const REVISAO = x => ["Revisar a ortografia e o atendimento às exigências da Língua Portuguesa;", "Verificar a numeração das páginas e a compatibilidade do Sumário com a paginação do documento;", "Verificar o tamanho e a fonte utilizada nas notas de rodapé;", "Examinar a qualidade gráfica do trabalho (tamanho e qualidade das imagens, gráficos, mapas, etc.; escolha apropriada das cores; adequação de brilho e contraste; inserção de legendas e elementos de marcação, etc.);"];
const QUALIDADE = "qualidade gráfica do trabalho (tamanho e qualidade das imagens, gráficos, mapas, etc.; escolha apropriada das cores; adequação de brilho e contraste; inserção de legendas e elementos de marcação, etc.)";

const QUALI = [
  ["etapas", "Etapas do agendamento", [
    "O Exame de Qualificação tem como objetivo avaliar o conhecimento do aluno em relação ao seu tema de pesquisa e sua capacidade em executar o seu projeto de pesquisa.",
    "Todo aluno deverá se submeter ao Exame de Qualificação, que deverá ocorrer entre o 12º (décimo segundo) e o 18º (décimo oitavo) mês, após o cumprimento de no mínimo:",
    ["ul", "06 créditos em disciplinas obrigatórias;", "09 créditos em disciplinas eletivas;", "04 créditos em seminários avançados em pesquisa e dissertação."],
    "É de responsabilidade do aluno a inscrição no Exame de Qualificação dentro do prazo estabelecido pelo Programa.",
    "O Exame de Qualificação só poderá ser realizado após a comprovação da proficiência em língua estrangeira.",
    ["obs", "O aluno que não realizar o Exame de Qualificação no período previsto será desligado do Programa.", "Caso seja reprovado, o aluno poderá se submeter a um novo exame, que deverá ser realizado no prazo de 30 dias após a realização do primeiro exame.", "O aluno que for reprovado duas vezes no Exame de Qualificação será desligado do Programa."]]],
  ["proficiencia", "I. Exame de Proficiência em Língua Estrangeira", [
    "Os alunos deverão apresentar certificado de proficiência em língua estrangeira até o pedido do Exame de Qualificação.",
    "Serão aceitos certificados de proficiência nas línguas: inglesa, espanhola, francesa ou italiana.",
    "Serão aceitos certificados de proficiência emitidos pelo Centro de Idiomas UNIVAG e outros cursos com certificação reconhecida.",
    "Caso ainda não possua certificado, é dever do aluno solicitar o exame de proficiência junto à Secretaria da Pós-Graduação, no mínimo, 45 dias antes do prazo previsto para o Exame de Qualificação."]],
  ["comissao", "II. Aprovação da Comissão Julgadora", [...BANCA,
    "A sessão de Qualificação será fechada, podendo participar apenas o Orientador, o aluno e os membros da Comissão Julgadora."]],
  ["cep", "III. Declaração de Autorização do Comitê de Ética em Pesquisa", CEP],
  ["agendamento", "IV. Agendamento do Exame de Qualificação", [
    "Após a aprovação da Comissão Julgadora, é dever do aluno contatar o Orientador para as providências de agendamento, tais como: definição de data, horário e convites iniciais aos membros a serem feitos pelo Orientador.",
    "O aluno deverá encaminhar e-mail para a coordenação com antecedência mínima de <b>30 dias</b> da data prevista para o Exame de Qualificação, com o assunto <b>AGENDAMENTO DE EXAME - NOME DO ALUNO</b>, com os seguintes dados:",
    ["ul", "Nome completo, Instituição, Currículo Lattes, telefone e e-mail dos membros da banca;", TURNITIN + "."],
    "O e-mail deverá seguir com cópia para o Orientador e todos os membros da banca já devem ter sido convidados.",
    SERVIDORES,
    "O aluno deve obrigatoriamente consultar o Orientador sobre os prazos para envio do Memorial de Qualificação para a coordenação do Programa. Caso haja necessidade de versão impressa, o aluno será responsável pela impressão e pelo envio do documento ao(s) membro(s) da banca.",
    "Somente após o cumprimento destes requisitos a coordenação enviará a carta convite oficial e o Memorial de Qualificação para os membros da banca.",
    "A dilatação do prazo da entrega do Memorial de Qualificação poderá ser solicitada apenas em casos excepcionais, através de justificativa assinada pelo aluno e pelo Orientador a ser aprovada pelo Conselho do Programa."]],
  ["dia", "V. Para o dia do Exame de Qualificação", [
    ONLINE("Exame de Qualificação"),
    "O Orientador é responsável pela abertura da banca, pelo preenchimento da Ata e leitura do documento ao final do Exame de Qualificação.",
    "Cabe ao aluno preparar a apresentação para o Exame de Qualificação, cuja exposição oral terá duração mínima de 30 e máxima de 40 minutos, sendo seguida de arguição pela Comissão Julgadora.",
    "A Ata do Exame de Qualificação deverá ser assinada pela Comissão Julgadora, pelo Orientador e pelo aluno. O documento deve conter o título do trabalho em português, nome e instituição dos membros da Comissão Julgadora, do aluno e do Orientador.",
    "Cabe ao Orientador preencher corretamente os campos da Ata do Exame de Qualificação, indicando se o aluno foi aprovado, aprovado com restrições ou reprovado."]],
  ["memorial", "VI. Memorial de Qualificação", [
    "O Memorial de Qualificação deve ser formatado segundo as normas do Programa e da ABNT e ter passado por revisão ortográfica.",
    "A folha de rosto deve conter o nome do candidato, o título do trabalho, o nível (Mestrado), a linha de pesquisa, o nome do Orientador e a data.",
    "O Sumário deve conter os números das páginas de acordo com os itens que compõem o Memorial de Qualificação.",
    "O Memorial de Qualificação deve ser estruturado em duas partes, a saber:",
    ["h3", "Parte 1. Atividades Acadêmicas"],
    ["ul", "Título, Resumo e Abstract;", "Informações sobre as disciplinas cursadas, o conceito obtido e as contribuições destas na pesquisa e formação do aluno;", "Participação em grupos de pesquisa, eventos e sua importância no percurso acadêmico do aluno;", "Publicação de textos durante o curso;", "Dificuldades encontradas e alterações realizadas no projeto de pesquisa proposto;", "Cronograma de execução das atividades."],
    ["h3", "Parte 2. Versão Preliminar da Dissertação"],
    ["ul", "Introdução e problemática da pesquisa;", "Justificativa;", "Objetivo Geral e Objetivos Específicos;", "Procedimentos Metodológicos;", "Desenvolvimento de pelo menos dois capítulos completos da Revisão bibliográfica;", "Resumo do conteúdo dos capítulos a serem desenvolvidos e indicação da bibliografia;", "Referências bibliográficas."]]],
  ["aluno", "VII. Atribuições do Aluno para o Exame de Qualificação", [
    ["ul", "Verificar os prazos para a inscrição no Exame de Qualificação;", "Apresentar certificado/solicitar exame de proficiência em língua estrangeira;", "Declarar a Autorização do CEP, caso o trabalho tenha sido submetido ao mesmo;",
      "Contatar o Orientador para as providências de agendamento do Exame de Qualificação, tais como: definição de data, horário e convites iniciais aos membros a serem feitos pelo Orientador;",
      ["Encaminhar e-mail para a coordenação com antecedência mínima de 30 dias da data prevista para o Exame de Qualificação, com o assunto AGENDAMENTO DE EXAME - NOME DO ALUNO, contendo:", ["Os dados dos membros da banca (Nome completo, Instituição, Currículo Lattes, telefone e e-mail);", "Relatório de originalidade e similaridade do Turnitin indicando a similaridade para liberação do agendamento do Exame de Qualificação. Nos casos em que o índice estiver acima do recomendado pelo software deve ser encaminhada uma justificativa do Orientador."]],
      "Estar ciente dos prazos de envio do Memorial de Qualificação para a coordenação do Programa;", "Formatar o Memorial de Qualificação segundo as normas do Programa e da ABNT;", ...REVISAO(),
      "Imprimir e enviar versão impressa do Memorial de Qualificação quando solicitado pelos membros da banca;", "No dia do Exame de Qualificação, verificar se os dados contidos na Ata do Exame de Qualificação estão corretos;", "Assinar a Ata do Exame de Qualificação."]]],
  ["orientador", "VIII. Atribuições do Orientador para o Exame de Qualificação", [
    ["ul", "Contatar e convidar os membros que irão compor a Comissão Julgadora;", "Solicitar a aprovação da Comissão Julgadora para o Exame de Qualificação através do formulário com a INDICAÇÃO DE NOMES PARA A COMISSÃO JULGADORA, que deverá ser enviado para o e-mail da coordenação do curso;", "Emitir relatório de originalidade e similaridade no Turnitin;", "Apresentar justificativa caso o relatório de originalidade e similaridade do Turnitin indique de 25 a 49% de similaridade;", "Agendar a sala virtual e enviar o link de acesso para os membros da banca, quando o Exame de Qualificação ocorrer de forma online;", "Verificar se o Memorial de Qualificação segue a formatação exigida pelo Programa e as normas da ABNT;", "Fazer a correção do documento, indicando os ajustes em relação à estrutura do trabalho, conteúdo, ortografia e gramática;", `Avaliar a ${QUALIDADE} e apontar correções;`, "Indicar materiais e equipamentos necessários para o Exame de Qualificação, caso este ocorra de forma presencial;", "Verificar se os dados contidos na Ata do Exame de Qualificação estão corretos;", "Presidir a banca;", "Preencher a Ata do Exame de Qualificação, indicando se o aluno foi aprovado, aprovado com restrições ou reprovado;", "Fazer a leitura da Ata ao final do Exame de Qualificação;", "Assinar a Ata do Exame de Qualificação e recolher as demais assinaturas;", "Enviar o número do CPF dos membros da banca para a coordenação do Programa."]]]
];

const DEFESA = [
  ["etapas", "Etapas do agendamento", [
    "A solicitação do exame de Defesa da Dissertação de Mestrado está condicionada ao cumprimento dos seguintes requisitos para os alunos:",
    ["ul", "Ter cumprido os créditos exigidos, conforme as exigências do Programa;", "Não ter nenhuma pendência registrada no Histórico Escolar, bem como quanto à entrega de documentação junto ao Programa."],
    ["obs", "Na existência de qualquer pendência no Histórico Escolar, o exame de Defesa não será agendado.", "Caso tenha sido/seja bolsista, deve-se, obrigatoriamente, mencionar a agência de fomento que financiou/financia as atividades da pesquisa, integral ou parcialmente."]]],
  ["comissao", "I. Aprovação da Comissão Julgadora", BANCA],
  ["cep", "II. Declaração de Autorização do Comitê de Ética em Pesquisa", CEP],
  ["agendamento", "III. Agendamento do Exame de Defesa", [
    "Após a aprovação da Comissão Julgadora, é dever do aluno contatar o Orientador para as providências de agendamento, tais como: definição de data, horário e convites iniciais aos membros a serem feitos pelo Orientador.",
    "O aluno deverá encaminhar e-mail para a coordenação com antecedência mínima de <b>45 dias</b> da data prevista para o exame de Defesa, com o assunto <b>LIBERAÇÃO DE DEFESA - NOME DO ALUNO</b>, com os seguintes dados:",
    ["ul", "Nome completo, Instituição, Currículo Lattes, telefone e e-mail dos membros da banca;", TURNITIN + ";", "O Currículo Lattes atualizado do aluno, constando os artigos já publicados exigidos para a defesa e/ou cópia da resposta oficial do periódico, em meio impresso ou eletrônico, do recebimento da submissão ou aceite para publicação;", "Os artigos publicados, submetidos ou aprovados para publicação, em formato pdf."],
    "O e-mail deverá seguir com cópia para o Orientador e todos os membros da banca já devem ter sido convidados.",
    SERVIDORES,
    "O aluno deve obrigatoriamente consultar o Orientador sobre os prazos para envio do exemplar de Defesa para a coordenação do Programa. Caso haja necessidade de versão impressa, o aluno será responsável pela impressão e pelo envio do documento ao(s) membro(s) da banca.",
    "Somente após o cumprimento destes requisitos a coordenação enviará a carta convite oficial e o exemplar de Defesa para os membros da banca."]],
  ["dia", "IV. Para o dia do Exame de Defesa", [
    ONLINE("exame"),
    "O Orientador é responsável pela abertura da banca, pelo preenchimento da Ata e leitura do documento ao final da Defesa.",
    "A Ata da Defesa deverá ser assinada pela Comissão Julgadora, pelo Orientador e pelo aluno. O documento deve conter o título definitivo do trabalho em português, nome e instituição dos membros da Comissão Julgadora, do aluno e do Orientador.",
    "Cabe ao Orientador preencher corretamente os campos da Ata de Defesa, indicando se o aluno foi aprovado, aprovado com restrições ou reprovado, bem como listar todas as correções a serem feitas no trabalho.",
    "É dever do Orientador pontuar cada uma das correções durante a leitura da Ata."]],
  ["versao-definitiva", "V. Entrega da Versão Definitiva da Dissertação", [
    ["h3", "Prazos"],
    "Após ser aprovado ou aprovado com restrições, o aluno deverá observar e cumprir as exigências abaixo:",
    ["ul", "O prazo para entrega da versão definitiva e dos documentos pertinentes é de <b>45 dias</b> após a realização da Defesa;", "A versão definitiva deve estar de acordo com as normas de formatação do Programa, ter passado por revisão ortográfica e gramatical, adequação das normas da ABNT e deve ter sido atestada pelo Orientador."],
    "O Orientador deverá preencher o FORMULÁRIO DE APROVAÇÃO DA DISSERTAÇÃO (Apêndice D) atestando que as alterações solicitadas foram realizadas no exemplar final e encaminhar o documento para o e-mail da coordenação.",
    ["obs", "O não cumprimento do prazo determinado acarretará na reprovação do aluno."],
    ["h3", "Formatação"],
    "A folha de aprovação da versão definitiva deve constar com assinatura.",
    "O título em português da versão definitiva e da ficha catalográfica devem ser o mesmo da Ata de Defesa.",
    "O nome e instituição dos membros da Comissão Julgadora da versão definitiva e da ficha catalográfica devem ser iguais ao que consta na Ata de Defesa, sem abreviaturas.",
    "O título (Mestre/Mestra), o Programa e a linha de pesquisa indicados na versão definitiva e ficha catalográfica devem ser os mesmos contidos na Ata de Defesa. Não é permitido abreviar ou grafar o nome em parte.",
    "Os alunos bolsistas devem incluir a agência de fomento nos agradecimentos, indicando seu nome por extenso e o número do processo de bolsa.",
    ["h3", "Ficha catalográfica"],
    "Verificar com o bibliotecário do UNIVAG.",
    ["h3", "Entrega da versão definitiva"],
    "O aluno deverá protocolar na secretaria da Pós-Graduação a versão impressa (02 volumes) e enviar a cópia digital da versão definitiva da Dissertação para o e-mail da coordenação no prazo máximo de 45 dias após a data da Defesa (com a formatação exigida pelo Programa, corrigida e atestada pelo Orientador).",
    "O aluno deverá encaminhar ainda o relatório de originalidade e similaridade emitido no Turnitin. Os relatórios que estiverem acima do índice aceitável pelo software, ou seja, entre 25% e 49%, deverão estar acompanhados de uma justificativa do Orientador, que será analisada pela coordenação do Programa e somente após análise, o trabalho será aceito.",
    "Os alunos bolsistas deverão enviar uma cópia da versão definitiva do trabalho para a agência financiadora.",
    "É responsabilidade do Orientador avaliar se o aluno incorporou as mudanças recomendadas pela banca e assinar a folha de aprovação, validando a versão definitiva da Dissertação.",
    ["h3", "Homologação"],
    "Sem o cumprimento do exposto acima, o título do aluno não será homologado e o diploma não será emitido."]],
  ["aluno", "VI. Atribuições do Aluno para a Defesa da Dissertação", [
    ["ul", "Verificar existência de pendência registrada no Histórico Escolar;", "Verificar existência de pendência quanto à entrega de documentação junto ao Programa;",
      ["Caso o trabalho tenha sido submetido ao CEP, apresentar no momento da solicitação da Comissão Julgadora pelo Orientador:", ["Autorização do CEP;", "Documento indicando a aprovação dos relatórios de pesquisa submetidos ao CEP;", "Documento indicando a inexistência de pendências junto ao CEP."]],
      "Contatar o Orientador para as providências de agendamento do exame de Defesa, tais como: definição de data, horário e convites iniciais aos membros a serem feitos pelo Orientador;",
      ["Encaminhar e-mail para a coordenação com antecedência mínima de 45 dias da data prevista para o exame de Defesa, com o assunto LIBERAÇÃO DE DEFESA - NOME DO ALUNO, contendo:", ["Os dados dos membros da banca (Nome completo, Instituição, Currículo Lattes, telefone e e-mail);", "Relatório de originalidade e similaridade do Turnitin indicando a similaridade para liberação do agendamento do exame de Defesa. Nos casos em que o índice estiver acima do recomendado pelo software deve ser encaminhada uma justificativa do Orientador;", "O Currículo Lattes atualizado para comprovação dos artigos publicados;", "Cópia da resposta oficial do periódico, em meio impresso ou eletrônico, do recebimento da submissão ou aceite do artigo para publicação;", "Cópia dos artigos publicados, submetidos ou aprovados para publicação, em formato pdf."]],
      "Estar ciente dos prazos de envio do exemplar de Defesa para a coordenação do Programa;", "Formatar o exemplar de Defesa segundo as normas do Programa e da ABNT;", ...REVISAO(),
      "Imprimir e enviar versão impressa da Dissertação quando solicitado pelos membros da banca;", "No dia da Defesa, verificar se os dados contidos na Ata de Defesa estão corretos;", "Assinar a Ata de Defesa;", "Fazer as correções na Dissertação se aprovado com restrições;", "Formatar a versão definitiva da Dissertação segundo as normas do Programa e da ABNT;", ...REVISAO(),
      "Incluir a folha de aprovação na versão definitiva;", "Incluir a agência de fomento nos agradecimentos, indicando seu nome por extenso e o número do processo de bolsa;", "Solicitar a Ficha Catalográfica e incluir na versão definitiva;", "Enviar a versão definitiva da Dissertação em até 45 dias após a Defesa, atestada pelo Orientador;", "Enviar novamente o relatório de originalidade e similaridade do Turnitin. Nos casos em que o índice estiver acima do recomendado pelo software deve ser encaminhada uma justificativa do Orientador;", "Enviar uma cópia da versão definitiva do trabalho para a agência financiadora."]]],
  ["orientador", "VII. Atribuições do Orientador", [
    ["ul", "Contatar e convidar os membros que irão compor a Comissão Julgadora;", "Solicitar a aprovação da Comissão Julgadora para o exame de Defesa através do formulário com a INDICAÇÃO DE NOMES PARA A COMISSÃO JULGADORA, que deverá ser enviado para o e-mail da coordenação do curso;", "Emitir relatório de originalidade e similaridade no Turnitin;", "Apresentar justificativa caso o relatório de originalidade e similaridade do Turnitin indique de 25 a 49% de similaridade;", "Agendar a sala virtual e enviar o link de acesso para os membros da banca, quando o exame de Defesa ocorrer de forma online;", "Verificar se o exemplar de Defesa segue a formatação exigida pelo Programa e as normas da ABNT;", "Fazer a correção do documento, indicando os ajustes em relação à estrutura do trabalho, conteúdo, ortografia e gramática;", `Avaliar a ${QUALIDADE} e apontar correções;`, "Indicar materiais e equipamentos necessários para a defesa, caso esta ocorra de forma presencial;", "Verificar se os dados contidos na Ata de Defesa estão corretos;", "Presidir a banca;", "Preencher a Ata de Defesa, indicando se o aluno foi aprovado, aprovado com restrições ou reprovado;", "Incluir na Ata de Defesa todas as correções a serem feitas no trabalho;", "Fazer a leitura da Ata ao final da Defesa, pontuando todas as correções a serem feitas no trabalho;", "Assinar a Ata de Defesa e recolher as demais assinaturas;", "Enviar o número do CPF dos membros da banca para a coordenação do Programa;", "Corrigir a Dissertação, caso o aluno seja aprovado com restrições, verificando a formatação e o atendimento às normas do Programa e da ABNT;", "Apontar as correções em relação ao conteúdo, ortografia e gramática;", `Avaliar novamente a ${QUALIDADE};`, "Rever a versão definitiva e avaliar se o aluno incorporou as mudanças recomendadas pela banca;", "Preencher o FORMULÁRIO DE APROVAÇÃO DA DISSERTAÇÃO e encaminhar o documento para o e-mail da coordenação;", "Assinar a folha de aprovação, validando a versão definitiva da Dissertação;", "Emitir relatório de originalidade e similaridade do Turnitin para a versão definitiva;", "Apresentar justificativa caso o relatório de originalidade e similaridade do Turnitin indique de 25 a 49% de similaridade."]]]
];

// Disciplinas do mestrado: [nome, carga horária, créditos, categoria]
const DISC = [["Arquitetura e Cidade: Produção e Organização do Espaço", 45, 3, "Obrigatória"], ["Métodos e Técnicas de Pesquisa em Arquitetura e Urbanismo", 45, 3, "Obrigatória"],
  ...["Análise dos Impactos Ambientais Urbanos e Regionais", "Arquitetura, Cidade e Sustentabilidade", "Arquitetura da Paisagem", "A Urbanização em Territórios Metropolitanos Contemporâneos", "Cidade e Direito à Cidade", "Cidade Mundializada", "Climatologia voltada ao planejamento urbano", "Docência, Ensino e Prática Profissional na Contemporaneidade", "Inovação e Empreendedorismo em Arquitetura e Urbanismo", "Habitação, Ambiente e Sistemas Urbanos", "História e Cultura: A Estruturação do Espaço Urbano Regional e o Agronegócio", "Planejamento da Paisagem", "Planejamento e Direito Urbanístico Contemporâneo", "Planejamento dos Espaços Públicos Urbanos", "Projeto, Sustentabilidade e Inovação Aplicada ao Ambiente Construído", "Projeto Urbano e Formas de Manejo das Águas Urbanas", "Políticas Públicas de Desenvolvimento Territorial: Instrumentos, Agentes e Métodos", "Sociologia Urbana e Territórios", "Teoria e Crítica da Arquitetura", "Teoria e História do Urbanismo", "Território, História e Patrimônio Arquitetônico"].map(n => [n, 45, 3, "Eletiva"]),
  ...["I", "II", "III"].map(n => [`Seminários Avançados em Pesquisa e Dissertação ${n}`, 30, 2, "Seminários"])];

// Créditos: [atividade, quantidade, créditos por atividade, total de créditos, C.H. por atividade, C.H. total]
const CRED = [["Disciplinas obrigatórias", 2, 3, 6, 45, 90], ["Disciplinas eletivas", 4, 3, 12, 45, 180], ["Seminários avançados em pesquisa e dissertação", 3, 2, 6, 30, 90], ["Dissertação", 1, 8, 8, 120, 120], ["Atividades de produção científica", 1, 2, 2, 30, 30]];

module.exports = { QUALI, DEFESA, DISC, CRED, secoes, sumario };
