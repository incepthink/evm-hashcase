const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const NFT_ID = "0xec7add66f9334622a82d96dc487afecab977d20a8c9ad966da828a4a5a4304c8"; // Random Drop #4 ID

// Function to burn the NFT
async function burnNFT(nftId) {
  try {
    console.log(`🔥 Burning NFT: ${nftId}`);
    
    // First, let's get the NFT details to confirm it's Random Drop #4
    const getResponse = await axios.get(`${API_BASE_URL}/platform/sui/nfts/by-collection`, {
      params: { 
        collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290" 
      }
    });

    const nft = getResponse.data.data.nfts.find(nft => nft.id === nftId);
    if (nft) {
      console.log(`Found NFT: ${nft.name} - ${nft.description}`);
      
      if (nft.name === "Random Drop #4") {
        console.log("✅ Confirmed: This is Random Drop #4");
        
        // Burn the NFT using the platform API
        const burnResponse = await axios.delete(`${API_BASE_URL}/platform/sui/nfts/${nftId}`, {
          data: {
            collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
            nft_id: nftId
          }
        });

        console.log(`🔥 Successfully burned: ${nft.name}`);
        console.log(`Burn response:`, burnResponse.data);
        return true;
      } else {
        console.log("❌ NFT found but it's not Random Drop #4");
        return false;
      }
    } else {
      console.log("❌ NFT not found in collection");
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to burn NFT:`, error.response?.data || error.message);
    return false;
  }
}

// Main function
async function burnRandomDrop4() {
  console.log('🔥 Starting to burn Random Drop #4...\n');
  
  const success = await burnNFT(NFT_ID);
  
  if (success) {
    console.log('\n🎉 Random Drop #4 has been successfully burned!');
    console.log('The NFT is no longer available in the collection.');
  } else {
    console.log('\n❌ Failed to burn Random Drop #4');
  }
}

// Run the script
if (require.main === module) {
  burnRandomDrop4().catch(console.error);
}

module.exports = { burnNFT, burnRandomDrop4 };
