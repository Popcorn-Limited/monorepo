/** @type {import('next').NextConfig} */

const { join } = require("path");
require("../utils/src/envLoader");

const workspace = join(__dirname, "..");

const nextConfig = {
  env: {
    APP_ENV: process.env.APP_ENV,
  },
  reactStrictMode: true,
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

module.exports = nextConfig;
