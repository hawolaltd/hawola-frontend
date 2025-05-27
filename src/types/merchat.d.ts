interface MerchantReviewResponse {
    count: number
    next: number
    previous: number
    results:[]
}

interface MerchantDetailsResponse {
    merchant_details: {
        id: number;
        state: {
            id: number;
            name: string;
            date_added: string;
            country: number;
        };
        location: {
            id: number;
            name: string;
            state: number;
        };
        market: {
            name: string;
            help_text: string;
        };
        merchant_level: {
            id: number;
            name: string;
        };
        merchant_banner: {
            id: number;
            image: {
                medium_square_crop: string;
                thumbnail_100: string;
                thumbnail: string;
                full_size: string;
            };
            image_ppoi: string;
        }[];
        merchant_video_feed: any[];
        default_banner: {
            medium_square_crop: string;
            thumbnail_100: string;
            thumbnail: string;
            full_size: string;
        };
        store_name: string;
        store_page_title: string;
        store_page_subtitle: string;
        logo: string;
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
        facebook: string | null;
        twitter: string | null;
        instagram: string | null;
        tiktok: string | null;
        linkedin: string | null;
        youtube: string | null;
        date_added: string;
        is_active: boolean;
        slug: string;
        merchant_user: number;
    };
    home_page: Record<string, unknown>;
    banners: {
        id: number;
        image: {
            medium_square_crop: string;
            thumbnail_100: string;
            thumbnail: string;
            full_size: string;
        };
        image_ppoi: string;
    }[];
    recent_products: {
        id: number;
        name: string;
        is_digital: boolean;
        rating: string;
        numReviews: number;
        featured_image: {
            image: {
                thumbnail_100: string;
                thumbnail: string;
                full_size: string;
            };
            image_url: string;
            image_ppoi: string;
        }[];
        price: string;
        discount_price: string;
        slug: string;
    }[];
    merchant_categories: {
        id: number;
        name: string;
        image: string;
        icon: string;
        icon_code: string;
        slug: string | null;
        search_vector: string | null;
    }[];
    is_streaming_now: boolean;
}