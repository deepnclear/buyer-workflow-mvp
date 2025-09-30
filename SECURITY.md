# Security Documentation

**Project:** Buyer Workflow MVP
**Last Updated:** September 30, 2025
**Status:** Development/MVP - NOT Production Ready

---

## 🔐 Security Overview

This document outlines the security measures implemented, known vulnerabilities, and recommendations for securing this application before production deployment.

---

## ✅ Implemented Security Measures

### 1. Credential Management
- **Environment Variables:** All sensitive tokens stored in `.env` file (not hardcoded)
- **Git Ignore:** `.env` file excluded from version control via `.gitignore`
- **Example File:** `.env.example` provided for setup without exposing real credentials

### 2. Slack Platform Security
- **Socket Mode:** WebSocket connection automatically verified by Slack Bolt SDK
- **Request Verification:** Slack Bolt handles signature verification automatically
- **HTTPS Transport:** All Slack API communications use HTTPS
- **OAuth Tokens:** Using proper OAuth 2.0 tokens (not legacy tokens)

### 3. Data Privacy
- **Private Messaging:** Buyer preference confirmations sent via DM (not posted publicly)
- **User-Specific Access:** Confirmation only sent to the user who submitted the form
- **No Public Data:** No buyer data exposed in channel messages

### 4. Token Scoping
- **Least Privilege:** Bot only requests necessary OAuth scopes:
  - `chat:write` - Send messages
  - `commands` - Handle slash commands
  - `channels:history` - Read channel messages (for "hello" handler)
  - `app_mentions:read` - Respond to mentions

---

## 🚨 Known Security Vulnerabilities

### CRITICAL Severity

#### 1. No Data Persistence Security
**Issue:** While data is currently not stored (which ironically prevents data breaches), when storage is implemented, there's no encryption or access control planned.

**Risk:** High - Buyer PII could be exposed if database is compromised

**Remediation:**
- Implement encryption at rest for all buyer preferences
- Use database-level encryption (e.g., PostgreSQL pgcrypto)
- Add application-level encryption for sensitive fields
- Implement role-based access control (RBAC)
- Add audit logging for all data access

**Code Example:**
```javascript
const crypto = require('crypto');

// Encrypt sensitive data before storage
function encryptField(text, key) {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Usage
const encryptedPreferences = {
  searchArea: encryptField(searchArea, process.env.ENCRYPTION_KEY),
  priceRange: encryptField(priceRange, process.env.ENCRYPTION_KEY),
  // ...
};
```

#### 2. No Input Validation
**Issue:** All form inputs accepted without validation or sanitization

**Risk:** High - Potential for XSS attacks, injection attacks, or data corruption

**Attack Vector:**
```javascript
// Malicious input example
searchArea = "<script>alert('XSS')</script>"
priceRange = "'; DROP TABLE users; --"
```

**Remediation:**
- Add input validation library (joi, zod, validator.js)
- Sanitize all user inputs before processing
- Enforce maximum length limits
- Validate format for structured fields (price range, bedrooms)

**Code Example:**
```javascript
const Joi = require('joi');

const buyerPreferenceSchema = Joi.object({
  searchArea: Joi.string().max(200).required(),
  priceRange: Joi.string().pattern(/^\$[\d,]+ - \$[\d,]+$/).required(),
  bedrooms: Joi.number().integer().min(1).max(10).required(),
  mustHavesNotes: Joi.string().max(1000).required()
});

// Validate before processing
const { error, value } = buyerPreferenceSchema.validate(formData);
if (error) {
  // Return error to user
}
```

### HIGH Severity

#### 3. Token Exposure in Logs (FIXED)
**Issue:** ~~Debug logs previously exposed verification tokens in command payload~~

**Status:** ✅ FIXED - Removed sensitive data logging in index.js:14

**Original Code:**
```javascript
// ❌ VULNERABLE - Logs entire command object including token
console.log('🔧 DEBUG: Command details:', JSON.stringify(command, null, 2));
```

**Fixed Code:**
```javascript
// ✅ SECURE - Only logs user_id, not tokens
console.log('🔧 DEBUG: /buyer-profile command received from user:', command.user_id);
```

#### 4. No Rate Limiting
**Issue:** Users can spam slash commands unlimited times

**Risk:** High - Denial of service (DoS) attack, resource exhaustion

**Attack Scenario:**
- Malicious user runs `/buyer-profile` 1000+ times/minute
- Bot opens 1000+ modals, consuming API rate limits
- Legitimate users unable to use the bot

**Remediation:**
- Implement rate limiting middleware
- Limit to 5 command invocations per user per minute
- Add exponential backoff for repeated requests

**Code Example:**
```javascript
const rateLimit = require('express-rate-limit');

const commandLimiter = new Map();

app.use(async ({ payload, next }) => {
  if (payload.command) {
    const userId = payload.user_id;
    const now = Date.now();
    const userLimit = commandLimiter.get(userId) || { count: 0, resetAt: now + 60000 };

    if (now > userLimit.resetAt) {
      userLimit.count = 0;
      userLimit.resetAt = now + 60000;
    }

    if (userLimit.count >= 5) {
      // Rate limit exceeded
      throw new Error('Too many requests. Please wait a minute.');
    }

    userLimit.count++;
    commandLimiter.set(userId, userLimit);
  }
  await next();
});
```

### MEDIUM Severity

#### 5. Plaintext Credentials in .env
**Issue:** Slack tokens stored in plaintext in `.env` file

**Risk:** Medium - If file system is compromised, tokens are immediately accessible

**Remediation:**
- Use secret management service in production:
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Google Secret Manager
- Never commit `.env` to version control (already prevented via `.gitignore`)
- Rotate tokens regularly (every 90 days)
- Use different tokens for dev/staging/production

**Code Example (AWS Secrets Manager):**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecrets() {
  const data = await secretsManager.getSecretValue({
    SecretId: 'buyer-workflow-mvp-prod'
  }).promise();

  return JSON.parse(data.SecretString);
}

// Use in app initialization
const secrets = await getSecrets();
const app = new App({
  token: secrets.SLACK_BOT_TOKEN,
  signingSecret: secrets.SLACK_SIGNING_SECRET,
  appToken: secrets.SLACK_APP_TOKEN,
  socketMode: true
});
```

#### 6. Excessive Debug Logging
**Issue:** Multiple debug event listeners log all messages and commands

**Risk:** Medium - Performance degradation, log storage costs, potential info disclosure

**Affected Code:**
- index.js:183-192 - Logs all message events
- index.js:195-205 - Logs all slash commands

**Remediation:**
- Remove debug listeners in production
- Use environment-based logging levels
- Implement structured logging
- Send logs to secure aggregation service

**Code Example:**
```javascript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Only enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  app.event('message', async ({ event }) => {
    console.log('🔍 DEBUG:', event);
  });
}
```

### LOW Severity

#### 7. No CSRF Protection
**Issue:** While Slack Bolt handles signature verification, there's no additional CSRF token for webhook mode

**Risk:** Low - Only applicable if migrating from Socket Mode to webhooks

**Remediation:**
- Keep Socket Mode for development (CSRF not applicable)
- When migrating to webhooks, ensure signature verification is enabled
- Add CSRF tokens if building web UI in future

---

## 🛡️ Security Recommendations

### Immediate Actions (Before Production)

1. **Implement Input Validation** (Critical)
   ```bash
   npm install joi
   ```
   Add validation to modal submission handler

2. **Add Rate Limiting** (Critical)
   Implement per-user rate limits for slash commands

3. **Remove Debug Logging** (High Priority)
   ```javascript
   // Only log in development
   if (process.env.NODE_ENV !== 'production') {
     // ... debug logs
   }
   ```

4. **Implement Data Encryption** (Critical - when storage added)
   ```bash
   npm install bcrypt  # For password hashing
   npm install crypto-js  # For field encryption
   ```

5. **Set Up Secret Management** (High Priority)
   - Migrate to AWS Secrets Manager or similar
   - Remove `.env` file from production servers

### Short-Term Improvements (1-3 months)

1. **Add Audit Logging**
   - Log all data submissions
   - Log all data access
   - Include timestamp, user, action, IP address

2. **Implement RBAC (Role-Based Access Control)**
   - Define roles: buyer, agent, admin
   - Restrict data access based on role
   - Buyers only see their own data
   - Agents see assigned buyers
   - Admins see all data

3. **Add Security Headers**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

4. **Enable Security Monitoring**
   - Set up Sentry or similar for error tracking
   - Configure alerts for suspicious activity
   - Monitor for unusual patterns (e.g., 100 commands from one user)

5. **Implement Data Retention Policy**
   - Define how long buyer data is stored
   - Add auto-deletion for old preferences
   - Comply with GDPR/CCPA requirements

### Long-Term Hardening (3-6 months)

1. **Security Audit**
   - Hire external security firm for penetration testing
   - Review code for vulnerabilities
   - Test for OWASP Top 10 vulnerabilities

2. **Compliance Certifications**
   - SOC 2 Type II (if handling sensitive data)
   - GDPR compliance (if EU users)
   - CCPA compliance (if California users)

3. **Disaster Recovery**
   - Implement database backups
   - Test restore procedures
   - Create incident response plan

4. **Zero-Trust Architecture**
   - Implement mutual TLS for all connections
   - Add service-to-service authentication
   - Use VPC for network isolation

---

## 🔍 Security Testing Checklist

### Before Each Release

- [ ] Run static code analysis (ESLint security plugins)
- [ ] Scan dependencies for vulnerabilities (`npm audit`)
- [ ] Test input validation with malicious payloads
- [ ] Verify no secrets in code or logs
- [ ] Test rate limiting functionality
- [ ] Verify encryption is working correctly
- [ ] Check all error messages don't leak sensitive info
- [ ] Test authentication and authorization
- [ ] Verify HTTPS is enforced for all connections
- [ ] Review and rotate credentials if needed

### Quarterly Security Review

- [ ] Review access logs for suspicious activity
- [ ] Rotate all API tokens and credentials
- [ ] Update all dependencies to latest secure versions
- [ ] Re-run penetration tests
- [ ] Review and update security policies
- [ ] Train team on latest security best practices

---

## 📊 Security Metrics to Monitor

### Key Performance Indicators (KPIs)

1. **Authentication Failures**
   - Target: < 0.1% of requests
   - Alert: > 1% of requests

2. **Rate Limit Violations**
   - Target: < 5 per day
   - Alert: > 20 per day

3. **Input Validation Failures**
   - Target: < 1% of submissions
   - Alert: > 5% of submissions

4. **Token Rotation Frequency**
   - Target: Every 90 days
   - Alert: > 120 days since last rotation

5. **Dependency Vulnerabilities**
   - Target: 0 high/critical vulnerabilities
   - Alert: Any high/critical vulnerability detected

---

## 🚨 Incident Response Plan

### If Security Breach Detected

1. **Immediate Actions (0-1 hour)**
   - Isolate affected systems
   - Revoke compromised tokens
   - Notify security team
   - Begin evidence collection

2. **Short-Term Response (1-24 hours)**
   - Assess scope of breach
   - Notify affected users (if PII exposed)
   - Patch vulnerability
   - Restore from clean backup if needed

3. **Long-Term Response (1-7 days)**
   - Conduct post-mortem analysis
   - Update security procedures
   - Implement additional safeguards
   - File required regulatory reports

### Emergency Contacts

- **Slack Support:** https://slack.com/help/requests/new
- **Security Team:** [Add your team's contact]
- **Legal Team:** [Add legal contact for breach notification]

---

## 📚 Additional Resources

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Slack Security Best Practices](https://api.slack.com/security)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

### Compliance Resources
- [GDPR Compliance Guide](https://gdpr.eu/)
- [CCPA Compliance Overview](https://oag.ca.gov/privacy/ccpa)
- [SOC 2 Requirements](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome)

---

**Security Status:** ⚠️ Development Only - Requires Hardening Before Production

**Last Security Review:** September 30, 2025
**Next Review Due:** Before Production Deployment