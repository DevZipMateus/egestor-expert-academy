import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

interface CourseCertificatesTabProps {
  courseId: string;
}

const CourseCertificatesTab = ({ courseId }: CourseCertificatesTabProps) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cert.profiles?.nome}</p>
                        <p className="text-sm text-muted-foreground">{cert.profiles?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Certificado: {cert.certificate_number} · Nota: {cert.exam_attempts?.score}%
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
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
