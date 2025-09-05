const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8001';

// Function to get all metadata for collection 1
async function getAllMetadata() {
  try {
    const response = await axios.get(`${API_BASE_URL}/platform/metadata/by-collection`, {
      params: { collection_id: 1 }
    });
    
    return response.data.metadata_instances || [];
  } catch (error) {
    console.error('Error fetching metadata:', error.response?.data || error.message);
    return [];
  }
}

// Function to delete metadata by ID
async function deleteMetadata(metadataId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/platform/metadata/delete`, {
      params: { metadata_id: metadataId }
    });
    
    console.log(`✅ Deleted metadata ID ${metadataId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete metadata ID ${metadataId}:`, error.response?.data || error.message);
    return false;
  }
}

// Main function to delete all metadata
async function deleteAllGeoMetadata() {
  console.log('🗑️  Deleting all geolocation metadata...\n');
  
  const allMetadata = await getAllMetadata();
  
  if (allMetadata.length === 0) {
    console.log('No metadata found to delete');
    return;
  }
  
  console.log(`Found ${allMetadata.length} metadata entries to delete:`);
  allMetadata.forEach(metadata => {
    console.log(`  - ID: ${metadata.id}, Title: ${metadata.title || 'null'}`);
  });
  
  console.log('\nDeleting all metadata...');
  
  let deletedCount = 0;
  for (const metadata of allMetadata) {
    const success = await deleteMetadata(metadata.id);
    if (success) {
      deletedCount++;
    }
    // Wait a bit between deletions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Deletion complete! Deleted ${deletedCount}/${allMetadata.length} metadata entries`);
  console.log('All geolocation NFTs should now be removed from the collection page.');
}

// Run the deletion
if (require.main === module) {
  deleteAllGeoMetadata().catch(console.error);
}

module.exports = { deleteAllGeoMetadata };
