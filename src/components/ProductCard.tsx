import { RiDeleteBin5Line } from "react-icons/ri";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  size: string;
  discountPrice: number;
  sellPrice: number;
  subtotal: number;
  sku: string | string[];
  stock: number;
  color?: string;
  productId: number;
  onSkuClick: (
    sku: string,
    productId: number,
    name: string,
    size: string,
    discountPrice: number
  ) => void;
  onDeleteClick: (
    productId: number,
    name: string,
    discountPrice: number,
    size: string
  ) => void;
}

export default function ProductCard({
  name,
  size,
  discountPrice,
  sellPrice,
  subtotal = 0,
  sku,
  stock,
  color = "Not found",
  productId,
  onSkuClick,
  onDeleteClick,
}: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [skuToDelete, setSkuToDelete] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"sku" | "product" | null>(null);

  const skuArray = Array.isArray(sku) ? sku : sku?.split(",");
  const skuSuffixes = skuArray
    ?.map((s) => s?.split("-").pop())
    .filter((s) => !!s);

  const handleDeleteClick = () => {
    setModalType("product");
    setShowModal(true);
  };

  const handleSkuDeleteClick = (sku: string) => {
    setSkuToDelete(sku);
    setModalType("sku");
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (modalType === "sku" && skuToDelete) {
      onSkuClick(skuToDelete, productId, name, size, discountPrice);
    } else if (modalType === "product") {
      onDeleteClick(productId, name, discountPrice, size);
    }
    setShowModal(false);
    setSkuToDelete(null);
    setModalType(null);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSkuToDelete(null);
    setModalType(null);
  };

  return (
    <div className="border p-4 mt-2 rounded-lg bg-white shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Size:</strong> {size}
          </p>
          <p>
            <strong>Color:</strong> {color}
          </p>
          <p>
            <strong>Available Stock:</strong> {stock} Units
          </p>
          <p>
            <strong>SKU:</strong>{" "}
            {skuSuffixes?.length > 0
              ? skuSuffixes.map((skuItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSkuDeleteClick(skuArray[index])}
                    className="px-0.5 cursor-pointer hover:bg-red-500 hover:text-white transition-all duration-200 mr-2 rounded"
                  >
                    {skuItem}
                  </button>
                ))
              : "No SKU available"}
          </p>
        </div>
        <div className="text-right">
          <div className="">
            <span className="text-xl font-bold text-green-600">
              Tk. {discountPrice}{" "}
            </span>

            <span
              className={`text-md line-through ${
                discountPrice === sellPrice
                  ? "hidden"
                  : `${sellPrice ? "text-red-500" : ""}`
              }`}
            >
              {sellPrice}
            </span>
          </div>
          <div>
            Subtotal: <strong>{subtotal.toFixed(2)}</strong>
          </div>
        </div>
        <div>
          <RiDeleteBin5Line
            onClick={handleDeleteClick}
            className="text-red-500 cursor-pointer hover:bg-red-500 hover:text-white size-6 rounded-full p-1 transition-all duration-200"
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[300px]">
            <p>
              {modalType === "sku" ? (
                <>
                  Are you sure you want to delete SKU:{" "}
                  <strong>{skuToDelete}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to delete the product:{" "}
                  <strong>{name}</strong> along with all SKUs?
                </>
              )}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleConfirmDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
