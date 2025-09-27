# Buyer Workflow MVP

A Slack app that streamlines the buyer onboarding process by collecting detailed buyer profiles through interactive modals.

## Features

- **🔗 Slash Command Integration**: Use `/buyer-profile` to trigger the buyer profile collection workflow
- **📋 Interactive Modal**: Clean, user-friendly form with dropdowns and text inputs
- **💼 Comprehensive Data Collection**: Captures company name, industry, budget range, and project requirements
- **✅ Instant Confirmation**: Sends formatted confirmation message with collected data
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
   - `im:write`

4. Add the following **Slash Commands**:
   - Command: `/buyer-profile`
   - Request URL: (not needed for Socket Mode)
   - Short Description: "Collect buyer profile information"

5. **Subscribe to Bot Events** under "Event Subscriptions":
   - `message.channels`
   - `message.im`

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
   - Type "hello" to get a friendly greeting and instructions
   - Use `/buyer-profile` to open the buyer profile modal
   - Fill out the form and submit to see the confirmation message

## Usage

### Buyer Profile Command

1. Type `/buyer-profile` in any Slack channel or direct message
2. Fill out the modal form with:
   - **Company Name**: Your organization's name
   - **Industry**: Select from predefined options (Technology, Healthcare, Finance, etc.)
   - **Budget Range**: Choose your project budget range
   - **Project Requirements**: Describe your specific needs

3. Click "Submit" to save your profile
4. Receive an instant confirmation message with your submitted information

### Hello Message

Simply type "hello" in a channel where the bot is present or in a direct message to receive a greeting and usage instructions.

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

## License

ISC