import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import CartModal from "@/components/shared/CartModal";
import { useRouter } from "next/router";
import { CartResponse } from "@/types/product";
import UserInfoDropdown from "@/components/shared/UserInfoDropdown";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import Navigation from "./Navigation";

const Header = ({ isScrolled }: { isScrolled?: any }) => {
  const [userInfo, setUserInfo] = useState(false);
  const [cart, setCart] = useState(false);
  const [items, setItems] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownOpenCat, setDropdownOpenCat] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { carts, localCart, wishLists, categories } = useAppSelector(
    (state) => state.products
  );
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [submenuTimeout, setSubmenuTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [hoveredMainCategory, setHoveredMainCategory] = useState<number | null>(
    null
  );
  const [hoveredSubCategory, setHoveredSubCategory] = useState<number | null>(
    null
  );

  const [hoveredSecSubCategory, setHoveredSecSubCategory] = useState<
    number | null
  >(null);

  const [userCart, setUserCart] = useState<CartResponse>(carts);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  const toggleDropdownOpenCat = () => {
    setDropdownOpenCat(!dropdownOpenCat);
  };

  const router = useRouter();

  const dispatch = useAppDispatch();

  // Update the handleSubmenuClose function to reset all hover states
  const handleSubmenuClose = () => {
    if (submenuTimeout) clearTimeout(submenuTimeout);
    setSubmenuTimeout(
      setTimeout(() => {
        setHoveredMainCategory(null);
        setHoveredSubCategory(null);
      }, 9000)
    );
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const getCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") as string);
      setItems(cartItems);
    };
    getCartCount();
    window.addEventListener("storage", getCartCount);

    return () => window.removeEventListener("storage", getCartCount);
  }, []);

  return (
    <div className={"relative "}>
      {/* Top Component Start*/}
      <div className="bg-white border-b border-gray-300">
        <div className="w-full relative px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <img src="/assets/hawola.png" alt="Logo" className="w-50 h-10" />
              </div>
            </Link>

            {/* Shop By Categories Dropdown */}
            <div className="hidden lg:flex items-center space-x-2 relative">
              <button
                onClick={() => toggleDropdownOpenCat()}
                className="bg-white text-primary py-2 px-4 rounded-md flex items-center space-x-2 border border-gray-300 hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
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
              {dropdownOpenCat && (
                <div className="absolute -left-3 top-12 z-10 w-72 h-96 bg-white shadow-lg border rounded-md flex">
                  {/* Main categories column */}
                  <ul
                    className="w-full overflow-y-auto"
                    onMouseLeave={handleSubmenuClose}
                  >
                    {categories?.categories
                      ?.filter(
                        (item, index, self) =>
                          item.name &&
                          self.findIndex((i) => i.name === item.name) === index
                      )
                      .map((category: any) => (
                        <li
                          key={category.id}
                          onMouseEnter={() => {
                            if (submenuTimeout) clearTimeout(submenuTimeout);
                            if (category.subcategory?.length > 0) {
                              setHoveredMainCategory(category.id);
                              setHoveredSubCategory(null);
                            }
                          }}
                          className="relative"
                        >
                          <Link
                            href={`/categories?type=cat&slug=${category.slug}`}
                            className="flex justify-between items-center text-primary px-4 py-2 hover:text-deepOrange hover:bg-gray-50"
                          >
                            {category.name}
                            {category.subcategory?.length > 0 && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2"
                              >
                                <path
                                  d="M9 18L15 12L9 6"
                                  stroke="#64748B"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </Link>
                        </li>
                      ))}
                  </ul>

                  {/* Subcategories column */}
                  {hoveredMainCategory && (
                    <div
                      className="absolute left-full top-0 w-72 h-full bg-white shadow-lg border rounded-md overflow-y-auto"
                      onMouseEnter={() => {
                        if (submenuTimeout) clearTimeout(submenuTimeout);
                      }}
                      onMouseLeave={handleSubmenuClose}
                    >
                      {categories?.categories
                        ?.find((cat: any) => cat.id === hoveredMainCategory)
                        ?.subcategory?.map((subcat: any) => (
                          <div
                            key={subcat.id}
                            className="relative group"
                            onMouseEnter={() => {
                              if (submenuTimeout) clearTimeout(submenuTimeout);
                              setHoveredSubCategory(subcat.id);
                            }}
                          >
                            <Link
                              href={`/categories?type=subcat&slug=${subcat.slug}`}
                              className="flex justify-between items-center text-primary px-4 py-2 hover:text-deepOrange hover:bg-gray-50"
                            >
                              {subcat.name}
                              {subcat.second_subcategory?.length > 0 && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="ml-2"
                                >
                                  <path
                                    d="M9 18L15 12L9 6"
                                    stroke="#64748B"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </Link>

                            {/* Second subcategories column */}
                            {hoveredSubCategory === subcat.id &&
                              subcat.second_subcategory?.length > 0 && (
                                <div
                                  className="absolute left-full top-0 w-72 h-full bg-white shadow-lg border rounded-md overflow-y-auto"
                                  onMouseEnter={() => {
                                    if (submenuTimeout) clearTimeout(submenuTimeout);
                                  }}
                                  onMouseLeave={handleSubmenuClose}
                                >
                                  {subcat.second_subcategory.map(
                                    (secSubcat: any) => (
                                      <Link
                                        key={secSubcat.id}
                                        href={`/categories?type=secsubcat&slug=${secSubcat.slug}`}
                                        className="block text-primary px-4 py-2 hover:text-deepOrange hover:bg-gray-50"
                                      >
                                        {secSubcat.name}
                                      </Link>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center">
              <form onSubmit={handleSearchSubmit} className="flex items-center border rounded-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for items"
                  className="p-2 rounded-l-md w-64 text-sm text-primary outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#FF5733] text-white px-4 py-2 rounded-r-md hover:bg-[#E64A2E] transition-colors text-sm font-medium"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Navigation Links with Dropdowns */}
            <Navigation 
              dropdownOpen={dropdownOpen}
              toggleDropdown={toggleDropdown}
            />
          </div>

          {/* Icons (User, Wishlist, Cart, Settings) */}
          <div className="flex relative space-x-6 items-center">
            <div className="relative">
              <div
                onClick={() => {
                  setUserInfo(!userInfo);
                }}
                className="cursor-pointer"
              >
                <img src="/assets/account.svg" alt="User" className="w-6 h-6" />
              </div>
              {userInfo && <UserInfoDropdown />}
            </div>

            {/* Wishlist */}
            <Link href={isAuthenticated ? `/wishlist` : `/auth/login`}>
              <div
                onClick={() => {
                  // if (isAuthenticated) {
                  //     router.push('/wishlist')
                  // } else {
                  //     router.push('/auth/login')
                  // }
                }}
                className="relative cursor-pointer"
              >
                <span className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishLists?.wishlists?.length ?? 0}
                </span>
                <img
                  src="/assets/love2.svg"
                  alt="Wishlist"
                  className="w-6 h-6"
                />
              </div>
            </Link>

            {/* Cart */}
            <div
              onClick={() => {
                if (isAuthenticated) {
                  setCart(!cart);
                } else {
                  // router.push('/auth/login')
                  setCart(!cart);
                }
              }}
              className="relative cursor-pointer"
            >
              <span className="absolute -top-2 -right-2 bg-deepOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {!isAuthenticated && localCart !== null
                  ? localCart?.items?.length ?? 0
                  : carts?.cart_count ?? 0}
              </span>
              <img src="/assets/cart2.svg" alt="Cart" className="w-6 h-6" />
            </div>

            {/* Compare */}
            <div className="relative flex items-center gap-2 text-primary text-[16px]">
              <img
                src="/assets/compare.svg"
                alt="compare"
                className="w-6 h-6"
              />{" "}
              <span className={"hidden lg:flex"}>Compare</span>
            </div>

            <div
              onClick={() => {
                dispatch(setDrawerOpen(true));
              }}
              className={"lg:hidden"}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7H7M20 7H11M20 17H17M4 17H13M4 12H20"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          {cart && <CartModal />}
        </div>
      </div>

      {/* Top Component End */}
    </div>
  );
};

export default Header;
