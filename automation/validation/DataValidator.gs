/**
 * FITTOBER Data Validator
 * 
 * Advanced validation and data quality checking for FITTOBER submissions.
 * This script provides additional validation beyond the basic form processor.
 * 
 * Features:
 * - Duplicate detection across multiple criteria
 * - Statistical anomaly detection
 * - Batch validation of existing data
 * - Data quality reports
 * - Automated cleanup suggestions
 * 
 * Setup Instructions:
 * 1. Copy this into your Apps Script project
 * 2. Run setupValidationSheet() to create necessary sheets
 * 3. Schedule runDailyValidation() to run daily
 * 
 * @author FITTOBER Team
 * @version 1.0
 */

// ============================================
// CONFIGURATION
// ============================================

var VALIDATOR_CONFIG = {
  RESPONSES_SHEET: 'Form Responses 1',
  VALIDATION_REPORT_SHEET: 'Validation Report',
  DUPLICATES_SHEET: 'Detected Duplicates',
  
  // Thresholds for anomaly detection
  MAX_MINUTES_PER_DAY_PER_PERSON: 180,  // 3 hours
  MAX_SUBMISSIONS_PER_DAY: 5,
  UNUSUAL_MINUTES_THRESHOLD: 120,
  
  ORGANIZER_EMAIL: 'organizer@example.com'
};

// ============================================
// MAIN VALIDATION FUNCTIONS
// ============================================

/**
 * Runs comprehensive validation on all data
 * Schedule this to run daily
 */
function runDailyValidation() {
  Logger.log('Starting daily validation...');
  
  var issues = {
    duplicates: findDuplicates(),
    anomalies: detectAnomalies(),
    missingData: findMissingData(),
    inconsistencies: findInconsistencies()
  };
  
  // Generate report
  generateValidationReport(issues);
  
  // Send summary to organizers
  if (hasIssues(issues)) {
    sendValidationSummary(issues);
  }
  
  Logger.log('Daily validation complete');
}

/**
 * Finds duplicate submissions
 */
function findDuplicates() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATOR_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  var duplicates = [];
  var seen = {};
  
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][1];
    var date = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var activity = data[i][4];
    var minutes = data[i][5];
    
    // Create key for exact duplicates
    var exactKey = cwid + '|' + date + '|' + activity + '|' + minutes;
    
    // Create key for similar submissions (same day, same activity, different duration)
    var similarKey = cwid + '|' + date + '|' + activity;
    
    if (seen[exactKey]) {
      duplicates.push({
        type: 'exact',
        row1: seen[exactKey],
        row2: i + 1,
        cwid: cwid,
        name: data[i][2],
        date: date,
        activity: activity,
        minutes: minutes
      });
    } else if (seen[similarKey] && seen[similarKey] !== i + 1) {
      duplicates.push({
        type: 'similar',
        row1: seen[similarKey],
        row2: i + 1,
        cwid: cwid,
        name: data[i][2],
        date: date,
        activity: activity,
        minutes: minutes
      });
    }
    
    seen[exactKey] = i + 1;
    if (!seen[similarKey]) {
      seen[similarKey] = i + 1;
    }
  }
  
  // Write duplicates to sheet
  if (duplicates.length > 0) {
    writeDuplicatesToSheet(duplicates);
  }
  
  return duplicates;
}

/**
 * Detects statistical anomalies
 */
function detectAnomalies() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATOR_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  var anomalies = [];
  var dailyTotals = {};
  
  // Calculate daily totals per person
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][1];
    var date = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var minutes = parseInt(data[i][5]);
    var key = cwid + '|' + date;
    
    if (!dailyTotals[key]) {
      dailyTotals[key] = {
        cwid: cwid,
        name: data[i][2],
        date: date,
        minutes: 0,
        count: 0,
        rows: []
      };
    }
    
    dailyTotals[key].minutes += minutes;
    dailyTotals[key].count++;
    dailyTotals[key].rows.push(i + 1);
  }
  
  // Check for anomalies
  for (var key in dailyTotals) {
    var record = dailyTotals[key];
    
    // Too many minutes in one day
    if (record.minutes > VALIDATOR_CONFIG.MAX_MINUTES_PER_DAY_PER_PERSON) {
      anomalies.push({
        type: 'excessive_minutes',
        cwid: record.cwid,
        name: record.name,
        date: record.date,
        value: record.minutes,
        threshold: VALIDATOR_CONFIG.MAX_MINUTES_PER_DAY_PER_PERSON,
        rows: record.rows
      });
    }
    
    // Too many submissions in one day
    if (record.count > VALIDATOR_CONFIG.MAX_SUBMISSIONS_PER_DAY) {
      anomalies.push({
        type: 'excessive_submissions',
        cwid: record.cwid,
        name: record.name,
        date: record.date,
        value: record.count,
        threshold: VALIDATOR_CONFIG.MAX_SUBMISSIONS_PER_DAY,
        rows: record.rows
      });
    }
  }
  
  // Check for unusually long single activities
  for (var i = 1; i < data.length; i++) {
    var minutes = parseInt(data[i][5]);
    if (minutes > VALIDATOR_CONFIG.UNUSUAL_MINUTES_THRESHOLD) {
      anomalies.push({
        type: 'unusual_duration',
        cwid: data[i][1],
        name: data[i][2],
        activity: data[i][4],
        value: minutes,
        threshold: VALIDATOR_CONFIG.UNUSUAL_MINUTES_THRESHOLD,
        rows: [i + 1]
      });
    }
  }
  
  return anomalies;
}

/**
 * Finds missing or incomplete data
 */
function findMissingData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATOR_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  var missing = [];
  
  for (var i = 1; i < data.length; i++) {
    var issues = [];
    
    // Check each required field
    if (!data[i][1] || data[i][1].toString().trim() === '') {
      issues.push('Missing CWID');
    }
    if (!data[i][2] || data[i][2].toString().trim() === '') {
      issues.push('Missing Name');
    }
    if (!data[i][3] || data[i][3].toString().trim() === '') {
      issues.push('Missing Team');
    }
    if (!data[i][4] || data[i][4].toString().trim() === '') {
      issues.push('Missing Activity Type');
    }
    if (!data[i][5] || isNaN(parseInt(data[i][5]))) {
      issues.push('Missing or invalid Minutes');
    }
    
    if (issues.length > 0) {
      missing.push({
        row: i + 1,
        cwid: data[i][1],
        name: data[i][2],
        issues: issues
      });
    }
  }
  
  return missing;
}

/**
 * Finds data inconsistencies
 */
function findInconsistencies() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATOR_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  var inconsistencies = [];
  var cwidToName = {};
  var cwidToTeam = {};
  
  // Build maps of CWID to name and team
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][1];
    var name = data[i][2];
    var team = data[i][3];
    
    // Check name consistency
    if (cwidToName[cwid] && cwidToName[cwid] !== name) {
      inconsistencies.push({
        type: 'name_mismatch',
        cwid: cwid,
        value1: cwidToName[cwid],
        value2: name,
        row: i + 1
      });
    } else {
      cwidToName[cwid] = name;
    }
    
    // Check team consistency
    if (cwidToTeam[cwid] && cwidToTeam[cwid] !== team) {
      inconsistencies.push({
        type: 'team_mismatch',
        cwid: cwid,
        value1: cwidToTeam[cwid],
        value2: team,
        row: i + 1
      });
    } else {
      cwidToTeam[cwid] = team;
    }
    
    // Check for invalid CWID format (assuming 7 digits)
    if (cwid && cwid.toString().length !== 7) {
      inconsistencies.push({
        type: 'invalid_cwid_format',
        cwid: cwid,
        row: i + 1
      });
    }
  }
  
  return inconsistencies;
}

// ============================================
// REPORTING FUNCTIONS
// ============================================

/**
 * Generates a comprehensive validation report
 */
function generateValidationReport(issues) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var reportSheet = ss.getSheetByName(VALIDATOR_CONFIG.VALIDATION_REPORT_SHEET);
  
  // Create report sheet if it doesn't exist
  if (!reportSheet) {
    reportSheet = ss.insertSheet(VALIDATOR_CONFIG.VALIDATION_REPORT_SHEET);
  }
  
  // Clear existing content
  reportSheet.clear();
  
  // Add header
  reportSheet.appendRow(['FITTOBER Validation Report']);
  reportSheet.appendRow(['Generated: ' + new Date()]);
  reportSheet.appendRow(['']);
  
  // Summary section
  reportSheet.appendRow(['SUMMARY']);
  reportSheet.appendRow(['Duplicates Found', issues.duplicates.length]);
  reportSheet.appendRow(['Anomalies Detected', issues.anomalies.length]);
  reportSheet.appendRow(['Missing Data Issues', issues.missing.length]);
  reportSheet.appendRow(['Inconsistencies Found', issues.inconsistencies.length]);
  reportSheet.appendRow(['']);
  
  // Duplicates section
  if (issues.duplicates.length > 0) {
    reportSheet.appendRow(['DUPLICATES']);
    reportSheet.appendRow(['Type', 'CWID', 'Name', 'Date', 'Activity', 'Row 1', 'Row 2']);
    issues.duplicates.forEach(function(dup) {
      reportSheet.appendRow([
        dup.type,
        dup.cwid,
        dup.name,
        dup.date,
        dup.activity,
        dup.row1,
        dup.row2
      ]);
    });
    reportSheet.appendRow(['']);
  }
  
  // Anomalies section
  if (issues.anomalies.length > 0) {
    reportSheet.appendRow(['ANOMALIES']);
    reportSheet.appendRow(['Type', 'CWID', 'Name', 'Value', 'Threshold', 'Rows']);
    issues.anomalies.forEach(function(anom) {
      reportSheet.appendRow([
        anom.type,
        anom.cwid,
        anom.name,
        anom.value,
        anom.threshold,
        anom.rows.join(', ')
      ]);
    });
    reportSheet.appendRow(['']);
  }
  
  // Missing data section
  if (issues.missing.length > 0) {
    reportSheet.appendRow(['MISSING DATA']);
    reportSheet.appendRow(['Row', 'CWID', 'Name', 'Issues']);
    issues.missing.forEach(function(miss) {
      reportSheet.appendRow([
        miss.row,
        miss.cwid,
        miss.name,
        miss.issues.join('; ')
      ]);
    });
    reportSheet.appendRow(['']);
  }
  
  // Inconsistencies section
  if (issues.inconsistencies.length > 0) {
    reportSheet.appendRow(['INCONSISTENCIES']);
    reportSheet.appendRow(['Type', 'CWID', 'Value 1', 'Value 2', 'Row']);
    issues.inconsistencies.forEach(function(incon) {
      reportSheet.appendRow([
        incon.type,
        incon.cwid,
        incon.value1 || '',
        incon.value2 || '',
        incon.row
      ]);
    });
  }
  
  // Format header
  var headerRange = reportSheet.getRange('A1:G1');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(14);
  
  Logger.log('Validation report generated');
}

/**
 * Writes duplicates to a dedicated sheet
 */
function writeDuplicatesToSheet(duplicates) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dupSheet = ss.getSheetByName(VALIDATOR_CONFIG.DUPLICATES_SHEET);
  
  if (!dupSheet) {
    dupSheet = ss.insertSheet(VALIDATOR_CONFIG.DUPLICATES_SHEET);
    dupSheet.appendRow(['Type', 'CWID', 'Name', 'Date', 'Activity', 'Minutes', 'Row 1', 'Row 2', 'Status']);
  }
  
  // Clear old data (keep header)
  if (dupSheet.getLastRow() > 1) {
    dupSheet.deleteRows(2, dupSheet.getLastRow() - 1);
  }
  
  // Add duplicates
  duplicates.forEach(function(dup) {
    dupSheet.appendRow([
      dup.type,
      dup.cwid,
      dup.name,
      dup.date,
      dup.activity,
      dup.minutes,
      dup.row1,
      dup.row2,
      'Needs Review'
    ]);
  });
}

/**
 * Sends validation summary email to organizers
 */
function sendValidationSummary(issues) {
  var subject = 'FITTOBER Daily Validation Report';
  var body = 'FITTOBER data validation has been completed.\n\n';
  
  body += '📊 SUMMARY\n';
  body += '  • Duplicates Found: ' + issues.duplicates.length + '\n';
  body += '  • Anomalies Detected: ' + issues.anomalies.length + '\n';
  body += '  • Missing Data Issues: ' + issues.missing.length + '\n';
  body += '  • Inconsistencies Found: ' + issues.inconsistencies.length + '\n\n';
  
  if (issues.duplicates.length > 0) {
    body += '⚠️ TOP DUPLICATES (first 5):\n';
    issues.duplicates.slice(0, 5).forEach(function(dup) {
      body += '  • ' + dup.name + ' - ' + dup.activity + ' on ' + dup.date + ' (Rows ' + dup.row1 + ', ' + dup.row2 + ')\n';
    });
    body += '\n';
  }
  
  if (issues.anomalies.length > 0) {
    body += '🔍 TOP ANOMALIES (first 5):\n';
    issues.anomalies.slice(0, 5).forEach(function(anom) {
      body += '  • ' + anom.name + ' - ' + anom.type + ': ' + anom.value + ' (threshold: ' + anom.threshold + ')\n';
    });
    body += '\n';
  }
  
  body += 'View the full Validation Report sheet for complete details.\n\n';
  body += 'Access the spreadsheet here: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  
  MailApp.sendEmail(VALIDATOR_CONFIG.ORGANIZER_EMAIL, subject, body);
  Logger.log('Validation summary sent to organizers');
}

/**
 * Checks if there are any issues to report
 */
function hasIssues(issues) {
  return issues.duplicates.length > 0 || 
         issues.anomalies.length > 0 || 
         issues.missing.length > 0 || 
         issues.inconsistencies.length > 0;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Creates the validation sheets if they don't exist
 */
function setupValidationSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Validation Report sheet
  if (!ss.getSheetByName(VALIDATOR_CONFIG.VALIDATION_REPORT_SHEET)) {
    ss.insertSheet(VALIDATOR_CONFIG.VALIDATION_REPORT_SHEET);
    Logger.log('Created Validation Report sheet');
  }
  
  // Create Duplicates sheet
  if (!ss.getSheetByName(VALIDATOR_CONFIG.DUPLICATES_SHEET)) {
    var dupSheet = ss.insertSheet(VALIDATOR_CONFIG.DUPLICATES_SHEET);
    dupSheet.appendRow(['Type', 'CWID', 'Name', 'Date', 'Activity', 'Minutes', 'Row 1', 'Row 2', 'Status']);
    Logger.log('Created Duplicates sheet');
  }
  
  Logger.log('Validation sheets setup complete');
}

/**
 * Generates statistics about submission patterns
 */
function generateSubmissionStats() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VALIDATOR_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  
  var stats = {
    totalSubmissions: data.length - 1,
    uniqueParticipants: 0,
    totalMinutes: 0,
    avgMinutesPerSubmission: 0,
    activityBreakdown: {},
    teamBreakdown: {},
    dailySubmissions: {}
  };
  
  var uniqueCwids = {};
  
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][1];
    var activity = data[i][4];
    var minutes = parseInt(data[i][5]);
    var team = data[i][3];
    var date = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    uniqueCwids[cwid] = true;
    stats.totalMinutes += minutes;
    
    // Activity breakdown
    if (!stats.activityBreakdown[activity]) {
      stats.activityBreakdown[activity] = { count: 0, minutes: 0 };
    }
    stats.activityBreakdown[activity].count++;
    stats.activityBreakdown[activity].minutes += minutes;
    
    // Team breakdown
    if (!stats.teamBreakdown[team]) {
      stats.teamBreakdown[team] = { count: 0, minutes: 0 };
    }
    stats.teamBreakdown[team].count++;
    stats.teamBreakdown[team].minutes += minutes;
    
    // Daily submissions
    if (!stats.dailySubmissions[date]) {
      stats.dailySubmissions[date] = 0;
    }
    stats.dailySubmissions[date]++;
  }
  
  stats.uniqueParticipants = Object.keys(uniqueCwids).length;
  stats.avgMinutesPerSubmission = stats.totalMinutes / stats.totalSubmissions;
  
  Logger.log('Statistics generated: ' + JSON.stringify(stats, null, 2));
  
  return stats;
}
