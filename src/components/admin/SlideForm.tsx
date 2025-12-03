import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, AlertCircle, Upload, Bold, Italic, Underline, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SlideFormProps {
  moduleId: string;
  courseId: string;
  slideId?: number;
  onSave: () => void;
  onCancel: () => void;
}

interface QuestionOption {
  id?: string;
  texto: string;
  correta: boolean;
  ordem: number;
}

interface ExerciseQuestion {
  id?: string;
  pergunta: string;
  explicacao: string;
  options: QuestionOption[];
}

const SlideForm = ({ moduleId, courseId, slideId, onSave, onCancel }: SlideFormProps) => {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Array<{ id: string; titulo: string }>>([]);
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'content',
    conteudo: '',
    video_url: '',
    image_url: '',
    exam_id: '',
    ordem: 1,
    ativo: true,
  });

  useEffect(() => {
    fetchExams();
    if (slideId) {
      fetchSlide();
      fetchQuestions();
    } else {
      fetchNextOrder();
    }
  }, [slideId, moduleId]);

  useEffect(() => {
    // Auto-adicionar pergunta vazia quando tipo mudar para exercise
    if (formData.tipo === 'exercise' && questions.length === 0 && !slideId) {
      addQuestion();
    }
  }, [formData.tipo]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('course_exams')
        .select('id, titulo')
        .eq('course_id', courseId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
    }
  };

  const fetchSlide = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('id', slideId)
        .single();

      if (error) throw error;
      
      setFormData({
        titulo: data.titulo,
        tipo: data.tipo,
        conteudo: data.conteudo || '',
        video_url: data.video_url || '',
        image_url: data.image_url || '',
        exam_id: data.exam_id || '',
        ordem: data.ordem,
        ativo: data.ativo,
      });
      
      // Set preview if image exists
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (error) {
      console.error('Erro ao buscar slide:', error);
      toast.error('Erro ao carregar slide');
    }
  };

  const fetchQuestions = async () => {
    if (!slideId) return;
    
    try {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select(`
          id,
          pergunta,
          explicacao,
          question_options (
            id,
            texto,
            correta,
            ordem
          )
        `)
        .eq('slide_id', slideId)
        .order('pergunta');

      if (error) throw error;

      const formattedQuestions: ExerciseQuestion[] = (questionsData || []).map((q: any) => ({
        id: q.id,
        pergunta: q.pergunta,
        explicacao: q.explicacao || '',
        options: (q.question_options || []).sort((a: any, b: any) => a.ordem - b.ordem),
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
    }
  };

  const fetchNextOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('ordem')
        .eq('module_id', moduleId)
        .order('ordem', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      const nextOrder = data && data.length > 0 ? data[0].ordem + 1 : 1;
      setFormData(prev => ({ ...prev, ordem: nextOrder }));
    } catch (error) {
      console.error('Erro ao buscar próxima ordem:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      pergunta: '',
      explicacao: '',
      options: [
        { texto: '', correta: false, ordem: 1 },
        { texto: '', correta: false, ordem: 2 },
      ],
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof ExerciseQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const currentOptions = updated[questionIndex].options;
    updated[questionIndex].options = [
      ...currentOptions,
      { texto: '', correta: false, ordem: currentOptions.length + 1 },
    ];
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options
      .filter((_, i) => i !== optionIndex)
      .map((opt, i) => ({ ...opt, ordem: i + 1 }));
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: any) => {
    const updated = [...questions];
    const options = [...updated[questionIndex].options];
    
    if (field === 'correta' && value === true) {
      // Desmarcar outras opções como corretas
      options.forEach((opt, i) => {
        if (i !== optionIndex) opt.correta = false;
      });
    }
    
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData({ ...formData, image_url: '' });
  };

  const validateExercise = () => {
    if (formData.tipo !== 'exercise') return true;

    if (questions.length === 0) {
      toast.error('Slides de exercício precisam ter pelo menos 1 pergunta');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.pergunta.trim()) {
        toast.error(`Pergunta ${i + 1}: o texto da pergunta é obrigatório`);
        return false;
      }

      if (q.options.length < 2) {
        toast.error(`Pergunta ${i + 1}: precisa ter pelo menos 2 opções`);
        return false;
      }

      const hasCorrect = q.options.some(opt => opt.correta);
      if (!hasCorrect) {
        toast.error(`Pergunta ${i + 1}: precisa ter pelo menos 1 opção marcada como correta`);
        return false;
      }

      const hasEmptyOption = q.options.some(opt => !opt.texto.trim());
      if (hasEmptyOption) {
        toast.error(`Pergunta ${i + 1}: todas as opções precisam ter texto`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateExercise()) return;

    setLoading(true);

    try {
      let uploadedImageUrl = formData.image_url;

      // Upload new image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('slide-images')
          .upload(filePath, selectedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('slide-images')
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;

        // Delete old image if exists and is from our storage
        if (formData.image_url && formData.image_url.includes('slide-images')) {
          const oldPath = formData.image_url.split('/slide-images/').pop();
          if (oldPath) {
            await supabase.storage
              .from('slide-images')
              .remove([oldPath]);
          }
        }
      }

      const slideData = {
        ...formData,
        module_id: moduleId,
        course_id: courseId,
        conteudo: formData.conteudo || null,
        video_url: formData.video_url || null,
        image_url: uploadedImageUrl || null,
        exam_id: formData.exam_id || null,
      };

      let savedSlideId = slideId;

      if (slideId) {
        const { error } = await supabase
          .from('slides')
          .update(slideData)
          .eq('id', slideId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('slides')
          .insert(slideData)
          .select()
          .single();

        if (error) throw error;
        savedSlideId = data.id;
      }

      // Salvar perguntas se for exercício
      if (formData.tipo === 'exercise' && savedSlideId) {
        // Deletar perguntas antigas se estiver editando
        if (slideId) {
          const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('slide_id', slideId);

          if (deleteError) throw deleteError;
        }

        // Inserir novas perguntas
        for (const question of questions) {
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              slide_id: savedSlideId,
              course_id: courseId,
              pergunta: question.pergunta,
              explicacao: question.explicacao || null,
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Inserir opções da pergunta
          const optionsToInsert = question.options.map(opt => ({
            question_id: questionData.id,
            texto: opt.texto,
            correta: opt.correta,
            ordem: opt.ordem,
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      toast.success(slideId ? 'Slide atualizado com sucesso!' : 'Slide criado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar slide:', error);
      toast.error('Erro ao salvar slide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-roboto">
          {slideId ? 'Editar Slide' : 'Novo Slide'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Slide *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content">Conteúdo</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="exercise">Exercício</SelectItem>
                <SelectItem value="attention">Atenção</SelectItem>
                <SelectItem value="exam">Exame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'video' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              
              <div>
                <Label htmlFor="conteudo_video" className="flex items-center gap-2">
                  Texto Adicional (Opcional)
                  <span className="text-xs text-muted-foreground font-normal">
                    Aparece abaixo do vídeo
                  </span>
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const colored = `<span style="color: #d61c00;">${selection}</span>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo.replace(selection, colored) 
                          });
                        } else {
                          toast.info('Selecione um texto para aplicar a cor');
                        }
                      }}
                      className="gap-1"
                    >
                      <div className="w-3 h-3 rounded-full bg-[#d61c00]" />
                      Vermelho
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const colored = `<span style="color: #0066cc;">${selection}</span>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo.replace(selection, colored) 
                          });
                        } else {
                          toast.info('Selecione um texto para aplicar a cor');
                        }
                      }}
                      className="gap-1"
                    >
                      <div className="w-3 h-3 rounded-full bg-[#0066cc]" />
                      Azul
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const formatted = `<strong>${selection}</strong>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo.replace(selection, formatted) 
                          });
                        } else {
                          toast.info('Selecione um texto para aplicar negrito');
                        }
                      }}
                      className="gap-1"
                    >
                      <Bold className="h-4 w-4" />
                      Negrito
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const formatted = `<em>${selection}</em>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo.replace(selection, formatted) 
                          });
                        } else {
                          toast.info('Selecione um texto para aplicar itálico');
                        }
                      }}
                      className="gap-1"
                    >
                      <Italic className="h-4 w-4" />
                      Itálico
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) {
                          const formatted = `<u>${selection}</u>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo.replace(selection, formatted) 
                          });
                        } else {
                          toast.info('Selecione um texto para aplicar sublinhado');
                        }
                      }}
                      className="gap-1"
                    >
                      <Underline className="h-4 w-4" />
                      Sublinhado
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = prompt('Digite a URL do link:');
                        const text = prompt('Digite o texto do link:');
                        if (url && text) {
                          const link = `<a href="${url}" target="_blank" style="color: #d61c00; text-decoration: underline;">${text}</a>`;
                          setFormData({ 
                            ...formData, 
                            conteudo: formData.conteudo + link 
                          });
                        }
                      }}
                      className="gap-1"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </Button>
                  </div>
                  <Textarea
                    id="conteudo_video"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    placeholder="Ex: Se desejar saber mais sobre este assunto, acesse nosso e-book..."
                    rows={3}
                    className="font-mono text-sm"
                  />
                  {formData.conteudo && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                      <div 
                        className="text-sm text-foreground"
                        dangerouslySetInnerHTML={{ __html: formData.conteudo }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.tipo === 'content' && (
            <div className="space-y-3">
              <Label htmlFor="conteudo">Conteúdo</Label>
              
              {/* Barra de ferramentas de formatação */}
              <div className="flex gap-2 flex-wrap border rounded-md p-2 bg-muted/30">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const newText = formData.conteudo.substring(0, start) + 
                          `<strong>${selectedText}</strong>` + 
                          formData.conteudo.substring(end);
                        setFormData({ ...formData, conteudo: newText });
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <Bold className="h-4 w-4" />
                  Negrito
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const newText = formData.conteudo.substring(0, start) + 
                          `<span style="color: #d61c00;">${selectedText}</span>` + 
                          formData.conteudo.substring(end);
                        setFormData({ ...formData, conteudo: newText });
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Vermelho
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const newText = formData.conteudo.substring(0, start) + 
                          `<span style="color: #0066cc;">${selectedText}</span>` + 
                          formData.conteudo.substring(end);
                        setFormData({ ...formData, conteudo: newText });
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Azul
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const newText = formData.conteudo.substring(0, start) + 
                          `<em>${selectedText}</em>` + 
                          formData.conteudo.substring(end);
                        setFormData({ ...formData, conteudo: newText });
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <Italic className="h-4 w-4" />
                  Itálico
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const newText = formData.conteudo.substring(0, start) + 
                          `<u>${selectedText}</u>` + 
                          formData.conteudo.substring(end);
                        setFormData({ ...formData, conteudo: newText });
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <Underline className="h-4 w-4" />
                  Sublinhado
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('conteudo-content') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.conteudo.substring(start, end);
                      if (selectedText) {
                        const url = prompt('Digite a URL do link:');
                        if (url) {
                          const newText = formData.conteudo.substring(0, start) + 
                            `<a href="${url}" target="_blank" style="color: #d61c00; text-decoration: underline;">${selectedText}</a>` + 
                            formData.conteudo.substring(end);
                          setFormData({ ...formData, conteudo: newText });
                        }
                      }
                    }
                  }}
                  className="gap-1"
                >
                  <LinkIcon className="h-4 w-4" />
                  Link
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Selecione o texto e clique no botão para aplicar a formatação
              </p>
              
              <Textarea
                id="conteudo-content"
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                rows={6}
                placeholder="Digite o conteúdo do slide..."
              />
              
              {formData.conteudo && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Como ficará:</p>
                  <div 
                    className="text-sm text-foreground"
                    dangerouslySetInnerHTML={{ __html: formData.conteudo }}
                  />
                </div>
              )}
            </div>
          )}

          {formData.tipo === 'attention' && (
            <>
              <div>
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  rows={4}
                  placeholder="Digite o conteúdo do slide de atenção..."
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem (opcional)</Label>
                
                {!imagePreview ? (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragging 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`text-sm font-medium ${isDragging ? 'text-primary' : 'text-foreground'}`}>
                      {isDragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou WEBP • Máximo 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Preview:</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="h-8"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {formData.tipo === 'exam' && (
            <div>
              <Label htmlFor="exam_id">Selecione o Exame *</Label>
              <Select
                value={formData.exam_id}
                onValueChange={(value) => setFormData({ ...formData, exam_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um exame" />
                </SelectTrigger>
                <SelectContent>
                  {exams.length === 0 ? (
                    <SelectItem value="no-exam" disabled>
                      Nenhum exame disponível
                    </SelectItem>
                  ) : (
                    exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id || `exam-${exam.titulo}`}>
                        {exam.titulo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Crie exames na aba "Exame Final" antes de adicionar um slide de exame
              </p>
            </div>
          )}

          {formData.tipo === 'exercise' && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base">Perguntas do Exercício *</Label>
                <Button type="button" size="sm" onClick={addQuestion} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Pergunta
                </Button>
              </div>

              {questions.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Um slide de exercício precisa ter pelo menos 1 pergunta com opções de resposta.
                  </AlertDescription>
                </Alert>
              )}

              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="bg-background">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Pergunta {qIndex + 1} *</Label>
                          <Textarea
                            value={question.pergunta}
                            onChange={(e) => updateQuestion(qIndex, 'pergunta', e.target.value)}
                            placeholder="Digite a pergunta..."
                            rows={2}
                            required
                          />
                        </div>

                        <div>
                          <Label>Explicação (opcional)</Label>
                          <Textarea
                            value={question.explicacao}
                            onChange={(e) => updateQuestion(qIndex, 'explicacao', e.target.value)}
                            placeholder="Explicação mostrada após responder..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Opções de Resposta *</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addOption(qIndex)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Opção
                            </Button>
                          </div>

                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.correta}
                                onChange={(e) => updateOption(qIndex, oIndex, 'correta', e.target.checked)}
                                className="w-4 h-4 shrink-0"
                                title="Marcar como correta"
                              />
                              <Input
                                value={option.texto}
                                onChange={(e) => updateOption(qIndex, oIndex, 'texto', e.target.value)}
                                placeholder={`Opção ${oIndex + 1}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Marque a checkbox para indicar a opção correta
                          </p>
                        </div>
                      </div>

                      {questions.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuestion(qIndex)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="ordem">Ordem *</Label>
            <Input
              id="ordem"
              type="number"
              min="1"
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="ativo" className="cursor-pointer">Slide ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SlideForm;
