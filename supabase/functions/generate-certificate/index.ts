import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para converter hex para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.2, g: 0.2, b: 0.2 };
}

// Configurações padrão
const defaultConfig = {
  background_image_url: null,
  name_font_size: 28,
  name_color: '#333333',
  name_y_position: 340,
  name_bold: true,
  email_font_size: 12,
  email_color: '#808080',
  email_y_position: 312,
  show_email: true,
  conclusion_text: 'concluiu com êxito o curso',
  conclusion_font_size: 16,
  conclusion_color: '#4d4d4d',
  conclusion_y_position: 265,
  date_font_size: 14,
  date_color: '#666666',
  date_y_position: 225,
  score_prefix: 'Nota:',
  score_font_size: 18,
  score_color: '#333333',
  score_y_position: 180,
  show_score: true,
  cert_number_font_size: 10,
  cert_number_color: '#808080',
  show_cert_number: true,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { examAttemptId } = await req.json();

    if (!examAttemptId) {
      throw new Error('examAttemptId é obrigatório');
    }

    // Buscar informações da tentativa de exame
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('exam_attempts')
      .select(`
        *,
        exam:course_exams(
          course_id,
          course:courses(titulo, slug)
        )
      `)
      .eq('id', examAttemptId)
      .single();

    if (attemptError || !attempt) {
      console.error('Erro ao buscar tentativa:', attemptError);
      throw new Error('Tentativa de exame não encontrada');
    }

    if (!attempt.passed) {
      throw new Error('Aluno não foi aprovado no exame');
    }

    // Buscar perfil do usuário separadamente
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('nome, email')
      .eq('id', attempt.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error('Perfil do usuário não encontrado');
    }

    // Verificar se já existe certificado
    const { data: existingCert } = await supabaseClient
      .from('certificates')
      .select('id')
      .eq('exam_attempt_id', examAttemptId)
      .maybeSingle();

    if (existingCert) {
      throw new Error('Certificado já foi gerado para esta tentativa');
    }

    // Buscar configurações do certificado para este curso
    const courseId = attempt.exam.course_id;
    const { data: configData } = await supabaseClient
      .from('certificate_configs')
      .select('*')
      .eq('course_id', courseId)
      .maybeSingle();

    // Usar configurações do banco ou defaults
    const config = configData || defaultConfig;

    // Gerar número do certificado
    const courseSlug = attempt.exam.course.slug.toUpperCase();
    const year = new Date().getFullYear();
    
    const { count } = await supabaseClient
      .from('certificates')
      .select('*', { count: 'exact', head: true });
    
    const sequential = String((count || 0) + 1).padStart(4, '0');
    const certificateNumber = `CERT-${courseSlug}-${year}-${sequential}`;

    // Criar o PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
    const { width, height } = page.getSize();

    // Carregar imagem de fundo
    let backgroundImageUrl = config.background_image_url;
    
    // Se não há imagem configurada, usar a padrão
    if (!backgroundImageUrl) {
      backgroundImageUrl = 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/e-gestor-curso-bajete/assets/3cqud4n2jj7e/certificado.png';
    }

    try {
      const imageResponse = await fetch(backgroundImageUrl);
      const imageBytes = await imageResponse.arrayBuffer();
      
      // Detectar tipo de imagem e embedar
      const isPng = backgroundImageUrl.toLowerCase().includes('.png') || 
                    imageResponse.headers.get('content-type')?.includes('png');
      
      const image = isPng 
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
      
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    } catch (imageError) {
      console.error('Erro ao carregar imagem de fundo:', imageError);
      // Continuar sem imagem de fundo
    }

    // Embed fontes
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Formatação da data
    const dataEmissao = new Date();
    const opcoes: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const dataFormatada = dataEmissao.toLocaleDateString('pt-BR', opcoes);

    // Textos
    const nomeAluno = profile.nome;
    const cursoTitulo = attempt.exam.course.titulo;
    const nota = `${attempt.score}%`;
    const fraseConclusao = `${config.conclusion_text} "${cursoTitulo}"`;

    // Centralizar e desenhar textos
    const centerX = width / 2;

    // Nome do aluno
    const nameFont = config.name_bold ? boldFont : regularFont;
    const nameColor = hexToRgb(config.name_color);
    const nomeWidth = nameFont.widthOfTextAtSize(nomeAluno, config.name_font_size);
    page.drawText(nomeAluno, {
      x: centerX - (nomeWidth / 2),
      y: config.name_y_position,
      size: config.name_font_size,
      font: nameFont,
      color: rgb(nameColor.r, nameColor.g, nameColor.b),
    });

    // Email do aluno (se configurado para exibir)
    if (config.show_email) {
      const emailAluno = profile.email;
      const emailColor = hexToRgb(config.email_color);
      const emailWidth = regularFont.widthOfTextAtSize(emailAluno, config.email_font_size);
      page.drawText(emailAluno, {
        x: centerX - (emailWidth / 2),
        y: config.email_y_position,
        size: config.email_font_size,
        font: regularFont,
        color: rgb(emailColor.r, emailColor.g, emailColor.b),
      });
    }

    // Frase de conclusão
    const conclusionColor = hexToRgb(config.conclusion_color);
    const fraseWidth = regularFont.widthOfTextAtSize(fraseConclusao, config.conclusion_font_size);
    page.drawText(fraseConclusao, {
      x: centerX - (fraseWidth / 2),
      y: config.conclusion_y_position,
      size: config.conclusion_font_size,
      font: regularFont,
      color: rgb(conclusionColor.r, conclusionColor.g, conclusionColor.b),
    });

    // Data
    const dateColor = hexToRgb(config.date_color);
    const dataWidth = regularFont.widthOfTextAtSize(dataFormatada, config.date_font_size);
    page.drawText(dataFormatada, {
      x: centerX - (dataWidth / 2),
      y: config.date_y_position,
      size: config.date_font_size,
      font: regularFont,
      color: rgb(dateColor.r, dateColor.g, dateColor.b),
    });

    // Nota (se configurado para exibir)
    if (config.show_score) {
      const notaTexto = `${config.score_prefix} ${nota}`;
      const scoreColor = hexToRgb(config.score_color);
      const notaWidth = boldFont.widthOfTextAtSize(notaTexto, config.score_font_size);
      page.drawText(notaTexto, {
        x: centerX - (notaWidth / 2),
        y: config.score_y_position,
        size: config.score_font_size,
        font: boldFont,
        color: rgb(scoreColor.r, scoreColor.g, scoreColor.b),
      });
    }

    // Número do certificado (se configurado para exibir)
    if (config.show_cert_number) {
      const certNumTexto = `Certificado: ${certificateNumber}`;
      const certColor = hexToRgb(config.cert_number_color);
      const certNumWidth = regularFont.widthOfTextAtSize(certNumTexto, config.cert_number_font_size);
      page.drawText(certNumTexto, {
        x: width - certNumWidth - 30,
        y: 30,
        size: config.cert_number_font_size,
        font: regularFont,
        color: rgb(certColor.r, certColor.g, certColor.b),
      });
    }

    // Salvar o PDF
    const pdfBytes = await pdfDoc.save();
    
    // Salvar certificado no banco de dados
    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .insert({
        user_id: attempt.user_id,
        course_id: attempt.exam.course_id,
        exam_attempt_id: examAttemptId,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (certError) {
      throw certError;
    }

    console.log('Certificado gerado com sucesso:', certificateNumber);

    // Retornar o PDF como resposta
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${certificateNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
