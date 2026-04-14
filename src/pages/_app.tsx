import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css";
import "sweetalert2/src/sweetalert2.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store/store";
import { Provider, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { checkTokenValidity, clearAllStorage } from "@/util";
import { clearAuthState } from "@/redux/auth/authSlice";
import {
  getAllCategories,
  syncLocalCartFromStorage,
} from "@/redux/product/productSlice";
import { getSiteSettings } from "@/redux/general/generalSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hook/useReduxTypes";
import LaunchPage from "@/components/LaunchPage";
import SiteSettingsPreloader from "@/components/SiteSettingsPreloader";
import {
  STOREFRONT_PREVIEW_LS_KEY,
  STOREFRONT_PREVIEW_URL_PARAM,
} from "@/lib/storefrontPreview";
import { clearLocalRecentlyViewedProducts, getLocalRecentlyViewedProductIds } from "@/lib/recentlyViewed";
import productService from "@/redux/product/productService";

const LAUNCH_CONFETTI_FLAG = "hawola_launch_confetti";

function AppContent({ Component, pageProps }: AppProps) {
  const dispatch = useAppDispatch();
  const siteSettings = useSelector((state: RootState) => state.general.siteSettings);
  const siteSettingsLoaded = useSelector((state: RootState) => state.general.siteSettingsLoaded);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [showLaunchConfetti, setShowLaunchConfetti] = useState(false);
  const [confettiPieces] = useState(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.9}s`,
      duration: `${2.8 + Math.random() * 2.2}s`,
      size: `${6 + Math.random() * 8}px`,
      rotate: `${Math.random() * 360}deg`,
      color: ["#FD9636", "#5BC694", "#425A8B", "#FFB067", "#8C9EC5"][i % 5],
      opacity: 0.75 + Math.random() * 0.25,
    }))
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const preview = params.get(STOREFRONT_PREVIEW_URL_PARAM);
      if (preview) {
        localStorage.setItem(STOREFRONT_PREVIEW_LS_KEY, preview);
        params.delete(STOREFRONT_PREVIEW_URL_PARAM);
        const q = params.toString();
        const next =
          window.location.pathname +
          (q ? `?${q}` : "") +
          window.location.hash;
        window.history.replaceState({}, "", next);
      }
    }
    dispatch(getSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    const syncRecentlyViewed = async () => {
      if (!isAuthenticated) return;
      const ids = getLocalRecentlyViewedProductIds(20);
      if (ids.length === 0) return;
      try {
        await productService.syncRecentlyViewedProducts(ids);
        clearLocalRecentlyViewedProducts();
      } catch {
        // Non-blocking; try on next app load/login.
      }
    };
    void syncRecentlyViewed();
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined" || !siteSettingsLoaded) return;
    const shouldBurst = window.sessionStorage.getItem(LAUNCH_CONFETTI_FLAG) === "1";
    if (!shouldBurst) return;
    window.sessionStorage.removeItem(LAUNCH_CONFETTI_FLAG);
    setShowLaunchConfetti(true);
    const timer = window.setTimeout(() => setShowLaunchConfetti(false), 5200);
    return () => window.clearTimeout(timer);
  }, [siteSettingsLoaded]);

  useEffect(() => {
    // Check if tokens exist on app initialization
    if (!checkTokenValidity()) {
      // Clear all storage and reset auth state if no valid tokens
      clearAllStorage();
      dispatch(clearAuthState());
    }
    
    // Sync cart from localStorage on app start
    dispatch(syncLocalCartFromStorage());
    // Categories for header mega-menu / mobile nav on every route (not only home)
    dispatch(getAllCategories());

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the default browser error handling
      event.preventDefault();
      // You can also show a toast or log to an error reporting service here
    };

    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
      // Prevent the default browser error handling
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [dispatch]);

  // Only show launch page when API has returned and explicitly says under construction (false by default until API returns true)
  const dateTimeTill = siteSettings
    ? (siteSettings.date_time_till ?? (siteSettings as Record<string, unknown>).dateTimeTill)
    : null;
  const launchCountdownActive =
    typeof dateTimeTill === "string" &&
    dateTimeTill.trim() !== "" &&
    new Date(dateTimeTill).getTime() > Date.now();
  const showLaunchPage =
    siteSettingsLoaded &&
    siteSettings?.site_under_construction === true &&
    launchCountdownActive;

  // Auto-refresh exactly when launch countdown ends so storefront goes live without manual reload.
  useEffect(() => {
    if (!showLaunchPage || typeof dateTimeTill !== "string" || typeof window === "undefined") {
      return;
    }
    const targetMs = new Date(dateTimeTill).getTime();
    if (!Number.isFinite(targetMs)) return;
    const delay = targetMs - Date.now() + 250;
    if (delay <= 0) {
      window.sessionStorage.setItem(LAUNCH_CONFETTI_FLAG, "1");
      window.location.reload();
      return;
    }
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(LAUNCH_CONFETTI_FLAG, "1");
      window.location.reload();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [showLaunchPage, dateTimeTill]);

  // Show loader with blur until site settings check has finished (prevents flashing the site before under-construction is known)
  if (!siteSettingsLoaded) {
    return <SiteSettingsPreloader />;
  }

  if (showLaunchPage && siteSettings) {
    return (
      <>
        <Head>
          <title>{siteSettings.app_name || "Hawola"} | Coming Soon</title>
        </Head>
        <LaunchPage siteSettings={siteSettings} />
      </>
    );
  }

  const defaultTitle = siteSettings?.app_name
    ? String(siteSettings.app_name)
    : "Hawola";
  const defaultDesc =
    (siteSettings?.seo_site_default_description as string)?.trim() ||
    (siteSettings?.app_slogan as string)?.trim() ||
    "";
  const defaultRobots =
    (siteSettings?.seo_default_robots as string)?.trim() || "index,follow";
  const canonicalBase =
    (siteSettings?.seo_canonical_base_url as string)?.replace(/\/+$/, "") ||
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "")) ||
    "";

  return (
    <>
      <Head>
        <title>{defaultTitle}</title>
        {defaultDesc ? (
          <meta name="description" content={defaultDesc.slice(0, 320)} />
        ) : null}
        {(siteSettings?.seo_site_default_keywords as string)?.trim() ? (
          <meta
            name="keywords"
            content={String(siteSettings?.seo_site_default_keywords).slice(0, 512)}
          />
        ) : null}
        <meta name="robots" content={defaultRobots} />
        {canonicalBase ? <link rel="canonical" href={canonicalBase} /> : null}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={defaultTitle} />
        {defaultDesc ? (
          <meta property="og:description" content={defaultDesc.slice(0, 320)} />
        ) : null}
        {siteSettings?.app_name ? (
          <meta property="og:site_name" content={String(siteSettings?.app_name)} />
        ) : null}
        {(siteSettings?.seo_og_locale as string)?.trim() ? (
          <meta property="og:locale" content={String(siteSettings?.seo_og_locale)} />
        ) : (
          <meta property="og:locale" content="en_US" />
        )}
        {canonicalBase ? <meta property="og:url" content={canonicalBase} /> : null}
        {(siteSettings?.logo as { full_size?: string })?.full_size ? (
          <meta
            property="og:image"
            content={String((siteSettings?.logo as { full_size?: string }).full_size)}
          />
        ) : null}
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
      <Toaster position={"top-right"} />
      {showLaunchConfetti ? (
        <>
          <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden>
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="absolute top-[-20px] inline-block launch-confetti-piece"
                style={{
                  left: piece.left,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  opacity: piece.opacity,
                  transform: `rotate(${piece.rotate})`,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                }}
              />
            ))}
          </div>
          <style jsx global>{`
            @keyframes launchConfettiFall {
              0% { transform: translate3d(0, -20px, 0) rotate(0deg); }
              100% { transform: translate3d(0, 110vh, 0) rotate(720deg); }
            }
            .launch-confetti-piece {
              animation-name: launchConfettiFall;
              animation-timing-function: linear;
              animation-fill-mode: forwards;
              border-radius: 2px;
            }
          `}</style>
        </>
      ) : null}
    </>
  );
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <PersistGate persistor={persistor}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <Provider store={store}>
        <AppContent
          Component={Component}
          pageProps={pageProps}
          router={router}
        />
      </Provider>
      </GoogleOAuthProvider>
    </PersistGate>
  );
}
