import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const STORAGE_KEY = 'mas_commission_estimate';

// localStorage에서 견적 데이터 불러오기
function loadEstimateFromStorage(): EstimateItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('견적 데이터 불러오기 실패:', error);
  }
  return [];
}

// localStorage에 견적 데이터 저장하기
function saveEstimateToStorage(items: EstimateItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('견적 데이터 저장 실패:', error);
  }
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EstimateItem[]>(() => loadEstimateFromStorage());

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

  // items가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveEstimateToStorage(items);
  }, [items]);

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
