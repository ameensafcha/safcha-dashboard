import { create } from 'zustand'
import type { Role } from '@/lib/types'

interface RolesState {
  roles: Role[]
  selectedRole: Role | null
  isLoading: boolean
  error: string | null
}

interface RolesActions {
  setRoles: (roles: Role[]) => void
  setSelectedRole: (role: Role | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

type RolesStore = RolesState & RolesActions

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  isLoading: false,
  error: null,
}

export const useRolesStore = create<RolesStore>((set) => ({
  ...initialState,
  
  setRoles: (roles) => set({ roles }),
  
  setSelectedRole: (role) => set({ selectedRole: role }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clear: () => set(initialState),
}))
