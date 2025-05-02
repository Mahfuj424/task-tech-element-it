interface ProductCardProps {
  name: string;
  size: string;
  price: number;
  subtotal: number;
  sku: string | string[];
  stock: number;
  color?: string;
}

export default function ProductCard({
  name,
  size,
  price,
  subtotal = 0,
  sku,
  stock,
  color = "Not found",
}: ProductCardProps) {
  const skuArray = Array.isArray(sku) ? sku : sku?.split(",");

  return (
    <div className="border p-4 rounded-lg bg-white shadow-md">
      <div className="flex justify-between">
        <div>
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Size:</strong> {size}
          </p>
          <p>
            <strong>Color:</strong> {color}
          </p>
          <p>
            <strong>Available Stock:</strong> {stock} Units
          </p>
          <p>
            <strong>SKU:</strong>{" "}
            {skuArray?.length > 0 ? skuArray?.join(", ") : "No SKU available"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">Tk. {price}</div>
          <div>
            Subtotal: <strong>{subtotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
