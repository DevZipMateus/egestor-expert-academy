
export interface SlideData {
  id: number;
  type: 'content' | 'exercise' | 'attention' | 'exam' | 'final';
  title: string;
  videoUrl?: string;
  content?: string;
  question?: string;
  options?: {
    text: string;
    correct: boolean;
  }[];
  examQuestions?: {
    question: string;
    options: {
      text: string;
      correct: boolean;
    }[];
  }[];
}

export const courseSlides: SlideData[] = [
  {
    id: 1,
    type: 'content',
    title: 'Clientes e Fornecedores',
    videoUrl: 'https://youtu.be/Q0S86C0qoOo'
  },
  {
    id: 2,
    type: 'content',
    title: 'Cadastrar cliente pela venda',
    videoUrl: 'https://youtu.be/mq9kEtE2T_I'
  },
  {
    id: 3,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Posso cadastrar meu cliente também como meu fornecedor?',
    options: [
      { text: 'Sim, basta marcar a opção "Fornecedor".', correct: true },
      { text: 'Não, deve ser apenas um tipo.', correct: false },
      { text: 'Todos os contatos são marcados automaticamente como os três.', correct: false }
    ]
  },
  {
    id: 4,
    type: 'content',
    title: 'Cadastro de Produtos',
    videoUrl: 'https://youtu.be/rcc7KTZ2d8I'
  },
  {
    id: 5,
    type: 'content',
    title: 'Cadastro de serviços',
    videoUrl: 'https://youtu.be/wVJQ_R_pJ2g'
  },
  {
    id: 6,
    type: 'content',
    title: 'Ajuste de Estoque',
    videoUrl: 'https://youtu.be/BsNaBabF2Ac'
  },
  {
    id: 7,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'O ajuste de estoque possui qual finalidade?',
    options: [
      { text: 'Ajustar produtos movimentados fora do padrão.', correct: true },
      { text: 'Dar entrada de mercadoria.', correct: false },
      { text: 'Controlar vendas e compras.', correct: false }
    ]
  },
  {
    id: 8,
    type: 'content',
    title: 'Controle Financeiro',
    videoUrl: 'https://youtu.be/DDLzuDmtGFA'
  },
  {
    id: 9,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Como funciona o financeiro da venda e compra?',
    options: [
      { text: 'Venda gera recebimento automático; compra na aba "Pagamentos".', correct: true },
      { text: 'É necessário lançar depois manualmente.', correct: false },
      { text: 'É lançado no campo de anotações.', correct: false }
    ]
  },
  {
    id: 10,
    type: 'content',
    title: 'Controle financeiro de saldos',
    videoUrl: 'https://youtu.be/C7imYXsu9sU'
  },
  {
    id: 11,
    type: 'content',
    title: 'Módulo de Recorrência',
    videoUrl: 'https://youtu.be/7SbWSTqxc1E'
  },
  {
    id: 12,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Diferença entre recorrência e parcelamento via recebimentos?',
    options: [
      { text: 'Recorrência gera lançamentos conforme o tempo.', correct: true },
      { text: 'Ambos funcionam da mesma forma.', correct: false }
    ]
  },
  {
    id: 13,
    type: 'content',
    title: 'Conciliação bancária',
    videoUrl: 'https://youtu.be/phkn30keyms'
  },
  {
    id: 14,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'A conciliação bancária possui integração automática?',
    options: [
      { text: 'Não. É feito manualmente via arquivo OFX.', correct: true },
      { text: 'Sim, baixa automático.', correct: false },
      { text: 'Integra com o banco, sem conciliação.', correct: false }
    ]
  },
  {
    id: 15,
    type: 'content',
    title: 'Emissão do Boleto Fácil',
    videoUrl: 'https://youtu.be/540j8opH0I8'
  },
  {
    id: 16,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Forma de validação do boleto fácil?',
    options: [
      { text: 'Conta PJ + boleto teste R$10,00.', correct: true },
      { text: 'Só preencher e emitir.', correct: false },
      { text: 'Não precisa validar.', correct: false }
    ]
  },
  {
    id: 17,
    type: 'content',
    title: 'Emissão de Boletos',
    videoUrl: 'https://youtu.be/GvT9zKTiJOo'
  },
  {
    id: 18,
    type: 'content',
    title: 'Cadastro de Vendas',
    videoUrl: 'https://youtu.be/VmM93pmXAQA'
  },
  {
    id: 19,
    type: 'content',
    title: 'Desconto nas vendas',
    videoUrl: 'https://youtu.be/85FiHcB0h2k'
  },
  {
    id: 20,
    type: 'content',
    title: 'Ordem de serviço e despesa na venda',
    videoUrl: 'https://youtu.be/2U_8sEGghog'
  },
  {
    id: 21,
    type: 'attention',
    title: 'ATENÇÃO',
    content: 'Preste atenção especial nos próximos conteúdos, pois são fundamentais para o domínio do eGestor.'
  },
  {
    id: 22,
    type: 'content',
    title: 'Financeiro das Vendas',
    videoUrl: 'https://youtu.be/3ZvW6BXWz9M'
  },
  {
    id: 23,
    type: 'content',
    title: 'Cancelamento de Vendas',
    videoUrl: 'https://youtu.be/tWDigvOuhoI'
  },
  {
    id: 24,
    type: 'content',
    title: 'Devolução de Venda',
    videoUrl: 'https://youtu.be/2kvCck5_3J8'
  },
  {
    id: 25,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'É possível alterar a quantidade de uma venda salva?',
    options: [
      { text: 'Sim, clique, ajuste e salve.', correct: true },
      { text: 'Não é possível.', correct: false },
      { text: 'Apenas via suporte.', correct: false }
    ]
  },
  {
    id: 26,
    type: 'content',
    title: 'Cadastro de Compras',
    videoUrl: 'https://youtu.be/g_478ykfocY'
  },
  {
    id: 27,
    type: 'attention',
    title: 'ATENÇÃO',
    content: 'O módulo de compras é essencial para controle de estoque e financeiro.'
  },
  {
    id: 28,
    type: 'content',
    title: 'Cadastro pelo módulo Fiscal',
    videoUrl: 'https://youtu.be/1ysmoPHAIgg'
  },
  {
    id: 29,
    type: 'content',
    title: 'Cancelamento de Compras',
    videoUrl: 'https://youtu.be/O1Ns4LfVRYw'
  },
  {
    id: 30,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Como alimentar estoque sem XML?',
    options: [
      { text: 'Manualmente no módulo de Compras.', correct: true },
      { text: 'Não é possível.', correct: false },
      { text: 'Fornecedor entra com login.', correct: false }
    ]
  },
  {
    id: 31,
    type: 'content',
    title: 'Centro de custos',
    videoUrl: 'https://youtu.be/-zP1NLkF1rU'
  },
  {
    id: 32,
    type: 'attention',
    title: 'ATENÇÃO',
    content: 'Centro de custos é fundamental para organização financeira da empresa.'
  },
  {
    id: 33,
    type: 'content',
    title: 'Novos Usuários e Vendedores',
    videoUrl: 'https://youtu.be/N71fhyCZHEc'
  },
  {
    id: 34,
    type: 'content',
    title: 'Controle de Permissões',
    videoUrl: 'https://youtu.be/jmmOmvfjdjQ'
  },
  {
    id: 35,
    type: 'content',
    title: 'Alteração do plano de contas',
    videoUrl: 'https://youtu.be/q6whViqaR6c'
  },
  {
    id: 36,
    type: 'content',
    title: 'Emissão de Relatórios',
    videoUrl: 'https://youtu.be/_7RG2HKj99k'
  },
  {
    id: 37,
    type: 'content',
    title: 'Configuração de NF-e',
    videoUrl: 'https://youtu.be/dpZFdIPY-u0'
  },
  {
    id: 38,
    type: 'exercise',
    title: 'Exercício de Fixação',
    question: 'Formato aceito para emissão de notas?',
    options: [
      { text: 'Apenas certificado A1.', correct: true },
      { text: 'A3 e A1.', correct: false },
      { text: 'Apenas A3.', correct: false }
    ]
  },
  {
    id: 39,
    type: 'content',
    title: 'NFC-e',
    videoUrl: 'https://youtu.be/05rROTc4b_o'
  },
  {
    id: 40,
    type: 'attention',
    title: 'ATENÇÃO',
    content: 'A configuração fiscal é crucial para compliance da empresa.'
  },
  {
    id: 41,
    type: 'content',
    title: 'Configuração de Tributações',
    videoUrl: 'https://youtu.be/v9E4o_xnI6s'
  },
  {
    id: 42,
    type: 'content',
    title: 'Cadastrar Certificado Digital',
    videoUrl: 'https://youtu.be/98pNNOHjRMo'
  },
  {
    id: 43,
    type: 'content',
    title: 'Produção (Parte 1)',
    videoUrl: 'https://youtu.be/xiH4-dGR_D4'
  },
  {
    id: 44,
    type: 'content',
    title: 'Produção (Parte 2)',
    videoUrl: 'https://youtu.be/knYpkzkcZTM'
  },
  {
    id: 45,
    type: 'content',
    title: 'Gerar produção pela venda',
    videoUrl: 'https://youtu.be/b5Eyja95Crc'
  },
  {
    id: 46,
    type: 'content',
    title: 'Está pronto para o exame?',
    content: 'Parabéns! Você concluiu todo o conteúdo do curso Expert eGestor. Agora é hora de testar seus conhecimentos no exame final. Você precisa acertar pelo menos 80% das questões para obter seu certificado.'
  },
  {
    id: 47,
    type: 'exam',
    title: 'Exame Final: Expert eGestor',
    examQuestions: [
      {
        question: 'Posso cadastrar meu cliente também como meu fornecedor?',
        options: [
          { text: 'Sim, basta marcar a opção "Fornecedor".', correct: true },
          { text: 'Não, deve ser apenas um tipo.', correct: false },
          { text: 'Todos os contatos são marcados automaticamente como os três.', correct: false }
        ]
      },
      {
        question: 'O ajuste de estoque possui qual finalidade?',
        options: [
          { text: 'Ajustar produtos movimentados fora do padrão.', correct: true },
          { text: 'Dar entrada de mercadoria.', correct: false },
          { text: 'Controlar vendas e compras.', correct: false }
        ]
      },
      {
        question: 'Como funciona o financeiro da venda e compra?',
        options: [
          { text: 'Venda gera recebimento automático; compra na aba "Pagamentos".', correct: true },
          { text: 'É necessário lançar depois manualmente.', correct: false },
          { text: 'É lançado no campo de anotações.', correct: false }
        ]
      },
      {
        question: 'Diferença entre recorrência e parcelamento via recebimentos?',
        options: [
          { text: 'Recorrência gera lançamentos conforme o tempo.', correct: true },
          { text: 'Ambos funcionam da mesma forma.', correct: false }
        ]
      },
      {
        question: 'A conciliação bancária possui integração automática?',
        options: [
          { text: 'Não. É feito manualmente via arquivo OFX.', correct: true },
          { text: 'Sim, baixa automático.', correct: false },
          { text: 'Integra com o banco, sem conciliação.', correct: false }
        ]
      },
      {
        question: 'Forma de validação do boleto fácil?',
        options: [
          { text: 'Conta PJ + boleto teste R$10,00.', correct: true },
          { text: 'Só preencher e emitir.', correct: false },
          { text: 'Não precisa validar.', correct: false }
        ]
      },
      {
        question: 'É possível alterar a quantidade de uma venda salva?',
        options: [
          { text: 'Sim, clique, ajuste e salve.', correct: true },
          { text: 'Não é possível.', correct: false },
          { text: 'Apenas via suporte.', correct: false }
        ]
      },
      {
        question: 'Como alimentar estoque sem XML?',
        options: [
          { text: 'Manualmente no módulo de Compras.', correct: true },
          { text: 'Não é possível.', correct: false },
          { text: 'Fornecedor entra com login.', correct: false }
        ]
      },
      {
        question: 'Formato aceito para emissão de notas?',
        options: [
          { text: 'Apenas certificado A1.', correct: true },
          { text: 'A3 e A1.', correct: false },
          { text: 'Apenas A3.', correct: false }
        ]
      }
    ]
  }
];

export const getTotalSlides = () => courseSlides.length;
export const getSlideById = (id: number) => courseSlides.find(slide => slide.id === id);
