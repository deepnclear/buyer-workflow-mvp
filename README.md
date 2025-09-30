# Buyer Workflow MVP

A production-ready Slack bot that streamlines real estate buyer onboarding by collecting detailed buyer preferences through interactive modals. Built with Node.js, Express, and the Slack API.

## Overview

This application provides real estate agents with an efficient way to collect and organize buyer preferences directly within Slack. Users can submit their home search criteria through an intuitive modal interface, and receive instant confirmation with their submitted preferences.

## Features Implemented

- **✅ Slash Command**: `/buyer-profile` triggers the preferences collection workflow
- **✅ Interactive Modal**: User-friendly form collecting real estate buyer preferences
- **✅ HTTP Mode**: Production-ready Express server with proper request handling
- **✅ Secure Signature Verification**: HMAC-based request validation preventing unauthorized access
- **✅ Bot Message Filtering**: Prevents infinite loops by ignoring bot's own messages
- **✅ Instant Confirmation**: Formatted DM with submitted preferences
- **✅ Hello Command**: Friendly greeting with usage instructions
- **✅ Error Handling**: Comprehensive error catching and logging

## What It Does

The bot collects four key buyer preferences:

1. **Search Area** - Desired neighborhoods, cities, or regions
2. **Price Range** - Budget constraints (e.g., $300,000 - $500,000)
3. **Bedrooms** - Number of bedrooms needed (e.g., 3, 2-4, 3+)
4. **Must-Haves / Notes** - Essential features and additional requirements

## Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Slack Integration**: @slack/web-api, @slack/bolt
- **Environment Management**: dotenv
- **Security**: Crypto (HMAC signature verification)
- **Local Development**: ngrok (for webhook tunneling)

## Prerequisites

Before you begin, ensure you have:

- Node.js v14 or higher installed
- A Slack workspace where you have admin permissions
- ngrok installed (for local development with webhooks)
- Git (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/deepnclear/buyer-workflow-mvp.git
cd buyer-workflow-mvp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (use `.env.example` as reference):

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

## Slack App Configuration

### Step 1: Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name your app (e.g., "Buyer Workflow MVP")
4. Select your workspace

### Step 2: Configure OAuth Scopes

Navigate to **"OAuth & Permissions"** and add these Bot Token Scopes:

- `chat:write` - Send messages as the bot
- `commands` - Create and handle slash commands
- `channels:history` - Read messages in public channels
- `im:write` - Send direct messages to users

### Step 3: Create Slash Command

Navigate to **"Slash Commands"** and create:

- **Command**: `/buyer-profile`
- **Request URL**: `https://your-ngrok-url.ngrok.io/slack/commands`
- **Short Description**: "Collect buyer preferences"
- **Usage Hint**: (leave blank)

### Step 4: Enable Event Subscriptions

Navigate to **"Event Subscriptions"**:

1. Toggle **"Enable Events"** to **On**
2. Set **Request URL**: `https://your-ngrok-url.ngrok.io/slack/events`
3. Under **"Subscribe to bot events"**, add:
   - `message.channels` - Listen to messages in public channels

### Step 5: Get Your Credentials

1. **Bot Token**: Go to **"OAuth & Permissions"** → Copy **"Bot User OAuth Token"** (starts with `xoxb-`)
2. **Signing Secret**: Go to **"Basic Information"** → Copy **"Signing Secret"**
3. **App Token**: Go to **"Basic Information"** → **"App-Level Tokens"** → Generate token with `connections:write` scope (starts with `xapp-`)

### Step 6: Install App to Workspace

1. Go to **"Install App"**
2. Click **"Install to Workspace"**
3. Authorize the permissions

## Running Locally with ngrok

### Step 1: Start ngrok

In a separate terminal window:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)

### Step 2: Update Slack App URLs

Go back to your Slack app configuration and update:

1. **Slash Commands** → `/buyer-profile` → Request URL: `https://your-ngrok-url.ngrok.io/slack/commands`
2. **Event Subscriptions** → Request URL: `https://your-ngrok-url.ngrok.io/slack/events`
3. Click **"Save Changes"**

### Step 3: Start the Application

```bash
npm start
```

You should see:

```
⚡️ Buyer Workflow MVP (HTTP Mode) is running!
📡 Server listening on port 3000
```

## Usage

### Testing the Bot

1. **Invite the bot to a channel**:
   ```
   /invite @Buyer Workflow MVP
   ```

2. **Test hello command**:
   - Type `hello` in the channel
   - Bot should respond with greeting and instructions

3. **Use the slash command**:
   - Type `/buyer-profile` in any channel
   - Fill out the modal form
   - Click **Submit**
   - Receive confirmation DM with your preferences

## Project Structure

```
buyer-workflow-mvp/
├── index-http.js              # Main HTTP server (production)
├── index.js                   # Socket Mode version (alternative)
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── HTTP_MIGRATION_GUIDE.md    # Migration guide to HTTP mode
├── QUICK_START.md             # Quick setup guide
├── SECURITY.md                # Security implementation details
└── PROJECT_SUBMISSION.md      # Project submission documentation
```

### File Descriptions

- **index-http.js**: Production server using Express with HTTP endpoints for Slack webhooks
- **index.js**: Alternative implementation using Socket Mode (WebSocket connection)
- **HTTP_MIGRATION_GUIDE.md**: Detailed guide for migrating from Socket to HTTP mode
- **SECURITY.md**: Security implementation including signature verification
- **QUICK_START.md**: Condensed setup guide for quick deployment

## Security Implementation

### Request Signature Verification

All incoming requests from Slack are verified using HMAC-SHA256 signature validation:

1. **Timestamp Validation**: Rejects requests older than 5 minutes (prevents replay attacks)
2. **Signature Computation**: Compares Slack's signature with computed HMAC signature
3. **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks

### Bot Message Filtering

Prevents infinite loops by checking:
- `event.bot_id` - Identifies messages from bots
- `event.subtype === 'bot_message'` - Identifies bot message subtypes

### Environment Security

- Sensitive credentials stored in `.env` file (not committed to git)
- `.env.example` provided as template without actual secrets
- Signing secret never exposed in logs or responses

## Testing

### Manual Testing Checklist

- [ ] Bot responds to "hello" messages
- [ ] `/buyer-profile` command opens modal
- [ ] Modal form validation works
- [ ] Form submission sends confirmation DM
- [ ] Bot ignores its own messages (no infinite loops)
- [ ] Invalid Slack signatures are rejected
- [ ] Health check endpoint responds: `GET http://localhost:3000/health`

### Health Check

Test the server health:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T14:00:00.000Z",
  "mode": "http"
}
```

## Known Limitations

### Current Implementation (Part A)

- ✅ Data collection via modal - **Implemented**
- ✅ Instant confirmation message - **Implemented**
- ❌ Database persistence - **Not implemented** (preferences not stored)
- ❌ Agent assignment - **Not implemented**
- ❌ Property recommendations - **Not implemented**

### Technical Constraints

- No database integration (preferences only shown in confirmation, not persisted)
- No agent workflow automation
- No property matching or recommendation engine
- Single-form workflow (no multi-step preference refinement)

## Future Improvements (Part B Features)

### Phase 1: Data Persistence
- Database integration (PostgreSQL/MongoDB)
- Store buyer preferences with timestamps
- Associate preferences with user IDs

### Phase 2: Agent Assignment
- Agent availability tracking
- Automated agent assignment based on criteria
- Agent notification system

### Phase 3: Property Matching
- Integration with MLS/property databases
- Automated property recommendation engine
- Daily/weekly property digest messages

### Phase 4: Enhanced UX
- Multi-step preference collection
- Preference editing/updating
- Search history tracking
- Preference comparison and refinement

### Phase 5: Analytics
- Buyer preference trends
- Agent performance metrics
- Response time tracking
- Conversion analytics

## Troubleshooting

### Bot Not Responding

1. Check ngrok is running and URL is updated in Slack app config
2. Verify `.env` file has correct tokens
3. Check server logs for errors
4. Ensure bot is invited to the channel

### Signature Verification Failing

1. Verify `SLACK_SIGNING_SECRET` in `.env` is correct
2. Check that ngrok URL is using HTTPS
3. Ensure request URL in Slack config matches ngrok URL exactly

### Modal Not Opening

1. Check that `/buyer-profile` command is configured in Slack app
2. Verify `SLACK_BOT_TOKEN` has `commands` scope
3. Look for error messages in server logs

## Deployment Considerations

### Production Deployment

For production deployment, consider:

1. **Hosting**: Deploy to Heroku, AWS, DigitalOcean, or similar
2. **Environment Variables**: Use platform-specific secret management
3. **HTTPS**: Required for Slack webhooks (no ngrok in production)
4. **Database**: Add PostgreSQL or MongoDB for persistence
5. **Monitoring**: Implement logging and error tracking (e.g., Sentry)
6. **Rate Limiting**: Add rate limiting middleware
7. **Process Management**: Use PM2 or similar for process supervision

### Environment-Specific Configuration

Production `.env` should include:
```env
NODE_ENV=production
SLACK_BOT_TOKEN=xoxb-production-token
SLACK_SIGNING_SECRET=production-signing-secret
DATABASE_URL=postgresql://...
LOG_LEVEL=info
```

## Contributing

This is a private MVP project. For questions or issues, contact the development team.

## License

ISC

## Contact

For support or questions about this project, please contact the repository maintainer.

---

**Version**: 2.0.0
**Last Updated**: 2025-09-30
**Status**: Production Ready (Part A Complete)