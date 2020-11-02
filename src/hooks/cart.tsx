import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const Products = await AsyncStorage.getItem('products');
        if(Products){
          setProducts([...JSON.parse(Products)]);
        }
      }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    const newProduct = products.find(item => item.id === product.id);

    if(newProduct){
      setProducts(
        products.map(item => item.id === product.id
          ? { ...item, quantity: item.quantity+1 }
          : item
        )
      );
    }else{
      setProducts([...products, { ...product, quantity: 1 }]);
    }

    await AsyncStorage.setItem('products', JSON.stringify(products));

  }, [products]);

  const increment = useCallback(async (id: string) => {

    const newProducts = products.map(item => item.id === id
      ? { ...item, quantity: item.quantity+1 }
      : item
    );

    setProducts(newProducts);
    await AsyncStorage.setItem('products', JSON.stringify(newProducts));

  }, [products]);

  const decrement = useCallback(async id => {

    const findProduct = products.findIndex(item => item.id === id && item.quantity == 1);

    if(findProduct !== -1){
      const newProducts = products.filter(item => item.id !== id);
      setProducts(newProducts);
      await AsyncStorage.setItem('products', JSON.stringify(newProducts));

    }else{
      const newProducts = products.map(item => item.id === id && item.quantity > 0
        ? { ...item, quantity: item.quantity - 1 }
        : item
        );
      setProducts(newProducts);
      await AsyncStorage.setItem('products', JSON.stringify(newProducts));
    }

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
