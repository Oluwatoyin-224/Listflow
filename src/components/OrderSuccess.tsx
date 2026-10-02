import { CheckCircle2, ShoppingBag } from 'lucide-react';

interface OrderSuccessProps {
  orderId: string;
  onContinueShopping: () => void;
}

export function OrderSuccess({ orderId, onContinueShopping }: OrderSuccessProps) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Order Confirmed!</h1>
      <p className="text-slate-500 mt-2">
        Thank you for your purchase. A confirmation email has been sent to your address.
      </p>
      <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-6 py-4">
        <p className="text-sm text-slate-500">Your order number</p>
        <p className="text-lg font-bold text-slate-900 font-mono mt-1">{orderId}</p>
      </div>
      <button
        onClick={onContinueShopping}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
      >
        <ShoppingBag className="h-4 w-4" />
        Continue Shopping
      </button>
    </div>
  );
}
