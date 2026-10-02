import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutPage } from '@/components/CheckoutPage';
import { OrderSuccess } from '@/components/OrderSuccess';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { fetchProducts } from '@/lib/api';
import type { Product } from '@/types';

type View = 'shop' | 'checkout' | 'success';

function ShopApp() {
  const [view, setView] = useState<View>('shop');
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const goShop = () => {
    setView('shop');
    setOrderId('');
  };

  const goCheckout = () => {
    setCartOpen(false);
    setView('checkout');
  };

  const handleOrderSuccess = (id: string) => {
    setOrderId(id);
    setView('success');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onCartClick={() => setCartOpen(true)} onLogoClick={goShop} />

      <main>
        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome to Shopflow
              </h1>
              <p className="text-slate-500 mt-1">
                Quality products delivered to your door.
              </p>
            </div>
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              onRetry={loadProducts}
            />
          </div>
        )}

        {view === 'checkout' && (
          <CheckoutPage onBack={goShop} onSuccess={handleOrderSuccess} />
        )}

        {view === 'success' && (
          <OrderSuccess orderId={orderId} onContinueShopping={goShop} />
        )}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={goCheckout}
      />

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          Shopflow — Built for learning purposes.
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ShopApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
