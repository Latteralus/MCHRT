/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // If you decide to adopt the new app directory in the future, enable the following:
    // experimental: {
    //   appDir: true,
    // },
    images: {
      domains: ['via.placeholder.com'], // Update this array with your allowed image domains
    },
    webpack: (config, { isServer }) => {
      // Extend webpack configuration here if necessary
      return config;
    },
  };
  
  module.exports = nextConfig;
  