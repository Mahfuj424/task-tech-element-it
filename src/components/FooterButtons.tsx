export default function FooterButtons() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
      <button className="btn btn-error">Cancel & Clear</button>
      <button className="btn btn-success">Add POS</button>
      <button className="btn btn-secondary">Hold</button>
      <button className="btn btn-info">Hold List</button>
    </div>
  );
}
