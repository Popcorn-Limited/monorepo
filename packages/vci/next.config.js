/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.furucombo.app", "cryptologos.cc", "forum.popcorn.network"],
  },
};

module.exports = nextConfig;
