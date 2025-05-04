/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import TokenProvider from "../components/TokenProdvider";
import InvoiceHeader from "../components/InvoiceHeader";
import ProductInfo from "../components/ProductInfo";
import CustomerInfo from "../components/CustomerInfo";
import SummaryPanel from "../components/SummaryPanel";
import toast, { Toaster } from "react-hot-toast";

export default function POSPage() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-010520250001");
  const [barcode, setBarcode] = useState("");
  const [phone, setPhone] = useState("01855271276");
  const [membershipId, setMembershipId] = useState("");
  const [salesPersons, setSalesPersons] = useState<
    { id: number; name: string }[]
  >([]);
  console.log(salesPersons, "salesPersons");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [discount, setDiscount] = useState("");
  const [vat, setVat] = useState("");

  const [summary, setSummary] = useState({
    mrp: 0,
    vatAmount: 0,
    discountAmount: 0,
    totalItems: 0,
    totalQuantity: 0,
    totalPayable: 0,
    selectedSalesPerson: "",
    phoneNumber: "",
    membershipId: "",
    invoiceNumber: "",
  });

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6IkthbXJ1bCIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJhZGRyZXNzIjpudWxsLCJwaG9uZSI6IjAxOTQ1NTE4OTgiLCJyb2xlIjoiTUFOQUdFUiIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MDE4MjcvZG93bmxvYWRfZDZzOGJpLmpwZyIsImJyYW5jaCI6MywiYnJhbmNoSW5mbyI6eyJpZCI6MywiYnJhbmNoTmFtZSI6IkhlYWQgT2ZmaWNlIiwiYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSIsImR1ZSI6MCwiYWRkcmVzcyI6IkJhc2h1bmRoYXJhIGNpdHkiLCJwaG9uZSI6IjAxOTQ1NTUxODkyOCIsImhvdGxpbmUiOiIwMTk0NTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJvcGVuSG91cnMiOm51bGwsImNsb3NpbmdIb3VycyI6bnVsbCwiaXNBZGp1c3RtZW50Ijp0cnVlLCJ0eXBlIjoiSGVhZE9mZmljZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCI6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6lePwiXi20q0MppcIDxGtbsk"; // shortened for clarity

  // 🔁 Generate invoiceNumber on first load
  useEffect(() => {
    const holds = JSON.parse(localStorage.getItem("holdList") || "[]");
    const lastId = holds?.[holds.length - 1]?.summary?.invoiceNumber;
    const datePrefix = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")
      .slice(0, 6); // YYMMDD
    let nextId = `${datePrefix}0001`;

    if (lastId && lastId.startsWith(datePrefix)) {
      const lastCount = parseInt(lastId.slice(6));
      nextId = `${datePrefix}${(lastCount + 1).toString().padStart(4, "0")}`;
    }

    setInvoiceNumber(nextId);
    localStorage.setItem("invoiceNumber", nextId);
  }, []);

  useEffect(() => {
    const invoiceId = localStorage.getItem("invoiceId");
    setInvoiceNumber(invoiceId || invoiceNumber);
  });

  // 🔄 Load salespersons

  useEffect(() => {
    const fetchSalesPersons = async () => {
      try {
        const res = await fetch(
          "https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setSalesPersons(
          data?.data?.map((emp: any) => ({
            id: emp.id,
            name: emp.firstName,
          }))
        );
      } catch (error) {
        console.error("Failed to load salespersons:", error);
      }
    };

    fetchSalesPersons();
  }, [token]);

  // 📦 Add product via barcode
  useEffect(() => {
    const fetchAndStoreProduct = async () => {
      if (!barcode) return;

      // Validate barcode format: 5 digits + hyphen + 5 digits
      const barcodePattern = /^\d{5}-\d{5}$/;
      if (!barcodePattern.test(barcode)) {
        toast.error("Invalid barcode format. Use format: 12345-67890");
        return;
      }

      try {
        const res = await fetch(
          `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${barcode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const product = data?.data;

        if (product) {
          const stored = localStorage.getItem("products");
          let existing: any[] = [];

          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              existing = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              existing = [];
            }
          }

          const newProducts = Array.isArray(product) ? product : [product];
          const filtered = newProducts.filter((newItem) => {
            return !existing.some(
              (oldItem) =>
                oldItem.productName === newItem.productName &&
                oldItem.size === newItem.size &&
                oldItem.sku === newItem.sku
            );
          });

          if (filtered.length > 0) {
            const updated = [...existing, ...filtered];
            localStorage.setItem("products", JSON.stringify(updated));
            window.dispatchEvent(new Event("storageUpdate"));
          }
        }
      } catch (err) {
        console.error("Error fetching product by barcode:", err);
      }
    };

    fetchAndStoreProduct();
  }, [barcode, token]);

  // ✅ Store values to localStorage and trigger recalculation
  useEffect(() => {
    localStorage.setItem("discount", discount || "0");
    localStorage.setItem("vat", vat || "0");
    localStorage.setItem("phoneNumber", phone || "");
    localStorage.setItem("membershipId", membershipId || "");
    localStorage.setItem("invoiceNumber", invoiceNumber || "");
    localStorage.setItem("selectedSalesPerson", selectedSalesPerson || "");

    window.dispatchEvent(new Event("storageUpdate"));
  }, [discount, vat, phone, membershipId, invoiceNumber, selectedSalesPerson]);

  // 🧮 Calculate summary
  useEffect(() => {
    const calculateSummary = () => {
      try {
        const stored = localStorage.getItem("products");
        let products: any[] = [];

        if (stored) {
          try {
            products = JSON.parse(stored);
            if (!Array.isArray(products)) products = [];
          } catch {
            products = [];
          }
        }

        const uniqueProductKeys = new Set(
          products.map((p) => `${p.productName}_${p.size}`)
        );

        const totalItems = uniqueProductKeys.size;
        const totalQuantity = products.reduce(
          (sum, p) => sum + (p.quantity || 1),
          0
        );

        const totalPrice = parseFloat(
          localStorage.getItem("totalPrice") || "0"
        );
        const savedDiscount = localStorage.getItem("discount") || "0";
        const savedVat = localStorage.getItem("vat") || "0";

        const discountAmount = parseFloat(savedDiscount);
        const vatPercent = parseFloat(savedVat);
        const vatAmount = ((totalPrice - discountAmount) * vatPercent) / 100;
        const totalPayable = totalPrice - discountAmount + vatAmount;

        const newSummary = {
          mrp: totalPrice,
          vatAmount,
          discountAmount,
          totalItems,
          totalQuantity,
          totalPayable,
          selectedSalesPerson:
            localStorage.getItem("selectedSalesPerson") || "",
          phoneNumber: localStorage.getItem("phoneNumber") || "",
          membershipId: localStorage.getItem("membershipId") || "",
          invoiceNumber: localStorage.getItem("invoiceNumber") || "",
        };

        setSummary(newSummary);
        localStorage.setItem("posSummary", JSON.stringify(newSummary));
      } catch (error) {
        console.error("Error calculating summary:", error);
      }
    };

    calculateSummary();

    window.addEventListener("storageUpdate", calculateSummary);
    return () => window.removeEventListener("storageUpdate", calculateSummary);
  }, []);

  return (
    <TokenProvider>
      <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <InvoiceHeader
            invoiceNumber={invoiceNumber}
            barcode={barcode}
            setMembershipId={setMembershipId}
            membershipId={membershipId}
            setBarcode={setBarcode}
            phone={phone}
            setPhone={setPhone}
            salesPersons={salesPersons}
            selectedSalesPerson={selectedSalesPerson}
            setSelectedSalesPerson={setSelectedSalesPerson}
            discount={discount}
            setDiscount={setDiscount}
            vat={vat}
            setVat={setVat}
          />
          <ProductInfo />
        </div>
        <div className="xl:col-span-1">
          <CustomerInfo />
          <SummaryPanel
            mrp={summary.mrp}
            vatAmount={summary.vatAmount}
            discountAmount={summary.discountAmount}
            totalItems={summary.totalItems}
            totalQuantity={summary.totalQuantity}
            totalPayable={summary.totalPayable}
            onRestore={() => window.dispatchEvent(new Event("storageUpdate"))}
          />
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </TokenProvider>
  );
}
