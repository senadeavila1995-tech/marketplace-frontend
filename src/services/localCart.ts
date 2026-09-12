import type { Product } from "../types/Product";

const CART_KEY = "marketplace_guest_cart";

export interface LocalCartItem {
  id: string;
  productId: number;
  product: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string | null;
  stock: number;
}

function readCart(): LocalCartItem[] {
  const value = localStorage.getItem(CART_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getLocalCart(): LocalCartItem[] {
  return readCart();
}

export function addLocalCartItem(
  product: Product,
  quantity = 1
): LocalCartItem[] {
  const items = readCart();

  const existing = items.find(
    (item) => item.productId === product.id
  );

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + quantity,
      product.stock
    );

    existing.total = existing.quantity * existing.price;
    existing.stock = product.stock;
    existing.product = product.name;
    existing.imageUrl = product.imageUrl;
  } else {
    items.push({
      id: `guest-${product.id}`,
      productId: product.id,
      product: product.name,
      quantity: Math.min(quantity, product.stock),
      price: product.price,
      total: product.price * Math.min(quantity, product.stock),
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
  }

  saveCart(items);

  return items;
}

export function updateLocalCartItem(
  productId: number,
  quantity: number
): LocalCartItem[] {
  const items = readCart();

  const item = items.find(
    (cartItem) => cartItem.productId === productId
  );

  if (!item) {
    return items;
  }

  if (quantity < 1) {
    return items;
  }

  item.quantity = Math.min(quantity, item.stock);
  item.total = item.quantity * item.price;

  saveCart(items);

  return items;
}

export function removeLocalCartItem(
  productId: number
): LocalCartItem[] {
  const items = readCart().filter(
    (item) => item.productId !== productId
  );

  saveCart(items);

  return items;
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}
