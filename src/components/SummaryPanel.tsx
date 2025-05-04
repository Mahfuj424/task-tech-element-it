/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import PaymentMethod from "./PaymentMethod";
import axios from "axios";
import { TokenContext } from "../context/TokenContext";
import { useContext } from "react";
import toast from "react-hot-toast";

interface SummaryProps {
  mrp: number;
  vatAmount: number;
  discountAmount: number;
  totalItems: number;
  totalQuantity: number;
  totalPayable: number;
  onRestore: (products: any[], summary: any) => void;
}

interface HoldData {
  invoiceId: string;
  products: any[];
  summary: Omit<SummaryProps, "onRestore">;
}

export default function SummaryPanel({
  mrp,
  vatAmount,
  discountAmount,
  totalItems,
  totalQuantity,
  totalPayable,
  onRestore,
}: SummaryProps) {
  const [holdList, setHoldList] = useState<HoldData[]>([]);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [totalReceived, setTotalReceived] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);
  const [payments, setPayments] = useState<
    { accountId: number; paymentAmount: number }[]
  >([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const { token } = useContext(TokenContext);

  // Load initial data from localStorage
  useEffect(() => {
    // Load invoice ID
    const current = localStorage.getItem("invoiceId");
    if (current) {
      setInvoiceId(current);
    } else {
      const holdList = JSON.parse(localStorage.getItem("holdList") || "[]");
      const lastId = holdList.length
        ? parseInt(holdList[holdList.length - 1].invoiceId.replace("INV-", ""))
        : 0;
      const newId = `INV-${(lastId + 1).toString().padStart(4, "0")}`;
      localStorage.setItem("invoiceId", newId);
      setInvoiceId(newId);
    }

    // Load phoneNumber and selectedSalesPerson from posSummary
    const posSummary = JSON.parse(localStorage.getItem("posSummary") || "{}");
    if (posSummary.phoneNumber) {
      setPhoneNumber(posSummary.phoneNumber);
    }
    if (posSummary.selectedSalesPerson) {
      setSelectedSalesPerson(posSummary.selectedSalesPerson.toString());
    }
  }, []);

  // Calculate payment totals when payments change
  useEffect(() => {
    const total = payments.reduce(
      (sum, p) => sum + Number(p.paymentAmount || 0),
      0
    );
    setTotalReceived(total);
    setChangeAmount(Math.max(total - totalPayable, 0));
  }, [payments, totalPayable]);

  const handlePaymentsChange = (
    newPayments: { accountId: number; paymentAmount: number }[]
  ) => {
    setPayments(newPayments);
  };

  const handleHold = () => {
    const products = JSON.parse(localStorage.getItem("products") || "[]");

    if (!products.length) {
      toast.error("No products to hold.");
      return;
    }

    // Save current state to posSummary before holding
    const posSummary = {
      mrp,
      vatAmount,
      discountAmount,
      totalItems,
      totalQuantity,
      totalPayable,
      phoneNumber,
      selectedSalesPerson: selectedSalesPerson
        ? Number(selectedSalesPerson)
        : 0,
    };
    localStorage.setItem("posSummary", JSON.stringify(posSummary));

    const newHold: HoldData = {
      invoiceId,
      products,
      summary: {
        mrp,
        vatAmount,
        discountAmount,
        totalItems,
        totalQuantity,
        totalPayable,
      },
    };

    const existingHolds: HoldData[] = JSON.parse(
      localStorage.getItem("holdList") || "[]"
    );
    const updated = [...existingHolds, newHold];
    localStorage.setItem("holdList", JSON.stringify(updated));
    setHoldList(updated);

    // Clear current invoice
    localStorage.removeItem("products");
    localStorage.removeItem("posSummary");
    localStorage.removeItem("payments");

    const nextIdNum = parseInt(invoiceId.replace("INV-", "")) + 1;
    const nextInvoice = `INV-${nextIdNum.toString().padStart(4, "0")}`;
    localStorage.setItem("invoiceId", nextInvoice);
    setInvoiceId(nextInvoice);

    setPayments([]);
    setPhoneNumber("");
    setSelectedSalesPerson("");
    toast.success(`Hold successful: ${invoiceId}`);
  };

  const handleLoadHolds = () => {
    const stored = JSON.parse(localStorage.getItem("holdList") || "[]");
    setHoldList(stored);
    setShowHoldModal(true);
  };

  const handleRestore = (hold: HoldData) => {
    localStorage.setItem("products", JSON.stringify(hold.products));
    localStorage.setItem("posSummary", JSON.stringify(hold.summary));
    localStorage.setItem("invoiceId", hold.invoiceId);
    onRestore(hold.products, hold.summary);
    setInvoiceId(hold.invoiceId);

    const remaining = holdList.filter((h) => h.invoiceId !== hold.invoiceId);
    localStorage.setItem("holdList", JSON.stringify(remaining));
    setHoldList(remaining);

    setShowHoldModal(false);
    toast.success(`Restored: ${hold.invoiceId}`);
  };

  const handleDelete = (invoiceId: string) => {
    const filtered = holdList.filter((h) => h.invoiceId !== invoiceId);
    localStorage.setItem("holdList", JSON.stringify(filtered));
    setHoldList(filtered);
  };

  const handleCreateSell = async () => {
    try {
      const products = JSON.parse(localStorage.getItem("products") || "[]");

      // Group products by productName+size+sku (composite key)
      const productMap = new Map<string, any>();

      products.forEach((product: any) => {
        const key = `${product.productName}-${product.size}`;

        if (!productMap.has(key)) {
          productMap.set(key, {
            ...product,
            quantity: 1, // Start quantity at 1
            discount: product.discount || 0,
          });
        } else {
          const existing = productMap.get(key);
          existing.quantity += 1; // Increment quantity
          existing.discount += product.discount || 0; // Accumulate discount if applicable
          productMap.set(key, existing);
        }
      });

      // Convert to array and compute subtotal
      const apiProducts = Array.from(productMap.values()).map((product) => {
        const unitPrice =
          product.discountPrice ||
          product.sellPrice ||
          product.wholePrice ||
          product.price;

        return {
          variationProductId: product.id,
          quantity: product.quantity,
          unitPrice,
          discount: product.discount,
          subTotal: unitPrice * product.quantity - product.discount,
        };
      });

      // Total discount from all grouped products
      const totalProductDiscount = apiProducts.reduce(
        (sum, p) => sum + (p.discount || 0),
        0
      );

      const requestBody = {
        invoiceNo: invoiceId.replace("INV-", ""),
        salesmenId: selectedSalesPerson ? Number(selectedSalesPerson) : 4,
        discountType: "Fixed",
        discount: totalProductDiscount,
        phone: phoneNumber,
        totalPrice: mrp,
        totalPaymentAmount: totalReceived,
        changeAmount: Math.max(0, totalReceived - totalPayable),
        vat: vatAmount,
        products: apiProducts,
        payments: payments.map((payment) => ({
          accountId: payment.accountId,
          paymentAmount: Number(payment.paymentAmount.toFixed(2)),
        })),
        sku: [...new Set(products.map((product: any) => product.sku))],
      };

      // Make API call
      const response = await axios.post(
        "https://front-end-task-lake.vercel.app/api/v1/sell/create-sell",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Sale created successfully!");
        localStorage.removeItem("payments");
        localStorage.removeItem("posSummary");

        const nextIdNum = parseInt(invoiceId.replace("INV-", "")) + 1;
        const nextInvoice = `INV-${nextIdNum.toString().padStart(4, "0")}`;
        localStorage.setItem("invoiceId", nextInvoice);
        setInvoiceId(nextInvoice);

        setPayments([]);
        setPhoneNumber("");
        setSelectedSalesPerson("");
        setTotalReceived(0);
        setChangeAmount(0);
      } else {
        throw new Error(response.data.message || "Failed to create sale");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(
        `Error creating sale: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow">
      <div className="text-right space-y-1">
        <div>
          Invoice ID: <strong>{invoiceId}</strong>
        </div>
        <div>
          MRP: <strong>{mrp.toFixed(2)}৳</strong>
        </div>
        <div>
          (+) VAT: <strong>{vatAmount.toFixed(2)}৳</strong>
        </div>
        <div>
          (-) Discount: <strong>{discountAmount.toFixed(2)}৳</strong>
        </div>
        <div>
          Items: <strong>{totalItems}</strong>
        </div>
        <div>
          Total Qty: <strong>{totalQuantity}</strong>
        </div>
        <div className="text-xl font-semibold">
          Total Payable: <strong>{totalPayable.toFixed(2)}৳</strong>
        </div>
      </div>

      <PaymentMethod onPaymentsChange={handlePaymentsChange} />

      <div className="mt-2 border-t pt-2 text-right">
        <div>
          Payable: <strong>{totalPayable.toFixed(2)}৳</strong>
        </div>
        <div>
          Total Received: <strong>{totalReceived.toFixed(2)}৳</strong>
        </div>
        <div>
          Change: <strong>{changeAmount.toFixed(2)}৳</strong>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <button className="btn btn-error">Cancel</button>
        <button className="btn btn-success" onClick={handleCreateSell}>
          Add POS
        </button>
        <button className="btn btn-secondary" onClick={handleHold}>
          Hold
        </button>
        <button className="btn btn-info" onClick={handleLoadHolds}>
          Hold List
        </button>
        <button className="btn btn-accent">SMS</button>
        <button className="btn btn-warning">Quotation</button>
        <button className="btn btn-outline">Reattempt</button>
        <button className="btn btn-dark">Reprint</button>
      </div>

      {showHoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-md w-[400px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-3">Held Invoices</h3>
            {holdList.length === 0 ? (
              <p>No hold data found.</p>
            ) : (
              <ul className="space-y-2">
                {holdList.map((hold) => (
                  <li
                    key={hold.invoiceId}
                    className="border p-2 rounded flex justify-between items-center"
                  >
                    <span className="font-mono text-sm">{hold.invoiceId}</span>
                    <div className="space-x-2">
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() => handleRestore(hold)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(hold.invoiceId)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-right mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setShowHoldModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
