import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Gerar número do certificado
    const courseSlug = attempt.exam.course.slug.toUpperCase();
    const year = new Date().getFullYear();
    
    const { count } = await supabaseClient
      .from('certificates')
      .select('*', { count: 'exact', head: true });
    
    const sequential = String((count || 0) + 1).padStart(4, '0');
    const certificateNumber = `CERT-${courseSlug}-${year}-${sequential}`;

    // Baixar a imagem do certificado do public folder
    // Como a Edge Function não pode acessar arquivos locais, vamos precisar
    // usar a URL completa da aplicação ou fazer upload da imagem para o Supabase Storage
    const imageUrl = 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/e-gestor-curso-bajete/assets/3cqud4n2jj7e/certificado.png';
    const imageResponse = await fetch(imageUrl);
    const imageBytes = await imageResponse.arrayBuffer();

    // Criar o PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape

    // Embed a imagem de fundo
    const pngImage = await pdfDoc.embedPng(imageBytes);
    const { width, height } = page.getSize();
    
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

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
    const fraseConclusao = `concluiu com êxito o curso "${cursoTitulo}"`;

    // Centralizar e desenhar textos
    const centerX = width / 2;

    // Nome do aluno
    const nomeWidth = boldFont.widthOfTextAtSize(nomeAluno, 28);
    page.drawText(nomeAluno, {
      x: centerX - (nomeWidth / 2),
      y: 330,
      size: 28,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Email do aluno (menor, abaixo do nome)
    const emailAluno = profile.email;
    const emailWidth = regularFont.widthOfTextAtSize(emailAluno, 12);
    page.drawText(emailAluno, {
      x: centerX - (emailWidth / 2),
      y: 305,
      size: 12,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Frase de conclusão
    const fraseWidth = regularFont.widthOfTextAtSize(fraseConclusao, 16);
    page.drawText(fraseConclusao, {
      x: centerX - (fraseWidth / 2),
      y: 280,
      size: 16,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Data
    const dataWidth = regularFont.widthOfTextAtSize(dataFormatada, 14);
    page.drawText(dataFormatada, {
      x: centerX - (dataWidth / 2),
      y: 250,
      size: 14,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Nota
    const notaTexto = `Nota: ${nota}`;
    const notaWidth = boldFont.widthOfTextAtSize(notaTexto, 18);
    page.drawText(notaTexto, {
      x: centerX - (notaWidth / 2),
      y: 220,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Número do certificado (canto inferior direito)
    const certNumTexto = `Certificado: ${certificateNumber}`;
    const certNumWidth = regularFont.widthOfTextAtSize(certNumTexto, 10);
    page.drawText(certNumTexto, {
      x: width - certNumWidth - 30,
      y: 30,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Salvar o PDF
    const pdfBytes = await pdfDoc.save();

    // Upload para storage (opcional - se você tiver bucket configurado)
    // Aqui vamos apenas salvar o registro sem PDF URL por enquanto
    
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
