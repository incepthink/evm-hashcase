const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001'; // Adjust to your backend URL
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// Sample random NFT metadata
const randomNFTs = [
  {
    name: "Random Drop #3",
    description: "Randomized drop 3 - Cosmic Explorer",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    attributes: "cosmic, explorer, random, drop"
  },
  {
    name: "Random Drop #4", 
    description: "Randomized drop 4 - Digital Dreamer",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
    attributes: "digital, dreamer, random, drop"
  },
  {
    name: "Random Drop #5",
    description: "Randomized drop 5 - Neon Warrior", 
    image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
    attributes: "neon, warrior, random, drop"
  },
  {
    name: "Random Drop #6",
    description: "Randomized drop 6 - Cyber Phoenix",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop", 
    attributes: "cyber, phoenix, random, drop"
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

// Main function to mint all random NFTs
async function mintAllRandomNFTs() {
  console.log('🎲 Starting to mint 4 additional random NFTs...\n');
  
  // You'll need to replace this with an actual wallet address
  const recipientAddress = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290"; // Using collection address as recipient for testing
  
  // Skip the check for now to allow testing
  // if (recipientAddress === "0x1234567890123456789012345678901234567890123456789012345678901234") {
  //   console.log('❌ Please update the recipientAddress in the script with your actual wallet address');
  //   return;
  // }

  const results = [];
  
  for (let i = 0; i < randomNFTs.length; i++) {
    const nft = randomNFTs[i];
    console.log(`\n--- Minting NFT ${i + 1}/4 ---`);
    
    const result = await mintRandomNFT(nft, recipientAddress);
    results.push(result);
    
    // Wait a bit between mints to avoid rate limiting
    if (i < randomNFTs.length - 1) {
      console.log('Waiting 2 seconds before next mint...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🎉 Minting complete!');
  console.log(`Successfully minted: ${results.filter(r => r !== null).length}/4 NFTs`);
  
  const successfulMints = results.filter(r => r !== null);
  if (successfulMints.length > 0) {
    console.log('\nMinted NFTs:');
    successfulMints.forEach((result, index) => {
      console.log(`${index + 1}. ${randomNFTs[index].name} - ID: ${result.nft_id}`);
    });
  }
}

// Run the script
if (require.main === module) {
  mintAllRandomNFTs().catch(console.error);
}

module.exports = { mintRandomNFT, mintAllRandomNFTs };
