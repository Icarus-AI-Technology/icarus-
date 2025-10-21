/**
 * Storybook Stories - Card Component
 * Demonstração visual do componente Card
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const meta = {
 title: 'OraclusX DS/Card',
 component: Card,
 parameters: {
 layout: 'centered',
 },
 tags: ['autodocs'],
 argTypes: {
 variant: {
 control: 'select',
 options: ['flat', 'raised', 'inset'],
 description: 'Variante neumórfica',
 },
 },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Raised: Story = {
 args: {
 variant: 'raised',
 children: (
 <>
 <CardHeader>
 <CardTitle>Card Elevado</CardTitle>
 <CardDescription>Variante padrão neumórfica</CardDescription>
 </CardHeader>
 <CardContent>
 <p>Este é um card com efeito elevado (raised), o padrão do sistema.</p>
 </CardContent>
 </>
 ),
 },
};

export const Flat: Story = {
 args: {
 variant: 'flat',
 children: (
 <>
 <CardHeader>
 <CardTitle>Card Plano</CardTitle>
 <CardDescription>Variante plana</CardDescription>
 </CardHeader>
 <CardContent>
 <p>Este é um card plano (flat), sem elevação.</p>
 </CardContent>
 </>
 ),
 },
};

export const Inset: Story = {
 args: {
 variant: 'inset',
 children: (
 <>
 <CardHeader>
 <CardTitle>Card Rebaixado</CardTitle>
 <CardDescription>Variante rebaixada</CardDescription>
 </CardHeader>
 <CardContent>
 <p>Este é um card rebaixado (inset), com sombra interna.</p>
 </CardContent>
 </>
 ),
 },
};

export const WithFooter: Story = {
 args: {
 variant: 'raised',
 children: (
 <>
 <CardHeader>
 <CardTitle>Card Completo</CardTitle>
 <CardDescription>Com header, content e footer</CardDescription>
 </CardHeader>
 <CardContent>
 <p>Este card demonstra a estrutura completa com todas as seções.</p>
 </CardContent>
 <CardFooter>
 <Button variant="primary">Ação</Button>
 <Button variant="ghost" className="ml-2">Cancelar</Button>
 </CardFooter>
 </>
 ),
 },
};

export const WithBadge: Story = {
 args: {
 variant: 'raised',
 children: (
 <>
 <CardHeader>
 <div className="flex justify-between items-start">
 <div>
 <CardTitle>Card com Badge</CardTitle>
 <CardDescription>Combinação de componentes</CardDescription>
 </div>
 <Badge variant="success">Ativo</Badge>
 </div>
 </CardHeader>
 <CardContent>
 <p>Este card demonstra a integração com Badge.</p>
 </CardContent>
 </>
 ),
 },
};

export const WithIcon: Story = {
 args: {
 variant: 'raised',
 children: (
 <>
 <CardHeader>
 <div className="flex items-center gap-3">
 <div className="p-3 rounded-xl neuro-inset">
 <Activity className="w-6 h-6 text-[var(--primary)]" />
 </div>
 <div>
 <CardTitle>Card com Ícone</CardTitle>
 <CardDescription>Ícone SVG (Lucide React)</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <p>Este card demonstra a integração com ícones SVG.</p>
 </CardContent>
 </>
 ),
 },
};

export const AllVariants: Story = {
 render: () => (
 <div className="grid grid-cols-3 gap-6 p-6">
 <Card variant="flat">
 <CardHeader>
 <CardTitle>Flat</CardTitle>
 </CardHeader>
 <CardContent>
 <p>Card plano</p>
 </CardContent>
 </Card>

 <Card variant="raised">
 <CardHeader>
 <CardTitle>Raised</CardTitle>
 </CardHeader>
 <CardContent>
 <p>Card elevado</p>
 </CardContent>
 </Card>

 <Card variant="inset">
 <CardHeader>
 <CardTitle>Inset</CardTitle>
 </CardHeader>
 <CardContent>
 <p>Card rebaixado</p>
 </CardContent>
 </Card>
 </div>
 ),
};

