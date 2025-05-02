/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductInfo() {
  const [productData, setProductData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products from localStorage
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");

    // Check if the stored data is an array of arrays and flatten it
    const flatProducts =
      Array.isArray(storedProducts) && Array.isArray(storedProducts[0])
        ? storedProducts.flat()
        : storedProducts;

    setProductData(flatProducts);
  }, []);

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow">
      <h2 className="text-lg font-semibold">Products Information</h2>
      <div>
        {productData?.map((product: any, index: number) => (
          <ProductCard
            key={index}
            name={product.productName}
            size={product.size || "Not found"}
            price={product.sellPrice}
            subtotal={product.subtotal}
            sku={product.sku ? product.sku.split(",") : []} // Ensure SKU is an array
            stock={product.quantity}
          />
        ))}
      </div>
    </div>
  );
}
