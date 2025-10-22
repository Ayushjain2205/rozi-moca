import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MocaProvider } from "@/contexts/MocaContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MocaProvider>
      <Component {...pageProps} />
    </MocaProvider>
  );
}
