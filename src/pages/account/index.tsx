import {useCallback, useEffect, useState, type ComponentType, type SVGProps} from 'react';
import Head from 'next/head';
import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/AuthLayout";
import {getAddress, getOrderHistory, getWishList} from "@/redux/product/productSlice";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getUserProfile, logout, updateProfile} from "@/redux/auth/authSlice";
import Wishlist from "@/components/account/Wishlist";
import Orders from "@/components/account/Orders";
import BuyingRequests from "@/components/account/BuyingRequests";
import Settings from "@/components/account/Settings";
import NotificationSettings from "@/components/account/NotificationSettings";
import {getDisputes} from "@/redux/disputes/disputeSlice";
import RecentlyViewed from "@/components/account/RecentlyViewed";
import AccountChats from "@/components/account/AccountChats";
import {
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon,
    ClipboardDocumentListIcon,
    EyeIcon,
    HeartIcon,
    ShoppingBagIcon,
    UserIcon,
    BellAlertIcon,
} from "@heroicons/react/24/outline";
import {HI_SM} from "@/lib/hawolaIconTheme";
import { addToCartsLocal } from "@/redux/product/productSlice";
import AccountTelegramConnectPrompt from "@/components/account/AccountTelegramConnectPrompt";

/** Matches MainHeader / Footer content width */
const PAGE_WIDTH = "mx-auto w-full max-w-screen-xl px-6 xl:px-0";

const ACCOUNT_TAB_IDS = [
    "orders",
    "wish",
    "buying_requests",
    "chats",
    "profile",
    "notifications",
    "recently_viewed",
] as const;

export default function AccountPage() {
    const router = useRouter();
    const {profile: user} = useAppSelector(state => state.auth);
    const [loading, setLoading] = useState(false)

    const [tab, setTab] = useState<string>("orders");

    const tabs: { id: string; name: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
        { id: 'orders', name: 'Orders', Icon: ShoppingBagIcon },
        { id: 'wish', name: 'Wishlist', Icon: HeartIcon },
        { id: 'buying_requests', name: 'My Buying Requests', Icon: ClipboardDocumentListIcon },
        { id: 'chats', name: 'Chats', Icon: ChatBubbleLeftRightIcon },
        { id: 'profile', name: 'Profile', Icon: UserIcon },
        { id: 'notifications', name: 'Notifications', Icon: BellAlertIcon },
        { id: 'recently_viewed', name: 'Recently Viewed', Icon: EyeIcon },
    ]

    useEffect(() => {
        if (!router.isReady) return;
        const raw = router.query.tab;
        const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
        if (id && (ACCOUNT_TAB_IDS as readonly string[]).includes(id)) {
            setTab(id);
        }
    }, [router.isReady, router.query.tab]);

    const dispatch = useAppDispatch();


    const init = useCallback(async () => {
        try {
            setLoading(true)
            if(tab === "orders"){
                const res = await  dispatch(getOrderHistory())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }


            if(tab === "wish"){
                const res = await  dispatch(getWishList())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }



            if(tab === "dispute"){
                const res = await  dispatch(getDisputes("2"))
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }


            if(tab === "profile" || tab === "notifications"){
                const res = await  dispatch(getUserProfile())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }

        } catch (e) {
            console.log(e)
            setLoading(false)
        } finally {
            setLoading(false)
        }

    }, [dispatch, tab]);

    useEffect(() => {
        dispatch(getAddress());
        dispatch(getUserProfile());
    }, [dispatch]);


    useEffect(() => {
        init()
    }, [init]);

    const handleSignOut = () => {
        dispatch(addToCartsLocal({ items: [] }));
        dispatch(logout());
        router.push("/");
    };

    return (
        <AuthLayout>
            <div className="!p-0 bg-gray-50">
                <Head>
                    <title>My Account</title>
                </Head>

                <main className="p-0">
                    {/* Header */}
                    <header className="mb-4 sm:mb-6 bg-headerBg pt-4">
                        <div className={PAGE_WIDTH}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">Hello {user?.first_name}</h1>
                                <p className="text-xs sm:text-sm text-white font-medium mt-2">
                                    From your account dashboard, you can easily check & view your recent orders,
                                    <span className="hidden sm:inline"><br/></span>
                                    <span className="sm:hidden"> </span>
                                    manage your shipping and billing addresses and edit your password and account details.
                                </p>
                                <AccountTelegramConnectPrompt connected={!!user?.telegram_connected} />
                            </div>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-deepOrange px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                                Sign out
                            </button>
                        </div>
                        <nav
                            className={`mb-0 sm:mb-8 mt-4 sm:mt-6 flex gap-4 sm:gap-6 text-xs sm:text-sm text-textPadded border-b border-b-detailsBorder cursor-pointer overflow-x-auto whitespace-nowrap scrollbar-hide`}
                        >
                            {tabs.map((ta) => {
                                const TabIcon = ta.Icon;
                                return (
                                    <span
                                        key={ta.id}
                                        onClick={() => {
                                            setTab(ta.id);
                                            router.push(
                                                {
                                                    pathname: "/account",
                                                    query: { tab: ta.id },
                                                },
                                                undefined,
                                                { shallow: true }
                                            );
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 pb-2 font-semibold shrink-0 ${
                                            tab === ta.id ? "border-b-2 border-white text-white" : ""
                                        }`}
                                    >
                                        <TabIcon className={HI_SM} aria-hidden />
                                        {ta.name}
                                    </span>
                                );
                            })}
                        </nav>
                        </div>
                    </header>

                    {
                        loading ? (
                            <div className="flex items-center justify-center h-[270px] bg-white rounded-lg">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className={`${PAGE_WIDTH} mb-8 sm:mb-12 overflow-x-hidden`}>
                                {tab === 'wish' && <Wishlist />}
                                {tab === 'orders' && <Orders />}
                                {tab === 'buying_requests' && <BuyingRequests />}
                                {tab === 'chats' && <AccountChats />}
                                {tab === 'profile' && <Settings />}
                                {tab === 'notifications' && <NotificationSettings />}
                                {tab === 'recently_viewed' && <RecentlyViewed />}
                            </div>
                        )
                    }
                </main>
            </div>
        </AuthLayout>
    );
}