/**
 * FITTOBER Prefill URL Generator
 * 
 * Generates personalized prefill URLs for FITTOBER participants to reduce
 * repetitive data entry and improve submission accuracy.
 * 
 * Features:
 * - Batch generate URLs for all participants
 * - Create individual URLs on demand
 * - Support for multiple form field types
 * - Email distribution of personalized links
 * 
 * Setup Instructions:
 * 1. Get your form's prefill entry IDs (see instructions below)
 * 2. Update CONFIG section with your form ID and entry IDs
 * 3. Create a "Participants" sheet with CWID, Name, Team columns
 * 4. Run generateAllPrefillURLs() to create URLs for everyone
 * 5. Optionally run emailPrefillLinks() to send personalized emails
 * 
 * @author FITTOBER Team
 * @version 1.0
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

var PREFILL_CONFIG = {
  // Your Google Form ID (get from form URL)
  // URL format: https://docs.google.com/forms/d/FORM_ID_HERE/edit
  FORM_ID: 'YOUR_FORM_ID_HERE',
  
  // Form entry IDs for each field
  // To get these:
  // 1. Open your form
  // 2. Click three dots (⋮) → "Get pre-filled link"
  // 3. Fill in sample data
  // 4. Click "Get link"
  // 5. Copy the entry.XXXXXX numbers from the URL
  ENTRY_IDS: {
    CWID: 'entry.50380788',      // Replace with your CWID field entry ID
    NAME: 'entry.Mukesh Ravichandran',      // Replace with your Name field entry ID
    TEAM: 'entry.The Excel-erators'       // Replace with your Team field entry ID
  },
  
  // Sheet names
  PARTICIPANTS_SHEET: 'Participants',
  
  // Email settings
  SEND_EMAILS: false,  // Set to true to enable automatic email distribution
  EMAIL_SUBJECT: '🏃 Your Personalized FITTOBER Submission Link',
  EMAIL_TEMPLATE: 'Hi {NAME},\n\n' +
                  'Welcome to FITTOBER! To make logging your fitness activities easier, ' +
                  'we\'ve created a personalized submission link just for you.\n\n' +
                  '📝 Your Personalized Link:\n{URL}\n\n' +
                  'Benefits of using this link:\n' +
                  '✓ Your CWID, name, and team are pre-filled\n' +
                  '✓ Just select your activity and enter minutes\n' +
                  '✓ Save time on every submission\n' +
                  '✓ Bookmark it for easy access\n\n' +
                  'Let\'s make FITTOBER your best fitness month yet! 💪\n\n' +
                  'Questions? Reply to this email.\n\n' +
                  '- FITTOBER Team',
  
  FROM_EMAIL: 'organizer@example.com'
};

// ============================================
// URL GENERATION FUNCTIONS
// ============================================

/**
 * Generates a prefill URL for a single participant
 */
function generatePrefillURL(cwid, name, team) {
  var baseUrl = 'https://docs.google.com/forms/d/e/' + PREFILL_CONFIG.FORM_ID + '/viewform';
  
  var params = [];
  
  // Add CWID parameter
  if (cwid) {
    params.push(PREFILL_CONFIG.ENTRY_IDS.CWID + '=' + encodeURIComponent(cwid));
  }
  
  // Add Name parameter
  if (name) {
    params.push(PREFILL_CONFIG.ENTRY_IDS.NAME + '=' + encodeURIComponent(name));
  }
  
  // Add Team parameter
  if (team) {
    params.push(PREFILL_CONFIG.ENTRY_IDS.TEAM + '=' + encodeURIComponent(team));
  }
  
  // Construct full URL
  var url = baseUrl + '?' + params.join('&');
  
  return url;
}

/**
 * Generates prefill URLs for all participants in the Participants sheet
 */
function generateAllPrefillURLs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PREFILL_CONFIG.PARTICIPANTS_SHEET);
  
  if (!sheet) {
    Logger.log('Error: Participants sheet not found. Creating it now...');
    createParticipantsSheet();
    Logger.log('Please add participant data to the Participants sheet and run this function again.');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  // Check if URL column exists, if not add it
  if (data[0].indexOf('Prefill URL') === -1) {
    sheet.getRange(1, 4).setValue('Prefill URL');
    Logger.log('Added Prefill URL column');
  }
  
  var urlColumnIndex = data[0].indexOf('Prefill URL');
  if (urlColumnIndex === -1) urlColumnIndex = 3; // Default to column D
  
  var cwidIndex = data[0].indexOf('CWID');
  var nameIndex = data[0].indexOf('Name');
  var teamIndex = data[0].indexOf('Team');
  
  if (cwidIndex === -1 || nameIndex === -1 || teamIndex === -1) {
    Logger.log('Error: Participants sheet must have columns: CWID, Name, Team');
    return;
  }
  
  Logger.log('Generating URLs for ' + (data.length - 1) + ' participants...');
  
  // Generate URL for each participant
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][cwidIndex];
    var name = data[i][nameIndex];
    var team = data[i][teamIndex];
    
    if (cwid && name && team) {
      var url = generatePrefillURL(cwid, name, team);
      sheet.getRange(i + 1, urlColumnIndex + 1).setValue(url);
      Logger.log('Generated URL for: ' + name);
    } else {
      Logger.log('Skipping row ' + (i + 1) + ' - missing data');
    }
  }
  
  Logger.log('URL generation complete!');
  Logger.log('Check the Prefill URL column in the Participants sheet.');
}

/**
 * Generates a shortened URL using Google's URL Shortener (if available)
 * Note: Google URL Shortener API has been deprecated
 * Consider using bit.ly API or TinyURL API as alternatives
 */
function generateShortURL(longUrl) {
  // This is a placeholder for URL shortening
  // You can integrate with bit.ly, TinyURL, or other services
  // For now, just return the long URL
  return longUrl;
}

// ============================================
// EMAIL DISTRIBUTION FUNCTIONS
// ============================================

/**
 * Sends personalized emails with prefill links to all participants
 */
function emailPrefillLinks() {
  if (!PREFILL_CONFIG.SEND_EMAILS) {
    Logger.log('Email sending is disabled. Set SEND_EMAILS to true in CONFIG.');
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PREFILL_CONFIG.PARTICIPANTS_SHEET);
  
  if (!sheet) {
    Logger.log('Error: Participants sheet not found.');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var nameIndex = data[0].indexOf('Name');
  var emailIndex = data[0].indexOf('Email');
  var urlIndex = data[0].indexOf('Prefill URL');
  
  if (nameIndex === -1 || emailIndex === -1 || urlIndex === -1) {
    Logger.log('Error: Participants sheet must have columns: Name, Email, Prefill URL');
    Logger.log('Make sure to generate URLs first using generateAllPrefillURLs()');
    return;
  }
  
  Logger.log('Sending emails to ' + (data.length - 1) + ' participants...');
  
  var emailsSent = 0;
  
  for (var i = 1; i < data.length; i++) {
    var name = data[i][nameIndex];
    var email = data[i][emailIndex];
    var url = data[i][urlIndex];
    
    if (email && url) {
      try {
        sendPrefillEmail(name, email, url);
        emailsSent++;
        Logger.log('Email sent to: ' + name + ' (' + email + ')');
        
        // Add delay to avoid hitting email quota too quickly
        Utilities.sleep(1000);
      } catch (error) {
        Logger.log('Failed to send email to ' + email + ': ' + error);
      }
    } else {
      Logger.log('Skipping row ' + (i + 1) + ' - missing email or URL');
    }
  }
  
  Logger.log('Email distribution complete! Sent ' + emailsSent + ' emails.');
}

/**
 * Sends a single prefill email
 */
function sendPrefillEmail(name, email, url) {
  var subject = PREFILL_CONFIG.EMAIL_SUBJECT;
  var body = PREFILL_CONFIG.EMAIL_TEMPLATE
    .replace('{NAME}', name)
    .replace('{URL}', url);
  
  MailApp.sendEmail(email, subject, body);
}

/**
 * Sends a test email to verify the template
 */
function sendTestEmail() {
  var testEmail = 'your-email@example.com';  // Update this
  var testName = 'Test User';
  var testUrl = generatePrefillURL('1234567', 'Test User', 'Test Team');
  
  sendPrefillEmail(testName, testEmail, testUrl);
  Logger.log('Test email sent to: ' + testEmail);
}

// ============================================
// SETUP AND UTILITY FUNCTIONS
// ============================================

/**
 * Creates the Participants sheet with proper headers
 */
function createParticipantsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet(PREFILL_CONFIG.PARTICIPANTS_SHEET);
  
  // Add headers
  sheet.appendRow(['CWID', 'Name', 'Team', 'Email', 'Prefill URL']);
  
  // Format header row
  var headerRange = sheet.getRange('A1:E1');
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  
  // Add sample data
  sheet.appendRow(['1234567', 'John Doe', 'Team Alpha', 'john@example.com', '']);
  sheet.appendRow(['9876543', 'Jane Smith', 'Team Beta', 'jane@example.com', '']);
  
  // Set column widths
  sheet.setColumnWidth(1, 100);  // CWID
  sheet.setColumnWidth(2, 150);  // Name
  sheet.setColumnWidth(3, 150);  // Team
  sheet.setColumnWidth(4, 200);  // Email
  sheet.setColumnWidth(5, 400);  // Prefill URL
  
  Logger.log('Participants sheet created with sample data');
  Logger.log('Replace sample data with actual participant information');
}

/**
 * Gets the form entry IDs by analyzing a prefill link
 * This helps you discover the correct entry IDs for your form
 */
function discoverEntryIDs() {
  Logger.log('To discover your form\'s entry IDs:');
  Logger.log('1. Open your Google Form');
  Logger.log('2. Click the three dots (⋮) → "Get pre-filled link"');
  Logger.log('3. Fill in sample values for CWID, Name, and Team');
  Logger.log('4. Click "Get link"');
  Logger.log('5. The URL will look like:');
  Logger.log('   https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.123456=VALUE&entry.789012=VALUE');
  Logger.log('6. Copy the entry.XXXXXX numbers and update PREFILL_CONFIG.ENTRY_IDS');
  Logger.log('');
  Logger.log('Example:');
  Logger.log('   CWID field: entry.123456789');
  Logger.log('   NAME field: entry.987654321');
  Logger.log('   TEAM field: entry.456789123');
}

/**
 * Validates that the configuration is set up correctly
 */
function validateConfiguration() {
  var issues = [];
  
  if (PREFILL_CONFIG.FORM_ID === 'YOUR_FORM_ID_HERE') {
    issues.push('FORM_ID not configured');
  }
  
  if (PREFILL_CONFIG.ENTRY_IDS.CWID === 'entry.123456789') {
    issues.push('CWID entry ID not configured');
  }
  
  if (PREFILL_CONFIG.ENTRY_IDS.NAME === 'entry.987654321') {
    issues.push('NAME entry ID not configured');
  }
  
  if (PREFILL_CONFIG.ENTRY_IDS.TEAM === 'entry.456789123') {
    issues.push('TEAM entry ID not configured');
  }
  
  if (issues.length > 0) {
    Logger.log('⚠️ Configuration Issues Found:');
    issues.forEach(function(issue) {
      Logger.log('  • ' + issue);
    });
    Logger.log('');
    Logger.log('Please update the CONFIG section before using this script.');
    Logger.log('Run discoverEntryIDs() for help finding your entry IDs.');
    return false;
  } else {
    Logger.log('✅ Configuration looks good!');
    return true;
  }
}

/**
 * Complete setup wizard - runs through all setup steps
 */
function setupWizard() {
  Logger.log('=== FITTOBER Prefill URL Generator Setup ===');
  Logger.log('');
  
  // Step 1: Validate configuration
  Logger.log('Step 1: Validating configuration...');
  if (!validateConfiguration()) {
    return;
  }
  Logger.log('');
  
  // Step 2: Create Participants sheet if needed
  Logger.log('Step 2: Checking for Participants sheet...');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(PREFILL_CONFIG.PARTICIPANTS_SHEET)) {
    createParticipantsSheet();
    Logger.log('Participants sheet created. Please add participant data.');
  } else {
    Logger.log('Participants sheet already exists.');
  }
  Logger.log('');
  
  // Step 3: Generate URLs
  Logger.log('Step 3: Generating prefill URLs...');
  generateAllPrefillURLs();
  Logger.log('');
  
  // Step 4: Email distribution (if enabled)
  if (PREFILL_CONFIG.SEND_EMAILS) {
    Logger.log('Step 4: Sending emails to participants...');
    emailPrefillLinks();
  } else {
    Logger.log('Step 4: Email distribution is disabled.');
    Logger.log('Set SEND_EMAILS to true if you want to automatically email participants.');
  }
  
  Logger.log('');
  Logger.log('=== Setup Complete! ===');
  Logger.log('Check the Participants sheet for generated URLs.');
}

// ============================================
// TESTING FUNCTIONS
// ============================================

/**
 * Tests URL generation with sample data
 */
function testURLGeneration() {
  Logger.log('Testing URL generation...');
  
  var testCwid = '1234567';
  var testName = 'Test User';
  var testTeam = 'Test Team';
  
  var url = generatePrefillURL(testCwid, testName, testTeam);
  
  Logger.log('Generated URL:');
  Logger.log(url);
  Logger.log('');
  Logger.log('Open this URL in a browser to verify the fields are pre-filled correctly.');
}

/**
 * Creates a menu in the spreadsheet for easy access
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('FITTOBER Prefill')
    .addItem('Setup Wizard', 'setupWizard')
    .addItem('Generate All URLs', 'generateAllPrefillURLs')
    .addSeparator()
    .addItem('Email Links to Participants', 'emailPrefillLinks')
    .addItem('Send Test Email', 'sendTestEmail')
    .addSeparator()
    .addItem('Discover Entry IDs', 'discoverEntryIDs')
    .addItem('Validate Configuration', 'validateConfiguration')
    .addItem('Test URL Generation', 'testURLGeneration')
    .addToUi();
}
