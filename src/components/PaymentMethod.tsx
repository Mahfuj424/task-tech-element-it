"use client";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { TokenContext } from "../context/TokenContext";

interface Account {
  id: number;
  accountType: string;
  accountName: string;
}

interface PaymentItem {
  id: number;
  accountType: string;
  amount: string;
}

interface PaymentMethodProps {
  onPaymentsChange: (
    payments: { accountId: number; paymentAmount: number }[]
  ) => void;
}

export default function PaymentMethod({
  onPaymentsChange,
}: PaymentMethodProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([
    { id: 0, accountType: "", amount: "" },
  ]);
  const { token } = useContext(TokenContext);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          "https://front-end-task-lake.vercel.app/api/v1/account/get-accounts?type=All",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAccounts(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching accounts", error);
      }
    };

    fetchAccounts();
  }, []);

  const syncPayments = (updatedPayments: PaymentItem[]) => {
    const formatted = updatedPayments
      .filter((p) => p.id && p.amount) // Skip invalid
      .map((p) => ({
        accountId: Number(p.id),
        paymentAmount: parseFloat(p.amount),
      }));

    localStorage.setItem("payments", JSON.stringify(formatted));
    onPaymentsChange(formatted); // Call the parent callback
  };

  const handlePaymentChange = (index: number, field: string, value: string) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], [field]: value };

    // optional: auto-fill accountType
    if (field === "id") {
      const selected = accounts.find((acc) => acc.id === Number(value));
      if (selected) {
        updated[index].accountType = selected.accountType;
      }
    }

    setPayments(updated);
    syncPayments(updated);
  };

  const addPayment = () => {
    const updated = [...payments, { id: 0, accountType: "", amount: "" }];
    setPayments(updated);
    syncPayments(updated);
  };

  const removePayment = (index: number) => {
    const updated = [...payments];
    updated.splice(index, 1);
    setPayments(updated);
    syncPayments(updated);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">Payment Methods</h3>
      {payments.map((payment, index) => (
        <div key={index} className="flex items-center gap-2">
          <select
            value={payment.id}
            onChange={(e) => handlePaymentChange(index, "id", e.target.value)}
            className="select select-bordered w-1/2"
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName} ({account.accountType})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={payment.amount}
            onChange={(e) =>
              handlePaymentChange(index, "amount", e.target.value)
            }
            className="input input-bordered w-1/3"
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removePayment(index)}
          >
            ✕
          </button>
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={addPayment}>
        + Add Payment Method
      </button>
    </div>
  );
}
