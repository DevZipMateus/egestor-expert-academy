import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  FileText, 
  Truck, 
  Users, 
  BarChart3, 
  Receipt,
  Youtube,
  Cloud,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const modules = [
  {
    icon: ShoppingCart,
    title: 'Vendas e Orçamentos',
    items: [
      'Emissão rápida de orçamentos, pedidos de venda e NF-e/NFC-e',
      'Acompanhamento do status dos pedidos',
      'Cadastro de clientes e histórico de compra'
    ]
  },
  {
    icon: Package,
    title: 'Controle de Estoque',
    items: [
      'Entrada e saída automática de produtos',
      'Inventário simplificado',
      'Alertas de estoque mínimo e relatórios de giro'
    ]
  },
  {
    icon: Wallet,
    title: 'Financeiro',
    items: [
      'Gestão de contas a pagar e contas a receber',
      'Fluxo de caixa completo',
      'Relatórios financeiros e conciliações'
    ]
  },
  {
    icon: FileText,
    title: 'Emissão de Nota Fiscal',
    items: [
      'Emissão de NF-e, NFC-e e NFS-e diretamente pelo sistema',
      'Comunicação automática com a SEFAZ',
      'Armazenamento dos documentos na nuvem'
    ]
  },
  {
    icon: Truck,
    title: 'Compras',
    items: [
      'Registro e controle de pedidos de compra',
      'Acompanhamento de fornecedores',
      'Atualização automática do estoque ao receber mercadorias'
    ]
  },
  {
    icon: Users,
    title: 'CRM / Gestão de Clientes',
    items: [
      'Cadastro completo de clientes e leads',
      'Histórico de interações e vendas',
      'Melhora no acompanhamento comercial'
    ]
  },
  {
    icon: BarChart3,
    title: 'Relatórios Gerenciais',
    items: [
      'Relatórios detalhados de vendas, estoque, financeiro e desempenho',
      'Indicadores para tomada de decisão',
      'Exportação para Excel/PDF'
    ]
  },
  {
    icon: Receipt,
    title: 'Emissão de Boletos',
    items: [
      'Geração de boletos bancários integrados ao contas a receber',
      'Redução de inadimplência com automatização'
    ]
  }
];

const IntroEgestorSlide: React.FC = () => {
  const handleYoutubeClick = () => {
    window.open('https://www.youtube.com/@eGestorERP', '_blank');
  };

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground font-roboto">
          O que é o Sistema eGestor?
        </h2>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Cloud className="w-6 h-6" />
          <span className="text-sm font-medium">100% na nuvem</span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
          O <strong className="text-foreground">eGestor</strong> é um sistema online de gestão empresarial (ERP) 
          voltado para pequenas e médias empresas. Ele centraliza e automatiza processos administrativos, 
          financeiros, operacionais e comerciais, permitindo que o gestor controle o negócio de forma 
          prática e em tempo real.
        </p>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Por ser 100% na nuvem, pode ser acessado de qualquer dispositivo, sem necessidade de instalação.
        </p>
      </div>

      {/* YouTube CTA */}
      <div className="flex justify-center">
        <Button 
          onClick={handleYoutubeClick}
          variant="outline"
          className="gap-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Youtube className="w-5 h-5" />
          Conheça mais no YouTube
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Modules Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground text-center">
          Principais Módulos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module, index) => (
            <div 
              key={index}
              className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <module.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  {module.title}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {module.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroEgestorSlide;
