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
  {
    protocol: "https",
    hostname: "imgs.search.brave.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "www.google.com",
    pathname: "/**",
  },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/minter/filecoin",
          destination: "http://localhost:3002/minter/filecoin",
        },
        {
          source: "/minter/filecoin/:path*",
          destination: "http://localhost:3002/minter/filecoin/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/examples/ip-royalties",
          destination: "https://ip-royalties.vercel.app/examples/ip-royalties",
        },
        {
          source: "/examples/ip-royalties/:path*",
          destination: "https://ip-royalties.vercel.app/examples/ip-royalties/:path*",
        },
      ],
    };
  },
};

export default nextConfig;