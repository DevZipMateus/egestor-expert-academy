export interface Slide {
  id: number;
  type: 'content' | 'exercise' | 'attention' | 'exam' | 'final';
  title: string;
  videoUrl?: string;
  content?: string;
  question?: string;
  options?: { text: string; correct: boolean }[];
  explanation?: string;
  examQuestions?: {
    question: string;
    options: { text: string; correct: boolean }[];
  }[];
}

export const courseSlides = [
  {
    id: 1,
    type: 'content' as const,
    title: 'Clientes e Fornecedores',
    videoUrl: 'https://youtu.be/Q0S86C0qoOo'
  },
  {
    id: 2,
    type: 'content' as const,
    title: 'Cadastrar cliente pela venda',
    videoUrl: 'https://youtu.be/mq9kEtE2T_I'
  },
  {
    id: 3,
    type: 'exercise' as const,
    title: 'Exercício 1',
    question: 'Posso cadastrar meu cliente também como meu fornecedor?',
    options: [
      { text: 'Sim, basta que no momento do cadastro no campo "Tipo de contato" seja marcado a opção: "Fornecedor".', correct: true },
      { text: 'Não, contato deve ser apenas: cliente ou fornecedor ou transportador.', correct: false },
      { text: 'Todos os contatos cadastrados são automaticamente marcados com as três opções de: cliente, fornecedor e transportador.', correct: false }
    ],
    explanation: 'No momento do cadastro do contato, ao clicar em "Novo" quando for aberta a janela para preenchimento das informações, terá a opção para marcar no campo "Tipo de contato", ao ser selecionada as opções (pode ser marcado uma ou mais) as informações do cadastro serão replicadas para a aba que for marcado qual será o tipo deste contato.'
  },
  {
    id: 4,
    type: 'content' as const,
    title: 'Cadastro de Produtos',
    videoUrl: 'https://youtu.be/rcc7KTZ2d8I'
  },
  {
    id: 5,
    type: 'content' as const,
    title: 'Cadastro de serviços',
    videoUrl: 'https://youtu.be/wVJQ_R_pJ2g'
  },
  {
    id: 6,
    type: 'content' as const,
    title: 'Ajuste de Estoque',
    videoUrl: 'https://youtu.be/BsNaBabF2Ac'
  },
  {
    id: 7,
    type: 'exercise' as const,
    title: 'Exercício 2',
    question: 'O ajuste de estoque possui qual finalidade?',
    options: [
      { text: 'A finalidade do ajuste é alterar a quantidade de produtos que foram movimentados fora do padrão, ou seja, não foram nem vendidos e nem comprados.', correct: true },
      { text: 'Tem como objetivo dar entrada da mercadoria pelo ajuste de estoque.', correct: false },
      { text: 'O ajuste de estoque tem como finalidade auxiliar a gestão para o controle de vendas e compras, gerando registro das mesmas pelo módulo "Ajuste de estoque".', correct: false }
    ],
    explanation: 'A finalidade do ajuste é alterar a quantidade de produtos que foram movimentados fora do padrão, ou seja, não foram nem vendidos e nem comprados. Geralmente é utilizado para envio de remessas, avaria, etc.'
  },
  {
    id: 8,
    type: 'content' as const,
    title: 'Controle Financeiro',
    videoUrl: 'https://youtu.be/DDLzuDmtGFA'
  },
  {
    id: 9,
    type: 'exercise' as const,
    title: 'Exercício 3',
    question: 'Como funciona o financeiro da venda e compra?',
    options: [
      { text: 'Quando é gerada a venda, ao ser inserido um item automaticamente o sistema gera o financeiro da mesma... A compra funciona da mesma maneira porém o financeiro é criado na aba "Pagamentos".', correct: true },
      { text: 'É necessário criar a compra e venda para depois ir no módulo financeiro para criar os recebimentos de ambas.', correct: false },
      { text: 'É preciso criar o lançamento financeiro e inserir os itens dentro do campo: Anotações adicionais...', correct: false }
    ],
    explanation: 'Quando é gerada a venda, ao ser inserido um item automaticamente o sistema gera o financeiro da mesma, sendo assim é então criado um recebimento dentro do módulo financeiro, após salvar a venda. A compra funciona da mesma maneira porém o financeiro é criado na aba "Pagamentos".'
  },
  {
    id: 10,
    type: 'content' as const,
    title: 'Controle financeiro de saldos',
    videoUrl: 'https://youtu.be/C7imYXsu9sU'
  },
  {
    id: 11,
    type: 'content' as const,
    title: 'Módulo de Recorrência',
    videoUrl: 'https://youtu.be/7SbWSTqxc1E'
  },
  {
    id: 12,
    type: 'exercise' as const,
    title: 'Exercício 4',
    question: 'Qual é a diferença de gerar um financeiro a receber parcelado pela recorrência e um financeiro a receber parcelado pelo módulo financeiro - "recebimentos"?',
    options: [
      { text: 'O módulo recorrência possui o intuito de criar lançamentos automatizados de maneira recorrente... Já o lançamento financeiro direto será visualizado logo após ser salvo.', correct: true },
      { text: 'Ambos são a mesma coisa, funcionam da mesma forma.', correct: false }
    ],
    explanation: 'O módulo recorrência possui o intuito de criar lançamentos automatizados de maneira recorrente, ou seja, ao ser parametrizado para gerar o lançamento as informações serão geradas de maneira automática com o decorrer dos dias e datas configuradas. Não serão mostrados todos os lançamentos de uma vez só, a menos que já tenha passado todo o período da recorrência. Já o lançamento financeiro direto pela aba de Recebimentos será projetado e programado dentro da primeira criação e pode ser visualizado logo após ser salvo. Sua descrição pode ser, por exemplo: Recebimento 1/10, Recebimento 2/10, etc..'
  },
  {
    id: 13,
    type: 'content' as const,
    title: 'Conciliação bancária',
    videoUrl: 'https://youtu.be/phkn30keyms'
  },
  {
    id: 14,
    type: 'exercise' as const,
    title: 'Exercício 5',
    question: 'A conciliação bancária possui integração automática com o banco?',
    options: [
      { text: 'Não, na conciliação bancária o extrato OFX é enviado e a baixa dos lançamentos é feita manualmente.', correct: true },
      { text: 'Sim, todo o processo feito no banco é baixado automaticamente dentro do sistema.', correct: false },
      { text: 'Não, eu preciso configurar para aceitar que o sistema integre com as informações do banco...', correct: false }
    ],
    explanation: 'Não, na conciliação bancária o extrato OFX é enviado e, a partir deste arquivo é feito a baixa dos lançamentos vinculados ao banco. Somente desta maneira, o processo de conciliação é feito de maneira manual.'
  },
  {
    id: 15,
    type: 'content' as const,
    title: 'Emissão do Boleto Fácil',
    videoUrl: 'https://youtu.be/540j8opH0I8'
  },
  {
    id: 16,
    type: 'exercise' as const,
    title: 'Exercício 6',
    question: 'Qual é a forma de validação do boleto fácil?',
    options: [
      { text: 'Possuir conta PJ vinculada ao sistema, emitir um boleto de R$ 10,00 e pagá-lo.', correct: true },
      { text: 'Não precisa de validação, basta preencher as informações.', correct: false },
      { text: 'Não é necessário validar, pois as informações inseridas estarão corretas.', correct: false }
    ],
    explanation: 'Primeiramente possuir uma conta bancária PJ e o CNPJ da empresa dentro do sistema devem estar vinculada à esta. É preciso também emitir um boleto teste no valor de R$ 10,00 e pagá-lo, somente desta forma quando o valor cair na conta bancária, será validado a conta cadastrada.'
  },
  {
    id: 17,
    type: 'content' as const,
    title: 'Emissão de Boletos',
    videoUrl: 'https://youtu.be/GvT9zKTiJOo'
  },
  {
    id: 18,
    type: 'content' as const,
    title: 'Cadastro de Vendas',
    videoUrl: 'https://youtu.be/VmM93pmXAQA'
  },
  {
    id: 19,
    type: 'content' as const,
    title: 'Desconto nas vendas',
    videoUrl: 'https://youtu.be/85FiHcB0h2k'
  },
  {
    id: 20,
    type: 'content' as const,
    title: 'Ordem de serviço e despesa na venda',
    videoUrl: 'https://youtu.be/2U_8sEGghog'
  },
  {
    id: 21,
    type: 'attention' as const,
    title: 'ATENÇÃO',
    content: 'Preste atenção especial às próximas informações sobre financeiro das vendas.'
  },
  {
    id: 22,
    type: 'content' as const,
    title: 'Financeiro das Vendas',
    videoUrl: 'https://youtu.be/3ZvW6BXWz9M'
  },
  {
    id: 23,
    type: 'content' as const,
    title: 'Cancelamento de Vendas',
    videoUrl: 'https://youtu.be/tWDigvOuhoI'
  },
  {
    id: 24,
    type: 'content' as const,
    title: 'Devolução de Venda',
    videoUrl: 'https://youtu.be/2kvCck5_3J8'
  },
  {
    id: 25,
    type: 'exercise' as const,
    title: 'Exercício 7',
    question: 'É possível alterar as informações de quantidade da venda após a mesma ser salva?',
    options: [
      { text: 'Sim, basta clicar na venda, ajustar a quantidade e salvar.', correct: true },
      { text: 'Não há possibilidade de alterar depois de uma venda já salva.', correct: false },
      { text: 'Sim, porém deve ser solicitado ao suporte.', correct: false }
    ],
    explanation: 'Para alterar a quantidade basta clicar na venda que deseja ajustar a quantidade, ao abri-lá no campo de quantidade, ajustar a quantidade de itens e salvar.'
  },
  {
    id: 26,
    type: 'content' as const,
    title: 'Cadastro de Compras',
    videoUrl: 'https://youtu.be/g_478ykfocY'
  },
  {
    id: 27,
    type: 'attention' as const,
    title: 'ATENÇÃO',
    content: 'Observe as informações importantes sobre o cadastro no módulo fiscal.'
  },
  {
    id: 28,
    type: 'content' as const,
    title: 'Cadastro pelo módulo Fiscal',
    videoUrl: 'https://youtu.be/1ysmoPHAIgg'
  },
  {
    id: 29,
    type: 'content' as const,
    title: 'Cancelamento de Compras',
    videoUrl: 'https://youtu.be/O1Ns4LfVRYw'
  },
  {
    id: 30,
    type: 'exercise' as const,
    title: 'Exercício 8',
    question: 'Se não houver o XML para dar a entrada no módulo de Compras, como pode ser feito a alimentação no estoque?',
    options: [
      { text: 'Manualmente pelo módulo de Compras, informando item, quantidade e custo.', correct: true },
      { text: 'Não há outra forma de dar entrada sem ser o XML.', correct: false },
      { text: 'Fornecedor pode informar pelo XML com login.', correct: false }
    ],
    explanation: 'É possível ser alimentado o estoque de maneira manual, indo no módulo de Compras > Novo > E ao clicar no item, informa-se manualmente o item, quantidade, custo e etc.'
  },
  {
    id: 31,
    type: 'content' as const,
    title: 'Centro de custos',
    videoUrl: 'https://youtu.be/-zP1NLkF1rU'
  },
  {
    id: 32,
    type: 'attention' as const,
    title: 'ATENÇÃO',
    content: 'Informações importantes sobre usuários e vendedores.'
  },
  {
    id: 33,
    type: 'content' as const,
    title: 'Novos Usuários e Vendedores',
    videoUrl: 'https://youtu.be/N71fhyCZHEc'
  },
  {
    id: 34,
    type: 'content' as const,
    title: 'Controle de Permissões',
    videoUrl: 'https://youtu.be/jmmOmvfjdjQ'
  },
  {
    id: 35,
    type: 'content' as const,
    title: 'Alteração do plano de contas',
    videoUrl: 'https://youtu.be/q6whViqaR6c'
  },
  {
    id: 36,
    type: 'content' as const,
    title: 'Emissão de Relatórios',
    videoUrl: 'https://youtu.be/_7RG2HKj99k'
  },
  {
    id: 37,
    type: 'content' as const,
    title: 'Configuração de NF-e',
    videoUrl: 'https://youtu.be/dpZFdIPY-u0'
  },
  {
    id: 38,
    type: 'exercise' as const,
    title: 'Exercício 9',
    question: 'Qual é o formato aceito no eGestor para emissão de notas?',
    options: [
      { text: 'Apenas certificado A1 é aceito por ser compatível com sistema em nuvem.', correct: true },
      { text: 'A3 e A1, ambos são compatíveis.', correct: false },
      { text: 'Apenas o formato A3.', correct: false }
    ],
    explanation: 'É possível apenas o certificado A1, pois sendo um sistema em nuvem o certificado A3 não é compatível com a acessibilidade entregue pela plataforma. Pois o A3 é necessário estar plugado à maquina que será emitida a nota fiscal, sendo assim a opção de emitir notas em qualquer lugar não se engloba neste quesito.'
  },
  {
    id: 39,
    type: 'content' as const,
    title: 'NFC-e',
    videoUrl: 'https://youtu.be/05rROTc4b_o'
  },
  {
    id: 40,
    type: 'attention' as const,
    title: 'ATENÇÃO',
    content: 'Preste atenção às configurações de tributação.'
  },
  {
    id: 41,
    type: 'content' as const,
    title: 'Configuração de Tributações',
    videoUrl: 'https://youtu.be/v9E4o_xnI6s'
  },
  {
    id: 42,
    type: 'content' as const,
    title: 'Cadastrar Certificado Digital',
    videoUrl: 'https://youtu.be/98pNNOHjRMo'
  },
  {
    id: 43,
    type: 'content' as const,
    title: 'Produção (Parte 1)',
    videoUrl: 'https://youtu.be/xiH4-dGR_D4'
  },
  {
    id: 44,
    type: 'content' as const,
    title: 'Produção (Parte 2)',
    videoUrl: 'https://youtu.be/knYpkzkcZTM'
  },
  {
    id: 45,
    type: 'content' as const,
    title: 'Gerar produção pela venda',
    videoUrl: 'https://youtu.be/b5Eyja95Crc'
  },
  {
    id: 46,
    type: 'content' as const,
    title: 'Está pronto para o exame?',
    content: 'Parabéns! Você concluiu todo o conteúdo do curso Expert eGestor. Agora é hora de testar seus conhecimentos com o exame final. Você precisa de pelo menos 80% de acertos para ser aprovado.'
  },
  {
    id: 47,
    type: 'exam' as const,
    title: 'Exame Final: Expert eGestor',
    examQuestions: [
      {
        question: 'Posso cadastrar meu cliente também como meu fornecedor?',
        options: [
          { text: 'Sim, basta que no momento do cadastro no campo "Tipo de contato" seja marcado a opção: "Fornecedor".', correct: true },
          { text: 'Não, contato deve ser apenas: cliente ou fornecedor ou transportador.', correct: false },
          { text: 'Todos os contatos cadastrados são automaticamente marcados com as três opções de: cliente, fornecedor e transportador.', correct: false }
        ]
      },
      {
        question: 'O ajuste de estoque possui qual finalidade?',
        options: [
          { text: 'A finalidade do ajuste é alterar a quantidade de produtos que foram movimentados fora do padrão, ou seja, não foram nem vendidos e nem comprados.', correct: true },
          { text: 'Tem como objetivo dar entrada da mercadoria pelo ajuste de estoque.', correct: false },
          { text: 'O ajuste de estoque tem como finalidade auxiliar a gestão para o controle de vendas e compras, gerando registro das mesmas pelo módulo "Ajuste de estoque".', correct: false }
        ]
      },
      {
        question: 'Como funciona o financeiro da venda e compra?',
        options: [
          { text: 'Quando é gerada a venda, ao ser inserido um item automaticamente o sistema gera o financeiro da mesma... A compra funciona da mesma maneira porém o financeiro é criado na aba "Pagamentos".', correct: true },
          { text: 'É necessário criar a compra e venda para depois ir no módulo financeiro para criar os recebimentos de ambas.', correct: false },
          { text: 'É preciso criar o lançamento financeiro e inserir os itens dentro do campo: Anotações adicionais...', correct: false }
        ]
      },
      {
        question: 'Qual é a diferença de gerar um financeiro a receber parcelado pela recorrência e um financeiro a receber parcelado pelo módulo financeiro - "recebimentos"?',
        options: [
          { text: 'O módulo recorrência possui o intuito de criar lançamentos automatizados de maneira recorrente... Já o lançamento financeiro direto será visualizado logo após ser salvo.', correct: true },
          { text: 'Ambos são a mesma coisa, funcionam da mesma forma.', correct: false }
        ]
      },
      {
        question: 'A conciliação bancária possui integração automática com o banco?',
        options: [
          { text: 'Não, na conciliação bancária o extrato OFX é enviado e a baixa dos lançamentos é feita manualmente.', correct: true },
          { text: 'Sim, todo o processo feito no banco é baixado automaticamente dentro do sistema.', correct: false },
          { text: 'Não, eu preciso configurar para aceitar que o sistema integre com as informações do banco...', correct: false }
        ]
      },
      {
        question: 'Qual é a forma de validação do boleto fácil?',
        options: [
          { text: 'Possuir conta PJ vinculada ao sistema, emitir um boleto de R$ 10,00 e pagá-lo.', correct: true },
          { text: 'Não precisa de validação, basta preencher as informações.', correct: false },
          { text: 'Não é necessário validar, pois as informações inseridas estarão corretas.', correct: false }
        ]
      },
      {
        question: 'É possível alterar as informações de quantidade da venda após a mesma ser salva?',
        options: [
          { text: 'Sim, basta clicar na venda, ajustar a quantidade e salvar.', correct: true },
          { text: 'Não há possibilidade de alterar depois de uma venda já salva.', correct: false },
          { text: 'Sim, porém deve ser solicitado ao suporte.', correct: false }
        ]
      },
      {
        question: 'Se não houver o XML para dar a entrada no módulo de Compras, como pode ser feito a alimentação no estoque?',
        options: [
          { text: 'Manualmente pelo módulo de Compras, informando item, quantidade e custo.', correct: true },
          { text: 'Não há outra forma de dar entrada sem ser o XML.', correct: false },
          { text: 'Fornecedor pode informar pelo XML com login.', correct: false }
        ]
      },
      {
        question: 'Qual é o formato aceito no eGestor para emissão de notas?',
        options: [
          { text: 'Apenas certificado A1 é aceito por ser compatível com sistema em nuvem.', correct: true },
          { text: 'A3 e A1, ambos são compatíveis.', correct: false },
          { text: 'Apenas o formato A3.', correct: false }
        ]
      }
    ]
  },
  {
    id: 48,
    type: 'final' as const,
    title: 'Resultado Final',
    content: 'Resultado do seu exame será exibido aqui.'
  }
];

export const getTotalSlides = () => {
  return courseSlides.length;
};

export const getSlideById = (id: number) => {
  return courseSlides.find(slide => slide.id === id);
};
