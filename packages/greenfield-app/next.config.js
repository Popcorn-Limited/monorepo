const { join } = require("path");
require("../utils/src/envLoader");

const workspace = join(__dirname, "..");

module.exports = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
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
  async redirects() {
    return [
      {
        source: "/ethereum/staking",
        destination: `/staking`,
        permanent: true,
      },
      {
        source: "/polygon/staking",
        destination: `/staking`,
        permanent: true,
      },
      {
        source: "/ethereum/rewards",
        destination: `/rewards`,
        permanent: true,
      },
      {
        source: "/polygon/rewards",
        destination: `/rewards`,
        permanent: true,
      },
      {
        source: "/ethereum",
        destination: `/`,
        permanent: true,
      },
      {
        source: "/polygon",
        destination: `/`,
        permanent: true,
      },
    ];
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
