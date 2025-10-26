/**
 * Storybook Stories - Pagination Component
 * Demonstração visual do componente Pagination
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '@/components/oraclusx-ds/Pagination';
import { useState } from 'react';

const meta = {
  title: 'OraclusX DS/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number',
      description: 'Página atual',
    },
    totalPages: {
      control: 'number',
      description: 'Total de páginas',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    onPageChange: (page) => console.log('Page:', page),
  },
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div className="p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <div className="mb-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Página atual: {page}</p>
        </div>
        <Pagination currentPage={page} totalPages={15} onPageChange={setPage} />
      </div>
    );
  },
};

export const WithItems: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const allItems = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
    const startIdx = (page - 1) * itemsPerPage;
    const currentItems = allItems.slice(startIdx, startIdx + itemsPerPage);

    return (
      <div className="w-[500px] p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
        <div className="space-y-2 mb-4">
          {currentItems.map((item) => (
            <div key={item} className="orx-card p-3">
              {item}
            </div>
          ))}
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(allItems.length / itemsPerPage)}
          onPageChange={setPage}
        />
      </div>
    );
  },
};

