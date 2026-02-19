'use client';

import { useState, useEffect } from 'react';
import { Plus, Tags, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { FormDialog, FieldConfig } from '@/components/ui/FormDialog';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
  getCategories,
} from '@/app/actions/products';
import { toast } from '@/hooks/use-toast';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  categoryId: string;
  category: { id: string; name: string };
  skuPrefix: string;
  description: string | null;
  keyIngredients: string | null;
  caffeineFree: boolean;
  sfdaStatus: string;
  sfdaReference: string | null;
  baseCost: number;
  baseRetailPrice: number;
  imageUrl: string | null;
  status: string;
  launchDate: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ProductFormData = {
  name: string;
  categoryId: string;
  skuPrefix: string;
  description: string;
  keyIngredients: string;
  caffeineFree: string;
  sfdaStatus: string;
  sfdaReference: string;
  baseCost: string;
  baseRetailPrice: string;
  status: string;
  launchDate: string;
};

type CategoryFormData = {
  name: string;
  description: string;
};

const productFields: FieldConfig<keyof ProductFormData>[] = [
  { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Safcha Ceremonial Blend' },
  { name: 'categoryId', label: 'Category', type: 'select', required: true, options: [] },
  { name: 'skuPrefix', label: 'SKU Prefix', type: 'text', required: true, placeholder: 'e.g., SCB', disabled: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'keyIngredients', label: 'Key Ingredients', type: 'text', placeholder: 'e.g., Premium Safcha leaves' },
  { name: 'caffeineFree', label: 'Caffeine Free', type: 'checkbox' },
  { 
    name: 'sfdaStatus', 
    label: 'SFDA Status', 
    type: 'select', 
    required: true,
    options: [
      { label: 'Approved', value: 'Approved' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Not Submitted', value: 'Not Submitted' },
    ]
  },
  { name: 'sfdaReference', label: 'SFDA Reference', type: 'text' },
  { name: 'baseCost', label: 'Base Cost (SAR/kg)', type: 'number', required: true },
  { name: 'baseRetailPrice', label: 'Base Retail Price (SAR)', type: 'number', required: true },
  { 
    name: 'status', 
    label: 'Status', 
    type: 'select', 
    required: true,
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'In Development', value: 'In Development' },
      { label: 'Discontinued', value: 'Discontinued' },
    ]
  },
  { name: 'launchDate', label: 'Launch Date', type: 'date' },
];

const categoryFields: FieldConfig<keyof CategoryFormData>[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g., Pure Safcha' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description' },
];

export function ProductsClient({
  initialProducts,
  categories: initialCategories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Product Dialog State
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);

  // Category Dialog State
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [searchTerm, categoryFilter, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    const result = await getProducts(
      searchTerm || undefined,
      categoryFilter !== 'all' ? categoryFilter : undefined,
      currentPage,
      10
    );
    setLoading(false);
    
    if (result.success) {
      setProducts(result.products);
      setTotalPages(result.totalPages);
    }
  };

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.categories);
    }
  };

  const handleProductSubmit = async (data: Record<string, unknown>) => {
    setProductLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, formData);
    } else {
      result = await createProduct(formData);
    }

    setProductLoading(false);

    if (result.success) {
      toast({
        title: editingProduct ? 'Product updated' : 'Product created',
        description: editingProduct ? 'Product has been updated.' : 'New product has been created.',
      });
      setProductDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    const result = await deleteProduct(product.id);
    if (result.success) {
      toast({ title: 'Product deleted', description: 'Product has been deleted.' });
      loadProducts();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCategorySubmit = async (data: Record<string, unknown>) => {
    setCategoryLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    const result = await createCategory(formData);
    setCategoryLoading(false);

    if (result.success) {
      toast({ title: 'Category created', description: 'New category has been created.' });
      setCategoryDialogOpen(false);
      loadCategories();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCategoryDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    const result = await deleteCategory(category.id);
    if (result.success) {
      toast({ title: 'Category deleted', description: 'Category has been deleted.' });
      loadCategories();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const openProductDialog = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: 'Product Name' },
    { 
      accessorKey: 'category.name', 
      header: 'Category',
      cell: (row) => row.category?.name || '-',
    },
    { accessorKey: 'skuPrefix', header: 'SKU Prefix' },
    { accessorKey: 'baseCost', header: 'Cost (SAR/kg)', cell: (row) => `SAR ${row.baseCost.toFixed(2)}` },
    { accessorKey: 'baseRetailPrice', header: 'Price (SAR)', cell: (row) => `SAR ${row.baseRetailPrice.toFixed(2)}` },
    { 
      accessorKey: 'sfdaStatus', 
      header: 'SFDA Status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.sfdaStatus === 'Approved' ? 'bg-green-100 text-green-800' :
          row.sfdaStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.sfdaStatus}
        </span>
      ),
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'Active' ? 'bg-green-100 text-green-800' :
          row.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const fieldsWithCategories = productFields.map((field) => {
    if (field.name === 'categoryId') {
      return { ...field, options: categoryOptions };
    }
    if (field.name === 'skuPrefix' && !editingProduct) {
      return { ...field, disabled: false };
    }
    return field;
  });

  const defaultValues = editingProduct ? {
    name: editingProduct.name,
    categoryId: editingProduct.categoryId,
    skuPrefix: editingProduct.skuPrefix,
    description: editingProduct.description || '',
    keyIngredients: editingProduct.keyIngredients || '',
    caffeineFree: editingProduct.caffeineFree ? 'true' : 'false',
    sfdaStatus: editingProduct.sfdaStatus,
    sfdaReference: editingProduct.sfdaReference || '',
    baseCost: String(editingProduct.baseCost),
    baseRetailPrice: String(editingProduct.baseRetailPrice),
    status: editingProduct.status,
    launchDate: editingProduct.launchDate ? String(editingProduct.launchDate).split('T')[0] : '',
  } : { caffeineFree: 'false' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Tags className="h-4 w-4 mr-2" />
            Add Categories
          </Button>
          <Button onClick={openProductDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        onEdit={handleProductEdit}
        onDelete={handleProductDelete}
        searchPlaceholder="Search by name, SKU, description..."
        searchKeys={['name', 'skuPrefix', 'description']}
      />

      {/* Product Dialog */}
      <FormDialog
        open={productDialogOpen}
        onOpenChange={(open) => { setProductDialogOpen(open); if (!open) setEditingProduct(null); }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        description="Fill in the product details below."
        fields={fieldsWithCategories}
        onSubmit={handleProductSubmit}
        loading={productLoading}
        submitLabel={editingProduct ? 'Update' : 'Create'}
        size="xl"
        defaultValues={defaultValues}
      />

      {/* Category Dialog */}
      <FormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        title="Add Category"
        description="Create a new product category."
        fields={categoryFields}
        onSubmit={handleCategorySubmit}
        loading={categoryLoading}
        submitLabel="Create Category"
        size="sm"
      />

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-md border bg-card"
              >
                <span className="text-sm truncate">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategoryDelete(cat)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
