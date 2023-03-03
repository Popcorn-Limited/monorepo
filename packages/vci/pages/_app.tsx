import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";

import { Roboto } from "@next/font/google";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";

const { provider, chains } = configureChains([goerli], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "app.pop.network",
  chains,
});

const client = createClient({
  autoConnect: false,
  provider,
  connectors,
});

const nextFont = Roboto({
  weight: ["400", "700", "900"],
  subsets: [],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={nextFont.className}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root [data-rk] {
              --rk-radii-modal: 1rem;
            }
            [data-rk] * {
              font-family: ${nextFont.style.fontFamily} !important;
            }
          `,
        }}
      />
      <Toaster />
      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains} modalSize="compact">
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </main>
  );
}
