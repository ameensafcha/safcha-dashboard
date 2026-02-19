import { create } from 'zustand'
import type { User } from '@/lib/types'

interface UsersState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
}

interface UsersActions {
  setUsers: (users: User[]) => void
  setSelectedUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

type UsersStore = UsersState & UsersActions

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
}

export const useUsersStore = create<UsersStore>((set) => ({
  ...initialState,
  
  setUsers: (users) => set({ users }),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clear: () => set(initialState),
}))
