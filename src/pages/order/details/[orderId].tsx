import type { NextPage } from 'next';
import {useEffect, useState} from 'react';
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useRouter} from "next/router";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getSingleOrder} from "@/redux/product/productSlice";
import {formatCurrency, getLatestStatus, orderItemImageUrl} from "@/util";
import productService from "@/redux/product/productService";
import disputeService from "@/redux/disputes/disputeService";
import { toast } from "sonner";
import { API } from "@/constant";
import { sanitizeRichNotice } from "@/util/sanitizeRichNotice";
import MerchantStoreLink from "@/components/merchant/MerchantStoreLink";
import Link from "next/link";
import {
    storefrontProductPath,
} from "@/lib/storefrontUrls";
import OrderReviewPanel from "@/components/order/OrderReviewPanel";
import OrderBuyerChatPanel from "@/components/order/OrderBuyerChatPanel";
import OrderDisputeFormCard from "@/components/order/OrderDisputeFormCard";

/** Build full URL for dispute proof image (backend may return relative path). */
function proofImageUrl(path: string | null | undefined): string | null {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = API?.replace(/\/$/, '') ?? '';
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

function isRichTextEmpty(html: unknown): boolean {
    const s = typeof html === 'string' ? html : '';
    if (!s || !s.trim()) return true;
    const stripped = s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return stripped.length === 0;
}

/** Sanitize dispute comment HTML: no links, no scripts. Safe tags only. */
function sanitizeCommentHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    if (typeof window === 'undefined') {
        return html.replace(/<[^>]*>/g, '');
    }
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: [],
    });
}

type DisputeFormData = {
    orderitem_number: string;
    dispute_reason: string;
    proof_image?: File | null;
    want_full_refund: boolean;
};

type DisputeCommentType = {
    id: number;
    comment: string;
    by_customer: boolean;
    by_merchant: boolean;
    created_at: string;
    image?: { full_size?: string; thumbnail?: string } | null;
    comment_images?: Array<{ id: number; image?: { full_size?: string; thumbnail?: string } }>;
};

/** Dispute as returned by GET dispute/:orderitem_number/ */
type DisputeDetailType = {
    dispute_reason?: string | null;
    created_at?: string | null;
    want_full_refund?: boolean;
    want_partial_refund?: boolean;
    amount_requested?: string | null;
    proof_image?: string | null;
    dispute_images?: Array<{ id: number; image?: { full_size?: string; thumbnail?: string } }>;
};

// Define validation schema
const disputeSchema = yup.object({
    dispute_reason: yup.string().required('Dispute reason is required').test('notEmpty', 'Dispute reason is required', (val) => !isRichTextEmpty(val)),
    proof_image: yup.mixed().nullable().optional().test(
        'fileSize',
        'File too large',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value => !value || (value && value.size <= 5000000) // 5MB max
    ),
    want_full_refund: yup.boolean().required(),
    orderitem_number: yup.string().required()
});

const OrderDetails: NextPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disputeDetails, setDisputeDetails] = useState<{ dispute: DisputeDetailType; order_item?: unknown } | null>(null);
    const [disputeComments, setDisputeComments] = useState<DisputeCommentType[]>([]);
    const [loadingDisputeComments, setLoadingDisputeComments] = useState(false);
    const [sendingDisputeComment, setSendingDisputeComment] = useState(false);
    const [disputeReplyText, setDisputeReplyText] = useState('');
    const [disputeReplyFiles, setDisputeReplyFiles] = useState<File[]>([]);
    const [directPaymentMessagingSafe, setDirectPaymentMessagingSafe] = useState("");

    const {singleOrder, isLoading} = useAppSelector(state => state.products)
    const { profile: userProfile } = useAppSelector((state) => state.auth);
    const siteSettings = useAppSelector((state) => state.general.siteSettings);

    const orderLatestStatus = getLatestStatus(singleOrder?.shipping_info?.flatMap(i => i.shipping_status
    ))
    const lineCancelled = Boolean(
        singleOrder?.is_cancelled || singleOrder?.orderitem_status === 'cancelled'
    );
    const isPaymentSettled = Boolean(singleOrder?.payment_confirmed || singleOrder?.isPaid);
    const displayOrderStatus = lineCancelled
        ? { text: 'Cancelled', className: 'bg-slate-200 text-slate-900' }
        : singleOrder?.isDelivered
        ? { text: 'Delivered', className: 'bg-green-100 text-green-800' }
        : !isPaymentSettled
            ? { text: 'Pending Payment', className: 'bg-amber-100 text-amber-800' }
            : orderLatestStatus?.status === 'received'
                ? { text: 'Received', className: 'bg-green-100 text-green-800' }
                : orderLatestStatus?.status === 'delivered'
                    ? { text: 'Delivered', className: 'bg-blue-100 text-blue-800' }
                    : orderLatestStatus?.status === 'in-transit'
                        ? { text: 'In Transit', className: 'bg-yellow-100 text-yellow-800' }
                        : singleOrder?.isShipped
                            ? { text: 'Shipped', className: 'bg-purple-100 text-purple-800' }
                            : { text: 'Processing', className: 'bg-gray-100 text-gray-800' };

    const router = useRouter();

    const dispatch = useAppDispatch();

    const { register, handleSubmit, setValue, control, formState: { errors }, reset } = useForm<DisputeFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(disputeSchema as any),
        defaultValues: {
            orderitem_number: (router?.query?.orderId as string) || '',
            want_full_refund: false  // deselected by default
        }
    });

    // Keep dispute form orderitem_number in sync with loaded order (backend expects orderitem_number)
    useEffect(() => {
        const id = singleOrder?.orderitem_number ?? (router?.query?.orderId as string);
        if (id && id !== 'undefined') setValue('orderitem_number', id);
    }, [singleOrder?.orderitem_number, router?.query?.orderId, setValue]);

    // Function to determine payment status message
    const getPaymentStatusMessage = () => {
        const {
            isPaid,
            payment_confirmed,
            is_offline_payment
        } = singleOrder;

        if (is_offline_payment) {
            return payment_confirmed
                ? "Offline payment confirmed by merchant"
                : "Offline payment pending confirmation";
        }

        if (isPaid) {
            return payment_confirmed
                ? "Payment confirmed, please process order"
                : "Payment received, pending confirmation";
        }

        return "Payment not yet received";
    };


    const onSubmitDispute = async (data: DisputeFormData) => {
        if (lineCancelled) {
            toast.error('This order line was cancelled.');
            return;
        }
        if (!isFormActive) {
            toast.error('You can submit a dispute only after the order is marked received or delivered.');
            return;
        }
        const orderItemNum = data.orderitem_number?.trim();
        if (!orderItemNum || orderItemNum === 'undefined') {
            toast.error('Order information is still loading. Please wait a moment and try again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('orderitem_number', orderItemNum);
            formData.append('dispute_reason', sanitizeCommentHtml(data.dispute_reason || ''));
            if (data.proof_image) {
                formData.append('proof_image', data.proof_image);
            }
            formData.append('want_full_refund', data.want_full_refund ? 'true' : 'false');

            await disputeService.createDispute(formData);

            toast.success('Dispute submitted successfully. The merchant has been notified by email.');
            reset();
            const orderId = router?.query?.orderId as string;
            if (orderId && orderId !== 'undefined') dispatch(getSingleOrder(orderId));
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            const msg = typeof detail === 'string' ? detail : err?.response?.data?.error ?? err?.message ?? 'Failed to submit dispute. Please try again.';
            const alreadyOpen = err?.response?.data?.dispute_closed !== undefined || err?.response?.data?.order_item !== undefined;
            if (alreadyOpen && detail) {
                toast.info(detail);
                const orderId = router?.query?.orderId as string;
                if (orderId && orderId !== 'undefined') dispatch(getSingleOrder(orderId));
            } else {
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormActive =
        !lineCancelled &&
        (singleOrder?.isDelivered === true || orderLatestStatus?.status === 'received');
    const isDeliveredAwaitingConfirmation =
        !lineCancelled &&
        singleOrder?.isDelivered === true &&
        singleOrder?.user_confirm_order !== true;
    const saleConcluded =
        !lineCancelled &&
        singleOrder?.isDelivered === true &&
        singleOrder?.user_confirm_order === true;
    const messagingClosed =
        lineCancelled ||
        singleOrder?.isDelivered === true ||
        singleOrder?.user_confirm_order === true;

    useEffect(() => {
        if (!singleOrder?.is_offline_payment) {
            setDirectPaymentMessagingSafe("");
            return;
        }
        const rawMessaging = (siteSettings?.direct_payment_messaging_notice_html as string | undefined)?.trim();
        const src = rawMessaging || "";
        setDirectPaymentMessagingSafe(src ? sanitizeRichNotice(src) : "");
    }, [
        singleOrder?.is_offline_payment,
        siteSettings?.direct_payment_messaging_notice_html,
    ]);

    useEffect(() => {
        const orderId = router?.query?.orderId;
        if (typeof orderId === 'string' && orderId && orderId !== 'undefined') {
            dispatch(getSingleOrder(orderId));
        }
    }, [dispatch, router?.query?.orderId]);

    const orderitemNumber = singleOrder?.orderitem_number || (router?.query?.orderId as string);
    const productSlug = singleOrder?.product?.slug;
    const merchantSlug =
        singleOrder?.product?.merchant?.slug ??
        (typeof singleOrder?.merchant === "object" && singleOrder?.merchant != null
            ? (singleOrder.merchant as { slug?: string }).slug
            : undefined);
    const merchantStoreName =
        singleOrder?.product?.merchant?.store_name ??
        (typeof singleOrder?.merchant === "object" && singleOrder?.merchant != null
            ? (singleOrder.merchant as { store_name?: string }).store_name
            : undefined);
    const productHref = storefrontProductPath(productSlug);
    const shipping = (singleOrder?.shipping_address || {}) as {
        address?: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        phone2?: string;
    };
    const shippingName = [shipping.first_name, shipping.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
    const shippingPhone = shipping.phone || shipping.phone2 || "";
    const shippingAltPhone =
        shipping.phone2 && shipping.phone2 !== shippingPhone
            ? shipping.phone2
            : singleOrder?.additional_info || "";

    const hasDispute = Boolean(singleOrder?.user_open_dispute || singleOrder?.dispute_id != null);
    useEffect(() => {
        if (!hasDispute || !orderitemNumber || orderitemNumber === 'undefined') return;
        const loadDispute = async () => {
            setLoadingDisputeComments(true);
            try {
                const [disputeRes, commentsRes] = await Promise.all([
                    disputeService.getDisputes(orderitemNumber),
                    disputeService.getDisputeComments(orderitemNumber),
                ]);
                setDisputeDetails(disputeRes?.dispute ? { dispute: disputeRes.dispute, order_item: disputeRes?.order_item } : null);
                setDisputeComments(Array.isArray(commentsRes?.comments) ? commentsRes.comments : []);
            } catch {
                setDisputeDetails(null);
                setDisputeComments([]);
            } finally {
                setLoadingDisputeComments(false);
            }
        };
        loadDispute();
    }, [hasDispute, orderitemNumber]);

    const handleAddDisputeComment = async () => {
        const text = disputeReplyText.trim();
        if (!orderitemNumber || !text || orderitemNumber === 'undefined') return;
        if (disputeComments.length >= 10) return;
        setSendingDisputeComment(true);
        try {
            const formData = new FormData();
            formData.append('orderitem_number', orderitemNumber);
            formData.append('comment', text);
            disputeReplyFiles.forEach((file) => formData.append('comment_images', file));
            const res = await disputeService.addDisputeComment(formData);
            setDisputeComments(Array.isArray(res?.comments) ? res.comments : []);
            setDisputeReplyText('');
            setDisputeReplyFiles([]);
            toast.success('Reply added. The merchant will be notified.');
        } catch (err: any) {
            const msg = err?.response?.data?.detail ?? err?.message ?? 'Failed to add reply.';
            toast.error(msg);
        } finally {
            setSendingDisputeComment(false);
        }
    };

    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const handleCancelOrderCustomer = async () => {
        if (!orderitemNumber || orderitemNumber === 'undefined' || lineCancelled) return;
        // eslint-disable-next-line no-alert
        if (
            !confirm(
                'Cancel this order line? You can only cancel before payment is confirmed, before proof of payment is uploaded, and before the item ships.'
            )
        ) {
            return;
        }
        setCancellingOrder(true);
        try {
            await productService.cancelCustomerOrderItem(orderitemNumber);
            toast.success('Order cancelled.');
            dispatch(getSingleOrder(orderitemNumber));
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            toast.error(typeof detail === 'string' ? detail : 'Could not cancel this order.');
        } finally {
            setCancellingOrder(false);
        }
    };
    const handleConfirmDelivery = async () => {
        if (!orderitemNumber) return;
        // eslint-disable-next-line no-alert
        if (
            !confirm(
                'Confirm only when the item is in your hands. The seller will be notified.'
            )
        ) {
            return;
        }
        setConfirmingOrder(true);
        try {
            await productService.confirmOrderItem(orderitemNumber);
            dispatch(getSingleOrder(orderitemNumber));
            toast.success('Thank you! We notified the seller that you received your order.');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to confirm delivery');
        } finally {
            setConfirmingOrder(false);
        }
    };

    const formatMessageDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthLayout>
            <div className="!p-0 min-h-screen bg-[linear-gradient(180deg,#eef3fb_0%,#f7f8fb_28%,#f3f4f6_100%)]">
                <Head>
                    <title>
                        {orderitemNumber ? `Order ${orderitemNumber}` : "Order details"} | Hawola
                    </title>
                </Head>
                {isLoading ? (
                    <div className="flex h-[470px] items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0B1B33] border-t-transparent" />
                    </div>
                ) : !singleOrder ? (
                    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
                        <h3 className="text-xl font-semibold text-slate-800">No order found</h3>
                        <p className="mt-2 text-slate-500">We couldn&apos;t find the order you&apos;re looking for.</p>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mt-6 rounded-xl bg-[#0B1B33] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Back
                        </button>
                    </div>
                ) : (
                    <>
                        <header className="bg-[#0B1B33] px-4 py-5 text-white sm:px-8 lg:px-16">
                            <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="mb-3 inline-flex items-center gap-1 text-sm text-white/75 hover:text-white"
                                    >
                                        ← Back to orders
                                    </button>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                                        Order details
                                    </p>
                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {singleOrder?.product?.name || "Your order"}
                                    </h1>
                                    <p className="mt-1 font-mono text-sm text-white/70">
                                        {singleOrder?.orderitem_number}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${displayOrderStatus.className}`}
                                >
                                    {displayOrderStatus.text}
                                </span>
                            </div>
                        </header>

                        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                            {!lineCancelled ? (
                                <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        {
                                            label: "Paid",
                                            done: Boolean(singleOrder?.payment_confirmed || singleOrder?.isPaid),
                                        },
                                        { label: "Shipped", done: Boolean(singleOrder?.isShipped) },
                                        {
                                            label: isDeliveredAwaitingConfirmation ? "Confirm receipt" : "Delivered",
                                            done: Boolean(singleOrder?.isDelivered && singleOrder?.user_confirm_order),
                                            active: isDeliveredAwaitingConfirmation,
                                        },
                                        { label: "Complete", done: Boolean(singleOrder?.user_confirm_order) },
                                    ].map((step) => (
                                        <div
                                            key={step.label}
                                            className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold sm:text-sm ${
                                                step.done
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                    : step.active
                                                      ? "border-amber-300 bg-amber-50 text-amber-900"
                                                      : "border-white/70 bg-white/80 text-slate-500"
                                            }`}
                                        >
                                            {step.label}
                                            {step.done ? <span className="mt-1 block">✓</span> : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {isDeliveredAwaitingConfirmation && !lineCancelled ? (
                                <div className="mb-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                                    <h2 className="text-lg font-bold text-slate-900">Did your order arrive?</h2>
                                    <p className="mt-1 text-sm text-slate-700">
                                        Your seller marked this as delivered. Confirm when the item is in your hands.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => void handleConfirmDelivery()}
                                        disabled={confirmingOrder}
                                        className="mt-4 rounded-xl bg-[#0B1B33] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        {confirmingOrder ? "Saving…" : "I received my order"}
                                    </button>
                                </div>
                            ) : null}

                            {lineCancelled ? (
                                <div className="mb-5 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                                    This order line was cancelled. Messaging and fulfilment actions are closed.
                                </div>
                            ) : null}

                            {!lineCancelled && hasDispute ? (
                                <div className="mb-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
                                    This item is disputed. Reply in the dispute thread below.
                                </div>
                            ) : null}

                            {/* Hero summary */}
                            <section className="mb-6 overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_12px_40px_rgba(11,27,51,0.06)]">
                                <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                                    <div className="flex items-center justify-center bg-slate-50 p-4 lg:border-r lg:border-[#e8eef7]">
                                        <img
                                            src={orderItemImageUrl(singleOrder)}
                                            alt={singleOrder?.name || "Product"}
                                            className="max-h-48 w-full object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">
                                                {singleOrder?.product?.name}
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Qty {singleOrder?.qty} · {formatCurrency(singleOrder?.order_price_subtotal)}
                                                {singleOrder?.shipping_price
                                                    ? ` + ${formatCurrency(singleOrder?.shipping_price)} shipping`
                                                    : ""}
                                            </p>
                                            <p className="mt-3 text-sm text-slate-600">{getPaymentStatusMessage()}</p>
                                            {singleOrder?.is_offline_payment ? (
                                                <p className="mt-1 text-xs font-medium text-amber-800">
                                                    Direct payment order — coordinate with the seller in chat and attach proof of payment there.
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Need to share a receipt or payment screenshot? Attach proof of payment in the chat.
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {productHref ? (
                                                <Link
                                                    href={productHref}
                                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-[#0B1B33] hover:bg-slate-100"
                                                >
                                                    View product
                                                </Link>
                                            ) : null}
                                            {merchantSlug ? (
                                                <MerchantStoreLink
                                                    slug={merchantSlug}
                                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-[#0B1B33] hover:bg-slate-100"
                                                >
                                                    {merchantStoreName
                                                        ? `View ${merchantStoreName}`
                                                        : "View seller store"}
                                                </MerchantStoreLink>
                                            ) : null}
                                            {singleOrder?.can_cancel && !lineCancelled ? (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelOrderCustomer}
                                                    disabled={cancellingOrder}
                                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                                >
                                                    {cancellingOrder ? "Cancelling…" : "Cancel order"}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                                <div className="space-y-5 xl:col-span-5">
                                    <section className="rounded-2xl border border-[#d7e0ef] bg-white p-5 shadow-[0_10px_40px_rgba(11,27,51,0.05)]">
                                        <h3 className="text-base font-semibold text-slate-900">Shipping</h3>
                                        <dl className="mt-4 space-y-3 text-sm">
                                            <div>
                                                <dt className="text-slate-500">Name</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {shippingName || singleOrder?.user || "—"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Address</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {shipping.address || "—"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Phone</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {shippingPhone || "—"}
                                                </dd>
                                            </div>
                                            {shippingAltPhone ? (
                                                <div>
                                                    <dt className="text-slate-500">Alt phone / note</dt>
                                                    <dd className="font-medium text-slate-900">{shippingAltPhone}</dd>
                                                </div>
                                            ) : null}
                                        </dl>
                                    </section>

                                    <section className="rounded-2xl border border-[#d7e0ef] bg-white p-5 shadow-[0_10px_40px_rgba(11,27,51,0.05)]">
                                        <h3 className="text-base font-semibold text-slate-900">Order totals</h3>
                                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-slate-500">Quantity</dt>
                                                <dd className="font-medium text-slate-900">{singleOrder?.qty}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Item price</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {formatCurrency(singleOrder?.order_price)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Shipping</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {formatCurrency(singleOrder?.shipping_price)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Subtotal</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {formatCurrency(singleOrder?.order_price_subtotal)}
                                                </dd>
                                            </div>
                                        </dl>
                                    </section>

                                    <section className="rounded-2xl border border-[#d7e0ef] bg-white p-5 shadow-[0_10px_40px_rgba(11,27,51,0.05)]">
                                        <h3 className="text-base font-semibold text-slate-900">Tracking</h3>
                                        <div className="mt-4 space-y-4">
                                            {(singleOrder?.shipping_info?.flatMap((info: any) => info?.shipping_status) || []).length ? (
                                                singleOrder.shipping_info
                                                    .flatMap((info: any) => info?.shipping_status || [])
                                                    .map((update: any, index: number) => (
                                                        <div key={index} className="flex gap-3">
                                                            <div
                                                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                                                    update?.status === "delivered"
                                                                        ? "bg-emerald-500"
                                                                        : update?.status === "in-transit"
                                                                          ? "bg-amber-500"
                                                                          : "bg-indigo-500"
                                                                }`}
                                                            />
                                                            <div>
                                                                <p className="text-xs text-slate-500">{update?.created_at}</p>
                                                                <p className="text-sm text-slate-800">{update?.note}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <p className="text-sm text-slate-500">No tracking updates yet.</p>
                                            )}
                                        </div>
                                        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                                            <div>
                                                <p className="text-slate-500">Tracking number</p>
                                                <p className="font-medium text-slate-900">
                                                    {singleOrder?.tracking_number || "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Expected arrival</p>
                                                <p className="font-medium text-slate-900">
                                                    {singleOrder?.shipping_info?.[0]?.expected_date_of_arrival || "—"}
                                                </p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-slate-500">Logistics company</p>
                                                <p className="font-medium text-slate-900">
                                                    {singleOrder?.shipping_info?.[0]?.logistics_company_name || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-5 xl:col-span-7">
                                    {orderitemNumber ? (
                                        <OrderBuyerChatPanel
                                            orderitemNumber={orderitemNumber}
                                            merchantStoreName={merchantStoreName}
                                            disabled={messagingClosed}
                                            offlineNoticeHtml={
                                                singleOrder?.is_offline_payment
                                                    ? directPaymentMessagingSafe
                                                    : ""
                                            }
                                            allowProofOfPayment={!messagingClosed}
                                            hasOpenDispute={hasDispute}
                                            defaultTab="chat"
                                            disputeContent={
                                                !hasDispute ? (
                                                    <div
                                                        className={
                                                            lineCancelled || !isFormActive
                                                                ? "opacity-60"
                                                                : ""
                                                        }
                                                    >
                                                        <OrderDisputeFormCard
                                                            embedded
                                                            isFormActive={isFormActive}
                                                            isDelivered={Boolean(singleOrder?.isDelivered)}
                                                            isSubmitting={isSubmitting}
                                                            register={register}
                                                            control={control}
                                                            errors={errors}
                                                            setValue={setValue}
                                                            reset={reset}
                                                            handleSubmit={handleSubmit}
                                                            onSubmit={onSubmitDispute}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-5">
                                                        {disputeDetails?.dispute ? (
                                                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                                <h3 className="text-base font-semibold text-slate-900">
                                                                    Your dispute submission
                                                                </h3>
                                                                <div className="mt-3 space-y-3">
                                                                    {disputeDetails.dispute.dispute_reason ? (
                                                                        <div>
                                                                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                                                Reason
                                                                            </span>
                                                                            <div
                                                                                className="prose prose-sm mt-0.5 max-w-none text-sm text-slate-900"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: sanitizeCommentHtml(
                                                                                        disputeDetails.dispute.dispute_reason
                                                                                    ),
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : null}
                                                                    <div>
                                                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                                            Refund
                                                                        </span>
                                                                        <p className="mt-0.5 text-sm text-slate-900">
                                                                            {disputeDetails.dispute.want_full_refund
                                                                                ? "Full refund requested"
                                                                                : disputeDetails.dispute.want_partial_refund ||
                                                                                    disputeDetails.dispute.amount_requested
                                                                                  ? `Partial refund${
                                                                                        disputeDetails.dispute.amount_requested
                                                                                            ? ` — ${disputeDetails.dispute.amount_requested}`
                                                                                            : ""
                                                                                    }`
                                                                                  : "No full refund requested"}
                                                                        </p>
                                                                    </div>
                                                                    {(disputeDetails.dispute.proof_image ||
                                                                        (disputeDetails.dispute.dispute_images?.length ?? 0) >
                                                                            0) && (
                                                                        <div>
                                                                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                                                Proof
                                                                            </span>
                                                                            <div className="mt-1 flex flex-wrap gap-2">
                                                                                {disputeDetails.dispute.proof_image
                                                                                    ? (() => {
                                                                                          const url = proofImageUrl(
                                                                                              disputeDetails.dispute.proof_image
                                                                                          );
                                                                                          return url ? (
                                                                                              <a
                                                                                                  key="proof"
                                                                                                  href={url}
                                                                                                  target="_blank"
                                                                                                  rel="noopener noreferrer"
                                                                                              >
                                                                                                  <img
                                                                                                      src={url}
                                                                                                      alt="Proof"
                                                                                                      className="max-h-24 rounded border border-slate-200 object-cover"
                                                                                                  />
                                                                                              </a>
                                                                                          ) : null;
                                                                                      })()
                                                                                    : null}
                                                                                {disputeDetails.dispute.dispute_images?.map(
                                                                                    (di) => (
                                                                                        <a
                                                                                            key={di.id}
                                                                                            href={
                                                                                                di.image?.full_size ||
                                                                                                di.image?.thumbnail
                                                                                            }
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                        >
                                                                                            <img
                                                                                                src={
                                                                                                    di.image?.thumbnail ||
                                                                                                    di.image?.full_size
                                                                                                }
                                                                                                alt="Proof"
                                                                                                className="max-h-24 rounded border border-slate-200 object-cover"
                                                                                            />
                                                                                        </a>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {disputeDetails.dispute.created_at ? (
                                                                        <p className="text-xs text-slate-500">
                                                                            Submitted{" "}
                                                                            {formatMessageDate(disputeDetails.dispute.created_at)}
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        ) : null}

                                                        <div>
                                                            <h3 className="text-base font-semibold text-slate-900">
                                                                Dispute thread
                                                            </h3>
                                                            <p className="mt-1 text-sm text-slate-600">
                                                                Reply here (max 10 messages). The merchant is notified when you add a
                                                                reply.
                                                            </p>
                                                            <div className="mt-4 max-h-[240px] space-y-3 overflow-y-auto rounded-xl bg-white p-3 ring-1 ring-slate-200">
                                                                {loadingDisputeComments ? (
                                                                    <p className="py-4 text-center text-sm text-slate-500">
                                                                        Loading dispute thread…
                                                                    </p>
                                                                ) : (
                                                                    <>
                                                                        {disputeComments.map((c) => (
                                                                            <div
                                                                                key={c.id}
                                                                                className={`flex ${
                                                                                    c.by_customer ? "justify-end" : "justify-start"
                                                                                }`}
                                                                            >
                                                                                <div
                                                                                    className={`max-w-[85%] rounded-xl px-4 py-2 ${
                                                                                        c.by_customer
                                                                                            ? "rounded-br-md bg-[#0B1B33] text-white"
                                                                                            : "rounded-bl-md bg-slate-200 text-slate-900"
                                                                                    }`}
                                                                                >
                                                                                    <p className="mb-0.5 text-xs font-medium opacity-90">
                                                                                        {c.by_customer ? "You" : "Merchant"}
                                                                                    </p>
                                                                                    <div
                                                                                        className="break-words text-sm"
                                                                                        dangerouslySetInnerHTML={{
                                                                                            __html: sanitizeCommentHtml(c.comment || ""),
                                                                                        }}
                                                                                    />
                                                                                    <p className="mt-1 text-xs opacity-75">
                                                                                        {formatMessageDate(c.created_at)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {disputeComments.length === 0 ? (
                                                                            <p className="py-4 text-center text-sm text-slate-500">
                                                                                No replies yet.
                                                                            </p>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {disputeComments.length < 10 ? (
                                                                <div className="mt-4 space-y-3">
                                                                    <textarea
                                                                        value={disputeReplyText}
                                                                        onChange={(e) => setDisputeReplyText(e.target.value)}
                                                                        rows={3}
                                                                        placeholder="Write a reply…"
                                                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                                                        disabled={sendingDisputeComment}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        onChange={(e) =>
                                                                            setDisputeReplyFiles(
                                                                                Array.from(e.target.files || [])
                                                                            )
                                                                        }
                                                                        className="block w-full text-sm text-slate-500"
                                                                    />
                                                                    <div className="flex justify-end">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => void handleAddDisputeComment()}
                                                                            disabled={
                                                                                sendingDisputeComment || !disputeReplyText.trim()
                                                                            }
                                                                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                                        >
                                                                            {sendingDisputeComment ? "Sending…" : "Send reply"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="mt-3 text-sm text-slate-500">
                                                                    Maximum of 10 dispute messages reached.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        />
                                    ) : null}

                                    {saleConcluded && orderitemNumber ? (
                                        <OrderReviewPanel
                                            orderitemNumber={orderitemNumber}
                                            productName={singleOrder?.product?.name}
                                            merchantStoreName={merchantStoreName}
                                            onSubmitted={() => {
                                                if (orderitemNumber) {
                                                    dispatch(getSingleOrder(orderitemNumber));
                                                }
                                            }}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthLayout>
    );

};

export default OrderDetails;