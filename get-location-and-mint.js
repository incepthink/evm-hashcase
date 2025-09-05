const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// City definitions with coordinates and radius
const CITIES = {
  mumbai: {
    name: "Mumbai",
    lat: 19.0760,
    lon: 72.8777,
    radius: 50000, // 50km
    nft: {
      name: "Mumbai Local NFT",
      description: "Exclusive NFT only available in Mumbai area",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      attributes: "mumbai, local, exclusive, geolocation"
    }
  },
  delhi: {
    name: "Delhi",
    lat: 28.7041,
    lon: 77.1025,
    radius: 50000, // 50km
    nft: {
      name: "Delhi Special NFT",
      description: "Special NFT for Delhi residents only",
      image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=400&fit=crop",
      attributes: "delhi, special, exclusive, geolocation"
    }
  },
  bangalore: {
    name: "Bangalore",
    lat: 12.9716,
    lon: 77.5946,
    radius: 50000, // 50km
    nft: {
      name: "Bangalore Tech NFT",
      description: "Tech-themed NFT for Bangalore area",
      image_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop",
      attributes: "bangalore, tech, exclusive, geolocation"
    }
  }
};

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Function to determine which city the user is in
function detectUserCity(userLat, userLon) {
  console.log(`📍 Your location: ${userLat}, ${userLon}`);
  
  for (const [cityKey, cityData] of Object.entries(CITIES)) {
    const distance = calculateDistance(userLat, userLon, cityData.lat, cityData.lon);
    console.log(`📏 Distance to ${cityData.name}: ${Math.round(distance/1000)}km`);
    
    if (distance <= cityData.radius) {
      console.log(`✅ You are in ${cityData.name}!`);
      return { key: cityKey, ...cityData };
    }
  }
  
  console.log(`❌ You are not in any supported city area`);
  return null;
}

// Function to create geolocation metadata
async function createGeolocationMetadata(nftData, lat, lon) {
  try {
    console.log(`Creating geolocation metadata for: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/metadata/create`, {
      metadata: {
        collection_id: 1,
        title: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes,
        price: 0,
        latitude: lat,
        longitude: lon
      }
    });

    console.log(`✅ Successfully created metadata for: ${nftData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create metadata for ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Function to mint NFT
async function mintNFT(nftData, metadataId) {
  try {
    console.log(`Minting NFT: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/sui/mint-nft`, {
      collection_id: COLLECTION_ID,
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      attributes: nftData.attributes.split(',').map(attr => attr.trim()),
      recipient: COLLECTION_ID, // Mint to collection
      metadata_id: metadataId
    });

    console.log(`✅ Successfully minted: ${nftData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to mint ${nftData.name}:`, error.response?.data || error.message);
    return null;
  }
}

// Main function
async function getLocationAndMint() {
  console.log('🌍 Welcome to Geolocation NFT Minting!\n');
  
  // Get user's actual location coordinates
  console.log('Please provide your location coordinates:');
  console.log('You can get these from: fe/get-my-location.html\n');
  
  // Use your current coordinates
  let userLat = 29.9038; // Your current latitude
  let userLon = 73.8772; // Your current longitude
  
  // You can uncomment and modify these lines with your actual coordinates:
  // userLat = YOUR_ACTUAL_LATITUDE;
  // userLon = YOUR_ACTUAL_LONGITUDE;
  
  console.log(`🗺️  Using coordinates: ${userLat}, ${userLon}`);
  
  // Create a custom NFT for your specific area
  const areaNFT = {
    name: `🌍 Your Secret Location NFT #${Math.floor(Math.random() * 1000)}`,
    description: `🔥 An ultra-rare, location-locked digital treasure! This exclusive NFT can only be discovered by those physically present at coordinates ${userLat.toFixed(4)}, ${userLon.toFixed(4)}. Each coordinate holds a unique story waiting to be unlocked. Are you one of the chosen few who can claim this digital artifact? 🗺️✨`,
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    attributes: `ultra-rare, location-locked, exclusive, coordinates-${userLat.toFixed(4)}-${userLon.toFixed(4)}, digital-treasure, mysterious, your-area`
  };
  
  console.log(`\n🎯 Minting ultra-rare location NFT...`);
  console.log(`📍 Secret Coordinates: ${userLat}, ${userLon}`);
  console.log(`🎨 NFT Name: ${areaNFT.name}`);
  console.log(`📝 Description: ${areaNFT.description}`);
  
  // Create metadata with your specific location
  const metadata = await createGeolocationMetadata(areaNFT, userLat, userLon);
  
  if (metadata) {
    // Mint the NFT
    const result = await mintNFT(areaNFT, metadata.id);
    
    if (result) {
      console.log(`\n🎉 SUCCESS! Your ultra-rare location NFT has been minted! 🔥`);
      console.log(`📍 Secret Location: ${userLat}, ${userLon}`);
      console.log(`🎨 NFT: ${areaNFT.name}`);
      console.log(`📝 Description: ${areaNFT.description}`);
      console.log(`\n💎 This digital treasure will only be visible to users within 50km of your secret location!`);
      console.log(`🌍 Only the chosen few in your area can discover this mysterious artifact! ✨`);
    }
  }
}

// Run the script
if (require.main === module) {
  getLocationAndMint().catch(console.error);
}

module.exports = { getLocationAndMint, detectUserCity, CITIES };
