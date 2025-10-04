// Image types
type ImageType = {
  thumbnail: string;
  thumbnail_100: string;
  full_size: string;
};

type FeaturedImage = {
  image: ImageType;
  image_url: string;
  image_ppoi: string;
};

// Merchant types
type MerchantBasic = {
  id: number;
  slug: string;
};

type MerchantFull = MerchantBasic & {
  store_name: string;
  support_phone_number: string;
  support_email: string;
};

// Product types
type ProductBasic = {
  id: number;
  slug: string;
};

type ProductFull = ProductBasic & {
  merchant: MerchantFull;
  name: string;
  is_digital: boolean;
  featured_image: FeaturedImage[];
  rating: string;
  numReviews: number;
  price: string;
  discount_price: string;
};

// Banner types
type Banner = {
  banner_image: string;
  mobile_banner_image: string;
  web_banner_image: string;
  id: number;
  product: ProductFull;
};

// Category types
type PopularCategory = {
  id: number;
  name: string;
  image: string;
  icon: string;
  icon_code: string;
  slug: string;
  search_vector: string;
};

// Advert banner types
type AdvertBanner = {
  id: number;
  product: ProductBasic;
  merchant: MerchantBasic;
  image: string;
  web_image: string;
  url: string | null;
  position: string;
  advertising_product: boolean;
  start_date: string;
  stop_date: string;
    web_banner_image: string;
    banner_image: string;
};

// Main home data type
interface HomeData {
  data: {
    banners: Banner[];
    popular_categories: PopularCategory[];
    recommended_products: ProductFull[];
    advert_banner: AdvertBanner[];
    advert_banner_middle: AdvertBanner[];
    hawola_specials: ProductFull[];
    top_rated_products: ProductFull[];
    top_selling_products: ProductFull[];
    best_selling_products: ProductFull[];
  };
}

export type {
  HomeData,
  Banner,
  PopularCategory,
  ProductFull,
  MerchantFull,
  FeaturedImage,
  AdvertBanner,
};
