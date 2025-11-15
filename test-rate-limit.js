const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'ak_6ebdc4f9b93da8ce285a287f067315ec1781c0d52d0317a93aac73f310fc88b6';

async function testRateLimit() {
  console.log('Testing rate limiting (sending 110 requests)...\n');

  let successCount = 0;
  let rateLimitCount = 0;

  for (let i = 1; i <= 110; i++) {
    try {
      await axios.post(
        `${API_URL}/api/analytics/collect`,
        {
          event: 'test_event',
          url: 'https://example.com',
          device: 'desktop'
        },
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      );
      
      successCount++;
      if (i % 10 === 0) {
        console.log(`✅ ${successCount} requests succeeded so far...`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitCount++;
        console.log(`⛔ Request ${i} was rate limited`);
      } else {
        console.error(`❌ Request ${i} failed:`, error.response?.data || error.message);
      }
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n📊 Results:');
  console.log(`✅ Successful requests: ${successCount}`);
  console.log(`⛔ Rate limited requests: ${rateLimitCount}`);
  console.log(`\nRate limit is set to 100 requests per minute`);
  
  if (rateLimitCount > 0) {
    console.log('✅ Rate limiting is working correctly!');
  } else {
    console.log('⚠️ Rate limiting might not be working');
  }
}

testRateLimit();