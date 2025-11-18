/**
 * Storybook Stories - Stepper Component
 * Demonstração visual do componente Stepper
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from '@/components/oraclusx-ds/Stepper';
import { useState } from 'react';
import { Button } from '@/components/oraclusx-ds/Button';

const meta = {
  title: 'OraclusX DS/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: 'number',
      description: 'Passo atual',
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { id: 1, label: 'Informações' },
  { id: 2, label: 'Endereço' },
  { id: 3, label: 'Pagamento' },
  { id: 4, label: 'Confirmação' },
];

export const Default: Story = {
  args: {
    steps,
    currentStep: 1,
  },
};

export const MiddleStep: Story = {
  args: {
    steps,
    currentStep: 2,
  },
};

export const LastStep: Story = {
  args: {
    steps,
    currentStep: 4,
  },
};

export const Interactive: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    
    return (
      <div className="w-[600px] p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <Stepper steps={steps} currentStep={currentStep} />
        
        <div className="mt-8 p-4 orx-card">
          <h3 className="orx-font-semibold mb-2">Passo {currentStep}: {steps[currentStep - 1].label}</h3>
          <p className="orx-text-sm text-[var(--text-secondary)] mb-4">
            Conteúdo do passo {currentStep}
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="default"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    );
  },
};

export const ManySteps: Story = {
  args: {
    steps: [
      { id: 1, label: 'Início' },
      { id: 2, label: 'Dados Pessoais' },
      { id: 3, label: 'Endereço' },
      { id: 4, label: 'Documentos' },
      { id: 5, label: 'Pagamento' },
      { id: 6, label: 'Revisão' },
      { id: 7, label: 'Conclusão' },
    ],
    currentStep: 3,
  },
};

