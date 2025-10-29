import axiosInstance from '@/libs/api/axiosInstance';
import { API } from '@/constant';
import { SearchParams } from '@/types/search';

// Get or create session ID for anonymous users
const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('hawola_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('hawola_session_id', sessionId);
    }
    return sessionId;
};

// General search across products, merchants, and categories
const generalSearch = async (params: SearchParams) => {
    const { query, page = 1, perPage = 20, threshold = 0.3 } = params;

    const response = await axiosInstance.get(API + 'search/general/', {
        params: {
            q: query,
            page,
            per_page: perPage,
            threshold,
            session_id: getSessionId(),
        },
    });

    return response.data;
};

// Get search history
const getSearchHistory = async (limit = 10) => {
    const response = await axiosInstance.get(API + 'search/history/', {
        params: {
            session_id: getSessionId(),
            limit,
        },
    });

    return response.data;
};

// Get search suggestions (recent + popular)
const getSearchSuggestions = async (limit = 5) => {
    const response = await axiosInstance.get(API + 'search/suggestions/', {
        params: {
            session_id: getSessionId(),
            limit,
        },
    });

    return response.data;
};

// Get popular searches
const getPopularSearches = async (days = 7, limit = 10) => {
    const response = await axiosInstance.get(API + 'search/popular/', {
        params: {
            days,
            limit,
        },
    });

    return response.data;
};

// Track search result click
const trackSearchClick = async (
    searchHistoryId: number,
    productId: number,
    position: number
) => {
    const response = await axiosInstance.post(API + 'search/track/click/', {
        search_history_id: searchHistoryId,
        product_id: productId,
        position: position,
    });

    return response.data;
};

// Clear search history
const clearSearchHistory = async () => {
    const response = await axiosInstance.delete(API + 'search/history/clear/', {
        params: {
            session_id: getSessionId(),
        },
    });

    return response.data;
};

const searchService = {
    generalSearch,
    getSearchHistory,
    getSearchSuggestions,
    getPopularSearches,
    trackSearchClick,
    clearSearchHistory,
};

export default searchService;
