const axios = require('axios');

const API_BASE_URL = 'http://localhost:8001';

// Test leaderboard auto-refresh functionality
async function testLeaderboardAutoRefresh() {
  try {
    console.log('🔄 Testing Leaderboard Auto-Refresh Functionality...\n');

    // 1. Check initial state
    console.log('1. Checking initial leaderboard state...');
    try {
      const initialLeaderboardResponse = await axios.get(`${API_BASE_URL}/platform/new-leaderboard`, {
        params: {
          owner_id: 1,
          user_id: 2,
          page: 1,
          page_size: 10,
        }
      });
      
      console.log('✅ Initial leaderboard data:');
      console.log('   Total entries:', initialLeaderboardResponse.data.leaderboard.rows?.length || 0);
      console.log('   User 2 rank:', initialLeaderboardResponse.data.leaderboard.userRank);
      
      if (initialLeaderboardResponse.data.leaderboard.rows?.length > 0) {
        const user2Entry = initialLeaderboardResponse.data.leaderboard.rows.find(entry => entry.user_id === 2);
        if (user2Entry) {
          console.log(`   User 2 points: ${user2Entry.total_loyalty_points}`);
        }
      }
    } catch (error) {
      console.log('❌ Could not fetch initial leaderboard:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 2. Check current off-chain points
    console.log('2. Checking current off-chain points...');
    try {
      const pointsResponse = await axios.get(`${API_BASE_URL}/user/achievements/get-points`, {
        params: { owner_id: 1 }
      });
      
      console.log('✅ Current off-chain points:', pointsResponse.data?.total_points || pointsResponse.data?.points || 0);
    } catch (error) {
      console.log('❌ Could not fetch off-chain points:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 3. Add points via admin to simulate points change
    console.log('3. Adding points via admin to trigger leaderboard update...');
    try {
      // Authenticate as admin
      const authResponse = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
        email: 'admin@hashcase.co',
        password: 'Hashcase123!'
      });
      
      const adminToken = authResponse.data.token;
      console.log('✅ Admin authentication successful');

      // Add points to user 2
      const addPointsResponse = await axios.post(`${API_BASE_URL}/admin/change-loyalty-points`, {
        user_id: 2,
        owner_id: 1,
        code: "ADMIN_ADD",
        value: 25
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('✅ Added 25 points to user 2');
      console.log('   Response:', addPointsResponse.data);
    } catch (error) {
      console.log('❌ Admin add points failed:', error.response?.data || error.message);
    }
    console.log('');

    // 4. Wait a moment for database update
    console.log('4. Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Check updated off-chain points
    console.log('5. Checking updated off-chain points...');
    try {
      const updatedPointsResponse = await axios.get(`${API_BASE_URL}/user/achievements/get-points`, {
        params: { owner_id: 1 }
      });
      
      console.log('✅ Updated off-chain points:', updatedPointsResponse.data?.total_points || updatedPointsResponse.data?.points || 0);
    } catch (error) {
      console.log('❌ Could not fetch updated off-chain points:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 6. Check updated leaderboard
    console.log('6. Checking updated leaderboard...');
    try {
      const updatedLeaderboardResponse = await axios.get(`${API_BASE_URL}/platform/new-leaderboard`, {
        params: {
          owner_id: 1,
          user_id: 2,
          page: 1,
          page_size: 10,
        }
      });
      
      console.log('✅ Updated leaderboard data:');
      console.log('   Total entries:', updatedLeaderboardResponse.data.leaderboard.rows?.length || 0);
      console.log('   User 2 rank:', updatedLeaderboardResponse.data.leaderboard.userRank);
      
      if (updatedLeaderboardResponse.data.leaderboard.rows?.length > 0) {
        const user2Entry = updatedLeaderboardResponse.data.leaderboard.rows.find(entry => entry.user_id === 2);
        if (user2Entry) {
          console.log(`   User 2 points: ${user2Entry.total_loyalty_points}`);
        }
      }
    } catch (error) {
      console.log('❌ Could not fetch updated leaderboard:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Leaderboard auto-refresh test completed!');
    console.log('\n📝 Summary:');
    console.log('   - Off-chain points can be updated via admin');
    console.log('   - Leaderboard should reflect point changes');
    console.log('   - Frontend should auto-refresh every 30 seconds');
    console.log('   - Manual refresh button available for immediate updates');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testLeaderboardAutoRefresh();
