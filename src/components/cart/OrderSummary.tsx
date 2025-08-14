import { AddressData } from "@/types/product";
import { amountFormatter, formatCurrency } from "@/util";
import AddressCard from "@/components/AddressCard";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import React, { useState } from "react";
import DeleteModal from "@/components/shared/Delete";
import { useAppDispatch } from "@/hook/useReduxTypes";
import {
  addToCarts,
  deleteAddress,
  getAddress,
  getCarts,
} from "@/redux/product/productSlice";
import { toast } from "sonner";

const OrderSummary = ({
  subtotal,
  shippingCost,
  total,
  addresses,
  selectedAdd,
  onAddNewAddress,
  onEditAddress,
  onSelectAddress,
  showForm,
  editingAddress,
  onCancelForm,
  loading,
  onCheckout,
  shippingError,
}: {
  subtotal: number;
  shippingCost: number;
  total: number;
  addresses: any;
  selectedAdd: AddressData | null;
  onAddNewAddress: () => void;
  onEditAddress: (address: any) => void;
  onSelectAddress: (address: any) => void;
  showForm: boolean;
  editingAddress: boolean;
  onCancelForm: () => void;
  onCheckout: () => void;
  loading: boolean;
  shippingError: string | null;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean | string | null>(null);

  const [deleting, setDeleting] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <DeleteModal
        open={openDelete as boolean}
        loading={deleting}
        onClose={() => setOpenDelete(null)}
        handleDelete={async () => {
          const res = await dispatch(
            deleteAddress({
              items: [openDelete],
            })
          );
          if (res?.type.includes("fulfilled")) {
            dispatch(getAddress());
            setOpenDelete(null);
          }
        }}
        warningText={`You are about to delete from your address, Are you really sure about this? This action cannot be undone`}
      />

      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">
            {formatCurrency(subtotal.toFixed(2))}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className="font-semibold">
            {formatCurrency(shippingCost.toFixed(2))}
          </span>
        </div>

        {/* Address Section */}
        {addresses.addresses?.length > 0 ? (
          addresses?.addresses?.map((address: AddressData) => (
            <AddressCard
              key={address?.id}
              address={address}
              onEdit={() => onEditAddress(address)}
              onSelect={() => onSelectAddress(address)}
              isSelected={selectedAdd?.id === address.id}
              onDelete={() => {
                setOpenDelete(address?.id as unknown as string);
              }}
            />
          ))
        ) : (
          <p className="text-gray-500 mb-4">
            You don't have any saved addresses yet.
          </p>
        )}

        <button
          onClick={onAddNewAddress}
          className="mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add New Address
        </button>

        {showForm && (
          <div className="border-t pt-4 flex flex-col justify-between">
            <ShippingAddressForm
              editingAddress={editingAddress}
              selectedAdd={selectedAdd as AddressData}
            />
            <button
              onClick={onCancelForm}
              className="mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-lg">
            {formatCurrency(total.toFixed(2))}
          </span>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="mt-6">
        <h3 className="font-medium mb-3">Apply Coupon</h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter coupon code"
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-primary text-white rounded-r-md transition">
            Apply
          </button>
        </div>
      </div>

      {/* Show shipping error if exists */}
      {shippingError && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
          {shippingError}
        </div>
      )}

      {/* Checkout Button */}
      <button
        disabled={!selectedAdd || total <= 0 || loading}
        onClick={onCheckout}
        className={`w-full mt-6 py-3 ${
          !selectedAdd || total <= 0 || loading
            ? "bg-blue-200 cursor-not-allowed"
            : "bg-primary hover:bg-primary-dark"
        } text-white font-medium rounded-md transition flex justify-center items-center`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          "Proceed To Checkout"
        )}
      </button>
    </div>
  );
};

export default OrderSummary;
