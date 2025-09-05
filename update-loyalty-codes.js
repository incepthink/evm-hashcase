const axios = require('axios');

const API_BASE_URL = 'http://localhost:8001';
const DEV_API_BASE_URL = 'http://localhost:8001/dev';

// New loyalty codes with meaningful values and descriptions
const newLoyaltyCodes = [
  {
    code: "WELCOME50",
    value: 50,
    type: "one_time_fixed",
    description: "🎉 Welcome bonus! Claim 50 points once for joining our loyalty program"
  },
  {
    code: "FIRST_MINT",
    value: 100,
    type: "one_time_fixed", 
    description: "🎨 First NFT minted! Get 100 points for your first collection NFT"
  },
  {
    code: "DAILY_CHECK",
    value: 25,
    type: "repeat_fixed",
    description: "📅 Daily check-in reward! Claim 25 points every day"
  },
  {
    code: "REFERRAL_BONUS",
    value: 75,
    type: "repeat_fixed",
    description: "👥 Refer a friend! Get 75 points for each successful referral"
  },
  {
    code: "COLLECTOR",
    value: 150,
    type: "one_time_fixed",
    description: "🏆 Collector achievement! Earn 150 points for owning 5+ NFTs"
  },
  {
    code: "WEEKLY_STREAK",
    value: 200,
    type: "repeat_fixed",
    description: "🔥 7-day streak! Maintain daily check-ins for 200 bonus points"
  },
  {
    code: "SOCIAL_SHARE",
    value: 30,
    type: "repeat_variable",
    description: "📱 Share on social media! Get 30 points per share (unlimited uses)"
  },
  {
    code: "COMMUNITY_HELP",
    value: 40,
    type: "repeat_variable",
    description: "🤝 Help community members! Earn 40 points for each helpful interaction"
  },
  {
    code: "EARLY_ADOPTER",
    value: 300,
    type: "one_time_fixed",
    description: "⭐ Early adopter bonus! 300 points for joining in the first month"
  },
  {
    code: "LOYALTY_MASTER",
    value: 500,
    type: "one_time_fixed",
    description: "👑 Loyalty master! Reach 1000 total points to unlock this exclusive reward"
  }
];

async function updateLoyaltyCodes() {
  try {
    console.log('🔄 Starting loyalty codes update...');
    
    // First, let's see what codes currently exist
    console.log('\n📋 Current loyalty codes:');
    const currentResponse = await axios.get(`${API_BASE_URL}/platform/get-loyalties?owner_id=1`);
    console.log(JSON.stringify(currentResponse.data, null, 2));
    
         // Delete existing codes
     console.log('\n🗑️ Deleting existing loyalty codes...');
     const existingCodes = currentResponse.data.loyalties;
     for (const code of existingCodes) {
       try {
         await axios.delete(`${DEV_API_BASE_URL}/loyalty/delete`, {
           data: { code: code.code }
         });
         console.log(`✅ Deleted code: ${code.code}`);
       } catch (error) {
         console.log(`⚠️ Could not delete ${code.code}:`, error.response?.data?.message || error.message);
       }
     }
    
         // Create new codes
     console.log('\n✨ Creating new loyalty codes...');
     for (const newCode of newLoyaltyCodes) {
       try {
         const response = await axios.post(`${DEV_API_BASE_URL}/loyalty/create`, {
           owner_id: 1,
           code: newCode.code,
           value: newCode.value,
           type: newCode.type
         });
         console.log(`✅ Created: ${newCode.code} - ${newCode.value} points (${newCode.type})`);
         console.log(`   📝 ${newCode.description}`);
       } catch (error) {
         console.log(`❌ Failed to create ${newCode.code}:`, error.response?.data?.message || error.message);
       }
     }
    
    // Verify the new codes
    console.log('\n🔍 Verifying new loyalty codes...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/platform/get-loyalties?owner_id=1`);
    console.log('\n📋 Updated loyalty codes:');
    console.log(JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\n🎉 Loyalty codes update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating loyalty codes:', error.response?.data || error.message);
  }
}

updateLoyaltyCodes();
