
-- Limpar dados antigos que não pertencem ao Expert eGestor
DELETE FROM public.question_options WHERE question_id IN (
  SELECT id FROM public.questions WHERE course_id NOT IN (
    SELECT id FROM public.courses WHERE nome = 'Expert eGestor'
  )
);

DELETE FROM public.questions WHERE course_id NOT IN (
  SELECT id FROM public.courses WHERE nome = 'Expert eGestor'
);

DELETE FROM public.slides WHERE course_id NOT IN (
  SELECT id FROM public.courses WHERE nome = 'Expert eGestor'
);

-- Inserir slides e perguntas organizados para o curso Expert eGestor
DO $$
DECLARE
  course_uuid uuid;
  module_clientes_uuid uuid;
  module_produtos_uuid uuid;
  module_vendas_uuid uuid;
  module_relatorios_uuid uuid;
  module_config_uuid uuid;
BEGIN
  -- Obter o ID do curso Expert eGestor
  SELECT id INTO course_uuid FROM public.courses WHERE nome = 'Expert eGestor';
  
  -- Se o curso não existir, criar
  IF course_uuid IS NULL THEN
    INSERT INTO public.courses (nome, descricao, ordem, ativo) 
    VALUES ('Expert eGestor', 'Curso completo do sistema eGestor', 1, true)
    RETURNING id INTO course_uuid;
  END IF;
  
  -- Obter ou criar módulos
  SELECT id INTO module_clientes_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Clientes e Fornecedores';
  IF module_clientes_uuid IS NULL THEN
    INSERT INTO public.course_modules (course_id, nome, descricao, ordem, ativo)
    VALUES (course_uuid, 'Clientes e Fornecedores', 'Gestão de clientes e fornecedores', 1, true)
    RETURNING id INTO module_clientes_uuid;
  END IF;
  
  SELECT id INTO module_produtos_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Produtos e Estoque';
  IF module_produtos_uuid IS NULL THEN
    INSERT INTO public.course_modules (course_id, nome, descricao, ordem, ativo)
    VALUES (course_uuid, 'Produtos e Estoque', 'Gerenciamento de produtos e controle de estoque', 2, true)
    RETURNING id INTO module_produtos_uuid;
  END IF;
  
  SELECT id INTO module_vendas_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Vendas e Pagamentos';
  IF module_vendas_uuid IS NULL THEN
    INSERT INTO public.course_modules (course_id, nome, descricao, ordem, ativo)
    VALUES (course_uuid, 'Vendas e Pagamentos', 'Processo de vendas e gestão de pagamentos', 3, true)
    RETURNING id INTO module_vendas_uuid;
  END IF;
  
  SELECT id INTO module_relatorios_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Relatórios e Análises';
  IF module_relatorios_uuid IS NULL THEN
    INSERT INTO public.course_modules (course_id, nome, descricao, ordem, ativo)
    VALUES (course_uuid, 'Relatórios e Análises', 'Relatórios e análises de dados', 4, true)
    RETURNING id INTO module_relatorios_uuid;
  END IF;
  
  SELECT id INTO module_config_uuid FROM public.course_modules WHERE course_id = course_uuid AND nome = 'Configurações Avançadas';
  IF module_config_uuid IS NULL THEN
    INSERT INTO public.course_modules (course_id, nome, descricao, ordem, ativo)
    VALUES (course_uuid, 'Configurações Avançadas', 'Configurações avançadas do sistema', 5, true)
    RETURNING id INTO module_config_uuid;
  END IF;
  
  -- Inserir slides do Módulo 1: Clientes e Fornecedores
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_clientes_uuid, 'Clientes e Fornecedores', 'content', 'Aprenda sobre o cadastro de clientes e fornecedores', 'https://youtu.be/Q0S86C0qoOo', 1, true),
  (course_uuid, module_clientes_uuid, 'Cadastrar cliente pela venda', 'content', 'Como cadastrar um cliente durante uma venda', 'https://youtu.be/mq9kEtE2T_I', 2, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_clientes_uuid, 'Exercício: Clientes e Fornecedores', 'exercise', 'Teste seus conhecimentos sobre clientes e fornecedores', null, 3, true);
  
  -- Inserir slides do Módulo 2: Produtos e Estoque
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_produtos_uuid, 'Cadastro de Produtos', 'content', 'Como cadastrar produtos no sistema', 'https://youtu.be/rcc7KTZ2d8I', 4, true),
  (course_uuid, module_produtos_uuid, 'Cadastro de serviços', 'content', 'Como cadastrar serviços no sistema', 'https://youtu.be/wVJQ_R_pJ2g', 5, true),
  (course_uuid, module_produtos_uuid, 'Ajuste de Estoque', 'content', 'Como fazer ajustes no estoque', 'https://youtu.be/BsNaBabF2Ac', 6, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_produtos_uuid, 'Exercício: Ajuste de Estoque', 'exercise', 'Teste seus conhecimentos sobre ajuste de estoque', null, 7, true);
  
  -- Inserir slides do Módulo 3: Vendas e Pagamentos
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Controle Financeiro', 'content', 'Aprenda sobre controle financeiro', 'https://youtu.be/DDLzuDmtGFA', 8, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Exercício: Financeiro', 'exercise', 'Como funciona o financeiro das vendas e compras', null, 9, true);
  
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Controle financeiro de saldos', 'content', 'Como controlar saldos financeiros', 'https://youtu.be/C7imYXsu9sU', 10, true),
  (course_uuid, module_vendas_uuid, 'Módulo de Recorrência', 'content', 'Sistema de recorrência no eGestor', 'https://youtu.be/7SbWSTqxc1E', 11, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Exercício: Recorrência', 'exercise', 'Diferença entre recorrência e parcelamento', null, 12, true);
  
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Conciliação bancária', 'content', 'Como fazer conciliação bancária', 'https://youtu.be/phkn30keyms', 13, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Exercício: Conciliação', 'exercise', 'Teste sobre conciliação bancária', null, 14, true);
  
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Emissão do Boleto Fácil', 'content', 'Como configurar o Boleto Fácil', 'https://youtu.be/540j8opH0I8', 15, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Exercício: Boleto Fácil', 'exercise', 'Validação do Boleto Fácil', null, 16, true);
  
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Emissão de Boletos', 'content', 'Como emitir boletos', 'https://youtu.be/GvT9zKTiJOo', 17, true),
  (course_uuid, module_vendas_uuid, 'Cadastro de Vendas', 'content', 'Como cadastrar vendas', 'https://youtu.be/VmM93pmXAQA', 18, true),
  (course_uuid, module_vendas_uuid, 'Desconto nas vendas', 'content', 'Como aplicar descontos', 'https://youtu.be/85FiHcB0h2k', 19, true),
  (course_uuid, module_vendas_uuid, 'Ordem de serviço e despesa na venda', 'content', 'OS e despesas em vendas', 'https://youtu.be/2U_8sEGghog', 20, true),
  (course_uuid, module_vendas_uuid, 'ATENÇÃO', 'attention', 'Preste atenção nas próximas informações importantes', null, 21, true),
  (course_uuid, module_vendas_uuid, 'Financeiro das Vendas', 'content', 'Gestão financeira das vendas', 'https://youtu.be/3ZvW6BXWz9M', 22, true),
  (course_uuid, module_vendas_uuid, 'Cancelamento de Vendas', 'content', 'Como cancelar vendas', 'https://youtu.be/tWDigvOuhoI', 23, true),
  (course_uuid, module_vendas_uuid, 'Devolução de Venda', 'content', 'Como fazer devolução', 'https://youtu.be/2kvCck5_3J8', 24, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_vendas_uuid, 'Exercício: Vendas', 'exercise', 'Alteração de vendas salvas', null, 25, true);
  
  -- Inserir slides do Módulo 4: Relatórios e Análises (usando para Compras)
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_relatorios_uuid, 'Cadastro de Compras', 'content', 'Como cadastrar compras', 'https://youtu.be/g_478ykfocY', 26, true),
  (course_uuid, module_relatorios_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre compras', null, 27, true),
  (course_uuid, module_relatorios_uuid, 'Cadastro pelo módulo Fiscal', 'content', 'Cadastro via módulo fiscal', 'https://youtu.be/1ysmoPHAIgg', 28, true),
  (course_uuid, module_relatorios_uuid, 'Cancelamento de Compras', 'content', 'Como cancelar compras', 'https://youtu.be/O1Ns4LfVRYw', 29, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_relatorios_uuid, 'Exercício: Compras', 'exercise', 'Alimentar estoque sem XML', null, 30, true);
  
  -- Inserir slides do Módulo 5: Configurações Avançadas
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_config_uuid, 'Centro de custos', 'content', 'Gestão de centro de custos', 'https://youtu.be/-zP1NLkF1rU', 31, true),
  (course_uuid, module_config_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre configurações', null, 32, true),
  (course_uuid, module_config_uuid, 'Novos Usuários e Vendedores', 'content', 'Gerenciamento de usuários', 'https://youtu.be/N71fhyCZHEc', 33, true),
  (course_uuid, module_config_uuid, 'Controle de Permissões', 'content', 'Sistema de permissões', 'https://youtu.be/jmmOmvfjdjQ', 34, true),
  (course_uuid, module_config_uuid, 'Alteração do plano de contas', 'content', 'Como alterar plano de contas', 'https://youtu.be/q6whViqaR6c', 35, true),
  (course_uuid, module_config_uuid, 'Emissão de Relatórios', 'content', 'Como emitir relatórios', 'https://youtu.be/_7RG2HKj99k', 36, true),
  (course_uuid, module_config_uuid, 'Configuração de NF-e', 'content', 'Configurar nota fiscal eletrônica', 'https://youtu.be/dpZFdIPY-u0', 37, true);
  
  -- Slide de exercício
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_config_uuid, 'Exercício: NF-e', 'exercise', 'Formato aceito para emissão de notas', null, 38, true);
  
  INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
  (course_uuid, module_config_uuid, 'NFC-e', 'content', 'Configuração de NFC-e', 'https://youtu.be/05rROTc4b_o', 39, true),
  (course_uuid, module_config_uuid, 'ATENÇÃO', 'attention', 'Informações importantes sobre NF-e', null, 40, true),
  (course_uuid, module_config_uuid, 'Configuração de Tributações', 'content', 'Sistema de tributações', 'https://youtu.be/v9E4o_xnI6s', 41, true),
  (course_uuid, module_config_uuid, 'Cadastrar Certificado Digital', 'content', 'Como cadastrar certificado', 'https://youtu.be/98pNNOHjRMo', 42, true),
  (course_uuid, module_config_uuid, 'Produção (Parte 1)', 'content', 'Sistema de produção - parte 1', 'https://youtu.be/xiH4-dGR_D4', 43, true),
  (course_uuid, module_config_uuid, 'Produção (Parte 2)', 'content', 'Sistema de produção - parte 2', 'https://youtu.be/knYpkzkcZTM', 44, true),
  (course_uuid, module_config_uuid, 'Gerar produção pela venda', 'content', 'Como gerar produção via venda', 'https://youtu.be/b5Eyja95Crc', 45, true),
  (course_uuid, module_config_uuid, 'Está pronto para o exame?', 'content', 'Preparação para o exame final', null, 46, true);
  
  -- Inserir slide do exame final
  INSERT INTO public.slides (course_id, titulo, tipo, conteudo, ordem, ativo) VALUES
  (course_uuid, 'Exame Final', 'exam', 'Teste seus conhecimentos no exame final', 47, true);
  
END $$;

-- Inserir perguntas e opções
DO $$
DECLARE
  course_uuid uuid;
  question_1_uuid uuid;
  question_2_uuid uuid;
  question_3_uuid uuid;
  question_4_uuid uuid;
  question_5_uuid uuid;
  question_6_uuid uuid;
  question_7_uuid uuid;
  question_8_uuid uuid;
  question_9_uuid uuid;
BEGIN
  -- Obter o ID do curso Expert eGestor
  SELECT id INTO course_uuid FROM public.courses WHERE nome = 'Expert eGestor';
  
  -- Inserir perguntas dos exercícios
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Posso cadastrar meu cliente também como meu fornecedor?', 'No cadastro do contato, é possível marcar uma ou mais opções em "Tipo de contato". Assim, o mesmo cadastro pode ser cliente e fornecedor.', 3)
  RETURNING id INTO question_1_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'O ajuste de estoque possui qual finalidade?', 'O ajuste é feito para corrigir movimentações fora do padrão, como avarias e remessas.', 7)
  RETURNING id INTO question_2_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Como funciona o financeiro da venda e compra?', 'A venda cria automaticamente um recebimento; a compra também, mas via aba Pagamentos.', 9)
  RETURNING id INTO question_3_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Diferença entre recorrência e parcelamento via recebimentos?', 'A recorrência gera os lançamentos progressivamente. O parcelamento via recebimentos mostra tudo de uma vez.', 12)
  RETURNING id INTO question_4_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'A conciliação bancária possui integração automática?', 'A conciliação é manual, a partir do arquivo OFX importado pelo usuário.', 14)
  RETURNING id INTO question_5_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Forma de validação do boleto fácil?', 'A validação é feita através do pagamento de um boleto teste para confirmar o vínculo da conta PJ.', 16)
  RETURNING id INTO question_6_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'É possível alterar a quantidade de uma venda salva?', 'A venda pode ser reaberta e editada normalmente.', 25)
  RETURNING id INTO question_7_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Como alimentar estoque sem XML?', 'O usuário pode inserir os dados manualmente no cadastro da compra.', 30)
  RETURNING id INTO question_8_uuid;
  
  INSERT INTO public.questions (course_id, pergunta, explicacao, slide_id) VALUES
  (course_uuid, 'Formato aceito para emissão de notas?', 'O sistema eGestor é 100% em nuvem e só é compatível com o modelo A1, que não precisa de dispositivo físico.', 38)
  RETURNING id INTO question_9_uuid;
  
  -- Inserir as opções das perguntas
  -- Pergunta 1: Posso cadastrar meu cliente também como meu fornecedor?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_1_uuid, 'Sim, basta marcar a opção "Fornecedor".', true, 1),
  (question_1_uuid, 'Não, deve ser apenas um tipo.', false, 2),
  (question_1_uuid, 'Todos os contatos são marcados automaticamente como os três.', false, 3);
  
  -- Pergunta 2: O ajuste de estoque possui qual finalidade?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_2_uuid, 'Ajustar produtos movimentados fora do padrão.', true, 1),
  (question_2_uuid, 'Dar entrada de mercadoria.', false, 2),
  (question_2_uuid, 'Controlar vendas e compras.', false, 3);
  
  -- Pergunta 3: Como funciona o financeiro da venda e compra?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_3_uuid, 'Venda gera recebimento automático; compra na aba "Pagamentos".', true, 1),
  (question_3_uuid, 'Lançamento é manual.', false, 2),
  (question_3_uuid, 'Criar em anotações.', false, 3);
  
  -- Pergunta 4: Diferença entre recorrência e parcelamento via recebimentos?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_4_uuid, 'Recorrência gera lançamentos conforme o tempo.', true, 1),
  (question_4_uuid, 'São iguais.', false, 2);
  
  -- Pergunta 5: A conciliação bancária possui integração automática?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_5_uuid, 'Não. É feita manualmente via OFX.', true, 1),
  (question_5_uuid, 'Sim, baixa tudo.', false, 2),
  (question_5_uuid, 'Integra com banco.', false, 3);
  
  -- Pergunta 6: Forma de validação do boleto fácil?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_6_uuid, 'Conta PJ + boleto de R$ 10,00.', true, 1),
  (question_6_uuid, 'Só preencher.', false, 2),
  (question_6_uuid, 'Não precisa validar.', false, 3);
  
  -- Pergunta 7: É possível alterar a quantidade de uma venda salva?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_7_uuid, 'Sim, clique e edite.', true, 1),
  (question_7_uuid, 'Não.', false, 2),
  (question_7_uuid, 'Só com suporte.', false, 3);
  
  -- Pergunta 8: Como alimentar estoque sem XML?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_8_uuid, 'Manualmente no módulo de Compras.', true, 1),
  (question_8_uuid, 'Não tem como.', false, 2),
  (question_8_uuid, 'Fornecedor informa.', false, 3);
  
  -- Pergunta 9: Formato aceito para emissão de notas?
  INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
  (question_9_uuid, 'Apenas certificado A1.', true, 1),
  (question_9_uuid, 'A1 e A3.', false, 2),
  (question_9_uuid, 'Apenas A3.', false, 3);
  
END $$;
