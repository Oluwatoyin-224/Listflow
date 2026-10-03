import { describe, it, expect, vi } from 'vitest';
import { useEffect, useRef } from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { CheckoutPage } from '@/components/CheckoutPage';

vi.mock('@/lib/api', () => ({
  fetchProducts: vi.fn(),
  createOrder: vi.fn(),
}));

import { createOrder } from '@/lib/api';
const mockCreateOrder = vi.mocked(createOrder);

const mockProduct = {
  id: 'p1',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  image_url: 'https://example.com/image.jpg',
  created_at: new Date().toISOString(),
};

function CartSetup({ children }: { children: React.ReactNode }) {
  const { addItem, items } = useCart();
  const addedRef = useRef(false);
  useEffect(() => {
    if (items.length === 0 && !addedRef.current) {
      addedRef.current = true;
      addItem(mockProduct);
    }
  }, [addItem, items.length]);
  return <>{children}</>;
}

function renderCheckoutWithItem(onSuccess?: (id: string) => void) {
  return render(
    <CartProvider>
      <CartSetup>
        <CheckoutPage onBack={() => {}} onSuccess={onSuccess ?? (() => {})} />
      </CartSetup>
    </CartProvider>
  );
}

describe('CheckoutPage', () => {
  it('shows empty cart message when no items', () => {
    render(
      <CartProvider>
        <CheckoutPage onBack={() => {}} onSuccess={() => {}} />
      </CartProvider>
    );
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('validates required fields and shows errors', async () => {
    renderCheckoutWithItem();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Place Order/ })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /Place Order/ }));

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Delivery address is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderCheckoutWithItem();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Place Order/ })).toBeEnabled();
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByPlaceholderText('jane@example.com'), {
        target: { value: 'notanemail' },
      });
      fireEvent.change(screen.getByPlaceholderText('+1 555 123 4567'), { target: { value: '+1 555 123 4567' } });
      fireEvent.change(screen.getByPlaceholderText('123 Main St, Apt 4B, New York, NY 10001'), {
        target: { value: '123 Main St' },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Place Order/ }));
    });

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });
  });

  it('submits the order with valid data', async () => {
    mockCreateOrder.mockResolvedValue({ orderId: 'order-123' });
    const onSuccess = vi.fn();

    renderCheckoutWithItem(onSuccess);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Place Order/ })).toBeEnabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('jane@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('+1 555 123 4567'), { target: { value: '+1 555 123 4567' } });
    fireEvent.change(screen.getByPlaceholderText('123 Main St, Apt 4B, New York, NY 10001'), {
      target: { value: '123 Main St' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Place Order/ }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_name: 'Jane Doe',
          email: 'jane@test.com',
          phone: '+1 555 123 4567',
          address: '123 Main St',
        })
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('order-123');
    });
  });
});
