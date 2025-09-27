require('dotenv').config();
const { App } = require('@slack/bolt');

// Initialize Slack Bolt app with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Handle /buyer-profile slash command
app.command('/buyer-profile', async ({ command, ack, body, client }) => {
  await ack();

  try {
    // Open modal with buyer profile form
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'buyer_profile_modal',
        title: {
          type: 'plain_text',
          text: 'Buyer Profile'
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
            block_id: 'company_name',
            element: {
              type: 'plain_text_input',
              action_id: 'company_name_input',
              placeholder: {
                type: 'plain_text',
                text: 'Enter your company name'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Company Name'
            }
          },
          {
            type: 'input',
            block_id: 'industry',
            element: {
              type: 'static_select',
              action_id: 'industry_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select your industry'
              },
              options: [
                {
                  text: { type: 'plain_text', text: 'Technology' },
                  value: 'technology'
                },
                {
                  text: { type: 'plain_text', text: 'Healthcare' },
                  value: 'healthcare'
                },
                {
                  text: { type: 'plain_text', text: 'Finance' },
                  value: 'finance'
                },
                {
                  text: { type: 'plain_text', text: 'Manufacturing' },
                  value: 'manufacturing'
                },
                {
                  text: { type: 'plain_text', text: 'Retail' },
                  value: 'retail'
                },
                {
                  text: { type: 'plain_text', text: 'Other' },
                  value: 'other'
                }
              ]
            },
            label: {
              type: 'plain_text',
              text: 'Industry'
            }
          },
          {
            type: 'input',
            block_id: 'budget_range',
            element: {
              type: 'static_select',
              action_id: 'budget_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select your budget range'
              },
              options: [
                {
                  text: { type: 'plain_text', text: '$1,000 - $5,000' },
                  value: '1000-5000'
                },
                {
                  text: { type: 'plain_text', text: '$5,000 - $10,000' },
                  value: '5000-10000'
                },
                {
                  text: { type: 'plain_text', text: '$10,000 - $25,000' },
                  value: '10000-25000'
                },
                {
                  text: { type: 'plain_text', text: '$25,000 - $50,000' },
                  value: '25000-50000'
                },
                {
                  text: { type: 'plain_text', text: '$50,000+' },
                  value: '50000+'
                }
              ]
            },
            label: {
              type: 'plain_text',
              text: 'Budget Range'
            }
          },
          {
            type: 'input',
            block_id: 'requirements',
            element: {
              type: 'plain_text_input',
              action_id: 'requirements_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Describe your project requirements...'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Project Requirements'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Handle modal submission
app.view('buyer_profile_modal', async ({ ack, body, view, client }) => {
  await ack();

  // Extract form data
  const values = view.state.values;
  const companyName = values.company_name.company_name_input.value;
  const industry = values.industry.industry_select.selected_option.value;
  const budgetRange = values.budget_range.budget_select.selected_option.value;
  const requirements = values.requirements.requirements_input.value;

  try {
    // Send confirmation message to user
    await client.chat.postMessage({
      channel: body.user.id,
      text: `Thank you for submitting your buyer profile!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Buyer Profile Submitted Successfully!*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Company:* ${companyName}`
            },
            {
              type: 'mrkdwn',
              text: `*Industry:* ${industry}`
            },
            {
              type: 'mrkdwn',
              text: `*Budget:* ${budgetRange}`
            },
            {
              type: 'mrkdwn',
              text: `*Requirements:* ${requirements}`
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
  }
});

// Handle simple hello message
app.message('hello', async ({ message, say }) => {
  // Skip bot messages
  if (message.subtype === 'bot_message') return;

  await say(`Hello <@${message.user}>! 👋 Use the \`/buyer-profile\` command to get started with your project.`);
});

// Error handling
app.error((error) => {
  console.error('App error occurred:', error);
});

// Start the app
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Buyer Workflow MVP is running!');
  } catch (error) {
    console.error('Error starting app:', error);
    process.exit(1);
  }
})();