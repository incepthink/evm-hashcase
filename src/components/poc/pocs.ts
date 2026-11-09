export type Poc = {
  slug: string;
  name: string;
  category: string;
  description: string;
  youtubeId?: string;
  poster?: string;
};

/** Every POC is served from its own Vercel project via the /examples/* rewrites in next.config.mjs. */
export const POCS: Poc[] = [
  {
    slug: "ip-royalties",
    name: "IP Royalties",
    category: "Finance",
    description: "License intellectual property to manufacturers and track every royalty payment on-chain.",
    youtubeId: "lOtwarufpPw",
    poster: "/posters/IP-Royalties.png",
  },
  {
    slug: "digital-twins",
    name: "Digital Twins",
    category: "Asset management",
    description: "Tokenized digital twins of physical artworks, with provenance and resale history.",
    youtubeId: "NwgcHfEfDVA",
    poster: "/posters/Digital-Twins.png",
  },
  {
    slug: "governance-dao",
    name: "Governance DAO",
    category: "Governance",
    description: "Proposals, voting windows and results for a token-governed organisation.",
    youtubeId: "kwoxfB1kT_U",
    poster: "/posters/Governance-DAO.png",
  },
  {
    slug: "tokenized-real-estate",
    name: "Tokenized Real Estate",
    category: "Real estate",
    description: "Fractional property ownership: browse listings, buy shares and track a portfolio.",
    youtubeId: "-t5r-X8VOZo",
    poster: "/posters/Tokenized-RealEstate.png",
  },
  {
    slug: "tokenized-data",
    name: "Tokenized Data",
    category: "Data",
    description: "Mint documents as data assets, then grant, sign for and revoke viewer access.",
    youtubeId: "utI_zBHxeag",
    poster: "/posters/Tokenized-asset-management.png",
  },
  {
    slug: "medical-records",
    name: "Medical Records",
    category: "Healthcare",
    description: "Hospitals issue records, patients own them and doctors view them with consent.",
    youtubeId: "7EiEA_tzlp0",
  },
  {
    slug: "luxury-passport",
    name: "Luxury Passport",
    category: "Authenticity",
    description: "A certificate of authenticity for every luxury item, carried from owner to owner.",
    youtubeId: "WgnAoOLonwY",
    poster: "/posters/luxury-passport.png",
  },
  {
    slug: "edu-cred",
    name: "Edu Cred",
    category: "Education",
    description: "Institutes issue verifiable records and letters; students share them with employers.",
  },
  {
    slug: "fan-tokens",
    name: "Fan Tokens",
    category: "Community",
    description: "Artists run fan pages with tasks that reward their community in tokens.",
    youtubeId: "jIhRirRMmT4",
    poster: "/posters/Fan-Tokens.png",
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    category: "Commerce",
    description: "A storefront with cart, checkout, order history and shipment tracking.",
  },
  {
    slug: "chog",
    name: "Chog",
    category: "Gaming",
    description: "An arcade crossing game whose every move is relayed on-chain.",
  },
  {
    slug: "safty",
    name: "SAFTY",
    category: "Token sales",
    description: "Discover SAFT deals, buy and sell allocations and follow positions.",
    youtubeId: "Nq5-HvDm1yM",
  },
];
