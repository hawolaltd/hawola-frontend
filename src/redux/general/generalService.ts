import axiosInstance from '@/libs/api/axiosInstance';
import { API } from '@/constant';
import { STOREFRONT_PREVIEW_LS_KEY } from '@/lib/storefrontPreview';

const API_URL = 'authy';

// get Home Page
const getHomePage = async () => {
    let items: number[] = [];
    if (typeof window !== "undefined") {
        try {
            const raw = localStorage.getItem("homePersonalizationSubsecIds");
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
                items = parsed
                    .map((v) => Number(v))
                    .filter((v) => Number.isInteger(v) && v > 0)
                    .slice(0, 20);
            }
        } catch {
            items = [];
        }
    }

    const response = await axiosInstance.post(API + 'home/', { items });
    console.log('getHomePage:', response.data);
    // Wrap response in data object to match HomeData type structure
    return { data: response.data };
};

const getDealsTodayPage = async () => {
    const response = await axiosInstance.post(API + 'home/deals-today/', {});
    return { data: response.data };
};

const getRecommendedTodayPage = async () => {
    let items: number[] = [];
    if (typeof window !== "undefined") {
        try {
            const raw = localStorage.getItem("homePersonalizationSubsecIds");
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
                items = parsed
                    .map((v) => Number(v))
                    .filter((v) => Number.isInteger(v) && v > 0)
                    .slice(0, 20);
            }
        } catch {
            items = [];
        }
    }
    const response = await axiosInstance.post(API + 'home/recommended-today/', { items });
    return { data: response.data };
};

// home insight

const getHomeInsight = async () => {
    const response = await axiosInstance.get(API + 'home/insight/');
    console.log('getHomeInsights:', response.data);
    // Wrap response in data object to match HomeData type structure
    return { data: response.data };
};

// get All States
const getAllStates = async () => {
    const response = await axiosInstance.get(API + 'location/all/states/');
    console.log('getAllStates response:', response.data);
    
    // If response.data is already an array, wrap it in { data: [...] }
    // If it's already { data: [...] }, return as is
    if (Array.isArray(response.data)) {
        return { data: response.data };
    }
    
    return response.data;
};

// get State Location
const getStateLocations = async (id: string) => {
    const response = await axiosInstance.get(API + `location/${id}/`);

    console.log('getStateLocations response:', response.data);
    
    // If response.data is already an array, wrap it in { data: [...] }
    // If it's already { data: [...] }, return as is
    if (Array.isArray(response.data)) {
        return { data: response.data };
    }
    
    return response.data;
};

// Public site settings (e.g. site_under_construction, date_time_till)
const getSiteSettings = async () => {
    let path = API + "site/settings/";
    if (typeof window !== "undefined") {
        const pt = localStorage.getItem(STOREFRONT_PREVIEW_LS_KEY);
        if (pt) {
            const sep = path.includes("?") ? "&" : "?";
            path += `${sep}preview_token=${encodeURIComponent(pt)}`;
        }
    }
    const response = await axiosInstance.get(path);
    return response.data;
};

const generalService = {
    getAllStates,
    getStateLocations,
    getHomePage,
    getDealsTodayPage,
    getRecommendedTodayPage,
    getHomeInsight,
    getSiteSettings,
};

export default generalService;
