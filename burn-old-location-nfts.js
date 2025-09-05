const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';

// List of old location NFT metadata IDs to delete
const OLD_LOCATION_NFT_IDS = [
  9,   // 🌍 Secret Location NFT #922
  10,  // 🌍 Secret Location NFT #556  
  11,  // 🌍 Secret Location NFT #676
];

async function burnOldLocationNFTs() {
  console.log('🔥 Burning old location NFTs...\n');
  
  for (const metadataId of OLD_LOCATION_NFT_IDS) {
    try {
      console.log(`🗑️  Deleting metadata ID: ${metadataId}`);
      
      const response = await axios.delete(`${API_BASE_URL}/platform/metadata/delete`, {
        params: { id: metadataId }
      });
      
      if (response.data.success) {
        console.log(`✅ Successfully deleted metadata ID: ${metadataId}`);
      } else {
        console.log(`❌ Failed to delete metadata ID: ${metadataId}:`, response.data.message);
      }
    } catch (error) {
      console.log(`❌ Error deleting metadata ID: ${metadataId}:`, error.response?.data || error.message);
    }
  }
  
  console.log('\n🎉 Old location NFTs cleanup completed!');
}

// Run the script
if (require.main === module) {
  burnOldLocationNFTs().catch(console.error);
}

module.exports = { burnOldLocationNFTs };
