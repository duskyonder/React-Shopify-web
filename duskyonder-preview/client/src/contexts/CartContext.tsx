import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  createCart as shopifyCreateCart,
  addToCart as shopifyAddToCart,
  updateCartLine as shopifyUpdateCartLine,
  removeCartLine as shopifyRemoveCartLine,
  getCart as shopifyGetCart,
  type ShopifyCart,
  type ShopifyCartLine,
} from "@/lib/shopify";

export interface CartItem {
  id: string; // Shopify cart line ID
  variantId?: string; // Shopify variant GID
  name: string; // Product title
  variantTitle?: string; // Variant title (e.g. "Black / M")
  price: string;
  comparePrice?: string;
  imageUrl?: string;
  productUrl?: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalCount: number;
  subtotal: string;
  checkoutUrl: string | null;
  isLoading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "duskyonder_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartId, setCartId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CART_ID_KEY);
    } catch {
      return null;
    }
  });
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  // Sync cart state from Shopify cart object
  const syncCartState = useCallback((cart: ShopifyCart | null) => {
    if (!cart) {
      setItems([]);
      setCheckoutUrl(null);
      setSubtotal("0.00");
      return;
    }
    setCartId(cart.id);
    setCheckoutUrl(cart.checkoutUrl);
    setSubtotal(cart.cost.subtotalAmount.amount);
    localStorage.setItem(CART_ID_KEY, cart.id);

    const newItems: CartItem[] = cart.lines.map((line: ShopifyCartLine) => {
      const colorOpt = line.merchandise.selectedOptions.find(o => o.name.toLowerCase() === "color");
      const sizeOpt = line.merchandise.selectedOptions.find(o => o.name.toLowerCase() === "size");
      return {
        id: line.id, // cart line ID
        variantId: line.merchandise.id,
        name: line.merchandise.product.title,
        variantTitle: line.merchandise.title,
        price: `$${parseFloat(line.merchandise.price.amount).toFixed(0)}`,
        comparePrice: line.merchandise.compareAtPrice
          ? `$${parseFloat(line.merchandise.compareAtPrice.amount).toFixed(0)}`
          : undefined,
        imageUrl: line.merchandise.image?.url,
        productUrl: `/products/${line.merchandise.product.handle}`,
        quantity: line.quantity,
        selectedColor: colorOpt?.value,
        selectedSize: sizeOpt?.value,
      };
    });
    setItems(newItems);
  }, []);

  // Initialize: fetch existing cart on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (cartId) {
      shopifyGetCart(cartId).then((cart) => {
        if (cart && cart.lines.length > 0) {
          syncCartState(cart);
        } else {
          // Cart is empty or expired, clear stored ID
          localStorage.removeItem(CART_ID_KEY);
          setCartId(null);
        }
      });
    }
  }, [cartId, syncCartState]);

  // Add item to cart
  const addItem = useCallback(async (newItem: Omit<CartItem, "quantity" | "id"> & { id?: string }) => {
    const variantId = newItem.variantId;
    if (!variantId) {
      console.error("Cannot add to cart: no variantId provided");
      return;
    }

    setIsLoading(true);
    try {
      let cart: ShopifyCart | null = null;

      if (cartId) {
        // Add to existing cart
        cart = await shopifyAddToCart(cartId, variantId, 1);
      }

      if (!cart) {
        // Create new cart
        cart = await shopifyCreateCart(variantId, 1);
      }

      if (cart) {
        syncCartState(cart);
      }
    } catch (err) {
      console.error("Failed to add item to cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, syncCartState]);

  // Remove item from cart
  const removeItem = useCallback(async (lineId: string) => {
    if (!cartId) return;
    setIsLoading(true);
    try {
      const cart = await shopifyRemoveCartLine(cartId, lineId);
      syncCartState(cart);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, syncCartState]);

  // Update item quantity
  const updateQuantity = useCallback(async (lineId: string, qty: number) => {
    if (!cartId) return;
    setIsLoading(true);
    try {
      if (qty <= 0) {
        const cart = await shopifyRemoveCartLine(cartId, lineId);
        syncCartState(cart);
      } else {
        const cart = await shopifyUpdateCartLine(cartId, lineId, qty);
        syncCartState(cart);
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, syncCartState]);

  // Clear cart (remove all lines)
  const clearCart = useCallback(() => {
    setItems([]);
    setCheckoutUrl(null);
    setSubtotal("0.00");
    setCartId(null);
    localStorage.removeItem(CART_ID_KEY);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQuantity,
      clearCart, openCart, closeCart, totalCount,
      subtotal, checkoutUrl, isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
