import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
  theme: ThemeMode
  sidebarOpen: boolean
  isLoading: boolean
  userDialogOpen: boolean
  userEditId: string | null
  roleDialogOpen: boolean
  roleEditId: string | null
  productDialogOpen: boolean
  productEditId: string | null
  moduleDialogOpen: boolean
  moduleEditId: string | null
}

interface UIActions {
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  openUserDialog: (editId?: string | null) => void
  closeUserDialog: () => void
  openRoleDialog: (editId?: string | null) => void
  closeRoleDialog: () => void
  openProductDialog: (editId?: string | null) => void
  closeProductDialog: () => void
  openModuleDialog: (editId?: string | null) => void
  closeModuleDialog: () => void
}

type UIStore = UIState & UIActions

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: true,
  isLoading: false,
  userDialogOpen: false,
  userEditId: null,
  roleDialogOpen: false,
  roleEditId: null,
  productDialogOpen: false,
  productEditId: null,
  moduleDialogOpen: false,
  moduleEditId: null,
}

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,
  
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  openUserDialog: (editId = null) => set({ userDialogOpen: true, userEditId: editId }),
  
  closeUserDialog: () => set({ userDialogOpen: false, userEditId: null }),
  
  openRoleDialog: (editId = null) => set({ roleDialogOpen: true, roleEditId: editId }),
  
  closeRoleDialog: () => set({ roleDialogOpen: false, roleEditId: null }),
  
  openProductDialog: (editId = null) => set({ productDialogOpen: true, productEditId: editId }),
  
  closeProductDialog: () => set({ productDialogOpen: false, productEditId: null }),
  
  openModuleDialog: (editId = null) => set({ moduleDialogOpen: true, moduleEditId: editId }),
  
  closeModuleDialog: () => set({ moduleDialogOpen: false, moduleEditId: null }),
}))
