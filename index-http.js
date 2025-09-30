require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { WebClient } = require('@slack/web-api');

const app = express();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// ============================================
// MIDDLEWARE
// ============================================

// Capture raw body for signature verification (required for both JSON and URL-encoded requests)
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({
  extended: true,
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// ============================================
// SLACK SIGNATURE VERIFICATION
// ============================================

/**
 * Verifies that requests are genuinely from Slack using HMAC signature validation
 * Protects against replay attacks by checking timestamp freshness
 */
function verifySlackSignature(req, res, next) {
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!slackSignature || !timestamp) {
    console.error('Missing Slack signature headers');
    return res.status(400).send('Missing signature headers');
  }

  // Prevent replay attacks - reject requests older than 5 minutes
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 60 * 5) {
    console.error('Request timestamp is too old');
    return res.status(400).send('Request timestamp too old');
  }

  // Compute and compare signatures using timing-safe comparison
  const sigBasestring = `v0:${timestamp}:${req.rawBody}`;
  const computedSignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(slackSignature),
    Buffer.from(computedSignature)
  );

  if (!isValid) {
    console.error('Invalid Slack signature');
    return res.status(403).send('Invalid signature');
  }

  next();
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'http'
  });
});

// ============================================
// SLASH COMMAND ENDPOINT
// ============================================

/**
 * Handles /buyer-profile slash command
 * Opens a modal form for collecting buyer preferences
 */
app.post('/slack/commands', verifySlackSignature, async (req, res) => {
  // Acknowledge command immediately (Slack requires response within 3 seconds)
  res.status(200).send();

  try {
    await slackClient.views.open({
      trigger_id: req.body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'buyer_profile_modal',
        title: {
          type: 'plain_text',
          text: 'Buyer Preferences'
        },
        submit: {
          type: 'plain_text',
          text: 'Submit'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'search_area',
            element: {
              type: 'plain_text_input',
              action_id: 'search_area_input',
              placeholder: {
                type: 'plain_text',
                text: 'e.g., Downtown, Suburbs, Specific neighborhoods'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Search Area'
            }
          },
          {
            type: 'input',
            block_id: 'price_range',
            element: {
              type: 'plain_text_input',
              action_id: 'price_range_input',
              placeholder: {
                type: 'plain_text',
                text: 'e.g., $300,000 - $500,000'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Price Range'
            }
          },
          {
            type: 'input',
            block_id: 'bedrooms',
            element: {
              type: 'plain_text_input',
              action_id: 'bedrooms_input',
              placeholder: {
                type: 'plain_text',
                text: 'e.g., 3, 2-4, 3+'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Bedrooms'
            }
          },
          {
            type: 'input',
            block_id: 'must_haves_notes',
            element: {
              type: 'plain_text_input',
              action_id: 'must_haves_notes_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'e.g., Must have garage, prefer updated kitchen, close to schools...'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Must-Haves / Notes'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// ============================================
// INTERACTIVE COMPONENTS ENDPOINT
// ============================================

/**
 * Handles modal submissions and other interactive components
 * Sends confirmation message with submitted preferences
 */
app.post('/slack/interactions', verifySlackSignature, async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  // Handle buyer profile modal submission
  if (payload.type === 'view_submission' && payload.view.callback_id === 'buyer_profile_modal') {
    res.status(200).send();

    const values = payload.view.state.values;
    const searchArea = values.search_area.search_area_input.value;
    const priceRange = values.price_range.price_range_input.value;
    const bedrooms = values.bedrooms.bedrooms_input.value;
    const mustHavesNotes = values.must_haves_notes.must_haves_notes_input.value;

    try {
      await slackClient.chat.postMessage({
        channel: payload.user.id,
        text: 'Thank you for submitting your buyer preferences!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Buyer Preferences Submitted Successfully!*'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Search Area:* ${searchArea}`
              },
              {
                type: 'mrkdwn',
                text: `*Price Range:* ${priceRange}`
              },
              {
                type: 'mrkdwn',
                text: `*Bedrooms:* ${bedrooms}`
              },
              {
                type: 'mrkdwn',
                text: `*Must-Haves / Notes:* ${mustHavesNotes}`
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }
  } else {
    res.status(200).send();
  }
});

// ============================================
// EVENTS ENDPOINT
// ============================================

/**
 * Handles Slack events including messages
 * Responds to "hello" messages with greeting and instructions
 */
app.post('/slack/events', async (req, res) => {
  const { type, event, challenge } = req.body;

  // Handle URL verification challenge (occurs during initial setup)
  if (type === 'url_verification') {
    return res.status(200).json({ challenge });
  }

  // Verify signature for all event requests
  verifySlackSignature(req, res, async () => {
    res.status(200).send();

    if (event && event.type === 'message') {
      // Ignore bot messages to prevent infinite loops
      if (event.bot_id || event.subtype === 'bot_message') {
        return;
      }

      // Skip message edits, deletes, and other subtypes
      if (event.subtype && event.subtype !== 'thread_broadcast') {
        return;
      }

      // Respond to hello messages
      if (event.text && event.text.toLowerCase().includes('hello')) {
        try {
          await slackClient.chat.postMessage({
            channel: event.channel,
            text: `Hello <@${event.user}>! 👋 Use the \`/buyer-profile\` command to get started with your project.`
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('⚡️ Buyer Workflow MVP (HTTP Mode) is running!');
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Endpoints:');
  console.log(`   POST /slack/commands - Slash commands`);
  console.log(`   POST /slack/interactions - Interactive components`);
  console.log(`   POST /slack/events - Event subscriptions`);
  console.log(`   GET  /health - Health check`);
});