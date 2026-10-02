import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: 'p1',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  image_url: 'https://example.com/image.jpg',
  created_at: new Date().toISOString(),
};

const mockProduct2: Product = {
  id: 'p2',
  name: 'Another Product',
  description: 'Another test product',
  price: 15.0,
  image_url: 'https://example.com/image2.jpg',
  created_at: new Date().toISOString(),
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('adds a product to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('p1');
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
  });

  it('increments quantity when adding the same product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.addItem(mockProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it('removes a product from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.removeItem('p1'));
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('increases quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.increaseQuantity('p1'));
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('decreases quantity and removes when reaching zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.decreaseQuantity('p1'));
    expect(result.current.items[0].quantity).toBe(1);
    act(() => result.current.decreaseQuantity('p1'));
    expect(result.current.items).toEqual([]);
  });

  it('calculates subtotal correctly with multiple products', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.addItem(mockProduct2));
    expect(result.current.subtotal).toBeCloseTo(74.98, 2);
    expect(result.current.totalItems).toBe(3);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mockProduct));
    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });
});
