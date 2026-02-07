/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hash-collect.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sui-hashcase-images.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "client-uploads.nyc3.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "chocolate-certain-cockroach-300.mypinata.cloud",
        pathname: "/**",
      },
      // Add this entry for Pinata gateway
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/**",
      },
      {
      protocol: "https",
      hostname: "metadata-hashcase-admin.s3.us-east-2.amazonaws.com",
      pathname: "/**",
    },
    {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "lime-occasional-angelfish-940.mypinata.cloud",
    pathname: "/**",
  },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/minter/filecoin",
          destination: "https://filecoin.hashcase.co/minter/filecoin",
        },
        {
          source: "/minter/filecoin/:path*",
          destination: "https://filecoin.hashcase.co/minter/filecoin/:path*",
        },
      ],
    };
  },
};

export default nextConfig;