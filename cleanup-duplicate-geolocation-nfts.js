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
      data: { id: metadataId }
    });
    
    console.log(`✅ Deleted metadata ID ${metadataId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete metadata ID ${metadataId}:`, error.response?.data || error.message);
    return false;
  }
}

// Function to find and remove duplicates
async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate cleanup...\n');
  
  const allMetadata = await getAllMetadata();
  
  if (allMetadata.length === 0) {
    console.log('No metadata found or error fetching data');
    return;
  }
  
  console.log(`Found ${allMetadata.length} total metadata entries`);
  
  // Group by title to find duplicates
  const titleGroups = {};
  allMetadata.forEach(metadata => {
    const title = metadata.title;
    if (!titleGroups[title]) {
      titleGroups[title] = [];
    }
    titleGroups[title].push(metadata);
  });
  
  // Find duplicates
  const duplicates = [];
  Object.keys(titleGroups).forEach(title => {
    if (titleGroups[title].length > 1) {
      console.log(`\n🔍 Found ${titleGroups[title].length} instances of "${title}":`);
      titleGroups[title].forEach((metadata, index) => {
        console.log(`  ${index + 1}. ID: ${metadata.id}, Created: ${metadata.createdAt}`);
      });
      
      // Keep the first one (oldest), mark others for deletion
      const toDelete = titleGroups[title].slice(1);
      duplicates.push(...toDelete);
    }
  });
  
  if (duplicates.length === 0) {
    console.log('\n✅ No duplicates found!');
    return;
  }
  
  console.log(`\n🗑️  Found ${duplicates.length} duplicates to delete:`);
  duplicates.forEach(metadata => {
    console.log(`  - "${metadata.title}" (ID: ${metadata.id})`);
  });
  
  console.log('\nDeleting duplicates...');
  
  let deletedCount = 0;
  for (const metadata of duplicates) {
    const success = await deleteMetadata(metadata.id);
    if (success) {
      deletedCount++;
    }
    // Wait a bit between deletions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Cleanup complete! Deleted ${deletedCount}/${duplicates.length} duplicates`);
}

// Run the cleanup
if (require.main === module) {
  cleanupDuplicates().catch(console.error);
}

module.exports = { cleanupDuplicates, getAllMetadata, deleteMetadata };


