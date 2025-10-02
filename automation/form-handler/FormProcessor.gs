/**
 * FITTOBER Form Processor
 * 
 * Automatically processes Google Form submissions for the FITTOBER fitness competition.
 * 
 * Features:
 * - Validates submission data
 * - Sends confirmation emails
 * - Detects duplicates
 * - Flags invalid entries
 * - Logs activity for organizers
 * 
 * Setup Instructions:
 * 1. Open your Google Form's linked spreadsheet
 * 2. Go to Extensions → Apps Script
 * 3. Copy this entire file into the script editor
 * 4. Update the CONFIG section below with your form's details
 * 5. Run the setupTriggers() function once to enable automation
 * 6. Authorize the script when prompted
 * 
 * @author FITTOBER Team
 * @version 1.0
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

var CONFIG = {
  // Email settings
  ORGANIZER_EMAIL: 'organizer@example.com',  // Update with organizer email
  SEND_PARTICIPANT_CONFIRMATIONS: true,
  
  // Form field indices (0-based, after timestamp)
  FIELD_INDEX: {
    TIMESTAMP: 0,
    CWID: 1,
    NAME: 2,
    TEAM: 3,
    ACTIVITY_TYPE: 4,
    MINUTES: 5,
    DATE: 6,
    NOTES: 7
  },
  
  // Validation rules
  CWID_LENGTH: 7,  // Expected length of CWID
  MIN_MINUTES: 1,
  MAX_MINUTES: 1440,  // 24 hours
  
  // Valid activity types (customize for your event)
  VALID_ACTIVITIES: [
    'Walking',
    'Running',
    'Cycling',
    'Swimming',
    'Strength Training',
    'Yoga',
    'Team Sports',
    'Other Cardio'
  ],
  
  // Sheet names
  RESPONSES_SHEET: 'Form Responses 1',
  VALIDATION_SHEET: 'Validation Log',
  STATS_SHEET: 'Statistics'
};

// ============================================
// MAIN EVENT HANDLER
// ============================================

/**
 * Triggered when a form is submitted
 * This is the main entry point for automation
 */
function onFormSubmit(e) {
  try {
    Logger.log('Form submission received');
    
    var values = e.values;
    var response = e.response;
    var email = response ? response.getRespondentEmail() : null;
    
    // Extract submission data
    var submission = {
      timestamp: values[CONFIG.FIELD_INDEX.TIMESTAMP],
      cwid: values[CONFIG.FIELD_INDEX.CWID],
      name: values[CONFIG.FIELD_INDEX.NAME],
      team: values[CONFIG.FIELD_INDEX.TEAM],
      activityType: values[CONFIG.FIELD_INDEX.ACTIVITY_TYPE],
      minutes: parseInt(values[CONFIG.FIELD_INDEX.MINUTES]),
      email: email,
      rowNumber: e.range.getRow()
    };
    
    Logger.log('Processing submission from: ' + submission.name);
    
    // Validate the submission
    var validationResults = validateSubmission(submission);
    
    // Log validation results
    logValidation(submission, validationResults);
    
    // Send confirmation email if enabled
    if (CONFIG.SEND_PARTICIPANT_CONFIRMATIONS && email) {
      sendConfirmationEmail(submission, validationResults);
    }
    
    // Notify organizers of issues
    if (!validationResults.isValid) {
      notifyOrganizersOfIssues(submission, validationResults);
    }
    
    Logger.log('Submission processed successfully');
    
  } catch (error) {
    Logger.log('Error processing submission: ' + error);
    
    // Notify organizers of processing error
    MailApp.sendEmail(
      CONFIG.ORGANIZER_EMAIL,
      'FITTOBER: Form Processing Error',
      'An error occurred while processing a form submission:\n\n' + error
    );
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates a submission against all rules
 */
function validateSubmission(submission) {
  var results = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Validate CWID
  if (!submission.cwid || submission.cwid.length !== CONFIG.CWID_LENGTH) {
    results.isValid = false;
    results.errors.push('Invalid CWID format (expected ' + CONFIG.CWID_LENGTH + ' digits)');
  }
  
  // Validate minutes
  if (isNaN(submission.minutes) || submission.minutes < CONFIG.MIN_MINUTES || submission.minutes > CONFIG.MAX_MINUTES) {
    results.isValid = false;
    results.errors.push('Invalid duration (must be between ' + CONFIG.MIN_MINUTES + ' and ' + CONFIG.MAX_MINUTES + ' minutes)');
  }
  
  // Validate activity type
  if (CONFIG.VALID_ACTIVITIES.length > 0 && CONFIG.VALID_ACTIVITIES.indexOf(submission.activityType) === -1) {
    results.warnings.push('Unusual activity type: ' + submission.activityType);
  }
  
  // Check for duplicates
  if (isDuplicate(submission)) {
    results.warnings.push('Possible duplicate submission detected');
  }
  
  // Check if submission is late (optional - add your deadline logic here)
  // var deadline = new Date('2025-10-31');
  // if (submission.timestamp > deadline) {
  //   results.warnings.push('Late submission (after deadline)');
  // }
  
  return results;
}

/**
 * Checks if this submission is a duplicate
 */
function isDuplicate(submission) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  
  var submissionDate = Utilities.formatDate(
    new Date(submission.timestamp), 
    Session.getScriptTimeZone(), 
    'yyyy-MM-dd'
  );
  
  var duplicateCount = 0;
  
  for (var i = 1; i < data.length; i++) {
    var rowDate = Utilities.formatDate(
      new Date(data[i][CONFIG.FIELD_INDEX.TIMESTAMP]), 
      Session.getScriptTimeZone(), 
      'yyyy-MM-dd'
    );
    
    if (data[i][CONFIG.FIELD_INDEX.CWID] === submission.cwid &&
        rowDate === submissionDate &&
        data[i][CONFIG.FIELD_INDEX.ACTIVITY_TYPE] === submission.activityType) {
      duplicateCount++;
    }
  }
  
  return duplicateCount > 1;
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Logs validation results to a separate sheet
 */
function logValidation(submission, validationResults) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(CONFIG.VALIDATION_SHEET);
  
  // Create validation sheet if it doesn't exist
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.VALIDATION_SHEET);
    logSheet.appendRow([
      'Timestamp',
      'Row',
      'CWID',
      'Name',
      'Status',
      'Errors',
      'Warnings'
    ]);
  }
  
  logSheet.appendRow([
    new Date(),
    submission.rowNumber,
    submission.cwid,
    submission.name,
    validationResults.isValid ? 'Valid' : 'Invalid',
    validationResults.errors.join('; '),
    validationResults.warnings.join('; ')
  ]);
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

/**
 * Sends confirmation email to participant
 */
function sendConfirmationEmail(submission, validationResults) {
  if (!submission.email) return;
  
  var subject = validationResults.isValid ? 
    'FITTOBER Submission Confirmed ✓' : 
    'FITTOBER Submission - Action Required';
  
  var body = 'Hi ' + submission.name + ',\n\n';
  
  if (validationResults.isValid) {
    body += 'Your FITTOBER activity has been recorded successfully!\n\n' +
            '📊 Submission Details:\n' +
            '  • Activity: ' + submission.activityType + '\n' +
            '  • Duration: ' + submission.minutes + ' minutes\n' +
            '  • Team: ' + submission.team + '\n\n' +
            'Keep up the great work! 💪\n\n';
    
    if (validationResults.warnings.length > 0) {
      body += 'Note: ' + validationResults.warnings.join(', ') + '\n\n';
    }
  } else {
    body += 'We received your FITTOBER submission, but there were some issues:\n\n' +
            '❌ Errors:\n';
    validationResults.errors.forEach(function(error) {
      body += '  • ' + error + '\n';
    });
    body += '\nPlease submit a corrected entry or contact the organizers.\n\n';
  }
  
  body += 'Thank you for participating in FITTOBER!\n\n' +
          '- FITTOBER Team';
  
  try {
    MailApp.sendEmail(submission.email, subject, body);
    Logger.log('Confirmation email sent to: ' + submission.email);
  } catch (error) {
    Logger.log('Failed to send confirmation email: ' + error);
  }
}

/**
 * Notifies organizers when validation issues are found
 */
function notifyOrganizersOfIssues(submission, validationResults) {
  var subject = 'FITTOBER: Invalid Submission Alert';
  
  var body = 'An invalid submission was received:\n\n' +
             'Participant: ' + submission.name + ' (' + submission.cwid + ')\n' +
             'Team: ' + submission.team + '\n' +
             'Activity: ' + submission.activityType + '\n' +
             'Duration: ' + submission.minutes + ' minutes\n' +
             'Row: ' + submission.rowNumber + '\n\n' +
             'Errors:\n';
  
  validationResults.errors.forEach(function(error) {
    body += '  • ' + error + '\n';
  });
  
  if (validationResults.warnings.length > 0) {
    body += '\nWarnings:\n';
    validationResults.warnings.forEach(function(warning) {
      body += '  • ' + warning + '\n';
    });
  }
  
  body += '\nPlease review and take appropriate action.';
  
  try {
    MailApp.sendEmail(CONFIG.ORGANIZER_EMAIL, subject, body);
    Logger.log('Alert sent to organizers');
  } catch (error) {
    Logger.log('Failed to send organizer alert: ' + error);
  }
}

// ============================================
// BATCH PROCESSING FUNCTIONS
// ============================================

/**
 * Processes all existing submissions (for initial setup)
 * Run this once after deploying to validate existing data
 */
function processAllExistingSubmissions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  
  Logger.log('Processing ' + (data.length - 1) + ' existing submissions...');
  
  for (var i = 1; i < data.length; i++) {
    var submission = {
      timestamp: data[i][CONFIG.FIELD_INDEX.TIMESTAMP],
      cwid: data[i][CONFIG.FIELD_INDEX.CWID],
      name: data[i][CONFIG.FIELD_INDEX.NAME],
      team: data[i][CONFIG.FIELD_INDEX.TEAM],
      activityType: data[i][CONFIG.FIELD_INDEX.ACTIVITY_TYPE],
      minutes: parseInt(data[i][CONFIG.FIELD_INDEX.MINUTES]),
      rowNumber: i + 1
    };
    
    var validationResults = validateSubmission(submission);
    logValidation(submission, validationResults);
  }
  
  Logger.log('Batch processing complete');
}

/**
 * Generates a daily summary report
 * Set up a daily trigger to run this at a specific time
 */
function sendDailySummary() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var todaySubmissions = 0;
  var todayMinutes = 0;
  var teams = {};
  
  for (var i = 1; i < data.length; i++) {
    var rowDate = Utilities.formatDate(
      new Date(data[i][CONFIG.FIELD_INDEX.TIMESTAMP]), 
      Session.getScriptTimeZone(), 
      'yyyy-MM-dd'
    );
    
    if (rowDate === today) {
      todaySubmissions++;
      todayMinutes += parseInt(data[i][CONFIG.FIELD_INDEX.MINUTES]);
      
      var team = data[i][CONFIG.FIELD_INDEX.TEAM];
      if (!teams[team]) {
        teams[team] = { count: 0, minutes: 0 };
      }
      teams[team].count++;
      teams[team].minutes += parseInt(data[i][CONFIG.FIELD_INDEX.MINUTES]);
    }
  }
  
  var subject = 'FITTOBER Daily Summary - ' + today;
  var body = 'FITTOBER Activity Summary for ' + today + '\n\n' +
             '📊 Overall Stats:\n' +
             '  • Submissions: ' + todaySubmissions + '\n' +
             '  • Total Minutes: ' + todayMinutes + '\n\n' +
             '🏆 Team Breakdown:\n';
  
  for (var teamName in teams) {
    body += '  • ' + teamName + ': ' + teams[teamName].count + ' submissions, ' + 
            teams[teamName].minutes + ' minutes\n';
  }
  
  body += '\nView the full spreadsheet for details.';
  
  if (todaySubmissions > 0) {
    MailApp.sendEmail(CONFIG.ORGANIZER_EMAIL, subject, body);
    Logger.log('Daily summary sent');
  } else {
    Logger.log('No submissions today, summary not sent');
  }
}

// ============================================
// SETUP FUNCTIONS
// ============================================

/**
 * Sets up all necessary triggers for automation
 * RUN THIS ONCE after deploying the script
 */
function setupTriggers() {
  // Delete existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  
  Logger.log('Setting up triggers...');
  
  // Create form submit trigger
  var form = FormApp.getActiveForm();
  if (form) {
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    Logger.log('Form submit trigger created');
  } else {
    Logger.log('Warning: No form found. Make sure to run this from the form\'s script editor');
  }
  
  // Create daily summary trigger (runs at 8 PM)
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
  Logger.log('Daily summary trigger created');
  
  Logger.log('All triggers set up successfully!');
  Logger.log('Automation is now active.');
}

/**
 * Removes all triggers (for debugging or uninstall)
 */
function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('All triggers removed');
}

// ============================================
// TESTING FUNCTIONS
// ============================================

/**
 * Tests the validation logic with sample data
 * Run this to verify the script works before enabling triggers
 */
function testValidation() {
  Logger.log('Running validation tests...');
  
  // Test valid submission
  var validSubmission = {
    timestamp: new Date(),
    cwid: '1234567',
    name: 'Test User',
    team: 'Test Team',
    activityType: 'Running',
    minutes: 30,
    rowNumber: 999
  };
  
  var result = validateSubmission(validSubmission);
  Logger.log('Valid submission test: ' + (result.isValid ? 'PASS' : 'FAIL'));
  
  // Test invalid CWID
  var invalidCwid = Object.assign({}, validSubmission, { cwid: '123' });
  result = validateSubmission(invalidCwid);
  Logger.log('Invalid CWID test: ' + (!result.isValid ? 'PASS' : 'FAIL'));
  
  // Test invalid minutes
  var invalidMinutes = Object.assign({}, validSubmission, { minutes: -5 });
  result = validateSubmission(invalidMinutes);
  Logger.log('Invalid minutes test: ' + (!result.isValid ? 'PASS' : 'FAIL'));
  
  Logger.log('Testing complete. Check logs for results.');
}
