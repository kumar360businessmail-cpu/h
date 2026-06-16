// Popup UI Controller
class PopupController {
  constructor() {
    this.initEventListeners();
    this.loadResumeData();
    this.loadApplications();
  }

  initEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Resume form
    document.getElementById('resumeForm').addEventListener('submit', (e) => this.saveResume(e));

    // Settings
    document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
    document.getElementById('exportData').addEventListener('click', () => this.exportData());
    document.getElementById('importData').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

    // Tracker
    document.getElementById('addApplication').addEventListener('click', () => this.showAddApplicationDialog());
  }

  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  }

  async loadResumeData() {
    const resume = await storage.getResume();
    if (resume && Object.keys(resume).length > 0) {
      document.getElementById('fullName').value = resume.fullName || '';
      document.getElementById('email').value = resume.email || '';
      document.getElementById('phone').value = resume.phone || '';
      document.getElementById('location').value = resume.location || '';
      document.getElementById('linkedin').value = resume.linkedin || '';
      document.getElementById('github').value = resume.github || '';
      document.getElementById('summary').value = resume.summary || '';
      document.getElementById('skills').value = resume.skills || '';
      document.getElementById('experience').value = resume.experience || '';
    }
  }

  async saveResume(e) {
    e.preventDefault();
    const resumeData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      linkedin: document.getElementById('linkedin').value,
      github: document.getElementById('github').value,
      summary: document.getElementById('summary').value,
      skills: document.getElementById('skills').value,
      experience: document.getElementById('experience').value,
      savedAt: new Date().toISOString()
    };

    try {
      await storage.saveResume(resumeData);
      this.showStatus('Resume saved successfully! ✓', 'success');
    } catch (error) {
      this.showStatus('Error saving resume: ' + error.message, 'error');
    }
  }

  async loadApplications() {
    const applications = await storage.getApplications();
    const list = document.getElementById('applicationsList');

    if (applications.length === 0) {
      list.innerHTML = '<p class="empty-state">No applications tracked yet</p>';
      return;
    }

    list.innerHTML = applications.map(app => `
      <div class="application-item">
        <h4>${app.company}</h4>
        <p><strong>Position:</strong> ${app.position}</p>
        <p><strong>URL:</strong> <a href="${app.url}" target="_blank">View</a></p>
        <p><strong>Applied:</strong> ${new Date(app.timestamp).toLocaleDateString()}</p>
        <select class="status-select" data-app-id="${app.id}" onchange="popup.updateApplicationStatus('${app.id}', this.value)">
          <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
          <option value="interview" ${app.status === 'interview' ? 'selected' : ''}>Interview Scheduled</option>
          <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          <option value="offered" ${app.status === 'offered' ? 'selected' : ''}>Offer Received</option>
        </select>
        <span class="application-status status-${app.status}">${app.status.toUpperCase()}</span>
      </div>
    `).join('');
  }

  showAddApplicationDialog() {
    const company = prompt('Company name:');
    if (!company) return;
    const position = prompt('Position:');
    if (!position) return;
    const url = prompt('Job posting URL:');
    if (!url) return;

    this.addApplication(company, position, url);
  }

  async addApplication(company, position, url) {
    const applicationData = {
      company,
      position,
      url,
      status: 'applied'
    };

    try {
      await storage.saveApplication(applicationData);
      this.loadApplications();
      this.showStatus('Application added successfully! ✓', 'success');
    } catch (error) {
      this.showStatus('Error adding application: ' + error.message, 'error');
    }
  }

  async updateApplicationStatus(applicationId, status) {
    try {
      await storage.updateApplicationStatus(applicationId, status);
      this.loadApplications();
    } catch (error) {
      this.showStatus('Error updating application: ' + error.message, 'error');
    }
  }

  async clearAllData() {
    if (confirm('⚠️ This will permanently delete ALL your data. Are you sure?')) {
      if (confirm('⚠️ Last confirmation: This action cannot be undone.')) {
        try {
          await storage.clearAllData();
          this.showStatus('All data cleared ✓', 'success');
          this.loadResumeData();
          this.loadApplications();
        } catch (error) {
          this.showStatus('Error clearing data: ' + error.message, 'error');
        }
      }
    }
  }

  async exportData() {
    const data = await storage.getData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simplify-copilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await chrome.storage.local.set({ 'simplify_copilot': data });
      this.loadResumeData();
      this.loadApplications();
      this.showStatus('Data imported successfully! ✓', 'success');
    } catch (error) {
      this.showStatus('Error importing data: ' + error.message, 'error');
    }
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById('resumeStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    setTimeout(() => {
      statusDiv.className = 'status-message';
    }, 3000);
  }
}

// Initialize
const popup = new PopupController();
