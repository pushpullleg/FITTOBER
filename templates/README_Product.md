# FITTOBER Templates

This directory contains spreadsheet templates and dashboard examples for FITTOBER.

## Available Templates

### Spreadsheets

**validation-template.xlsx**
- Pre-configured validation formulas
- Conditional formatting for error detection
- Duplicate checking columns
- Status indicators

**participants-roster.xlsx**
- Template for participant information
- CWID, Name, Team, Email columns
- Ready for prefill URL generation

### Dashboards

**organizer-dashboard.xlsx**
- At-a-glance metrics
- Real-time submission counts
- Team comparisons
- Top performers

## How to Use

1. **Download Template**
   - Save the Excel file to your computer
   - Or copy the Google Sheets template

2. **Import to Google Sheets**
   - Go to Google Sheets
   - File → Import
   - Upload → Select file
   - Choose "Replace spreadsheet"

3. **Customize**
   - Update field names if needed
   - Adjust validation rules
   - Modify thresholds

4. **Link to Form**
   - Copy validation formulas to your responses sheet
   - Set up conditional formatting
   - Test with sample data

## Template Descriptions

### Validation Template

**Purpose**: Automatically flag problematic submissions

**Features**:
- CWID format validation
- Minutes range checking
- Duplicate detection
- Late submission flagging
- Visual status indicators

**Columns**:
```
A: Row Number
B: CWID Valid? (✓ or ✗ Invalid CWID)
C: Minutes Valid? (✓ or ✗ Invalid minutes)
D: Activity Valid? (✓ or ✗ Unusual activity)
E: Duplicate? (✓ or ✗ DUPLICATE)
F: Status (✓ Valid or ⚠ REVIEW NEEDED)
```

**Formulas**:
```
B2: =IF(LEN(Responses!B2)=7, "✓", "✗ Invalid CWID")
C2: =IF(AND(Responses!F2>0, Responses!F2<=1440), "✓", "✗ Invalid minutes")
D2: =IF(COUNTIFS(Responses!$B:$B, Responses!B2, Responses!$A:$A, Responses!A2, Responses!$E:$E, Responses!E2)>1, "✗ DUPLICATE", "✓")
F2: =IF(COUNTIF(B2:E2, "✗*")>0, "⚠ REVIEW NEEDED", "✓ Valid")
```

### Participants Roster

**Purpose**: Manage participant information and generate prefill URLs

**Features**:
- Participant details
- Contact information
- Team assignments
- Prefill URL storage

**Columns**:
```
A: CWID
B: Name
C: Team
D: Email
E: Prefill URL (generated)
F: Status (Active/Inactive)
```

### Organizer Dashboard

**Purpose**: Quick overview of FITTOBER progress

**Features**:
- Total submissions count
- Unique participants
- Total minutes logged
- Team comparison chart
- Top 10 leaderboard
- Daily submission trend

**Sections**:
1. **Key Metrics** (top section)
   - Total submissions
   - Active participants
   - Total minutes
   - Average per participant

2. **Team Overview** (middle section)
   - Team rankings
   - Minutes per team
   - Participants per team
   - Team engagement %

3. **Recent Activity** (bottom section)
   - Last 10 submissions
   - Pending reviews
   - Validation alerts

## Creating Custom Templates

### Basic Template Structure

1. **Data Sheet**
   - Form responses (source data)

2. **Validation Sheet**
   - Data quality checks
   - Error flagging

3. **Summary Sheet**
   - Aggregated statistics
   - Key metrics

4. **Leaderboard Sheet**
   - Rankings
   - Top performers

### Formula Tips

**Count Unique Participants**:
```
=COUNTA(UNIQUE(FILTER(Responses!B:B, Responses!B:B<>"")))
```

**Sum Minutes**:
```
=SUM(Responses!F:F)
```

**Team Total**:
```
=SUMIF(Responses!D:D, "Team Alpha", Responses!F:F)
```

**Top 10 Participants**:
```
Use QUERY or SORT + FILTER functions
```

### Conditional Formatting Rules

**Highlight Duplicates** (Red):
```
Custom formula: =COUNTIF($B$2:$B, $B2) > 1
```

**Highlight Valid** (Green):
```
Text contains: "✓ Valid"
Background: Light green
```

**Highlight Issues** (Yellow/Red):
```
Text contains: "⚠ REVIEW"
Background: Light red
```

## Support

For issues with templates:
1. Check formula references match your sheet structure
2. Verify column indices in formulas
3. Test with sample data first
4. See `/docs/guides/SETUP_GUIDE.md` for detailed instructions

## Contributing

Have a great template to share?
1. Create the template
2. Test thoroughly
3. Document features and usage
4. Submit a pull request

---

*These templates are designed to work with the FITTOBER automation scripts. Use them together for best results.*
