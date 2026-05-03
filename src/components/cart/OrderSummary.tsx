import { AddressData } from "@/types/product";
import { amountFormatter, formatCurrency } from "@/util";
import AddressCard from "@/components/AddressCard";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import DeleteModal from "@/components/shared/Delete";
import { useAppDispatch } from "@/hook/useReduxTypes";
import {
  addToCarts,
  deleteAddress,
  getAddress,
  getCarts,
} from "@/redux/product/productSlice";
import { toast } from "sonner";

/** Tailwind `md` is 768px — sheet matches max-md */
function useIsNarrowViewport() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 767px)").matches
        : false,
    () => false
  );
}

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
  isAuthenticated = true,
  directMerchantMode,
  directMerchantNoticeHtml,
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
  onShowForm?: () => void;
  onCancelForm: () => void;
  onCheckout: () => void;
  loading: boolean;
  shippingError: string | null;
  isAuthenticated?: boolean;
  /** Site has escrow disabled — show notice and unpaid-through-Hawola copy */
  directMerchantMode?: boolean;
  /** Sanitized HTML from site settings (or default) */
  directMerchantNoticeHtml?: string;
}) => {
  const [openDelete, setOpenDelete] = useState<boolean | string | null>(null);

  const [deleting, setDeleting] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const narrow = useIsNarrowViewport();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!showForm || !narrow || !mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showForm, narrow, mounted]);

  // console.log("addresses--", addresses);
  // console.log("selectedAdd--", selectedAdd, selectedAdd?.id);
  

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
        warningText="Delete this address? You will not be able to undo this."
      />

      <h2 className="text-xl font-bold mb-4">Summary</h2>

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
            No saved address yet. Add one below when you are ready.
          </p>
        )}

        <button
          onClick={onAddNewAddress}
          className="mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add an address
        </button>

        {selectedAdd && !showForm ? (
          <button
            onClick={() => onEditAddress(selectedAdd)}
            className="mt-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit address
          </button>
        ) : null}

        {showForm && narrow && mounted
          ? createPortal(
              <div
                className="fixed inset-0 z-[100] md:hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-address-sheet-title"
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-slate-900/55 backdrop-blur-[3px] transition-opacity"
                  onClick={onCancelForm}
                  aria-label="Close address form"
                />
                <div className="absolute inset-x-0 bottom-0 flex max-h-[min(92vh,calc(100dvh-0.5rem))] flex-col rounded-t-[1.35rem] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/90">
                  <div
                    className="mx-auto mt-2.5 h-1 w-11 shrink-0 rounded-full bg-slate-200/90"
                    aria-hidden
                  />
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 pb-3 pt-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-deepOrange">
                        Delivery
                      </p>
                      <h2
                        id="cart-address-sheet-title"
                        className="truncate text-lg font-bold text-headerBg"
                      >
                        {editingAddress
                          ? "Edit delivery address"
                          : "New delivery address"}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={onCancelForm}
                      className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange focus-visible:ring-offset-2"
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                    <ShippingAddressForm
                      embedded
                      editingAddress={editingAddress}
                      selectedAdd={selectedAdd as AddressData}
                      onSuccess={onCancelForm}
                    />
                  </div>
                  <div className="shrink-0 border-t border-slate-100 bg-slate-50/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <button
                      type="button"
                      onClick={onCancelForm}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-deepOrange focus-visible:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}

        {showForm && !narrow ? (
          <div className="border-t pt-4 flex flex-col justify-between">
            <ShippingAddressForm
              editingAddress={editingAddress}
              selectedAdd={selectedAdd as AddressData}
              onSuccess={onCancelForm}
            />
            <button
              onClick={onCancelForm}
              className="mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        ) : null}

        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-lg">
            {formatCurrency(total.toFixed(2))}
          </span>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="mt-6">
        <h3 className="font-medium mb-3">Coupon code</h3>
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

      {directMerchantMode && directMerchantNoticeHtml ? (
        <div
          className="mt-4 rounded-lg border border-yellow-300/90 bg-yellow-50 p-4 text-sm font-medium text-yellow-950 shadow-sm ring-1 ring-yellow-900/[0.07] dark:border-yellow-300/90 dark:bg-yellow-50 dark:text-yellow-950 dark:ring-yellow-900/10 [&_a]:font-semibold [&_a]:text-yellow-900 [&_a]:underline dark:[&_a]:text-yellow-900"
          dangerouslySetInnerHTML={{ __html: directMerchantNoticeHtml }}
        />
      ) : null}

      {/* Show shipping error if exists */}
      {shippingError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-sm whitespace-pre-line">
              {shippingError}
            </div>
          </div>
        </div>
      )}

      {/* Show login message for unauthenticated users */}
      {!isAuthenticated && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-600 rounded-md text-sm">
          Log in to check out
        </div>
      )}

      {/* Checkout Button */}
      <button
        disabled={!selectedAdd || total <= 0 || loading || !isAuthenticated}
        onClick={onCheckout}
        className={`w-full mt-6 py-3 ${
          !selectedAdd || total <= 0 || loading || !isAuthenticated
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
            Working...
          </>
        ) : !isAuthenticated ? (
          "Log in to check out"
        ) : directMerchantMode ? (
          "Proceed to checkout"
        ) : (
          "Proceed to checkout"
        )}
      </button>
    </div>
  );
};

export default OrderSummary;
