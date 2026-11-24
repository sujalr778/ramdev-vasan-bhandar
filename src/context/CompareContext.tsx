"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
export type Product = any; // We'll just use any for now or basic types if needed

type CompareContextType = {
  compareList: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('axit_compare');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('axit_compare', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product: any) => {
    setCompareList(prev => {
      // Limit to 4 items
      if (prev.length >= 4) return prev;
      if (prev.find(p => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p._id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
