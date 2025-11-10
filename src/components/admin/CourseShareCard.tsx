import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface CourseShareCardProps {
  courseSlug: string;
}

const CourseShareCard = ({ courseSlug }: CourseShareCardProps) => {
  const [copied, setCopied] = useState(false);
  const courseUrl = `${window.location.origin}/c/${courseSlug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(courseUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleOpen = () => {
    window.open(courseUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Link de Compartilhamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={courseUrl}
            readOnly
            className="flex-1 font-mono text-sm"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={handleOpen}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Compartilhe este link para permitir que novos alunos acessem o curso.
          Ao clicar, eles serão direcionados para fazer login ou criar uma conta.
        </p>
      </CardContent>
    </Card>
  );
};

export default CourseShareCard;
