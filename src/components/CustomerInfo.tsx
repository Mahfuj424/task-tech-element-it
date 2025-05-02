const CustomerInfo = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value="N/A"
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value="01855271276"
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Membership</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value="Not found"
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Discount</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value="Not found"
          readOnly
        />
      </div>
    </div>
  );
};

export default CustomerInfo;
