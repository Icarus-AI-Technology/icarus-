/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import {
  CadastroPageLayout,
  CadastroSection,
  FormGrid,
  FormActions,
} from '@/components/oraclusx-ds/CadastroLayout';
import { Button } from '@/components/oraclusx-ds';
import { Users } from 'lucide-react';

describe('CadastroPageLayout', () => {
  it('renders title correctly', () => {
    render(
      <CadastroPageLayout title="Test Cadastro">
        <div>Content</div>
      </CadastroPageLayout>
    );
    expect(screen.getByText('Test Cadastro')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <CadastroPageLayout title="Test" description="Test Description">
        <div>Content</div>
      </CadastroPageLayout>
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <CadastroPageLayout title="Test" icon={Users}>
        <div>Content</div>
      </CadastroPageLayout>
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('CadastroSection', () => {
  it('renders children correctly', () => {
    render(
      <CadastroSection>
        <div>Section Content</div>
      </CadastroSection>
    );
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <CadastroSection title="Personal Data">
        <div>Content</div>
      </CadastroSection>
    );
    expect(screen.getByText('Personal Data')).toBeInTheDocument();
  });

  it('applies default animation styling', () => {
    const { container } = render(<CadastroSection>Content</CadastroSection>);
    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain('orx-animate-slide-up');
  });
});

describe('FormGrid', () => {
  it('renders children in grid', () => {
    render(
      <FormGrid columns={2}>
        <input placeholder="Field 1" />
        <input placeholder="Field 2" />
      </FormGrid>
    );
    expect(screen.getByPlaceholderText('Field 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Field 2')).toBeInTheDocument();
  });

  it('applies correct column count', () => {
    const { container } = render(
      <FormGrid columns={3}>
        <div>Content</div>
      </FormGrid>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid');
  });
});

describe('FormActions', () => {
  it('renders action buttons', () => {
    render(
      <FormActions>
        <Button>Cancel</Button>
        <Button variant="primary">Save</Button>
      </FormActions>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('applies alignment correctly', () => {
    const { container } = render(
      <FormActions align="right">
        <Button>Action</Button>
      </FormActions>
    );
    const actions = container.firstChild as HTMLElement;
    expect(actions.className).toContain('justify-end');
  });
});
