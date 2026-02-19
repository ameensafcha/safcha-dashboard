import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getProducts, getCategories } from '@/app/actions/products';
import { ProductsClient } from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(undefined, undefined, 1, 10),
    getCategories(),
  ]);

  const products = productsResult.success ? productsResult.products : [];
  const categories = categoriesResult.success ? categoriesResult.categories : [];

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
    />
  );
}
