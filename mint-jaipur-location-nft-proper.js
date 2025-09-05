const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://api.hashcase.co';
const LATITUDE = 26.913600;
const LONGITUDE = 75.785800;
const RADIUS = 15000; // 15km radius
const LOCATION_NAME = "Your Area";

// NFT data for your location
const locationNFT = {
  title: `🌍 ${LOCATION_NAME} Location NFT`,
  description: `Exclusive location-specific NFT for your area. Coordinates: ${LATITUDE}, ${LONGITUDE}. This NFT is only available to users within ${RADIUS/1000}km of this location!`,
  image_url: "https://imgs.search.brave.com/TGYH4HFtPAPxY_s0DgZO1BAvoGDyHnfgXqPs8JwC8IQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9taXIt/czMtY2RuLWNmLmJl/aGFuY2UubmV0L3By/b2plY3RzLzQwNC9h/M2I1YTUyMjg4NTEz/OTMuWTNKdmNDd3hO/akUzTERFeU5qUXNN/Q3d3LnBuZw",
  animation_url: "",
  collection_id: 1, // Using collection ID 1
  latitude: LATITUDE,
  longitude: LONGITUDE,
  radius: RADIUS,
        attributes: [
        "Location: Your Area",
        `Latitude: ${LATITUDE}`,
        `Longitude: ${LONGITUDE}`,
        `Radius: ${RADIUS}m`,
        "Type: Location-Specific",
        "Rarity: Regional",
        "Collection: HashCase",
        "Dynamic: Yes",
        "Geofenced: Yes"
      ]
};

async function mintLocationNFT() {
  try {
    console.log('🚀 Minting Location-Specific NFT with proper geofencing...');
    console.log('📍 Location:', LOCATION_NAME);
    console.log('📍 Coordinates:', LATITUDE, LONGITUDE);
    console.log('📍 Radius:', RADIUS, 'meters (15km)');
    console.log('');

    // Step 1: Create metadata in backend
    console.log('📝 Step 1: Creating metadata in backend...');
    const metadataResponse = await axios.post(`${API_BASE_URL}/platform/metadata`, {
      title: locationNFT.title,
      description: locationNFT.description,
      image_url: locationNFT.image_url,
      animation_url: locationNFT.animation_url,
      collection_id: locationNFT.collection_id,
      latitude: locationNFT.latitude,
      longitude: locationNFT.longitude,
      radius: locationNFT.radius,
      attributes: locationNFT.attributes
    });

    console.log('✅ Metadata created successfully!');
    console.log('📋 Metadata ID:', metadataResponse.data.id);
    console.log('');

    // Step 2: Mint NFT on Sui blockchain
    console.log('🔧 Step 2: Minting NFT on Sui blockchain...');
    const mintResponse = await axios.post(`${API_BASE_URL}/platform/sui/mint-nft`, {
      metadata_id: metadataResponse.data.id,
      recipient_address: "0xeff17a6af10d476f387eb6d00889606c5ee89718d523c309a2c6d2aaaa57512e"
    });

    console.log('✅ NFT minted successfully on Sui!');
    console.log('🔗 Transaction Digest:', mintResponse.data.transaction_digest);
    console.log('🆔 NFT ID:', mintResponse.data.nft_id);
    console.log('');

    // Step 3: Test geofencing
    console.log('🧪 Step 3: Testing geofencing...');
    const geofenceTest = await axios.get(`${API_BASE_URL}/platform/metadata/geo-fenced`, {
      params: {
        user_lat: LATITUDE,
        user_lon: LONGITUDE,
        collection_id: locationNFT.collection_id
      }
    });

    console.log('✅ Geofencing test successful!');
    console.log('📍 NFTs found in your area:', geofenceTest.data.data.length);
    
    if (geofenceTest.data.data.length > 0) {
      const yourNFT = geofenceTest.data.data.find(nft => 
        nft.title === locationNFT.title
      );
      if (yourNFT) {
        console.log('🎯 Your location NFT is visible in the geofenced area!');
        console.log('🆔 Your NFT ID:', yourNFT.id);
      }
    }

    console.log('');
    console.log('🎉 Location-Specific NFT Successfully Created!');
    console.log('📍 Location:', LOCATION_NAME);
    console.log('📍 Coordinates:', LATITUDE, LONGITUDE);
    console.log('📍 Radius:', RADIUS, 'meters');
    console.log('📱 You should now see this NFT in your frontend when location is enabled!');

  } catch (error) {
    console.error('❌ Error minting location NFT:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('🔍 Database error details:', error.response.data);
    }
  }
}

// Run the minting process
mintLocationNFT();
