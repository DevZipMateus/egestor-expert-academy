
-- Migração robusta para o curso Expert eGestor
-- Limpar todos os dados existentes e recriar estrutura completa

-- 1. Limpar dados existentes
DELETE FROM public.question_options;
DELETE FROM public.questions;
DELETE FROM public.slides;
DELETE FROM public.course_modules;
DELETE FROM public.courses;

-- 2. Criar o curso Expert eGestor
INSERT INTO public.courses (id, nome, descricao, ordem, ativo) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Expert eGestor', 'Curso completo do sistema eGestor', 1, true);

-- 3. Criar os módulos do curso
INSERT INTO public.course_modules (id, course_id, nome, descricao, ordem, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Clientes e Fornecedores', 'Gestão de clientes e fornecedores', 1, true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Produtos e Estoque', 'Gerenciamento de produtos e controle de estoque', 2, true),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Vendas e Pagamentos', 'Processo de vendas e gestão de pagamentos', 3, true),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Compras e Fiscal', 'Gestão de compras e questões fiscais', 4, true),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Configurações Avançadas', 'Configurações avançadas do sistema', 5, true);

-- 4. Inserir todos os 47 slides do curso
INSERT INTO public.slides (course_id, module_id, titulo, tipo, conteudo, video_url, ordem, ativo) VALUES
-- Módulo 1: Clientes e Fornecedores (slides 1-3)
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Clientes e Fornecedores', 'content', 'Aprenda sobre o cadastro de clientes e fornecedores', 'https://youtu.be/Q0S86C0qoOo', 1, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Cadastrar cliente pela venda', 'content', 'Como cadastrar um cliente durante uma venda', 'https://youtu.be/mq9kEtE2T_I', 2, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Exercício: Clientes e Fornecedores', 'exercise', 'Teste seus conhecimentos sobre clientes e fornecedores', null, 3, true),

-- Módulo 2: Produtos e Estoque (slides 4-7)
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Cadastro de Produtos', 'content', 'Como cadastrar produtos no sistema', 'https://youtu.be/rcc7KTZ2d8I', 4, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Cadastro de serviços', 'content', 'Como cadastrar serviços no sistema', 'https://youtu.be/wVJQ_R_pJ2g', 5, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Ajuste de Estoque', 'content', 'Como fazer ajustes no estoque', 'https://youtu.be/BsNaBabF2Ac', 6, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Exercício: Ajuste de Estoque', 'exercise', 'Teste seus conhecimentos sobre ajuste de estoque', null, 7, true),

-- Módulo 3: Vendas e Pagamentos (slides 8-25)
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Controle Financeiro', 'content', 'Aprenda sobre controle financeiro', 'https://youtu.be/DDLzuDmtGFA', 8, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Exercício: Financeiro', 'exercise', 'Como funciona o financeiro das vendas e compras', null, 9, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Controle financeiro de saldos', 'content', 'Como controlar saldos financeiros', 'https://youtu.be/C7imYXsu9sU', 10, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Módulo de Recorrência', 'content', 'Sistema de recorrência no eGestor', 'https://youtu.be/7SbWSTqxc1E', 11, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Exercício: Recorrência', 'exercise', 'Diferença entre recorrência e parcelamento', null, 12, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Conciliação bancária', 'content', 'Como fazer conciliação bancária', 'https://youtu.be/phkn30keyms', 13, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Exercício: Conciliação', 'exercise', 'Teste sobre conciliação bancária', null, 14, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Emissão do Boleto Fácil', 'content', 'Como configurar o Boleto Fácil', 'https://youtu.be/540j8opH0I8', 15, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Exercício: Boleto Fácil', 'exercise', 'Validação do Boleto Fácil', null, 16, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Emissão de Boletos', 'content', 'Como emitir boletos', 'https://youtu.be/GvT9zKTiJOo', 17, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Cadastro de Vendas', 'content', 'Como cadastrar vendas', 'https://youtu.be/VmM93pmXAQA', 18, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Desconto nas vendas', 'content', 'Como aplicar descontos', 'https://youtu.be/85FiHcB0h2k', 19, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Ordem de serviço e despesa na venda', 'content', 'OS e despesas em vendas', 'https://youtu.be/2U_8sEGghog', 20, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'ATENÇÃO', 'attention', 'Preste atenção nas próximas informações importantes', null, 21, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Financeiro das Vendas', 'content', 'Gestão financeira das vendas', 'https://youtu.be/3ZvW6BXWz9M', 22, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Cancelamento de Vendas', 'content', 'Como cancelar vendas', 'https://youtu.be/tWDigvOuhoI', 23, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Devolução de Venda', 'content', 'Como fazer devolução', 'https://youtu.be/2kvCck5_3J8', 24, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Exercício: Vendas', 'exercise', 'Alteração de vendas salvas', null, 25, true),

-- Módulo 4: Compras e Fiscal (slides 26-30)
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Cadastro de Compras', 'content', 'Como cadastrar compras', 'https://youtu.be/g_478ykfocY', 26, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'ATENÇÃO', 'attention', 'Informações importantes sobre compras', null, 27, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Cadastro pelo módulo Fiscal', 'content', 'Cadastro via módulo fiscal', 'https://youtu.be/1ysmoPHAIgg', 28, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Cancelamento de Compras', 'content', 'Como cancelar compras', 'https://youtu.be/O1Ns4LfVRYw', 29, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Exercício: Compras', 'exercise', 'Alimentar estoque sem XML', null, 30, true),

-- Módulo 5: Configurações Avançadas (slides 31-46)
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Centro de custos', 'content', 'Gestão de centro de custos', 'https://youtu.be/-zP1NLkF1rU', 31, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'ATENÇÃO', 'attention', 'Informações importantes sobre configurações', null, 32, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Novos Usuários e Vendedores', 'content', 'Gerenciamento de usuários', 'https://youtu.be/N71fhyCZHEc', 33, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Controle de Permissões', 'content', 'Sistema de permissões', 'https://youtu.be/jmmOmvfjdjQ', 34, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Alteração do plano de contas', 'content', 'Como alterar plano de contas', 'https://youtu.be/q6whViqaR6c', 35, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Emissão de Relatórios', 'content', 'Como emitir relatórios', 'https://youtu.be/_7RG2HKj99k', 36, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Configuração de NF-e', 'content', 'Configurar nota fiscal eletrônica', 'https://youtu.be/dpZFdIPY-u0', 37, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Exercício: NF-e', 'exercise', 'Formato aceito para emissão de notas', null, 38, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'NFC-e', 'content', 'Configuração de NFC-e', 'https://youtu.be/05rROTc4b_o', 39, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'ATENÇÃO', 'attention', 'Informações importantes sobre NF-e', null, 40, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Configuração de Tributações', 'content', 'Sistema de tributações', 'https://youtu.be/v9E4o_xnI6s', 41, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Cadastrar Certificado Digital', 'content', 'Como cadastrar certificado', 'https://youtu.be/98pNNOHjRMo', 42, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Produção (Parte 1)', 'content', 'Sistema de produção - parte 1', 'https://youtu.be/xiH4-dGR_D4', 43, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Produção (Parte 2)', 'content', 'Sistema de produção - parte 2', 'https://youtu.be/knYpkzkcZTM', 44, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Gerar produção pela venda', 'content', 'Como gerar produção via venda', 'https://youtu.be/b5Eyja95Crc', 45, true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Está pronto para o exame?', 'content', 'Preparação para o exame final', null, 46, true),

-- Slide do exame final (slide 47)
('550e8400-e29b-41d4-a716-446655440000', null, 'Exame Final', 'exam', 'Teste seus conhecimentos no exame final', null, 47, true);

-- 5. Inserir as 9 perguntas dos exercícios
INSERT INTO public.questions (id, course_id, pergunta, explicacao, slide_id) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Posso cadastrar meu cliente também como meu fornecedor?', 'No cadastro do contato, é possível marcar uma ou mais opções em "Tipo de contato". Assim, o mesmo cadastro pode ser cliente e fornecedor.', 3),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'O ajuste de estoque possui qual finalidade?', 'O ajuste é feito para corrigir movimentações fora do padrão, como avarias e remessas.', 7),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Como funciona o financeiro da venda e compra?', 'A venda cria automaticamente um recebimento; a compra também, mas via aba Pagamentos.', 9),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Diferença entre recorrência e parcelamento via recebimentos?', 'A recorrência gera os lançamentos progressivamente. O parcelamento via recebimentos mostra tudo de uma vez.', 12),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'A conciliação bancária possui integração automática?', 'A conciliação é manual, a partir do arquivo OFX importado pelo usuário.', 14),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Forma de validação do boleto fácil?', 'A validação é feita através do pagamento de um boleto teste para confirmar o vínculo da conta PJ.', 16),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'É possível alterar a quantidade de uma venda salva?', 'A venda pode ser reaberta e editada normalmente.', 25),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Como alimentar estoque sem XML?', 'O usuário pode inserir os dados manualmente no cadastro da compra.', 30),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Formato aceito para emissão de notas?', 'O sistema eGestor é 100% em nuvem e só é compatível com o modelo A1, que não precisa de dispositivo físico.', 38);

-- 6. Inserir todas as opções das perguntas
-- Pergunta 1: Posso cadastrar meu cliente também como meu fornecedor?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Sim, basta marcar a opção "Fornecedor".', true, 1),
('650e8400-e29b-41d4-a716-446655440001', 'Não, deve ser apenas um tipo.', false, 2),
('650e8400-e29b-41d4-a716-446655440001', 'Todos os contatos são marcados automaticamente como os três.', false, 3);

-- Pergunta 2: O ajuste de estoque possui qual finalidade?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440002', 'Ajustar produtos movimentados fora do padrão.', true, 1),
('650e8400-e29b-41d4-a716-446655440002', 'Dar entrada de mercadoria.', false, 2),
('650e8400-e29b-41d4-a716-446655440002', 'Controlar vendas e compras.', false, 3);

-- Pergunta 3: Como funciona o financeiro da venda e compra?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'Venda gera recebimento automático; compra na aba "Pagamentos".', true, 1),
('650e8400-e29b-41d4-a716-446655440003', 'Lançamento é manual.', false, 2),
('650e8400-e29b-41d4-a716-446655440003', 'Criar em anotações.', false, 3);

-- Pergunta 4: Diferença entre recorrência e parcelamento via recebimentos?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440004', 'Recorrência gera lançamentos conforme o tempo.', true, 1),
('650e8400-e29b-41d4-a716-446655440004', 'São iguais.', false, 2);

-- Pergunta 5: A conciliação bancária possui integração automática?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440005', 'Não. É feita manualmente via OFX.', true, 1),
('650e8400-e29b-41d4-a716-446655440005', 'Sim, baixa tudo.', false, 2),
('650e8400-e29b-41d4-a716-446655440005', 'Integra com banco.', false, 3);

-- Pergunta 6: Forma de validação do boleto fácil?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440006', 'Conta PJ + boleto de R$ 10,00.', true, 1),
('650e8400-e29b-41d4-a716-446655440006', 'Só preencher.', false, 2),
('650e8400-e29b-41d4-a716-446655440006', 'Não precisa validar.', false, 3);

-- Pergunta 7: É possível alterar a quantidade de uma venda salva?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440007', 'Sim, clique e edite.', true, 1),
('650e8400-e29b-41d4-a716-446655440007', 'Não.', false, 2),
('650e8400-e29b-41d4-a716-446655440007', 'Só com suporte.', false, 3);

-- Pergunta 8: Como alimentar estoque sem XML?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440008', 'Manualmente no módulo de Compras.', true, 1),
('650e8400-e29b-41d4-a716-446655440008', 'Não tem como.', false, 2),
('650e8400-e29b-41d4-a716-446655440008', 'Fornecedor informa.', false, 3);

-- Pergunta 9: Formato aceito para emissão de notas?
INSERT INTO public.question_options (question_id, texto, correta, ordem) VALUES
('650e8400-e29b-41d4-a716-446655440009', 'Apenas certificado A1.', true, 1),
('650e8400-e29b-41d4-a716-446655440009', 'A1 e A3.', false, 2),
('650e8400-e29b-41d4-a716-446655440009', 'Apenas A3.', false, 3);

-- 7. Verificar se tudo foi inserido corretamente
SELECT 'Cursos criados:' as info, COUNT(*) as total FROM public.courses WHERE nome = 'Expert eGestor'
UNION ALL
SELECT 'Módulos criados:' as info, COUNT(*) as total FROM public.course_modules 
UNION ALL
SELECT 'Slides criados:' as info, COUNT(*) as total FROM public.slides
UNION ALL
SELECT 'Perguntas criadas:' as info, COUNT(*) as total FROM public.questions
UNION ALL
SELECT 'Opções criadas:' as info, COUNT(*) as total FROM public.question_options;
