import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import {useEffect, useState} from 'react';
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useRouter} from "next/router";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getAddress, getSingleOrder} from "@/redux/product/productSlice";
import {formatCurrency, getLatestStatus} from "@/util";
import productService from "@/redux/product/productService";
import disputeService from "@/redux/disputes/disputeService";
import { toast } from "sonner";
import { API } from "@/constant";

const TinyMCEEditor = dynamic(
    () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
    { ssr: false }
);

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

type OrderItemMessageType = {
    id: number;
    order_item: number;
    sender_type: 'merchant' | 'customer';
    message: string;
    created_at: string;
};

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
    const [messages, setMessages] = useState<OrderItemMessageType[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [disputeDetails, setDisputeDetails] = useState<{ dispute: DisputeDetailType; order_item?: unknown } | null>(null);
    const [disputeComments, setDisputeComments] = useState<DisputeCommentType[]>([]);
    const [loadingDisputeComments, setLoadingDisputeComments] = useState(false);
    const [sendingDisputeComment, setSendingDisputeComment] = useState(false);
    const [disputeReplyText, setDisputeReplyText] = useState('');
    const [disputeReplyFiles, setDisputeReplyFiles] = useState<File[]>([]);

    const {singleOrder, isLoading} = useAppSelector(state => state.products)

    const orderLatestStatus = getLatestStatus(singleOrder?.shipping_info?.flatMap(i => i.shipping_status
    ))

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
                ? "Offline payment confirmed, please process order"
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

    const isFormActive = singleOrder?.isDelivered === true || orderLatestStatus?.status === 'received';
    const isDeliveredAwaitingConfirmation = singleOrder?.isDelivered === true && singleOrder?.user_confirm_order !== true;
    const messagingClosed = singleOrder?.isDelivered === true || singleOrder?.user_confirm_order === true;

    useEffect(() => {
        const orderId = router?.query?.orderId;
        if (typeof orderId === 'string' && orderId && orderId !== 'undefined') {
            dispatch(getSingleOrder(orderId));
        }
    }, [dispatch, router?.query?.orderId]);

    const orderitemNumber = singleOrder?.orderitem_number || (router?.query?.orderId as string);

    useEffect(() => {
        if (!orderitemNumber) return;
        const load = async () => {
            setLoadingMessages(true);
            try {
                const list = await productService.getOrderItemMessages(orderitemNumber);
                setMessages(Array.isArray(list) ? list : []);
            } catch {
                setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        };
        load();
    }, [orderitemNumber]);

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
    const handleConfirmDelivery = async () => {
        if (!orderitemNumber) return;
        setConfirmingOrder(true);
        try {
            await productService.confirmOrderItem(orderitemNumber);
            dispatch(getSingleOrder(orderitemNumber));
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to confirm delivery');
        } finally {
            setConfirmingOrder(false);
        }
    };

    const handleSendMessage = async () => {
        const text = messageInput.trim();
        if (!orderitemNumber || !text) return;
        setSendingMessage(true);
        try {
            const newMsg = await productService.sendOrderItemMessage(orderitemNumber, text);
            setMessages((prev) => [...prev, newMsg]);
            setMessageInput('');
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err?.response?.data?.message?.[0] || 'Failed to send message');
        } finally {
            setSendingMessage(false);
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
            <div className="!p-0 bg-gray-50">
                <Head>
                    <title>Order Details</title>
                </Head>
                {isLoading ? (
                        <div className="flex items-center justify-center h-[470px] bg-white rounded-lg">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) :  !singleOrder ? (
                        <div className="flex flex-col items-center justify-center h-[470px] bg-white rounded-lg p-6">
                            <div className="mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Order Found</h3>
                            <p className="text-gray-500 text-center mb-4">
                                We couldn't find the order you're looking for.
                            </p>
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    )  :
                   (
                       <>
                           <header className="mb-6 bg-headerBg px-20 pt-4 h-[150px] flex flex-col">
                               <h1 className="text-3xl font-semibold text-white">Hello Steven</h1>
                               <p className="text-sm text-white font-medium mt-2 ">
                                   From your account dashboard, you can easily check & view your recent orders, <br/> manage your shipping and billing addresses and edit your password and account details.
                               </p>


                           </header>

                           <div className="min-h-screen px-6 py-4">
                               {/* Back Button */}
                               <button
                                   onClick={() => router.back()}
                                   className="mb-6 flex items-center text-primary container mx-auto"
                               >
                                   <svg
                                       xmlns="http://www.w3.org/2000/svg"
                                       className="h-5 w-5 mr-2"
                                       viewBox="0 0 20 20"
                                       fill="currentColor"
                                   >
                                       <path
                                           fillRule="evenodd"
                                           d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                           clipRule="evenodd"
                                       />
                                   </svg>
                                   Back to Orders
                               </button>

                               {/* Disputed notification only (no button) */}
                               {(singleOrder?.user_open_dispute || singleOrder?.dispute_id != null || (singleOrder as any)?.orderitem_status === 'cancelled') && (
                                   <div
                                       role="alert"
                                       className="container mx-auto mb-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-100 border border-red-300"
                                   >
                                       <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white" aria-hidden>
                                           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                           </svg>
                                       </span>
                                       <p className="text-sm font-semibold text-red-900">
                                           This item is disputed. Reply in the dispute thread below (max 10 messages).
                                       </p>
                                   </div>
                               )}

                               <div
                                   className="container mx-auto overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   <div className={'flex flex-col gap-4'}>

                                       {/* Order Header */}
                                       <div className="p-6 flex flex-col rounded-lg shadow bg-white border border-gray-100">
                                           <div className="flex justify-between items-start w-full">
                                               <div className={'w-full'}>
                                                   <h1 className="text-xl font-bold text-gray-800">Order Number: <span
                                                       className={'text-xs'}>{singleOrder?.orderitem_number}</span></h1>

                                                   <div className="flex items-center w-full">
                                                       <img
                                                           src={singleOrder?.image}
                                                           alt={singleOrder?.name}
                                                           width={'100%'}
                                                           height={'100px'}
                                                       />
                                                   </div>

                                                   <h2 className="text-sm font-semibold text-gray-700 mt-1">{singleOrder?.product?.name}</h2>
                                               </div>
                                               <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        orderLatestStatus?.status === 'received' ? 'bg-green-100 text-green-800' :
                                            orderLatestStatus?.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                                orderLatestStatus?.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                    }`}>
                                        {orderLatestStatus?.status === 'received' ? 'Received' :
                                            orderLatestStatus?.status === 'delivered' ? 'Delivered' :
                                                orderLatestStatus?.status === 'in-transit' ? 'In Transit' : 'Shipped'}
                                    </span>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Customer Information */}
                                       <div className="p-6 rounded-lg shadow flex flex-col bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
                                           <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                               <div>
                                                   <p className="text-sm text-gray-600">Name:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.user}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Shipping address:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.shipping_address?.address}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Contact Phone:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.orderitem_number}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Alternative Contact Phone:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.additional_info}</p>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Order Information */}
                                       <div className="p-6 rounded-lg shadow bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                                           <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                               <div>
                                                   <p className="text-sm text-gray-600">Quantity:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.qty}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Order Price:</p>
                                                   <p className="text-gray-800 font-medium">{formatCurrency(singleOrder?.order_price)}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Shipping Price:</p>
                                                   <p className="text-gray-800 font-medium">{formatCurrency(singleOrder?.shipping_price)}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Subtotal:</p>
                                                   <p className="text-gray-800 font-medium">{formatCurrency(singleOrder?.order_price_subtotal)}</p>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Payment Status */}
                                       <div className="p-6 rounded-lg shadow bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Status</h3>
                                           <div className="flex items-center">
                                               <div className={`w-3 h-3 rounded-full mr-2 ${
                                                   singleOrder?.payment_confirmed
                                                       ? 'bg-green-500'
                                                       : singleOrder?.isPaid
                                                           ? 'bg-yellow-500'
                                                           : 'bg-red-500'
                                               }`}></div>
                                               <p className="text-gray-700">
                                                   {getPaymentStatusMessage()}
                                               </p>
                                           </div>
                                           {singleOrder?.is_offline_payment && (
                                               <p className="mt-2 text-sm text-gray-500">
                                                   This is an offline payment
                                               </p>
                                           )}
                                       </div>

                                   </div>

                                   <div className={`flex flex-col gap-4`}>

                                       {/* Shipping Updates */}
                                       <div className="p-6 rounded-lg shadow bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-4">Tracking Information</h3>
                                           <div className="space-y-4">
                                               {singleOrder?.shipping_info?.flatMap(info => info?.shipping_status).map((update, index) => (
                                                   <div key={index} className="flex">
                                                       <div className="flex flex-col items-center mr-4">
                                                           <div className={`w-3 h-3 rounded-full ${
                                                               update?.status === 'delivered' ? 'bg-green-500' :
                                                                   update?.status === 'in-transit' ? 'bg-yellow-500' :
                                                                       'bg-purple-500'
                                                           }`}></div>
                                                           {index < singleOrder?.shipping_info?.length - 1 && (
                                                               <div className="w-px h-8 bg-gray-300 my-1"></div>
                                                           )}
                                                       </div>
                                                       <div>
                                                           <p className="text-sm text-gray-500">{update?.created_at}</p>
                                                           <p className="text-gray-700">{update?.note}</p>
                                                       </div>
                                                   </div>
                                               ))}
                                           </div>
                                       </div>

                                       {/* Shipping Information */}
                                       <div className="p-6 rounded-lg shadow bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Updates</h3>
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                               <div>
                                                   <p className="text-sm text-gray-600">Tracking Number:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.tracking_number}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Expected Date of Arrival:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.shipping_info?.[0]?.expected_date_of_arrival}</p>
                                               </div>
                                               <div>
                                                   <p className="text-sm text-gray-600">Logistic Company:</p>
                                                   <p className="text-gray-800 font-medium">{singleOrder?.shipping_info?.[0]?.logistics_company_name}</p>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Messages with merchant */}
                                       <div className="p-6 rounded-lg shadow bg-white border border-gray-100">
                                           <h3 className="text-lg font-semibold text-gray-800 mb-2">Messages</h3>
                                           <p className="text-sm text-gray-600 mb-4">
                                               {messagingClosed
                                                   ? 'Order is closed. Use dispute below if there is an issue.'
                                                   : 'Reply to the merchant here. They will get an email when you send a message.'}
                                           </p>
                                           <div className="min-h-[180px] max-h-[280px] overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                               {loadingMessages ? (
                                                   <p className="text-sm text-gray-500 text-center py-4">Loading messages...</p>
                                               ) : messages.length === 0 ? (
                                                   <p className="text-sm text-gray-500 text-center py-4">No messages yet. Send a message to start the conversation.</p>
                                               ) : (
                                                   messages.map((msg) => (
                                                       <div
                                                           key={msg.id}
                                                           className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                                                       >
                                                           <div
                                                               className={`max-w-[85%] rounded-xl px-4 py-2 ${
                                                                   msg.sender_type === 'customer'
                                                                       ? 'bg-primary text-white rounded-br-md'
                                                                       : 'bg-gray-200 text-gray-900 rounded-bl-md'
                                                               }`}
                                                           >
                                                               <p className="text-xs font-medium opacity-90 mb-0.5">
                                                                   {msg.sender_type === 'customer' ? 'You' : 'Merchant'}
                                                               </p>
                                                               <div
                                                                   className="text-sm whitespace-pre-wrap break-words"
                                                                   dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(msg.message || '') }}
                                                               />
                                                               <p className="text-xs opacity-75 mt-1">{formatMessageDate(msg.created_at)}</p>
                                                           </div>
                                                       </div>
                                                   ))
                                               )}
                                           </div>
                                           <div className="flex gap-2">
                                               <textarea
                                                   value={messageInput}
                                                   onChange={(e) => setMessageInput(e.target.value)}
                                                   onKeyDown={(e) => {
                                                       if (e.key === 'Enter' && !e.shiftKey) {
                                                           e.preventDefault();
                                                           handleSendMessage();
                                                       }
                                                   }}
                                                   placeholder={messagingClosed ? 'Messaging closed. Use dispute below if there is an issue.' : 'Type a message...'}
                                                   rows={2}
                                                   className="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                                                   disabled={sendingMessage || messagingClosed}
                                               />
                                               <button
                                                   type="button"
                                                   onClick={handleSendMessage}
                                                   disabled={sendingMessage || !messageInput.trim() || messagingClosed}
                                                   className="self-end px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                               >
                                                   {sendingMessage ? 'Sending…' : 'Send'}
                                               </button>
                                           </div>
                                       </div>
                                   </div>

                                   {/* Same box: Confirm delivery, OR Submit Dispute form, OR Dispute thread */}
                                   <div
                                       className={`p-6 rounded-lg shadow h-fit bg-white border border-gray-100 ${!hasDispute && !isFormActive ? 'opacity-50 pointer-events-none' : ''}`}>
                                       {isDeliveredAwaitingConfirmation && (
                                               <div className="px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 flex flex-wrap items-center justify-between gap-2 mb-4">
                                                   <p className="text-sm text-gray-700">
                                                       <span className="font-medium text-gray-800">Order delivered.</span> Please confirm you received it.
                                                   </p>
                                                   <button
                                                       type="button"
                                                       onClick={handleConfirmDelivery}
                                                       disabled={confirmingOrder}
                                                       className="shrink-0 px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                   >
                                                       {confirmingOrder ? 'Confirming…' : 'Confirm delivery'}
                                                   </button>
                                               </div>
                                           )}
                                           {!hasDispute && (
                                               <>
                                                   <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                       Submit Dispute
                                                       {!isFormActive ? (
                                                           <span className="ml-2 text-sm text-red-500">
                                                               (Available after order is received)
                                                           </span>
                                                       ) : singleOrder?.isDelivered ? (
                                                           <span className="ml-2 text-sm text-gray-600">
                                                               You can confirm delivery above or submit a dispute if there is an issue.
                                                           </span>
                                                       ) : null}
                                                   </h3>
                                                   <form onSubmit={handleSubmit(onSubmitDispute, (validationErrors) => {
                                                        const first = Object.keys(validationErrors)[0];
                                                        if (first === 'dispute_reason') toast.error('Please enter a dispute reason.');
                                                        else if (first) toast.error('Please check the form and try again.');
                                                    })} className="space-y-4">
                                                       <input type="hidden" {...register('orderitem_number')} />

                                                       <div>
                                                           <label className="block text-sm font-medium text-gray-700 mb-1">
                                                               Dispute Reason *
                                                           </label>
                                                           <Controller
                                                               name="dispute_reason"
                                                               control={control}
                                                               defaultValue=""
                                                               rules={{ required: 'Dispute reason is required', validate: (v) => !isRichTextEmpty(v) || 'Dispute reason is required' }}
                                                               render={({ field }) => (
                                                                   <TinyMCEEditor
                                                                       apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                                                                       value={field.value}
                                                                       onEditorChange={(content) => field.onChange(content ?? '')}
                                                                       init={{
                                                                           height: 220,
                                                                           menubar: false,
                                                                           plugins: 'lists link',
                                                                           toolbar: 'undo redo | formatselect | bold italic | bullist numlist | link',
                                                                           content_style: 'body { font-family: inherit; font-size: 14px; }',
                                                                       }}
                                                                       disabled={!isFormActive}
                                                                   />
                                                               )}
                                                           />
                                                           {errors?.dispute_reason && (
                                                               <p className="mt-1 text-sm text-red-600">{errors?.dispute_reason.message}</p>
                                                           )}
                                                       </div>

                                                       <div>
                                                           <label className="block text-sm font-medium text-gray-700 mb-1">
                                                               Proof Image (Optional)
                                                           </label>
                                                           <input
                                                               type="file"
                                                               accept="image/*"
                                                               onChange={(e) => {
                                                                   const file = e.target.files?.[0];
                                                                   if (file) setValue('proof_image', file, { shouldValidate: true });
                                                                   else setValue('proof_image', null);
                                                               }}
                                                               className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                               disabled={!isFormActive}
                                                           />
                                                           {errors?.proof_image && (
                                                               <p className="mt-1 text-sm text-red-600">{errors?.proof_image?.message}</p>
                                                           )}
                                                           <p className="mt-1 text-xs text-gray-500">Max 5MB (JPG, PNG, GIF)</p>
                                                       </div>

                                                       <div className="flex items-center">
                                                           <input
                                                               type="checkbox"
                                                               id="want_full_refund"
                                                               {...register('want_full_refund')}
                                                               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                               disabled={!isFormActive}
                                                           />
                                                           <label htmlFor="want_full_refund" className="ml-2 block text-sm text-gray-700">
                                                               I want a full refund
                                                           </label>
                                                       </div>

                                                       {isFormActive && (
                                                           <div className="flex justify-end space-x-3 pt-4">
                                                               <button
                                                                   type="button"
                                                                   onClick={() => reset()}
                                                                   className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                               >
                                                                   Reset
                                                               </button>
                                                               <button
                                                                   type="submit"
                                                                   disabled={isSubmitting}
                                                                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                               >
                                                                   {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                                                               </button>
                                                           </div>
                                                       )}
                                                   </form>
                                               </>
                                           )}
                                       {hasDispute && (
                                           <>
                                               {/* What the customer submitted: reason, proof, refund preference — before the thread */}
                                               {disputeDetails?.dispute && (
                                                   <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                                       <h3 className="text-base font-semibold text-gray-800 mb-3">Your dispute submission</h3>
                                                       <p className="text-sm text-gray-600 mb-1">What you submitted when you opened this dispute:</p>
                                                       <div className="mt-3 space-y-3">
                                                           {disputeDetails.dispute.dispute_reason && (
                                                               <div>
                                                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</span>
                                                                   <div className="text-sm break-words text-gray-900 mt-0.5 prose prose-sm max-w-none prose-p:my-0.5" dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(disputeDetails.dispute.dispute_reason) }} />
                                                               </div>
                                                           )}
                                                           <div>
                                                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Refund</span>
                                                               <p className="text-sm text-gray-900 mt-0.5">
                                                                   {disputeDetails.dispute.want_full_refund
                                                                       ? 'Full refund requested'
                                                                       : disputeDetails.dispute.want_partial_refund || disputeDetails.dispute.amount_requested
                                                                           ? `Partial refund${disputeDetails.dispute.amount_requested ? ` — ${disputeDetails.dispute.amount_requested}` : ''}`
                                                                           : 'No full refund requested'}
                                                               </p>
                                                           </div>
                                                           {(disputeDetails.dispute.proof_image || (disputeDetails.dispute.dispute_images?.length ?? 0) > 0) && (
                                                               <div>
                                                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proof</span>
                                                                   <div className="flex flex-wrap gap-2 mt-1">
                                                                       {disputeDetails.dispute.proof_image && (() => {
                                                                           const url = proofImageUrl(disputeDetails.dispute.proof_image);
                                                                           return url ? (
                                                                               <a key="proof" href={url} target="_blank" rel="noopener noreferrer" className="block">
                                                                                   <img src={url} alt="Proof" className="rounded border border-gray-200 max-h-24 object-cover" />
                                                                               </a>
                                                                           ) : null;
                                                                       })()}
                                                                       {disputeDetails.dispute.dispute_images?.map((di) => (
                                                                           <a key={di.id} href={di.image?.full_size || di.image?.thumbnail} target="_blank" rel="noopener noreferrer" className="block">
                                                                               <img src={di.image?.thumbnail || di.image?.full_size} alt="Proof" className="rounded border border-gray-200 max-h-24 object-cover" />
                                                                           </a>
                                                                       ))}
                                                                   </div>
                                                               </div>
                                                           )}
                                                           {disputeDetails.dispute.created_at && (
                                                               <p className="text-xs text-gray-500 mt-1">Submitted {formatMessageDate(disputeDetails.dispute.created_at)}</p>
                                                           )}
                                                       </div>
                                                   </div>
                                               )}

                                               <h3 className="text-lg font-semibold text-gray-800 mb-2">Dispute thread</h3>
                                               <p className="text-sm text-gray-600 mb-4">
                                                   Reply here (max 10 messages). The merchant is notified when you add a reply.
                                               </p>
                                               <div className="min-h-[180px] max-h-[360px] overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                                   {loadingDisputeComments ? (
                                                       <p className="text-sm text-gray-500 text-center py-4">Loading dispute thread…</p>
                                                   ) : (
                                                       <>
                                                           {disputeComments.map((c) => (
                                                               <div
                                                                   key={c.id}
                                                                   className={`flex ${c.by_customer ? 'justify-end' : 'justify-start'}`}
                                                               >
                                                                   <div
                                                                       className={`max-w-[85%] rounded-xl px-4 py-2 ${
                                                                           c.by_customer
                                                                               ? 'bg-primary text-white rounded-br-md'
                                                                               : 'bg-gray-200 text-gray-900 rounded-bl-md'
                                                                       }`}
                                                                   >
                                                                       <p className="text-xs font-medium opacity-90 mb-0.5">
                                                                           {c.by_customer ? 'You' : 'Merchant'}
                                                                       </p>
                                                                       <div
                                                                           className="text-sm break-words prose prose-sm max-w-none prose-p:my-0.5 prose-p:leading-snug"
                                                                           dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(c.comment || '') }}
                                                                       />
                                                                       {c.image?.thumbnail && (
                                                                           <a href={c.image?.full_size || c.image?.thumbnail} target="_blank" rel="noopener noreferrer" className="block mt-2">
                                                                               <img src={c.image.thumbnail} alt="Proof" className="rounded max-h-24 object-cover" />
                                                                           </a>
                                                                       )}
                                                                       {c.comment_images?.length ? (
                                                                           <div className="flex flex-wrap gap-1 mt-2">
                                                                               {c.comment_images.map((img) => (
                                                                                   <a key={img.id} href={img.image?.full_size} target="_blank" rel="noopener noreferrer">
                                                                                       <img src={img.image?.thumbnail || img.image?.full_size} alt="Proof" className="rounded max-h-20 object-cover" />
                                                                                   </a>
                                                                               ))}
                                                                           </div>
                                                                       ) : null}
                                                                       <p className="text-xs opacity-75 mt-1">{formatMessageDate(c.created_at)}</p>
                                                                   </div>
                                                               </div>
                                                           ))}
                                                       </>
                                                   )}
                                               </div>
                                               {!loadingDisputeComments && disputeComments.length >= 10 && (
                                                   <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                                                       Maximum of 10 messages reached. No further replies can be added.
                                                   </p>
                                               )}
                                               {!loadingDisputeComments && disputeComments.length < 10 && (
                                                   <div className="space-y-3">
                                                       <div className="rounded border border-gray-300 overflow-hidden">
                                                           <TinyMCEEditor
                                                               apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                                                               value={disputeReplyText}
                                                               onEditorChange={(content) => setDisputeReplyText(content ?? '')}
                                                               init={{
                                                                   height: 220,
                                                                   menubar: false,
                                                                   plugins: 'lists link',
                                                                   toolbar: 'undo redo | formatselect | bold italic | bullist numlist | link',
                                                                   content_style: 'body { font-family: inherit; font-size: 14px; }',
                                                               }}
                                                               disabled={sendingDisputeComment}
                                                           />
                                                       </div>
                                                       <div className="flex flex-wrap items-center gap-2">
                                                           <input
                                                               type="file"
                                                               accept="image/*"
                                                               multiple
                                                               onChange={(e) => setDisputeReplyFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                               className="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
                                                               disabled={sendingDisputeComment}
                                                           />
                                                           <button
                                                               type="button"
                                                               onClick={handleAddDisputeComment}
                                                               disabled={sendingDisputeComment || isRichTextEmpty(disputeReplyText)}
                                                               className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                           >
                                                               {sendingDisputeComment ? 'Sending…' : 'Send reply'}
                                                           </button>
                                                       </div>
                                                   </div>
                                               )}
                                           </>
                                       )}
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