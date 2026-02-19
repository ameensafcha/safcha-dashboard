export type ModuleType = 'FOLDER' | 'PAGE' | 'DASHBOARD'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  categoryId: string
  skuPrefix: string
  description: string | null
  keyIngredients: string | null
  caffeineFree: boolean
  sfdaStatus: string
  sfdaReference: string | null
  baseCost: number
  baseRetailPrice: number
  imageUrl: string | null
  status: string
  launchDate: Date | null
  createdAt: Date
  updatedAt: Date
  category: Category
}

export interface Role {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  roleId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  Role: Role
}

export interface Module {
  id: string
  name: string
  slug: string
  type: ModuleType
  parentId: string | null
  icon: string | null
  order: number
  isActive: boolean
  parent?: Module | null
  children?: Module[]
}

export interface RolePermission {
  id: string
  roleId: string
  moduleId: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface UserPermission {
  id: string
  userId: string
  moduleId: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}
