import { supabase } from './supabase';
import type { Product, Order, OrderItem } from '@/types';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export interface CreateOrderInput {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: OrderItem[];
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const orderPayload: Record<string, unknown> = {
    customer_name: input.customer_name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    total: input.total,
    status: 'pending',
  };
  if (session?.user) {
    orderPayload.user_id = session.user.id;
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id')
    .single();

  if (orderError) throw orderError;
  if (!order) throw new Error('Failed to create order');

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Trigger confirmation email via edge function
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`;
    await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        orderId: order.id,
        email: input.email,
        customerName: input.customer_name,
        items: input.items,
        total: input.total,
      }),
    });
  } catch {
    // Email failure should not block the order
  }

  return { orderId: order.id };
}
