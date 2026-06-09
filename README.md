# 📡 Channel Service (Mock Delivery Gateway)

This is the **Channel Service** component for the Roast & Co. AI-Native CRM. 

## 🌟 What is this?
In the real world, CRMs do not physically deliver text messages or emails themselves. They hand the messages off to dedicated Delivery Gateways (like Twilio, SendGrid, or AWS SES). 

This standalone Node.js (Express) server acts as that mock delivery gateway. It exists entirely separate from the main CRM, fulfilling the exact requirements of a "two-service, callback-driven loop".

## ⚙️ How it Works
1. **Receives Payloads**: It exposes a `/send` API endpoint that accepts messages from the CRM. It immediately returns a `200 OK` so the CRM isn't kept waiting.
2. **Simulates Reality**: It uses asynchronous `setTimeout` loops and randomized math to simulate network latency, delivery failures (15% chance), open rates (40% chance), and click rates (25% chance).
3. **Fires Webhooks**: As the simulated lifecycle progresses, it fires HTTP POST requests (webhooks) back to the CRM's receipt API to announce exactly what "happened" to each message.
4. **Live Dashboard**: It features a lightweight, full-screen frontend UI (`/public/index.html`) that tracks the live network traffic flowing through the server in real-time.

## 🚀 How to Run Locally
1. Clone this repository.
2. Install dependencies: `npm install`
3. Start the server: `node index.js`
4. The server runs on port `3001` by default. Visit `http://localhost:3001` to view the live traffic dashboard.

## 💾 Why No Database?
This service is intentionally designed to be **stateless**. It only holds a maximum of 100 recent messages in temporary RAM just to power the visual dashboard. 

In a robust microservice architecture, the CRM is the "Source of Truth" that permanently stores data. This Channel Service is simply a "dumb" worker that processes deliveries and forgets about them once the webhook is successfully fired.
