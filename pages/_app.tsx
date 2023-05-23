import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppCheck } from "@/helpers/firebase";

export default function App({ Component, pageProps }: AppProps) {
  useAppCheck();

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss={false}
        transition={Flip}
        draggable={false}
        pauseOnHover
        toastClassName={() => "rounded-md bg-gray-100 text-gray-900 text-center p-0 my-3 cursor-default shadow-xl"}
      />
    </>
  );
}
