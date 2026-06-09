const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory message tracking for the dashboard (max 100 items)
const trackedMessages = [];

function updateTrackedMessage(id, updateData) {
  const msg = trackedMessages.find(m => m.id === id);
  if (msg) {
    Object.assign(msg, updateData);
    msg.updatedAt = new Date().toISOString();
  }
}

app.get('/api/messages', (req, res) => {
  res.json({ messages: trackedMessages });
});

app.post('/send', async (req, res) => {
  const { messageId, recipient, content, channel, callbackUrl } = req.body;

  // Track it locally for the dashboard
  const recipientName = Array.isArray(recipient) ? "Multiple" : (recipient?.name || recipient || 'Unknown');
  trackedMessages.unshift({
    id: messageId,
    recipient: recipientName,
    content: content,
    channel: channel,
    status: 'accepted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Keep only the latest 100
  if (trackedMessages.length > 100) {
    trackedMessages.pop();
  }

  // Acknowledge immediately — don't make CRM wait
  res.json({ status: 'accepted', messageId });

  // Simulate the full delivery lifecycle asynchronously
  simulateDelivery(messageId, callbackUrl);
});

async function simulateDelivery(messageId, callbackUrl) {
  try {
    const failed = Math.random() < 0.15;  // 15% failure rate

    // Step 1: delivered or failed after 2-5 seconds
    await delay(randomBetween(2000, 5000));

    if (failed) {
      updateTrackedMessage(messageId, { status: 'failed' });
      await callback(callbackUrl, { messageId, event: 'failed' });
      return;
    }

    updateTrackedMessage(messageId, { status: 'delivered' });
    await callback(callbackUrl, { messageId, event: 'delivered' });

    // Step 2: 40% open rate after delivery
    if (Math.random() < 0.40) {
      await delay(randomBetween(3000, 15000));
      updateTrackedMessage(messageId, { status: 'opened' });
      await callback(callbackUrl, { messageId, event: 'opened' });

      // Step 3: 25% click rate after open
      if (Math.random() < 0.25) {
        await delay(randomBetween(1000, 8000));
        updateTrackedMessage(messageId, { status: 'clicked' });
        await callback(callbackUrl, { messageId, event: 'clicked' });
      }
    }
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

async function callback(url, data) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log(`Callback ${data.event} for ${data.messageId}: ${res.status}`);
  } catch(e) {
    console.error(`Callback failed for ${data.event}`, e);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.listen(3001, () => console.log('Channel service running on port 3001'));
