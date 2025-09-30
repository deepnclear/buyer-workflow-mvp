require('dotenv').config();
const { App } = require('@slack/bolt');

// ============================================
// INITIALIZE SLACK APP (SOCKET MODE)
// ============================================

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// ============================================
// SLASH COMMAND HANDLER
// ============================================

/**
 * Handles /buyer-profile slash command
 * Opens a modal form for collecting buyer preferences
 */
app.command('/buyer-profile', async ({ command, ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
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
// MODAL SUBMISSION HANDLER
// ============================================

/**
 * Handles modal submission for buyer preferences
 * Sends confirmation message with submitted data
 */
app.view('buyer_profile_modal', async ({ ack, body, view, client }) => {
  await ack();

  const values = view.state.values;
  const searchArea = values.search_area.search_area_input.value;
  const priceRange = values.price_range.price_range_input.value;
  const bedrooms = values.bedrooms.bedrooms_input.value;
  const mustHavesNotes = values.must_haves_notes.must_haves_notes_input.value;

  try {
    await client.chat.postMessage({
      channel: body.user.id,
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
});

// ============================================
// MESSAGE HANDLER
// ============================================

/**
 * Responds to "hello" messages with greeting and instructions
 * Includes bot message filtering to prevent infinite loops
 */
app.message('hello', async ({ message, say }) => {
  // Ignore bot messages to prevent infinite loops
  if (message.bot_id || message.subtype === 'bot_message') {
    return;
  }

  // Skip message edits, deletes, and other subtypes
  if (message.subtype && message.subtype !== 'thread_broadcast') {
    return;
  }

  try {
    await say(`Hello <@${message.user}>! 👋 Use the \`/buyer-profile\` command to get started with your project.`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.error((error) => {
  console.error('App error occurred:', error);
});

// ============================================
// START APP
// ============================================

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Buyer Workflow MVP (Socket Mode) is running!');
  } catch (error) {
    console.error('Error starting app:', error);
    process.exit(1);
  }
})();