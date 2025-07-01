
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  id: number;
  titulo: string;
  tipo: string;
  conteudo: string | null;
  video_url: string | null;
  ordem: number;
  ativo: boolean;
}

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'content',
    conteudo: '',
    video_url: '',
    ordem: 1,
    ativo: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('ordem');

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      toast.error('Erro ao carregar slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSlide) {
        const { error } = await supabase
          .from('slides')
          .update(formData)
          .eq('id', editingSlide.id);
        
        if (error) throw error;
        toast.success('Slide atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('slides')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Slide criado com sucesso!');
      }
      
      setIsDialogOpen(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Erro ao salvar slide:', error);
      toast.error('Erro ao salvar slide');
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      titulo: slide.titulo,
      tipo: slide.tipo,
      conteudo: slide.conteudo || '',
      video_url: slide.video_url || '',
      ordem: slide.ordem,
      ativo: slide.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este slide?')) return;
    
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Slide excluído com sucesso!');
      fetchSlides();
    } catch (error) {
      console.error('Erro ao excluir slide:', error);
      toast.error('Erro ao excluir slide');
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('slides')
        .update({ ativo: !currentActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Slide ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`);
      fetchSlides();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do slide');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: 'content',
      conteudo: '',
      video_url: '',
      ordem: slides.length + 1,
      ativo: true
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      content: 'Conteúdo',
      exercise: 'Exercício',
      attention: 'Atenção',
      exam: 'Exame',
      final: 'Final'
    };
    return types[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      content: 'bg-blue-100 text-blue-800',
      exercise: 'bg-green-100 text-green-800',
      attention: 'bg-yellow-100 text-yellow-800',
      exam: 'bg-red-100 text-red-800',
      final: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Carregando slides...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Slides do Curso</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? 'Editar Slide' : 'Novo Slide'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Conteúdo</SelectItem>
                    <SelectItem value="exercise">Exercício</SelectItem>
                    <SelectItem value="attention">Atenção</SelectItem>
                    <SelectItem value="exam">Exame</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                />
                <Label htmlFor="ativo">Slide ativo</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingSlide ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>{slide.id}</TableCell>
                <TableCell className="font-medium">{slide.titulo}</TableCell>
                <TableCell>
                  <Badge className={getTypeBadgeColor(slide.tipo)}>
                    {getTypeLabel(slide.tipo)}
                  </Badge>
                </TableCell>
                <TableCell>{slide.ordem}</TableCell>
                <TableCell>
                  <Badge variant={slide.ativo ? "default" : "secondary"}>
                    {slide.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(slide.id, slide.ativo)}
                    >
                      {slide.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(slide)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSlides;
