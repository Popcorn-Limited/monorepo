/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.furucombo.app", "cryptologos.cc", "forum.popcorn.network"],
  },
  env: {
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
  },
};

module.exports = nextConfig;
