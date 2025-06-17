interface OrderHistory {
    detail: OrderDetail[];
    page: number;
    number_of_pages: number;
}

interface OrderDetail {
    id: number;
    product: Product;
    shipping_address: null;
    shipping_info: ShippingInfo[];
    orderitem_variant: any[];
    createdAt: string;
    deliveredAt: string | null;
    name: string;
    qty: number;
    order_price: string;
    shipping_price: string;
    order_price_subtotal: string;
    orderitem_number: string;
    additional_info: null;
    isShipped: boolean;
    shippedAt: string | null;
    tracking_number: string | null;
    tracking_website: string | null;
    isPaid: boolean;
    payment_method: null;
    payment_reference: null;
    payment_confirmed: boolean;
    is_offline_payment: boolean;
    paidAt: string | null;
    isDelivered: boolean;
    user_confirm_order: boolean;
    user_open_dispute: boolean;
    image: string;
    is_reviewed: boolean;
    is_merchant_reviewed: boolean;
    order: number;
    user: number;
    shipping: null;
    merchant: number;
    variant: null;
    variant_value: null;
}

interface Product {
    id: number;
    merchant: Merchant;
    name: string;
    is_digital: boolean;
    featured_image: FeaturedImage[];
    rating: string;
    numReviews: number;
    price: string;
    discount_price: string;
    slug: string;
}

interface Merchant {
    id: number;
    store_name: string;
    slug: string;
    support_phone_number: string;
    support_email: string;
}

interface FeaturedImage {
    image: {
        thumbnail_100: string;
        thumbnail: string;
        full_size: string;
    };
    image_url: string;
    image_ppoi: string;
}

interface ShippingInfo {
    id: number;
    shipping_status: ShippingStatus[];
    created_at: string;
    updated_at: string;
    tracking_number: string;
    expected_date_of_arrival: null;
    logistics_company_name: string;
    tracking_url: null;
    additional_notes: null;
    user_confirm_delivery: boolean;
    unique: string;
    merchant: number;
    order_item: number;
}

interface ShippingStatus {
    id: number;
    created_at: string;
    updated_at: string;
    status: string;
    note: string;
    shipping: number;
}

interface NewOrderDetailsResponse {
    id: number;
    product: {
        id: number;
        merchant: {
            id: number;
            store_name: string;
            slug: string;
            support_phone_number: string;
            support_email: string;
        };
        name: string;
        is_digital: boolean;
        featured_image: {
            image: {
                thumbnail: string;
                thumbnail_100: string;
                full_size: string;
            };
            image_url: string;
            image_ppoi: string;
        }[];
        rating: string;
        numReviews: number;
        price: string;
        discount_price: string;
        slug: string;
    };
    shipping_address: null;
    shipping_info: {
        id: number;
        shipping_status: {
            id: number;
            created_at: string;
            updated_at: string;
            status: string;
            note: string;
            shipping: number;
        }[];
        created_at: string;
        updated_at: string;
        tracking_number: string;
        expected_date_of_arrival: null;
        logistics_company_name: string;
        tracking_url: null;
        additional_notes: null;
        user_confirm_delivery: boolean;
        unique: string;
        merchant: number;
        order_item: number;
    }[];
    orderitem_variant: any[]; // Could be more specific if structure is known
    createdAt: string;
    deliveredAt: null;
    name: string;
    qty: number;
    order_price: string;
    shipping_price: string;
    order_price_subtotal: string;
    orderitem_number: string;
    additional_info: null;
    isShipped: boolean;
    shippedAt: null;
    tracking_number: null;
    tracking_website: null;
    isPaid: boolean;
    payment_method: null;
    payment_reference: null;
    payment_confirmed: boolean;
    is_offline_payment: boolean;
    paidAt: null;
    isDelivered: boolean;
    user_confirm_order: boolean;
    user_open_dispute: boolean;
    image: string;
    is_reviewed: boolean;
    is_merchant_reviewed: boolean;
    order: number;
    user: number;
    shipping: null;
    merchant: number;
    variant: null;
    variant_value: null;
}