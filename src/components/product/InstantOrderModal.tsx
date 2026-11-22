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
import LiveProductOfferBox from "@/components/live/LiveProductOfferBox";
import type { LiveOffer } from "@/lib/hawolaLive";

type ShippingPlan = { shipping_cost?: string | number | null } | null | undefined;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productImage?: string | null;
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
  liveSessionId?: number | null;
  registerInterest?: boolean;
  onRegisterInterest?: (details: {
    fullName: string;
    phone: string;
    email: string;
  }) => Promise<void> | void;
  onOrderPlaced: (order: OrderDetailsResponse) => void;
  allowPrivateOffer?: boolean;
  liveOffer?: LiveOffer | null;
  onPrivateOffer?: (amount: number) => Promise<unknown> | unknown;
  onAcceptCounter?: () => Promise<unknown> | unknown;
};

type Step = "form" | "verify" | "done";

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
  productImage,
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
  liveSessionId,
  registerInterest = false,
  onRegisterInterest,
  onOrderPlaced,
  allowPrivateOffer = false,
  liveOffer = null,
  onPrivateOffer,
  onAcceptCounter,
}: Props) {
  const dispatch = useAppDispatch();
  const { states, stateLocations, isLoading: locationsLoading } = useAppSelector(
    (state) => state.general
  );
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [code, setCode] = useState("");
  const [codePrefix, setCodePrefix] = useState("");
  const [expireMinutes, setExpireMinutes] = useState(30);
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
    setCode("");
    setCodePrefix("");
    setExpireMinutes(30);
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
    if (registerInterest || !couponCodes.length || !isOpen || goodsSubtotal <= 0) {
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
  }, [goodsSubtotal, isOpen, productId, qty, registerInterest, shippingCost, unitPrice]);

  useEffect(() => {
    if (!isOpen) return;
    const onPendingCoupon = () => {
      setPendingCouponCode(readPendingCouponCode());
      void resolveCoupon();
    };
    window.addEventListener("hawola:pending-coupon", onPendingCoupon);
    return () => window.removeEventListener("hawola:pending-coupon", onPendingCoupon);
  }, [isOpen, resolveCoupon]);

  useEffect(() => {
    if (!isOpen) return;
    void resolveCoupon();
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
    ...(liveSessionId ? { live_session_id: liveSessionId } : {}),
  });

  const orderTotalBeforeCoupon = goodsSubtotal + shippingCost;
  const orderTotalAfterCoupon = appliedCoupon
    ? appliedCoupon.totalDue
    : orderTotalBeforeCoupon;

  const validateContactStep = () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      toast.error(registerInterest ? "Enter your full name" : "Enter your full name for delivery");
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

  const validateForm = () =>
    validateContactStep() && (registerInterest || validateDeliveryStep());

  const submitLabel = busy
    ? "Processing…"
    : registerInterest
      ? "Register Interest"
      : "Place order now";

  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    if (registerInterest) {
      if (!isAuthenticated) {
        toast.error("Sign in to register interest.");
        return;
      }
      setBusy(true);
      try {
        await onRegisterInterest?.({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
        setMessage(
          "The store has your interest and can reach you from this live."
        );
        setStep("done");
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Could not register your interest."
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      if (isAuthenticated) {
        try {
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
            ...(liveSessionId ? { live_session_id: liveSessionId } : {}),
          });
          if (data.order) {
            setMessage(data.detail || "Order placed successfully.");
            setStep("done");
            onOrderPlaced(data.order);
          } else {
            toast.error("Could not place order.");
          }
          return;
        } catch (placeErr: any) {
          if (placeErr?.response?.status !== 401) {
            throw placeErr;
          }
          if (!email.trim()) {
            toast.error("Your session expired. Enter your email to confirm this order.");
            return;
          }
        }
      }

      const data = await initiateInstantOrder(buildPayload());
      setMessage(data.detail || "");
      setAccountCreated(Boolean(data.account_created));
      if (data.code_prefix) setCodePrefix(data.code_prefix);
      if (data.expire_minutes) setExpireMinutes(Number(data.expire_minutes) || 30);
      if (data.email) setEmail(data.email);
      if (data.needs_verification) {
        setStep("verify");
        toast.message(
          data.code_prefix
            ? `Check your email for the code that starts with ${data.code_prefix}-`
            : "Check your email for a confirmation code"
        );
      } else if (data.order) {
        setStep("done");
        onOrderPlaced(data.order);
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      toast.error(
        typeof detail === "string" ? detail : "Could not start instant order"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    const typed = code.replace(/\D/g, "");
    const prefix = codePrefix.replace(/\D/g, "").slice(0, 3);
    let codeDigits = typed;
    if (typed.length === 6 && prefix.length === 3) {
      codeDigits = `${prefix}${typed}`;
    }
    if (codeDigits.length !== 9 && codeDigits.length !== 6) {
      toast.error("Type the last 6 digits from the email that starts with this prefix");
      return;
    }
    setBusy(true);
    try {
      const data = await verifyInstantOrder({
        product_id: productId,
        email: email.trim(),
        code: codeDigits,
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
      const status = e?.response?.status;
      const detail = e?.response?.data?.detail;
      if (status >= 500) {
        toast.error("Could not confirm this order. Request a new code and try again.");
      } else {
        toast.error(
          typeof detail === "string"
            ? detail
            : "That code is incorrect or has expired. Request a new one."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("form");
    setCode("");
    setCodePrefix("");
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      const data = await resendInstantOrderCode({
        product_id: productId,
        email: email.trim(),
      });
      if (data.code_prefix) setCodePrefix(data.code_prefix);
      if (data.expire_minutes) setExpireMinutes(Number(data.expire_minutes) || 30);
      setCode("");
      toast.success(data.detail || "New code sent");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not resend code");
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#FD9636] focus:ring-4 focus:ring-[#FD9636]/15";
  const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400";
  const couponCodesLabel = appliedCoupon
    ? (appliedCoupon.codes?.length ? appliedCoupon.codes : [appliedCoupon.code]).join(" + ")
    : "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal
      aria-labelledby="instant-order-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[min(94vh,780px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-3xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FD9636] via-[#ffb56b] to-[#425A8B]" />
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productImage}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100 ring-1 ring-slate-200" />
            )}
            <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FD9636]">
              {registerInterest ? "Contact the store" : "Skip the cart"}
            </p>
            <h2 id="instant-order-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {step === "done"
                ? registerInterest
                  ? "Interest registered"
                  : "Order placed"
                : step === "verify"
                  ? "Confirm your email"
                  : registerInterest
                    ? "Register interest"
                    : "Instant order"}
            </h2>
            {step !== "done" ? (
              <p className="mt-1 truncate text-sm text-slate-500">
                {productName.trim() || "This product"}
                {qty > 1 ? ` · Qty ${qty}` : ""}
              </p>
            ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === "form" ? (
            <div className="grid lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)]">
              <aside className="min-w-0 overflow-hidden border-b border-slate-100 bg-[#fff8f2] px-5 py-4 sm:px-6 lg:border-b-0 lg:border-r">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FD9636]">
                  {registerInterest ? "Listed price" : "You pay"}
                </p>
                <p className="mt-1 break-all text-2xl font-bold leading-tight tracking-tight text-slate-900 tabular-nums">
                  {formatCurrency(orderTotalAfterCoupon.toFixed(2))}
                </p>
                <dl className="mt-3 min-w-0 space-y-1.5 text-sm text-slate-600">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <dt className="min-w-0 shrink">
                      {qty} × {formatCurrency(unitPrice.toFixed(2))}
                    </dt>
                    <dd className="shrink-0 text-right font-medium tabular-nums">
                      {formatCurrency(goodsSubtotal.toFixed(2))}
                    </dd>
                  </div>
                  {registerInterest ? null : (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <dt>Shipping</dt>
                    <dd className="shrink-0 text-right font-medium tabular-nums">
                      {formatCurrency(shippingCost.toFixed(2))}
                    </dd>
                  </div>
                  )}
                  {registerInterest ? null : couponChecking && pendingCouponCode ? (
                    <div className="text-[#FD9636]">Checking coupon…</div>
                  ) : null}
                  {registerInterest ? null : appliedCoupon && appliedCoupon.amountSaved > 0 ? (
                    <div className="flex min-w-0 items-start justify-between gap-3 font-medium text-emerald-700">
                      <dt className="min-w-0 truncate">Coupon {couponCodesLabel}</dt>
                      <dd className="shrink-0 text-right tabular-nums">
                        -{formatCurrency(appliedCoupon.amountSaved.toFixed(2))}
                      </dd>
                    </div>
                  ) : registerInterest ? null : couponError ? (
                    <div className="text-sm text-amber-700">{couponError}</div>
                  ) : pendingCouponCode && !couponChecking ? (
                    <div className="text-sm text-amber-700">
                      Coupon {pendingCouponCode} does not apply to this item.
                    </div>
                  ) : null}
                </dl>
              </aside>

              <div className="space-y-5 px-5 py-5 sm:px-6">
                {/* {allowPrivateOffer && onPrivateOffer && !registerInterest ? (
                  <LiveProductOfferBox
                    listPrice={unitPrice}
                    offer={liveOffer}
                    onSend={onPrivateOffer}
                    onAcceptCounter={onAcceptCounter}
                  />
                ) : null} */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Your details</h3>
                  {!isAuthenticated ? (
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass}
                        placeholder="you@email.com"
                      />
                    </div>
                  ) : null}
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={fieldClass}
                      placeholder={registerInterest ? "Your name" : "Name on the delivery"}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                      placeholder="0803 123 4567"
                      autoComplete="tel"
                    />
                  </div>
                </section>

                {registerInterest ? null : (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Delivery</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Optional now — you can add this at checkout.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>State</label>
                      <select
                        value={deliveryState}
                        onChange={(e) => {
                          setDeliveryState(e.target.value);
                          setDeliveryLocation("");
                        }}
                        disabled={locationsLoading || !states?.data?.length}
                        className={fieldClass}
                      >
                        <option value="">
                          {locationsLoading ? "Loading states…" : "Select state"}
                        </option>
                        {states?.data?.map((state: { id: number; name: string }) => (
                          <option key={state.id} value={String(state.id)}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Area</label>
                      <select
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        disabled={!deliveryState || locationsLoading}
                        className={`${fieldClass} disabled:bg-slate-50`}
                      >
                        <option value="">
                          {deliveryState ? "Select area" : "Choose state first"}
                        </option>
                        {stateLocations?.data?.map(
                          (location: { id: number; name: string }) => (
                            <option key={location.id} value={String(location.id)}>
                              {location.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Street address</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className={fieldClass}
                      placeholder="Street, house number, landmark"
                    />
                  </div>
                </section>
                )}
              </div>
            </div>
          ) : null}

          {step === "verify" ? (
            <div className="space-y-4 px-5 py-4 sm:px-6">
              {appliedCoupon && appliedCoupon.amountSaved > 0 ? (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  Coupon {couponCodesLabel} applied ·{" "}
                  {formatCurrency(orderTotalAfterCoupon.toFixed(2))} total
                </p>
              ) : null}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">
                  We sent a code to{" "}
                  <span className="font-semibold text-slate-900">{email.trim()}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Expires in {expireMinutes} minutes.
                </p>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="mt-2 text-xs font-semibold text-[#FD9636] hover:underline"
                >
                  Wrong email? Change it
                </button>
              </div>
              <div>
                <label className={labelClass}>
                  {codePrefix ? `Code starting ${codePrefix}-` : "Confirmation code"}
                </label>
                <div className="flex items-center gap-2">
                  {codePrefix ? (
                    <div className="flex h-12 shrink-0 items-center rounded-xl bg-slate-100 px-3 text-lg font-bold tracking-[0.18em] text-slate-900">
                      {codePrefix}-
                    </div>
                  ) : null}
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    className={`${fieldClass} h-12 text-center text-lg tracking-[0.35em]`}
                    placeholder="••••••"
                    maxLength={9}
                  />
                </div>
                {codePrefix ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Open the Hawola email that starts with {codePrefix}- and type the last 6 digits.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="px-5 py-6 sm:px-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-900">
                {message ||
                  "Your order has been placed. Proceed to checkout to complete payment."}
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          {step === "form" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={handleSubmitForm}
                className="w-full rounded-2xl bg-[#FD9636] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#e8872f] disabled:opacity-60"
              >
                {submitLabel}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                {registerInterest
                  && "The store will follow up with you from this live."
                  }
              </p>
            </>
          ) : null}
          {step === "verify" ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleVerify}
                className="w-full rounded-2xl bg-[#FD9636] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#e8872f] disabled:opacity-60"
              >
                {busy ? "Confirming…" : "Confirm and place order"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleResend}
                className="w-full py-1 text-sm font-semibold text-[#FD9636] disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          ) : null}
          {step === "done" ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-[#425A8B] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#354a73]"
            >
              Continue
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

