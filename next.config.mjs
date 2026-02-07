/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    //to fix issues with fs in client components
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
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
    return [
      {
        source: "/minter/filecoin",
        destination: "https://filecoin.hashcase.co/minter/filecoin",
      },
      {
        source: "/minter/filecoin/:path*",
        destination: "https://filecoin.hashcase.co/minter/filecoin/:path*",
      },
    ];
  },
};

export default nextConfig;