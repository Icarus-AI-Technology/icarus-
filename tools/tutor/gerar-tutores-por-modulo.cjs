#!/usr/bin/env node

/**
 * Generate Tutors by Module
 * Gera tutores de IA específicos por módulo
 */

const fs = require('fs');
const path = require('path');

class TutorGenerator {
  constructor() {
    this.tutors = [];
  }

  async generateTutors() {
    console.log('🤖 Gerando Tutores de IA por Módulo - Icarus v5.0\n');

    // Carrega lista de módulos
    const auditFile = path.join(process.cwd(), 'docs/audit/modules-audit-report.json');
    let modules = [];
    
    if (fs.existsSync(auditFile)) {
      const audit = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      modules = audit.modules || [];
    }

    // Gera tutores para cada categoria
    this.generateByCategory(modules);

    this.generateReport();
    this.generateImplementationFiles();
  }

  generateByCategory(modules) {
    const categories = [...new Set(modules.map(m => m.category))];

    categories.forEach(category => {
      const categoryModules = modules.filter(m => m.category === category);
      
      this.tutors.push({
        id: `tutor-${category}`,
        name: `Tutor ${this.capitalize(category)}`,
        category: category,
        modules: categoryModules.map(m => m.name),
        capabilities: this.generateCapabilities(category),
        commands: this.generateCommands(category),
        knowledge_base: this.generateKnowledgeBase(category),
        prompts: this.generatePrompts(category)
      });
    });
  }

  generateCapabilities(category) {
    const capabilitiesMap = {
      'cirurgias': [
        'Orientar agendamento de cirurgias',
        'Explicar processos de consignação',
        'Auxiliar em rastreabilidade cirúrgica',
        'Resolver dúvidas sobre materiais OPME'
      ],
      'faturamento': [
        'Orientar criação de guias TISS',
        'Explicar padrão TISS 4.06.00',
        'Auxiliar em remessas de faturamento',
        'Resolver glosas e divergências'
      ],
      'estoque': [
        'Orientar movimentações de estoque',
        'Explicar consignação e devoluções',
        'Auxiliar em inventário',
        'Controle de lotes e validades'
      ],
      'financeiro': [
        'Orientar contas a pagar/receber',
        'Explicar fluxo de caixa',
        'Auxiliar em conciliação bancária',
        'Análises financeiras'
      ],
      'compliance': [
        'Orientar conformidade ANVISA',
        'Explicar rastreabilidade UDI',
        'Auxiliar em auditorias',
        'Documentação de qualidade'
      ]
    };

    return capabilitiesMap[category] || [
      `Orientar sobre ${category}`,
      `Explicar processos de ${category}`,
      `Auxiliar em tarefas de ${category}`,
      `Resolver dúvidas sobre ${category}`
    ];
  }

  generateCommands(category) {
    return [
      {
        command: `@Tutor-${this.capitalize(category)}:ajuda`,
        description: `Mostra ajuda geral sobre ${category}`
      },
      {
        command: `@Tutor-${this.capitalize(category)}:como-fazer`,
        description: `Tutorial passo-a-passo para tarefas comuns`
      },
      {
        command: `@Tutor-${this.capitalize(category)}:resolver`,
        description: `Auxilia na resolução de problemas específicos`
      },
      {
        command: `@Tutor-${this.capitalize(category)}:best-practices`,
        description: `Mostra melhores práticas para ${category}`
      }
    ];
  }

  generateKnowledgeBase(category) {
    const knowledgeMap = {
      'cirurgias': [
        'Fluxo completo de agendamento de cirurgias',
        'Processos de consignação OPME',
        'Rastreabilidade cirúrgica (UDI)',
        'Checklist pré-cirúrgico',
        'Documentação pós-cirúrgica'
      ],
      'faturamento': [
        'Padrão TISS 4.06.00',
        'Criação de guias SP/SADT',
        'Envio de remessas para operadoras',
        'Gestão de glosas',
        'Recebimento e conciliação'
      ],
      'estoque': [
        'Movimentações de estoque',
        'Consignação e devoluções',
        'Controle de lotes e validades',
        'Inventário rotativo',
        'Níveis mínimos e máximos'
      ],
      'financeiro': [
        'Contas a pagar e receber',
        'Fluxo de caixa projetado',
        'Conciliação bancária',
        'Indicadores financeiros (DRE, Balanço)',
        'Análise de rentabilidade'
      ],
      'compliance': [
        'RDC ANVISA aplicáveis',
        'Rastreabilidade UDI',
        'Padrões ISO 13485',
        'Auditorias internas',
        'Não-conformidades'
      ]
    };

    return knowledgeMap[category] || [`Conhecimento geral sobre ${category}`];
  }

  generatePrompts(category) {
    return {
      system: `Você é um tutor especializado em ${category} para o sistema Icarus v5.0, um ERP para distribuidores OPME. Seu papel é orientar usuários de forma clara, prática e amigável.`,
      
      examples: [
        {
          user: `Como faço [tarefa] no módulo de ${category}?`,
          assistant: `[Explicação passo-a-passo detalhada com screenshots quando possível]`
        },
        {
          user: `Estou com erro em ${category}`,
          assistant: `[Diagnóstico do problema e solução]`
        }
      ],
      
      guidelines: [
        'Sempre fornecer respostas práticas e acionáveis',
        'Incluir referências a documentação quando relevante',
        'Oferecer exemplos concretos',
        'Sugerir melhores práticas',
        'Alertar sobre riscos de compliance quando aplicável'
      ]
    };
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  generateReport() {
    console.log('📊 Relatório de Tutores Gerados\n');
    console.log('='.repeat(70));
    console.log(`Total de Tutores: ${this.tutors.length}\n`);

    this.tutors.forEach((tutor, i) => {
      console.log(`${i + 1}. ${tutor.name}`);
      console.log(`   ID: ${tutor.id}`);
      console.log(`   Categoria: ${tutor.category}`);
      console.log(`   Módulos cobertos: ${tutor.modules.length}`);
      console.log(`   Capacidades: ${tutor.capabilities.length}`);
      console.log('');
    });

    this.saveReport();
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total_tutors: this.tutors.length,
      tutors: this.tutors
    };

    const outputFile = path.join(outputDir, 'tutors-generated.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`💾 Relatório salvo em: ${outputFile}`);
  }

  generateImplementationFiles() {
    console.log('\n📝 Gerando arquivos de implementação...');

    const outputDir = path.join(process.cwd(), 'src/lib/tutors');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    this.tutors.forEach(tutor => {
      const content = this.generateTutorImplementation(tutor);
      const filename = `${tutor.id}.ts`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, content);
      console.log(`  ✓ ${filename}`);
    });

    console.log(`\n✅ ${this.tutors.length} arquivos de implementação gerados em src/lib/tutors/`);
  }

  generateTutorImplementation(tutor) {
    return `/**
 * ${tutor.name}
 * Gerado automaticamente por tools/tutor/gerar-tutores-por-modulo.js
 * 
 * Categoria: ${tutor.category}
 * Módulos: ${tutor.modules.join(', ')}
 */

export interface TutorConfig {
  id: string;
  name: string;
  category: string;
  capabilities: string[];
  commands: TutorCommand[];
}

export interface TutorCommand {
  command: string;
  description: string;
}

export const ${tutor.id.replace(/-/g, '_').toUpperCase()}_CONFIG: TutorConfig = ${JSON.stringify(tutor, null, 2)};

export class ${this.capitalize(tutor.id.replace(/-/g, '_'))} {
  private config: TutorConfig;

  constructor() {
    this.config = ${tutor.id.replace(/-/g, '_').toUpperCase()}_CONFIG;
  }

  async help(): Promise<string> {
    return \`
# ${tutor.name} - Ajuda

## Capacidades
\${this.config.capabilities.map((c, i) => \`\${i + 1}. \${c}\`).join('\\n')}

## Comandos Disponíveis
\${this.config.commands.map(cmd => \`- \${cmd.command}: \${cmd.description}\`).join('\\n')}

## Módulos Cobertos
\${this.config.modules.map(m => \`- \${m}\`).join('\\n')}
    \`.trim();
  }

  async handleCommand(command: string, context?: any): Promise<string> {
    switch (command) {
      case 'ajuda':
        return this.help();
      
      case 'como-fazer':
        return this.howTo(context);
      
      case 'resolver':
        return this.troubleshoot(context);
      
      case 'best-practices':
        return this.bestPractices();
      
      default:
        return \`Comando não reconhecido. Use @\${this.config.id}:ajuda para ver comandos disponíveis.\`;
    }
  }

  private async howTo(context?: any): Promise<string> {
    // TODO: Implementar tutoriais passo-a-passo
    return 'Tutorial em desenvolvimento...';
  }

  private async troubleshoot(context?: any): Promise<string> {
    // TODO: Implementar resolução de problemas
    return 'Sistema de troubleshooting em desenvolvimento...';
  }

  private async bestPractices(): Promise<string> {
    // TODO: Implementar melhores práticas
    return 'Melhores práticas em desenvolvimento...';
  }
}
`;
  }

  async run() {
    await this.generateTutors();
    return this.tutors;
  }
}

if (require.main === module) {
  const generator = new TutorGenerator();
  generator.run().catch(console.error);
}

module.exports = TutorGenerator;

