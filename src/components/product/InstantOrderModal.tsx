"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  initiateInstantOrder,
  placeInstantOrder,
  resendInstantOrderCode,
  verifyInstantOrder,
} from "@/services/instantOrderService";
import { validateCoupon } from "@/services/couponService";
import { getUserProfile } from "@/redux/auth/authSlice";
import { getAllStates, getStateLocations } from "@/redux/general/generalSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { readPendingCouponCode, readPendingCouponCodes, readPendingCouponMeta } from "@/lib/pendingCoupon";
import { couponAppliesToProduct } from "@/lib/storeCouponDiscount";
import { formatCurrency } from "@/util";
import type { OrderDetailsResponse } from "@/types/product";

type ShippingPlan = { shipping_cost?: string | number | null } | null | undefined;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  unitPrice: number;
  merchantId?: number;
  merchantStateName?: string;
  merchantLocationName?: string;
  shippingWithin?: ShippingPlan;
  shippingOutside?: ShippingPlan;
  shippingOutsideState?: ShippingPlan;
  qty: number;
  variants?: Array<{ variant: number; variant_value: number }>;
  isAuthenticated: boolean;
  userEmail?: string | null;
  userPhone?: string | null;
  onOrderPlaced: (order: OrderDetailsResponse) => void;
};

type Step = "form" | "verify" | "done";
type FormWizardPage = 1 | 2;

type AppliedCoupon = {
  code: string;
  codes: string[];
  amountSaved: number;
  totalDue: number;
  discountGoods: number;
  discountShipping: number;
};

function parseShippingCost(plan?: ShippingPlan): number {
  const n = parseFloat(String(plan?.shipping_cost ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

function computeShippingCost(opts: {
  merchantStateName?: string;
  merchantLocationName?: string;
  customerStateName: string;
  customerCityName: string;
  shippingWithin?: ShippingPlan;
  shippingOutside?: ShippingPlan;
  shippingOutsideState?: ShippingPlan;
}): number {
  const mState = (opts.merchantStateName || "").toLowerCase().trim();
  const mCity = (opts.merchantLocationName || "").toLowerCase().trim();
  const cState = (opts.customerStateName || mState).toLowerCase().trim();
  const cCity = (opts.customerCityName || mCity).toLowerCase().trim();

  if (mState && cState && mState !== cState) {
    return parseShippingCost(opts.shippingOutsideState);
  }
  if (mCity && cCity && mCity !== cCity) {
    return parseShippingCost(opts.shippingOutside);
  }
  return parseShippingCost(opts.shippingWithin);
}

export default function InstantOrderModal({
  isOpen,
  onClose,
  productId,
  productName,
  unitPrice,
  merchantId,
  merchantStateName,
  merchantLocationName,
  shippingWithin,
  shippingOutside,
  shippingOutsideState,
  qty,
  variants,
  isAuthenticated,
  userEmail,
  userPhone,
  onOrderPlaced,
}: Props) {
  const dispatch = useAppDispatch();
  const { states, stateLocations, isLoading: locationsLoading } = useAppSelector(
    (state) => state.general
  );
  const [step, setStep] = useState<Step>("form");
  const [formWizardPage, setFormWizardPage] = useState<FormWizardPage>(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pendingCouponCode, setPendingCouponCode] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStep("form");
    setFormWizardPage(1);
    setCode("");
    setMessage("");
    setAccountCreated(false);
    setAppliedCoupon(null);
    setCouponError(null);
    setEmail(userEmail || "");
    setPhone(userPhone || "");
    setFullName("");
    setDeliveryState("");
    setDeliveryLocation("");
    setStreetAddress("");
    setPendingCouponCode(readPendingCouponCode());
  }, [isOpen, userEmail, userPhone]);

  useEffect(() => {
    if (!isOpen) return;
    if (!states?.data?.length) {
      void dispatch(getAllStates());
    }
  }, [dispatch, isOpen, states?.data?.length]);

  useEffect(() => {
    if (!deliveryState) {
      setDeliveryLocation("");
      return;
    }
    void dispatch(getStateLocations(deliveryState));
  }, [deliveryState, dispatch]);

  const customerStateName = useMemo(() => {
    if (!deliveryState) return merchantStateName || "";
    const match = states?.data?.find(
      (s: { id: number }) => String(s.id) === deliveryState
    );
    return (match as { name?: string } | undefined)?.name || "";
  }, [deliveryState, merchantStateName, states?.data]);

  const customerCityName = useMemo(() => {
    if (!deliveryLocation) return merchantLocationName || "";
    const match = stateLocations?.data?.find(
      (l: { id: number }) => String(l.id) === deliveryLocation
    );
    return (match as { name?: string } | undefined)?.name || "";
  }, [deliveryLocation, merchantLocationName, stateLocations?.data]);

  const goodsSubtotal = useMemo(() => {
    const price = Number(unitPrice) || 0;
    return Math.round(price * qty * 100) / 100;
  }, [unitPrice, qty]);

  const shippingCost = useMemo(
    () =>
      computeShippingCost({
        merchantStateName,
        merchantLocationName,
        customerStateName,
        customerCityName,
        shippingWithin,
        shippingOutside,
        shippingOutsideState,
      }),
    [
      merchantStateName,
      merchantLocationName,
      customerStateName,
      customerCityName,
      shippingWithin,
      shippingOutside,
      shippingOutsideState,
    ]
  );

  const resolveCoupon = useCallback(async () => {
    const couponCodes = readPendingCouponCodes();
    const couponCode = couponCodes[0] || "";
    const couponMeta = readPendingCouponMeta();
    setPendingCouponCode(couponCodes.join(" + "));
    if (!couponCodes.length || !isOpen || goodsSubtotal <= 0) {
      setAppliedCoupon(null);
      setCouponError(null);
      return;
    }
    if (
      couponMeta?.scope === "products" &&
      !couponAppliesToProduct(couponMeta, productId)
    ) {
      setAppliedCoupon(null);
      setCouponError(`Coupon ${couponCode} is for a different product.`);
      return;
    }
    setCouponChecking(true);
    setCouponError(null);
    try {
      const data = await validateCoupon({
        code: couponCodes[0],
        codes: couponCodes,
        coupon_code_secondary: couponCodes[1],
        goods_total: goodsSubtotal,
        shipping_total: shippingCost,
        product_id: productId,
        unit_price: unitPrice,
        qty,
      });
      const amountSaved = Number(data.amount_saved) || 0;
      const appliedList = (
        Array.isArray(data.coupons) && data.coupons.length
          ? data.coupons.map((c) => String(c.code || "").toUpperCase())
          : [
              data.code,
              data.coupon_code_secondary || data.secondary?.code || "",
            ]
      )
        .map((c) => String(c || "").trim().toUpperCase())
        .filter(Boolean);
      setAppliedCoupon({
        code: appliedList[0] || couponCode,
        codes: appliedList,
        amountSaved,
        totalDue: Math.max(0, goodsSubtotal + shippingCost - amountSaved),
        discountGoods: Number(data.discount_goods) || 0,
        discountShipping: Number(data.discount_shipping) || 0,
      });
    } catch (e: unknown) {
      setAppliedCoupon(null);
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setCouponError(
        detail || `Coupon ${couponCode} could not be applied to this order.`
      );
    } finally {
      setCouponChecking(false);
    }
  }, [goodsSubtotal, isOpen, productId, qty, shippingCost, unitPrice]);

  useEffect(() => {
    if (!isOpen) return;
    const onPendingCoupon = () => {
      setPendingCouponCode(readPendingCouponCode());
      void resolveCoupon();
    };
    window.addEventListener("hawola:pending-coupon", onPendingCoupon);
    return () => window.removeEventListener("hawola:pending-coupon", onPendingCoupon);
  }, [isOpen, resolveCoupon]);

  if (!isOpen) return null;

  const deliveryFields = () => {
    const payload: {
      address?: string;
      state?: string;
      location?: string;
    } = {};
    if (streetAddress.trim()) payload.address = streetAddress.trim();
    if (deliveryState) payload.state = deliveryState;
    if (deliveryLocation) payload.location = deliveryLocation;
    return payload;
  };

  const couponCodeForOrder = appliedCoupon?.code || "";
  const couponSecondaryForOrder = appliedCoupon?.codes?.[1] || "";

  const buildPayload = () => ({
    product_id: productId,
    email: email.trim(),
    full_name: fullName.trim(),
    phone_number: phone.trim(),
    ...deliveryFields(),
    ...(couponCodeForOrder ? { coupon_code: couponCodeForOrder } : {}),
    ...(couponSecondaryForOrder
      ? { coupon_code_secondary: couponSecondaryForOrder }
      : {}),
    qty,
    ...(variants?.length ? { variant: variants } : {}),
  });

  const orderTotalBeforeCoupon = goodsSubtotal + shippingCost;
  const orderTotalAfterCoupon = appliedCoupon
    ? appliedCoupon.totalDue
    : orderTotalBeforeCoupon;

  const validateContactStep = () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      toast.error("Enter your full name for delivery");
      return false;
    }
    if (!trimmedPhone) {
      toast.error("Phone number is required");
      return false;
    }
    if (!isAuthenticated && !email.trim()) {
      toast.error("Email is required");
      return false;
    }
    return true;
  };

  const validateDeliveryStep = () => {
    if (deliveryState && !deliveryLocation) {
      toast.error("Please select an area for the chosen state");
      return false;
    }
    if (streetAddress.trim() && !deliveryState) {
      toast.error("Please select a state and area for your address");
      return false;
    }
    return true;
  };

  const validateForm = () => validateContactStep() && validateDeliveryStep();

  const handleWizardNext = () => {
    if (!validateContactStep()) return;
    setFormWizardPage(2);
  };

  const submitLabel = busy ? "Processing…" : "Place order now";

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setBusy(true);
    try {
      if (isAuthenticated) {
        const data = await placeInstantOrder({
          product_id: productId,
          full_name: fullName.trim(),
          phone_number: phone.trim(),
          ...deliveryFields(),
          ...(couponCodeForOrder ? { coupon_code: couponCodeForOrder } : {}),
          ...(couponSecondaryForOrder
            ? { coupon_code_secondary: couponSecondaryForOrder }
            : {}),
          qty,
          ...(variants?.length ? { variant: variants } : {}),
        });
        if (data.order) {
          setMessage(data.detail || "Order placed successfully.");
          setStep("done");
          onOrderPlaced(data.order);
        } else {
          toast.error("Could not place order.");
        }
        return;
      }

      const data = await initiateInstantOrder(buildPayload());
      setMessage(data.detail || "");
      setAccountCreated(Boolean(data.account_created));
      if (data.needs_verification) {
        setStep("verify");
        toast.message("Check your email for a confirmation code");
      } else if (data.order) {
        setStep("done");
        onOrderPlaced(data.order);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not start instant order");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error("Enter the confirmation code");
      return;
    }
    setBusy(true);
    try {
      const data = await verifyInstantOrder({
        product_id: productId,
        email: email.trim(),
        code: code.trim(),
      });
      if (data.access) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch {
          /* cookies set; profile refresh is best-effort */
        }
      }
      setAccountCreated(Boolean(data.account_created));
      setMessage(data.detail || "Order placed successfully.");
      if (data.order) {
        setStep("done");
        onOrderPlaced(data.order);
      } else {
        setStep("done");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      const data = await resendInstantOrderCode({
        product_id: productId,
        email: email.trim(),
      });
      toast.success(data.detail || "Code resent");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not resend code");
    } finally {
      setBusy(false);
    }
  };

  const orderSummary = (
    <div className="rounded-xl border border-[#FD9636]/25 bg-[#FFF8F2] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#FD9636]">
        Order total
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {formatCurrency(orderTotalAfterCoupon.toFixed(2))}
      </p>
      <dl className="mt-2 space-y-1 text-xs text-gray-600">
        <div className="flex justify-between gap-2">
          <dt>
            {qty} × {formatCurrency(unitPrice.toFixed(2))}
          </dt>
          <dd>{formatCurrency(goodsSubtotal.toFixed(2))}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Shipping</dt>
          <dd>{formatCurrency(shippingCost.toFixed(2))}</dd>
        </div>
        {couponChecking && pendingCouponCode ? (
          <div className="text-[#FD9636]">Checking coupon…</div>
        ) : null}
        {appliedCoupon && appliedCoupon.amountSaved > 0 ? (
          <div className="flex justify-between gap-2 font-medium text-emerald-700">
            <dt>
              Coupon{" "}
              {(appliedCoupon.codes?.length
                ? appliedCoupon.codes
                : [appliedCoupon.code]
              ).join(" + ")}
            </dt>
            <dd>-{formatCurrency(appliedCoupon.amountSaved.toFixed(2))}</dd>
          </div>
        ) : couponError ? (
          <div className="text-amber-700">{couponError}</div>
        ) : pendingCouponCode && !couponChecking ? (
          <div className="text-amber-700">
            Coupon {pendingCouponCode} does not apply to this item.
          </div>
        ) : null}
      </dl>
    </div>
  );

  const contactFields = (
    <>
      {!isAuthenticated ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#FD9636]"
            placeholder="you@email.com"
          />
        </div>
      ) : null}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Full name for delivery
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#FD9636]"
          placeholder="e.g. Oluwasegun Adeyemi"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Phone number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#FD9636]"
          placeholder="e.g. 0803 123 4567"
        />
      </div>
    </>
  );

  const deliveryFieldsBlock = (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-xs font-medium text-gray-500">
        Delivery location{" "}
        <span className="font-normal text-gray-400">(optional)</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">State</label>
          <select
            value={deliveryState}
            onChange={(e) => {
              setDeliveryState(e.target.value);
              setDeliveryLocation("");
            }}
            disabled={locationsLoading || !states?.data?.length}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#FD9636]"
          >
            <option value="">
              {locationsLoading ? "Loading states…" : "Select a state…"}
            </option>
            {states?.data?.map((state: { id: number; name: string }) => (
              <option key={state.id} value={String(state.id)}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Area</label>
          <select
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            disabled={!deliveryState || locationsLoading}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#FD9636] disabled:bg-gray-100"
          >
            <option value="">
              {deliveryState ? "Select an area…" : "Select state first"}
            </option>
            {stateLocations?.data?.map((location: { id: number; name: string }) => (
              <option key={location.id} value={String(location.id)}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Address <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#FD9636]"
          placeholder="Street, house number, landmark"
        />
      </div>
    </div>
  );

  const wizardStepIndicator = (
    <div className="flex items-center gap-2 lg:hidden">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          formWizardPage === 1
            ? "bg-[#FD9636] text-white"
            : "bg-emerald-100 text-emerald-800"
        }`}
      >
        1
      </div>
      <div className="h-px flex-1 bg-gray-200" />
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          formWizardPage === 2
            ? "bg-[#FD9636] text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        2
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="instant-order-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[min(92vh,720px)] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl lg:max-h-none">
        <div className="shrink-0 p-6 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#FD9636]">
                Instant Order
              </p>
              <h2 id="instant-order-title" className="mt-1 text-xl font-bold text-gray-900">
                {step === "done"
                  ? "Order placed"
                  : `Order ${productName.trim() || "this product"}`}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {step === "form" && (
            <>
              {/* Mobile: 2-step wizard */}
              <div className="mt-4 space-y-3 lg:hidden">
                {wizardStepIndicator}

                {formWizardPage === 1 ? (
                  <>
                    {orderSummary}
                    <p className="text-sm text-gray-600">Enter your details to place an order.</p>
                    {contactFields}
                    <p className="text-xs text-gray-500">
                      Qty: {qty}
                      {variants?.length ? " · Selected options included" : ""}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleWizardNext}
                      className="mt-2 w-full rounded-xl bg-[#FD9636] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e8872f] disabled:opacity-60"
                    >
                      Continue
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-500">Order total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(orderTotalAfterCoupon.toFixed(2))}
                      </p>
                    </div>
                    {deliveryFieldsBlock}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setFormWizardPage(1)}
                        className="w-1/3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleSubmitForm}
                        className="w-2/3 rounded-xl bg-[#FD9636] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e8872f] disabled:opacity-60"
                      >
                        {submitLabel}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop: single-page form */}
              <div className="mt-5 hidden space-y-3 lg:block">
                {orderSummary}
                <p className="text-sm text-gray-600">Enter your details to place an order.</p>
                {contactFields}
                {deliveryFieldsBlock}
                <p className="text-xs text-gray-500">
                  Qty: {qty}
                  {variants?.length ? " · Selected options included" : ""}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSubmitForm}
                  className="mt-2 w-full rounded-xl bg-[#FD9636] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e8872f] disabled:opacity-60"
                >
                  {submitLabel}
                </button>
              </div>
            </>
          )}

          {step === "verify" && (
            <div className="mt-5 space-y-3">
              {appliedCoupon && appliedCoupon.amountSaved > 0 ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                  Coupon{" "}
                  {(appliedCoupon.codes?.length
                    ? appliedCoupon.codes
                    : [appliedCoupon.code]
                  ).join(" + ")}{" "}
                  will be applied (
                  {formatCurrency(orderTotalAfterCoupon.toFixed(2))} total).
                </p>
              ) : null}
              <p className="text-sm text-gray-600">
                {message ||
                  (accountCreated
                    ? "Enter the code we emailed you to confirm your order and activate your account."
                    : "Enter the code we emailed you to confirm your order.")}
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Confirmation code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-center text-lg tracking-[0.3em] outline-none focus:border-[#FD9636]"
                  placeholder="••••••"
                  maxLength={6}
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleVerify}
                className="w-full rounded-xl bg-[#FD9636] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e8872f] disabled:opacity-60"
              >
                {busy ? "Confirming…" : "Place order now"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleResend}
                className="w-full text-sm font-medium text-[#FD9636] hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="mt-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                {message ||
                  "Your order has been placed. Proceed to checkout to complete payment."}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-[#FD9636] px-4 py-3 text-sm font-semibold text-white hover:bg-[#e8872f]"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
