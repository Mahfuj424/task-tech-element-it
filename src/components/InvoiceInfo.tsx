/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { TokenContext } from "../context/TokenContext";

interface Employee {
  _id: string;
  firstName: string;
}

const InvoiceInfo = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [discount, setDiscount] = useState("");
  const [vat, setVat] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [discountType, setDiscountType] = useState("Fixed");
  const { token } = useContext(TokenContext);

  useEffect(() => {
    // Generate invoice number based on date + count
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const last = localStorage.getItem("lastInvoice") || "000";
    const next = ("000" + (parseInt(last) + 1)).slice(-3);
    const generatedInvoice = `${datePrefix}${next}`;
    setInvoiceNumber(generatedInvoice);
    localStorage.setItem("lastInvoice", next);
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "https://front-end-task-lake.vercel.app/api/v1/employee/get-employee-all",
          {
            headers: {
              Authorization: `Bearer: ${token}`,
            },
          }
        );

        setEmployees(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium">Invoice Number</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={invoiceNumber}
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Product Barcode #</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Name/Barcode"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Membership ID</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Select Sales Person</label>
        <select
          className="select select-bordered w-full"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">Select</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.firstName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Select Discount Type
        </label>
        <select
          className="select select-bordered w-full"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
        >
          <option value="Fixed">Fixed</option>
          <option value="Percentage">Percentage</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Enter Discount Amount
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Enter VAT Amount</label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={vat}
          onChange={(e) => setVat(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceInfo;
