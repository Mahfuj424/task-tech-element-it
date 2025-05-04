/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/localStorage.ts
export const getStoredProducts = (): any[] => {
  const stored = localStorage.getItem("products");
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveProductsToStorage = (products: any[]) => {
  localStorage.setItem("products", JSON.stringify(products));
};
