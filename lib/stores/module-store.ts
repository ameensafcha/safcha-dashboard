import { create } from 'zustand'
import type { Module, ModuleType } from '@/lib/types'

interface ModulesState {
  modules: Module[]
  selectedModule: Module | null
  isLoading: boolean
  error: string | null
}

interface ModulesActions {
  setModules: (modules: Module[]) => void
  setSelectedModule: (module: Module | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

type ModulesStore = ModulesState & ModulesActions

const initialState: ModulesState = {
  modules: [],
  selectedModule: null,
  isLoading: false,
  error: null,
}

export const useModulesStore = create<ModulesStore>((set) => ({
  ...initialState,
  
  setModules: (modules) => set({ modules }),
  
  setSelectedModule: (module) => set({ selectedModule: module }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clear: () => set(initialState),
}))

export type { ModuleType }
