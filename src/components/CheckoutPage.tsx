import { useState } from 'react';
import { ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import type { CheckoutForm, OrderItem } from '@/types';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const initialForm: CheckoutForm = {
  customer_name: '',
  email: '',
  phone: '',
  address: '',
};

export function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Partial<CheckoutForm> = {};
    if (!form.customer_name.trim()) next.customer_name = 'Full name is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      next.phone = 'Phone number is required';
    } else if (form.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'Enter a valid phone number';
    }
    if (!form.address.trim()) next.address = 'Delivery address is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const orderItems: OrderItem[] = items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      }));

      const result = await createOrder({
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        total: subtotal,
        items: orderItems,
      });

      clearCart();
      onSuccess(result.orderId);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2">Add some products before checking out.</p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer_name"
              type="text"
              value={form.customer_name}
              onChange={(e) => updateField('customer_name', e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.customer_name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="Jane Doe"
            />
            {errors.customer_name && (
              <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.phone
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="+1 555 123 4567"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={3}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
                errors.address
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-slate-900'
              }`}
              placeholder="123 Main St, Apt 4B, New York, NY 10001"
            />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order — $${subtotal.toFixed(2)}`
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} x ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 flex-shrink-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
