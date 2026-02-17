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
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store/store";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { checkTokenValidity, clearAllStorage } from "@/util";
import { clearAuthState } from "@/redux/auth/authSlice";
import { syncLocalCartFromStorage } from "@/redux/product/productSlice";

function AppContent({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch();

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

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <AppContent
          Component={Component}
          pageProps={pageProps}
          router={router}
        />
      </Provider>
    </PersistGate>
  );
}
