import { useState, useEffect, useContext } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { TokenContext } from "../context/TokenContext";

interface Product {
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentMethod {
  accountId: string;
  amount: number;
}

const ProductEntry = () => {
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [vat, setVat] = useState<number>(0);
  const [payments, setPayments] = useState<PaymentMethod[]>([
    { accountId: "", amount: 0 },
  ]);
  const [accounts, setAccounts] = useState<{ _id: string; name: string }[]>([]);

  const { token } = useContext(TokenContext);

  useEffect(() => {
    const stored = localStorage.getItem("pos-products");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pos-products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          "https://front-end-task-lake.vercel.app/api/v1/account/get-accounts?type=All",
          {
            headers: { Authorization: `Bearer: ${token}` },
          }
        );
        setAccounts(res.data.data);
      } catch (err) {
        console.error("Error loading accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const calculateSubtotal = () => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateVatAmount = () => {
    return (calculateSubtotal() * vat) / 100;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() - calculateDiscountAmount() + calculateVatAmount()
    );
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const changeAmount = totalPaid - calculateTotal();

  const handleBarcodeSearch = async () => {
    if (!barcode) return;
    try {
      const res = await axios.get(
        `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${barcode}`,
        {
          headers: { Authorization: `Bearer: ${token}` },
        }
      );

      const foundProduct = {
        sku: res.data.data.product.sku,
        name: res.data.data.product.name,
        price: res.data.data.product.salePrice,
        quantity: 1,
      };

      const existing = products.find((p) => p.sku === foundProduct.sku);
      if (existing) {
        setProducts((prev) =>
          prev.map((p) =>
            p.sku === foundProduct.sku ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      } else {
        setProducts((prev) => [...prev, foundProduct]);
      }

      setBarcode("");
    } catch (error) {
      console.error("Product fetch failed:", error);
    }
  };

  const handleDelete = (sku: string) => {
    setProducts((prev) => prev.filter((p) => p.sku !== sku));
  };

  const handleQuantityClick = (sku: string) => {
    setSelectedSku(sku);
    setShowModal(true);
  };

  const confirmRemoveOne = () => {
    if (!selectedSku) return;
    const updated = products
      .map((p) =>
        p.sku === selectedSku ? { ...p, quantity: p.quantity - 1 } : p
      )
      .filter((p) => p.quantity > 0);
    setProducts(updated);
    setShowModal(false);
  };

  const handlePaymentChange = (
    index: number,
    field: "accountId" | "amount",
    value: string | number
  ) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };
    setPayments(updated);
  };

  const addPaymentMethod = () => {
    setPayments((prev) => [...prev, { accountId: "", amount: 0 }]);
  };

  const clearForm = () => {
    setProducts([]);
    setBarcode("");
    setDiscount(0);
    setVat(0);
    setPayments([{ accountId: "", amount: 0 }]);
    localStorage.removeItem("pos-products");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Scan Barcode</label>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
          className="input input-bordered w-full"
          placeholder="Enter SKU or barcode"
        />
      </div>

      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.sku}
            className="border p-4 rounded relative bg-gray-50 shadow"
          >
            <button
              onClick={() => handleDelete(product.sku)}
              className="absolute right-2 top-2 text-red-500"
            >
              <AiOutlineDelete size={20} />
            </button>
            <p>
              <strong>{product.name}</strong>
            </p>
            <p>SKU: {product.sku}</p>
            <p>Price: ${product.price}</p>
            <p>
              Quantity:{" "}
              <span
                onClick={() => handleQuantityClick(product.sku)}
                className="text-blue-600 underline cursor-pointer"
              >
                {product.quantity}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Calculation Section */}
      <div className="border-t pt-4 space-y-2">
        <div>
          <label className="block text-sm font-medium">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">VAT (%)</label>
          <input
            type="number"
            value={vat}
            onChange={(e) => setVat(Number(e.target.value))}
            className="input input-bordered w-full"
          />
        </div>
        <div className="font-semibold text-right">
          <p>Subtotal: ${calculateSubtotal().toFixed(2)}</p>
          <p>Discount: -${calculateDiscountAmount().toFixed(2)}</p>
          <p>VAT: +${calculateVatAmount().toFixed(2)}</p>
          <p>Total: ${calculateTotal().toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Section */}
      <div className="border-t pt-4 space-y-4">
        {payments.map((pay, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={pay.accountId}
              onChange={(e) =>
                handlePaymentChange(index, "accountId", e.target.value)
              }
              className="select select-bordered w-1/2"
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={pay.amount}
              onChange={(e) =>
                handlePaymentChange(index, "amount", Number(e.target.value))
              }
              className="input input-bordered w-1/2"
              placeholder="Amount"
            />
          </div>
        ))}
        <button onClick={addPaymentMethod} className="btn btn-sm btn-outline">
          + Add Payment Method
        </button>
        <div className="text-right font-semibold">
          <p>Paid: ${totalPaid.toFixed(2)}</p>
          <p className={changeAmount >= 0 ? "text-green-600" : "text-red-600"}>
            Change: ${changeAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <button onClick={clearForm} className="btn btn-outline">
          Cancel & Clear
        </button>
        <button className="btn btn-primary">Submit POS</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80 space-y-4">
            <p>Are you sure you want to decrease quantity by 1?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveOne}
                className="btn btn-sm btn-error"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEntry;
