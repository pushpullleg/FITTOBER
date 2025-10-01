# Contributing to FITTOBER

Thank you for your interest in improving FITTOBER! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a feature request:

1. **Check Existing Issues**: Search to see if someone else has already reported it
2. **Create New Issue**: Use the appropriate template
3. **Provide Details**:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Error messages from logs

### Suggesting Enhancements

Have an idea to improve FITTOBER?

1. **Open an Issue**: Describe your enhancement
2. **Explain the Value**: Why is this useful?
3. **Consider Impact**: How many users benefit?
4. **Provide Examples**: Show how it would work

### Contributing Code

#### Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/FITTOBER.git
   cd FITTOBER
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

#### Making Changes

1. **Follow Code Style**
   - Use clear, descriptive variable names
   - Add comments for complex logic
   - Follow existing code patterns
   - Keep functions focused and concise

2. **Test Your Changes**
   - Test with sample data
   - Verify edge cases
   - Check Apps Script execution logs
   - Test email delivery (if applicable)

3. **Document Your Changes**
   - Update relevant README files
   - Add inline comments if needed
   - Update guides if behavior changes

#### Submitting Changes

1. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add feature: brief description"
   ```

   **Good commit messages**:
   - `Add duplicate detection for same-day submissions`
   - `Fix email confirmation template formatting`
   - `Update setup guide with troubleshooting section`

2. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Link related issues

#### Pull Request Guidelines

- **Clear Title**: Describe what the PR does
- **Detailed Description**: Explain the changes and why
- **Testing**: Describe how you tested
- **Screenshots**: Include for UI changes
- **Breaking Changes**: Highlight if any
- **Documentation**: Update if needed

## Types of Contributions

### 1. Script Improvements

**Examples**:
- Better error handling
- Performance optimizations
- New validation rules
- Additional features

**Files**: `/automation/*/*.gs`

### 2. Documentation

**Examples**:
- Fix typos or unclear instructions
- Add troubleshooting tips
- Create new guides
- Improve examples

**Files**: `/docs/**/*.md`

### 3. Templates

**Examples**:
- New spreadsheet templates
- Dashboard improvements
- Formula optimizations
- Visual enhancements

**Files**: `/templates/**/*`

### 4. Integration Examples

**Examples**:
- Slack integration guide
- Zapier templates
- API examples
- Webhook implementations

**Files**: `/docs/guides/INTEGRATION_GUIDE.md`

## Code Style Guidelines

### Google Apps Script

```javascript
// Good: Clear function names and comments
/**
 * Validates participant submission data
 * @param {Object} submission - The submission data
 * @return {Object} Validation results with errors and warnings
 */
function validateSubmission(submission) {
  var results = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check CWID format
  if (!submission.cwid || submission.cwid.length !== 7) {
    results.isValid = false;
    results.errors.push('Invalid CWID format');
  }
  
  return results;
}

// Bad: Unclear names, no comments
function val(s) {
  var r = {v:true,e:[],w:[]};
  if(!s.c||s.c.length!==7){r.v=false;r.e.push('bad cwid');}
  return r;
}
```

### Configuration

```javascript
// Good: Clear config with comments
var CONFIG = {
  // Email settings
  ORGANIZER_EMAIL: 'organizer@example.com',  // Update this
  SEND_CONFIRMATIONS: true,                   // Set false to disable
  
  // Validation thresholds
  MAX_MINUTES: 1440,  // 24 hours in minutes
  MIN_MINUTES: 1      // At least 1 minute required
};

// Bad: Magic numbers, no context
var CONFIG = {
  email: 'organizer@example.com',
  sc: true,
  mx: 1440,
  mn: 1
};
```

### Error Handling

```javascript
// Good: Comprehensive error handling
try {
  var result = processSubmission(data);
  Logger.log('Success: ' + result);
} catch (error) {
  Logger.log('Error processing submission: ' + error.message);
  notifyOrganizerOfError(error);
  // Continue gracefully
}

// Bad: No error handling
var result = processSubmission(data);
Logger.log('Success');
```

## Documentation Guidelines

### Markdown Style

- Use clear headings (H1 for title, H2 for sections, H3 for subsections)
- Include table of contents for long documents
- Use code blocks with language specification
- Add images/screenshots where helpful
- Keep line length reasonable (~80-100 chars)

### Example Format

```markdown
# Feature Name

Brief description of what this feature does.

## Prerequisites

- [ ] Requirement 1
- [ ] Requirement 2

## Setup Instructions

### Step 1: Do Something

1. First action
2. Second action
3. Third action

### Step 2: Do Something Else

Instructions...

## Testing

How to verify it works...

## Troubleshooting

Common issues and solutions...
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test edge cases
- [ ] Test error handling
- [ ] Verify email delivery
- [ ] Check spreadsheet updates
- [ ] Review execution logs
- [ ] Test with multiple users simultaneously

### Sample Test Data

Create test data that covers:
- Normal cases
- Edge cases (empty, null, very large)
- Invalid formats
- Duplicates
- Boundary conditions

## Review Process

### What We Look For

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it readable and maintainable?
3. **Testing**: Has it been tested thoroughly?
4. **Documentation**: Is it well documented?
5. **Impact**: Does it solve a real problem?

### Review Timeline

- Initial review: Within 3-5 days
- Follow-up: As needed for clarifications
- Merge: When approved by maintainer

## Getting Help

### Resources

- **Documentation**: `/docs/` directory
- **Examples**: `/docs/guides/EXAMPLE_WALKTHROUGH.md`
- **Issues**: Check open issues for discussions

### Contact

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Email**: For sensitive topics

## Recognition

Contributors will be:
- Listed in release notes
- Credited in documentation
- Thanked in pull request comments

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal or political attacks
- Publishing others' private information

### Enforcement

Violations will result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to repository maintainers.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

## Quick Start for Contributors

1. **Find an Issue**
   - Look for `good first issue` labels
   - Check `help wanted` labels
   - Propose your own ideas

2. **Set Up Development**
   - Fork and clone
   - Read relevant documentation
   - Understand existing code

3. **Make Changes**
   - Create feature branch
   - Write clear code
   - Test thoroughly

4. **Submit PR**
   - Write clear description
   - Link related issues
   - Be responsive to feedback

5. **Celebrate!**
   - Your contribution helps others
   - You've improved FITTOBER
   - Thank you! 🎉

---

**Ready to contribute?** Pick an issue or create your own and get started!

Thank you for helping make FITTOBER better! 💪
