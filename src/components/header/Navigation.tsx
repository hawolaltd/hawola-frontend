import React from "react";
import Link from "next/link";

interface NavigationProps {
  dropdownOpen: string | null;
  toggleDropdown: (menu: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ dropdownOpen, toggleDropdown }) => {
  return (
    <ul className="hidden xl:flex space-x-4 text-sm">
      {/* Home Dropdown */}
      <li
        onMouseEnter={() => toggleDropdown("home")}
        onMouseLeave={() => toggleDropdown("")}
        className="relative text-primary text-[14px] hover:text-deepOrange"
      >
        <button
          onClick={() => toggleDropdown("home")}
          className="flex items-center gap-1"
        >
          Home
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1_95)">
              <path
                d="M10.1699 4.97L6.66992 8.47L3.16992 4.97"
                stroke="#9EB4E0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_95">
                <rect
                  width="11"
                  height="10"
                  fill="white"
                  transform="translate(0.669922 0.470001)"
                />
              </clipPath>
            </defs>
          </svg>
        </button>
        {dropdownOpen === "home" && (
          <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
            <li>
              <Link href="/" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Home
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Contact Us
              </Link>
            </li>
          </ul>
        )}
      </li>

      {/* Shop Dropdown */}
      <li
        onMouseEnter={() => toggleDropdown("shop")}
        onMouseLeave={() => toggleDropdown("")}
        className="relative text-primary text-[14px] hover:text-deepOrange"
      >
        <button
          onClick={() => toggleDropdown("shop")}
          className="flex items-center gap-1"
        >
          Shop
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1_95)">
              <path
                d="M10.1699 4.97L6.66992 8.47L3.16992 4.97"
                stroke="#9EB4E0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_95">
                <rect
                  width="11"
                  height="10"
                  fill="white"
                  transform="translate(0.669922 0.470001)"
                />
              </clipPath>
            </defs>
          </svg>
        </button>
        {dropdownOpen === "shop" && (
          <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
            <li>
              <Link href="/categories" className="block text-primary px-4 py-2 hover:text-deepOrange">
                All Products
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Flash Deals
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Top Sellers
              </Link>
            </li>
          </ul>
        )}
      </li>

      {/* Vendors Dropdown */}
      <li
        onMouseEnter={() => toggleDropdown("vendor")}
        onMouseLeave={() => toggleDropdown("")}
        className="relative text-primary text-[14px] hover:text-deepOrange"
      >
        <button
          onClick={() => toggleDropdown("vendor")}
          className="flex items-center gap-1"
        >
          Vendors
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1_95)">
              <path
                d="M10.1699 4.97L6.66992 8.47L3.16992 4.97"
                stroke="#9EB4E0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_95">
                <rect
                  width="11"
                  height="10"
                  fill="white"
                  transform="translate(0.669922 0.470001)"
                />
              </clipPath>
            </defs>
          </svg>
        </button>
        {dropdownOpen === "vendor" && (
          <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Vendors Listing
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Vendor Single
              </Link>
            </li>
          </ul>
        )}
      </li>

      {/* Pages Dropdown */}
      <li
        onMouseEnter={() => toggleDropdown("pages")}
        onMouseLeave={() => toggleDropdown("")}
        className="relative text-primary text-[14px] hover:text-deepOrange"
      >
        <button
          onClick={() => toggleDropdown("pages")}
          className="flex items-center gap-1"
        >
          Pages
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1_95)">
              <path
                d="M10.1699 4.97L6.66992 8.47L3.16992 4.97"
                stroke="#9EB4E0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_95">
                <rect
                  width="11"
                  height="10"
                  fill="white"
                  transform="translate(0.669922 0.470001)"
                />
              </clipPath>
            </defs>
          </svg>
        </button>
        {dropdownOpen === "pages" && (
          <ul className="absolute left-0 z-10 mt-2 w-48 bg-white shadow-lg border rounded-md">
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="#" className="block text-primary px-4 py-2 hover:text-deepOrange">
                Careers
              </Link>
            </li>
          </ul>
        )}
      </li>

      {/* Blog Link */}
      <Link href={"#"}>
        <li className="text-primary text-[14px] hover:text-deepOrange">
          Blog
        </li>
      </Link>

      {/* Contact Link */}
      <Link href={"#"}>
        <li className="text-primary text-[14px] hover:text-deepOrange">
          Contact
        </li>
      </Link>
    </ul>
  );
};

export default Navigation;

