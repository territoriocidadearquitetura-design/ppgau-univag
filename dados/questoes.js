// Questionários derivados do documento "Autoavaliação 2026" do PPGAU/UNIVAG.
const ESCALAS = {
  S: { nome: "Satisfação", opts: ["Nada satisfatório", "Pouco satisfatório", "Satisfatório", "Muito satisfatório", "Totalmente satisfatório", "Não tenho informações suficientes para avaliar", "Não se aplica"], validos: 5 },
  F: { nome: "Frequência", opts: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre", "Não se aplica"], validos: 5 },
  M: { nome: "Mudanças desde jan/2025", opts: ["Piorou", "Permaneceu semelhante", "Melhorou", "Não tenho experiência suficiente nos dois períodos para comparar"], validos: 3 },
  C: { nome: "Condição atual", opts: ["Disponível e suficiente", "Disponível, mas insuficiente", "Em implantação", "Não disponível", "Não tenho informações suficientes", "Não se aplica"], validos: 4 }
};

const S = (n, t) => ({ n, t, type: "scale", scale: "S" });
const F = (n, t) => ({ n, t, type: "scale", scale: "F" });
const C = (n, t) => ({ n, t, type: "scale", scale: "C" });
const one = (n, t, opts, extra) => ({ n, t, type: "single", opts, ...extra });
const multi = (n, t, opts, max, extra) => ({ n, t, type: "multi", opts, max, ...extra });
const open = (n, t, hint) => ({ n, t, type: "open", hint });
const text = (n, t) => ({ n, t, type: "text" });
const matrix = (n, t, scale, items) => ({ n, t, type: "matrix", scale, items });
const SNP = ["Sim", "Parcialmente", "Não"];

const PUBLICOS = [
  {
    id: "A", nome: "Estudantes do mestrado", curto: "Estudantes",
    desc: "Formação, encontros híbridos e presenciais, orientação, pesquisa e permanência.",
    tempo: "Considere os últimos seis meses ou o período desde o início do seu vínculo, quando inferior.",
    secoes: [
      { id: "A1", titulo: "Participação e condições de acesso", dim: "Condições dos participantes", qs: [
        one("1", "Em que momento do curso você se encontra?", ["Primeiro ano", "Segundo ano", "Além do segundo ano", "Prefiro não responder"]),
        one("2", "Nos quatro encontros híbridos de cada disciplina, como participa habitualmente?", ["Presencialmente em todos ou quase todos", "On-line em todos ou quase todos", "Alternando participação presencial e on-line"]),
        one("3", "Quando participa on-line, de onde costuma acompanhar as aulas?", ["Cuiabá ou Várzea Grande", "Outro município de Mato Grosso", "Outro estado", "Não participo on-line", "Prefiro não responder"]),
        multi("4", "Quais fatores influenciam sua escolha entre participação presencial e on-line?", ["Distância até o UNIVAG", "Custos de deslocamento e hospedagem", "Horários de trabalho", "Responsabilidades de cuidado familiar", "Condições de saúde ou acessibilidade", "Disponibilidade de conexão e equipamentos", "Preferência pela participação presencial", "Preferência pela participação on-line"], 3, { outro: true }),
        one("5", "Qual equipamento utiliza principalmente para acompanhar as atividades on-line?", ["Computador de uso próprio", "Computador compartilhado", "Tablet", "Telefone celular", "Outro", "Não participo on-line"]),
        one("6", "O equipamento disponível permite acompanhar as aulas e realizar as atividades propostas?", ["Sim", "Parcialmente", "Não", "Não se aplica"]),
        { ...F("7", "Com que frequência sua conexão à internet prejudica sua participação?"), inv: true },
        { ...F("8", "Com que frequência ruídos, interrupções ou ausência de espaço adequado prejudicam sua participação on-line?"), inv: true }
      ]},
      { id: "A2", titulo: "Qualidade dos encontros híbridos", dim: "Infraestrutura institucional",
        nota: "Esta seção trata da participação on-line. Ela é dispensada para quem participa presencialmente em todos ou quase todos os encontros.",
        mostrarSe: r => r["A.2"] !== "Presencialmente em todos ou quase todos", qs: [
        S("9", "Clareza das orientações para acessar as aulas e utilizar as plataformas"),
        S("10", "Qualidade do áudio recebido"),
        S("11", "Qualidade da imagem e da visualização dos materiais"),
        S("12", "Oportunidades de fazer perguntas e participar das discussões"),
        S("13", "Interação com os professores"),
        S("14", "Interação acadêmica com os demais estudantes"),
        S("15", "Adequação das atividades didáticas à participação on-line"),
        S("16", "Disponibilidade dos materiais necessários às atividades"),
        S("17", "Suporte técnico quando surgem dificuldades de acesso"),
        S("18", "Acessibilidade dos materiais e das plataformas às suas necessidades"),
        F("19", "Quando participa on-line, com que frequência consegue ouvir e acompanhar as intervenções dos professores e estudantes presentes em sala?"),
        F("20", "Com que frequência consegue manter atenção e participação durante os encontros on-line?"),
        S("21", "Como avalia a interação entre professores presentes em sala e professores que participam on-line?"),
        multi("22", "Quais fatores dificultam sua aprendizagem nos encontros híbridos?", ["Problemas de conexão no local de acesso", "Problemas de áudio ou imagem da transmissão", "Dificuldade de visualizar os materiais", "Longos períodos de exposição sem interação", "Dificuldade de participar das discussões", "Dificuldade de acompanhar as intervenções em sala", "Interrupções no local de acesso", "Sobreposição com atividades de trabalho", "Dificuldade de utilizar as plataformas", "Não encontro dificuldades relevantes"], 3, { outro: true })
      ]},
      { id: "A3", titulo: "Organização das disciplinas e formação", dim: "Organização pedagógica", qs: [
        S("23", "Clareza das informações sobre disciplinas, créditos, qualificação e defesa"),
        S("24", "Contribuição das disciplinas para o desenvolvimento de sua pesquisa"),
        S("25", "Articulação entre os conteúdos das diferentes disciplinas"),
        S("26", "Formação em métodos e técnicas de pesquisa"),
        S("27", "Formação para escrita e publicação científica"),
        S("28", "Clareza dos critérios de avaliação"),
        S("29", "Contribuição das devolutivas dos professores para sua aprendizagem"),
        S("30", "Distribuição das leituras, atividades e prazos durante o mês da disciplina"),
        S("31", "Adequação dos cinco encontros ao desenvolvimento dos conteúdos e à aprendizagem"),
        S("32", "Articulação dos conteúdos desenvolvidos pelos três professores de cada disciplina"),
        matrix("33", "Como avalia a contribuição do encontro presencial obrigatório nos seguintes aspectos?", "S", ["Consolidação dos conteúdos", "Discussão das atividades desenvolvidas", "Interação com os professores", "Integração com os demais estudantes"]),
        one("34", "Com que antecedência recebe a confirmação das datas dos encontros presenciais obrigatórios?", ["Mais de 30 dias antes", "Entre 15 e 30 dias antes", "Entre 7 e 14 dias antes", "Menos de 7 dias antes", "A antecedência varia entre disciplinas", "Não sei informar"]),
        one("35", "Você conhece a regra de que a ausência no encontro presencial obrigatório implica cursar novamente a disciplina quando ela for ofertada?", ["Sim", "Conheço parcialmente", "Não"]),
        multi("36", "Quais dificuldades encontra para comparecer ao encontro presencial obrigatório?", ["Distância até o UNIVAG", "Custos de transporte", "Custos de hospedagem", "Liberação do trabalho", "Responsabilidades de cuidado familiar", "Condições de saúde ou acessibilidade", "Antecedência insuficiente na divulgação das datas", "Não encontro dificuldades relevantes"], 3, { outro: true }),
        open("37", "Que medidas poderiam facilitar seu comparecimento ao encontro presencial obrigatório?"),
        open("38", "Que ajustes na articulação entre os quatro encontros híbridos e o encontro presencial obrigatório melhorariam sua aprendizagem?")
      ]},
      { id: "A4", titulo: "Orientação e pesquisa", dim: "Formação e pesquisa", qs: [
        S("39", "Disponibilidade do orientador para reuniões"),
        S("40", "Contribuição das orientações para o avanço da dissertação"),
        S("41", "Qualidade das reuniões de orientação realizadas on-line"),
        S("42", "Oportunidades de participação em grupos e projetos de pesquisa"),
        S("43", "Integração acadêmica com estudantes e docentes da sua linha de pesquisa"),
        S("44", "Acesso remoto à bibliografia e às bases de dados necessárias à pesquisa"),
        S("45", "Disponibilidade de equipamentos, programas computacionais ou laboratórios necessários à pesquisa"),
        multi("46", "Quais dificuldades afetam atualmente sua pesquisa?", ["Delimitação do problema ou dos objetivos", "Definição dos procedimentos metodológicos", "Acesso a dados ou documentos", "Realização de trabalho de campo", "Uso de programas computacionais", "Escrita acadêmica", "Disponibilidade de tempo", "Financiamento das atividades", "Não encontro dificuldades relevantes"], 3, { outro: true })
      ]},
      { id: "A5", titulo: "Apoio institucional e permanência", dim: "Condições dos participantes", qs: [
        S("47", "Atendimento da secretaria"),
        S("48", "Acesso remoto aos serviços acadêmicos"),
        S("49", "Comunicação da coordenação sobre procedimentos e decisões"),
        S("50", "Condições dos espaços utilizados nos encontros presenciais"),
        S("51", "Conexão à internet disponibilizada pelo UNIVAG, quando utilizada"),
        one("52", "Você conhece os critérios de concessão e manutenção de bolsas e benefícios institucionais?", ["Sim", "Parcialmente", "Não", "Não se aplica"]),
        one("53", "Você conhece os canais para solicitar apoio pedagógico, acessibilidade ou atendimento diante de dificuldades acadêmicas?", SNP),
        multi("54", "Quais fatores podem comprometer sua permanência no curso?", ["Mensalidade", "Deslocamento e hospedagem para os encontros presenciais", "Conciliação com o trabalho", "Responsabilidades familiares", "Condições de saúde", "Dificuldades de acesso digital", "Dificuldades acadêmicas", "Nenhum desses fatores", "Prefiro não responder"], 3, { outro: true })
      ]},
      { id: "A6", titulo: "Melhorias e perspectivas", dim: "Perspectivas e doutorado", qs: [
        matrix("55", "Desde janeiro de 2025, como avalia as mudanças nos seguintes aspectos?", "M", ["Organização das disciplinas", "Comunicação acadêmica", "Qualidade dos encontros híbridos", "Integração entre estudantes e docentes", "Condições de pesquisa"]),
        open("56", "Quais são as três melhorias prioritárias para o PPGAU?"),
        one("57", "Teria interesse em cursar um doutorado em Arquitetura e Urbanismo no UNIVAG?", ["Sim", "Talvez", "Não", "Ainda não tenho elementos para decidir"]),
        multi("58", "Quais condições seriam decisivas para essa possibilidade?", ["Aderência da pesquisa às linhas e aos projetos", "Disponibilidade de orientação na temática", "Qualidade acadêmica", "Bolsa ou apoio financeiro", "Valor da mensalidade", "Organização dos encontros e exigências de presença física", "Infraestrutura de pesquisa", "Conciliação com o trabalho"], 3, { outro: true }),
        open("59", "Há alguma observação adicional?")
      ]}
    ]
  },
  {
    id: "B", nome: "Docentes", curto: "Docentes",
    desc: "Condições de trabalho, organização das disciplinas, pesquisa, gestão e doutorado.",
    tempo: "Considere os últimos seis meses ou o período desde o início do seu vínculo, quando inferior.",
    secoes: [
      { id: "B0", titulo: "Vínculo com o programa", dim: "Perfil", qs: [
        one("0", "Qual é o seu vínculo com o PPGAU?", ["Docente permanente", "Docente colaborador", "Prefiro não responder"])
      ]},
      { id: "B1", titulo: "Participação e condições de trabalho", dim: "Infraestrutura institucional", qs: [
        one("1", "Nos encontros híbridos, como atua habitualmente?", ["Presencialmente", "On-line", "Alternando atuação presencial e on-line", "Não ministrei disciplinas no período avaliado"]),
        multi("2", "Quais situações de ensino vivenciou no período avaliado?", ["Atuação presencial com estudantes presenciais e remotos", "Atuação on-line articulada a professor presente em sala", "Participação no encontro presencial obrigatório", "Não ministrei disciplinas no período avaliado"], 0),
        S("3", "Adequação dos equipamentos utilizados"),
        S("4", "Estabilidade da conexão utilizada nas atividades on-line"),
        S("5", "Qualidade dos recursos de transmissão das salas"),
        S("6", "Suporte técnico nos horários das aulas"),
        S("7", "Capacitação para utilizar plataformas e recursos educacionais digitais"),
        S("8", "Organização da carga de trabalho para ensino, preparação das aulas, pesquisa e orientação")
      ]},
      { id: "B2", titulo: "Organização das disciplinas e aprendizagem", dim: "Organização pedagógica",
        nota: "Dispensada para quem não ministrou disciplinas no período avaliado.",
        mostrarSe: r => r["B.1"] !== "Não ministrei disciplinas no período avaliado", qs: [
        S("9", "Planejamento conjunto entre os três professores da disciplina"),
        S("10", "Continuidade dos conteúdos desenvolvidos pelos três professores"),
        S("11", "Articulação dos critérios de avaliação entre os professores"),
        S("12", "Distribuição das leituras e atividades durante o mês da disciplina"),
        S("13", "Adequação dos cinco encontros aos objetivos de aprendizagem"),
        S("14", "Articulação entre os quatro encontros híbridos e o encontro presencial obrigatório"),
        S("15", "Contribuição do encontro presencial obrigatório para a consolidação da aprendizagem"),
        S("16", "Condições para promover participação dos estudantes on-line"),
        S("17", "Condições para integrar estudantes presenciais e remotos nas mesmas atividades"),
        S("18", "Articulação entre professores presenciais e professores on-line"),
        S("19", "Condições para desenvolver atividades práticas"),
        S("20", "Condições para avaliar a aprendizagem dos estudantes"),
        multi("21", "Quais dificuldades pedagógicas encontra com maior frequência?", ["Baixa participação nas discussões", "Dificuldade de acompanhar a compreensão dos estudantes", "Interrupções por problemas tecnológicos", "Atendimento simultâneo de estudantes presenciais e remotos", "Desenvolvimento de atividades práticas", "Acompanhamento das atividades entre encontros", "Articulação entre os três professores", "Adaptação dos materiais didáticos", "Não encontro dificuldades relevantes"], 3, { outro: true }),
        open("22", "Quais estratégias têm favorecido a aprendizagem e a participação?"),
        open("23", "Como o encontro presencial obrigatório pode ampliar sua contribuição à formação?"),
        open("24", "Que ajustes recomenda no planejamento e na atuação dos três professores?")
      ]},
      { id: "B3", titulo: "Pesquisa, orientação e produção", dim: "Formação e pesquisa", qs: [
        multi("35", "Quais fatores limitam suas atividades de pesquisa e orientação?", ["Tempo disponível", "Financiamento", "Infraestrutura", "Apoio técnico", "Acesso a dados e locais de pesquisa", "Formação metodológica dos estudantes", "Integração entre projetos", "Apoio à publicação", "Não encontro limitações relevantes"], 3, { outro: true }),
        open("36", "Quais medidas favoreceriam a produção decorrente das dissertações?"),
        S("37", "Como avalia os mecanismos de acompanhamento dos egressos?"),
        S("38", "Como avalia os mecanismos de registro e comprovação dos impactos das pesquisas?")
      ]},
      { id: "B4", titulo: "Gestão e consolidação", dim: "Gestão", qs: [
        S("39", "Como avalia a clareza dos critérios de credenciamento, recredenciamento e descredenciamento?"),
        one("40", "Você conhece o planejamento estratégico vigente?", SNP),
        S("41", "Como avalia sua participação nas decisões acadêmicas?"),
        matrix("42", "Desde janeiro de 2025, como avalia as mudanças nos seguintes aspectos?", "M", ["Integração docente", "Condições de ensino", "Condições de pesquisa", "Apoio institucional", "Cooperação acadêmica externa"])
      ]},
      { id: "B5", titulo: "Perspectivas de doutorado", dim: "Perspectivas e doutorado", qs: [
        multi("43", "Quais condições precisam ser fortalecidas para implantação do doutorado?", ["Disponibilidade docente", "Experiência de orientação", "Consolidação dos projetos", "Produção científica aderente e distribuída", "Formação metodológica avançada", "Cooperação nacional", "Cooperação internacional", "Infraestrutura", "Financiamento e bolsas", "Apoio administrativo e técnico", "Comprovação de impactos"], 4, { outro: true }),
        open("44", "Que formação avançada deverá distinguir o doutorado do mestrado?"),
        open("45", "Que oportunidades de pesquisa poderão sustentar teses com contribuição original?"),
        open("46", "Quais atividades de um eventual doutorado poderiam ocorrer on-line e quais demandariam presença física? Justifique."),
        open("47", "Quais são as três prioridades do PPGAU para os próximos anos?"),
        open("48", "Há alguma observação adicional?")
      ]}
    ]
  },
  {
    id: "C", nome: "Egressos", curto: "Egressos",
    desc: "Formação recebida, trajetória profissional, produtos da dissertação e vínculos.",
    tempo: "Avalie a formação considerando o período cursado e a trajetória considerando sua situação atual.",
    secoes: [
      { id: "C1", titulo: "Formação recebida", dim: "Formação e pesquisa", qs: [
        one("3", "Nos encontros híbridos, como participou habitualmente?", ["Presencialmente em todos ou quase todos", "On-line em todos ou quase todos", "Alternando participação presencial e on-line", "Não se aplica"]),
        S("4", "Contribuição das disciplinas para sua formação"),
        S("5", "Formação em métodos e técnicas de pesquisa"),
        S("6", "Formação para escrita e publicação científica"),
        S("7", "Orientação recebida"),
        S("8", "Interação acadêmica com professores e estudantes"),
        S("9", "Acesso à bibliografia e aos recursos necessários"),
        S("10", "Organização dos encontros das disciplinas"),
        S("11", "Articulação dos conteúdos desenvolvidos pelos professores"),
        S("12", "Contribuição do encontro presencial obrigatório, quando vivenciado"),
        S("13", "Contribuição da formação para sua atuação atual"),
        multi("14", "Caso tenha participado on-line, quais dificuldades afetaram sua formação?", ["Conexão ou equipamentos", "Qualidade das transmissões", "Participação nas discussões", "Interação com colegas", "Realização de atividades práticas", "Acesso aos serviços institucionais", "Não houve dificuldades relevantes", "Não participei on-line"], 3, { outro: true }),
        open("15", "Quais dificuldades enfrentou para comparecer aos encontros presenciais obrigatórios?", "Escreva “Não se aplica” quando pertinente."),
        open("16", "Que aspectos da organização do curso favoreceram sua permanência e conclusão?")
      ]},
      { id: "C2", titulo: "Trajetória e resultados", dim: "Impacto e egressos", qs: [
        multi("17", "Em quais atividades atua atualmente?", ["Docência", "Pesquisa", "Atuação profissional autônoma", "Empresa privada", "Administração pública", "Organização social ou comunitária", "Doutorado ou outra formação", "Não exerço atividade profissional atualmente", "Prefiro não responder"], 0, { outro: true }),
        F("18", "Com que frequência utiliza conhecimentos ou procedimentos desenvolvidos no mestrado?"),
        multi("19", "A formação contribuiu para quais mudanças em sua trajetória?", ["Ingresso ou ampliação da atuação docente", "Participação em pesquisas", "Ingresso em doutorado", "Ampliação de responsabilidades profissionais", "Participação em projetos ou políticas públicas", "Ampliação de oportunidades profissionais", "Não identifiquei mudanças dessa natureza", "Não sei avaliar"], 0, { outro: true }),
        multi("20", "Sua dissertação resultou em quais produtos?", ["Artigo publicado", "Artigo submetido, ainda em avaliação", "Livro ou capítulo", "Trabalho em evento", "Produto técnico, método ou projeto", "Material educativo ou de divulgação", "Nenhum produto adicional", "Não sei informar"], 0, { outro: true }),
        one("21", "Conhece alguma utilização dos resultados de sua pesquisa por instituições, comunidades ou atividades profissionais?", ["Sim", "Não", "Não sei informar"]),
        open("22", "Se respondeu “Sim”, descreva a utilização e indique, quando disponível, documento ou endereço público que a comprove.", "Resposta facultativa. Não inclua dados pessoais de terceiros."),
        S("23", "Como avalia a manutenção de vínculos acadêmicos com o PPGAU?"),
        open("24", "Que ações fortaleceriam o acompanhamento dos egressos?")
      ]},
      { id: "C3", titulo: "Melhorias e perspectivas", dim: "Perspectivas e doutorado", qs: [
        one("25", "Recomendaria o mestrado do PPGAU/UNIVAG?", ["Sim", "Talvez", "Não"]),
        one("26", "Teria interesse em cursar um doutorado em Arquitetura e Urbanismo no UNIVAG?", ["Sim", "Talvez", "Não", "Já curso ou concluí doutorado", "Ainda não tenho elementos para decidir"]),
        multi("27", "Quais condições seriam decisivas para essa possibilidade?", ["Temática e disponibilidade de orientação", "Qualidade acadêmica", "Bolsa ou apoio financeiro", "Mensalidade", "Organização dos encontros e exigências de presença física", "Infraestrutura", "Conciliação com o trabalho"], 3, { outro: true }),
        open("28", "Quais melhorias o programa deveria priorizar?")
      ]}
    ]
  },
  {
    id: "D", nome: "Equipe técnica e administrativa", curto: "Equipe técnica",
    desc: "Procedimentos, sistemas, atendimento remoto e suporte às atividades.",
    tempo: "Considere os últimos seis meses ou o período desde o início do seu vínculo, quando inferior.",
    aviso: "Com poucos participantes, os resultados serão apresentados como síntese dos processos, sem atribuição individual de falas.",
    secoes: [
      { id: "D1", titulo: "Processos e condições de trabalho", dim: "Infraestrutura institucional", qs: [
        S("1", "Clareza das atribuições e dos procedimentos administrativos"),
        S("2", "Comunicação entre secretaria, coordenação e setores institucionais"),
        S("3", "Adequação dos sistemas de registro acadêmico"),
        S("4", "Organização e recuperação dos documentos"),
        S("5", "Condições para atendimento remoto aos estudantes"),
        S("6", "Condições para atender participantes de outros municípios"),
        S("7", "Disponibilidade de suporte técnico nos horários das aulas"),
        S("8", "Articulação entre equipe administrativa e suporte tecnológico"),
        S("9", "Adequação da equipe ao volume de trabalho"),
        S("10", "Capacitação para sistemas digitais e atendimento acessível"),
        S("11", "Antecedência e clareza da divulgação dos encontros presenciais obrigatórios"),
        S("12", "Procedimentos de registro da participação presencial e on-line"),
        S("13", "Organização administrativa das disciplinas desenvolvidas por três professores")
      ]},
      { id: "D2", titulo: "Dificuldades e recomendações", dim: "Gestão", qs: [
        open("14", "Quais procedimentos apresentam dificuldades ou retrabalho?"),
        open("15", "Quais problemas tecnológicos mais afetam o funcionamento acadêmico?"),
        open("16", "Que melhorias recomenda no atendimento presencial e remoto?"),
        open("17", "Que ajustes recomenda nos procedimentos de informação e acompanhamento da frequência?"),
        open("18", "Que necessidades adicionais de pessoal, capacitação, sistemas ou organização surgiriam com o doutorado?")
      ]}
    ]
  },
  {
    id: "E", nome: "Gestão institucional", curto: "Gestão",
    desc: "Instrumento identificado: condições institucionais, organização e viabilidade do doutorado.",
    tempo: "Informe as condições existentes na data do preenchimento.",
    identificado: true,
    aviso: "Instrumento identificado, destinado aos setores responsáveis. As respostas devem representar a posição institucional do setor e indicar sua referência documental.",
    secoes: [
      { id: "E1", titulo: "Identificação", dim: "Perfil", qs: [
        text("1", "Setor responsável"),
        text("2", "Cargo ou função do responsável"),
        { n: "3", t: "Data do preenchimento", type: "date" }
      ]},
      { id: "E2", titulo: "Condições atuais", dim: "Infraestrutura institucional", qs: [
        C("4", "Recursos financeiros para consolidar o mestrado"),
        C("5", "Disponibilidade docente para ensino, pesquisa e orientação"),
        C("6", "Equipe administrativa"),
        C("7", "Suporte técnico nos horários efetivos das atividades"),
        C("8", "Salas equipadas para participação presencial e remota simultânea"),
        C("9", "Recursos para integrar professores presenciais e professores on-line"),
        C("10", "Plataformas de apoio às atividades acadêmicas"),
        C("11", "Acesso remoto à bibliografia e às bases especializadas"),
        C("12", "Laboratórios, equipamentos e programas computacionais para pesquisa"),
        C("13", "Serviços acadêmicos acessíveis remotamente"),
        C("14", "Recursos de acessibilidade digital e presencial"),
        C("15", "Apoio à publicação e à participação em eventos"),
        C("16", "Apoio à captação de financiamento externo"),
        C("17", "Articulação entre a autoavaliação do PPGAU e a CPA")
      ]},
      { id: "E3", titulo: "Organização institucional", dim: "Organização pedagógica", qs: [
        open("18", "Quais documentos disciplinam a organização das disciplinas em cinco encontros, a participação híbrida e a obrigatoriedade do encontro presencial?", "Indique documentos e situação de vigência."),
        open("19", "Como é assegurada a presença de professor na instituição em todos os encontros?"),
        open("20", "Como são divulgadas as regras de frequência e de necessidade de cursar novamente a disciplina?"),
        open("21", "Quais medidas apoiam o comparecimento de estudantes residentes em outros municípios?")
      ]},
      { id: "E4", titulo: "Condições para o doutorado", dim: "Perspectivas e doutorado", qs: [
        one("22", "Há previsão específica do doutorado em Arquitetura e Urbanismo no planejamento institucional?", ["Sim, formalizada", "Há previsão geral de expansão, sem definição específica do curso", "A previsão específica está em elaboração", "Não", "Não sei informar"]),
        one("23", "Há estudo de viabilidade financeira específico para o doutorado?", ["Sim, concluído", "Em elaboração", "Não"]),
        open("24", "Quais recursos adicionais poderiam ser destinados ao doutorado e em que prazo?"),
        open("25", "Quais compromissos estão formalizados e quais dependem de deliberação?"),
        open("26", "Como seria assegurada a manutenção dos recursos até a conclusão das primeiras turmas?"),
        open("27", "Quais investimentos seriam necessários para as atividades acadêmicas do doutorado, considerando as possibilidades de organização presencial e on-line?"),
        open("28", "Quais são as prioridades institucionais para consolidar o PPGAU?"),
        open("29", "Indique documentos que fundamentam as respostas.", "Referências, links ou nomes de arquivos.")
      ]}
    ]
  }
];
// Pós-doutorandos: questionário próprio, derivado do instrumento docente (o documento não traz um específico).
// Sem a pergunta de vínculo docente e sem a questão sobre credenciamento docente.
(() => {
  const B = PUBLICOS.find(p => p.id === "B");
  const secoes = B.secoes.filter(s => s.id !== "B0").map(s => ({
    ...s, id: s.id.replace("B", "P"),
    mostrarSe: s.mostrarSe ? (r => r["P.1"] !== "Não ministrei disciplinas no período avaliado") : undefined,
    qs: s.qs.filter(q => q.n !== "39").map(q => ({ ...q }))
  }));
  secoes[0].qs[0] = { ...secoes[0].qs[0], t: "Nos encontros híbridos, como atua habitualmente, quando participa das disciplinas?" };
  PUBLICOS.splice(2, 0, {
    id: "P", nome: "Pós-doutorandos", curto: "Pós-doutorandos",
    desc: "Condições de trabalho, participação nas disciplinas, pesquisa, integração e doutorado.",
    tempo: B.tempo, secoes
  });
})();
// Chave de cada questão nas respostas: "<público>.<número>", ex.: "A.12".
PUBLICOS.forEach(p => p.secoes.forEach(s => s.qs.forEach(q => { q.key = p.id + "." + q.n; })));
