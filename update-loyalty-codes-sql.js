const axios = require('axios');

const API_BASE_URL = 'http://localhost:8001';

// Updated loyalty codes with meaningful values
const updatedLoyaltyCodes = [
  {
    id: 1,
    code: "WELCOME50",
    value: 50,
    type: "one_time_fixed",
    description: "🎉 Welcome bonus! Claim 50 points once for joining our loyalty program"
  },
  {
    id: 2,
    code: "REFERRAL_BONUS",
    value: 75,
    type: "repeat_fixed",
    description: "👥 Refer a friend! Get 75 points for each successful referral"
  },
  {
    id: 3,
    code: "DAILY_CHECK",
    value: 25,
    type: "repeat_variable",
    description: "📅 Daily check-in reward! Claim 25 points every day (unlimited uses)"
  }
];

async function updateLoyaltyCodes() {
  try {
    console.log('🔄 Starting loyalty codes update...');
    
    // First, let's see what codes currently exist
    console.log('\n📋 Current loyalty codes:');
    const currentResponse = await axios.get(`${API_BASE_URL}/platform/get-loyalties?owner_id=1`);
    console.log(JSON.stringify(currentResponse.data, null, 2));
    
    // Update existing codes one by one
    console.log('\n✨ Updating existing loyalty codes...');
    for (const updatedCode of updatedLoyaltyCodes) {
      try {
        // Try to update using a direct database approach
        // Since we can't use the devapi routes, let's try to update the values directly
        console.log(`📝 Updating code ${updatedCode.id}: ${updatedCode.code} - ${updatedCode.value} points (${updatedCode.type})`);
        console.log(`   📝 ${updatedCode.description}`);
      } catch (error) {
        console.log(`❌ Failed to update ${updatedCode.code}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Since we can't update via API, let's provide manual SQL commands
    console.log('\n🔧 Manual SQL Update Commands:');
    console.log('Run these SQL commands in your database to update the loyalty codes:');
    console.log('');
    
    updatedLoyaltyCodes.forEach(code => {
      console.log(`UPDATE loyalties SET code = '${code.code}', value = ${code.value}, type = '${code.type}' WHERE id = ${code.id};`);
    });
    
    console.log('\n📋 Expected result after SQL update:');
    console.log(JSON.stringify({
      loyalties: updatedLoyaltyCodes.map(code => ({
        id: code.id,
        owner_id: 1,
        code: code.code,
        value: code.value,
        type: code.type,
        description: code.description
      }))
    }, null, 2));
    
    console.log('\n🎉 Please run the SQL commands above to update your loyalty codes!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateLoyaltyCodes();

