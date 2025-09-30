# Migration Guide: Socket Mode → HTTP Request Mode

This guide will help you migrate your Slack bot from Socket Mode to HTTP Request Mode.

## ✅ What's Already Done

Your HTTP implementation is complete in `index-http.js` with:
- ✅ Express HTTP server with proper routing
- ✅ Slack signature verification (prevents unauthorized requests)
- ✅ Timestamp validation (prevents replay attacks)
- ✅ All three endpoints: slash commands, interactions, and events
- ✅ Health check endpoint
- ✅ Proper error handling

## 🔧 Configuration Steps

### Step 1: Set Up Your Environment Variables

You need **2 tokens** for HTTP mode (not 3 like Socket Mode):

1. **SLACK_BOT_TOKEN** (starts with `xoxb-`)
   - Get from: https://api.slack.com/apps → Your App → **OAuth & Permissions**

2. **SLACK_SIGNING_SECRET** (hex string)
   - Get from: https://api.slack.com/apps → Your App → **Basic Information** → App Credentials

**Note:** You do NOT need `SLACK_APP_TOKEN` for HTTP mode.

### Step 2: Expose Your Server to the Internet

Slack needs to reach your server via HTTPS. You have two options:

#### Option A: Local Development with ngrok (Recommended for testing)

1. Install ngrok: https://ngrok.com/download
2. Start your HTTP bot:
   ```bash
   npm start
   ```
3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

#### Option B: Production Deployment

Deploy to a cloud platform with HTTPS:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **AWS EC2/EB**: Requires SSL certificate
- **Google Cloud Run**: Automatic HTTPS

Your server will be accessible at your deployment URL.

### Step 3: Configure Slack App Request URLs

Go to https://api.slack.com/apps → Your App, then configure these URLs:

#### 3a. Slash Commands
1. Go to **Slash Commands**
2. Click on `/buyer-profile`
3. Set **Request URL** to: `https://YOUR-DOMAIN/slack/commands`
4. Click **Save**

#### 3b. Interactive Components
1. Go to **Interactivity & Shortcuts**
2. Turn on **Interactivity**
3. Set **Request URL** to: `https://YOUR-DOMAIN/slack/interactions`
4. Click **Save Changes**

#### 3c. Event Subscriptions
1. Go to **Event Subscriptions**
2. Turn on **Enable Events**
3. Set **Request URL** to: `https://YOUR-DOMAIN/slack/events`
   - Slack will send a challenge request to verify the URL
   - Your app will automatically respond (already implemented)
   - You should see a green "Verified ✓" checkmark
4. Under **Subscribe to bot events**, add:
   - `message.channels` - Listen to messages in public channels
   - `message.groups` - Listen to messages in private channels
   - `message.im` - Listen to direct messages
5. Click **Save Changes**

### Step 4: Update OAuth & Permissions

Go to **OAuth & Permissions** and ensure these scopes are enabled:

**Bot Token Scopes:**
- `chat:write` - Send messages
- `commands` - Receive slash commands
- `im:history` - Read DM messages
- `channels:history` - Read public channel messages
- `groups:history` - Read private channel messages

If you added new scopes, you must **reinstall the app** to your workspace.

### Step 5: Start Your Bot

```bash
# HTTP mode (default)
npm start

# Or explicitly
npm run start:http

# For Socket Mode (old)
npm run start:socket
```

You should see:
```
⚡️ Buyer Workflow MVP (HTTP Mode) is running!
📡 Server listening on port 3000
🔗 Health check: http://localhost:3000/health

📋 Endpoints:
   POST /slack/commands - Slash commands
   POST /slack/interactions - Interactive components
   POST /slack/events - Event subscriptions
   GET  /health - Health check
```

## 🧪 Testing Your Implementation

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T...",
  "mode": "http"
}
```

### Test 2: Slash Command
1. Go to your Slack workspace
2. Type `/buyer-profile` in any channel
3. Modal should appear immediately

### Test 3: Modal Submission
1. Fill out the buyer preferences form
2. Click **Submit**
3. You should receive a DM with the confirmation

### Test 4: Hello Message
1. Type `hello` in a channel where the bot is present
2. Bot should respond: "Hello @you! 👋 Use the `/buyer-profile` command to get started..."

## 🔒 Security Features Implemented

Your HTTP implementation includes enterprise-grade security:

### 1. **Signature Verification** (`index-http.js:21-59`)
- Verifies every request is from Slack using HMAC-SHA256
- Uses timing-safe comparison to prevent timing attacks
- Rejects requests with invalid signatures (403 Forbidden)

### 2. **Replay Attack Prevention** (`index-http.js:33-37`)
- Validates request timestamps
- Rejects requests older than 5 minutes
- Prevents attackers from replaying captured requests

### 3. **Immediate Acknowledgment** (`index-http.js:79, 187, 255`)
- All endpoints respond within 3 seconds (Slack requirement)
- Long-running tasks happen after acknowledgment
- Prevents timeout errors

### 4. **Error Handling** (`index-http.js:285-288`)
- Global error handler catches all exceptions
- Prevents app crashes from unexpected errors
- Logs errors for debugging

## 📊 Request Flow Comparison

### Socket Mode (Old)
```
Slack → WebSocket → Your App
- Requires SLACK_APP_TOKEN
- Persistent connection
- Works behind firewall
- No public URL needed
```

### HTTP Mode (New)
```
Slack → HTTPS POST → Your App
- Requires public HTTPS URL
- Stateless requests
- Standard REST API
- Industry standard
```

## 🚨 Common Issues & Solutions

### Issue 1: "url_verification failed"
**Cause:** Slack can't reach your server or signature verification failed.

**Solutions:**
- Ensure your server is running (`npm start`)
- Check ngrok is forwarding to port 3000
- Verify HTTPS URL is correct in Slack settings
- Check `SLACK_SIGNING_SECRET` is correct in `.env`

### Issue 2: "signing_secret_invalid"
**Cause:** Wrong signing secret in `.env`

**Solution:**
1. Go to https://api.slack.com/apps → Your App → Basic Information
2. Copy the **Signing Secret** (not the tokens)
3. Update `SLACK_SIGNING_SECRET` in `.env`
4. Restart your server

### Issue 3: Modal doesn't open
**Cause:** `trigger_id` expired or wrong endpoint URL

**Solutions:**
- Ensure `/slack/commands` is configured correctly
- Check server logs for errors
- `trigger_id` expires after 3 seconds (already handled)

### Issue 4: "This app is not responding"
**Cause:** Server didn't respond within 3 seconds

**Solutions:**
- Check server logs for crashes
- Verify network connectivity
- Already implemented: immediate `ack()` before processing

### Issue 5: Bot doesn't respond to messages
**Cause:** Event subscriptions not configured or bot not in channel

**Solutions:**
- Verify Event Subscriptions URL is correct
- Add bot to channel: `/invite @YourBot`
- Check `message.channels` scope is enabled

## 📝 Environment Variables Summary

```bash
# Required for HTTP Mode
SLACK_BOT_TOKEN=xoxb-...           # OAuth token
SLACK_SIGNING_SECRET=abc123...     # For request verification

# Optional
PORT=3000                          # Server port (default: 3000)

# NOT needed for HTTP Mode
SLACK_APP_TOKEN=xapp-...           # Only for Socket Mode
```

## 🔗 Slack App Dashboard URLs

After deploying, configure these URLs in your Slack app:

| Setting | URL Path | Full URL Example |
|---------|----------|------------------|
| Slash Commands | `/slack/commands` | `https://your-domain.com/slack/commands` |
| Interactivity | `/slack/interactions` | `https://your-domain.com/slack/interactions` |
| Event Subscriptions | `/slack/events` | `https://your-domain.com/slack/events` |
| Health Check | `/health` | `https://your-domain.com/health` |

**Important:** All URLs must use HTTPS (not HTTP) in production.

## 🎯 Production Deployment Checklist

Before going live, ensure:

- [ ] Server is deployed to production environment
- [ ] HTTPS is enabled (required by Slack)
- [ ] Environment variables are set correctly
- [ ] All three Slack URLs are configured
- [ ] Event subscriptions are verified (green checkmark)
- [ ] Bot scopes include `chat:write`, `commands`, and message history scopes
- [ ] Health check endpoint returns 200 OK
- [ ] Slash command works in Slack
- [ ] Modal submission sends confirmation
- [ ] "hello" message gets response
- [ ] Server logs show no errors

## 🆘 Support & Resources

- **Slack API Docs:** https://api.slack.com/apis/connections/events-api
- **Request Verification:** https://api.slack.com/authentication/verifying-requests-from-slack
- **ngrok Setup:** https://ngrok.com/docs/getting-started
- **Your App Dashboard:** https://api.slack.com/apps

## 🎉 Migration Complete!

You've successfully migrated from Socket Mode to HTTP Request Mode. Your bot now:
- ✅ Uses industry-standard HTTP endpoints
- ✅ Has enterprise-grade security (signature verification, replay prevention)
- ✅ Meets all Slack requirements (3-second responses, proper error handling)
- ✅ Supports all existing functionality (slash commands, modals, messages)

**Next Steps:**
1. Deploy to production
2. Configure Request URLs in Slack
3. Test all features
4. Monitor server logs for any issues