// src/components/estoque/EstoqueList.tsx
import { useEstoque } from '@/hooks/useEstoque';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/oraclusx-ds/Button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface EstoqueListProps {
  empresaId: string;
}

export function EstoqueList({ empresaId }: EstoqueListProps) {
  const { estoques, loading, error, movimentarEstoque } = useEstoque(empresaId);

  interface EstoqueItem {
    id: string;
    produto?: {
      nome?: string;
      ponto_reposicao?: number;
    } | null;
    quantidade_disponivel?: number | null;
    quantidade_reservada?: number | null;
    armazem?: {
      nome?: string;
    } | null;
    status?: 'disponivel' | 'reservado' | 'indisponivel' | string | null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <p>Erro ao carregar estoque: {error.message}</p>
      </div>
    );
  }

  const handleMovimentacao = async (
    estoqueId: string,
    tipo: 'entrada' | 'saida',
    quantidade: number
  ) => {
    const { error } = await movimentarEstoque(estoqueId, quantidade, tipo);

    if (error) {
      alert(`Erro ao movimentar estoque: ${error.message}`);
    } else {
      alert(`Movimentação de ${tipo} realizada com sucesso!`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estoque OPME</h2>
        <Badge variant="outline">
          <Package className="mr-2 h-4 w-4" />
          {estoques?.length || 0} itens
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(estoques as EstoqueItem[] | undefined)?.map((estoque) => {
          const produto = estoque.produto;
          const isEstoqueBaixo =
            (estoque.quantidade_disponivel || 0) < (produto?.ponto_reposicao || 10);

          return (
            <Card key={estoque.id} className={isEstoqueBaixo ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base truncate">{produto?.nome || 'Produto'}</span>
                  {isEstoqueBaixo && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Baixo
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponível:</span>
                    <span className="font-bold">{estoque.quantidade_disponivel || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reservado:</span>
                    <span>{estoque.quantidade_reservada || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Armazém:</span>
                    <span className="truncate ml-2">{estoque.armazem?.nome || 'Sem armazém'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        estoque.status === 'disponivel'
                          ? 'default'
                          : estoque.status === 'reservado'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {estoque.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleMovimentacao(estoque.id, 'entrada', 10)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Entrada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleMovimentacao(estoque.id, 'saida', 10)}
                    disabled={(estoque.quantidade_disponivel || 0) < 10}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Saída
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {estoques?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum item no estoque</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
