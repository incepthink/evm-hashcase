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

// Function to burn an NFT
async function burnNFT(nftId) {
  try {
    console.log(`🔥 Burning NFT: ${nftId}`);
    
    // Use the Sui burn transaction
    const response = await axios.post(`${API_BASE_URL}/platform/sui/burn-nft`, {
      nft_id: nftId,
      collection_id: COLLECTION_ID
    });
    
    console.log(`✅ Successfully burned NFT: ${nftId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to burn NFT ${nftId}:`, error.response?.data || error.message);
    return false;
  }
}

// Function to burn only location-specific NFTs
async function burnLocationNFTs() {
  console.log('🔥 Starting to burn location-specific NFTs...\n');
  
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
    console.log('No location-specific NFTs found to burn');
    return;
  }
  
  console.log(`Found ${locationNFTs.length} location-specific NFTs to burn:`);
  locationNFTs.forEach((nft, index) => {
    console.log(`  ${index + 1}. ID: ${nft.id}, Name: ${nft.name || 'Unnamed'}`);
  });
  
  console.log('\n🔥 Burning location-specific NFTs...');
  
  let burnedCount = 0;
  for (const nft of locationNFTs) {
    const success = await burnNFT(nft.id);
    if (success) {
      burnedCount++;
    }
    // Wait a bit between burns to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Burning complete! Burned ${burnedCount}/${locationNFTs.length} location-specific NFTs`);
  console.log('Location-specific NFTs should now be removed from the blockchain.');
}

// Run the burning
if (require.main === module) {
  burnLocationNFTs().catch(console.error);
}

module.exports = { burnLocationNFTs, getAllNFTs, burnNFT };
