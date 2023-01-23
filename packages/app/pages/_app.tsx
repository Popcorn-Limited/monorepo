import Page from "@popcorn/app/components/Common/Page";
import { DualActionModalContainer } from "@popcorn/components/components/Modal/DualActionModalContainer";
import { MultiChoiceActionModalContainer } from "@popcorn/components/components/Modal/MultiChoiceActionModalContainer";
import { SingleActionModalContainer } from "@popcorn/components/components/Modal/SingleActionModalContainer";
import OfacCheck from "@popcorn/app/components/OfacCheck";
import { FeatureToggleProvider } from "@popcorn/components/context/FeatureToggleContext";
import Head from "next/head";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { StateProvider } from "@popcorn/components/context/store";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import "@popcorn/app/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import TagManager from "react-gtm-module";

const bnb = {
  id: 56,
  name: "BNB Chain",
  network: "bnb",
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
      // This is Alchemy's default API key.
      // You can get your own at https://dashboard.alchemyapi.io
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: "Sweet Caramel",
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

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const getLayout =
    Component.getLayout ||
    (() => (
      <Page>
        <Component {...pageProps} />
      </Page>
    ));
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GTM_ID) {
      TagManager.initialize({
        gtmId: process.env.NEXT_PUBLIC_GTM_ID,
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    Router.events.on("routeChangeStart", () => {
      setLoading(true);
    });
    Router.events.on("routeChangeComplete", () => {
      setLoading(false);
    });
    Router.events.on("routeChangeError", () => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="description" content={description} />

        {/*  Facebook Meta Tags */}
        <meta property="og:url" content="https://popcorn.network/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={socialShareImage} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="popcorn.network" />
        <meta property="twitter:url" content="https://popcorn.network/" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialShareImage} />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Head>
      <StateProvider>
        <FeatureToggleProvider>
          <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
              <OfacCheck />
              <SingleActionModalContainer />
              <MultiChoiceActionModalContainer />
              <DualActionModalContainer />
              {getLayout(<Component {...pageProps} />)}
            </RainbowKitProvider>
          </WagmiConfig>
        </FeatureToggleProvider>
      </StateProvider>
    </React.Fragment>
  );
}
