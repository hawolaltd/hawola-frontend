import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css";
import "sweetalert2/src/sweetalert2.scss";
import type { AppProps } from "next/app";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store/store";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { checkTokenValidity, clearAllStorage } from "@/util";
import { clearAuthState } from "@/redux/auth/authSlice";

function AppContent({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if tokens exist on app initialization
    if (!checkTokenValidity()) {
      // Clear all storage and reset auth state if no valid tokens
      clearAllStorage();
      dispatch(clearAuthState());
    }
  }, [dispatch]);

  return (
    <>
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
