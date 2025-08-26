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
  console.log("isAuthenticateduserInfoDropdown:", isAuthenticated);
  return (
    <>
      {isAuthenticated ? (
        <ul
          className={`absolute -right-20 ${
            isAuthenticated ? "-bottom-[17.2rem]" : "bottom-0"
          } z-10 mt-2 w-48 bg-white shadow-lg border rounded-md`}
        >
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
              href="#"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Order Tracking
            </Link>
          </li>

          <li>
            <Link
              href="/order/order-history"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              My Orders
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
              href="#"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Settings
            </Link>
          </li>

          <li
            onClick={() => {
              // setUserCart({} as CartResponse)
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
        <ul
          className={`absolute -right-20 ${
            isAuthenticated ? "-bottom-[17.2rem]" : "-bottom-[75px]"
          }  z-10 mt-2 w-48 bg-white shadow-lg border rounded-md`}
        >
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
