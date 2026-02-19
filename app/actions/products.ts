'use server'

import { prisma } from '@/lib/prisma';
import { getCurrentUser, checkModulePermission, hasAdminAccess } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const MODULE_SLUG = 'products';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Category Actions

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { error: 'Failed to fetch categories' };
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
});

export async function createCategory(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const hasPermission = await checkModulePermission(currentUser.roleId, MODULE_SLUG, 'canCreate');
    if (!hasPermission && !hasAdminAccess(currentUser)) {
      return { error: 'Permission denied' };
    }

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || undefined,
    };

    const validatedFields = createCategorySchema.safeParse(rawData);
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }

    const { name, description } = validatedFields.data;

    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description,
      },
    });

    revalidatePath('/products');
    return { success: true, category };
  } catch (error) {
    console.error('Error creating category:', error);
    return { error: 'Failed to create category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const hasPermission = await checkModulePermission(currentUser.roleId, MODULE_SLUG, 'canDelete');
    if (!hasPermission && !hasAdminAccess(currentUser)) {
      return { error: 'Permission denied' };
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return { error: 'Cannot delete category with existing products' };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { error: 'Failed to delete category' };
  }
}

// Product Actions

export async function getProducts(
  search?: string,
  categoryId?: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { skuPrefix: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const serializedProducts = products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      launchDate: p.launchDate ? p.launchDate.toISOString() : null,
    }));

    return {
      success: true,
      products: serializedProducts,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { error: 'Failed to fetch products' };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    return { success: true, product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { error: 'Failed to fetch product' };
  }
}

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  categoryId: z.string().min(1, 'Category is required'),
  skuPrefix: z.string().min(1, 'SKU Prefix is required').max(10),
  description: z.string().optional(),
  keyIngredients: z.string().optional(),
  caffeineFree: z.preprocess((val) => val === 'true' || val === 'on', z.boolean()),
  sfdaStatus: z.enum(['Approved', 'Pending', 'Not Submitted']),
  sfdaReference: z.string().optional(),
  baseCost: z.coerce.number().min(0, 'Base cost must be positive'),
  baseRetailPrice: z.coerce.number().min(0, 'Base retail price must be positive'),
  status: z.enum(['Active', 'In Development', 'Discontinued']),
  launchDate: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: 'Unauthorized' };

  const hasPermission = await checkModulePermission(currentUser.roleId, MODULE_SLUG, 'canCreate');
  if (!hasPermission && !hasAdminAccess(currentUser)) {
    return { error: 'Permission denied' };
  }

  const rawData = {
    name: formData.get('name'),
    categoryId: formData.get('categoryId'),
    skuPrefix: formData.get('skuPrefix'),
    description: formData.get('description') || undefined,
    keyIngredients: formData.get('keyIngredients') || undefined,
    caffeineFree: formData.get('caffeineFree'),
    sfdaStatus: formData.get('sfdaStatus'),
    sfdaReference: formData.get('sfdaReference') || undefined,
    baseCost: formData.get('baseCost'),
    baseRetailPrice: formData.get('baseRetailPrice'),
    status: formData.get('status'),
    launchDate: formData.get('launchDate') || undefined,
  };

  const validatedFields = productSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const data = validatedFields.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
      },
    });

    revalidatePath('/products');
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { error: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: 'Unauthorized' };

  const hasPermission = await checkModulePermission(currentUser.roleId, MODULE_SLUG, 'canUpdate');
  if (!hasPermission && !hasAdminAccess(currentUser)) {
    return { error: 'Permission denied' };
  }

  const rawData = {
    name: formData.get('name'),
    categoryId: formData.get('categoryId'),
    skuPrefix: formData.get('skuPrefix'),
    description: formData.get('description') || undefined,
    keyIngredients: formData.get('keyIngredients') || undefined,
    caffeineFree: formData.get('caffeineFree'),
    sfdaStatus: formData.get('sfdaStatus'),
    sfdaReference: formData.get('sfdaReference') || undefined,
    baseCost: formData.get('baseCost'),
    baseRetailPrice: formData.get('baseRetailPrice'),
    status: formData.get('status'),
    launchDate: formData.get('launchDate') || undefined,
  };

  const validatedFields = productSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const data = validatedFields.data;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
      },
    });

    revalidatePath('/products');
    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: 'Unauthorized' };

  const hasPermission = await checkModulePermission(currentUser.roleId, MODULE_SLUG, 'canDelete');
  if (!hasPermission && !hasAdminAccess(currentUser)) {
    return { error: 'Permission denied' };
  }

  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { error: 'Failed to delete product' };
  }
}
