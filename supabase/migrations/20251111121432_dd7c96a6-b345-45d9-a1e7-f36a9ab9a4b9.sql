-- Adicionar campo exam_id na tabela slides para referenciar exames
ALTER TABLE slides ADD COLUMN IF NOT EXISTS exam_id uuid REFERENCES course_exams(id) ON DELETE SET NULL;

-- Criar index para otimização de queries
CREATE INDEX IF NOT EXISTS idx_slides_exam_id ON slides(exam_id);

-- Comentário explicativo
COMMENT ON COLUMN slides.exam_id IS 'Referência ao exame quando o tipo do slide é "exam"';