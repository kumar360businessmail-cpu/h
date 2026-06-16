# Simplify Copilot - Job Application Assistant

🔐 **Privacy-First • 100% Offline • No Data Collection**

A Chrome extension to help you apply to jobs faster with autofill, application tracking, and AI-powered resume generation — all running locally on your device.

## Features

### 📋 Resume Management
- Store your resume information locally (never leaves your device)
- Save personal details, contact info, professional summary, skills, and experience
- All data encrypted in your browser's local storage

### 🚀 Smart Autofill
- Automatically fill job application forms with your resume data
- Works on LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter, and most job sites
- Right-click context menu for quick autofill
- Supports custom form fields and variations

### 📊 Application Tracker
- Track all your job applications in one place
- Monitor application status: Applied, Interview, Rejected, Offered
- Keep links to job postings for quick reference
- View application dates and timestamps

### ⚙️ Privacy Controls
- Export your data as JSON backup
- Import data from backup
- Clear all data with one click
- Complete transparency about what's stored

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extension directory
6. The extension will appear in your Chrome toolbar

## Privacy & Security

✅ **100% Offline**: All data stored locally in your browser  
✅ **No Cloud Sync**: Your information never leaves your device  
✅ **No Tracking**: No analytics, no telemetry, no third-party requests  
✅ **No Ads**: No advertising or data selling  
✅ **Open Source**: Full transparency of what the code does  

## How to Use

### 1. Set Up Your Resume
1. Click the Simplify Copilot icon in Chrome toolbar
2. Go to the "Resume" tab
3. Fill in your information:
   - Personal details (name, email, phone, location)
   - Professional links (LinkedIn, GitHub)
   - Professional summary and skills
   - Work experience (JSON format)
4. Click "Save Resume"

### 2. Autofill Job Applications
1. Go to a job application form
2. Either:
   - Right-click on a form field and select "Simplify: Autofill with my resume"
   - Click the extension icon and use the Autofill tab
3. Your resume data will be automatically filled in

### 3. Track Applications
1. Go to the "Tracker" tab
2. Click "+ New Application"
3. Enter:
   - Company name
   - Job position
   - Link to job posting
4. Update status as you progress (Applied → Interview → Offered)

### 4. Backup Your Data
1. Go to Settings tab
2. Click "Export Data" to download JSON backup
3. Click "Import Data" to restore from backup

## File Structure

```
├── manifest.json       # Chrome extension configuration
├── popup.html         # Main UI
├── popup.css          # Styling
├── popup.js           # UI logic
├── storage.js         # Local storage manager
├── content.js         # Form detection and autofill
├── background.js      # Service worker
└── icons/             # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## Data Storage Format

All data is stored in Chrome's `chrome.storage.local` in the following structure:

```json
{
  "simplify_copilot": {
    "resume": {
      "fullName": "Your Name",
      "email": "you@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "City, State",
      "linkedin": "https://linkedin.com/in/yourprofile",
      "github": "https://github.com/yourprofile",
      "summary": "Professional summary...",
      "skills": "Skill1, Skill2, Skill3",
      "experience": "[...]",
      "savedAt": "2024-01-15T10:30:00Z"
    },
    "applications": [
      {
        "id": "1234567890",
        "company": "Acme Corp",
        "position": "Senior Developer",
        "url": "https://careers.acme.com/job/123",
        "status": "applied",
        "timestamp": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-16T14:30:00Z"
      }
    ]
  }
}
```

## Permissions Explained

- **`storage`**: Stores your resume and application data locally
- **`scripting`**: Runs autofill script on job application pages
- **`tabs`**: Accesses current tab for autofilling
- **`activeTab`**: Works on the active tab
- **`contextMenus`**: Adds right-click context menu for autofill
- **`<all_urls>`**: Can access any website (needed for job site autofill)

## Support for Job Sites

Tested and working on:
- ✅ LinkedIn Jobs
- ✅ Indeed
- ✅ Glassdoor
- ✅ Monster
- ✅ ZipRecruiter
- ✅ Company career sites
- ✅ Generic HTML forms

## Troubleshooting

### Autofill not working?
1. Make sure you've saved your resume first
2. Check that form fields have standard naming (name, email, phone, etc.)
3. Try the context menu approach
4. Check console for errors (F12)

### Data not saving?
1. Make sure you clicked "Save Resume"
2. Check that your browser isn't in private/incognito mode
3. Check extension permissions in `chrome://extensions`

### Lost data?
1. If you exported a backup, use "Import Data" to restore
2. Check if your backup file exists in Downloads

## Development

### To modify the extension:
1. Edit the source files
2. Go to `chrome://extensions`
3. Click "Reload" on the Simplify Copilot extension
4. Test your changes

### To debug:
1. Right-click the extension icon → "Inspect popup"
2. Press F12 on any page to see console logs

## Future Enhancements

- [ ] AI-powered resume optimization
- [ ] Cover letter templates
- [ ] Job search aggregation
- [ ] Interview preparation
- [ ] Salary negotiation tools
- [ ] Multiple resume support
- [ ] Dark mode
- [ ] Keyboard shortcuts

## License

MIT License - Feel free to use and modify

## Disclaimer

This extension is provided as-is. Always review autofilled information before submitting applications. The developers are not responsible for any data loss or issues arising from using this extension.

---

**Made with ❤️ for job seekers who value their privacy**
