import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultWallets, Chain } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SingleActionModalContainer } from "@popcorn/components/components/Modal/SingleActionModalContainer";
import { StateProvider } from "@popcorn/components/context/store";
import { NetworthContextProvider } from "../context/Networth";

const bnb: Chain = {
  id: 56,
  name: "BNB Chain",
  network: "bnb",
  iconUrl: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png?1547034615",
  rpcUrls: { default: "https://bsc-dataseed1.binance.org" },
  blockExplorers: { default: { name: "BSCScan", url: "https://bscscan.com" } },
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.arbitrum,
    bnb,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [chain.goerli, chain.localhost] : []),
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
    }),
    infuraProvider({
      apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID as string,
    }),
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "Popcorn",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const { title, description, socialShareImage } = {
  title: "Popcorn - Yield That Counts",
  description: "Popcorn is a regenerative yield optimizing protocol.",
  socialShareImage: "https://www.popcorn.network/images/social_cover_image.png",
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <StateProvider>
          <NetworthContextProvider>
            <SingleActionModalContainer />
            <Component {...pageProps} />
          </NetworthContextProvider>
        </StateProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
