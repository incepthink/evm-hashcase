const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// 3 additional random NFT metadata
const additionalRandomNFTs = [
  {
    name: "Random Drop #7",
    description: "Randomized drop 7 - Quantum Voyager",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop",
    attributes: "quantum, voyager, random, drop"
  },
  {
    name: "Random Drop #8",
    description: "Randomized drop 8 - Stellar Guardian",
    image_url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=400&fit=crop",
    attributes: "stellar, guardian, random, drop"
  },
  {
    name: "Random Drop #9",
    description: "Randomized drop 9 - Mystic Wanderer",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    attributes: "mystic, wanderer, random, drop"
  }
];

// Function to mint a random NFT
async function mintRandomNFT(nftData, recipientAddress) {
  try {
    console.log(`Minting: ${nftData.name}`);
    
    const response = await axios.post(`${API_BASE_URL}/platform/sui/mint-nft`, {
      collection_id: COLLECTION_ID,
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      attributes: nftData.attributes.split(',').map(attr => attr.trim()),
      recipient: recipientAddress
    });

    console.log(`✅ Successfully minted: ${nftData.name}`);
    console.log(`NFT ID: ${response.data.nft_id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to mint ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Main function to mint all additional random NFTs
async function mintAdditionalRandomNFTs() {
  console.log('🎲 Starting to mint 3 additional random NFTs...\n');
  
  const recipientAddress = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

  const results = [];
  
  for (let i = 0; i < additionalRandomNFTs.length; i++) {
    const nft = additionalRandomNFTs[i];
    console.log(`\n--- Minting NFT ${i + 1}/3 ---`);
    
    const result = await mintRandomNFT(nft, recipientAddress);
    results.push(result);
    
    // Wait a bit between mints to avoid rate limiting
    if (i < additionalRandomNFTs.length - 1) {
      console.log('Waiting 2 seconds before next mint...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🎉 Minting complete!');
  console.log(`Successfully minted: ${results.filter(r => r !== null).length}/3 NFTs`);
  
  const successfulMints = results.filter(r => r !== null);
  if (successfulMints.length > 0) {
    console.log('\nMinted NFTs:');
    successfulMints.forEach((result, index) => {
      console.log(`${index + 1}. ${additionalRandomNFTs[index].name} - ID: ${result.nft_id}`);
    });
  }
}

// Run the script
if (require.main === module) {
  mintAdditionalRandomNFTs().catch(console.error);
}

module.exports = { mintRandomNFT, mintAdditionalRandomNFTs };
