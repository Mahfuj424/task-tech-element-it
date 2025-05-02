export default function PaymentMethod() {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <select className="input">
          <option>Islami bank</option>
        </select>
        <input
          type="text"
          placeholder="Enter Payment Amount"
          className="input"
          defaultValue="2000"
        />
      </div>
      <div className="flex gap-2 items-center">
        <select className="input">
          <option>Cash</option>
        </select>
        <input
          type="text"
          placeholder="Enter Payment Amount"
          className="input"
          defaultValue="3000"
        />
      </div>
    </div>
  );
}
