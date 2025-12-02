import React from 'react';
import { GraduationCap, BookOpen, Video, CheckCircle, Award, Users } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Slides Interativos',
    description: 'Cursos organizados em slides de fácil navegação'
  },
  {
    icon: Video,
    title: 'Vídeos Explicativos',
    description: 'Conteúdo em vídeo hospedado no nosso canal do YouTube'
  },
  {
    icon: CheckCircle,
    title: 'Exercícios de Fixação',
    description: 'Atividades práticas para reforçar o aprendizado'
  },
  {
    icon: Award,
    title: 'Certificação Oficial',
    description: 'Exame final com certificado Expert eGestor'
  }
];

const IntroWelcomeSlide: React.FC = () => {
  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="w-10 h-10 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-roboto">
            Bem-vindo ao Expert eGestor
          </h2>
        </div>
        <p className="text-primary font-medium">
          Plataforma oficial de treinamento para usuários do ERP eGestor
        </p>
      </div>

      {/* Main Description */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
          Desenvolvida para oferecer um aprendizado <strong className="text-foreground">completo e acessível</strong>, 
          a plataforma reúne cursos organizados em slides interativos, com vídeos explicativos, 
          além de exercícios de fixação que reforçam o conteúdo aprendido.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-1">
              {feature.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Certification Info */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10 shrink-0">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Certificação Expert eGestor
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ao final de cada curso, realize o exame de certificação para comprovar seus conhecimentos 
              e receber um <strong className="text-foreground">certificado oficial</strong>, ideal para 
              enriquecer o currículo e qualificar o uso do sistema no dia a dia.
            </p>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="flex items-center justify-center gap-3 text-center">
        <Users className="w-5 h-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Projetado para <strong className="text-foreground">iniciantes e usuários avançados</strong> — 
          uma jornada de aprendizado simples, prática e eficiente.
        </p>
      </div>
    </div>
  );
};

export default IntroWelcomeSlide;
