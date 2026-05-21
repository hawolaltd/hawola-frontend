import type { NextPage } from "next";
import { useState } from "react";
import { useAppSelector } from "@/hook/useReduxTypes";
import { formatCurrency } from "@/util";
import { useRouter } from "next/router";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { HI_SM } from "@/lib/hawolaIconTheme";

const Orders: NextPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { ordersHistory } = useAppSelector((state) => state.products);

  const router = useRouter();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(ordersHistory?.detail?.length / itemsPerPage);
  const paginatedOrders = ordersHistory?.detail?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isPaymentSettled = (order: any) =>
    Boolean(order?.payment_confirmed || order?.isPaid);

  const getStatusConfig = (order: any) => {
    if (order?.isDelivered) {
      return {
        icon: <CheckCircleIcon className={HI_SM} aria-hidden />,
        text: "Delivered",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    } else if (!isPaymentSettled(order)) {
      return {
        icon: <ClockIcon className={HI_SM} aria-hidden />,
        text: "Pending Payment",
        color: "text-amber-600",
        bg: "bg-amber-50",
      };
    } else if (order?.isShipped) {
      return {
        icon: <TruckIcon className={HI_SM} aria-hidden />,
        text: "Shipped",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    } else {
      return {
        icon: <ClockIcon className={HI_SM} aria-hidden />,
        text: "Processing",
        color: "text-gray-600",
        bg: "bg-gray-50",
      };
    }
  };

  if (!paginatedOrders || paginatedOrders.length === 0) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center py-12 sm:py-20">
          <ShoppingBagIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your order history will appear here
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2.5 bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Orders</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {ordersHistory?.detail?.length || 0} total orders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">
              {ordersHistory?.detail?.filter((o: any) => o.isDelivered).length || 0} Delivered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">
              {ordersHistory?.detail?.filter((o: any) => o.isShipped && !o.isDelivered && isPaymentSettled(o)).length || 0} Shipped
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">
              {ordersHistory?.detail?.filter((o: any) => !o.isDelivered && (!o.isShipped || !isPaymentSettled(o))).length || 0} Processing
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200">
        {/* Table Header (desktop only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-3">Product</div>
          <div className="col-span-2">Order ID</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Shipping</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {paginatedOrders?.map((order) => {
            const statusConfig = getStatusConfig(order);
            const isDisputed = Boolean(order?.user_open_dispute || order?.dispute_id != null);
            return (
              <div
                key={order?.id}
                className={`px-3 sm:px-6 py-3 sm:py-4 transition-colors cursor-pointer ${
                  isDisputed ? "bg-red-50/50 border-l-4 border-red-500 hover:bg-red-50/70" : "hover:bg-gray-50"
                }`}
                onClick={() => router.push(`/order/details/${order?.orderitem_number}`)}
              >
                {/* Mobile Layout (card) */}
                <div className="md:hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img
                        src={order?.image || "/placeholder.png"}
                        alt={order?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {order?.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono truncate">
                        #{order?.id} · {order?.orderitem_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {order?.qty || 1}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">Price</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {formatCurrency(order?.order_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Shipping</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {formatCurrency(order?.shipping_price || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Total</p>
                      <p className="font-bold text-gray-900 truncate">
                        {formatCurrency(order?.order_price_subtotal)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {order?.isDelivered ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 border border-green-200 text-xs">
                        <CheckCircleIcon className="w-3.5 h-3.5" aria-hidden />
                        <span className="font-medium">Delivered</span>
                      </div>
                    ) : !isPaymentSettled(order) ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                        <ClockIcon className="w-3.5 h-3.5" aria-hidden />
                        <span className="font-medium">Pending Payment</span>
                      </div>
                    ) : order?.isShipped ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs">
                        <TruckIcon className="w-3.5 h-3.5" aria-hidden />
                        <span className="font-medium">Shipped</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 text-xs">
                        <ClockIcon className="w-3.5 h-3.5" aria-hidden />
                        <span className="font-medium">Processing</span>
                      </div>
                    )}
                    {order?.payment_confirmed && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircleIcon className="w-3 h-3" />
                        Paid
                      </span>
                    )}
                    {isDisputed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        Disputed
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 gap-4">
                  {/* Product Info */}
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img
                        src={order?.image || "/placeholder.png"}
                        alt={order?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-0.5 truncate">
                        {order?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Qty: {order?.qty || 1}
                      </p>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <p className="text-sm font-mono text-gray-900">
                      #{order?.id}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                      {order?.orderitem_number}
                    </p>
                    {isDisputed && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 w-fit">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                        Disputed
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex flex-col justify-center text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order?.order_price)}
                    </p>
                  </div>

                  {/* Shipping */}
                  <div className="col-span-1 flex flex-col justify-center text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order?.shipping_price || 0)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 flex flex-col justify-center text-right">
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(order?.order_price_subtotal)}
                    </p>
                    {order?.payment_confirmed && (
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1 justify-end">
                        <CheckCircleIcon className="w-3 h-3" />
                        Paid
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center gap-2 flex-wrap">
                    {order?.isDelivered ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 border border-green-200">
                        <CheckCircleIcon className={HI_SM} aria-hidden />
                        <span className="text-sm font-medium">Delivered</span>
                      </div>
                    ) : !isPaymentSettled(order) ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200">
                        <ClockIcon className={HI_SM} aria-hidden />
                        <span className="text-sm font-medium">Pending Payment</span>
                      </div>
                    ) : order?.isShipped ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200">
                        <TruckIcon className={HI_SM} aria-hidden />
                        <span className="text-sm font-medium">Shipped</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200">
                        <ClockIcon className={HI_SM} aria-hidden />
                        <span className="text-sm font-medium">Processing</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div
                    className="col-span-2 flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isDisputed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600 text-white cursor-default">
                        <ExclamationTriangleIcon className={HI_SM} aria-hidden />
                        Disputed
                      </span>
                    )}
                    <span
                      className="cursor-pointer"
                      onClick={() => router.push(`/order/details/${order?.orderitem_number}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/order/details/${order?.orderitem_number}`);
                        }
                      }}
                    >
                      <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex-1 sm:flex-none px-4 py-2 border text-xs sm:text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`flex-1 sm:flex-none px-4 py-2 border text-xs sm:text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
