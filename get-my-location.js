// Simple script to get your current location coordinates
// Run this in the browser console or use a location service

console.log('📍 Getting your current location...');

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      console.log('✅ Your current location:');
      console.log(`Latitude: ${latitude}`);
      console.log(`Longitude: ${longitude}`);
      console.log('\n🌍 You can use these coordinates to create geolocation NFTs for your area!');
      console.log('\n📝 Example usage in mint-geolocation-nfts.js:');
      console.log(`{
  name: "My Local NFT",
  description: "Exclusive NFT for my area",
  image_url: "https://example.com/image.jpg",
  attributes: "local, exclusive, geolocation",
  latitude: ${latitude},
  longitude: ${longitude},
  radius: 50000  // 50km radius
}`);
    },
    (error) => {
      console.error('❌ Error getting location:', error.message);
      console.log('💡 Make sure to allow location access in your browser');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
} else {
  console.error('❌ Geolocation is not supported by this browser');
}

// Alternative: You can also use online services to get your coordinates
console.log('\n🌐 Or visit: https://www.latlong.net/ to get your coordinates manually');
