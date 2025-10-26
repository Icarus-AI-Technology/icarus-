/**
 * Storybook Stories - Toast Component
 * Demonstração visual do componente Toast
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '@/components/oraclusx-ds/Toast';
import { Button } from '@/components/oraclusx-ds/Button';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Mensagem do toast',
    },
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Tipo do toast',
    },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Posição do toast',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Mostrar Success</Button>
        {show && (
          <Toast 
            message="Operação realizada com sucesso!" 
            type="success" 
            onClose={() => setShow(false)}
          />
        )}
      </>
    );
  },
};

export const Error: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Mostrar Error</Button>
        {show && (
          <Toast 
            message="Ocorreu um erro ao processar a solicitação" 
            type="error" 
            onClose={() => setShow(false)}
          />
        )}
      </>
    );
  },
};

export const Warning: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Mostrar Warning</Button>
        {show && (
          <Toast 
            message="Atenção: Esta ação não pode ser desfeita" 
            type="warning" 
            onClose={() => setShow(false)}
          />
        )}
      </>
    );
  },
};

export const Info: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <>
        <Button onClick={() => setShow(true)}>Mostrar Info</Button>
        {show && (
          <Toast 
            message="Informação: Novos recursos disponíveis" 
            type="info" 
            onClose={() => setShow(false)}
          />
        )}
      </>
    );
  },
};

export const AllTypes: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

    const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
      const messages = {
        success: 'Operação realizada com sucesso!',
        error: 'Erro ao processar solicitação',
        warning: 'Atenção: Verifique os dados',
        info: 'Informação importante',
      };
      
      const id = Date.now();
      setToasts(prev => [...prev, { id, type, message: messages[type] }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button variant="success" size="sm" onClick={() => showToast('success')}>Success</Button>
          <Button variant="error" size="sm" onClick={() => showToast('error')}>Error</Button>
          <Button variant="warning" size="sm" onClick={() => showToast('warning')}>Warning</Button>
          <Button variant="primary" size="sm" onClick={() => showToast('info')}>Info</Button>
        </div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    );
  },
};

