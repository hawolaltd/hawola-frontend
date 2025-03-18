export interface Merchant  {
    id: number;
    store_name: string;
    slug: string;
    support_phone_number: string;
    support_email: string;
};

export interface Product  {
    id: number;
    merchant: Merchant;
    name: string;
    is_digital: boolean;
    featured_image: any[];
    rating: string;
    numReviews: number;
    price: string;
    discount_price: string;
    slug: string;
};

export interface ProductResponse  {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
};