const axios = require("axios");

const API_URL = "http://localhost:3000";
let JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzQxZmU5Ni1lZGRkLTRhOWEtOTllOS0wZTAzNDdiOTBiY2YiLCJpYXQiOjE3NjMxMTY4OTYsImV4cCI6MTc2MzcyMTY5Nn0.DYMy71d6e7SPFd1eRdxr71OFbSa3vKrRuF9UWC1GsPA";
let API_KEY =
  "ak_6ebdc4f9b93da8ce285a287f067315ec1781c0d52d0317a93aac73f310fc88b6";
let APP_ID = "d5dc211f-e0bb-4f0a-9dc2-ae076a071a92";

// Helper function to make requests
async function request(method, endpoint, data = null, useApiKey = false) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {},
    };

    if (useApiKey) {
      config.headers["x-api-key"] = API_KEY;
    } else {
      config.headers["Authorization"] = `Bearer ${JWT_TOKEN}`;
    }

    if (data) {
      config.data = data;
      config.headers["Content-Type"] = "application/json";
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

async function runTests() {
  console.log("🧪 Starting comprehensive API tests...\n");

  try {
    // Step 1: You need to manually get JWT token first
    console.log("❗ Please set JWT_TOKEN in the script first");
    console.log("   Visit: http://localhost:3000/api/auth/google");
    console.log("   Copy the token from the response\n");

    JWT_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMzQxZmU5Ni1lZGRkLTRhOWEtOTllOS0wZTAzNDdiOTBiY2YiLCJpYXQiOjE3NjMxMTY4OTYsImV4cCI6MTc2MzcyMTY5Nn0.DYMy71d6e7SPFd1eRdxr71OFbSa3vKrRuF9UWC1GsPA"; // SET THIS!

    if (JWT_TOKEN === "YOUR_JWT_TOKEN_HERE") {
      console.log("❌ Please set JWT_TOKEN first!");
      return;
    }

    // Step 2: Get current user
    console.log("1️⃣ Testing: Get current user");
    const user = await request("GET", "/api/auth/me");
    console.log("✅ User:", user.data.user.email);
    console.log("");

    // Step 3: Register an app
    console.log("2️⃣ Testing: Register app");
    const app = await request("POST", "/api/auth/register", {
      name: "Test App",
      domain: "https://test-app.com",
    });
    API_KEY = app.data.apiKey;
    APP_ID = app.data.id;
    console.log(
      "✅ App registered with API key:",
      API_KEY.substring(0, 20) + "..."
    );
    console.log("");

    // Step 4: Send test events
    console.log("3️⃣ Testing: Send events");
    for (let i = 0; i < 5; i++) {
      await request(
        "POST",
        "/api/analytics/collect",
        {
          event: "test_event",
          url: "https://test-app.com/page" + i,
          referrer: "https://google.com",
          device: i % 2 === 0 ? "mobile" : "desktop",
          userId: "user" + (i % 3),
          metadata: {
            browser: "Chrome",
            os: "Windows",
          },
        },
        true
      );
    }
    console.log("✅ Sent 5 test events");
    console.log("");

    // Step 5: Get event summary
    console.log("4️⃣ Testing: Get event summary");
    const summary = await request(
      "GET",
      "/api/analytics/event-summary?event=test_event"
    );
    console.log("✅ Event summary:", summary.data);
    console.log("");

    // Step 6: Get user stats
    console.log("5️⃣ Testing: Get user stats");
    const stats = await request(
      "GET",
      "/api/analytics/user-stats?userId=user0"
    );
    console.log("✅ User stats:", stats.data);
    console.log("");

    // Step 7: Get dashboard
    console.log("6️⃣ Testing: Get dashboard overview");
    const dashboard = await request(
      "GET",
      `/api/analytics/dashboard?app_id=${APP_ID}`
    );
    console.log("✅ Dashboard:", dashboard.data);
    console.log("");

    // Step 8: Test caching (run same request twice)
    console.log("7️⃣ Testing: Redis caching");
    const start1 = Date.now();
    await request("GET", "/api/analytics/event-summary?event=test_event");
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await request("GET", "/api/analytics/event-summary?event=test_event");
    const time2 = Date.now() - start2;

    console.log(`✅ First request: ${time1}ms, Second request: ${time2}ms`);
    console.log(
      `   Cache improved speed by ${Math.round(
        ((time1 - time2) / time1) * 100
      )}%`
    );
    console.log("");

    console.log("🎉 All tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

runTests();
