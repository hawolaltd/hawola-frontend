/**
 * Base origin for the Django host (no trailing `/api`).
 * `NEXT_PUBLIC_API_URL` is usually `http://host:port/api` — callers append `/api/...`.
 */
export function getApiUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  const withoutApi = raw.replace(/\/api\/?$/, "");
  return withoutApi || "http://localhost:8000";
}
