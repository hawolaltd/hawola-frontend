import React, {useEffect, useState} from 'react';
import Image from "next/image";
import Link from "next/link";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import CartModal from "@/components/shared/CartModal";
import {useRouter} from "next/router";
import {CartResponse} from "@/types/product";
import UserInfoDropdown from "@/components/shared/UserInfoDropdown";

const Header = ({isScrolled}: { isScrolled?: any }) => {
    const [userInfo, setUserInfo] = useState(false)
    const [cart, setCart] = useState(false)
    const [items, setItems] = useState([])
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const {carts, localCart, wishLists} = useAppSelector(state => state.products)

    const [userCart, setUserCart] = useState<CartResponse>(carts)

    const {isAuthenticated} = useAppSelector(state => state.auth)

    const toggleDropdown = (menu: string) => {
        setDropdownOpen(dropdownOpen === menu ? null : menu);
    };

    const router = useRouter()

    const dispatch = useAppDispatch()

    useEffect(() => {
        const getCartCount = () => {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') as string)
            setItems(cartItems)
        };
        getCartCount();
        window.addEventListener("storage", getCartCount);

        return () => window.removeEventListener("storage", getCartCount);

    }, []);

    return (
        <div className={'relative '}>

            {/* Top Component Start*/}
            <div className="bg-white">
                <div className="max-w-screen-xl mx-auto relative px-6 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-8">

                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <img src="/assets/hawola.png" alt="Logo" className="w-50 h-10"/>
                        </div>

                        <div className="hidden lg:flex items-center gap-4 text-primary">
                            {/* Categories Dropdown and Search Bar */}
                            <div className="flex items-center space-x-4 border rounded-md">
                                {/*<select className="p-2 text-primary text-sm">*/}
                                {/*    <option>All categories</option>*/}
                                {/*</select>*/}
                                <div
                                    // onMouseEnter={() => setDropdownOpen('category')}
                                    // onMouseLeave={() => setDropdownOpen(null)}
                                    className="relative text-primary text-[14px] pl-4 ">
                                    <button
                                        onClick={() => toggleDropdown('category')}
                                        className="flex items-center gap-1"
                                    >
                                        All categories

                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <g clip-path="url(#clip0_1_95)">
                                                <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                      stroke-width="2"
                                                      stroke-linecap="round" stroke-linejoin="round"/>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_1_95">
                                                    <rect width="11" height="10" fill="white"
                                                          transform="translate(0.669922 0.470001)"/>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </button>
                                    {dropdownOpen === 'category' && (
                                        <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">All
                                                categories</Link>
                                            </li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Computer
                                                Accessories</Link>
                                            </li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Cell
                                                Phones</Link>
                                            </li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Gaming
                                                Gatgets</Link></li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Smart
                                                Watches</Link>
                                            </li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Login</Link>
                                            </li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Wired
                                                Headphone</Link></li>
                                            <li><Link href="#"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">Mouse
                                                Keyboard</Link></li>
                                        </ul>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for items"
                                    className="p-2 rounded-md w-64 text-sm text-primary"
                                />
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden xl:block space-x-8 text-sm">
                                <a href="#" className="text-primary hover:text-deepOrange text-[16px]">Flash
                                    Deals</a>
                                <a href="#" className="text-primary hover:text-deepOrange text-[16px]">Special</a>
                                <a href="#" className="text-primary hover:text-deepOrange text-[16px]">Top
                                    Sellers</a>
                            </div>
                        </div>
                    </div>

                    {/* Icons (User, Wishlist, Cart, Settings) */}
                    <div className="flex relative space-x-6 items-center">
                        <div className="relative">
                            <div onClick={() => {
                                setUserInfo(!userInfo)
                            }} className="cursor-pointer">
                                <img src="/assets/account.svg" alt="User" className="w-6 h-6"/>
                            </div>
                            {userInfo && (
                                <UserInfoDropdown/>
                            )}
                        </div>

                        {/* Wishlist */}
                        <Link href={isAuthenticated ? `/wishlist` : `/auth/login`}>
                            <div onClick={() => {
                                // if (isAuthenticated) {
                                //     router.push('/wishlist')
                                // } else {
                                //     router.push('/auth/login')
                                // }
                            }} className="relative cursor-pointer">
                                <span
                                    className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishLists?.length ?? 0}</span>
                                <img src="/assets/love2.svg" alt="Wishlist" className="w-6 h-6"/>
                            </div>
                        </Link>

                        {/* Cart */}
                        <div onClick={() => {
                            if (isAuthenticated) {
                                setCart(!cart)
                            } else {
                                // router.push('/auth/login')
                                setCart(!cart)
                            }

                        }} className="relative cursor-pointer">
                            <span
                                className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{!isAuthenticated && localCart !== null ? localCart?.items?.length ?? 0 : carts?.cart_count ?? 0}</span>
                            <img src="/assets/cart2.svg" alt="Cart" className="w-6 h-6"/>
                        </div>

                        {/* Compare */}
                        <div className="relative flex items-center gap-2 text-primary text-[16px]">
                            <img src="/assets/compare.svg" alt="compare" className="w-6 h-6"/> Compare
                        </div>

                    </div>
                    {
                        cart && <CartModal/>
                    }
                </div>
            </div>


            {/* Top Component End */}

            {/* Bottom Component Start*/}
            <div className={`bg-white border ${isScrolled ? 'hidden' : 'block'}`}>
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div className="max-w-screen-xl flex items-center gap-8">

                        {/* Shop By Categories Dropdown */}
                        <div className="flex items-center space-x-2">
                            <button
                                className="bg-deepOrange text-white py-2 px-4 rounded-md flex items-center space-x-2">
                                <span>Shop By Categories</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <ul className="hidden xl:flex space-x-8 text-sm">

                            <li onMouseEnter={() => setDropdownOpen('home')}
                                onMouseLeave={() => setDropdownOpen(null)}
                                className="relative text-primary text-[14px] hover:text-deepOrange">
                                <button
                                    onClick={() => toggleDropdown('home')}
                                    className="flex items-center gap-1"
                                >
                                    Home
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1_95)">
                                            <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                  stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_95">
                                                <rect width="11" height="10" fill="white"
                                                      transform="translate(0.669922 0.470001)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>
                                {dropdownOpen === 'home' && (
                                    <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">About
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Contact
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Careers</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Terms
                                            and
                                            Conditions</Link></li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Register</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Login</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Error
                                            404</Link></li>
                                    </ul>
                                )}
                            </li>
                            <li onMouseEnter={() => setDropdownOpen('shop')}
                                onMouseLeave={() => setDropdownOpen(null)}
                                className="relative text-primary text-[14px] hover:text-deepOrange">
                                <button
                                    onClick={() => toggleDropdown('shop')}
                                    className="flex items-center gap-1"
                                >
                                    Shop
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1_95)">
                                            <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                  stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_95">
                                                <rect width="11" height="10" fill="white"
                                                      transform="translate(0.669922 0.470001)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>

                                {dropdownOpen === 'shop' && (
                                    <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">About
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Contact
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Careers</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Terms
                                            and
                                            Conditions</Link></li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Register</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Login</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Error
                                            404</Link></li>
                                    </ul>
                                )}
                            </li>
                            <li onMouseEnter={() => setDropdownOpen('vendor')}
                                onMouseLeave={() => setDropdownOpen(null)}
                                className="relative text-primary text-[14px] hover:text-deepOrange">
                                <button
                                    onClick={() => toggleDropdown('vendor')}
                                    className="flex items-center gap-1"
                                >
                                    Vendors
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1_95)">
                                            <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                  stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_95">
                                                <rect width="11" height="10" fill="white"
                                                      transform="translate(0.669922 0.470001)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>

                                {dropdownOpen === 'vendor' && (
                                    <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Vendors
                                            Listing</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Vendors
                                            Single</Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li onMouseEnter={() => setDropdownOpen('pages')}
                                onMouseLeave={() => setDropdownOpen(null)}
                                className="relative text-primary text-[14px] hover:text-deepOrange">
                                <button
                                    onClick={() => toggleDropdown('pages')}
                                    className="flex items-center gap-1"
                                >
                                    Pages
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1_95)">
                                            <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                  stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_95">
                                                <rect width="11" height="10" fill="white"
                                                      transform="translate(0.669922 0.470001)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>
                                {dropdownOpen === 'pages' && (
                                    <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">About
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Contact
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Careers</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Terms
                                            and
                                            Conditions</Link></li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Register</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Login</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Error
                                            404</Link></li>
                                    </ul>
                                )}
                            </li>


                            <li onMouseEnter={() => setDropdownOpen('blog')}
                                onMouseLeave={() => setDropdownOpen(null)}
                                className="relative text-primary text-[14px] hover:text-deepOrange">
                                <button
                                    onClick={() => toggleDropdown('blog')}
                                    className="flex items-center gap-1"
                                >
                                    Blog
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1_95)">
                                            <path d="M10.1699 4.97L6.66992 8.47L3.16992 4.97" stroke="#9EB4E0"
                                                  stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_95">
                                                <rect width="11" height="10" fill="white"
                                                      transform="translate(0.669922 0.470001)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>
                                {dropdownOpen === 'blog' && (
                                    <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">About
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Contact
                                            Us</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Careers</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Terms
                                            and
                                            Conditions</Link></li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Register</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Login</Link>
                                        </li>
                                        <li><Link href="#"
                                                  className="block text-primary px-4 py-2 hover:text-deepOrange">Error
                                            404</Link></li>
                                    </ul>
                                )}
                            </li>


                            <Link href={'#'}>
                                <li className="text-primary text-[14px] hover:text-deepOrange">Contact Us</li>
                            </Link>
                        </ul>

                    </div>

                    {/* Special Offer Badge */}
                    <div className="flex items-center space-x-2">
                        <Image src={'/assets/award.svg'} alt={'award'} width={50} height={50}/>
                        <span className="text-headerBg font-semibold ">
                                SPECIAL<br/> OFFER
                            </span>
                    </div>
                </div>
            </div>

            {/* Bottom Component End*/}
        </div>

    );
}

export default Header;
