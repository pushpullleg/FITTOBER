# FITTOBER Setup Guide

Complete step-by-step instructions for implementing FITTOBER automation and improvements.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Google Apps Script Setup](#phase-1-google-apps-script-setup)
3. [Phase 2: Prefill URL Generation](#phase-2-prefill-url-generation)
4. [Phase 3: Validation Dashboard](#phase-3-validation-dashboard)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Admin access to the FITTOBER Google Form
- [ ] Access to the linked Google Sheets spreadsheet
- [ ] Google Workspace account with script execution permissions
- [ ] List of participant CWIDs, names, and teams
- [ ] Participant email addresses (for prefill link distribution)

**Estimated Total Setup Time**: 2-3 hours

---

## Phase 1: Google Apps Script Setup

### Step 1.1: Access the Script Editor

1. Open your FITTOBER Google Form
2. Click "Responses" tab
3. Click "View in Sheets" (green Sheets icon)
4. In the spreadsheet, go to **Extensions → Apps Script**
5. You'll see the Apps Script editor open in a new tab

### Step 1.2: Install Form Processor Script

1. In the Apps Script editor, delete any existing code
2. Copy the entire contents of `/automation/form-handler/FormProcessor.gs`
3. Paste it into the script editor
4. Click **File → Save** (or Ctrl+S / Cmd+S)
5. Name the project "FITTOBER Automation"

### Step 1.3: Configure the Script

1. Locate the `CONFIG` section at the top of the script
2. Update these values:

```javascript
var CONFIG = {
  ORGANIZER_EMAIL: 'your-email@example.com',  // ← Change this
  SEND_PARTICIPANT_CONFIRMATIONS: true,        // Set false to disable emails
  
  // Verify these field indices match your form
  FIELD_INDEX: {
    TIMESTAMP: 0,
    CWID: 1,          // Column B in spreadsheet (0-indexed after timestamp)
    NAME: 2,          // Column C
    TEAM: 3,          // Column D
    ACTIVITY_TYPE: 4, // Column E
    MINUTES: 5,       // Column F
    DATE: 6,          // Column G (if you have a date field)
    NOTES: 7          // Column H (if you have a notes field)
  },
  
  // Customize these for your event
  VALID_ACTIVITIES: [
    'Walking',
    'Running',
    'Cycling',
    'Swimming',
    'Strength Training',
    'Yoga',
    'Team Sports',
    'Other Cardio'
  ]
};
```

3. **Important**: Verify your field indices:
   - Go back to your responses spreadsheet
   - Look at the column headers
   - Count columns starting from 0 for Timestamp
   - Update the FIELD_INDEX values if needed

### Step 1.4: Enable Form Email Collection

1. Go back to your Google Form (edit mode)
2. Click the Settings gear icon (⚙️)
3. Check "Collect email addresses"
4. Save the form

### Step 1.5: Set Up Triggers

1. In the Apps Script editor, find the function dropdown (says "Select function")
2. Select **setupTriggers**
3. Click the **Run** button (▶️)
4. You'll be asked to authorize the script:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to FITTOBER Automation (unsafe)"
   - Click "Allow"
5. Wait for execution to complete (check the Execution log)
6. You should see "All triggers set up successfully!"

### Step 1.6: Test the Form Processor

1. Select the **testValidation** function from the dropdown
2. Click **Run** (▶️)
3. Check the Execution log for "Testing complete"
4. Submit a test entry through your form
5. Within a minute, check:
   - Your email for a confirmation message
   - The spreadsheet for a new "Validation Log" sheet

**✅ Phase 1 Complete!** Form submissions are now processed automatically.

---

## Phase 2: Prefill URL Generation

### Step 2.1: Discover Form Entry IDs

1. Open your Google Form (in edit mode)
2. Click the three dots menu (⋮) in the top-right
3. Select "Get pre-filled link"
4. Fill in sample data:
   - CWID: `1234567`
   - Name: `Test User`
   - Team: `Test Team`
5. Click "Get link" at the bottom
6. Copy the URL - it will look like:
   ```
   https://docs.google.com/forms/d/e/FORM_ID/viewform?
   entry.123456789=1234567&
   entry.987654321=Test+User&
   entry.456789123=Test+Team
   ```
7. Note down the entry IDs:
   - CWID entry: `entry.123456789`
   - Name entry: `entry.987654321`
   - Team entry: `entry.456789123`

### Step 2.2: Create Prefill Generator Script

1. In the Apps Script editor, create a new file:
   - Click **+ (File)** → **Script**
   - Name it "PrefillGenerator"
2. Copy contents from `/tools/prefill-generator.gs`
3. Paste into the new file
4. Save the file

### Step 2.3: Configure Prefill Generator

1. Update the `PREFILL_CONFIG` section:

```javascript
var PREFILL_CONFIG = {
  FORM_ID: 'YOUR_FORM_ID_HERE',  // From your form URL
  
  ENTRY_IDS: {
    CWID: 'entry.123456789',     // ← Your CWID entry ID
    NAME: 'entry.987654321',     // ← Your Name entry ID
    TEAM: 'entry.456789123'      // ← Your Team entry ID
  },
  
  SEND_EMAILS: false,  // Set true when ready to email participants
  
  // Customize email template if desired
  EMAIL_SUBJECT: '🏃 Your Personalized FITTOBER Submission Link',
  EMAIL_TEMPLATE: '...'  // Customize as needed
};
```

2. To get your FORM_ID:
   - Go to your form edit URL
   - It looks like: `https://docs.google.com/forms/d/FORM_ID_HERE/edit`
   - Copy just the FORM_ID part

### Step 2.4: Create Participants Sheet

1. Go back to your responses spreadsheet
2. Click **+ (Add sheet)** at the bottom
3. Name it "Participants"
4. Add these column headers in row 1:
   - A1: `CWID`
   - B1: `Name`
   - C1: `Team`
   - D1: `Email`
   - E1: `Prefill URL`

### Step 2.5: Add Participant Data

Add your participants' information:

| CWID    | Name         | Team       | Email                |
|---------|--------------|------------|----------------------|
| 1234567 | John Doe     | Team Alpha | john@example.com     |
| 9876543 | Jane Smith   | Team Beta  | jane@example.com     |
| ...     | ...          | ...        | ...                  |

**Tip**: If you have an existing roster, copy and paste the data.

### Step 2.6: Generate Prefill URLs

1. In Apps Script, refresh the page (to load the menu)
2. Go back to your spreadsheet
3. You should see a new menu: "FITTOBER Prefill"
4. Click **FITTOBER Prefill → Setup Wizard**
5. Alternatively, in Apps Script:
   - Select **generateAllPrefillURLs** function
   - Click **Run** (▶️)
6. Check the Participants sheet - URLs should be generated in column E

### Step 2.7: Test a Prefill URL

1. Copy one of the generated URLs from the Participants sheet
2. Open it in a new browser tab
3. Verify that:
   - CWID is pre-filled
   - Name is pre-filled
   - Team is pre-filled
4. Only activity type and minutes should need to be entered

### Step 2.8: Distribute Links (Optional)

**Manual Distribution**:
1. Copy URLs from the Participants sheet
2. Email or message each participant their unique link
3. Ask them to bookmark it for easy access

**Automated Distribution**:
1. Update `SEND_EMAILS: true` in PREFILL_CONFIG
2. Run **emailPrefillLinks()** function
3. Each participant will receive an email with their personal link

**✅ Phase 2 Complete!** Participants can now use personalized links.

---

## Phase 3: Validation Dashboard

### Step 3.1: Install Data Validator Script

1. In Apps Script, create a new file:
   - Click **+ (File)** → **Script**
   - Name it "DataValidator"
2. Copy contents from `/automation/validation/DataValidator.gs`
3. Paste into the new file
4. Save

### Step 3.2: Configure Validator

1. Update VALIDATOR_CONFIG if needed:

```javascript
var VALIDATOR_CONFIG = {
  RESPONSES_SHEET: 'Form Responses 1',  // Verify this matches your sheet name
  VALIDATION_REPORT_SHEET: 'Validation Report',
  DUPLICATES_SHEET: 'Detected Duplicates',
  
  // Customize thresholds
  MAX_MINUTES_PER_DAY_PER_PERSON: 180,  // 3 hours
  MAX_SUBMISSIONS_PER_DAY: 5,
  
  ORGANIZER_EMAIL: 'organizer@example.com'  // ← Update this
};
```

### Step 3.3: Initialize Validation Sheets

1. In Apps Script, select **setupValidationSheet** function
2. Click **Run** (▶️)
3. Check your spreadsheet - new sheets should be created:
   - "Validation Report"
   - "Detected Duplicates"

### Step 3.4: Run Initial Validation

1. Select **runDailyValidation** function
2. Click **Run** (▶️)
3. Wait for execution (may take a minute for large datasets)
4. Check the "Validation Report" sheet for results

### Step 3.5: Set Up Daily Validation

1. In Apps Script, click the clock icon (⏰) - "Triggers"
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - Choose function: **runDailyValidation**
   - Choose deployment: **Head**
   - Select event source: **Time-driven**
   - Select type: **Day timer**
   - Select time: **8am to 9am** (or your preference)
4. Click **Save**

**✅ Phase 3 Complete!** Validation runs automatically daily.

---

## Testing & Verification

### Comprehensive Test Checklist

- [ ] Submit a test form entry
- [ ] Verify confirmation email received
- [ ] Check "Validation Log" sheet for entry
- [ ] Test a prefill URL - verify fields pre-populate
- [ ] Submit through prefill URL
- [ ] Check duplicate detection by submitting same entry twice
- [ ] Verify daily summary email (if time of day is right)
- [ ] Review "Validation Report" sheet
- [ ] Check "Detected Duplicates" sheet

### Test Scenarios

**Test 1: Valid Submission**
- Use prefill URL
- Enter valid activity and minutes
- Submit
- Expected: Confirmation email, entry in Validation Log marked "Valid"

**Test 2: Invalid CWID**
- Edit prefill URL to use wrong CWID format (e.g., 5 digits instead of 7)
- Submit
- Expected: Error email to participant, alert to organizer

**Test 3: Duplicate Detection**
- Submit same activity twice on same day
- Expected: Warning in confirmation email, flagged in Duplicates sheet

**Test 4: Excessive Minutes**
- Enter 200 minutes in one submission
- Expected: Flagged as anomaly in Validation Report

---

## Troubleshooting

### Issue: Scripts Not Running

**Symptoms**: No confirmation emails, no validation logs

**Solutions**:
1. Check Apps Script Executions:
   - Click clock icon (⏰) in Apps Script
   - Look for errors in recent executions
2. Verify triggers are set up:
   - Click clock icon (⏰)
   - Should see "onFormSubmit" and "sendDailySummary" triggers
3. Re-run setupTriggers() function

### Issue: Emails Not Sending

**Symptoms**: Form processes but no emails received

**Solutions**:
1. Check Gmail quota:
   - Free accounts: 100 emails/day limit
   - Workspace accounts: 1500 emails/day limit
2. Verify email collection:
   - Form settings → "Collect email addresses" is checked
3. Check spam folder
4. Verify CONFIG.ORGANIZER_EMAIL is correct

### Issue: Prefill URLs Don't Work

**Symptoms**: Clicking URL doesn't pre-fill fields

**Solutions**:
1. Verify entry IDs are correct:
   - Re-do "Get pre-filled link" process
   - Compare entry IDs in generated URL vs your config
2. Check FORM_ID in config
3. Test URL in incognito window
4. Ensure no extra spaces in configuration

### Issue: Wrong Field Indices

**Symptoms**: Validation errors, wrong data in logs

**Solutions**:
1. Open responses spreadsheet
2. Count columns starting from 0:
   - Column A (Timestamp) = 0
   - Column B (usually CWID) = 1
   - Column C = 2, etc.
3. Update FIELD_INDEX in CONFIG
4. Save script and test again

### Issue: Authorization Errors

**Symptoms**: "Authorization required" when running scripts

**Solutions**:
1. Run function that requires authorization
2. Click "Review permissions"
3. Select your account
4. Click "Advanced"
5. Click "Go to FITTOBER Automation (unsafe)"
6. Click "Allow"

### Getting Help

If you encounter issues:

1. **Check Execution Logs**:
   - Apps Script → View → Logs (Ctrl+Enter)
   - Look for error messages

2. **Review Documentation**:
   - See `/docs/QUICK_WINS.md` for common solutions
   - Check `/docs/ROADMAP.md` for feature details

3. **Test with Simple Data**:
   - Create a test form with 2-3 fields
   - Test scripts with minimal data
   - Gradually add complexity

4. **Open an Issue**:
   - GitHub Issues for bug reports
   - Include error messages and logs
   - Describe steps to reproduce

---

## Next Steps

Once setup is complete:

1. **Monitor Performance**:
   - Check Validation Report daily
   - Review Duplicates sheet regularly
   - Monitor email delivery

2. **Collect Feedback**:
   - Ask participants about prefill links
   - Survey organizers on time savings
   - Identify additional pain points

3. **Iterate and Improve**:
   - Adjust validation thresholds
   - Customize email templates
   - Add new validation rules

4. **Plan Phase 2**:
   - Review `/docs/ROADMAP.md` for next features
   - Consider Slack/Discord integrations
   - Explore automated reporting

---

## Maintenance

### Weekly Tasks
- [ ] Review Validation Report
- [ ] Resolve flagged duplicates
- [ ] Check for unusual submission patterns

### Monthly Tasks
- [ ] Review and update VALID_ACTIVITIES list
- [ ] Analyze participation statistics
- [ ] Update documentation

### End of Event
- [ ] Run final validation
- [ ] Generate comprehensive reports
- [ ] Archive data
- [ ] Document lessons learned

---

**Congratulations!** Your FITTOBER system is now automated and ready for scale.

For questions or support, refer to repository documentation or open an issue on GitHub.
