// Search Types
export interface SearchHistoryItem {
  id: number;
  query: string;
  results_count: number;
  searched_at: string;
  is_successful: boolean;
  clicked_result: boolean;
}

export interface PopularSearch {
  id: number;
  query: string;
  search_count: number;
  display_order: number;
  is_active: boolean;
  is_curated: boolean;
}

export interface SearchSuggestions {
  recent_searches: SearchHistoryItem[];
  popular_searches: PopularSearch[];
}

export interface ProductSearchResult {
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
  items: any[]; // Use Product type from product.d.ts
}

export interface MerchantSearchResult {
  count: number;
  items: any[]; // Use Merchant type
}

export interface CategorySearchResult {
  count: number;
  items: any[]; // Use Category type
}

export interface GeneralSearchResponse {
  query: string;
  search_history_id: number;
  total_results: number;
  total_merchants: number;
  total_promoted_products: number;
  total_categories: number;
  suggestions: string[];
  message: string;
  results: {
    products: ProductSearchResult;
    merchants: MerchantSearchResult;
    categories: CategorySearchResult;
    subcategories: CategorySearchResult;
    subsec_categories: CategorySearchResult;
  };
}

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  threshold?: number;
}

