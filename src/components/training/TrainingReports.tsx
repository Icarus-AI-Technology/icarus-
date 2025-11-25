import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap,
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface TrainingProgress {
  modulo: string;
  total_licoes: number;
  concluidas: number;
  pontuacao_media: number;
  tempo_total: number;
  progresso: number;
}

interface TrainingLesson {
  id: string;
  modulo: string;
  licao: string;
  tipo: string;
  concluido: boolean;
  pontuacao: number;
  tentativas: number;
  ultima_tentativa: string;
}

export const TrainingReports: React.FC = () => {
  const { usuario } = useAuth();
  const [progressByModule, setProgressByModule] = useState<TrainingProgress[]>([]);
  const [recentLessons, setRecentLessons] = useState<TrainingLesson[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalLessons: 0,
    completed: 0,
    avgScore: 0,
    totalTime: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadTrainingData = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      // Carregar lições de treinamento
      const { data: lessons } = await supabase
        .from('user_training')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('ultima_tentativa', { ascending: false });

      if (lessons) {
        setRecentLessons(lessons.slice(0, 10));

        // Calcular progresso por módulo
        const moduleMap = new Map<string, TrainingProgress>();

        lessons.forEach((lesson) => {
          if (!moduleMap.has(lesson.modulo)) {
            moduleMap.set(lesson.modulo, {
              modulo: lesson.modulo,
              total_licoes: 0,
              concluidas: 0,
              pontuacao_media: 0,
              tempo_total: 0,
              progresso: 0,
            });
          }

          const progress = moduleMap.get(lesson.modulo)!;
          progress.total_licoes++;
          if (lesson.concluido) progress.concluidas++;
          progress.pontuacao_media += lesson.pontuacao || 0;
          progress.tempo_total += lesson.tempo_gasto || 0;
        });

        // Calcular médias e progresso
        const progressArray = Array.from(moduleMap.values()).map((p) => ({
          ...p,
          pontuacao_media: p.total_licoes > 0 ? p.pontuacao_media / p.total_licoes : 0,
          progresso: p.total_licoes > 0 ? (p.concluidas / p.total_licoes) * 100 : 0,
        }));

        setProgressByModule(progressArray);

        // Calcular estatísticas gerais
        const totalLessons = lessons.length;
        const completed = lessons.filter((l) => l.concluido).length;
        const avgScore =
          lessons.length > 0
            ? lessons.reduce((sum, l) => sum + (l.pontuacao || 0), 0) / lessons.length
            : 0;
        const totalTime = lessons.reduce((sum, l) => sum + (l.tempo_gasto || 0), 0);

        setOverallStats({
          totalLessons,
          completed,
          avgScore,
          totalTime,
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao carregar dados de treinamento:', err);
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      loadTrainingData();
    }
  }, [usuario, loadTrainingData]);

  const getLessonIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'quiz':
        return <Target className="w-4 h-4" />;
      case 'pratico':
        return <Award className="w-4 h-4" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="orx-text-3xl orx-orx-font-bold text-gray-900 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          Relatórios de Treinamento
        </h1>
        <p className="text-gray-600 mt-2">Acompanhe seu progresso e desenvolvimento</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="orx-text-sm opacity-90">Total de Lições</p>
          <p className="orx-text-3xl orx-orx-font-bold">{overallStats.totalLessons}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 opacity-80" />
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="orx-text-sm opacity-90">Concluídas</p>
          <p className="orx-text-3xl orx-orx-font-bold">{overallStats.completed}</p>
          <p className="orx-text-xs opacity-80 mt-1">
            {overallStats.totalLessons > 0
              ? Math.round((overallStats.completed / overallStats.totalLessons) * 100)
              : 0}
            % de progresso
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <Target className="w-6 h-6" />
          </div>
          <p className="orx-text-sm opacity-90">Pontuação Média</p>
          <p className="orx-text-3xl orx-orx-font-bold">{Math.round(overallStats.avgScore)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="orx-text-sm opacity-90">Tempo Total</p>
          <p className="orx-text-3xl orx-orx-font-bold">{formatTime(overallStats.totalTime)}</p>
        </div>
      </div>

      {/* Progress by Module */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="orx-text-xl orx-orx-font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Progresso por Módulo
        </h2>
        <div className="space-y-4">
          {progressByModule.map((progress) => (
            <div key={progress.modulo} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="orx-orx-font-semibold text-gray-900">{progress.modulo}</h3>
                <span className="orx-text-sm text-gray-600">
                  {progress.concluidas} / {progress.total_licoes} lições
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progresso}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 orx-text-sm">
                <div>
                  <p className="text-gray-600">Progresso</p>
                  <p className="orx-orx-font-semibold text-blue-600">
                    {Math.round(progress.progresso)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Pontuação Média</p>
                  <p className="orx-orx-font-semibold text-purple-600">
                    {Math.round(progress.pontuacao_media)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tempo Gasto</p>
                  <p className="orx-orx-font-semibold text-orange-600">
                    {formatTime(progress.tempo_total)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {progressByModule.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum treinamento iniciado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="orx-text-xl orx-orx-font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Atividade Recente
        </h2>
        <div className="space-y-3">
          {recentLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lesson.concluido ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {lesson.concluido ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    getLessonIcon(lesson.tipo)
                  )}
                </div>
                <div>
                  <h4 className="orx-orx-font-medium text-gray-900">{lesson.licao}</h4>
                  <p className="orx-text-sm text-gray-600">{lesson.modulo}</p>
                </div>
              </div>
              <div className="text-right">
                {lesson.concluido ? (
                  <div>
                    <p className="orx-text-sm orx-orx-font-semibold text-green-600">Concluído</p>
                    <p className="orx-text-xs text-gray-500">Pontuação: {lesson.pontuacao}</p>
                  </div>
                ) : (
                  <div>
                    <p className="orx-text-sm orx-orx-font-semibold text-gray-600">Em progresso</p>
                    <p className="orx-text-xs text-gray-500">{lesson.tentativas} tentativa(s)</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {recentLessons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingReports;
