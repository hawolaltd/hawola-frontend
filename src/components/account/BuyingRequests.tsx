import { useEffect, useState } from "react";
import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";
import { toast } from "sonner";

interface BuyingRequestImage {
  id: number;
  image_url?: string | null;
}

interface BuyingRequest {
  id: number;
  title: string;
  description: string;
  category_name?: string | null;
  subcategory_name?: string | null;
  created_at: string;
  valid_from?: string;
  valid_until?: string;
  images?: BuyingRequestImage[];
  interests_count?: number;
}

interface PaginatedResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: BuyingRequest[];
}

import { useRouter } from "next/router";

export default function BuyingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<BuyingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchRequests = async (pageParam: number) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<PaginatedResponse | BuyingRequest[]>(
        API + "feeds/buying-requests/mine/",
        { params: { page: pageParam, page_size: pageSize } }
      );
      const list = Array.isArray(data) ? data : data.results || [];
      setRequests(list);
      if (!Array.isArray(data)) {
        setTotalCount(data.count || list.length);
      } else {
        setTotalCount(list.length);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to load your buying requests.";
      toast.error(msg);
      setRequests([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[270px] bg-white rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">My buying requests</h2>
        <p className="text-sm text-gray-600">
          You have not posted any buying requests yet. When you use &quot;Request for a
          product&quot;, your requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My buying requests</h2>
        <p className="text-xs text-gray-500">
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalCount)} of {totalCount}
        </p>
      </div>
      <div className="space-y-3">
        {requests.map((req) => {
          const firstImage = req.images && req.images.length > 0 ? req.images[0].image_url : null;
          const validUntilText = req.valid_until
            ? new Date(req.valid_until).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : null;
          const respondedCount = req.interests_count ?? 0;
          return (
            <article
              key={req.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white overflow-hidden cursor-pointer hover:bg-gray-50"
              onClick={() => {
                router.push(`/account/buying-requests/${req.id}`);
              }}
            >
              {firstImage && (
                <div className="w-28 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={firstImage}
                    alt={req.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 py-3 pr-4">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {req.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {req.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                  {req.category_name && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                      {req.category_name}
                    </span>
                  )}
                  {req.subcategory_name && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                      {req.subcategory_name}
                    </span>
                  )}
                  <span>
                    Posted{" "}
                    {new Date(req.created_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {validUntilText && <span>Valid until {validUntilText}</span>}
                </div>
                <div className="mt-1 text-[11px] text-primary font-medium">
                  {respondedCount > 0
                    ? `${respondedCount} merchant${respondedCount === 1 ? "" : "s"} responded`
                    : "No merchant has responded yet"}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-xs font-medium text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-xs font-medium text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <p className="mt-4 text-[11px] text-gray-400">
        By using this feature you agree to Hawola&apos;s usage terms and community guidelines, and
        acknowledge that Hawola is not liable for any issues that may arise between you and
        merchants. Please trade safely.
      </p>
    </div>
  );
}

