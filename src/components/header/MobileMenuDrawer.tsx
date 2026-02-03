import React, { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import { addToCartsLocal } from '@/redux/product/productSlice';
import { logout } from '@/redux/auth/authSlice';

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

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, messageCount = 3 }) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const { categories } = useAppSelector((state) => state.products);
    const { isAuthenticated, user, profile } = useAppSelector((state) => state.auth);

    const displayEmail = profile?.email || user?.user?.email || '';

    const toggleExpand = (label: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const navigationLinks: DrawerLinkProps[] = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        {
            label: 'Vendors',
            children: [
                { href: '/vendors', label: 'All Vendors' },
                { href: '/vendors/listing', label: 'Vendors Listing' },
                { href: '/vendors/single', label: 'Vendor Single' }
            ]
        },
        {
            label: 'Pages',
            children: [
                { href: '/pages/about', label: 'About Us' },
                { href: '/pages/faq', label: 'FAQ' }
            ]
        },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' }
    ];

    const accountLinks: DrawerLinkProps[] = [
        { href: '/account', label: 'My Account' },
        { href: '/wishlist', label: 'My Wishlist' },
        { href: '/tracking', label: 'Order Tracking' },
        { href: '/settings', label: 'Settings' },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => {
                    setIsCategoryDrawerOpen(false);
                    onClose();
                }}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl overflow-x-hidden transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4">
                    {/* Logo */}
                    <div className="flex items-center ">
                        <img src="/assets/hawola.png" alt="Logo" className="w-30 h-10"/>
                    </div>
                    <svg onClick={onClose} width={'35'} height={'35'} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m0 0h24v24h-24z" fill="#fff" opacity="0" transform="matrix(-1 0 0 -1 24 24)"/><path d="m13.41 12 4.3-4.29a1 1 0 1 0 -1.42-1.42l-4.29 4.3-4.29-4.3a1 1 0 0 0 -1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z" fill="#8C9EC5"/></svg>
                </div>
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Navigation Links */}
                    <div className="p-4 space-y-2">
                        {navigationLinks.map((item) => (
                            <DrawerLink
                                key={item.label}
                                item={item}
                                isExpanded={expandedItems[item.label] || false}
                                onToggleExpand={() => toggleExpand(item.label)}
                            />
                        ))}

                        {/* Entry point for categories drawer */}
                        {categories?.categories && categories.categories.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsCategoryDrawerOpen(true)}
                                className="w-full mt-2 flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-primary bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <span>Shop by categories</span>
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* User Greeting + Account CTA (mirrors desktop account behavior) */}
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 border-2 border-[#17CE89] border-solid rounded-full flex items-center justify-center bg-white">
                                <img
                                    src="/assets/account.svg"
                                    alt="Account"
                                    className="w-5 h-5"
                                />
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
                                href="/auth/login"
                                onClick={onClose}
                                className="text-xs font-semibold text-white bg-deepOrange px-3 py-1.5 rounded-md"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Account Links (authenticated only, same items as desktop dropdown) */}
                    {isAuthenticated && (
                        <div className="p-4 border-b border-gray-200 space-y-3">
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
                </div>
            </div>

            {/* Categories side drawer layered on top */}
            {categories?.categories && (
                <CategoriesDrawer
                    isOpen={isCategoryDrawerOpen}
                    onClose={() => setIsCategoryDrawerOpen(false)}
                    categories={categories.categories}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    selectedSubCategoryId={selectedSubCategoryId}
                    setSelectedSubCategoryId={setSelectedSubCategoryId}
                />
            )}
        </>
    );
};

// Separate categories side drawer on top of main drawer
const CategoriesDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    categories: any[];
    selectedCategoryId: number | null;
    setSelectedCategoryId: (id: number | null) => void;
    selectedSubCategoryId: number | null;
    setSelectedSubCategoryId: (id: number | null) => void;
}> = ({
    isOpen,
    onClose,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedSubCategoryId,
    setSelectedSubCategoryId,
}) => {
    return (
        <div
            className={`fixed top-0 right-0 h-full w-80 bg-white z-[60] shadow-xl transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="h-full flex flex-col">
                {/* Header with back button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </button>
                    <h2 className="text-sm font-semibold text-primary">Categories</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body: 3-level categories list */}
                <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                    {categories
                        .filter(
                            (item, index, self) =>
                                item.name &&
                                self.findIndex((i: any) => i.name === item.name) === index
                        )
                        .map((category: any) => {
                            const isActiveCategory = selectedCategoryId === category.id;
                            const hasSubcategories =
                                category.subcategory && category.subcategory.length > 0;

                            return (
                                <div key={category.id} className="mb-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (hasSubcategories) {
                                                setSelectedCategoryId(
                                                    isActiveCategory ? null : category.id
                                                );
                                                setSelectedSubCategoryId(null);
                                            } else {
                                                onClose();
                                                window.location.href = `/categories?type=cat&slug=${category.slug}`;
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                            isActiveCategory
                                                ? 'bg-gray-100 text-deepOrange'
                                                : 'text-gray-800 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="truncate">{category.name}</span>
                                        {hasSubcategories && (
                                            <svg
                                                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                                    isActiveCategory ? 'rotate-90' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Second level: subcategories */}
                                    {isActiveCategory && hasSubcategories && (
                                        <div className="mt-1 ml-3 border-l border-gray-200 pl-2 space-y-1">
                                            {category.subcategory.map((subcat: any) => {
                                                const isActiveSub =
                                                    selectedSubCategoryId === subcat.id;
                                                const hasThirdLevel =
                                                    subcat.second_subcategory &&
                                                    subcat.second_subcategory.length > 0;

                                                return (
                                                    <div key={subcat.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (hasThirdLevel) {
                                                                    setSelectedSubCategoryId(
                                                                        isActiveSub
                                                                            ? null
                                                                            : subcat.id
                                                                    );
                                                                } else {
                                                                    onClose();
                                                                    window.location.href = `/categories?type=subcat&slug=${subcat.slug}`;
                                                                }
                                                            }}
                                                            className={`w-full flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                                                                isActiveSub
                                                                    ? 'bg-gray-100 text-deepOrange'
                                                                    : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            <span className="truncate">
                                                                {subcat.name}
                                                            </span>
                                                            {hasThirdLevel && (
                                                                <svg
                                                                    className={`w-3 h-3 text-gray-400 transform transition-transform ${
                                                                        isActiveSub
                                                                            ? 'rotate-90'
                                                                            : ''
                                                                    }`}
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M9 5l7 7-7 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </button>

                                                        {/* Third level: second_subcategory */}
                                                        {isActiveSub && hasThirdLevel && (
                                                            <div className="mt-1 ml-3 border-l border-gray-200 pl-2 space-y-1">
                                                                {subcat.second_subcategory.map(
                                                                    (secSubcat: any) => (
                                                                        <Link
                                                                            key={secSubcat.id}
                                                                            href={`/categories?type=secsubcat&slug=${secSubcat.slug}`}
                                                                            onClick={onClose}
                                                                            className="block rounded-md px-2 py-1 text-[10px] text-gray-700 hover:text-deepOrange hover:bg-gray-100 transition-colors"
                                                                        >
                                                                            {secSubcat.name}
                                                                        </Link>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

// Helper component for drawer links
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