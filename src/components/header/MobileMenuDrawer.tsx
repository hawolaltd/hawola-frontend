import React, {useState} from 'react';
import Link from 'next/link';

interface DrawerLinkProps {
    href?: string;
    label: string;
    children?: DrawerLinkProps[];
}

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    messageCount?: number;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, userName = 'Steven', messageCount = 3 }) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

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
        { href: '/settings', label: 'Setting' },
        { href: '/logout', label: 'Sign Out' }
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
                <div className="h-full flex flex-col overflow-y-auto">
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
                    </div>

                    {/* User Greeting */}
                    <div className="p-4 border-t border-gray-200 flex items-center gap-2">
                        <img className="w-10 h-10 border-2 border-[#17CE89] border-solid rounded-full object-cover"
                             src="/assets/author-3.png"
                             alt="user avatar"/>
                        <div>
                            <p className="text-sm font-semibold text-primary "> Hello {userName} !</p>
                            <p className="text-xs text-gray-500 mt-1">
                                You have {messageCount} new {messageCount === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                    </div>

                    {/* Account Links */}
                    <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-200">
                        {accountLinks.map((item) => (
                            <DrawerLink
                                key={item.label}
                                item={item}
                            />
                        ))}
                    </div>

                    <div className={'mt-4 w-full p-4 flex flex-col gap-2'}>
                        <img className={'w-full'} src={'/imgs/page/homepage4/promotion6.png'} alt={'banner'} />
                        <p className="mt-6 text-sm text-primary">&copy; 2025 Hawola. All rights reserved.</p>

                    </div>
                </div>
            </div>
        </>
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