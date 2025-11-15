const axios = require('axios');

const API_URL = 'http://localhost:3000';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzQxZmU5Ni1lZGRkLTRhOWEtOTllOS0wZTAzNDdiOTBiY2YiLCJpYXQiOjE3NjMxMTY4OTYsImV4cCI6MTc2MzcyMTY5Nn0.DYMy71d6e7SPFd1eRdxr71OFbSa3vKrRuF9UWC1GsPA'; // Replace with your JWT

async function testCaching() {
  console.log('Testing Redis caching...\n');

  // First request - should hit database
  console.log('1️⃣ First request (should hit database)...');
  const start1 = Date.now();
  
  try {
    await axios.get(
      `${API_URL}/api/analytics/event-summary?event=login_form_cta_click`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      }
    );
    const time1 = Date.now() - start1;
    console.log(`✅ First request completed in ${time1}ms (database)\n`);

    // Second request - should hit cache
    console.log('2️⃣ Second request (should hit cache)...');
    const start2 = Date.now();
    
    await axios.get(
      `${API_URL}/api/analytics/event-summary?event=login_form_cta_click`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      }
    );
    const time2 = Date.now() - start2;
    console.log(`✅ Second request completed in ${time2}ms (cache)\n`);

    // Compare times
    console.log('📊 Performance comparison:');
    console.log(`Database: ${time1}ms`);
    console.log(`Cache: ${time2}ms`);
    console.log(`Speed improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
    
    if (time2 < time1) {
      console.log('\n✅ Caching is working correctly!');
    } else {
      console.log('\n⚠️ Cache might not be working as expected');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCaching();