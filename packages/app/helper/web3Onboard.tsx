import { ChainId, ChainIdHex, RPC_URLS } from "@popcorn/utils";
import CoinbaseWallet from "@web3-onboard/coinbase";
import gnosisModule from "@web3-onboard/gnosis";
import injected from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import walletConnect from "@web3-onboard/walletconnect";

export default function web3Onboard(): void {
  init({
    wallets: [walletConnect(), injected(), gnosisModule(), CoinbaseWallet()],
    chains: [
      {
        id: ChainIdHex.Ethereum,
        token: "ETH",
        label: "Ethereum Mainnet",
        rpcUrl: RPC_URLS[ChainId.Ethereum],
      },
      {
        id: ChainIdHex.Goerli,
        token: "rETH",
        label: "Ethereum Goerli Testnet",
        rpcUrl: RPC_URLS[ChainId.Goerli],
      },
      {
        id: ChainIdHex.Arbitrum,
        token: "AETH",
        label: "Arbitrum One",
        rpcUrl: RPC_URLS[ChainId.Arbitrum],
      },
      {
        id: ChainIdHex.Polygon,
        token: "MATIC",
        label: "Polygon Mainnet",
        rpcUrl: RPC_URLS[ChainId.Polygon],
      },
      {
        id: ChainIdHex.Mumbai,
        token: "MATIC",
        label: "Mumbai",
        rpcUrl: RPC_URLS[ChainId.Mumbai],
      },
      {
        id: ChainIdHex.BNB,
        token: "BNB",
        label: "BNB",
        rpcUrl: RPC_URLS[ChainId.BNB],
      },
      {
        id: ChainIdHex.Hardhat,
        token: "ETH",
        label: "Hardhat",
        rpcUrl: RPC_URLS[ChainId.Hardhat],
      },
      {
        id: ChainIdHex.Localhost,
        token: "ETH",
        label: "Localhost",
        rpcUrl: RPC_URLS[ChainId.Localhost],
      },
    ],
    appMetadata: {
      name: "Popcorn",
      icon: "<svg></svg>",
      description: "DeFi for the People",
    },
    accountCenter: {
      desktop: { enabled: false },
    },
  });
}
