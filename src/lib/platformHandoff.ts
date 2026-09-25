import Cookies from "js-cookie";
import axios from "axios";
import { API } from "@/constant";

export type PlatformId = "customer" | "merchant" | "admin";

export type PlatformItem = {
  id: PlatformId;
  label: string;
  description?: string;
  url: string;
  accessible?: boolean;
};

/** Start SSO handoff to another Hawola surface; redirects the browser. */
export async function startPlatformHandoff(
  platform: PlatformId,
  nextPath?: string
): Promise<void> {
  const body: Record<string, string> = { platform };
  if (nextPath && nextPath.startsWith("/")) body.next = nextPath;
  const { data } = await axios.post(
    `${API}authy/handoff/create/`,
    body,
    { withCredentials: true }
  );
  const url = data?.redirect_url as string | undefined;
  if (!url) throw new Error(data?.detail || "Could not start handoff");
  window.location.href = url;
}

export async function fetchAccessiblePlatforms(): Promise<PlatformItem[]> {
  const { data } = await axios.get(`${API}authy/platforms/`, {
    withCredentials: true,
  });
  return Array.isArray(data?.platforms) ? data.platforms : [];
}

export async function exchangeHandoffCode(
  code: string,
  platform: PlatformId
): Promise<{ access: string; refresh: string }> {
  const { data } = await axios.post(`${API}authy/handoff/exchange/`, {
    code,
    platform,
  });
  if (!data?.access || !data?.refresh) {
    throw new Error(data?.detail || "Handoff failed");
  }
  return { access: data.access, refresh: data.refresh };
}

/** Attach Authorization from storefront cookies for handoff create. */
export function authHeaderFromCookies(
  accessCookieName: string
): Record<string, string> {
  const token = Cookies.get(accessCookieName);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
