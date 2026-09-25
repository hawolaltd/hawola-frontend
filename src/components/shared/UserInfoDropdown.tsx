import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";
import { addToCartsLocal } from "@/redux/product/productSlice";
import { logout } from "@/redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useRouter } from "next/router";
import { API, authTokenStorageKeyName } from "@/constant";
import type { PlatformItem } from "@/lib/platformHandoff";

function UserInfoDropdown() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);

  const loadPlatforms = useCallback(async () => {
    if (!isAuthenticated) {
      setPlatforms([]);
      return;
    }
    try {
      const token = Cookies.get(authTokenStorageKeyName as string);
      const { data } = await axios.get(`${API}authy/platforms/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list: PlatformItem[] = Array.isArray(data?.platforms)
        ? data.platforms
        : [];
      setPlatforms(list.filter((p) => p.id !== "customer"));
    } catch {
      setPlatforms([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadPlatforms();
  }, [loadPlatforms]);

  const openPlatform = async (platform: string) => {
    try {
      const token = Cookies.get(authTokenStorageKeyName as string);
      const { data } = await axios.post(
        `${API}authy/handoff/create/`,
        { platform },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (data?.redirect_url) window.location.href = data.redirect_url;
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <ul className="absolute right-0 top-full z-[100] mt-2 w-52 rounded-md border bg-white shadow-lg">
          <li>
            <Link
              href="/account"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              My Account
            </Link>
          </li>

          {platforms.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => void openPlatform(p.id)}
                className="block w-full px-4 py-2 text-left text-primary hover:text-deepOrange"
              >
                {p.label}
              </button>
            </li>
          ))}

          <li>
            <Link
              href={{ pathname: "/account", query: { tab: "chats" } }}
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Chats
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
              href="/coupons"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Coupon Center
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
          <li>
            <Link
              href="/coupons"
              className="block text-primary px-4 py-2 hover:text-deepOrange"
            >
              Coupon Center
            </Link>
          </li>
          <li
            onClick={() => {
              router.push(
                `/auth/login?redirect=${encodeURIComponent(router.asPath || "/")}`
              );
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
