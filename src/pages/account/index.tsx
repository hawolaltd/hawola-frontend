import {useCallback, useEffect, useState, type ComponentType, type SVGProps} from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
    TicketIcon,
    UserIcon,
    BellAlertIcon,
    CreditCardIcon,
    MapPinIcon,
    ScaleIcon,
    ShieldCheckIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import {HI_SM} from "@/lib/hawolaIconTheme";
import { addToCartsLocal } from "@/redux/product/productSlice";
import AccountTelegramConnectPrompt from "@/components/account/AccountTelegramConnectPrompt";
import AccountMerchantPromoSidebar, {
    readMerchantPromoDismissed,
} from "@/components/account/AccountMerchantPromoSidebar";
import AccountPlatformSwitchers from "@/components/account/AccountPlatformSwitchers";

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
    const [promoDismissed, setPromoDismissed] = useState(true);

    const [tab, setTab] = useState<string>("orders");
    const [menuQuery, setMenuQuery] = useState("");

    const tabs: {
        id: string;
        name: string;
        Icon: ComponentType<SVGProps<SVGSVGElement>>;
        externalHref?: string;
        keywords?: string;
        tabId?: string;
    }[] = [
        { id: 'orders', name: 'Orders', Icon: ShoppingBagIcon, keywords: 'receipts history purchases' },
        { id: 'wish', name: 'Wishlist', Icon: HeartIcon, keywords: 'saved favourites' },
        { id: 'buying_requests', name: 'My Buying Requests', Icon: ClipboardDocumentListIcon, keywords: 'looking for product' },
        { id: 'chats', name: 'Chats', Icon: ChatBubbleLeftRightIcon, keywords: 'messages inbox' },
        { id: 'profile', name: 'Profile', Icon: UserIcon, keywords: 'settings account password' },
        { id: 'notifications', name: 'Notifications', Icon: BellAlertIcon, keywords: 'telegram alerts email' },
        { id: 'coupons', name: 'Coupons', Icon: TicketIcon, externalHref: '/coupons', keywords: 'discount promo code' },
        { id: 'recently_viewed', name: 'Recently Viewed', Icon: EyeIcon, keywords: 'history browse' },
    ];

    const extraDestinations = [
        { id: 'pay_later', name: 'Pay later', Icon: CreditCardIcon, externalHref: '/order/pay-later', keywords: 'installment balance credit' },
        { id: 'order_history', name: 'Order history', Icon: ShoppingBagIcon, externalHref: '/order/order-history', keywords: 'tracking receipts' },
        { id: 'compare', name: 'Compare', Icon: ScaleIcon, externalHref: '/compare', keywords: 'products side by side' },
        { id: 'addresses', name: 'Addresses', Icon: MapPinIcon, tabId: 'profile', keywords: 'shipping billing' },
        { id: 'two_factor', name: 'Two-factor authentication', Icon: ShieldCheckIcon, tabId: 'profile', keywords: '2fa totp security authenticator' },
        { id: 'delete', name: 'Delete account', Icon: TrashIcon, externalHref: '/account/delete', keywords: 'remove close' },
    ];

    const destinationMatches = (item: { name: string; keywords?: string }, q: string) =>
        `${item.name} ${item.keywords || ""}`.toLowerCase().includes(q);

    const visibleTabs = (() => {
        const q = menuQuery.trim().toLowerCase();
        if (!q) return tabs;
        return [
            ...tabs.filter((ta) => destinationMatches(ta, q)),
            ...extraDestinations.filter((ta) => destinationMatches(ta, q)),
        ];
    })();

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
        setPromoDismissed(readMerchantPromoDismissed());
    }, [dispatch]);

    const showMerchantPromo = !user?.is_merchant && !promoDismissed;


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
                                    Stores may say hello in chat when you open a product. Turn that off in{" "}
                                    <Link href="/account?tab=notifications" className="underline">notification settings</Link>.
                                </p>
                                <AccountTelegramConnectPrompt connected={!!user?.telegram_connected} />
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                                <AccountPlatformSwitchers compact />
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-deepOrange px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                                    Sign out
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-6">
                            <label className="sr-only" htmlFor="account-menu-search">
                                Search menu
                            </label>
                            <div className="relative mb-3 w-full max-w-md">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70" aria-hidden>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="M20 20l-3.5-3.5" />
                                    </svg>
                                </span>
                                <input
                                    id="account-menu-search"
                                    type="search"
                                    value={menuQuery}
                                    onChange={(e) => setMenuQuery(e.target.value)}
                                    placeholder="Jump to orders, chats, 2FA…"
                                    autoComplete="off"
                                    className="w-full rounded-md border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-white/50 focus:bg-white/15"
                                />
                            </div>
                        <nav
                            className={`mb-0 sm:mb-8 flex gap-4 sm:gap-6 text-xs sm:text-sm text-textPadded border-b border-b-detailsBorder cursor-pointer overflow-x-auto whitespace-nowrap scrollbar-hide`}
                        >
                            {visibleTabs.length === 0 ? (
                                <span className="pb-2 text-white/80">No menu items match “{menuQuery.trim()}”.</span>
                            ) : null}
                            {visibleTabs.map((ta) => {
                                const TabIcon = ta.Icon;
                                const tabTarget = ta.tabId || ta.id;
                                if (ta.externalHref) {
                                    return (
                                        <Link
                                            key={ta.id}
                                            href={ta.externalHref}
                                            className="inline-flex items-center gap-1.5 sm:gap-2 pb-2 font-semibold shrink-0 text-white/90 hover:text-white"
                                            onClick={() => setMenuQuery("")}
                                        >
                                            <TabIcon className={HI_SM} aria-hidden />
                                            {ta.name}
                                        </Link>
                                    );
                                }
                                return (
                                    <span
                                        key={ta.id}
                                        onClick={() => {
                                            setTab(tabTarget);
                                            setMenuQuery("");
                                            router.push(
                                                {
                                                    pathname: "/account",
                                                    query: { tab: tabTarget },
                                                },
                                                undefined,
                                                { shallow: true }
                                            );
                                        }}
                                        className={`inline-flex items-center gap-1.5 sm:gap-2 pb-2 font-semibold shrink-0 ${
                                            tab === tabTarget ? "border-b-2 border-white text-white" : ""
                                        }`}
                                    >
                                        <TabIcon className={HI_SM} aria-hidden />
                                        {ta.name}
                                    </span>
                                );
                            })}
                        </nav>
                        </div>
                        </div>
                    </header>

                    {
                        loading ? (
                            <div className="flex items-center justify-center h-[270px] bg-white rounded-lg">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className={`${PAGE_WIDTH} mb-8 sm:mb-12 overflow-x-hidden`}>
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div
                                        className={`min-w-0 ${
                                            showMerchantPromo ? "lg:w-[70%]" : "w-full"
                                        }`}
                                    >
                                        {tab === 'wish' && <Wishlist />}
                                        {tab === 'orders' && <Orders />}
                                        {tab === 'buying_requests' && <BuyingRequests />}
                                        {tab === 'chats' && <AccountChats />}
                                        {tab === 'profile' && <Settings />}
                                        {tab === 'notifications' && <NotificationSettings />}
                                        {tab === 'recently_viewed' && <RecentlyViewed />}
                                    </div>
                                    {showMerchantPromo && (
                                        <div className="w-full lg:w-[30%]">
                                            <AccountMerchantPromoSidebar
                                                onDismissChange={() => setPromoDismissed(true)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }
                </main>
            </div>
        </AuthLayout>
    );
}