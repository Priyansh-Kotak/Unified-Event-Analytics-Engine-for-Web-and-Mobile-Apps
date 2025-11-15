const axios = require("axios");

// Configuration
const API_URL = "http://localhost:3000";
const API_KEY = "ak_2b735bdf982a5ff26c2cb7c579bbb6460af5c6dfc81f214e75f2c7b45bddc052"; // Replace with your actual API key

// Function to send test event
async function sendTestEvent() {
  try {
    const eventData = {
      event: "login_form_cta_click",
      url: "https://example.com/login",
      referrer: "https://google.com",
      device: "mobile",
      userId: "user123",
      timestamp: new Date().toISOString(),
      metadata: {
        browser: "Chrome",
        os: "Android",
        screenSize: "1080x1920",
        userAgent: "Mozilla/5.0 (Linux; Android 10)",
      },
    };

    console.log("Sending event:", eventData);

    const response = await axios.post(
      `${API_URL}/api/analytics/collect`,
      eventData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    console.log("✅ Event sent successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Error sending event:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
    } else {
      console.error(error.message);
    }
  }
}

// Function to send multiple test events
async function sendMultipleEvents(count = 10) {
  const events = [
    "login_form_cta_click",
    "signup_button_click",
    "page_view",
    "product_view",
    "add_to_cart",
  ];

  const devices = ["mobile", "desktop", "tablet"];

  console.log(`Sending ${count} test events...`);

  for (let i = 0; i < count; i++) {
    const eventData = {
      event: events[Math.floor(Math.random() * events.length)],
      url: `https://example.com/page${i}`,
      referrer:
        Math.random() > 0.5 ? "https://google.com" : "https://facebook.com",
      device: devices[Math.floor(Math.random() * devices.length)],
      userId: `user${Math.floor(Math.random() * 100)}`,
      timestamp: new Date().toISOString(),
      metadata: {
        browser: "Chrome",
        os: "Android",
        screenSize: "1080x1920",
      },
    };

    try {
      await axios.post(`${API_URL}/api/analytics/collect`, eventData, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      });
      console.log(`✅ Event ${i + 1}/${count} sent`);
    } catch (error) {
      console.error(
        `❌ Event ${i + 1}/${count} failed:`,
        error.response?.data || error.message
      );
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("✅ All events sent!");
}

// Run the test
const args = process.argv.slice(2);
const command = args[0];

if (command === "multiple") {
  const count = parseInt(args[1]) || 10;
  sendMultipleEvents(count);
} else {
  sendTestEvent();
}
