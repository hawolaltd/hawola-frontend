import React from "react";
import Link from "next/link";
import { addToCartsLocal } from "@/redux/product/productSlice";
import { logout } from "@/redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useRouter } from "next/router";

function UserInfoDropdown() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  return (
    <>
      {isAuthenticated ? (
        <ul className="absolute right-0 top-full z-[100] mt-2 w-48 rounded-md border bg-white shadow-lg">
          <li>
            <Link
              href="/account"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              My Account
            </Link>
          </li>

          <li>
            <Link
              href="/order/order-history"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Order Tracking
            </Link>
          </li>

          <li>
            <Link
              href="/wishlist"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              My Wishlist
            </Link>
          </li>

          <li>
            <Link
              href={{ pathname: "/account", query: { tab: "profile" } }}
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Settings
            </Link>
          </li>

          <li
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(addToCartsLocal({ items: [] }));
              dispatch(logout());
            }}
            className={"px-4 py-2 w-full cursor-pointer z-20"}
          >
            <span className="cursor-pointer block text-white bg-deepOrange px-2 py-1 w-full text-center rounded-[4px]">
              Sign Out
            </span>
          </li>
        </ul>
      ) : (
        <ul className="absolute right-0 top-full z-[100] mt-2 w-48 rounded-md border bg-white shadow-lg">
          <li
            onClick={() => {
              router.push("/auth/login");
            }}
            className={"px-4 py-2 w-full"}
          >
            <button className="cursor-pointer block text-white bg-deepOrange px-2 py-1 w-full text-center rounded-[4px]">
              Sign In
            </button>
          </li>
        </ul>
      )}
    </>
  );
}

export default UserInfoDropdown;
