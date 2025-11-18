/**
 * Storybook Stories - FileUpload Component
 * Demonstração visual do componente FileUpload
 */

import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '@/components/oraclusx-ds/FileUpload';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label do campo',
    },
    accept: {
      control: 'text',
      description: 'Tipos de arquivo aceitos',
    },
    multiple: {
      control: 'boolean',
      description: 'Permite múltiplos arquivos',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado',
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Upload de Arquivo',
  },
};

export const ImageOnly: Story = {
  args: {
    label: 'Upload de Imagem',
    accept: 'image/*',
  },
};

export const MultipleFiles: Story = {
  args: {
    label: 'Upload Múltiplo',
    multiple: true,
  },
};

export const PDFOnly: Story = {
  args: {
    label: 'Upload de PDF',
    accept: '.pdf',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Upload Desabilitado',
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [files, setFiles] = useState<FileList | null>(null);
    
    return (
      <div className="w-[500px] p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <FileUpload 
          label="Selecione Arquivos" 
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />
        {files && files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Arquivos selecionados:</p>
            {Array.from(files).map((file, index) => (
              <div key={index} className="text-sm text-[var(--text-secondary)] orx-card p-2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised w-[500px]">
      <FileUpload label="Upload Padrão" />
      <FileUpload label="Somente Imagens" accept="image/*" />
      <FileUpload label="Múltiplos Arquivos" multiple />
      <FileUpload label="Desabilitado" disabled />
    </div>
  ),
};

