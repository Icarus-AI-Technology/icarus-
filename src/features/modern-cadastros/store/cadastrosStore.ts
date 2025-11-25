import { create } from 'zustand';

interface CadastrosStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useCadastrosStore = create<CadastrosStore>((set) => ({
  activeTab: 'medicos',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
