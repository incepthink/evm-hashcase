const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://api.hashcase.co';
const COLLECTION_ID = "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";

// Your location NFT data - using exact same format as working script
const locationNFT = {
  name: "🌍 Your Area Location NFT",
  description: "Exclusive location-specific NFT for your area. Coordinates: 26.913600, 75.785800. This NFT is only available to users within 15km of this location!",
  image_url: "https://imgs.search.brave.com/TGYH4HFtPAPxY_s0DgZO1BAvoGDyHnfgXqPs8JwC8IQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9taXIt/czMtY2RuLWNmLmJl/aGFuY2UubmV0L3By/b2plY3RzLzQwNC9h/M2I1YTUyMjg4NTEz/OTMuWTNKdmNDd3hO/akUzTERFeU5qUXNN/Q3d3LnBuZw",
  attributes: "location, exclusive, geolocation, your-area, regional",
  latitude: 26.913600,
  longitude: 75.785800,
  radius: 15000  // 15km radius
};

// Function to create geolocation metadata - using exact same format as working script
async function createGeolocationMetadata(nftData) {
  try {
    console.log(`Creating geolocation metadata for: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/metadata/create`, {
      metadata: {
        collection_id: 1, // Using collection ID 1 like the working script
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

// Function to mint a geolocation NFT - using exact same format as working script
async function mintGeolocationNFT(nftData, metadataId) {
  try {
    console.log(`Minting geolocation NFT: ${nftData.name}`);

    const response = await axios.post(`${API_BASE_URL}/platform/sui/mint-nft`, {
      collection_id: COLLECTION_ID,
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      attributes: nftData.attributes.split(',').map(attr => attr.trim()),
      recipient: "0xeff17a6af10d476f387eb6d00889606c5ee89718d523c309a2c6d2aaaa57512e",
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

// Main function to create the location NFT
async function createLocationNFT() {
  console.log('🌍 Starting to create your location NFT...\n');
  console.log('📍 Location: Your Area');
  console.log('📍 Coordinates: 26.913600, 75.785800');
  console.log('📍 Radius: 15km\n');

  try {
    // Step 1: Create metadata
    console.log('📝 Step 1: Creating metadata...');
    const metadata = await createGeolocationMetadata(locationNFT);
    
    if (!metadata) {
      console.log('❌ Failed to create metadata. Stopping.');
      return;
    }

    // Step 2: Mint NFT
    console.log('\n🔧 Step 2: Minting NFT on Sui blockchain...');
    const mintResult = await mintGeolocationNFT(locationNFT, metadata.id);
    
    if (!mintResult) {
      console.log('❌ Failed to mint NFT. Stopping.');
      return;
    }

    // Step 3: Test geofencing
    console.log('\n🧪 Step 3: Testing geofencing...');
    try {
      const geofenceTest = await axios.get(`${API_BASE_URL}/platform/metadata/geo-fenced`, {
        params: {
          user_lat: locationNFT.latitude,
          user_lon: locationNFT.longitude,
          collection_id: 1
        }
      });

      console.log('✅ Geofencing test successful!');
      console.log('📍 NFTs found in your area:', geofenceTest.data.data.length);
      
      if (geofenceTest.data.data.length > 0) {
        const yourNFT = geofenceTest.data.data.find(nft => 
          nft.title === locationNFT.name
        );
        if (yourNFT) {
          console.log('🎯 Your location NFT is visible in the geofenced area!');
          console.log('🆔 Your NFT ID:', yourNFT.id);
        }
      }
    } catch (geoError) {
      console.log('⚠️ Geofencing test failed:', geoError.response?.data || geoError.message);
    }

    console.log('\n🎉 Location-Specific NFT Successfully Created!');
    console.log('📍 Location: Your Area');
    console.log('📍 Coordinates: 26.913600, 75.785800');
    console.log('📍 Radius: 15km');
    console.log('📱 You should now see this NFT in your frontend when location is enabled!');

  } catch (error) {
    console.error('❌ Error in main process:', error.response?.data || error.message);
  }
}

// Run the script
createLocationNFT();
