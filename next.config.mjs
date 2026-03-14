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
        {
          source: "/examples/digital-twins",
          destination: "https://digital-twins-red.vercel.app/examples/digital-twins",
        },
        {
          source: "/examples/digital-twins/:path*",
          destination: "https://digital-twins-red.vercel.app/examples/digital-twins/:path*",
        },
        {
          source: "/examples/governance-dao",
          destination: "https://governance-dao-nu.vercel.app/examples/governance-dao",
        },
        {
          source: "/examples/governance-dao/:path*",
          destination: "https://governance-dao-nu.vercel.app/examples/governance-dao/:path*",
        },
        {
          source: "/examples/tokenized-real-estate",
          destination: "https://tokenized-real-estate-nine.vercel.app/examples/tokenized-real-estate",
        },
        {
          source: "/examples/tokenized-real-estate/:path*",
          destination: "https://tokenized-real-estate-nine.vercel.app/examples/tokenized-real-estate/:path*",
        },
        {
          source: "/examples/tokenized-data",
          destination: "https://tokenized-data.vercel.app/examples/tokenized-data",
        },
        {
          source: "/examples/tokenized-data/:path*",
          destination: "https://tokenized-data.vercel.app/examples/tokenized-data/:path*",
        },
        {
          source: "/examples/medical-records",
          destination: "https://medical-records-pi.vercel.app/examples/medical-records",
        },
        {
          source: "/examples/medical-records/:path*",
          destination: "https://medical-records-pi.vercel.app/examples/medical-records/:path*",
        },
        {
          source: "/examples/luxury-passport",
          destination: "https://luxury-passport-sigma.vercel.app/examples/luxury-passport",
        },
        {
          source: "/examples/luxury-passport/:path*",
          destination: "https://luxury-passport-sigma.vercel.app/examples/luxury-passport/:path*",
        },
        {
          source: "/examples/edu-cred",
          destination: "https://edu-cred-delta.vercel.app/examples/edu-cred",
        },
        {
          source: "/examples/edu-cred/:path*",
          destination: "https://edu-cred-delta.vercel.app/examples/edu-cred/:path*",
        },
        {
          source: "/examples/fan-tokens",
          destination: "https://fan-token-nu.vercel.app/examples/fan-tokens",
        },
        {
          source: "/examples/fan-tokens/:path*",
          destination: "https://fan-token-nu.vercel.app/examples/fan-tokens/:path*",
        },
        {
          source: "/examples/ecommerce",
          destination: "https://ecommerce-demo-tau-ruby.vercel.app/examples/ecommerce",
        },
        {
          source: "/examples/ecommerce/:path*",
          destination: "https://ecommerce-demo-tau-ruby.vercel.app/examples/ecommerce/:path*",
        },
      ],
    };
  },
};

export default nextConfig;