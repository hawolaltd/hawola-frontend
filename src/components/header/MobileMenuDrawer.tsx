import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    ArrowTopRightOnSquareIcon,
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    PencilSquareIcon,
    TruckIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { HI_FRAME_HEADER, HI_FRAME_WELL, HI_FRAME_WELL_EMERALD, HI_MD, HI_SM } from '@/lib/hawolaIconTheme';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import { addToCartsLocal } from '@/redux/product/productSlice';
import { logout } from '@/redux/auth/authSlice';
// import CuratedPopularCategoriesDrawer from '@/components/category/CuratedPopularCategoriesDrawer';

interface DrawerLinkProps {
    href?: string;
    label: string;
    children?: DrawerLinkProps[];
}

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    messageCount?: number;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, messageCount: _messageCount = 3 }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, user, profile } = useAppSelector((state) => state.auth);

    const displayEmail = profile?.email || user?.email || '';

    // const toggleExpand = (label: string) => {
    //     setExpandedItems(prev => ({
    //         ...prev,
    //         [label]: !prev[label]
    //     }));
    // };

    // Top drawer links (Home, Shop, Vendors, …) — hidden; "Shop by categories" unchanged below.
    // const navigationLinks: DrawerLinkProps[] = [
    //     { href: '/', label: 'Home' },
    //     { href: '/shop', label: 'Shop' },
    //     {
    //         label: 'Vendors',
    //         children: [
    //             { href: '/vendors', label: 'All Vendors' },
    //             { href: '/vendors/listing', label: 'Vendors Listing' },
    //             { href: '/vendors/single', label: 'Vendor Single' }
    //         ]
    //     },
    //     {
    //         label: 'Pages',
    //         children: [
    //             { href: '/pages/about', label: 'About Us' },
    //             { href: '/pages/faq', label: 'FAQ' }
    //         ]
    //     },
    //     { href: '/blog', label: 'Blog' },
    //     { href: '/contact', label: 'Contact' }
    // ];

    const accountLinks: DrawerLinkProps[] = [
        { href: '/account', label: 'My Account' },
        { href: '/wishlist', label: 'My Wishlist' },
        { href: '/order/order-history', label: 'Order Tracking' },
        { href: '/account?tab=profile', label: 'Settings' },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 flex h-full w-80 flex-col bg-white z-50 shadow-xl overflow-x-hidden transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex shrink-0 items-center justify-between p-4">
                    <div className="flex items-center">
                        <img src="/hawola_Logo.png" alt="Logo" className="w-30 h-10" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={HI_FRAME_HEADER}
                        aria-label="Close menu"
                    >
                        <XMarkIcon className={HI_MD} aria-hidden />
                    </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {/* Account first — below logo */}
                    <div className="shrink-0 border-b border-gray-200 p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`${HI_FRAME_WELL} border-primary/25 bg-white`}>
                                <UserIcon className={`${HI_MD} text-primary`} aria-hidden />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-primary">
                                    {isAuthenticated && displayEmail
                                        ? displayEmail
                                        : 'Welcome to Hawola'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isAuthenticated
                                        ? 'Manage your account and orders'
                                        : 'Sign in to access your account'}
                                </p>
                            </div>
                        </div>
                        {!isAuthenticated && (
                            <Link
                                href={`/auth/login?redirect=${encodeURIComponent(router.asPath || "/")}`}
                                onClick={onClose}
                                className="text-xs font-semibold text-white bg-deepOrange px-3 py-1.5 rounded-md"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {isAuthenticated && (
                        <div className="shrink-0 space-y-3 border-b border-gray-200 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {accountLinks.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href || '#'}
                                        onClick={onClose}
                                        className="block px-3 py-2 text-sm font-semibold text-primary rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-center"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    dispatch(addToCartsLocal({ items: [] }));
                                    dispatch(logout());
                                    onClose();
                                }}
                                className="w-full mt-1 text-sm font-semibold text-white bg-deepOrange px-3 py-2 rounded-md"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="space-y-3 p-4">
                            {/* Cars & Real Estate — light tiles, navy / emerald text */}
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/cars"
                                    onClick={onClose}
                                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2 py-3 text-center text-xs font-semibold text-headerBg shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
                                >
                                    <TruckIcon className={`${HI_MD} text-primary`} aria-hidden />
                                    Cars
                                </Link>
                                <Link
                                    href="/real-estate"
                                    onClick={onClose}
                                    className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 px-2 py-3 text-center text-xs font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
                                >
                                    <BuildingOffice2Icon className={`${HI_MD} text-emerald-700`} aria-hidden />
                                    Real Estate
                                </Link>
                            </div>

                            <a
                                href="https://merchant.hawola.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-lg border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-3 py-3 shadow-sm transition hover:border-slate-300 hover:from-slate-100"
                            >
                                <span className={HI_FRAME_WELL}>
                                    <BuildingStorefrontIcon className={`${HI_MD} text-primary`} aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-primary">
                                    Create your own store
                                </span>
                                <ArrowTopRightOnSquareIcon className={`${HI_SM} text-slate-400`} aria-hidden />
                            </a>

                            <Link
                                href="/looking-for-product"
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-lg border border-secondaryTextColor/25 bg-gradient-to-br from-[#5BC694]/12 to-emerald-50/40 px-3 py-3 shadow-sm transition hover:border-secondaryTextColor/40 hover:from-[#5BC694]/18"
                            >
                                <span className={HI_FRAME_WELL_EMERALD}>
                                    <PencilSquareIcon className={`${HI_MD} text-emerald-800`} aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-emerald-950">
                                    Request for a product
                                </span>
                            </Link>

                            {/* Browse by aisle / curated categories — temporarily hidden
                            <CuratedPopularCategoriesDrawer onNavigate={onClose} />
                            */}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

// Helper component for drawer links (used when top nav map above is re-enabled).
const DrawerLink: React.FC<{
    item: DrawerLinkProps;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}> = ({ item, isExpanded, onToggleExpand }) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                {item.href ? (
                    <Link href={item.href} passHref>
                        <span className="block px-3 py-2 text-sm font-semibold text-primary  rounded-md hover:bg-gray-100 transition-colors duration-200 w-full">
                            {item.label}
                        </span>
                    </Link>
                ) : (
                    <button
                        onClick={onToggleExpand}
                        className="block px-3 py-2 text-sm  font-semibold text-primary rounded-md hover:bg-gray-100 transition-colors duration-200 w-full text-left"
                    >
                        {item.label}
                    </button>
                )}

                {hasChildren && (
                    <>
                    {!isExpanded ? <svg className={`w-5 h-5`} onClick={onToggleExpand} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="m17.9188 8.17969h-6.23-5.61003c-.96 0-1.44 1.16-.76 1.84001l5.18003 5.18c.83.83 2.18.83 3.01 0l1.97-1.97 3.21-3.21c.67-.68001.19-1.84001-.77-1.84001z"
                            fill="#8C9EC5"/>
                    </svg>
                    :
                        <button
                        onClick={onToggleExpand}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    >
                    <svg
                        className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#8C9EC5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                    </button>}
                    </>

                )}
            </div>

            {/* Dropdown children */}
            {hasChildren && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pl-4 space-y-1">
                        {item.children?.map((child) => (
                            <Link key={child.label} href={child.href || '#'} passHref>
                                <span className="block px-3 py-2 text-sm  font-semibold text-primary rounded-md hover:bg-gray-100 transition-colors duration-200">
                                    {child.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drawer;