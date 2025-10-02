# FITTOBER Example Walkthrough

This guide provides a complete example of setting up and using FITTOBER automation from start to finish.

## Scenario

**Organization**: Texas A&M University - Commerce
**Event**: FITTOBER 2025 (October 1-31)
**Participants**: 150 students across 10 teams
**Goal**: Track fitness activities, generate leaderboards, reduce organizer workload

## Before FITTOBER Automation

### Organizer Workflow (Old)

**Daily Tasks (30-45 minutes)**:
1. Download responses from Google Form
2. Open in Excel/Sheets
3. Manually check for duplicates
4. Verify CWID format (7 digits)
5. Flag invalid entries (negative minutes, blank fields)
6. Calculate running totals per person
7. Calculate team totals
8. Update leaderboard spreadsheet
9. Email participants with issues

**Weekly Tasks (2-3 hours)**:
1. Generate weekly reports
2. Create team summaries
3. Identify non-participants
4. Send reminder emails
5. Update public leaderboard
6. Respond to participant questions

**Monthly Workload**: ~15 hours

### Participant Experience (Old)

**Per Submission (3-5 minutes)**:
1. Find form link in email
2. Enter CWID: `1234567`
3. Enter Full Name: `John Doe`
4. Enter Team Name: `Team Alpha`
5. Select Activity Type: `Running`
6. Enter Minutes: `30`
7. Enter Date: `10/15/2025`
8. Submit
9. Wait (no confirmation)
10. Wonder if it was recorded

**Pain Points**:
- Repetitive data entry
- No confirmation
- Can't see personal progress
- Can't view leaderboard easily

---

## After FITTOBER Automation

### Setup (One-Time, 2 hours)

#### Step 1: Install Scripts (30 minutes)

1. **Open Form Responses Spreadsheet**
   - Go to FITTOBER form
   - Responses → View in Sheets

2. **Enable Apps Script**
   - Extensions → Apps Script
   - Copy `FormProcessor.gs`
   - Update CONFIG:
     ```javascript
     ORGANIZER_EMAIL: 'fittober@tamuc.edu'
     CWID_LENGTH: 7
     VALID_ACTIVITIES: [
       'Walking', 'Running', 'Cycling', 
       'Swimming', 'Strength Training', 'Yoga',
       'Team Sports', 'Other Cardio'
     ]
     ```

3. **Run Setup**
   - Select `setupTriggers()`
   - Click Run
   - Authorize when prompted

4. **Test**
   - Submit test form entry
   - Verify confirmation email received
   - Check Validation Log sheet created

#### Step 2: Generate Prefill URLs (30 minutes)

1. **Add Prefill Script**
   - Apps Script → New File → `PrefillGenerator`
   - Copy `prefill-generator.gs`

2. **Get Entry IDs**
   - Form → Get pre-filled link
   - Fill: CWID=1234567, Name=Test, Team=Test
   - Get link, note entry IDs:
     ```
     entry.123456789 = CWID
     entry.987654321 = Name
     entry.456789123 = Team
     ```

3. **Update Config**
   ```javascript
   FORM_ID: '1FAIpQLSfhLBkL...'
   ENTRY_IDS: {
     CWID: 'entry.123456789',
     NAME: 'entry.987654321',
     TEAM: 'entry.456789123'
   }
   ```

4. **Create Participants Sheet**
   - New sheet: "Participants"
   - Columns: CWID, Name, Team, Email, Prefill URL
   - Add 150 student records

5. **Generate URLs**
   - Run `generateAllPrefillURLs()`
   - URLs populate in column E

6. **Distribute**
   - Option A: Email each student their link
   - Option B: Run `emailPrefillLinks()` for automated emails

#### Step 3: Setup Validation (30 minutes)

1. **Add Validator Script**
   - Apps Script → New File → `DataValidator`
   - Copy `DataValidator.gs`
   - Update ORGANIZER_EMAIL

2. **Initialize Sheets**
   - Run `setupValidationSheet()`
   - Creates "Validation Report" and "Duplicates" sheets

3. **Setup Daily Trigger**
   - Triggers → Add Trigger
   - Function: `runDailyValidation`
   - Event: Time-driven, Day timer, 8am-9am

#### Step 4: Setup Leaderboards (30 minutes)

1. **Add Leaderboard Script**
   - Apps Script → New File → `LeaderboardGenerator`
   - Copy `LeaderboardGenerator.gs`

2. **Configure Scoring**
   - Customize ACTIVITY_MULTIPLIERS if needed
   - Set TOP_N_DISPLAY: 10

3. **Test Generation**
   - Run `generateLeaderboard()`
   - Check new "Leaderboard" sheet

4. **Setup Auto-Update**
   - Run `setupLeaderboardTriggers()`
   - Daily update at 8 PM

---

## Day-to-Day Operations

### Week 1: October 1-7

#### Monday, October 1 (Launch Day)

**8:00 AM - Organizer**
- Receive 150 personalized prefill link emails
- Forward/resend to students
- Post announcement on campus channels

**Throughout Day**
- 45 submissions received
- 45 automatic confirmation emails sent
- 0 manual interventions needed

**8:00 PM**
- Automatic leaderboard update
- Current standings:
  1. Sarah Johnson - 180 minutes
  2. Mike Chen - 150 minutes
  3. Emma Wilson - 120 minutes

**9:00 PM - Organizer**
- Check Validation Report: 2 duplicates flagged
- Review Duplicates sheet
- Contact 2 students about duplicate submissions
- **Time spent: 10 minutes**

#### Wednesday, October 3

**Throughout Day**
- 38 new submissions
- All processed automatically
- 1 invalid CWID flagged
- Organizer notified via email
- **Time spent: 5 minutes** (fixed invalid entry)

#### Sunday, October 7

**9:00 AM**
- Automatic weekly report generated
- Email sent to organizers:
  ```
  FITTOBER WEEKLY REPORT
  Week 1: October 1-7
  
  OVERALL STATISTICS
  • Total Minutes: 8,450
  • Total Activities: 283
  • Active Participants: 92 (61%)
  • Active Teams: 10 (100%)
  
  TOP 5 PARTICIPANTS:
  1. Sarah Johnson - 420 minutes
  2. Mike Chen - 380 minutes
  3. Emma Wilson - 340 minutes
  4. Alex Rodriguez - 320 minutes
  5. Jamie Lee - 310 minutes
  
  TOP 3 TEAMS:
  1. Team Alpha - 1,240 minutes
  2. Team Beta - 1,180 minutes
  3. Team Gamma - 1,050 minutes
  ```

**10:00 AM - Organizer**
- Review weekly report
- Post leaderboard to social media
- Send encouragement email to non-participants
- **Time spent: 20 minutes**

### Week 2-4: Similar Pattern

**Daily Effort: 5-10 minutes**
- Review validation reports
- Handle edge cases
- Respond to questions

**Weekly Effort: 20-30 minutes**
- Review weekly report
- Post updates
- Communicate with teams

**Monthly Workload: 2-3 hours** (down from 15 hours!)

---

## Real Participant Examples

### Example 1: Active Participant (Sarah)

**First Submission** (3 minutes)
1. Clicks email link (bookmarked)
2. CWID, name, team pre-filled ✓
3. Selects: Running
4. Enters: 30 minutes
5. Submits
6. Instant confirmation email:
   ```
   Hi Sarah,
   
   Your FITTOBER activity has been recorded!
   
   📊 Submission Details:
     • Activity: Running
     • Duration: 30 minutes
     • Team: Team Alpha
   
   Keep up the great work! 💪
   ```

**Subsequent Submissions** (<1 minute each)
- Bookmark works perfectly
- Only activity and minutes to enter
- Confidence submission was recorded

**October Total**: 15 submissions, <15 minutes total time

### Example 2: Participant with Error (Mike)

**Submission Attempt**
- Accidentally enters: 3000 minutes (typo)
- Submits

**Immediate Response**
- Receives error email:
  ```
  Hi Mike,
  
  We received your FITTOBER submission, 
  but there were some issues:
  
  ❌ Errors:
    • Invalid duration (must be between 1 and 1440 minutes)
  
  Please submit a corrected entry.
  ```

**Organizer Notified**
- Automatic alert email
- Can reach out proactively

**Resolution**
- Mike resubmits with 30 minutes
- Receives confirmation
- Problem solved in 5 minutes

### Example 3: Team Captain (Emma)

**Weekly Routine**
1. Check leaderboard (auto-updated daily)
2. See team ranking: #3 (down from #2)
3. Message team: "Let's step it up this week!"
4. Monitor team progress via public leaderboard
5. Celebrate improvements

**No Manual Tracking Needed**
- Everything automated
- Real-time updates
- Easy to share rankings

---

## Organizer Dashboard View

### Daily View (Morning Check)

**Validation Report Tab**
```
SUMMARY
Duplicates Found: 2
Anomalies Detected: 1
Missing Data Issues: 0
Inconsistencies Found: 0

DUPLICATES
Type    CWID     Name        Date       Activity  Row
exact   1234567  John Doe    10/15/25   Running   45, 67

ANOMALIES
Type              CWID     Name        Value  Threshold
excessive_minutes 9876543  Jane Smith  200    180
```

**Action Items**:
- Contact John about duplicate (2 min)
- Verify Jane's 200-minute submission (3 min)
- **Total: 5 minutes**

### Weekly View (Sunday Review)

**Leaderboard Tab**
```
FITTOBER LEADERBOARD
Updated: October 7, 2025

Rank  Name             Team         Minutes  Activities  Points
1     Sarah Johnson    Team Alpha   420      14         420
2     Mike Chen        Team Beta    380      12         380
3     Emma Wilson      Team Gamma   340      11         340
...
```

**Team Statistics Tab**
```
TEAM RANKINGS

Rank  Team         Minutes  Activities  Participants  Avg/Person
1     Team Alpha   1,240    87          15           83
2     Team Beta    1,180    82          14           84
3     Team Gamma   1,050    73          13           81
...
```

**Weekly Report Tab**
- Automatically generated
- Ready to copy/paste for announcements
- No manual calculations needed

---

## Results & Impact

### Time Savings

**Organizers**:
- Before: 15 hours/month
- After: 2.5 hours/month
- **Savings: 12.5 hours/month (83%)**

**Participants**:
- Before: 3-5 minutes/submission
- After: <1 minute/submission
- **Savings: ~70% per submission**
- For 150 participants × 10 submissions each:
  - Before: 75-125 hours total
  - After: 25 hours total
  - **Savings: 50-100 collective hours**

### Data Quality

**Before**:
- 15% error rate (duplicates, invalid data)
- Errors found during weekly review
- Manual corrections needed

**After**:
- 3% error rate (only unusual edge cases)
- Errors caught immediately
- Automatic notifications
- **Improvement: 80% fewer errors**

### Engagement

**Before**:
- 50-60% participation rate
- Participants forget to submit
- No reminders

**After**:
- 61% week 1, growing to 75% by week 4
- Automatic reminders (can add)
- Leaderboard motivates participation
- **Improvement: 15-25% higher engagement**

### Satisfaction

**Participant Feedback**:
- "So much easier with the personalized link!"
- "Love getting instant confirmation"
- "Can finally see where I rank"

**Organizer Feedback**:
- "Saves hours every week"
- "Catch errors immediately instead of week-end"
- "Actually have time to engage with participants"

---

## Lessons Learned

### What Worked Well

1. **Prefill URLs**: Biggest immediate impact
2. **Instant Confirmations**: Participants love the feedback
3. **Automated Validation**: Catches 95% of errors automatically
4. **Daily Leaderboards**: Drives engagement and competition

### What Could Improve

1. **Initial Setup**: Takes 2 hours but worth it
2. **Participant Onboarding**: Need clear instructions
3. **Edge Cases**: Still need human review for unusual situations
4. **Integration**: Could connect to more platforms (Slack, etc.)

### Future Enhancements

1. **Phase 2** (Next Year):
   - Add Slack notifications
   - Implement weekly reminder system
   - Create public-facing dashboard
   - Add activity photos/proof

2. **Phase 3** (Long-term):
   - Custom web app with SSO
   - Mobile app for quick logging
   - Wearable device integration
   - Gamification features

---

## Getting Started with Your Event

Follow this example to set up your own automated system:

1. **Week Before Event**:
   - Set up scripts (2 hours)
   - Test thoroughly
   - Generate prefill URLs

2. **Launch Day**:
   - Distribute prefill links
   - Monitor first submissions
   - Be available for questions

3. **First Week**:
   - Check validation reports daily
   - Adjust thresholds if needed
   - Gather feedback

4. **Ongoing**:
   - Let automation work
   - Focus on engagement and motivation
   - Enjoy the time savings!

---

## Support

Questions about this walkthrough?
- Review `/docs/guides/SETUP_GUIDE.md`
- Check `/docs/QUICK_WINS.md`
- Open an issue on GitHub

**Ready to get started?** Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md)!
