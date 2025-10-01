# Integration Guide: Connecting FITTOBER to Other Tools

This guide explains how to integrate FITTOBER with communication platforms, automation tools, and other services to enhance the participant experience and streamline organizer workflows.

## Table of Contents

1. [Slack Integration](#slack-integration)
2. [Discord Integration](#discord-integration)
3. [Zapier Automation](#zapier-automation)
4. [Make (Integromat) Automation](#make-integromat-automation)
5. [Email Marketing Integration](#email-marketing-integration)
6. [Calendar Integration](#calendar-integration)

---

## Slack Integration

Send real-time notifications to a Slack channel when submissions are received, duplicates are detected, or milestones are reached.

### Prerequisites
- Slack workspace with admin permissions
- Slack Incoming Webhook URL

### Setup Instructions

#### Step 1: Create Slack Incoming Webhook

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "FITTOBER Bot" and select your workspace
4. In the app settings, go to "Incoming Webhooks"
5. Toggle "Activate Incoming Webhooks" to On
6. Click "Add New Webhook to Workspace"
7. Select the channel (e.g., #fittober)
8. Copy the Webhook URL (looks like: `https://hooks.slack.com/services/...`)

#### Step 2: Add Slack Integration to Apps Script

Add this code to your FormProcessor.gs:

```javascript
// Add to CONFIG section
var SLACK_CONFIG = {
  ENABLED: true,
  WEBHOOK_URL: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  CHANNEL: '#fittober',
  USERNAME: 'FITTOBER Bot',
  ICON_EMOJI: ':running:'
};

/**
 * Posts a message to Slack
 */
function postToSlack(message, color) {
  if (!SLACK_CONFIG.ENABLED) return;
  
  var payload = {
    channel: SLACK_CONFIG.CHANNEL,
    username: SLACK_CONFIG.USERNAME,
    icon_emoji: SLACK_CONFIG.ICON_EMOJI,
    attachments: [{
      color: color || 'good',
      text: message,
      mrkdwn_in: ['text']
    }]
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(SLACK_CONFIG.WEBHOOK_URL, options);
  } catch (error) {
    Logger.log('Failed to post to Slack: ' + error);
  }
}

/**
 * Notify Slack of new submission
 */
function notifySlackNewSubmission(submission) {
  var message = ':white_check_mark: *New FITTOBER Submission*\n' +
                '• Participant: ' + submission.name + ' (' + submission.team + ')\n' +
                '• Activity: ' + submission.activityType + '\n' +
                '• Duration: ' + submission.minutes + ' minutes';
  
  postToSlack(message, 'good');
}

/**
 * Notify Slack of validation issue
 */
function notifySlackValidationIssue(submission, validationResults) {
  var message = ':warning: *FITTOBER Validation Issue*\n' +
                '• Participant: ' + submission.name + '\n' +
                '• Errors: ' + validationResults.errors.join(', ');
  
  postToSlack(message, 'warning');
}

/**
 * Notify Slack of daily milestone
 */
function notifySlackMilestone(message) {
  postToSlack(':trophy: *FITTOBER Milestone*\n' + message, '#FFD700');
}
```

Then modify your `onFormSubmit` function:

```javascript
function onFormSubmit(e) {
  // ... existing code ...
  
  // Add Slack notification
  if (validationResults.isValid) {
    notifySlackNewSubmission(submission);
  } else {
    notifySlackValidationIssue(submission, validationResults);
  }
  
  // ... rest of code ...
}
```

#### Step 3: Customize Notifications

Add milestone tracking:

```javascript
/**
 * Check and notify milestones
 */
function checkMilestones() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                            .getSheetByName('Form Responses 1');
  var totalSubmissions = sheet.getLastRow() - 1;
  
  var milestones = [50, 100, 250, 500, 1000];
  
  if (milestones.indexOf(totalSubmissions) > -1) {
    notifySlackMilestone(
      '🎉 We just hit *' + totalSubmissions + '* submissions! Keep it up!'
    );
  }
}
```

---

## Discord Integration

Similar to Slack but for Discord servers.

### Setup Instructions

#### Step 1: Create Discord Webhook

1. Open your Discord server
2. Go to Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Name it "FITTOBER Bot"
5. Select the channel (e.g., #fittober-updates)
6. Copy the Webhook URL

#### Step 2: Add Discord Integration

```javascript
var DISCORD_CONFIG = {
  ENABLED: true,
  WEBHOOK_URL: 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL',
  USERNAME: 'FITTOBER Bot',
  AVATAR_URL: 'https://example.com/avatar.png'  // Optional
};

/**
 * Posts a message to Discord
 */
function postToDiscord(message, color) {
  if (!DISCORD_CONFIG.ENABLED) return;
  
  var payload = {
    username: DISCORD_CONFIG.USERNAME,
    avatar_url: DISCORD_CONFIG.AVATAR_URL,
    embeds: [{
      description: message,
      color: parseInt(color || '00FF00', 16)
    }]
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(DISCORD_CONFIG.WEBHOOK_URL, options);
  } catch (error) {
    Logger.log('Failed to post to Discord: ' + error);
  }
}

/**
 * Notify Discord of new submission
 */
function notifyDiscordNewSubmission(submission) {
  var message = '✅ **New FITTOBER Submission**\n' +
                '• Participant: ' + submission.name + ' (' + submission.team + ')\n' +
                '• Activity: ' + submission.activityType + '\n' +
                '• Duration: ' + submission.minutes + ' minutes';
  
  postToDiscord(message, '00FF00');
}
```

---

## Zapier Automation

Zapier allows you to connect Google Forms to hundreds of other apps without coding.

### Use Cases

1. **Form Submission → Send SMS via Twilio**
2. **Form Submission → Add to Airtable**
3. **Form Submission → Create Trello card**
4. **Daily Summary → Post to Social Media**

### Setup Instructions

#### Step 1: Connect Google Forms to Zapier

1. Go to https://zapier.com
2. Click "Create Zap"
3. Choose Trigger: "Google Forms" → "New Form Response"
4. Connect your Google account
5. Select your FITTOBER form
6. Test the trigger

#### Step 2: Add Action

**Example: Send SMS Notification**

1. Choose Action: "Twilio" → "Send SMS"
2. Connect Twilio account
3. Configure message:
   ```
   FITTOBER: {{Name}} just logged {{Minutes}} minutes of {{Activity Type}}! Keep it up! 💪
   ```
4. Test the action
5. Turn on the Zap

#### Step 3: Create Multi-Step Zaps

**Example: Submission → Filter → Email Team Captain**

1. Trigger: New Form Response
2. Filter: Only continue if Minutes > 60
3. Action: Gmail → Send Email
   - To: Team captain email
   - Subject: Outstanding FITTOBER Activity!
   - Body: Team member {{Name}} logged {{Minutes}} minutes!

### Popular Zap Templates for FITTOBER

1. **Leaderboard Updates**
   - Trigger: Scheduled daily
   - Action: Post top 3 to Slack

2. **Milestone Celebrations**
   - Trigger: New response
   - Filter: Check if milestone reached
   - Action: Send congratulations email

3. **Reminder System**
   - Trigger: Scheduled weekly
   - Action: Email participants who haven't submitted

---

## Make (Integromat) Automation

More powerful than Zapier with visual workflow builder.

### Setup Instructions

#### Step 1: Create New Scenario

1. Go to https://make.com
2. Click "Create a new scenario"
3. Search for "Google Sheets" module
4. Choose "Watch New Rows"

#### Step 2: Connect to Your Spreadsheet

1. Add connection to Google Sheets
2. Select your FITTOBER spreadsheet
3. Select "Form Responses 1" sheet
4. Set limit to 1 (process one row at a time)

#### Step 3: Add Processing Logic

**Example: Advanced Duplicate Detection**

```
Scenario Flow:
1. Watch New Rows (Google Sheets)
2. Search Rows (Google Sheets) - Find matching CWID + Date
3. Router:
   a. If duplicate found → Send alert email
   b. If unique → Continue processing
4. HTTP Request → Post to API
5. Update Row → Mark as processed
```

#### Step 4: Add Error Handling

1. Add "Error Handler" to any module
2. Choose "Rollback" or "Ignore" behavior
3. Add logging to Google Sheets

### Advanced Make Features

**Data Transformation**
- Calculate weekly totals
- Convert time zones
- Format dates
- Aggregate team statistics

**Conditional Logic**
- Only process weekday submissions
- Apply different rules for different activity types
- Escalate issues based on severity

---

## Email Marketing Integration

Integrate with Mailchimp, SendGrid, or similar for better participant communication.

### Mailchimp Integration

#### Step 1: Sync Participants to Mailchimp

Use Zapier or Make to:
1. Add new form respondents to Mailchimp list
2. Tag them with their team name
3. Update custom fields (CWID, total minutes, etc.)

#### Step 2: Create Automated Campaigns

**Welcome Series**
1. Trigger: Participant added to list
2. Day 0: Welcome email with prefill link
3. Day 3: Tips for staying consistent
4. Day 7: First week recap

**Weekly Digests**
1. Scheduled: Every Monday
2. Content: Personal stats, team ranking, motivation

**Re-engagement**
1. Trigger: No activity in 7 days
2. Content: "We miss you!" with quick submit link

---

## Calendar Integration

Add FITTOBER deadlines and reminders to participants' calendars.

### Google Calendar Integration

```javascript
/**
 * Creates calendar event for submission reminder
 */
function createSubmissionReminder(participantEmail, dueDate) {
  var calendar = CalendarApp.getDefaultCalendar();
  
  calendar.createEvent(
    'FITTOBER Weekly Submission Reminder',
    dueDate,
    dueDate,
    {
      description: 'Don\'t forget to log your fitness activities for this week!',
      guests: participantEmail,
      sendInvites: true
    }
  );
}

/**
 * Creates recurring reminders for all participants
 */
function setupWeeklyReminders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                            .getSheetByName('Participants');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var email = data[i][3];  // Email column
    var startDate = new Date('2025-10-01');
    
    // Create reminder for every Friday at 5 PM
    for (var week = 0; week < 4; week++) {
      var reminderDate = new Date(startDate);
      reminderDate.setDate(startDate.getDate() + (week * 7));
      reminderDate.setHours(17, 0, 0, 0);
      
      createSubmissionReminder(email, reminderDate);
    }
  }
  
  Logger.log('Weekly reminders created for all participants');
}
```

---

## Testing Integrations

### Checklist

- [ ] Test with sample data first
- [ ] Verify webhooks are receiving data
- [ ] Check error handling works correctly
- [ ] Monitor rate limits (API calls per day)
- [ ] Test with multiple simultaneous submissions
- [ ] Verify data privacy and security

### Debugging Tips

1. **Check Logs**
   - Apps Script: View → Logs
   - Zapier: Task History
   - Make: Execution History

2. **Test Webhooks**
   - Use https://webhook.site for testing
   - Verify payload structure

3. **Monitor Quotas**
   - Google Apps Script: 100 emails/day (free)
   - API rate limits vary by service

---

## Security Considerations

### Best Practices

1. **Protect Webhook URLs**
   - Never commit to public repositories
   - Store in Apps Script properties:
   ```javascript
   var scriptProperties = PropertiesService.getScriptProperties();
   scriptProperties.setProperty('SLACK_WEBHOOK', 'https://...');
   ```

2. **Validate Data**
   - Check data before sending to external services
   - Sanitize user input
   - Don't expose sensitive information

3. **Use Service Accounts**
   - Create dedicated accounts for automation
   - Limit permissions to minimum necessary
   - Rotate credentials regularly

4. **Monitor Usage**
   - Set up alerts for unusual activity
   - Track API call volumes
   - Review logs regularly

---

## Cost Considerations

| Service | Free Tier | Paid Plans Start At |
|---------|-----------|---------------------|
| Zapier | 100 tasks/month | $19.99/month |
| Make | 1,000 operations/month | $9/month |
| Mailchimp | 500 contacts | $13/month |
| Twilio SMS | Trial credit | Pay per message |
| Slack | Unlimited messages | N/A (free for basic) |
| Discord | Unlimited | N/A (free) |

**Recommendation**: Start with free tiers and scale as needed.

---

## Support

For integration issues:

1. Check service-specific documentation
2. Review Apps Script execution logs
3. Test with webhook.site
4. Open an issue with details

---

## Next Steps

1. Choose 1-2 integrations to start with
2. Test thoroughly with sample data
3. Roll out to small group first
4. Gather feedback and iterate
5. Scale to full participant base

**Pro Tip**: Slack/Discord integration provides the highest immediate value with lowest effort!
