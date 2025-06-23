import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {useRouter} from "next/router";
import CartModal from "@/components/shared/CartModal";
import {CartResponse} from "@/types/product";
import {logout} from "@/redux/auth/authSlice";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {addToCartsLocal} from "@/redux/product/productSlice";
import UserInfoDropdown from "@/components/shared/UserInfoDropdown";
import {setDrawerOpen} from "@/redux/ui/uiSlice";
import Drawer from "@/components/header/MobileMenuDrawer";

function MainHeader() {
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const isDrawerOpen = useAppSelector(state => state.ui.isDrawerOpen);
    const [cart, setCart] = useState(false)

    const {carts, localCart, wishLists, categories} = useAppSelector(state => state.products)
    console.log('localCartAuth:', localCart)
    const [userCart, setUserCart] = useState<CartResponse>(carts)

    const { isAuthenticated } = useAppSelector(state => state.auth)

    const [userInfo, setUserInfo] = useState(false)
    const [items, setItems] = useState([])

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


    return (<div>
        <Drawer
            isOpen={isDrawerOpen}
            onClose={() => dispatch(setDrawerOpen(false))}
            userName="Steven"
            messageCount={3}
        />
            <div className="bg-white border-b border-b-[#D5DFE4] relative pr-4">
                <div className="max-w-screen-md lg:max-w-screen-lg xl:max-w-[1320px] mx-auto px-4 md:px-0 py-4 flex items-center justify-between">

                    <div className="flex  justify-center items-center gap-3">

                        {/* Logo */}
                        <Link href={'/'}>
                            <div className="flex items-center ">
                                <img src="/assets/hawola.png" alt="Logo" className="w-30 h-8"/>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-4 text-primary">
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
                                        <ul className="absolute left-0 z-10 mt-2 w-52 h-96 overflow-x-hidden bg-white shadow-lg border rounded-md">
                                            <li><Link href="/categories?type=all"
                                                      className="block text-primary px-4 py-2 hover:text-deepOrange">All
                                                categories</Link>
                                            </li>
                                            {categories?.categories?.filter(
                                                (item, index, self) =>
                                                    item.name &&
                                                    self.findIndex((i) => i.name === item.name) === index
                                            ).map((category: any) => {
                                                return <li key={category.id}>
                                                    <Link href={`/categories?type=cat&slug=${category.slug}`}
                                                          className="block text-primary px-4 py-2 hover:text-deepOrange">{category.name}
                                                    </Link>
                                                </li>
                                            })}
                                        </ul>)}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for items"
                                    className="p-2 rounded-md w-64 text-sm text-primary"
                                />
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <ul className="hidden xl:flex space-x-4 text-sm">

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
                                    </ul>)}
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
                                    </ul>)}
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
                                    </ul>)}
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
                                    </ul>)}
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
                                    </ul>)}
                            </li>


                            <Link href={'#'}>
                                <li className="text-primary text-[14px] hover:text-deepOrange">Contact Us</li>
                            </Link>
                        </ul>

                    </div>


                    <div className="flex relative space-x-4 items-center">
                        <div className="cursor-pointer" onClick={() => {
                            setUserInfo(!userInfo)
                        }}>
                            <img src="/assets/account.svg" alt="User" className="w-6 h-6"/>
                        </div>
                        {userInfo && ( <UserInfoDropdown/>  )}
                        <Link href={isAuthenticated ? `/wishlist` : `/auth/login`}>
                            <div onClick={() => {
                                // if (isAuthenticated) {
                                //     router.push('/wishlist')
                                // } else {
                                //     router.push('/auth/login')
                                // }
                            }} className="relative cursor-pointer">
                                <span
                                    className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishLists?.wishlists?.length ?? 0}</span>
                                <img src="/assets/love2.svg" alt="Wishlist" className="w-6 h-6"/>
                            </div>
                        </Link>
                        <div onClick={()=>{
                            if (isAuthenticated) {
                                setCart(!cart)
                            } else {
                                // router.push('/auth/login')
                                setCart(!cart)
                            }
                        }} className="relative cursor-pointer">
                            <span
                                className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{!isAuthenticated  && localCart !== null  ? localCart?.items?.length : carts?.cart_count  ?? 0}</span>
                            <img src="/assets/cart2.svg" alt="Cart" className="w-6 h-6"/>
                        </div>
                        <div className="relative flex items-center gap-2 text-primary text-[16px]">
                            <img src="/assets/compare.svg" alt="compare" className="w-6 h-6"/>
                        </div>
                        <div onClick={()=>{
                            dispatch(setDrawerOpen(true))
                        }} className={'lg:hidden'}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 7H7M20 7H11M20 17H17M4 17H13M4 12H20" stroke="#64748B" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                        </div>

                    </div>
                    {
                        cart && <CartModal/>
                    }
                </div>
            </div>

        </div>);
}

export default MainHeader;
