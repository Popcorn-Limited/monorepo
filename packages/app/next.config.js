const { join } = require("path");
require("../utils/src/envLoader");

const workspace = join(__dirname, "..");

const ChainId = {
  1: "ethereum",
  4: "rinkeby",
  42161: "arbitrum",
  80001: "mumbai",
  137: "polygon",
  1337: "localhost",
  31337: "hardhat",
  56: "bnb",
};
const defaultChain = ChainId[Number(process.env.CHAIN_ID)];

module.exports = {
  reactStrictMode: true,
  env: {
    RPC_URL: process.env.RPC_URL,
    CHAIN_ID: process.env.CHAIN_ID,
    APP_ENV: process.env.APP_ENV,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  },
  images: {
    domains: ["rawcdn.githack.com"],
  },
  poweredByHeader: false,
  webpack: (config, options) => {
    /** Allows import modules from packages in workspace. */
    //config.externals = { ...config.externals, electron: 'electron' };
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [workspace],
          exclude: /node_modules/,
          use: options.defaultLoaders.babel,
        },
      ],
    };
    return config;
  },
};
