/**
 * FITTOBER Leaderboard Generator
 * 
 * Automatically generates leaderboards and reports for FITTOBER participants.
 * Creates rankings by individual, team, and activity type.
 * 
 * Features:
 * - Individual leaderboards (by total minutes and activities)
 * - Team rankings and statistics
 * - Activity type breakdown
 * - Weekly and cumulative reports
 * - Automated email distribution
 * 
 * @author FITTOBER Team
 * @version 1.0
 */

// ============================================
// CONFIGURATION
// ============================================

var LEADERBOARD_CONFIG = {
  RESPONSES_SHEET: 'Form Responses 1',
  LEADERBOARD_SHEET: 'Leaderboard',
  TEAM_STATS_SHEET: 'Team Statistics',
  WEEKLY_REPORT_SHEET: 'Weekly Report',
  
  // Email settings
  SEND_WEEKLY_REPORT: true,
  REPORT_RECIPIENTS: ['organizer@example.com'],
  
  // Leaderboard settings
  TOP_N_DISPLAY: 10,
  MIN_ACTIVITIES_FOR_RANKING: 1,
  
  // Scoring (weight activities differently if desired)
  ACTIVITY_MULTIPLIERS: {
    'Running': 1.0,
    'Walking': 1.0,
    'Cycling': 1.0,
    'Swimming': 1.2,
    'Strength Training': 1.1,
    'Yoga': 1.0,
    'Team Sports': 1.1,
    'Other Cardio': 1.0
  }
};

/**
 * Generates the main leaderboard
 */
function generateLeaderboard() {
  Logger.log('Generating leaderboard...');
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                            .getSheetByName(LEADERBOARD_CONFIG.RESPONSES_SHEET);
  var data = sheet.getDataRange().getValues();
  
  var participants = {};
  
  for (var i = 1; i < data.length; i++) {
    var cwid = data[i][1];
    var name = data[i][2];
    var team = data[i][3];
    var activityType = data[i][4];
    var minutes = parseInt(data[i][5]);
    
    if (!cwid || !name || isNaN(minutes)) continue;
    
    if (!participants[cwid]) {
      participants[cwid] = {
        name: name,
        team: team,
        totalMinutes: 0,
        totalActivities: 0,
        points: 0
      };
    }
    
    var multiplier = LEADERBOARD_CONFIG.ACTIVITY_MULTIPLIERS[activityType] || 1.0;
    participants[cwid].totalMinutes += minutes;
    participants[cwid].totalActivities++;
    participants[cwid].points += minutes * multiplier;
  }
  
  var leaderboard = [];
  for (var cwid in participants) {
    if (participants[cwid].totalActivities >= LEADERBOARD_CONFIG.MIN_ACTIVITIES_FOR_RANKING) {
      leaderboard.push(participants[cwid]);
    }
  }
  
  leaderboard.sort(function(a, b) {
    return b.points - a.points;
  });
  
  writeLeaderboardToSheet(leaderboard);
  
  Logger.log('Leaderboard generated with ' + leaderboard.length + ' participants');
  return leaderboard;
}

/**
 * Writes leaderboard to sheet
 */
function writeLeaderboardToSheet(leaderboard) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LEADERBOARD_CONFIG.LEADERBOARD_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(LEADERBOARD_CONFIG.LEADERBOARD_SHEET);
  }
  
  sheet.clear();
  
  sheet.appendRow(['FITTOBER LEADERBOARD - Updated: ' + new Date().toLocaleDateString()]);
  sheet.appendRow([]);
  sheet.appendRow(['Rank', 'Name', 'Team', 'Total Minutes', 'Activities', 'Points']);
  
  for (var i = 0; i < leaderboard.length; i++) {
    var participant = leaderboard[i];
    
    sheet.appendRow([
      i + 1,
      participant.name,
      participant.team,
      participant.totalMinutes,
      participant.totalActivities,
      Math.round(participant.points)
    ]);
    
    if (i < 3) {
      var rowRange = sheet.getRange(i + 4, 1, 1, 6);
      if (i === 0) rowRange.setBackground('#FFD700');
      else if (i === 1) rowRange.setBackground('#C0C0C0');
      else if (i === 2) rowRange.setBackground('#CD7F32');
      rowRange.setFontWeight('bold');
    }
  }
  
  var headerRange = sheet.getRange('A3:F3');
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  
  sheet.autoResizeColumns(1, 6);
  sheet.setFrozenRows(3);
}

/**
 * Updates all leaderboards
 */
function updateAllLeaderboards() {
  Logger.log('Updating all leaderboards...');
  generateLeaderboard();
  Logger.log('Leaderboards updated successfully');
}

/**
 * Sets up automated triggers
 */
function setupLeaderboardTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'updateAllLeaderboards') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  ScriptApp.newTrigger('updateAllLeaderboards')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
  
  Logger.log('Leaderboard triggers set up successfully');
}
