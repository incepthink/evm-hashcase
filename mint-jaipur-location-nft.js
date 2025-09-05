const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://api.hashcase.co';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// Jaipur location NFT for your coordinates
const jaipurNFT = {
  name: "Jaipur Pink City NFT",
  description: "Exclusive NFT only available in Jaipur area - The Pink City of India",
  image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
  attributes: "jaipur, pink city, exclusive, geolocation, rajasthan",
  latitude: 26.913600,  // Your coordinates
  longitude: 75.785800,
  radius: 10000  // 10km radius around your location
};

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

// Main function to create the Jaipur location NFT
async function createJaipurLocationNFT() {
  console.log('🌍 Starting to create Jaipur location NFT...\n');
  console.log(`📍 Location: ${jaipurNFT.latitude}, ${jaipurNFT.longitude} (Jaipur, Rajasthan)`);
  console.log(`🎯 Radius: ${jaipurNFT.radius}m (${jaipurNFT.radius/1000}km)\n`);

  // First create the metadata
  console.log('📝 Step 1: Creating metadata...');
  const metadata = await createGeolocationMetadata(jaipurNFT);
  
  if (metadata) {
    console.log('\n🪙 Step 2: Minting NFT...');
    // Then mint the NFT with the metadata
    const result = await mintGeolocationNFT(jaipurNFT, metadata.id);
    
    if (result) {
      console.log('\n🎉 Jaipur location NFT created successfully!');
      console.log(`📍 Location: ${jaipurNFT.latitude}, ${jaipurNFT.longitude}`);
      console.log(`🎯 Radius: ${jaipurNFT.radius}m`);
      console.log(`🆔 NFT ID: ${result.nft_id}`);
      console.log(`📝 Metadata ID: ${metadata.id}`);
      
      console.log('\n✨ Now when you enable location on the collection page, you should see this NFT!');
    } else {
      console.log('\n❌ Failed to mint the NFT');
    }
  } else {
    console.log('\n❌ Failed to create metadata');
  }
}

// Run the script
if (require.main === module) {
  createJaipurLocationNFT().catch(console.error);
}

module.exports = { createGeolocationMetadata, mintGeolocationNFT, createJaipurLocationNFT };
