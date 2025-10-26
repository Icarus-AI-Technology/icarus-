import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

const meta: Meta<typeof Card> = {
  title: 'OraclusX/UI/Card',
  component: Card,
  args: { variant: 'raised' }
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Raised: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Descrição do card</CardDescription>
      </CardHeader>
      <CardContent>Conteúdo</CardContent>
      <CardFooter>Rodapé</CardFooter>
    </Card>
  )
};

export const Flat: Story = { args: { variant: 'flat' } };
export const Inset: Story = { args: { variant: 'inset' } };
 

