import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from "next";
import AuthLayout from "@/components/layout/AuthLayout";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProduct from "@/components/product/RelatedProduct";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {
    addToCarts,
    addToCartsLocal,
    addWishList,
    DEFAULT_PRODUCT_DETAIL_LOAD,
    getCarts,
    getWishList,
} from "@/redux/product/productSlice";
import {
  recordProductDetailView,
} from "@/lib/promoAnalytics";
import { addToCartErrorMessage } from "@/lib/addToCartFeedback";
import { addToCartAsGuest } from "@/lib/guestCartClient";
import { ensureProductDetailLoaded } from "@/lib/productDetailPrefetch";
import { useRouter } from "next/router";
import {formatCurrency, isContactMerchantOnlyProduct} from "@/util";
import Link from "next/link";
import {ProductByIdResponse} from "@/types/product";
import {toast} from "sonner";
import ProductDetailNotFound from "@/components/product/ProductDetailNotFound";
import ProductDetailMobileBuyBox from "@/components/product/detail/ProductDetailMobileBuyBox";
import ProductDetailDesktopBuyBox from "@/components/product/detail/ProductDetailDesktopBuyBox";
import ProductDetailGallerySkeleton from "@/components/product/detail/ProductDetailGallerySkeleton";
import ProductDetailBuyBoxSkeleton from "@/components/product/detail/ProductDetailBuyBoxSkeleton";
import ProductDetailTabsSkeleton from "@/components/product/detail/ProductDetailTabsSkeleton";
import ProductDetailRelatedSkeleton from "@/components/product/detail/ProductDetailRelatedSkeleton";
import {
    previewImageFromPreview,
    readProductDetailPreview,
    type ProductDetailPreview,
} from "@/lib/pdpPreview";
import InlineButtonSpinner from "@/components/ui/InlineButtonSpinner";
import { buildProductSeo } from "@/util/storefrontSeo";
import { saveLocalRecentlyViewedProduct } from "@/lib/recentlyViewed";
import { trackTikTokViewContent, trackTikTokAddToCart, trackTikTokAddToWishlist, tikTokIdentityFromProfile } from "@/lib/tiktokPixel";
import {
    DEFAULT_CONTACT_MERCHANT_BUYER_PROTECTION_HTML,
    DEFAULT_CONTACT_MERCHANT_DISCLAIMER_HTML,
    sanitizeRichNotice,
} from "@/util/sanitizeRichNotice";
import MerchantStoreLink from "@/components/merchant/MerchantStoreLink";
import MerchantChatWidget from "@/components/chat/MerchantChatWidget";
import ProductGalleryLightbox from "@/components/product/ProductGalleryLightbox";
import FallbackProductImage from "@/components/product/FallbackProductImage";
import {
    featuredImageCardSrc,
    featuredImageDetailSrc,
    featuredImageDisplayCandidates,
} from "@/util/featuredImage";

type ProductPageProps = {
    serverNotFound?: boolean;
    serverShell?: ProductDetailPreview | null;
};

const ProductPage = ({ serverNotFound = false, serverShell = null }: ProductPageProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
    const [position, setPosition] = useState({x: "50%", y: "50%"});
    const [isHovered, setIsHovered] = useState(false);
    const [clientNotFound, setClientNotFound] = useState(false);
    const [preview, setPreview] = useState<ProductDetailPreview | null>(null);
    const [loadingReview, setLoadingReview] = useState(!serverNotFound);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const router = useRouter();
    const { query, isReady: routerIsReady } = router;
    const promoSlug =
        typeof query.from_promo === "string" ? query.from_promo.trim() : "";

    const dispatch = useAppDispatch()

    const {
        product,
        reviews,
        merchantReviews,
        addToCartPendingProductId,
        addToWishlistPendingProductId,
        productDetailLoad,
    } = useAppSelector((state) => state.products);

    const detailLoad = productDetailLoad ?? DEFAULT_PRODUCT_DETAIL_LOAD;
    const galleryReady = detailLoad.gallery === "succeeded";
    const mainReady = detailLoad.main === "succeeded";
    const relatedReady = detailLoad.related === "succeeded";
    const galleryLoading =
        detailLoad.gallery === "pending" || detailLoad.gallery === "idle";
    const mainLoading =
        detailLoad.main === "pending" || detailLoad.main === "idle";
    const relatedLoading =
        detailLoad.related === "pending" || detailLoad.related === "idle";

    const displayName =
        product?.product?.name || preview?.name || "Product";
    const {isAuthenticated, profile: authProfile} = useAppSelector(state => state.auth)
    const tikTokIdentity = tikTokIdentityFromProfile(authProfile);
    const siteSettings = useAppSelector((state) => state.general.siteSettings)
    const contactMerchantOnly =
        isContactMerchantOnlyProduct(product?.product) ||
        Boolean(preview?.contact_merchant_only);
    const stockStatus = product?.stock_status;
    const inventoryUnavailable = Boolean(
        stockStatus?.tracks_inventory && stockStatus?.is_out_of_stock
    );
    const inventoryLow = Boolean(
        stockStatus?.tracks_inventory &&
            stockStatus?.is_low_stock &&
            !stockStatus?.is_out_of_stock
    );
    const [contactDisclaimerSafe, setContactDisclaimerSafe] = useState("");
    const [buyerProtectionSafe, setBuyerProtectionSafe] = useState("");
    const [merchantCollectsNoticeSafe, setMerchantCollectsNoticeSafe] = useState("");

    const productSlug = useMemo(() => {
        const id = query.id;
        if (typeof id === "string" && id) return id;
        if (Array.isArray(id) && id[0]) return id[0];
        const m = router.asPath.match(/\/product\/([^/?#]+)/);
        return m?.[1] ?? "";
    }, [query.id, router.asPath]);

    const productMatchesRoute = Boolean(
        productSlug && product?.product?.slug === productSlug
    );

    const routeGalleryImages = useMemo(() => {
        if (!productMatchesRoute) return [];
        return (product?.product_images || [])
            .map((img) => featuredImageDetailSrc(img))
            .filter(Boolean) as string[];
    }, [productMatchesRoute, product?.product_images]);

    const routeGalleryThumbnails = useMemo(() => {
        if (!productMatchesRoute) return [];
        return (product?.product_images || [])
            .map((img) => featuredImageCardSrc(img))
            .filter(Boolean) as string[];
    }, [productMatchesRoute, product?.product_images]);

    const heroImageCandidates = useMemo(() => {
        if (productMatchesRoute) {
            const images = product?.product_images || [];
            const entry = images[selectedGalleryIndex] ?? images[0];
            const fromEntry = entry ? featuredImageDisplayCandidates(entry) : [];
            if (fromEntry.length) return fromEntry;
            const fromFeatured = featuredImageDisplayCandidates(
                product?.product?.featured_image?.[0]
            );
            if (fromFeatured.length) return fromFeatured;
        }
        const previewForRoute =
            preview?.slug === productSlug ? preview : null;
        const previewUrl = previewImageFromPreview(previewForRoute);
        return previewUrl ? [previewUrl] : [];
    }, [
        productMatchesRoute,
        product?.product_images,
        selectedGalleryIndex,
        product?.product?.featured_image,
        preview,
        productSlug,
    ]);

    const effectiveGalleryCandidates = useMemo(() => {
        if (productMatchesRoute) {
            const fromImages = (product?.product_images || [])
                .map((img) => featuredImageDisplayCandidates(img))
                .filter((candidates) => candidates.length > 0);
            if (fromImages.length) return fromImages;
            const featured = featuredImageDisplayCandidates(
                product?.product?.featured_image?.[0]
            );
            if (featured.length) return [featured];
        }
        const previewForRoute =
            preview?.slug === productSlug ? preview : null;
        const previewUrl = previewImageFromPreview(previewForRoute);
        return previewUrl ? [[previewUrl]] : [];
    }, [
        productMatchesRoute,
        product?.product_images,
        product?.product?.featured_image,
        preview,
        productSlug,
    ]);

    const productSeo = useMemo(() => {
        const p = product?.product;
        if (!p?.id || !productSlug) return null;
        return buildProductSeo({
            siteSettings,
            product: p,
            pathSlug: productSlug,
        });
    }, [siteSettings, product?.product, productSlug]);

    // Get current product URL for sharing
    const getProductUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    // Social media share handlers
    const handleShare = (platform: string) => {
        const productUrl = encodeURIComponent(getProductUrl());
        const productTitle = encodeURIComponent(product?.product?.name || 'Check out this product!');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${productUrl}&text=${productTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${productUrl}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${productTitle}%20${productUrl}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Copy link to clipboard
    const handleCopyLink = () => {
        const productUrl = getProductUrl();
        navigator.clipboard.writeText(productUrl).then(() => {
            toast.success('Product link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    // State for selected variants
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    // Handle variant selection
    const handleVariantSelect = (variantId: number, valueId: number) => {
        setSelectedVariants(prev => ({
            ...prev,
            [variantId]: valueId
        }));
    };

    const handleQuantityChange = (value: number) => {
        setQuantity((prev) => Math.max(1, prev + value));
    };


    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({
            x: `${Math.max(0, Math.min(100, x))}%`,
            y: `${Math.max(0, Math.min(100, y))}%`
        });
    };

    const handleWishList = async () => {
        if (!isAuthenticated) {
            toast.info("Sign in to save items to your wishlist.");
            void router.push("/auth/login");
            return;
        }
        const wid = product?.product?.id;
        if (!wid) return;
        try {
            const res = await dispatch(
                addWishList({
                    items: wid,
                })
            );
            if (res?.type.includes("fulfilled")) {
                toast.success("Added to wishlist");
                trackTikTokAddToWishlist(
                    {
                        id: product?.product?.id,
                        name: product?.product?.name,
                        price: product?.product?.price,
                        discount_price: product?.product?.discount_price,
                    },
                    tikTokIdentity
                );
                dispatch(getWishList());
            } else if (res?.type.includes("rejected")) {
                toast.error("Could not add to wishlist.");
            }
        } catch {
            toast.error("Could not add to wishlist.");
        }
    };

    const handleAddToCart = async (product: ProductByIdResponse) => {
        try {
            const ss = product?.stock_status;
            if (ss?.tracks_inventory && ss?.is_out_of_stock) {
                toast.error("This product is currently out of stock.");
                return;
            }
            // Convert selected variants to the format expected by backend
            const variants = product?.product_variant?.length > 0
                ? Object.entries(selectedVariants).map(([variantId, variantValueId]) => ({
                    variant: Number(variantId),
                    variant_value: variantValueId
                }))
                : undefined;

            if (isAuthenticated) {
                const res = await dispatch(
                    addToCarts({
                        items: [
                            {
                                qty: quantity,
                                product: product?.product?.id,
                                ...(variants && { variant: variants }),
                                ...(promoSlug ? { promo_slug: promoSlug } : {}),
                            },
                        ],
                    })
                );

                if (res?.type.includes("fulfilled")) {
                    dispatch(getCarts());
                    trackTikTokAddToCart(
                        {
                            id: product?.product?.id,
                            name: product?.product?.name,
                            price: product?.product?.price,
                            discount_price: product?.product?.discount_price,
                            qty: quantity,
                        },
                        tikTokIdentity
                    );
                    toast.success("Added to cart");
                } else if (addToCarts.rejected.match(res)) {
                    toast.error(addToCartErrorMessage(res.payload));
                } else if (res?.type.includes("rejected")) {
                    toast.error(addToCartErrorMessage(null));
                }
            } else {
                const guestResult = await addToCartAsGuest(dispatch, {
                    product: product?.product,
                    qty: quantity,
                    variants,
                    promoSlug: promoSlug || undefined,
                });

                if (!guestResult.ok) {
                    toast.error("Could not add to cart. Try opening in Safari or Chrome.");
                    return;
                }

                toast.success("Added to cart");
                if (guestResult.warning) {
                    toast.warning(guestResult.warning, { duration: 6000 });
                } else if (guestResult.source === "local") {
                    toast.warning(
                        "Saved on this device only — open in Safari or Chrome to keep your cart.",
                        { duration: 5000 }
                    );
                }
            }
        } catch (e) {
            console.error("Error adding to cart:", e);
            toast.error(addToCartErrorMessage(e, "Failed to add to cart."));
        }
    }

    const init = useCallback(async () => {
        const slug = productSlug;
        if (!slug) return;

        setLoadingReview(true);
        setClientNotFound(false);

        try {
            const { notFound } = await ensureProductDetailLoaded(dispatch, slug, {
                promoSlug: promoSlug || undefined,
            });
            if (notFound) {
                setClientNotFound(true);
                return;
            }
            setClientNotFound(false);
        } catch {
            setClientNotFound(true);
        } finally {
            setLoadingReview(false);
        }
    }, [dispatch, productSlug, promoSlug]);

    useLayoutEffect(() => {
        if (!productSlug || typeof window === "undefined") return;
        const cached = readProductDetailPreview(productSlug);
        const initial = cached ?? serverShell;
        setPreview(initial);
    }, [productSlug, serverShell]);

    useEffect(() => {
        if (serverNotFound) {
            setLoadingReview(false);
            return;
        }
        if (!productSlug) {
            if (routerIsReady) {
                setClientNotFound(true);
                setLoadingReview(false);
            }
            return;
        }
        void init();
    }, [serverNotFound, routerIsReady, productSlug, init]);

    useEffect(() => {
        setSelectedGalleryIndex(0);
    }, [productSlug]);

    useEffect(() => {
        if (
            routeGalleryImages.length > 0 &&
            selectedGalleryIndex >= routeGalleryImages.length
        ) {
            setSelectedGalleryIndex(0);
        }
    }, [routeGalleryImages.length, selectedGalleryIndex]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const subsecId = Number((product as any)?.product?.product_subseccategory?.id);
        if (!Number.isInteger(subsecId) || subsecId <= 0) return;
        try {
            const key = "homePersonalizationSubsecIds";
            const raw = localStorage.getItem(key);
            const existing = raw ? JSON.parse(raw) : [];
            const next = Array.isArray(existing)
                ? existing.filter((v: unknown) => Number(v) !== subsecId)
                : [];
            next.unshift(subsecId);
            localStorage.setItem(key, JSON.stringify(next.slice(0, 20)));
        } catch {
            // Ignore personalization cache write errors.
        }
    }, [(product as any)?.product?.product_subseccategory?.id]);

    useEffect(() => {
        const p = (product as any)?.product;
        if (!p?.id || !p?.slug || p.slug !== productSlug) return;
        const imageUrl =
            product?.product_images?.[0]?.image_url ||
            p?.featured_image?.[0]?.image?.full_size ||
            p?.featured_image?.[0]?.image_url ||
            null;
        saveLocalRecentlyViewedProduct({
            id: Number(p.id),
            slug: String(p.slug),
            name: String(p.name || "Product"),
            price: p.price,
            discount_price: p.discount_price,
            image_url: imageUrl,
        });
        trackTikTokViewContent(
            {
                id: p.id,
                name: p.name,
                price: p.price,
                discount_price: p.discount_price,
            },
            tikTokIdentity
        );
    }, [(product as any)?.product?.id, (product as any)?.product?.slug, authProfile?.email]);

    useEffect(() => {
        if (!contactMerchantOnly) {
            setContactDisclaimerSafe("");
            setBuyerProtectionSafe("");
            return;
        }
        const buyerProtectionSource = siteSettings?.contact_merchant_buyer_protection_html?.trim()
            ? String(siteSettings.contact_merchant_buyer_protection_html)
            : DEFAULT_CONTACT_MERCHANT_BUYER_PROTECTION_HTML;
        const source = siteSettings?.contact_merchant_disclaimer_html?.trim()
            ? String(siteSettings.contact_merchant_disclaimer_html)
            : DEFAULT_CONTACT_MERCHANT_DISCLAIMER_HTML;
        setBuyerProtectionSafe(sanitizeRichNotice(buyerProtectionSource));
        setContactDisclaimerSafe(sanitizeRichNotice(source));
    }, [
        contactMerchantOnly,
        siteSettings?.contact_merchant_buyer_protection_html,
        siteSettings?.contact_merchant_disclaimer_html,
    ]);

    useEffect(() => {
        if (contactMerchantOnly) {
            setMerchantCollectsNoticeSafe("");
            return;
        }
        const siteOn = siteSettings?.accept_escrow_payment === true;
        const p = (product as any)?.product;
        const nonEscrowed = p && p.is_payment_escrowed === false;
        if (!siteOn || !nonEscrowed) {
            setMerchantCollectsNoticeSafe("");
            return;
        }
        const raw = (siteSettings?.merchant_collects_payment_notice_html as string | undefined)?.trim();
        setMerchantCollectsNoticeSafe(raw ? sanitizeRichNotice(raw) : "");
    }, [
        contactMerchantOnly,
        siteSettings?.accept_escrow_payment,
        siteSettings?.merchant_collects_payment_notice_html,
        (product as any)?.product?.is_payment_escrowed,
    ]);

    const notFound = serverNotFound || clientNotFound;
    const slugForMessage =
        typeof query.id === "string" ? query.id : Array.isArray(query.id) ? query.id[0] : null;

    if (notFound) {
        return (
            <AuthLayout>
                <Head>
                    <title>Hawola | Product not found</title>
                    <meta name="robots" content="noindex,nofollow" />
                </Head>
                <ProductDetailNotFound slug={slugForMessage} />
            </AuthLayout>
        );
    }

    const shellReady = Boolean(preview?.name) || mainReady || galleryReady;

    if (!shellReady && detailLoad.main === "failed" && detailLoad.gallery === "failed") {
        return (
            <AuthLayout>
                <Head>
                    <title>Hawola | Product not found</title>
                    <meta name="robots" content="noindex,nofollow" />
                </Head>
                <ProductDetailNotFound slug={slugForMessage} />
            </AuthLayout>
        );
    }

    const previewForRoute =
        preview?.slug === productSlug ? preview : null;
    const previewImageUrl = previewImageFromPreview(previewForRoute) || "";


    const tagNames = product?.product?.tags?.map((t) => t?.name).filter(Boolean) || [];
    const keywordsCombined = [productSeo?.keywords, tagNames.join(", ")]
        .filter(Boolean)
        .join(", ");
    const outsideVicinityShippingCost =
        product?.product?.shipping_cost_outside?.shipping_cost;
    const hasOutsideVicinityShippingCost =
        outsideVicinityShippingCost !== null &&
        outsideVicinityShippingCost !== undefined &&
        String(outsideVicinityShippingCost).trim() !== "";
    const outsideStateShippingCost =
        product?.product?.shipping_cost_outside_state?.shipping_cost;
    const hasOutsideStateShippingCost =
        outsideStateShippingCost !== null &&
        outsideStateShippingCost !== undefined &&
        String(outsideStateShippingCost).trim() !== "";

    const ogLocale = (siteSettings?.seo_og_locale as string) || "en_US";
    const twitterSite = (siteSettings?.seo_twitter_site as string)?.trim();
    const plainListingDescription = (product?.product?.description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

    const openLightboxAtIndex = (index: number) => {
        if (!effectiveGalleryCandidates.length) return;
        const safeIndex = Math.max(
            0,
            Math.min(index, effectiveGalleryCandidates.length - 1)
        );
        setLightboxIndex(safeIndex);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    if (contactMerchantOnly) {
        return (
            <AuthLayout>
                <Head>
                    <title>
                {productSeo?.title ||
                    (preview?.name ? `${preview.name} | Hawola` : "Hawola | Product")}
            </title>
                    <meta name="description" content={productSeo?.description || ""} />
                    {keywordsCombined ? (
                        <meta name="keywords" content={keywordsCombined.slice(0, 512)} />
                    ) : null}
                    <meta name="robots" content={productSeo?.robots || "index,follow"} />
                </Head>
                <div className="w-full pt-0">
                    <div className="w-full bg-[#0b1f4d] text-white shadow-[0_2px_10px_rgba(11,31,77,0.25)]">
                        <div className="mx-auto flex max-w-[1320px] flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div />
                            <nav className="text-xs sm:text-sm text-[#d6def2]">
                                <span>Home</span>
                                <span className="mx-2 text-[#9fb2e3]">/</span>
                                <span>{product?.product?.category?.name || "Listings"}</span>
                                <span className="mx-2 text-[#9fb2e3]">/</span>
                                <span className="text-white">{product?.product?.name}</span>
                            </nav>
                        </div>
                    </div>
                    <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-4">
                        <div className="overflow-hidden rounded-[26px] bg-gradient-to-b from-slate-900 via-slate-950 to-black shadow-[0_20px_45px_rgba(2,6,23,0.6)]">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="border-b border-slate-800 lg:col-span-8 lg:border-b-0 lg:border-r lg:border-slate-800 p-5 lg:p-7">
                                <div className="aspect-[16/10] w-full rounded-2xl border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shadow-[0_1px_6px_rgba(2,6,23,0.6)]">
                                    <FallbackProductImage
                                        candidates={heroImageCandidates}
                                        alt={displayName}
                                        className="w-full h-full object-contain cursor-zoom-in"
                                        onClick={() => openLightboxAtIndex(selectedGalleryIndex)}
                                    />
                                </div>
                                {routeGalleryImages.length > 1 ? (
                                    <div className="mt-4 grid grid-cols-5 gap-2 rounded-xl bg-slate-900/80 border border-slate-700 p-2">
                                        {routeGalleryImages.slice(0, 10).map((imageUrl, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedGalleryIndex(idx)}
                                                className={`h-16 rounded-lg border overflow-hidden transition ${
                                                    selectedGalleryIndex === idx ? "border-amber-400 ring-1 ring-amber-400/30" : "border-slate-700"
                                                }`}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt="Listing preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="lg:col-span-4 p-6 lg:p-7 bg-gradient-to-b from-slate-900/50 to-black">
                                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                                    {product?.product?.name}
                                </h1>
                                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                                    Listed by{" "}
                                    <MerchantStoreLink
                                        slug={product?.product?.merchant?.slug ?? ""}
                                        className="font-semibold text-cyan-300 underline-offset-2 hover:underline"
                                    >
                                        {product?.product?.merchant?.store_name}
                                    </MerchantStoreLink>
                                </p>

                                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-[0_1px_6px_rgba(2,6,23,0.6)]">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Listing Price</p>
                                    <p className="mt-1 text-3xl font-bold text-amber-300">
                                        {formatCurrency(product.product?.discount_price)}
                                    </p>
                                    {product?.product?.price && product?.product?.discount_price && Number(product?.product?.price) > Number(product?.product?.discount_price) ? (
                                        <span className="mt-1 inline-block line-through text-sm text-slate-400">
                                            {formatCurrency(product?.product?.price)}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-2 text-sm">
                                    {product?.product?.category?.name ? (
                                        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
                                            <span className="text-slate-400">Category</span>
                                            <span className="font-medium text-white">{product.product.category.name}</span>
                                        </div>
                                    ) : null}
                                    {product?.product?.product_subcategory?.name ? (
                                        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
                                            <span className="text-slate-400">Type</span>
                                            <span className="font-medium text-white">{product.product.product_subcategory.name}</span>
                                        </div>
                                    ) : null}
                                    {product?.product?.merchant?.location?.name ? (
                                        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
                                            <span className="text-slate-400">Location</span>
                                            <span className="font-medium text-white">{product.product.merchant.location.name}</span>
                                        </div>
                                    ) : null}
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-8 rounded-3xl bg-white p-6 sm:shadow-[0_2px_24px_rgba(15,23,42,0.04)]">
                            <ProductInfo product={product} embedded />
                        </div>
                        <div className="lg:col-span-4 rounded-3xl bg-white p-6 sm:shadow-[0_2px_24px_rgba(15,23,42,0.04)]">
                            <h3 className="text-lg font-semibold text-primary">Buyer Protection & Disclaimer</h3>
                            <div
                                className="mt-3 text-sm text-textPadded leading-6 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"
                                dangerouslySetInnerHTML={{
                                    __html: buyerProtectionSafe || DEFAULT_CONTACT_MERCHANT_BUYER_PROTECTION_HTML,
                                }}
                            />
                            <div className="my-4 h-px bg-slate-100 dark:bg-slate-700/80" aria-hidden />
                            <div
                                className="text-sm text-textPadded leading-6 [&_a]:text-primary [&_a]:underline"
                                dangerouslySetInnerHTML={{
                                    __html: contactDisclaimerSafe || DEFAULT_CONTACT_MERCHANT_DISCLAIMER_HTML,
                                }}
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        <RelatedProduct product={product} />
                    </div>
                    </div>
                </div>

                <ProductGalleryLightbox
                    open={lightboxOpen}
                    imageCandidates={effectiveGalleryCandidates}
                    initialIndex={lightboxIndex}
                    onClose={closeLightbox}
                    altPrefix={product?.product?.name || "Listing"}
                />
                {product?.product?.slug ? (
                    <MerchantChatWidget
                        productSlug={product.product.slug}
                        productName={product.product.name}
                        merchantStoreName={product.product.merchant?.store_name}
                    />
                ) : null}
            </AuthLayout>
        );
    }

    return (<AuthLayout>
        <Head>
            <title>
                {productSeo?.title ||
                    (preview?.name ? `${preview.name} | Hawola` : "Hawola | Product")}
            </title>
            <meta name="description" content={productSeo?.description || ""} />
            {keywordsCombined ? (
                <meta name="keywords" content={keywordsCombined.slice(0, 512)} />
            ) : null}
            <meta name="robots" content={productSeo?.robots || "index,follow"} />
            {productSeo?.canonicalUrl ? (
                <link rel="canonical" href={productSeo.canonicalUrl} />
            ) : null}
            <meta property="og:title" content={productSeo?.ogTitle || ""} />
            <meta property="og:description" content={productSeo?.ogDescription || ""} />
            <meta property="og:type" content={productSeo?.ogType || "product"} />
            <meta property="og:locale" content={ogLocale} />
            {siteSettings?.app_name ? (
                <meta property="og:site_name" content={String(siteSettings.app_name)} />
            ) : null}
            {productSeo?.canonicalUrl ? (
                <meta property="og:url" content={productSeo.canonicalUrl} />
            ) : null}
            {productSeo?.ogImage ? (
                <meta property="og:image" content={productSeo.ogImage} />
            ) : null}
            <meta name="twitter:card" content="summary_large_image" />
            {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
            {productSeo?.ogTitle ? (
                <meta name="twitter:title" content={productSeo.ogTitle} />
            ) : null}
            {productSeo?.ogDescription ? (
                <meta name="twitter:description" content={productSeo.ogDescription} />
            ) : null}
            {productSeo?.ogImage ? (
                <meta name="twitter:image" content={productSeo.ogImage} />
            ) : null}
            {productSeo?.jsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSeo.jsonLd) }}
                />
            ) : null}
        </Head>
        <div className="hidden sm:block w-full bg-[#0b1f4d] text-white shadow-[0_2px_10px_rgba(11,31,77,0.25)]">
            <div className="mx-auto flex max-w-[1320px] flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[#b9c7ea]">Product Listing</p>
                <nav className="text-xs sm:text-sm text-[#d6def2]">
                    <span>Home</span>
                    <span className="mx-2 text-[#9fb2e3]">/</span>
                    <span>{product?.product?.category?.name || "Products"}</span>
                    <span className="mx-2 text-[#9fb2e3]">/</span>
                    <span className="text-white">{displayName}</span>
                </nav>
            </div>
        </div>
        <div className="mx-auto max-w-[1320px] px-3 py-4 pb-28 sm:px-4 sm:py-6 lg:py-8 lg:pb-8">
            {/* Product Image start*/}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-0 sm:rounded-3xl sm:p-4 md:flex-row md:p-5 sm:shadow-[0_4px_32px_rgba(15,23,42,0.06)]">
                {/* Image Display */}

                {galleryLoading && routeGalleryImages.length === 0 ? (
                    heroImageCandidates.length > 0 ? (
                        <div className="flex w-full flex-1 items-center justify-center rounded-2xl bg-slate-300 p-4 lg:flex-[3]">
                            <FallbackProductImage
                                candidates={heroImageCandidates}
                                alt={displayName}
                                className="max-h-[75vh] w-full object-contain opacity-90"
                            />
                        </div>
                    ) : (
                        <ProductDetailGallerySkeleton />
                    )
                ) : (
                <div className="flex w-full flex-col gap-3 lg:flex-[3] lg:flex-row lg:gap-4">

                    {/* Thumbnail Gallery — desktop sidebar */}
                    <div className="hidden lg:flex h-[75vh] w-fit flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-200 p-2">
                        {routeGalleryImages.map((imageUrl, key) => (
                            <button
                                type="button"
                                key={key}
                                onClick={() => setSelectedGalleryIndex(key)}
                                className={`flex h-[96px] w-[96px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 ${
                                    selectedGalleryIndex === key
                                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-200'
                                        : 'ring-1 ring-slate-300/70'
                                }`}
                            >
                                <img
                                    src={routeGalleryThumbnails[key] || imageUrl || "/imgs/page/product/img-gallery-1.jpg"}
                                    alt={`Product thumbnail ${key + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Main Image Display */}
                    <div className="flex w-full min-w-0 flex-1 flex-col">
                        <div className="relative flex h-[42vh] min-h-[220px] w-full items-center justify-center overflow-hidden rounded-none bg-slate-300 sm:rounded-2xl sm:h-[52vh] sm:min-h-[280px] lg:h-[75vh]">

                            {/* Zoomable Main Image — desktop hover zoom; tap opens gallery on mobile */}
                            <button
                                type="button"
                                aria-label="Open product image gallery"
                                className="relative h-full w-full overflow-hidden lg:cursor-crosshair"
                                onClick={() => openLightboxAtIndex(selectedGalleryIndex)}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onMouseMove={handleMouseMove}
                            >
                                <FallbackProductImage
                                    candidates={heroImageCandidates}
                                    alt={displayName}
                                    className={`h-full w-full object-contain transition-transform duration-300 max-lg:scale-100 ${
                                        isHovered ? "lg:scale-150" : "lg:scale-100"
                                    }`}
                                    style={{
                                        transformOrigin: `${position.x} ${position.y}`,
                                    }}
                                />
                                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white lg:hidden">
                                    Tap to zoom
                                </span>
                            </button>
                        </div>

                        {/* Mobile Thumbnail Navigation — below hero so taps are not blocked */}
                        {routeGalleryImages.length > 1 ? (
                            <div className="lg:hidden flex w-full gap-2 overflow-x-auto rounded-xl bg-slate-200 px-2 py-2">
                                {routeGalleryImages.map((imageUrl, key) => (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => setSelectedGalleryIndex(key)}
                                        className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ${selectedGalleryIndex === key ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-200' : 'ring-1 ring-slate-300/70'}`}
                                    >
                                        <img
                                            src={routeGalleryThumbnails[key] || imageUrl || "/imgs/page/product/img-gallery-1.jpg"}
                                            alt={`Product thumbnail ${key + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
                )}

                {/* Product Image ends */}
                <div className="flex w-full flex-col rounded-none px-3 py-4 sm:rounded-2xl sm:px-4 lg:flex-[4] lg:p-6 lg:pl-4">
                    {mainLoading && !preview ? (
                        <ProductDetailBuyBoxSkeleton />
                    ) : null}
                    {mainLoading && preview ? (
                        <div className="mb-5 space-y-4">
                            {(preview.discount_price || preview.price) ? (
                                <div className="flex items-end gap-3 rounded-2xl bg-slate-50/80 p-4">
                                    <p className="text-2xl lg:text-4xl font-bold text-primary">
                                        {formatCurrency(
                                            preview.discount_price ?? preview.price ?? ""
                                        )}
                                    </p>
                                    {preview.price &&
                                    preview.discount_price &&
                                    Number(preview.price) > Number(preview.discount_price) ? (
                                        <span className="line-through text-base lg:text-xl font-medium text-[#8c9ec5]">
                                            {formatCurrency(preview.price)}
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}
                            {preview.merchant?.store_name ? (
                                <p className="text-primary text-sm font-bold">
                                    <span className="text-[#8c9ec5] text-xs font-bold">by</span>{" "}
                                    {preview.merchant.store_name}
                                </p>
                            ) : null}
                            <ProductDetailBuyBoxSkeleton />
                        </div>
                    ) : null}
                    {!mainLoading ? (
                    <>
                    <ProductDetailMobileBuyBox
                        displayName={displayName}
                        product={product as ProductByIdResponse}
                        selectedVariants={selectedVariants}
                        onVariantSelect={handleVariantSelect}
                        inventoryUnavailable={inventoryUnavailable}
                        inventoryLow={inventoryLow}
                        stockStatus={stockStatus}
                        merchantCollectsNoticeSafe={merchantCollectsNoticeSafe}
                        siteSettings={siteSettings as Record<string, unknown> | null}
                        hasOutsideVicinityShippingCost={hasOutsideVicinityShippingCost}
                        outsideVicinityShippingCost={outsideVicinityShippingCost}
                        hasOutsideStateShippingCost={hasOutsideStateShippingCost}
                        outsideStateShippingCost={outsideStateShippingCost}
                        onWishList={handleWishList}
                        addToWishlistPendingProductId={addToWishlistPendingProductId}
                        onShare={handleShare}
                        onCopyLink={handleCopyLink}
                    />

                    <ProductDetailDesktopBuyBox
                        displayName={displayName}
                        product={product as ProductByIdResponse}
                        quantity={quantity}
                        onQuantityChange={handleQuantityChange}
                        selectedVariants={selectedVariants}
                        onVariantSelect={handleVariantSelect}
                        inventoryUnavailable={inventoryUnavailable}
                        inventoryLow={inventoryLow}
                        stockStatus={stockStatus}
                        merchantCollectsNoticeSafe={merchantCollectsNoticeSafe}
                        siteSettings={siteSettings as Record<string, unknown> | null}
                        hasOutsideVicinityShippingCost={hasOutsideVicinityShippingCost}
                        outsideVicinityShippingCost={outsideVicinityShippingCost}
                        hasOutsideStateShippingCost={hasOutsideStateShippingCost}
                        outsideStateShippingCost={outsideStateShippingCost}
                        onWishList={handleWishList}
                        addToWishlistPendingProductId={addToWishlistPendingProductId}
                        onAddToCart={() => handleAddToCart(product as ProductByIdResponse)}
                        addToCartPendingProductId={addToCartPendingProductId}
                        onShare={handleShare}
                        onCopyLink={handleCopyLink}
                    />
                    </>
                    ) : null}


                </div>
            </div>


            {/* Frequently Bought Together */}

            <div className="mt-4 rounded-2xl bg-white p-4 sm:mt-6 sm:rounded-3xl sm:p-6 sm:shadow-[0_4px_32px_rgba(15,23,42,0.06)]">
             {mainLoading ? (
                <ProductDetailTabsSkeleton />
             ) : product?.product?.id ? (
                <ProductInfo product={product} />
             ) : null}

             {relatedLoading ? (
                <ProductDetailRelatedSkeleton />
             ) : (
                <RelatedProduct product={product} />
             )}

            </div>
        </div>
        {!contactMerchantOnly && product?.product?.id ? (
            (() => {
                const stickyCartPid = product.product.id;
                const stickyCartBusy =
                    typeof stickyCartPid === "number" &&
                    addToCartPendingProductId === stickyCartPid;
                return (
                    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/98 backdrop-blur-md shadow-[0_-8px_32px_rgba(15,23,42,0.12)] lg:hidden pb-[env(safe-area-inset-bottom)]">
                        <div className="mx-auto flex max-w-[1320px] items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
                            <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className="flex h-11 w-10 items-center justify-center text-xl font-medium text-primary"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="min-w-[2rem] text-center text-base font-bold text-primary">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    className="flex h-11 w-10 items-center justify-center text-xl font-medium text-primary"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                type="button"
                                disabled={inventoryUnavailable || stickyCartBusy}
                                onClick={() => handleAddToCart(product as ProductByIdResponse)}
                                className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
                                    inventoryUnavailable || stickyCartBusy
                                        ? "cursor-not-allowed bg-primary/35 text-white"
                                        : "bg-primary text-white hover:bg-primary/90"
                                }`}
                            >
                                {stickyCartBusy ? (
                                    <InlineButtonSpinner className="h-4 w-4 text-white" />
                                ) : null}
                                {stickyCartBusy ? "Adding…" : "Add to cart"}
                            </button>
                        </div>
                    </div>
                );
            })()
        ) : null}
        <ProductGalleryLightbox
            open={lightboxOpen}
            imageCandidates={effectiveGalleryCandidates}
            initialIndex={lightboxIndex}
            onClose={closeLightbox}
            altPrefix={displayName}
        />
        {product?.product?.slug ? (
            <MerchantChatWidget
                productSlug={product.product.slug}
                productName={product.product.name}
                merchantStoreName={product.product.merchant?.store_name}
                stackAboveStickyFooter={!contactMerchantOnly && Boolean(product?.product?.id)}
            />
        ) : null}
    </AuthLayout>);
};

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async (context) => {
    const raw = context.params?.id;
    const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
    if (!slug) {
        context.res.statusCode = 404;
        return { props: { serverNotFound: true, serverShell: null } };
    }

    let serverShell: ProductDetailPreview | null = null;
    const apiRoot = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
        /\/+$/,
        ""
    );

    try {
        const res = await fetch(
            `${apiRoot}/products/detail/${encodeURIComponent(slug)}/gallery/`,
            {
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(8000),
            }
        );
        if (res.status === 404) {
            context.res.statusCode = 404;
            return { props: { serverNotFound: true, serverShell: null } };
        }
        if (res.ok) {
            const data = await res.json();
            serverShell = {
                slug: String(data.slug || slug),
                name: String(data.name || data.product?.name || "Product"),
                featured_image: data.product?.featured_image || data.product_images || [],
                contact_merchant_only: Boolean(data.product?.contact_merchant_only),
            };
        }
    } catch {
        /* Client section APIs resolve the rest; shell is a nice-to-have for webviews. */
    }

    return { props: { serverNotFound: false, serverShell } };
};

export default ProductPage;