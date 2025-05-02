/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import TokenProvider from "../components/TokenProdvider";
import InvoiceHeader from "../components/InvoiceHeader";
import ProductInfo from "../components/ProductInfo";
import CustomerInfo from "../components/CustomerInfo";
import SummaryPanel from "../components/SummaryPanel";

export default function POSPage() {
  const [invoiceNumber, setInvoiceNumber] = useState("010520250001");
  const [barcode, setBarcode] = useState("");
  const [phone, setPhone] = useState("01855271276");
  const [salesPersons, setSalesPersons] = useState<string[]>([]);
  const [productData, setProductData] = useState<any[]>([]); // Store product as an array
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [discount, setDiscount] = useState("");
  const [vat, setVat] = useState("");

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6IkthbXJ1bCIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJhZGRyZXNzIjpudWxsLCJwaG9uZSI6IjAxOTQ1NTE4OTgiLCJyb2xlIjoiTUFOQUdFUiIsImF2YXRhciI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MDE4MjcvZG93bmxvYWRfZDZzOGJpLmpwZyIsImJyYW5jaCI6MywiYnJhbmNoSW5mbyI6eyJpZCI6MywiYnJhbmNoTmFtZSI6IkhlYWQgT2ZmaWNlIiwiYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSIsImR1ZSI6MCwiYWRkcmVzcyI6IkJhc2h1bmRoYXJhIGNpdHkiLCJwaG9uZSI6IjAxOTQ1NTUxODkyOCIsImhvdGxpbmUiOiIwMTk0NTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmljZUBnbWFpbC5jb20iLCJvcGVuSG91cnMiOm51bGwsImNsb3NpbmdIb3VycyI6bnVsbCwiaXNBZGp1c3RtZW50Ijp0cnVlLCJ0eXBlIjoiSGVhZE9mZmljZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCI6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6lePwiXi20q0MppcIDxGtbsk"; // Replace this with the actual token

  useEffect(() => {
    const fetchSalesPersons = async () => {
      try {
        const res = await fetch(
          "https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setSalesPersons(data?.data?.map((emp: any) => emp.firstName));
      } catch (error) {
        console.error("Failed to load salespersons:", error);
      }
    };

    fetchSalesPersons();
  }, [token]);

  useEffect(() => {
    const fetchProductByBarcode = async () => {
      if (!barcode) return;
      try {
        const res = await fetch(
          `https://front-end-task-lake.vercel.app/api/v1/purchase/get-purchase-single?search=${barcode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        console.log("Product fetched:", data);

        // Get current products from localStorage
        const existingProducts = JSON.parse(
          localStorage.getItem("products") || "[]"
        );

        // Check if the product already exists in localStorage
        const isProductAlreadyAdded = existingProducts.some(
          (product: any) => product.sku === data?.data?.sku
        );
        if (isProductAlreadyAdded) {
          alert("This product is already added.");
        } else {
          // Add the product to localStorage (flat array)
          existingProducts.push(data?.data);
          localStorage.setItem("products", JSON.stringify(existingProducts));

          // Update the productData state with the updated array
          setProductData(existingProducts);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProductByBarcode();
  }, [barcode, token]);

  return (
    <TokenProvider>
      <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <InvoiceHeader
            invoiceNumber={invoiceNumber}
            barcode={barcode}
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
          <ProductInfo productData={productData} />
        </div>
        <div className="xl:col-span-1">
          <CustomerInfo />
          <SummaryPanel />
        </div>
      </div>
    </TokenProvider>
  );
}
