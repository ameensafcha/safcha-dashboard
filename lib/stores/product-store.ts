import { create } from 'zustand'
import type { Product, Category } from '@/lib/types'

interface ProductsState {
  products: (Product & { category: Category })[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
}

interface ProductsActions {
  setProducts: (products: (Product & { category: Category })[]) => void
  setSelectedProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

type ProductsStore = ProductsState & ProductsActions

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
}

export const useProductsStore = create<ProductsStore>((set) => ({
  ...initialState,
  
  setProducts: (products) => set({ products }),
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clear: () => set(initialState),
}))
