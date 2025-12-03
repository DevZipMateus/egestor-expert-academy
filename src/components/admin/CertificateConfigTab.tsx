import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Save, Eye, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface CertificateConfig {
  id?: string;
  course_id: string;
  background_image_url: string | null;
  name_font_size: number;
  name_color: string;
  name_y_position: number;
  name_bold: boolean;
  email_font_size: number;
  email_color: string;
  email_y_position: number;
  show_email: boolean;
  conclusion_text: string;
  conclusion_font_size: number;
  conclusion_color: string;
  conclusion_y_position: number;
  date_font_size: number;
  date_color: string;
  date_y_position: number;
  score_prefix: string;
  score_font_size: number;
  score_color: string;
  score_y_position: number;
  show_score: boolean;
  cert_number_font_size: number;
  cert_number_color: string;
  show_cert_number: boolean;
}

const defaultConfig: Omit<CertificateConfig, 'course_id'> = {
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

interface CertificateConfigTabProps {
  courseId: string;
}

const CertificateConfigTab = ({ courseId }: CertificateConfigTabProps) => {
  const [config, setConfig] = useState<CertificateConfig>({ ...defaultConfig, course_id: courseId });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig();
  }, [courseId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('certificate_configs')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as CertificateConfig);
      } else {
        setConfig({ ...defaultConfig, course_id: courseId });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações do certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('certificate_configs')
        .upsert(config, { onConflict: 'course_id' });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      fetchConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `certificates/${courseId}/background.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('slide-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('slide-images')
        .getPublicUrl(fileName);

      setConfig(prev => ({ ...prev, background_image_url: urlData.publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setConfig(prev => ({ ...prev, background_image_url: null }));
  };

  const updateConfig = (key: keyof CertificateConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuração do Certificado</h3>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Configurações
        </Button>
      </div>

      {/* Variáveis disponíveis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Variáveis Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs">
            <code className="bg-muted px-2 py-1 rounded">{'{{nome}}'} - Nome do aluno</code>
            <code className="bg-muted px-2 py-1 rounded">{'{{email}}'} - Email do aluno</code>
            <code className="bg-muted px-2 py-1 rounded">{'{{curso}}'} - Título do curso</code>
            <code className="bg-muted px-2 py-1 rounded">{'{{nota}}'} - Nota do exame (%)</code>
            <code className="bg-muted px-2 py-1 rounded">{'{{data}}'} - Data de emissão</code>
            <code className="bg-muted px-2 py-1 rounded">{'{{certificado}}'} - Número do certificado</code>
          </div>
        </CardContent>
      </Card>

      {/* Imagem de Fundo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Imagem de Fundo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            {config.background_image_url ? (
              <div className="relative">
                <img
                  src={config.background_image_url}
                  alt="Fundo do certificado"
                  className="max-h-48 mx-auto rounded"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="py-8">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG ou JPG, máximo 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {uploading ? 'Enviando...' : 'Selecionar Imagem'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do Aluno */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">👤 Nome do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  value={config.name_font_size}
                  onChange={(e) => updateConfig('name_font_size', parseInt(e.target.value) || 28)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={config.name_y_position}
                  onChange={(e) => updateConfig('name_y_position', parseInt(e.target.value) || 340)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.name_color}
                  onChange={(e) => updateConfig('name_color', e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={config.name_color}
                  onChange={(e) => updateConfig('name_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Negrito</Label>
              <Switch
                checked={config.name_bold}
                onCheckedChange={(checked) => updateConfig('name_bold', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">✉️ Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exibir email no certificado</Label>
              <Switch
                checked={config.show_email}
                onCheckedChange={(checked) => updateConfig('show_email', checked)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  value={config.email_font_size}
                  onChange={(e) => updateConfig('email_font_size', parseInt(e.target.value) || 12)}
                  disabled={!config.show_email}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={config.email_y_position}
                  onChange={(e) => updateConfig('email_y_position', parseInt(e.target.value) || 312)}
                  disabled={!config.show_email}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.email_color}
                  onChange={(e) => updateConfig('email_color', e.target.value)}
                  className="w-14 h-10 p-1"
                  disabled={!config.show_email}
                />
                <Input
                  value={config.email_color}
                  onChange={(e) => updateConfig('email_color', e.target.value)}
                  className="flex-1"
                  disabled={!config.show_email}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frase de Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📝 Frase de Conclusão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Texto</Label>
              <Textarea
                value={config.conclusion_text}
                onChange={(e) => updateConfig('conclusion_text', e.target.value)}
                placeholder='Ex: concluiu com êxito o curso'
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  value={config.conclusion_font_size}
                  onChange={(e) => updateConfig('conclusion_font_size', parseInt(e.target.value) || 16)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={config.conclusion_y_position}
                  onChange={(e) => updateConfig('conclusion_y_position', parseInt(e.target.value) || 265)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.conclusion_color}
                  onChange={(e) => updateConfig('conclusion_color', e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={config.conclusion_color}
                  onChange={(e) => updateConfig('conclusion_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📅 Data de Emissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  value={config.date_font_size}
                  onChange={(e) => updateConfig('date_font_size', parseInt(e.target.value) || 14)}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={config.date_y_position}
                  onChange={(e) => updateConfig('date_y_position', parseInt(e.target.value) || 225)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.date_color}
                  onChange={(e) => updateConfig('date_color', e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={config.date_color}
                  onChange={(e) => updateConfig('date_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nota */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏆 Nota do Exame</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exibir nota no certificado</Label>
              <Switch
                checked={config.show_score}
                onCheckedChange={(checked) => updateConfig('show_score', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo</Label>
              <Input
                value={config.score_prefix}
                onChange={(e) => updateConfig('score_prefix', e.target.value)}
                placeholder="Ex: Nota:"
                disabled={!config.show_score}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tamanho da Fonte (px)</Label>
                <Input
                  type="number"
                  value={config.score_font_size}
                  onChange={(e) => updateConfig('score_font_size', parseInt(e.target.value) || 18)}
                  disabled={!config.show_score}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={config.score_y_position}
                  onChange={(e) => updateConfig('score_y_position', parseInt(e.target.value) || 180)}
                  disabled={!config.show_score}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.score_color}
                  onChange={(e) => updateConfig('score_color', e.target.value)}
                  className="w-14 h-10 p-1"
                  disabled={!config.show_score}
                />
                <Input
                  value={config.score_color}
                  onChange={(e) => updateConfig('score_color', e.target.value)}
                  className="flex-1"
                  disabled={!config.show_score}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Número do Certificado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔢 Número do Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exibir número no certificado</Label>
              <Switch
                checked={config.show_cert_number}
                onCheckedChange={(checked) => updateConfig('show_cert_number', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tamanho da Fonte (px)</Label>
              <Input
                type="number"
                value={config.cert_number_font_size}
                onChange={(e) => updateConfig('cert_number_font_size', parseInt(e.target.value) || 10)}
                disabled={!config.show_cert_number}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cert_number_color}
                  onChange={(e) => updateConfig('cert_number_color', e.target.value)}
                  className="w-14 h-10 p-1"
                  disabled={!config.show_cert_number}
                />
                <Input
                  value={config.cert_number_color}
                  onChange={(e) => updateConfig('cert_number_color', e.target.value)}
                  className="flex-1"
                  disabled={!config.show_cert_number}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateConfigTab;
