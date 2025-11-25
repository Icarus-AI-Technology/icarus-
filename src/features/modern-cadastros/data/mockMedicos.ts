export interface Medico {
  id: string;
  nome: string;
  avatar: string;
  crm: string;
  especialidade: string;
  hospital: string;
  telefone: string;
  taxaSucesso: number;
}

export const mockMedicos: Medico[] = [
  {
    id: '1',
    nome: 'Dr. Carlos Mendes',
    avatar: 'https://i.pravatar.cc/150?img=12',
    crm: 'CRM-SP 123456',
    especialidade: 'Ortopedia',
    hospital: 'Hospital São Lucas',
    telefone: '(11) 98765-4321',
    taxaSucesso: 98,
  },
  {
    id: '2',
    nome: 'Dra. Ana Silva',
    avatar: 'https://i.pravatar.cc/150?img=45',
    crm: 'CRM-RJ 234567',
    especialidade: 'Cardiologia',
    hospital: 'Hospital Albert Einstein',
    telefone: '(21) 97654-3210',
    taxaSucesso: 96,
  },
  {
    id: '3',
    nome: 'Dr. Roberto Alves',
    avatar: 'https://i.pravatar.cc/150?img=33',
    crm: 'CRM-MG 345678',
    especialidade: 'Neurologia',
    hospital: 'Hospital das Clínicas',
    telefone: '(31) 96543-2109',
    taxaSucesso: 95,
  },
  {
    id: '4',
    nome: 'Dra. Mariana Costa',
    avatar: 'https://i.pravatar.cc/150?img=27',
    crm: 'CRM-SP 456789',
    especialidade: 'Oftalmologia',
    hospital: 'Hospital Sírio-Libanês',
    telefone: '(11) 95432-1098',
    taxaSucesso: 99,
  },
  {
    id: '5',
    nome: 'Dr. João Pereira',
    avatar: 'https://i.pravatar.cc/150?img=56',
    crm: 'CRM-RS 567890',
    especialidade: 'Ortopedia',
    hospital: 'Hospital Moinhos de Vento',
    telefone: '(51) 94321-0987',
    taxaSucesso: 97,
  },
  {
    id: '6',
    nome: 'Dra. Patricia Lima',
    avatar: 'https://i.pravatar.cc/150?img=38',
    crm: 'CRM-BA 678901',
    especialidade: 'Pediatria',
    hospital: 'Hospital São Rafael',
    telefone: '(71) 93210-9876',
    taxaSucesso: 94,
  },
  {
    id: '7',
    nome: 'Dr. Fernando Santos',
    avatar: 'https://i.pravatar.cc/150?img=68',
    crm: 'CRM-PR 789012',
    especialidade: 'Cirurgia Geral',
    hospital: 'Hospital Marcelino Champagnat',
    telefone: '(41) 92109-8765',
    taxaSucesso: 96,
  },
  {
    id: '8',
    nome: 'Dra. Juliana Rocha',
    avatar: 'https://i.pravatar.cc/150?img=41',
    crm: 'CRM-SC 890123',
    especialidade: 'Ginecologia',
    hospital: 'Hospital Governador Celso Ramos',
    telefone: '(48) 91098-7654',
    taxaSucesso: 98,
  },
];
