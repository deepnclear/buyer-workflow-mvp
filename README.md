# Buyer Workflow MVP

A Slack app that streamlines the buyer onboarding process by collecting detailed buyer preferences through interactive modals.

## Features

- **🔗 Slash Command Integration**: Use `/buyer-profile` to trigger the buyer preferences collection workflow
- **📋 Interactive Modal**: Clean, user-friendly form with text inputs for real estate preferences
- **🏠 Comprehensive Data Collection**: Captures search areas, price range, bedrooms, and must-haves/notes
- **✅ Instant Confirmation**: Sends formatted confirmation message with collected preferences
- **👋 Friendly Greeting**: Responds to "hello" messages with helpful guidance

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- A Slack workspace where you can install apps
- Slack app with appropriate permissions (see below)

### Slack App Configuration

1. Create a new Slack app at [api.slack.com](https://api.slack.com/apps)
2. Enable **Socket Mode** in your app settings
3. Add the following **OAuth Scopes** under "OAuth & Permissions":
   - `chat:write`
   - `commands`
   - `channels:history`
   - `app_mentions:read`
   - `files:write` (optional, for future PDF export functionality)

4. Add the following **Slash Commands**:
   - Command: `/buyer-profile`
   - Request URL: (not needed for Socket Mode)
   - Short Description: "Collect buyer profile information"

5. **Subscribe to Bot Events** under "Event Subscriptions":
   - `message.channels`
   - `app_mention`

6. **Generate tokens**:
   - Copy your **Bot User OAuth Token** (starts with `xoxb-`)
   - Copy your **App-Level Token** (starts with `xapp-`)
   - Copy your **Signing Secret**

### Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd buyer-workflow-mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   PORT=3000
   ```

4. Install the app to your Slack workspace by going to "Install App" in your Slack app settings

## How to Run Locally

1. Start the application:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. You should see the message: `⚡️ Buyer Workflow MVP is running!`

3. In your Slack workspace:
   - Invite the bot to a public channel: `/invite @Buyer Workflow MVP`
   - Type "hello" in the channel to get a friendly greeting and instructions
   - Use `/buyer-profile` to open the buyer preferences modal
   - Fill out the form and submit to see the confirmation message

## Usage

### Buyer Profile Command

1. Type `/buyer-profile` in any Slack channel where the bot is present
2. Fill out the modal form with:
   - **Search Areas**: Desired neighborhoods/locations
   - **Price Range**: Preferred budget
   - **Bedrooms**: Target number of bedrooms
   - **Must-Haves / Notes**: Key features or requirements

3. Click "Submit" to save your preferences
4. Receive an instant confirmation message with your submitted information

### Hello Message

Simply type "hello" in a channel where the bot is present to receive a greeting and usage instructions.

## Project Structure

```
buyer-workflow-mvp/
├── index.js          # Main application file
├── package.json      # Project dependencies and scripts
├── .env             # Environment variables (not tracked in git)
├── .gitignore       # Git ignore rules
└── README.md        # This file
```

## Dependencies

- **@slack/bolt**: Slack Bolt framework for building Slack apps
- **dotenv**: Environment variable management

## Security

- Credentials are loaded from `.env` file for local development
- In production, store sensitive tokens via encrypted environment variables or a secret manager
- Never commit `.env` files or tokens to version control

## License

ISC