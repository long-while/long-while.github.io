import { createContext, useContext, useState, ReactNode } from 'react';

export interface EstimateItem {
  id: string;
  name: string;
  price: number;
  category: 'server' | 'bot';
  description?: string;
}

interface EstimateContextType {
  items: EstimateItem[];
  addItem: (item: Omit<EstimateItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  getTotalPrice: () => number;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EstimateItem[]>([]);

  const addItem = (item: Omit<EstimateItem, 'id'>) => {
    const newItem: EstimateItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  return (
    <EstimateContext.Provider
      value={{ items, addItem, removeItem, clearItems, getTotalPrice }}
    >
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate() {
  const context = useContext(EstimateContext);
  if (context === undefined) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
}
