import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";
import { toast } from "sonner";

interface BuyingRequestImage {
  id: number;
  image_url?: string | null;
}

interface BuyingRequestInterest {
  id: number;
  merchant_id: number;
  merchant_store_name: string;
  comment: string;
  is_contact_shared: boolean;
  contact_shared_at?: string | null;
  created_at: string;
  proof_images?: { id: number; image_url?: string | null }[];
}

interface BuyingRequestDetail {
  id: number;
  title: string;
  description: string;
  category_name?: string | null;
  subcategory_name?: string | null;
  created_at: string;
  valid_from?: string;
  valid_until?: string;
  images?: BuyingRequestImage[];
  interests?: BuyingRequestInterest[];
  interests_count?: number;
}

export default function BuyingRequestDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [request, setRequest] = useState<BuyingRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharingIds, setSharingIds] = useState<number[]>([]);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const fetchDetail = async (requestId: string | string[]) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get<BuyingRequestDetail>(
        API + `feeds/buying-requests/mine/${requestId}/`
      );
      setRequest(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Unable to load this buying request.";
      toast.error(msg);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDetail(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleShareContact = async (interest: BuyingRequestInterest) => {
    if (!request) return;
    try {
      setSharingIds((prev) => [...prev, interest.id]);
      const { data } = await axiosInstance.post(
        API +
          `feeds/buying-requests/${request.id}/interests/${interest.id}/share-contact/`,
        {}
      );
      const updatedInterest: BuyingRequestInterest = data.interest;
      setRequest((prev) =>
        prev
          ? {
              ...prev,
              interests:
                prev.interests?.map((i) =>
                  i.id === updatedInterest.id ? updatedInterest : i
                ) || [],
            }
          : prev
      );
      toast.success(
        "Your contact details have been shared with this merchant. They will reach out to you soon."
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "We could not share your contact details with this merchant.";
      toast.error(msg);
    } finally {
      setSharingIds((prev) => prev.filter((x) => x !== interest.id));
    }
  };

  const interests = request?.interests || [];
  const interestsCount = request?.interests_count ?? interests.length;

  return (
    <AuthLayout>
      <div className="!p-0 bg-gray-50 min-h-screen">
        <Head>
          <title>Buying request details</title>
        </Head>

        <main className="px-4 sm:px-6 lg:px-20 py-6">
          <button
            type="button"
            className="mb-4 text-xs text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/account?tab=buying_requests")}
          >
            ← Back to My Buying Requests
          </button>

          {loading ? (
            <div className="flex items-center justify-center min-h-[260px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : !request ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">
              We could not find this buying request.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)]">
              {/* Left: request details */}
              <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  {request.images && request.images.length > 0 && (
                    <div className="flex-shrink-0 space-y-1">
                      <p className="text-[11px] font-medium text-gray-500">Request images (click for larger view)</p>
                      <div className="flex flex-wrap gap-2">
                        {request.images.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setLightboxImageUrl(img.image_url || null)}
                            className="rounded-lg overflow-hidden border border-gray-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          >
                            <img
                              src={img.image_url || ""}
                              alt={request.title}
                              className="w-24 h-20 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                      {request.title}
                    </h1>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                      {request.category_name && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                          {request.category_name}
                        </span>
                      )}
                      {request.subcategory_name && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                          {request.subcategory_name}
                        </span>
                      )}
                      <span>
                        Posted{" "}
                        {new Date(request.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      {request.valid_until && (
                        <span>
                          Valid until{" "}
                          {new Date(request.valid_until).toLocaleDateString(
                            "en-NG",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-2">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">
                    What you are looking for
                  </h2>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-xs text-gray-600">
                    <strong>{interestsCount}</strong>{" "}
                    merchant{interestsCount === 1 ? "" : "s"} have responded to
                    this request so far.
                  </p>
                </div>

                <p className="mt-3 text-[11px] text-gray-400">
                  By using this feature you agree to Hawola&apos;s usage terms
                  and community guidelines, and acknowledge that Hawola is not
                  liable for any issues that may arise between you and
                  merchants. Please trade safely.
                </p>
              </section>

              {/* Right: merchant responses */}
              <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Merchant responses
                  </h2>
                  <span className="text-[11px] text-gray-500">
                    {interestsCount} response
                    {interestsCount === 1 ? "" : "s"}
                  </span>
                </div>

                {interests.length === 0 ? (
                  <p className="text-xs text-gray-600">
                    No merchant has responded to this request yet. As merchants
                    show interest, you will see them here and can choose who to
                    share your contact details with.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {interests.map((interest) => (
                      <article
                        key={interest.id}
                        className="border border-gray-200 rounded-md p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {interest.merchant_store_name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Responded{" "}
                              {new Date(
                                interest.created_at
                              ).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          {interest.is_contact_shared ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                              Contact shared
                            </span>
                          ) : null}
                        </div>

                        {interest.comment && (
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {interest.comment}
                          </p>
                        )}

                        {interest.proof_images && interest.proof_images.length > 0 && (
                          <div className="pt-1">
                            <p className="text-[11px] font-medium text-gray-500 mb-1.5">Proof images from merchant</p>
                            <div className="flex flex-wrap gap-2">
                              {interest.proof_images.map((img) => (
                                <button
                                  key={img.id}
                                  type="button"
                                  onClick={() => setLightboxImageUrl(img.image_url || null)}
                                  className="rounded-lg overflow-hidden border border-gray-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                >
                                  <img
                                    src={img.image_url || ""}
                                    alt="Merchant proof"
                                    className="h-20 w-20 object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Click an image for larger view</p>
                          </div>
                        )}

                        {!interest.is_contact_shared ? (
                          <div className="pt-1">
                            <button
                              type="button"
                              disabled={sharingIds.includes(interest.id)}
                              onClick={() => handleShareContact(interest)}
                              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {sharingIds.includes(interest.id)
                                ? "Sharing your contact…"
                                : "Share my contact details with this merchant"}
                            </button>
                            <p className="mt-1 text-[10px] text-gray-500">
                              Once you share, this merchant will receive your
                              phone and email and can contact you directly.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[11px] text-gray-600">
                              Your contact details have been shared with this
                              merchant. You can continue your conversation
                              directly by phone, WhatsApp or email.
                            </p>
                            <p className="text-[11px] text-gray-500 border-t border-gray-100 pt-2">
                              Hawola is not liable for any loss or issues between you and the merchant. Hawola is not involved in the dealing; any transaction is solely between you and the merchant. Please trade safely.
                            </p>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        {/* Lightbox for proof image */}
        {lightboxImageUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxImageUrl(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image full size"
          >
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-gray-800 hover:bg-white"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImageUrl}
              alt="Proof image full size"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

