const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';

// Function to get all metadata for collection 1
async function getAllMetadata() {
  try {
    const response = await axios.get(`${API_BASE_URL}/platform/metadata/by-collection`, {
      params: { collection_id: 1 }
    });
    
    return response.data.metadata_instances || [];
  } catch (error) {
    console.error('Error fetching metadata:', error.response?.data || error.message);
    return [];
  }
}

// Function to delete metadata by ID using the correct format
async function deleteMetadata(metadataId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/platform/metadata/delete`, {
      params: { id: metadataId }
    });
    
    console.log(`✅ Deleted metadata ID ${metadataId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete metadata ID ${metadataId}:`, error.response?.data || error.message);
    return false;
  }
}

// Function to create clean geolocation metadata
async function createCleanGeolocationMetadata(nftData) {
  try {
    console.log(`Creating clean metadata for: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/metadata/create`, {
      metadata: {
        collection_id: 1,
        title: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        price: 0
      }
    });

    console.log(`✅ Successfully created clean metadata for: ${nftData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create metadata for ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Clean geolocation NFTs data
const cleanGeolocationNFTs = [
  {
    name: "Mumbai Local NFT",
    description: "Exclusive NFT only available in Mumbai area",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    attributes: "mumbai, local, exclusive, geolocation"
  },
  {
    name: "Delhi Special NFT", 
    description: "Special NFT for Delhi residents only",
    image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=400&fit=crop",
    attributes: "delhi, special, exclusive, geolocation"
  },
  {
    name: "Bangalore Tech NFT",
    description: "Tech-themed NFT for Bangalore area", 
    image_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop",
    attributes: "bangalore, tech, exclusive, geolocation"
  }
];

// Main cleanup function
async function cleanupAndRecreate() {
  console.log('🧹 Starting complete cleanup and recreation...\n');
  
  // Step 1: Get all current metadata
  const allMetadata = await getAllMetadata();
  
  if (allMetadata.length === 0) {
    console.log('No metadata found, creating fresh geolocation NFTs...');
  } else {
    console.log(`Found ${allMetadata.length} existing metadata entries to clean up`);
    
    // Step 2: Delete all existing metadata
    console.log('\n🗑️  Deleting all existing metadata...');
    for (const metadata of allMetadata) {
      await deleteMetadata(metadata.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Step 3: Create clean geolocation NFTs
  console.log('\n✨ Creating clean geolocation NFTs...');
  for (const nftData of cleanGeolocationNFTs) {
    await createCleanGeolocationMetadata(nftData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Cleanup and recreation complete!');
  console.log('Now you should only see 3 clean geolocation NFTs without duplicates.');
}

// Run the cleanup
if (require.main === module) {
  cleanupAndRecreate().catch(console.error);
}

module.exports = { cleanupAndRecreate };
