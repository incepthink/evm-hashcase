const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// Function to get all NFTs from the collection
async function getAllNFTs() {
  try {
    const response = await axios.get(`${API_BASE_URL}/platform/sui/nfts/by-collection`, {
      params: { collection_id: COLLECTION_ID }
    });
    
    if (response.data.success && response.data.data && response.data.data.nfts) {
      return response.data.data.nfts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching NFTs:', error.response?.data || error.message);
    return [];
  }
}

// Function to hide an NFT by updating its metadata
async function hideNFT(nftId, nftName) {
  try {
    console.log(`🚫 Hiding NFT: ${nftName} (${nftId})`);
    
    // Update the NFT to be hidden by changing its name/description
    const response = await axios.post(`${API_BASE_URL}/platform/sui/update-nft`, {
      nft_id: nftId,
      collection_id: COLLECTION_ID,
      name: `HIDDEN_${nftName}`,
      description: "This NFT has been hidden",
      image_url: "https://via.placeholder.com/300x300/000000/FFFFFF?text=HIDDEN"
    });
    
    console.log(`✅ Successfully hidden NFT: ${nftName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to hide NFT ${nftName}:`, error.response?.data || error.message);
    return false;
  }
}

// Function to hide location-specific NFTs
async function hideLocationNFTs() {
  console.log('🚫 Starting to hide location-specific NFTs...\n');
  
  // Get all NFTs
  const allNFTs = await getAllNFTs();
  
  if (allNFTs.length === 0) {
    console.log('No NFTs found');
    return;
  }
  
  // Filter only location-specific NFTs
  const locationNFTs = allNFTs.filter(nft => {
    const name = nft.name?.toLowerCase() || '';
    const description = nft.description?.toLowerCase() || '';
    
    return name.includes('delhi') || 
           name.includes('mumbai') || 
           name.includes('bangalore') ||
           description.includes('delhi') ||
           description.includes('mumbai') ||
           description.includes('bangalore') ||
           name.includes('local') ||
           name.includes('special') ||
           name.includes('tech');
  });
  
  if (locationNFTs.length === 0) {
    console.log('No location-specific NFTs found to hide');
    return;
  }
  
  console.log(`Found ${locationNFTs.length} location-specific NFTs to hide:`);
  locationNFTs.forEach((nft, index) => {
    console.log(`  ${index + 1}. ID: ${nft.id}, Name: ${nft.name || 'Unnamed'}`);
  });
  
  console.log('\n🚫 Hiding location-specific NFTs...');
  
  let hiddenCount = 0;
  for (const nft of locationNFTs) {
    const success = await hideNFT(nft.id, nft.name);
    if (success) {
      hiddenCount++;
    }
    // Wait a bit between operations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Hiding complete! Hidden ${hiddenCount}/${locationNFTs.length} location-specific NFTs`);
  console.log('Location-specific NFTs should now be hidden from the frontend.');
}

// Run the hiding
if (require.main === module) {
  hideLocationNFTs().catch(console.error);
}

module.exports = { hideLocationNFTs, getAllNFTs, hideNFT };
