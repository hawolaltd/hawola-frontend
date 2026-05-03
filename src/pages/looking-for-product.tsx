import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleLogin } from "@react-oauth/google";
import { useAppSelector, useAppDispatch } from "@/hook/useReduxTypes";
import { loginWithGoogle } from "@/redux/auth/authSlice";
import productService from "@/redux/product/productService";
import axiosInstance from "@/libs/api/axiosInstance";
import { API } from "@/constant";
import { toast } from "sonner";
import { XMarkIcon } from "@heroicons/react/24/outline";

const HOW_IT_WORKS_DISMISS_KEY = "hawola-buying-how-it-works-dismissed";

interface Category {
  id: number;
  name: string;
  subcategory?: { id: number; name: string }[];
}

const LookingForProductPage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(HOW_IT_WORKS_DISMISS_KEY) === "1") {
        setShowHowItWorks(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissHowItWorks = () => {
    try {
      sessionStorage.setItem(HOW_IT_WORKS_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setShowHowItWorks(false);
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await productService.getAllCategories();
        const cats =
          (res?.categories as Category[]) ||
          (res?.data?.categories as Category[]) ||
          (Array.isArray(res) ? (res as Category[]) : []);
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch {
        // Silent fail – category is optional
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setImages([]);
      return;
    }
    const all = [...images, ...files];
    if (all.length > 5) {
      toast.error("You can upload up to 5 images only.");
      setImages(all.slice(0, 5));
    } else {
      setImages(all);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please add a short title for what you are looking for.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe what you are looking for.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (selectedCategoryId) {
        formData.append("category", String(selectedCategoryId));
      }
      if (selectedSubcategoryId) {
        formData.append("subcategory", String(selectedSubcategoryId));
      }
      if (videoLink.trim()) {
        formData.append("video_link", videoLink.trim());
      }
      if (phoneNumber.trim()) {
        formData.append("phone_number", phoneNumber.trim());
      }
      images.forEach((file) => {
        formData.append("images", file);
      });

      await axiosInstance.post(
        API + "feeds/buying-requests/create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        "Your request has been submitted. Merchants will be able to show interest shortly."
      );
      setTitle("");
      setDescription("");
      setVideoLink("");
      setPhoneNumber("");
      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      setImages([]);
      // Redirect to customer dashboard "My Buying Requests" tab
      router.push("/account?tab=buying_requests");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to submit buying request. Please try again.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const metaTitle = "Request for a product | Hawola";
  const metaDescription =
    "Tell Hawola what you are looking for, upload photos and details, and let trusted merchants show interest in finding it for you.";

  return (
    <AuthLayout>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
      </Head>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Left: auth gate + form */}
          <div className="flex flex-col">
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Request for a product
              </h2>
              <p className="mt-1.5 text-sm text-gray-600">
                Post a buying request and let verified merchants on Hawola respond. Your
                personal details stay hidden until you decide to share them.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-7 space-y-5">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Log in to post a buying request
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Sign in with Google or your Hawola account. Once you&apos;re
                    logged in, you can add your request on this same page.
                  </p>
                </div>

                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                  <>
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        const token = credentialResponse.credential;
                        if (!token) return;
                        try {
                          const res: any = await dispatch(loginWithGoogle(token));
                          if (res?.type?.includes?.("fulfilled")) {
                            toast.success("Welcome to Hawola");
                          } else if (res?.type?.includes?.("rejected") && res?.payload) {
                            toast.error(String(res.payload));
                          }
                        } catch (err) {
                          console.error("Google sign-in error:", err);
                          toast.error(
                            "Google sign-in failed. Please try again or use email login."
                          );
                        }
                      }}
                      onError={() => {
                        toast.error("Google sign-in failed. Please try again.", {
                          style: { background: "#ef4444", color: "white" },
                        });
                      }}
                      useOneTap={false}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span>or</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Login to post a request
                  </a>
                  <a
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Create a free account
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">
                    By using this feature you agree to Hawola&apos;s usage terms and community
                    guidelines. Hawola is not liable for any issues that may arise between you and
                    merchants. Please trade safely and read our community guidelines.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-7 space-y-6">
                {showHowItWorks ? (
                  <div className="relative bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg p-4 pr-10">
                    <button
                      type="button"
                      onClick={dismissHowItWorks}
                      className="absolute right-2 top-2 rounded-full p-1.5 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Close how it works"
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden />
                    </button>
                    <p className="font-medium">How it works</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-blue-900">
                      <li>
                        Describe the product you want and add clear photos if you have
                        them.
                      </li>
                      <li>
                        Optionally paste a video link from YouTube, Vimeo, Alibaba,
                        Instagram, Facebook, Twitter/X, LinkedIn or TikTok.
                      </li>
                      <li>Interested merchants send you a message.</li>
                      <li>
                        You decide which merchant to share your contact details with
                        before any merchant can see your phone or email.
                      </li>
                      <li>
                        Each request stays active for <strong>21 days</strong>. After that it
                        automatically expires and will no longer be visible to merchants.
                      </li>
                    </ul>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={'E.g. Original Samsung 55" QLED TV, new or fairly used'}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Describe what you are looking for{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add as much detail as you can: brand, model, size, colour, budget range, condition (new/used), when you need it, and any other important information."
                      rows={6}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closest category{" "}
                        <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCategoryId(val ? Number(val) : "");
                          setSelectedSubcategoryId("");
                        }}
                        disabled={loadingCategories}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                      >
                        <option value="">I am not sure</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closest subcategory{" "}
                        <span className="text-gray-400 text-xs">(optional)</span>
                      </label>
                      <select
                        value={selectedSubcategoryId}
                        onChange={(e) =>
                          setSelectedSubcategoryId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        disabled={
                          !selectedCategoryId ||
                          !categories.find((c) => c.id === selectedCategoryId)
                            ?.subcategory
                        }
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                      >
                        <option value="">I am not sure</option>
                        {selectedCategoryId &&
                          categories
                            .find((c) => c.id === selectedCategoryId)
                            ?.subcategory?.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add images (up to 5)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    {images.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        {images.length} image{images.length > 1 ? "s" : ""} selected.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video link{" "}
                      <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="Paste a link from YouTube, Vimeo, Alibaba, Instagram, Facebook, Twitter/X, LinkedIn or TikTok"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number for this request
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="If your account has no phone number, we will ask you for one before sharing with a merchant."
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      If your Hawola account does not already have a phone number, this field is required so
                      interested merchants can reach you.
                    </p>
                  </div>

                  <div className="pt-2 space-y-4">
                    <p className="text-xs text-gray-500">
                      Your personal details will be hidden. Merchants will only see
                      your request. You can decide later which merchant to share your
                      contact with.
                    </p>
                    <div className="rounded-lg border border-gray-200 bg-gray-100/90 dark:border-gray-700 dark:bg-gray-900/40 p-3">
                      <p className="text-xs text-gray-800 dark:text-gray-100">
                        By using this feature you agree to Hawola&apos;s usage terms and community
                        guidelines, and acknowledge that <strong>Hawola is not liable</strong> for any
                        issues that may arise between you and merchants. Please trade safely.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Post buying request"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: clear image + copy below */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-[4/5] max-h-[420px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200/80">
              <Image
                src="/images/buying.jpg"
                alt="Customer looking for a product on Hawola"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Buying request
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Tell us exactly what you&apos;re looking for
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Share the details once. Trusted Hawola merchants can then raise
                their hands to help you find the right product at the right time.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    1
                  </span>
                  <span>Describe the product and add photos or a short video link.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    2
                  </span>
                  <span>Merchants who can help will click &quot;Interested&quot; and send you a note.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    3
                  </span>
                  <span>You choose which merchant to share your contact details with.</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-gray-200 rounded-lg bg-gray-100/80 p-3">
                <p className="text-xs text-gray-600">
                  Hawola is not liable for any issues between buyers and merchants. By using this feature you agree to our usage terms and community guidelines. Please trade safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LookingForProductPage;

