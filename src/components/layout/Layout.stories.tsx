/**
 * Storybook Stories - Layout System
 * Demonstração visual dos componentes de Layout
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Container, Grid, GridItem, VStack, HStack, Spacer, Divider } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const meta = {
  title: 'Layout System/Container & Grid',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContainerExample: Story = {
  render: () => (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="xl" padding="md">
        <Card variant="raised">
          <CardHeader>
            <CardTitle>Container (max-width: xl)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Este conteúdo está dentro de um Container com largura máxima XL (1280px).</p>
          </CardContent>
        </Card>
      </Container>
    </div>
  ),
};

export const GridResponsive: Story = {
  render: () => (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="2xl">
        <h2 className="text-[var(--text-primary)] mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '0.813rem', fontWeight: 700 }}>
          Grid Responsivo (1 → 2 → 3 → 4 colunas)
        </h2>
        <Grid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item} variant="raised">
              <CardContent className="p-6">
                <p className="text-center text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-body)', fontSize: '0.813rem', fontWeight: 600 }}>
                  Item {item}
                </p>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Container>
    </div>
  ),
};

export const GridWithColSpan: Story = {
  render: () => (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="xl">
        <h2 className="text-[var(--text-primary)] mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '0.813rem', fontWeight: 700 }}>
          Grid com ColSpan
        </h2>
        <Grid cols={{ base: 1, md: 3 }} gap="md">
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 1 (2 colunas)</p>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 1 }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 2 (1 coluna)</p>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 3 }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 3 (full width)</p>
              </CardContent>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </div>
  ),
};

export const VStackExample: Story = {
  render: () => (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="md">
        <Card variant="raised">
          <CardContent className="p-6">
            <VStack spacing="md" align="stretch">
              <div className="p-4 neuro-inset rounded-xl">Item 1</div>
              <div className="p-4 neuro-inset rounded-xl">Item 2</div>
              <Divider orientation="horizontal" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Item 3</div>
              <Spacer />
              <div className="p-4 neuro-inset rounded-xl">Item 4 (com Spacer acima)</div>
            </VStack>
          </CardContent>
        </Card>
      </Container>
    </div>
  ),
};

export const HStackExample: Story = {
  render: () => (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="md">
        <Card variant="raised">
          <CardContent className="p-6">
            <HStack spacing="md" justify="between" fullWidth>
              <div className="p-4 neuro-inset rounded-xl">Left</div>
              <Divider orientation="vertical" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Center</div>
              <Divider orientation="vertical" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Right</div>
            </HStack>
          </CardContent>
        </Card>
      </Container>
    </div>
  ),
};

