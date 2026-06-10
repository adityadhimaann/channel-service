# 📡 Mock Channel Service (Webhook Delivery Network)

This is a lightweight, isolated Node.js microservice built for the Xeno Mini CRM Take-Home Assignment. 

It acts as a **mock external delivery network** (simulating services like Twilio, SendGrid, or WhatsApp Business API). It does not permanently store any data, nor does it connect to a database. Its sole purpose is to receive message payloads from the CRM, simulate the chaos of network delivery, and asynchronously fire webhooks back to the CRM.

---

## 🛠 Tech Stack

- **Server**: [Express.js](https://expressjs.com/) (Node.js)
- **Real-time UI**: Socket.IO
- **Styling**: Tailwind CSS via CDN
- **Language**: JavaScript

---

## 🏗 Architecture & System Flow

This service ensures the CRM application successfully demonstrates a **decoupled webhook architecture**.

### 1. Ingestion (`POST /send`)
When the main CRM dispatches a campaign, it sends an HTTP POST request to this service containing an array of messages, the recipient details, and a `callbackUrl`. The Channel Service immediately responds with a `202 Accepted` to prevent the CRM from hanging.

### 2. Live Dashboard (Socket.IO)
The service maintains an in-memory array of the last 100 received messages. A lightweight HTML dashboard (served at `/`) uses Socket.IO to instantly render these incoming messages in a full-width, scrollable table.

### 3. Asynchronous Simulation (The Chaos)
Behind the scenes, the service runs a series of simulated network events using `setTimeout` to mimic real-world conditions:
- **Delivered**: Occurs 2-5 seconds after sending.
- **Failed**: A ~10% randomized chance a message bounces (simulating a bad number/email).
- **Opened**: Occurs 5-15 seconds after delivery (if successful).
- **Clicked**: Occurs 10-25 seconds after opening (with a ~30% probability).

### 4. Webhook Dispatch
Whenever a simulated event occurs, the service fires an HTTP POST request back to the `callbackUrl` provided by the CRM. This payload contains the `messageId`, `status` (delivered/opened/clicked/failed), and an ISO timestamp.

---

## 🚦 Design Philosophy

Why build this instead of just marking messages as "sent" in the main CRM?
- **Realism**: This exactly mirrors how asynchronous messaging queues operate in enterprise environments.
- **System Design**: It forces the CRM to handle incoming webhooks, update specific database rows based on UUIDs, and update frontend analytics dynamically via polling.
- **Statelessness**: If this service crashes and restarts, its memory wipes clean. It relies entirely on the CRM to be the persistent source of truth.

---

## 💻 Setup & Installation

### Prerequisites
- Node.js 18+

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd channel-service
npm install
```

### 2. Run the Server
```bash
node index.js
```
The service will start on port `4000`.

### 3. Using the Dashboard
Open [http://localhost:4000](http://localhost:4000) in your browser. 
Whenever the main CRM sends a campaign, the messages will instantly appear here, and you can watch their status badges cycle through Delivered → Opened → Clicked in real-time.

---

*Built for the Xeno Engineering Take-Home Assignment.*
