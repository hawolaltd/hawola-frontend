import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [menuQuery, setMenuQuery] = useState("");

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

  const q = menuQuery.trim().toLowerCase();
  const hit = (...parts: string[]) =>
    !q || parts.join(" ").toLowerCase().includes(q);

  const accountItems = useMemo(
    () => [
      { href: "/account", label: "My Account", keywords: "dashboard profile" },
      { href: "/account?tab=chats", label: "Chats", keywords: "messages inbox" },
      { href: "/order/order-history", label: "Order Tracking", keywords: "orders receipts" },
      { href: "/order/pay-later", label: "Pay later", keywords: "installment balance" },
      { href: "/coupons", label: "Coupon Center", keywords: "discount promo" },
      { href: "/wishlist", label: "My Wishlist", keywords: "saved favourites" },
      { href: "/compare", label: "Compare", keywords: "products" },
      { href: "/account?tab=profile", label: "Settings", keywords: "password 2fa addresses" },
    ],
    []
  );

  const visibleAccountItems = accountItems.filter((item) =>
    hit(item.label, item.keywords)
  );
  const visiblePlatforms = platforms.filter((p) => hit(p.label, p.id));

  return (
    <>
      {isAuthenticated ? (
        <ul className="absolute right-0 top-full z-[100] mt-2 w-56 rounded-md border bg-white shadow-lg">
          <li className="border-b px-3 py-2">
            <label className="sr-only" htmlFor="customer-account-menu-search">
              Search menu
            </label>
            <input
              id="customer-account-menu-search"
              type="search"
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
              placeholder="Jump to…"
              autoComplete="off"
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-primary outline-none placeholder:text-gray-400"
            />
          </li>

          {visibleAccountItems.map((item) => (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                className="block text-primary px-4 py-2 hover:text-deepOrange"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {visiblePlatforms.map((p) => (
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

          {q && visibleAccountItems.length === 0 && visiblePlatforms.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">No matches.</li>
          ) : null}

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
