import PaymentMethod from "./PaymentMethod";

export default function SummaryPanel() {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow">
      <div className="text-right">
        <div>
          Maximum Retail Price (MRP): <strong>4000.00৳</strong>
        </div>
        <div>
          (+) VAT/Tax: <strong>0.00৳</strong>
        </div>
        <div>
          (-) Discount: <strong>0.00৳</strong>
        </div>
        <div>
          Number Of Items: <strong>3</strong>
        </div>
        <div>
          Total Items Quantity: <strong>6</strong>
        </div>
        <div className="text-xl font-semibold">
          Total Payable Amount: <strong>4000.00৳</strong>
        </div>
      </div>
      <PaymentMethod />
      <div className="mt-2 border-t pt-2">
        <div>
          Payable Amount: <strong>4000.00৳</strong>
        </div>
        <div>
          Total Received Amount: <strong>5000.00৳</strong>
        </div>
        <div>
          Change: <strong>1000.00৳</strong>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button className="btn btn-error">Cancel & Clear</button>
        <button className="btn btn-success">Add POS</button>
        <button className="btn btn-secondary">Hold</button>
        <button className="btn btn-info">Hold List</button>
        <button className="btn btn-accent">SMS</button>
        <button className="btn btn-warning">Quotation</button>
        <button className="btn btn-outline">Reattempt</button>
        <button className="btn btn-dark">Reprint</button>
      </div>
    </div>
  );
}
