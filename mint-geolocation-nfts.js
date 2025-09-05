const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// Sample geolocation NFTs with specific coordinates
// You can replace these with your actual location coordinates
const geolocationNFTs = [
  {
    name: "Mumbai Local NFT",
    description: "Exclusive NFT only available in Mumbai area",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    attributes: "mumbai, local, exclusive, geolocation",
    latitude: 19.0760,  // Mumbai coordinates
    longitude: 72.8777,
    radius: 50000  // 50km radius
  },
  {
    name: "Delhi Special NFT",
    description: "Special NFT for Delhi residents only",
    image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=400&fit=crop",
    attributes: "delhi, special, exclusive, geolocation",
    latitude: 28.7041,  // Delhi coordinates
    longitude: 77.1025,
    radius: 50000  // 50km radius
  },
  {
    name: "Bangalore Tech NFT",
    description: "Tech-themed NFT for Bangalore area",
    image_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop",
    attributes: "bangalore, tech, exclusive, geolocation",
    latitude: 12.9716,  // Bangalore coordinates
    longitude: 77.5946,
    radius: 50000  // 50km radius
  }
];

// Function to create geolocation metadata
async function createGeolocationMetadata(nftData) {
  try {
    console.log(`Creating geolocation metadata for: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/metadata/create`, {
      metadata: {
        collection_id: 1, // Assuming collection ID 1 exists in DB
        title: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        price: 0
      }
    });

    console.log(`✅ Successfully created metadata for: ${nftData.name}`);
    console.log(`Metadata ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create metadata for ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Function to mint a geolocation NFT
async function mintGeolocationNFT(nftData, metadataId) {
  try {
    console.log(`Minting geolocation NFT: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/sui/mint-nft`, {
      collection_id: COLLECTION_ID,
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      attributes: nftData.attributes.split(',').map(attr => attr.trim()),
      recipient: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290", // Mint to collection
      metadata_id: metadataId,
      latitude: nftData.latitude,
      longitude: nftData.longitude,
      radius: nftData.radius
    });

    console.log(`✅ Successfully minted: ${nftData.name}`);
    console.log(`NFT ID: ${response.data.nft_id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to mint ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Main function to create all geolocation NFTs
async function createAllGeolocationNFTs() {
  console.log('🌍 Starting to create geolocation NFTs...\n');

  const results = [];

  for (let i = 0; i < geolocationNFTs.length; i++) {
    const nft = geolocationNFTs[i];
    console.log(`\n--- Creating NFT ${i + 1}/3 ---`);

    // First create the metadata
    const metadata = await createGeolocationMetadata(nft);
    if (metadata) {
      // Then mint the NFT with the metadata
      const result = await mintGeolocationNFT(nft, metadata.id);
      results.push(result);
    } else {
      results.push(null);
    }

    // Wait a bit between creations
    if (i < geolocationNFTs.length - 1) {
      console.log('Waiting 3 seconds before next creation...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🎉 Geolocation NFT creation complete!');
  console.log(`Successfully created: ${results.filter(r => r !== null).length}/3 NFTs`);

  const successfulCreations = results.filter(r => r !== null);
  if (successfulCreations.length > 0) {
    console.log('\nCreated NFTs:');
    successfulCreations.forEach((result, index) => {
      console.log(`${index + 1}. ${geolocationNFTs[index].name} - Location: ${geolocationNFTs[index].latitude}, ${geolocationNFTs[index].longitude}`);
    });
  }
}

// Run the script
if (require.main === module) {
  createAllGeolocationNFTs().catch(console.error);
}

module.exports = { createGeolocationMetadata, mintGeolocationNFT, createAllGeolocationNFTs };
