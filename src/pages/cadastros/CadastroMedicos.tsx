import React, { useState, useEffect } from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { supabase } from '@/lib/supabase';

interface Medico {
  id: string;
  nome: string;
  crm: string;
  especialidade: string;
  telefone: string;
  email: string;
}

const CadastroMedicos: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🎯 Hooks de Observabilidade
  const { trackPageView, trackCRUD, trackSearch } = useActivityTracker();
  const { withErrorHandler, logError } = useErrorHandler();

  // Rastrear visualização da página
  useEffect(() => {
    trackPageView('cadastros', 'medicos');
  }, [trackPageView]);

  // Carregar médicos com tratamento de erros
  const loadMedicos = withErrorHandler(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setMedicos(data || []);
    } finally {
      setLoading(false);
    }
  }, 'cadastros/medicos', 'media');

  useEffect(() => {
    loadMedicos();
  }, [loadMedicos]);

  // Buscar médicos com rastreamento
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .ilike('nome', `%${query}%`)
        .order('nome');

      if (error) throw error;
      
      setMedicos(data || []);
      
      // Rastrear busca
      trackSearch('cadastros/medicos', query, data?.length || 0);
    } catch (error) {
      const err = error as Error;
      logError({
        tipo: 'erro_aplicacao',
        severidade: 'media',
        modulo: 'cadastros/medicos',
        mensagem: `Erro na busca: ${err.message}`,
        contexto: { query }
      });
    }
  };

  // Deletar médico com rastreamento
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este médico?')) return;

    try {
      const { error } = await supabase
        .from('medicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMedicos(prev => prev.filter(m => m.id !== id));
      
      // Rastrear sucesso
      await trackCRUD('DELETE', 'cadastros/medicos', { id }, true);
      
      alert('Médico excluído com sucesso!');
    } catch (error) {
      const err = error as Error;
      
      // Rastrear falha
      await trackCRUD('DELETE', 'cadastros/medicos', { id }, false, err.message);
      
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl orx-font-bold mb-6">Cadastro de Médicos</h1>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar médico..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {loading && <p>Carregando...</p>}
        
        {medicos.map((medico) => (
          <div key={medico.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="orx-font-semibold">{medico.nome}</h3>
              <p className="text-sm text-gray-600">CRM: {medico.crm} | {medico.especialidade}</p>
            </div>
            <button
              onClick={() => handleDelete(medico.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CadastroMedicos;
