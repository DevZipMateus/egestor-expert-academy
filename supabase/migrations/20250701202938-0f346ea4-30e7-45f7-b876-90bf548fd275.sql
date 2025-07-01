
-- Primeiro, vamos encontrar o ID do curso Expert eGestor
DO $$
DECLARE
  course_uuid uuid;
  module_clientes_uuid uuid;
  module_produtos_uuid uuid;
  module_vendas_uuid uuid;
  module_compras_uuid uuid;
  module_config_uuid uuid;
BEGIN
  -- Obter o ID do curso Expert eGestor
  SELECT id INTO course_uuid FROM public.courses WHERE nome = 'Expert eGestor';
  
  -- Obter IDs dos módulos
  SELECT id INTO module_clientes_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Clientes e Fornecedores';
  SELECT id INTO module_produtos_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Produtos e Estoque';
  SELECT id INTO module_vendas_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Vendas e Pagamentos';
  SELECT id INTO module_compras_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Relatórios e Análises';
  SELECT id INTO module_config_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Configurações Avançadas';
  
  -- Inserir slides do Módulo 1: Clientes e Fornecedores
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_clientes_uuid, 'Clientes e Fornecedores', 'content', 'Aprenda sobre o cadastro de clientes e fornecedores', 'https://youtu.be/Q0S86C0qoOo', 1, true),
  (course_uuid, module_clientes_uuid, 'Cadastrar cliente pela venda', 'content', 'Como cadastrar um cliente durante uma venda', 'https://youtu.be/mq9kEtE2T_I', 2, true);
  
  -- Inserir slides do Módulo 2: Produtos e Estoque
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_produtos_uuid, 'Cadastro de Produtos', 'content', 'Como cadastrar produtos no sistema', 'https://youtu.be/rcc7KTZ2d8I', 4, true),
  (course_uuid, module_produtos_uuid, 'Cadastro de serviços', 'content', 'Como cadastrar serviços no sistema', 'https://youtu.be/wVJQ_R_pJ2g', 5, true),
  (course_uuid, module_produtos_uuid, 'Ajuste de Estoque', 'content', 'Como fazer ajustes no estoque', 'https://youtu.be/BsNaBabF2Ac', 6, true);
  
  -- Inserir slides do Módulo 3: Vendas e Pagamentos
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Controle Financeiro', 'content', 'Aprenda sobre controle financeiro', 'https://youtu.be/DDLzuDmtGFA', 8, true),
  (course_uuid, module_vendas_uuid, 'Controle financeiro de saldos', 'content', 'Como controlar saldos financeiros', 'https://youtu.be/C7imYXsu9sU', 10, true),
  (course_uuid, module_vendas_uuid, 'Módulo de Recorrência', 'content', 'Sistema de recorrência no eGestor', 'https://youtu.be/7SbWSTqxc1E', 11, true),
  (course_uuid, module_vendas_uuid, 'Conciliação bancária', 'content', 'Como fazer conciliação bancária', 'https://youtu.be/phkn30keyms', 13, true),
  (course_uuid, module_vendas_uuid, 'Emissão do Boleto Fácil', 'content', 'Como configurar o Boleto Fácil', 'https://youtu.be/540j8opH0I8', 15, true),
  (course_uuid, module_vendas_uuid, 'Emissão de Boletos', 'content', 'Como emitir boletos', 'https://youtu.be/GvT9zKTiJOo', 17, true),
  (course_uuid, module_vendas_uuid, 'Cadastro de Vendas', 'content', 'Como cadastrar vendas', 'https://youtu.be/VmM93pmXAQA', 18, true),
  (course_uuid, module_vendas_uuid, 'Desconto nas vendas', 'content', 'Como aplicar descontos', 'https://youtu.be/85FiHcB0h2k', 19, true),
  (course_uuid, module_vendas_uuid, 'Ordem de serviço e despesa na venda', 'content', 'OS e despesas em vendas', 'https://youtu.be/2U_8sEGghog', 20, true),
  (course_uuid, module_vendas_uuid, 'ATENÇÃO', 'attention', 'Preste atenção nas próximas informações importantes', null, 21, true),
  (course_uuid, module_vendas_uuid, 'Financeiro das Vendas', 'content', 'Gestão financeira das vendas', 'https://youtu.be/3ZvW6BXWz9M', 22, true),
  (course_uuid, module_vendas_uuid, 'Cancelamento de Vendas', 'content', 'Como cancelar vendas', 'https://youtu.be/tWDigvOuhoI', 23, true),
  (course_uuid, module_vendas_uuid, 'Devolução de Venda', 'content', 'Como fazer devolução', 'https://youtu.be/2kvCck5_3J8', 24, true);
  
  -- Inserir slides do Módulo 4: Compras e Fiscal (usando módulo "Relatórios e Análises" existente)
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_compras_uuid, 'Cadastro de Compras', 'content', 'Como cadastrar compras', 'https://youtu.be/g_478ykfocY', 26, true),
  (course_uuid, module_compras_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre compras', null, 27, true),
  (course_uuid, module_compras_uuid, 'Cadastro pelo módulo Fiscal', 'content', 'Cadastro via módulo fiscal', 'https://youtu.be/1ysmoPHAIgg', 28, true),
  (course_uuid, module_compras_uuid, 'Cancelamento de Compras', 'content', 'Como cancelar compras', 'https://youtu.be/O1Ns4LfVRYw', 29, true);
  
  -- Inserir slides do Módulo 5: Configurações Avançadas
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_config_uuid, 'Centro de custos', 'content', 'Gestão de centro de custos', 'https://youtu.be/-zP1NLkF1rU', 31, true),
  (course_uuid, module_config_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre configurações', null, 32, true),
  (course_uuid, module_config_uuid, 'Novos Usuários e Vendedores', 'content', 'Gerenciamento de usuários', 'https://youtu.be/N71fhyCZHEc', 33, true),
  (course_uuid, module_config_uuid, 'Controle de Permissões', 'content', 'Sistema de permissões', 'https://youtu.be/jmmOmvfjdjQ', 34, true),
  (course_uuid, module_config_uuid, 'Alteração do plano de contas', 'content', 'Como alterar plano de contas', 'https://youtu.be/q6whViqaR6c', 35, true),
  (course_uuid, module_config_uuid, 'Emissão de Relatórios', 'content', 'Como emitir relatórios', 'https://youtu.be/_7RG2HKj99k', 36, true),
  (course_uuid, module_config_uuid, 'Configuração de NF-e', 'content', 'Configurar nota fiscal eletrônica', 'https://youtu.be/dpZFdIPY-u0', 37, true),
  (course_uuid, module_config_uuid, 'NFC-e', 'content', 'Configuração de NFC-e', 'https://youtu.be/05rROTc4b_o', 39, true),
  (course_uuid, module_config_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre NF-e', null, 40, true),
  (course_uuid, module_config_uuid, 'Configuração de Tributações', 'content', 'Sistema de tributações', 'https://youtu.be/v9E4o_xnI6s', 41, true),
  (course_uuid, module_config_uuid, 'Cadastrar Certificado Digital', 'content', 'Como cadastrar certificado', 'https://youtu.be/98pNNOHjRMo', 42, true),
  (course_uuid, module_config_uuid, 'Produção (Parte 1)', 'content', 'Sistema de produção - parte 1', 'https://youtu.be/xiH4-dGR_D4', 43, true),
  (course_uuid, module_config_uuid, 'Produção (Parte 2)', 'content', 'Sistema de produção - parte 2', 'https://youtu.be/knYpkzkcZTM', 44, true),
  (course_uuid, module_config_uuid, 'Gerar produção pela venda', 'content', 'Como gerar produção via venda', 'https://youtu.be/b5Eyja95Crc', 45, true),
  (course_uuid, module_config_uuid, 'Está pronto para o exame?', 'content', 'Preparação para o exame final', null, 46, true);
  
  -- Inserir slide do exame final
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, null, 'Exame Final', 'exam', 'Teste seus conhecimentos no exame final', null, 47, true);
  
  -- Inserir perguntas dos exercícios
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Posso cadastrar meu cliente também como meu fornecedor?', 'No cadastro do contato, é possível marcar uma ou mais opções em "Tipo de contato". Assim, o mesmo cadastro pode ser cliente e fornecedor.', 3),
  (course_uuid, 'O ajuste de estoque possui qual finalidade?', 'O ajuste é feito para corrigir movimentações fora do padrão, como avarias e remessas.', 7),
  (course_uuid, 'Como funciona o financeiro da venda e compra?', 'A venda cria automaticamente um recebimento; a compra também, mas via aba Pagamentos.', 9),
  (course_uuid, 'Diferença entre recorrência e parcelamento via recebimentos?', 'A recorrência gera os lançamentos progressivamente. O parcelamento via recebimentos mostra tudo de uma vez.', 12),
  (course_uuid, 'A conciliação bancária possui integração automática?', 'A conciliação é manual, a partir do arquivo OFX importado pelo usuário.', 14),
  (course_uuid, 'Forma de validação do boleto fácil?', 'A validação é feita através do pagamento de um boleto teste para confirmar o vínculo da conta PJ.', 16),
  (course_uuid, 'É possível alterar a quantidade de uma venda salva?', 'A venda pode ser reaberta e editada normalmente.', 25),
  (course_uuid, 'Como alimentar estoque sem XML?', 'O usuário pode inserir os dados manualmente no cadastro da compra.', 30),
  (course_uuid, 'Formato aceito para emissão de notas?', 'O sistema eGestor é 100% em nuvem e só é compatível com o modelo A1, que não precisa de dispositivo físico.', 38);
  
END $$;

-- Inserir as alternativas das perguntas
DO $$
DECLARE
  question_id_1 uuid;
  question_id_2 uuid;
  question_id_3 uuid;
  question_id_4 uuid;
  question_id_5 uuid;
  question_id_6 uuid;
  question_id_7 uuid;
  question_id_8 uuid;
  question_id_9 uuid;
BEGIN
  -- Obter IDs das perguntas
  SELECT id INTO question_id_1 FROM public.questions WHERE pergunta = 'Posso cadastrar meu cliente também como meu fornecedor?';
  SELECT id INTO question_id_2 FROM public.questions WHERE pergunta = 'O ajuste de estoque possui qual finalidade?';
  SELECT id INTO question_id_3 FROM public.questions WHERE pergunta = 'Como funciona o financeiro da venda e compra?';
  SELECT id INTO question_id_4 FROM public.questions WHERE pergunta = 'Diferença entre recorrência e parcelamento via recebimentos?';
  SELECT id INTO question_id_5 FROM public.questions WHERE pergunta = 'A conciliação bancária possui integração automática?';
  SELECT id INTO question_id_6 FROM public.questions WHERE pergunta = 'Forma de validação do boleto fácil?';
  SELECT id INTO question_id_7 FROM public.questions WHERE pergunta = 'É possível alterar a quantidade de uma venda salva?';
  SELECT id INTO question_id_8 FROM public.questions WHERE pergunta = 'Como alimentar estoque sem XML?';
  SELECT id INTO question_id_9 FROM public.questions WHERE pergunta = 'Formato aceito para emissão de notas?';
  
  -- Pergunta 1: Posso cadastrar meu cliente também como meu fornecedor?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_1, 'Sim, basta marcar a opção "Fornecedor".', true, 1),
  (question_id_1, 'Não, deve ser apenas um tipo.', false, 2),
  (question_id_1, 'Todos os contatos são marcados automaticamente como os três.', false, 3);
  
  -- Pergunta 2: O ajuste de estoque possui qual finalidade?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_2, 'Ajustar produtos movimentados fora do padrão.', true, 1),
  (question_id_2, 'Dar entrada de mercadoria.', false, 2),
  (question_id_2, 'Controlar vendas e compras.', false, 3);
  
  -- Pergunta 3: Como funciona o financeiro da venda e compra?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_3, 'Venda gera recebimento automático; compra na aba "Pagamentos".', true, 1),
  (question_id_3, 'Lançamento é manual.', false, 2),
  (question_id_3, 'Criar em anotações.', false, 3);
  
  -- Pergunta 4: Diferença entre recorrência e parcelamento via recebimentos?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_4, 'Recorrência gera lançamentos conforme o tempo.', true, 1),
  (question_id_4, 'São iguais.', false, 2);
  
  -- Pergunta 5: A conciliação bancária possui integração automática?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_5, 'Não. É feita manualmente via OFX.', true, 1),
  (question_id_5, 'Sim, baixa tudo.', false, 2),
  (question_id_5, 'Integra com banco.', false, 3);
  
  -- Pergunta 6: Forma de validação do boleto fácil?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_6, 'Conta PJ + boleto de R$ 10,00.', true, 1),
  (question_id_6, 'Só preencher.', false, 2),
  (question_id_6, 'Não precisa validar.', false, 3);
  
  -- Pergunta 7: É possível alterar a quantidade de uma venda salva?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_7, 'Sim, clique e edite.', true, 1),
  (question_id_7, 'Não.', false, 2),
  (question_id_7, 'Só com suporte.', false, 3);
  
  -- Pergunta 8: Como alimentar estoque sem XML?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_8, 'Manualmente no módulo de Compras.', true, 1),
  (question_id_8, 'Não tem como.', false, 2),
  (question_id_8, 'Fornecedor informa.', false, 3);
  
  -- Pergunta 9: Formato aceito para emissão de notas?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_id_9, 'Apenas certificado A1.', true, 1),
  (question_id_9, 'A1 e A3.', false, 2),
  (question_id_9, 'Apenas A3.', false, 3);
  
END $$;
