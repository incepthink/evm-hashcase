const { SuiClient } = require('@mysten/sui.js/client');

async function checkLocationNFT() {
  try {
    // Initialize Sui client for mainnet
    const client = new SuiClient({ 
      url: 'https://fullnode.mainnet.sui.io:443' 
    });

    console.log('🔍 Checking for location NFT...');

    // Collection ID from your environment
    const collectionId = '0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290';
    
    // Admin wallet address
    const adminWallet = '0xeff17a6af10d476f387eb6d00889606c5ee89718d523c309a2c6d2aaaa57512e';

    console.log('📍 Collection ID:', collectionId);
    console.log('👤 Admin Wallet:', adminWallet);

    // Get all objects owned by the admin wallet
    const objects = await client.getOwnedObjects({
      owner: adminWallet,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true
      }
    });

    console.log(`📦 Total objects owned by admin: ${objects.data.length}`);

    // Filter for NFT objects
    const packageId = '0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0';
    const nfts = objects.data.filter(obj => {
      if (!obj.data?.type) return false;
      return obj.data.type.includes(`${packageId}::hashcase_module::NFT`);
    });

    console.log(`🎨 Total NFTs found: ${nfts.length}`);

    // Check each NFT for location attributes
    nfts.forEach((obj, index) => {
      const content = obj.data?.content;
      const display = obj.data?.display;
      
      const nft = {
        id: obj.data?.objectId,
        name: display?.data?.name || display?.name || content?.fields?.name || content?.name || 'Unknown',
        description: display?.data?.description || display?.description || content?.fields?.description || content?.description || '',
        attributes: display?.data?.attributes || display?.attributes || content?.fields?.attributes || content?.attributes || [],
        collection_id: content?.fields?.collection_id?.id || content?.fields?.collection_id || 'Unknown'
      };

      console.log(`\n🔍 NFT ${index + 1}:`);
      console.log(`   ID: ${nft.id}`);
      console.log(`   Name: ${nft.name}`);
      console.log(`   Collection: ${nft.collection_id}`);
      console.log(`   Attributes:`, nft.attributes);

      // Check if this is a location NFT
      if (nft.attributes && nft.attributes.length > 0) {
        const hasLocation = nft.attributes.some(attr => 
          attr.includes('Location:') || attr.includes('Latitude:') || attr.includes('Longitude:')
        );
        
        if (hasLocation) {
          console.log(`   🎯 LOCATION NFT FOUND!`);
          console.log(`   📍 Full attributes:`, nft.attributes);
          
          // Check if it matches your coordinates
          const latitude = nft.attributes.find(attr => attr.includes('Latitude:'))?.split('Latitude:')[1]?.trim();
          const longitude = nft.attributes.find(attr => attr.includes('Longitude:'))?.split('Longitude:')[1]?.trim();
          
          if (latitude && longitude) {
            console.log(`   📍 Coordinates: ${latitude}, ${longitude}`);
            console.log(`   🎯 Your coordinates: 26.913600, 75.785800`);
            
            // Calculate distance
            const lat1 = parseFloat(latitude);
            const lon1 = parseFloat(longitude);
            const lat2 = 26.913600;
            const lon2 = 75.785800;
            
            const R = 6371000; // Earth's radius in meters
            const lat1Rad = lat1 * Math.PI / 180;
            const lat2Rad = lat2 * Math.PI / 180;
            const deltaLat = (lat2 - lat1) * Math.PI / 180;
            const deltaLon = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            console.log(`   📏 Distance: ${Math.round(distance)}m`);
            
            // Check if within 15km
            if (distance <= 15000) {
              console.log(`   ✅ WITHIN RANGE! This NFT should be visible to you.`);
            } else {
              console.log(`   ❌ OUT OF RANGE! This NFT is too far from your location.`);
            }
          }
        }
      }
    });

    console.log('\n🎯 Summary:');
    console.log(`   Total NFTs checked: ${nfts.length}`);
    console.log(`   NFTs with attributes: ${nfts.filter(obj => {
      const content = obj.data?.content;
      const display = obj.data?.display;
      const attributes = display?.data?.attributes || display?.attributes || content?.fields?.attributes || content?.attributes || [];
      return attributes.length > 0;
    }).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLocationNFT();
