
export interface MerchantLocation {
    name: string;
}

export interface MerchantState  {
    name: string;
}

export interface Merchant  {
    id: number;
    state: MerchantState;
    location: MerchantLocation;
    market: Market;
    merchant_level: MerchantLevel;
    store_name: string;
    store_page_title: string;
    store_page_subtitle: string;
    logo: string;
    default_banner: string;
    image_ppoi: string;
    primary_color: string;
    refund_policy: string;
    about_title: string;
    about: string;
    store_address: string;
    shipping_number_of_days: number;
    support_phone_number: string;
    support_email: string;
    is_allowed_to_stream: boolean;
    facebook: string;
    twitter: string;
    instagram: string;
    tiktok: string;
    linkedin: string | null;
    youtube: string | null;
    date_added: string;
    is_active: boolean;
    slug: string;
    merchant_user: number;
}


export interface FeaturedImage  {
    image: Image;
    image_url: string;
    image_ppoi: string;
}

export interface Product  {
    id: number;
    user: string;
    second_subcategory: string;
    category: Category;
    product_subcategory: SubCategory;
    product_subseccategory: SubCategory;
    merchant: Merchant;
    featured_image: FeaturedImage[];
    shipping_cost_outside: ShippingCost;
    shipping_cost_within: ShippingCost;
    shipping_cost_outside_state: ShippingCost;
    shipping_cost_outside_country: ShippingCost[];
    name: string;
    is_digital: boolean;
    image: string | null;
    product_video_provider: string | null;
    product_video: string | null;
    brand: string;
    description: string;
    rating: string;
    numReviews: number;
    price: string;
    discount_price: string;
    ship_outside_country: boolean;
    ship_outside_vicinity: boolean;
    ship_outside_state: boolean;
    accept_payment_on_delivery: boolean;
    countInStock: number;
    sku: string | null;
    hide_product: boolean;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    is_promoted: boolean;
    is_odinwo_special: boolean;
    slug: string;
    search_vector: string | null;
    product_variant: any[];
}

export interface ProductResponse  {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}


// Product by Id

export interface Currency  {
    id: number;
    name: string;
    symbol: string;
    short_name: string;
    is_default_currency: boolean;
    date_added: string;
}

export interface Country  {
    id: number;
    currency: Currency;
    name: string;
    is_default_country: boolean;
    date_added: string;
}

export interface State {
    name: string;
}

export interface ShippingCost  {
    id: number;
    country: Country;
    state: State;
    shipping_plan_name: string;
    shipping_cost: string;
    additional_note: string;
}

export interface Category {
    id: number;
    name: string;
    image: string;
    icon: string;
    icon_code: string;
    slug: string | null;
    search_vector: string | null;
}

export interface SubCategory {
    id: number;
    name: string;
    image: CategoryImage;
    slug: string;
    second_subcategory: SecondSubCategory[];
}
export interface MerchantLevel {
    name: string;
}

export interface Market {
    name: string;
    help_text: string;
}

export interface Image {
    thumbnail_100: string;
    full_size: string;
    thumbnail: string;
}

export interface ProductImage  {
    id: number;
    image: Image;
    image_url: string;
    image_ppoi: string;
    alt_text: string | null;
    is_feature: boolean;
    product: number;
}

export interface ReImage  {
    id: number;
    thumbnail: string;
    original: string;
    image_url: string;
    image_ppoi: string;
    alt_text: string | null;
}

export interface MerchantOtherProduct  {
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
    featured_image: FeaturedImage[];
    rating: string;
    numReviews: number;
    price: string;
    discount_price: string;
    slug: string;
}


export interface ProductByIdResponse  {
    product: Product;
    product_images: ProductImage[];
    product_variant: any[];
    re_images: ReImage[];
    is_wished: boolean;
    reviews_ratings: any[];
    merchant_other_products: MerchantOtherProduct[];
}


// Categories

export interface CategoryImage  {
    [key: string]: unknown;
}

export interface SecondSubCategory  {
    id: number;
    name: string;
    image: CategoryImage;
    slug: string;
    second_category_banner_images: unknown[];
}



export interface ProductCategory  {
    id: number;
    name: string;
    image: string;
    slug: string | null;
    icon: string;
    subcategory: SubCategory[];
    category_banner_images: unknown[];
}

export interface ProductCategoriesResponse  {
    categories: ProductCategory[];
}

export interface CartProduct  {
    id: number;
    merchant: Merchant;
    name: string;
    is_digital: boolean;
    featured_image: FeaturedImage[];
    rating: string;
    numReviews: number;
    price: number;
    discount_price: string;
    ship_outside_vicinity: boolean;
    ship_outside_state: boolean;
    shipping_cost_outside: number;
    shipping_cost_within: number;
    shipping_cost_outside_state: number;
    accept_payment_on_delivery: boolean;
    countInStock: number;
    slug: string;
}

export interface CartItem  {
    id: number;
    product: CartProduct;
    cart_variant: any[];
    qty: number;
    date_added: string;
    updated_at: string;
    user: number;
}

export interface CartVariant {
    variant: number;
    variant_value: number;
}

export interface LocalCartItem {
    qty: number;
    product: Product;
    variant?: CartVariant[];
}

export interface LocalCart {
    items: LocalCartItem[];
}

export interface AddToCartItem {
    qty: number;
    product: number;
    variant?: CartVariant[];
}

export interface AddToCartType {
    items: AddToCartItem[];
}

export interface CartResponse {
    cart_count: number;
    cart_items: CartItem[];
}

export interface AddressData {
    id: number;
    state: {
        name: string;
    },
    city: {
        name: string;
    },
    first_name: string;
    last_name: string;
    address: string;
    postalCode: null;
    phone: string;
    phone2: string;
    user: number;
    country: string;
}

export interface AddressResponse {
    addresses: AddressData[]
}

export interface OrderDetailsResponse {
    id: number;
    orderItems: Array<{
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
            featured_image: Array<{
                image: {
                    thumbnail_100: string;
                    full_size: string;
                    thumbnail: string;
                };
                image_url: string;
                image_ppoi: string;
            }>;
            rating: string;
            numReviews: number;
            price: string;
            discount_price: string;
            slug: string;
        };
        shipping_address: null | any;
        shipping_info: Array<{
            id: number;
            shipping_status: Array<{
                id: number;
                created_at: string;
                updated_at: string;
                status: string;
                note: string;
                shipping: number;
            }>;
            created_at: string;
            updated_at: string;
            tracking_number: string;
            expected_date_of_arrival: null | string;
            logistics_company_name: string;
            tracking_url: null | string;
            additional_notes: null | string;
            user_confirm_delivery: boolean;
            unique: string;
            merchant: number;
            order_item: number;
        }>;
        orderitem_variant: any[];
        createdAt: string;
        deliveredAt: null | string;
        name: string;
        qty: number;
        order_price: string;
        shipping_price: string;
        order_price_subtotal: string;
        orderitem_number: string;
        additional_info: null | any;
        isShipped: boolean;
        shippedAt: null | string;
        tracking_number: null | string;
        tracking_website: null | string;
        isPaid: boolean;
        payment_method: null | string;
        payment_reference: null | string;
        payment_confirmed: boolean;
        is_offline_payment: boolean;
        paidAt: null | string;
        isDelivered: boolean;
        user_confirm_order: boolean;
        user_open_dispute: boolean;
        image: string;
        is_reviewed: boolean;
        is_merchant_reviewed: boolean;
        order: number;
        user: number;
        shipping: null | any;
        merchant: number;
        variant: null | any;
        variant_value: null | any;
    }>;
    shipping_address: {
        id: number;
        state: {
            name: string;
        };
        city: {
            name: string;
        };
        first_name: string;
        last_name: string;
        address: string;
        postalCode: null | string;
        phone: string;
        phone2: string;
        user: number;
        country: null | any;
    };
    user: {
        id: number;
        _id: number;
    };
    taxPrice: null | string;
    shippingPrice: string;
    totalPrice: string;
    paidAmount: null | string;
    isPaid: boolean;
    paymentMethod: null | string;
    payment_reference: null | string;
    payment_confirmed: boolean;
    is_offline_payment: boolean;
    paidAt: null | string;
    isDelivered: boolean;
    deliveredAt: null | string;
    createdAt: string;
    order_number: string;
    dump_data: null | any;
}

export interface LocalCartType {
    items: {
        qty: number;
        product: number;
    }

}


export interface addWishListType{
    items: number;
}

export interface deleteWishListType{
    items: number;
}