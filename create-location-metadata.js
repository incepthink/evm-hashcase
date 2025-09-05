const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://api.hashcase.co';

// Your location NFT data - matching the one we minted on Sui
const locationNFT = {
  title: "🌍 Your Area Location NFT",
  description: "Exclusive location-specific NFT for your area. Coordinates: 26.913600, 75.785800. This NFT is only available to users within 15km of this location!",
  image_url: "https://imgs.search.brave.com/TGYH4HFtPAPxY_s0DgZO1BAvoGDyHnfgXqPs8JwC8IQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9taXIt/czMtY2RuLWNmLmJl/aGFuY2UubmV0L3By/b2plY3RzLzQwNC9h/M2I1YTUyMjg4NTEz/OTMuWTNKdmNDd3hO/akUzTERFeU5qUXNN/Q3d3LnBuZw",
  collection_id: 1,
  latitude: 26.913600,
  longitude: 75.785800,
  radius: 15000, // 15km radius
  attributes: "location, exclusive, geolocation, your-area, regional"
};

async function createLocationMetadata() {
  try {
    console.log('🌍 Creating location metadata in backend...');
    console.log('📍 Location: Your Area');
    console.log('📍 Coordinates: 26.913600, 75.785800');
    console.log('📍 Radius: 15km\n');

    // Try different API endpoints
    const endpoints = [
      '/platform/metadata',
      '/platform/metadata/create',
      '/api/metadata'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`📝 Trying endpoint: ${endpoint}`);
        
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
          title: locationNFT.title,
          description: locationNFT.description,
          image_url: locationNFT.image_url,
          collection_id: locationNFT.collection_id,
          latitude: locationNFT.latitude,
          longitude: locationNFT.longitude,
          radius: locationNFT.radius,
          attributes: locationNFT.attributes
        });

        console.log('✅ Metadata created successfully!');
        console.log('📋 Metadata ID:', response.data.id || response.data.metadata_id);
        console.log('🔗 Sui NFT ID: 0xfe6740546fffe9602be70b31e39c187c07d3a50bfce8f7c96c087c6fe88b4efa');
        
        // Test geofencing
        console.log('\n🧪 Testing geofencing...');
        const geofenceTest = await axios.get(`${API_BASE_URL}/platform/metadata/geo-fenced`, {
          params: {
            user_lat: locationNFT.latitude,
            user_lon: locationNFT.longitude,
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

        console.log('\n🎉 Location metadata created successfully!');
        console.log('📱 You should now see this NFT in your frontend when location is enabled!');
        return;
        
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status, error.response?.data?.message || error.message);
        continue;
      }
    }

    console.log('\n❌ All endpoints failed. The backend might be having issues.');

  } catch (error) {
    console.error('❌ Error creating location metadata:', error.response?.data || error.message);
  }
}

// Run the script
createLocationMetadata();
