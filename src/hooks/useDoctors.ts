import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Doctor = Database['public']['Tables']['doctors']['Row'];
type DoctorInsert = Database['public']['Tables']['doctors']['Insert'];
type DoctorUpdate = Database['public']['Tables']['doctors']['Update'];

interface UseDoctorsReturn {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDoctor: (doctor: DoctorInsert) => Promise<Doctor | null>;
  updateDoctor: (id: string, updates: DoctorUpdate) => Promise<Doctor | null>;
  deleteDoctor: (id: string) => Promise<boolean>;
}

export function useDoctors(): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('doctors')
        .select('*')
        .order('nome', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setDoctors(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar médicos';
      setError(errorMessage);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('doctors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctors',
        },
        () => {
          // Refetch when changes occur
          fetchDoctors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createDoctor = async (doctor: DoctorInsert): Promise<Doctor | null> => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('doctors')
        .insert(doctor)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar médico';
      setError(errorMessage);
      console.error('Error creating doctor:', err);
      return null;
    }
  };

  const updateDoctor = async (id: string, updates: DoctorUpdate): Promise<Doctor | null> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar médico';
      setError(errorMessage);
      console.error('Error updating doctor:', err);
      return null;
    }
  };

  const deleteDoctor = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir médico';
      setError(errorMessage);
      console.error('Error deleting doctor:', err);
      return false;
    }
  };

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };
}

