/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext } from "react";
import { TokenContext } from "../context/TokenContext";
import axios from "axios";

const ProductList = () => {
  const { token } = useContext(TokenContext);
  const [sku, setSku] = useState("");
  const [product, setProduct] = useState<any | null>(null);

  const handleSkuSearch = async () => {
    try {
      const response = await axios.get(
        `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${sku}`,
        {
          headers: {
            Authorization: `Bearer: ${token}`,
          },
        }
      );
      setProduct(response.data.data); // store in local state or push to array
      setSku(""); // clear input
    } catch (error) {
      console.error("Product not found", error);
    }
  };

  return (
    <div className="border p-4 rounded bg-white shadow space-y-2">
      <label className="block font-medium">Scan Barcode or Enter SKU</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="input input-bordered w-full"
          placeholder="Enter SKU e.g. 01007-00025"
        />
        <button onClick={handleSkuSearch} className="btn btn-primary">
          Search
        </button>
      </div>

      {product && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h2 className="font-semibold">{product.productName}</h2>
          <p>Price: {product.sellPrice}</p>
          <p>Stock: {product.quantity}</p>
          {/* Add this product to global state/localStorage as needed */}
        </div>
      )}
    </div>
  );
};

export default ProductList;
