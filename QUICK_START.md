# Quick Start Guide

Get your Buyer Workflow MVP running in 5 minutes.

---

## Prerequisites

- Node.js v14+ installed
- A Slack workspace where you can install apps
- 10 minutes to configure Slack app

---

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to project
cd buyer-workflow-mvp

# Install dependencies
npm install
```

---

## Step 2: Configure Slack App (5 minutes)

### 2.1 Create Slack App
1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name: `Buyer Workflow MVP`
4. Select your workspace

### 2.2 Enable Socket Mode
1. In your app settings, go to **Socket Mode**
2. Toggle **"Enable Socket Mode"** to ON
3. Create an app-level token:
   - Token Name: `socket-mode-token`
   - Scopes: `connections:write`
   - Click **"Generate"**
   - **Copy the token** (starts with `xapp-`) - you'll need this

### 2.3 Add OAuth Scopes
1. Go to **"OAuth & Permissions"**
2. Under **"Bot Token Scopes"**, add:
   - `chat:write`
   - `commands`
   - `channels:history`
   - `app_mentions:read`

### 2.4 Create Slash Command
1. Go to **"Slash Commands"**
2. Click **"Create New Command"**
3. Fill in:
   - **Command:** `/buyer-profile`
   - **Request URL:** `https://example.com` (placeholder - Socket Mode doesn't use this)
   - **Short Description:** `Collect buyer preferences`
4. Click **"Save"**

### 2.5 Subscribe to Events
1. Go to **"Event Subscriptions"**
2. Toggle **"Enable Events"** to ON
3. Under **"Subscribe to bot events"**, add:
   - `message.channels`
   - `app_mention`
4. Click **"Save Changes"**

### 2.6 Install App to Workspace
1. Go to **"Install App"**
2. Click **"Install to Workspace"**
3. Click **"Allow"**
4. **Copy the Bot User OAuth Token** (starts with `xoxb-`)

### 2.7 Get Signing Secret
1. Go to **"Basic Information"**
2. Under **"App Credentials"**, find **"Signing Secret"**
3. Click **"Show"** and **copy it**

---

## Step 3: Configure Environment (1 minute)

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your tokens
nano .env  # or use your preferred editor
```

Paste your tokens:
```env
SLACK_BOT_TOKEN=xoxb-your-actual-token-here
SLACK_APP_TOKEN=xapp-your-actual-token-here
SLACK_SIGNING_SECRET=your-actual-secret-here
PORT=3000
```

Save and exit.

---

## Step 4: Run the Bot (30 seconds)

```bash
npm start
```

You should see:
```
⚡️ Buyer Workflow MVP is running!
```

---

## Step 5: Test in Slack (1 minute)

### 5.1 Invite Bot to Channel
In any Slack channel, type:
```
/invite @Buyer Workflow MVP
```

### 5.2 Test Hello Message
Type:
```
hello
```

Expected response:
```
Hello @YourName! 👋 Use the `/buyer-profile` command to get started with your project.
```

### 5.3 Test Slash Command
Type:
```
/buyer-profile
```

Expected result:
- Modal opens with 4 fields
- Fill them out and click "Submit"
- Receive confirmation DM with your preferences

---

## ✅ Success!

Your bot is now running. Here's what you can do:

- `/buyer-profile` - Opens buyer preferences form
- `hello` - Get usage instructions
- Check logs in your terminal for debugging

---

## 🔧 Troubleshooting

### "Command not found"
- Go to Slack app settings → Slash Commands
- Verify `/buyer-profile` is created
- Reinstall app to workspace

### "Modal doesn't open"
- Check terminal - bot must be running
- Verify Socket Mode is enabled
- Check you copied the App-Level Token correctly

### "Bot doesn't respond to hello"
- Type `/invite @Buyer Workflow MVP` in the channel
- Verify `message.channels` event subscription is enabled
- Check `channels:history` OAuth scope is granted

### "Still not working?"
- Restart the bot: `Ctrl+C` then `npm start`
- Check terminal for error messages
- Verify all tokens are correct in `.env`

---

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Review [PROJECT_SUBMISSION.md](PROJECT_SUBMISSION.md) for implementation details
- Check [SECURITY.md](SECURITY.md) for security considerations

---

## 🛑 Important Notes

- **Don't commit `.env` to git** - it contains secrets
- **This is a development setup** - Socket Mode requires bot always running
- **No data is saved** - preferences are only shown in confirmation message
- **For production** - implement data storage and security fixes (see PROJECT_SUBMISSION.md)

---

**Need Help?**
- Slack Bolt Docs: https://slack.dev/bolt-js/
- Slack API Docs: https://api.slack.com/