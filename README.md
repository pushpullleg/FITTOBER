# FITOBER Activity Logger

A custom web app to quickly log FITOBER activities and generate pre-filled Google Form URLs for each team member.

## Features

- Dropdown to select team member
- Auto-fills team name, member name, CWID
- Select activity type and duration
- Opens pre-filled Google Form link in new tab
- Local history of recent logs

## How to Deploy to GitHub Pages

1. **Create a GitHub Repository**
   - Go to [github.com](https://github.com/) and sign in
   - Click "+" (top right) → "New repository"
   - Name it: `fitober-logger` (or any name)
   - Make it Public
   - Click "Create repository"

2. **Upload Files**
   - On your new repo page, click "Add file" → "Upload files"
   - Upload `index.html`, `app.js`, and this `README.md`
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Go to "Settings" → "Pages"
   - Under "Source", select "main" branch (or your default branch) and `/root`
   - Click "Save"
   - Your app will be published at: `https://<your-username>.github.io/<your-repo>/`

## Usage

1. Open your GitHub Pages link.
2. Select your team member.
3. Choose activity and duration.
4. Click "Open Pre-filled Form" — Google Form opens in new tab, just click "Submit".
5. Recent logs will appear at the bottom for easy tracking.

---

*Not affiliated with Google or FITOBER. For educational purposes.*