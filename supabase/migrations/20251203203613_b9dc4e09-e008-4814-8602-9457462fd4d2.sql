-- Tabela de configurações de certificado por curso
CREATE TABLE public.certificate_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Imagem de fundo
  background_image_url text,
  
  -- Configurações do nome do aluno
  name_font_size integer DEFAULT 28,
  name_color text DEFAULT '#333333',
  name_y_position integer DEFAULT 340,
  name_bold boolean DEFAULT true,
  
  -- Configurações do email
  email_font_size integer DEFAULT 12,
  email_color text DEFAULT '#808080',
  email_y_position integer DEFAULT 312,
  show_email boolean DEFAULT true,
  
  -- Frase de conclusão
  conclusion_text text DEFAULT 'concluiu com êxito o curso',
  conclusion_font_size integer DEFAULT 16,
  conclusion_color text DEFAULT '#4d4d4d',
  conclusion_y_position integer DEFAULT 265,
  
  -- Data
  date_font_size integer DEFAULT 14,
  date_color text DEFAULT '#666666',
  date_y_position integer DEFAULT 225,
  
  -- Nota
  score_prefix text DEFAULT 'Nota:',
  score_font_size integer DEFAULT 18,
  score_color text DEFAULT '#333333',
  score_y_position integer DEFAULT 180,
  show_score boolean DEFAULT true,
  
  -- Número do certificado
  cert_number_font_size integer DEFAULT 10,
  cert_number_color text DEFAULT '#808080',
  show_cert_number boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.certificate_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage certificate configs"
ON public.certificate_configs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view certificate configs"
ON public.certificate_configs FOR SELECT
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_certificate_configs_updated_at
  BEFORE UPDATE ON public.certificate_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index para performance
CREATE INDEX idx_certificate_configs_course_id ON public.certificate_configs(course_id);