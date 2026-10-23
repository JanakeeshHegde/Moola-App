import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  nameKn?: string;
  price: number;
  unit: string;
  image?: string;
  sellerId: string;
  sellerName: string;
  isOrganic?: boolean;
}

export interface CartItem {
  product: CartProduct;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  totalPayable: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  totalPayable: 0,
});

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([
    {
      product: {
        id: 'p_honey_01',
        name: 'Wild Forest Raw Honey',
        nameKn: 'ಕಾಡಿನ ನೈಸರ್ಗಿಕ ಜೇನುತುಪ್ಪ',
        price: 380,
        unit: '500g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300',
        sellerId: 'seller_001',
        sellerName: 'Malnad Organic Farms',
        isOrganic: true,
      },
      qty: 1,
    },
    {
      product: {
        id: 'p_ragi_02',
        name: 'Stone-Ground Organic Ragi Flour',
        nameKn: 'ಕಲ್ಲಿನಲ್ಲಿ ಬೀಸಿದ ಸಾವಯವ ರಾಗಿ ಹಿಟ್ಟು',
        price: 95,
        unit: '1 kg',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
        sellerId: 'seller_001',
        sellerName: 'Malnad Organic Farms',
        isOrganic: true,
      },
      qty: 2,
    },
  ]);

  const addItem = (product: CartProduct, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const totalPayable = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        totalPayable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
