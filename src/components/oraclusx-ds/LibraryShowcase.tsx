/**
 * OraclusX Design System - Library Showcase
 * Demonstração de todos os componentes do Design System
 */

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  InputContainer,
  SearchField,
  IconButtonNeu,
  NavigationBar,
  SubModulesNavigation,
  ChatbotFAB,
  FormBanner,
} from './index';
import { Home, Settings, User, Mail, Lock, Heart, Star, Trash } from 'lucide-react';

export const LibraryShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buttons');
  const [showChatbot, setShowChatbot] = useState(false);

  const showcaseTabs = [
    { id: 'buttons', label: 'Botões' },
    { id: 'cards', label: 'Cards' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'navigation', label: 'Navegação' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const subModulesExample = [
    {
      id: '1',
      label: 'Gestão de Pacientes',
      description: 'Cadastro e acompanhamento completo de pacientes',
      icon: <User size={20} />,
      onClick: () => console.log('Pacientes'),
    },
    {
      id: '2',
      label: 'Cirurgias Agendadas',
      description: 'Visualize e gerencie todas as cirurgias programadas',
      icon: <Settings size={20} />,
      onClick: () => console.log('Cirurgias'),
    },
    {
      id: '3',
      label: 'Estoque',
      description: 'Controle inteligente de materiais e OPME',
      icon: <Home size={20} />,
      onClick: () => console.log('Estoque'),
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-display font-display text-primary dark:text-gray-100 mb-2">
            OraclusX Design System
          </h1>
          <p className="text-body-lg text-secondary dark:text-muted">
            Biblioteca completa de componentes neumórficos para ICARUS v5.0
          </p>
        </header>

        <NavigationBar tabs={showcaseTabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8">
          {activeTab === 'buttons' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Botões</CardTitle>
                  <CardDescription>Variações de botões com estilo neumórfico</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button>Padrão</Button>
                    <Button variant="primary">Primário</Button>
                    <Button variant="success">Sucesso</Button>
                    <Button variant="warning">Aviso</Button>
                    <Button variant="danger">Erro</Button>
                    <Button disabled>Desabilitado</Button>
                    <Button loading>Carregando</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Botões com Ícones</CardTitle>
                  <CardDescription>Botões com ícones em diferentes posições</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button leftIcon={Home}>Com Ícone Esquerda</Button>
                    <Button rightIcon={Star} variant="primary">
                      Com Ícone Direita
                    </Button>
                    <IconButtonNeu icon={Heart} />
                    <IconButtonNeu icon={Star} variant="primary" />
                    <IconButtonNeu icon={Trash} size="lg" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Padrão</CardTitle>
                  <CardDescription>Card com estilo neumórfico padrão</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary dark:text-muted">
                    Este é um card padrão com elevação suave e sombras neumórficas.
                  </p>
                </CardContent>
              </Card>

              <Card variant="pressed">
                <CardHeader>
                  <CardTitle>Card Pressionado</CardTitle>
                  <CardDescription>Card com efeito de pressão (inset)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary dark:text-muted">
                    Este card simula um efeito de pressão com sombras internas.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Card Elevado</CardTitle>
                  <CardDescription>Card com elevação maior</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary dark:text-muted">
                    Este card tem uma elevação maior para destacar conteúdo importante.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'inputs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inputs</CardTitle>
                  <CardDescription>Campos de entrada com estilo neumórfico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Input simples" />
                  <Input label="Input com label" placeholder="Digite algo..." />
                  <Input leftIcon={Mail} label="Email" type="email" placeholder="seu@email.com" />
                  <Input rightIcon={Lock} label="Senha" type="password" placeholder="••••••••" />
                  <Input
                    label="Input com erro"
                    placeholder="Campo inválido"
                    error="Este campo é obrigatório"
                  />
                  <SearchField placeholder="Buscar..." />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input Container</CardTitle>
                  <CardDescription>Container para grupos de inputs</CardDescription>
                </CardHeader>
                <CardContent>
                  <InputContainer
                    label="Nome Completo"
                    required
                    hint="Digite seu nome completo conforme documento"
                  >
                    <Input placeholder="João da Silva" />
                  </InputContainer>
                  <InputContainer label="CPF" required error="CPF inválido">
                    <Input placeholder="000.000.000-00" />
                  </InputContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navegação por Abas</CardTitle>
                  <CardDescription>Padrão oficial de navegação do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <NavigationBar
                    tabs={[
                      { id: '1', label: 'Dashboard', icon: <Home size={18} /> },
                      {
                        id: '2',
                        label: 'Configurações',
                        icon: <Settings size={18} />,
                      },
                      {
                        id: '3',
                        label: 'Usuários',
                        icon: <User size={18} />,
                        badge: 3,
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navegação de Sub-módulos</CardTitle>
                  <CardDescription>Grid de cards para navegação entre sub-módulos</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubModulesNavigation
                    title="Módulos Disponíveis"
                    subModules={subModulesExample}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Banners</CardTitle>
                  <CardDescription>Mensagens de feedback para usuários</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormBanner
                    type="info"
                    title="Informação"
                    message="Este é um banner informativo com dicas para o usuário."
                  />
                  <FormBanner
                    type="success"
                    title="Sucesso!"
                    message="A operação foi concluída com sucesso."
                  />
                  <FormBanner
                    type="warning"
                    title="Atenção"
                    message="Alguns campos precisam ser preenchidos antes de continuar."
                  />
                  <FormBanner
                    type="error"
                    title="Erro"
                    message="Ocorreu um erro ao processar sua solicitação."
                    onClose={() => console.log('Banner fechado')}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chatbot FAB</CardTitle>
                  <CardDescription>Botão flutuante de ação do chatbot</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-secondary dark:text-muted mb-4">
                    O Chatbot FAB aparece fixo no canto inferior direito da tela.
                  </p>
                  <Button onClick={() => setShowChatbot(!showChatbot)}>
                    {showChatbot ? 'Ocultar' : 'Mostrar'} Chatbot FAB
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showChatbot && <ChatbotFAB onClick={() => alert('Chatbot aberto!')} badge={5} />}
    </div>
  );
};

export default LibraryShowcase;
