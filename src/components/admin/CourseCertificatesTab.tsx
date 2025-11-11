import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseCertificatesTabProps {
  courseId: string;
}

const CourseCertificatesTab = ({ courseId }: CourseCertificatesTabProps) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, [courseId]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          profiles:user_id (nome, email),
          exam_attempts:exam_attempt_id (score)
        `)
        .eq('course_id', courseId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId: string, examAttemptId: string, certificateNumber: string) => {
    setDownloading(certificateId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ examAttemptId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar certificado');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Certificado baixado',
        description: 'O certificado foi baixado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao baixar certificado:', error);
      toast({
        title: 'Erro ao baixar certificado',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div>Carregando certificados...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-roboto">Certificados Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhum certificado emitido ainda.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Certificados serão gerados automaticamente quando alunos forem aprovados no exame final.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert: any) => (
                <Card key={cert.id} className="hover:bg-muted/50">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{cert.profiles?.nome}</p>
                        <p className="text-sm text-muted-foreground">{cert.profiles?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Certificado: {cert.certificate_number} · Nota: {cert.exam_attempts?.score}%
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadCertificate(cert.id, cert.exam_attempt_id, cert.certificate_number)}
                          disabled={downloading === cert.id}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloading === cert.id ? 'Gerando...' : 'Baixar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCertificatesTab;
