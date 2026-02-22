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
import { useEffect } from "react";
import { checkTokenValidity, clearAllStorage } from "@/util";
import { clearAuthState } from "@/redux/auth/authSlice";
import { syncLocalCartFromStorage } from "@/redux/product/productSlice";
import { getSiteSettings } from "@/redux/general/generalSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hook/useReduxTypes";
import LaunchPage from "@/components/LaunchPage";

function AppContent({ Component, pageProps }: AppProps) {
  const dispatch = useAppDispatch();
  const siteSettings = useSelector((state: RootState) => state.general.siteSettings);
  const siteSettingsLoaded = useSelector((state: RootState) => state.general.siteSettingsLoaded);

  useEffect(() => {
    dispatch(getSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    // Check if tokens exist on app initialization
    if (!checkTokenValidity()) {
      // Clear all storage and reset auth state if no valid tokens
      clearAllStorage();
      dispatch(clearAuthState());
    }
    
    // Sync cart from localStorage on app start
    dispatch(syncLocalCartFromStorage());

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
  const showLaunchPage =
    siteSettingsLoaded &&
    siteSettings?.site_under_construction === true &&
    dateTimeTill;

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

  return (
    <>
      <Head>
        <title>Hawola</title>
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
      <Toaster position={"top-right"} />
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
