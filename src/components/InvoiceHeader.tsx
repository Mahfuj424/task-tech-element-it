interface InvoiceHeaderProps {
  invoiceNumber: string;
  barcode: string;
  setBarcode: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  salesPersons: string[];
  selectedSalesPerson: string;
  setSelectedSalesPerson: React.Dispatch<React.SetStateAction<string>>;
  discount: string;
  setDiscount: React.Dispatch<React.SetStateAction<string>>;
  vat: string;
  setVat: React.Dispatch<React.SetStateAction<string>>;
}

export default function InvoiceHeader({
  invoiceNumber,
  barcode,
  setBarcode,
  phone,
  setPhone,
  salesPersons,
  selectedSalesPerson,
  setSelectedSalesPerson,
  discount,
  setDiscount,
  vat,
  setVat,
}: InvoiceHeaderProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white shadow">
      <h2 className="text-lg font-semibold">Product & Customer Navigation</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Invoice Number"
          className="input"
          value={invoiceNumber}
          readOnly
        />
        <input
          type="text"
          placeholder="Product Barcode #"
          className="input"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select
          className="input"
          value={selectedSalesPerson}
          onChange={(e) => setSelectedSalesPerson(e.target.value)}
        >
          <option value="">Select Salesperson</option>
          {salesPersons?.map((salesPerson, index) => (
            <option key={index} value={salesPerson}>
              {salesPerson}
            </option>
          ))}
        </select>
        <select className="input">
          <option>Fixed</option>
        </select>
        <input
          type="text"
          placeholder="Enter The Discount Amount"
          className="input"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter The VAT Amount"
          className="input"
          value={vat}
          onChange={(e) => setVat(e.target.value)}
        />
      </div>
    </div>
  );
}
