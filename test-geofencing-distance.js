const axios = require('axios');

const API_BASE_URL = 'http://localhost:8001';

// Test geofencing distance functionality
async function testGeofencingDistance() {
  try {
    console.log('🗺️ Testing Geofencing Distance Functionality...\n');

    // Test coordinates - your current location
    const userLocation = {
      latitude: 26.9136,
      longitude: 75.7858
    };

    console.log('📍 User Location:', userLocation);
    console.log('🎯 NFT Location: 26.9136, 75.7858 (same as user)');
    console.log('📏 Expected Radius: 15km (15000 meters)');
    console.log('');

    // 1. Test with exact same coordinates (should work)
    console.log('1. Testing with exact same coordinates...');
    try {
      const response = await axios.get(`${API_BASE_URL}/platform/metadata/geofenced-by-id`, {
        params: {
          metadata_id: 777, // Your location NFT ID
          user_lat: userLocation.latitude,
          user_lon: userLocation.longitude,
        }
      });
      
      if (response.data.metadata_instance) {
        console.log('✅ SUCCESS: NFT accessible at exact location');
        console.log('   NFT Data:', {
          id: response.data.metadata_instance.id,
          title: response.data.metadata_instance.title,
          latitude: response.data.metadata_instance.latitude,
          longitude: response.data.metadata_instance.longitude
        });
      } else {
        console.log('❌ FAILED: NFT not accessible at exact location');
      }
    } catch (error) {
      console.log('❌ Error testing exact location:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 2. Test with coordinates 5km away (should work)
    console.log('2. Testing with coordinates 5km away...');
    try {
      const response = await axios.get(`${API_BASE_URL}/platform/metadata/geofenced-by-id`, {
        params: {
          metadata_id: 777,
          user_lat: userLocation.latitude + 0.045, // ~5km north
          user_lon: userLocation.longitude,
        }
      });
      
      if (response.data.metadata_instance) {
        console.log('✅ SUCCESS: NFT accessible at 5km distance');
      } else {
        console.log('❌ FAILED: NFT not accessible at 5km distance');
      }
    } catch (error) {
      console.log('❌ Error testing 5km distance:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 3. Test with coordinates 10km away (should work)
    console.log('3. Testing with coordinates 10km away...');
    try {
      const response = await axios.get(`${API_BASE_URL}/platform/metadata/geofenced-by-id`, {
        params: {
          metadata_id: 777,
          user_lat: userLocation.latitude + 0.09, // ~10km north
          user_lon: userLocation.longitude,
        }
      });
      
      if (response.data.metadata_instance) {
        console.log('✅ SUCCESS: NFT accessible at 10km distance');
      } else {
        console.log('❌ FAILED: NFT not accessible at 10km distance');
      }
    } catch (error) {
      console.log('❌ Error testing 10km distance:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 4. Test with coordinates 20km away (should fail)
    console.log('4. Testing with coordinates 20km away...');
    try {
      const response = await axios.get(`${API_BASE_URL}/platform/metadata/geofenced-by-id`, {
        params: {
          metadata_id: 777,
          user_lat: userLocation.latitude + 0.18, // ~20km north
          user_lon: userLocation.longitude,
        }
      });
      
      if (response.data.metadata_instance) {
        console.log('⚠️  WARNING: NFT accessible at 20km distance (should be blocked)');
      } else {
        console.log('✅ SUCCESS: NFT correctly blocked at 20km distance');
      }
    } catch (error) {
      console.log('❌ Error testing 20km distance:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Geofencing distance test completed!');
    console.log('\n📝 Summary:');
    console.log('   - 15km radius should allow access within that distance');
    console.log('   - Distances beyond 15km should be blocked');
    console.log('   - Frontend should show user location for debugging');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testGeofencingDistance();
