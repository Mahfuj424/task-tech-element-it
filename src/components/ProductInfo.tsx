/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductInfo() {
  const [productData, setProductData] = useState<any[]>([]);
  const [, setTotal] = useState(0);

  const updateTotalPrice = (products: any[]) => {
    const total = products.reduce(
      (sum, item) => sum + (item.discountPrice || 0),
      0
    );
    localStorage.setItem("totalPrice", total.toString());
    setTotal(total);
  };

  const loadProducts = () => {
    const raw = localStorage.getItem("products");
    if (!raw) {
      setProductData([]);
      updateTotalPrice([]);
      return;
    }

    try {
      const stored = JSON.parse(raw);
      const flat = Array.isArray(stored[0]) ? stored.flat() : stored;

      if (!Array.isArray(flat) || flat.length === 0) {
        setProductData([]);
        updateTotalPrice([]);
        return;
      }

      updateTotalPrice(flat);

      const grouped: { [key: string]: any } = {};
      flat.forEach((item: any) => {
        const key = `${item.productId}_${item.productName}_${item.size}`;
        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            sku: [item.sku],
            subtotal: item.discountPrice,
          };
        } else {
          grouped[key].subtotal += item.discountPrice;
          grouped[key].sku.push(item.sku);
        }
      });

      const merged = Object.values(grouped).map((p: any) => ({
        ...p,
        sku: p.sku.join(","),
      }));

      setProductData(merged);
    } catch (error) {
      console.error("Failed to parse products from localStorage:", error);
      setProductData([]);
      updateTotalPrice([]);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();

    // Listen for custom and native localStorage events
    window.addEventListener("storageUpdate", handleUpdate);
    window.addEventListener("storage", handleUpdate); // cross-tab sync

    return () => {
      window.removeEventListener("storageUpdate", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const triggerStorageUpdate = () => {
    window.dispatchEvent(new Event("storageUpdate"));
  };

  const handleDeleteSku = (skuToDelete: string, productId: number) => {
    const stored = JSON.parse(localStorage.getItem("products") || "[]");
    const updated = stored.filter((item: any) => item.sku !== skuToDelete);
    localStorage.setItem("products", JSON.stringify(updated));
    updateTotalPrice(updated);

    const filtered = updated.filter(
      (item: any) => item.productId === productId
    );
    const subtotal = filtered.reduce(
      (acc: any, cur: { discountPrice: any }) => acc + cur.discountPrice,
      0
    );
    const skuList = filtered.map((item: any) => item.sku).join(",");

    setProductData((prev) =>
      prev
        .map((p) =>
          p.productId === productId ? { ...p, sku: skuList, subtotal } : p
        )
        .filter((p) => p.sku.length > 0)
    );
    triggerStorageUpdate();
  };

  const handleDeleteProduct = (
    productId: number,
    name: string,
    price: number,
    size: string
  ) => {
    const stored = JSON.parse(localStorage.getItem("products") || "[]");
    const updated = stored.filter(
      (item: any) =>
        !(
          item.productId === productId &&
          item.productName === name &&
          item.discountPrice === price &&
          item.size === size
        )
    );
    localStorage.setItem("products", JSON.stringify(updated));
    updateTotalPrice(updated);
    setProductData((prev) =>
      prev.filter(
        (p) =>
          !(
            p.productId === productId &&
            p.productName === name &&
            p.discountPrice === price &&
            p.size === size
          )
      )
    );
    triggerStorageUpdate();
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow">
      <h2 className="text-lg font-semibold">Products Information</h2>
      <div>
        {productData.length > 0 ? (
          productData.map((product: any, index: number) => (
            <ProductCard
              key={index}
              name={product.productName}
              size={product.size || "Not found"}
              discountPrice={product.discountPrice}
              sellPrice={product.sellPrice}
              subtotal={product.subtotal}
              sku={product.sku.split(",")}
              stock={product.quantity}
              productId={product.productId}
              onSkuClick={handleDeleteSku}
              onDeleteClick={handleDeleteProduct}
            />
          ))
        ) : (
          <p className="text-gray-500 italic">No products found.</p>
        )}
      </div>
    </div>
  );
}
