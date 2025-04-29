import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css';
import 'sweetalert2/src/sweetalert2.scss'
import type { AppProps } from "next/app";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, store} from "@/store/store";
import {Provider} from "react-redux";
import {ToastContainer} from "react-toastify";
import { Toaster } from 'sonner'

export default function App({ Component, pageProps }: AppProps) {
  return <PersistGate persistor={persistor}>
    <Provider store={store}>
        <Component {...pageProps} />
        <ToastContainer/>
        <Toaster/>
    </Provider>
  </PersistGate>

}
