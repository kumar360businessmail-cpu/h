// Enhanced Popup Controller with Smart Features

class EnhancedPopupController {
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
    const resumeForm = document.getElementById('resumeForm');
    if (resumeForm) {
      resumeForm.addEventListener('submit', (e) => this.saveResume(e));
    }

    // Autofill
    const triggerBtn = document.getElementById('triggerAutofill');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.triggerAutofill());
    }

    // Settings
    document.getElementById('clearData')?.addEventListener('click', () => this.clearAllData());
    document.getElementById('exportData')?.addEventListener('click', () => this.exportData());
    document.getElementById('importData')?.addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile')?.addEventListener('change', (e) => this.importData(e));

    // Tracker
    document.getElementById('addApplication')?.addEventListener('click', () => this.showAddApplicationDialog());

    // Analysis
    document.getElementById('analyzeCurrentPage')?.addEventListener('click', () => this.analyzeCurrentPage());
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  }

  async loadResumeData() {
    const resume = await storage.getResume();
    if (resume && Object.keys(resume).length > 0) {
      ['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'summary', 'skills', 'experience'].forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = resume[field] || '';
      });
    }
  }

  async saveResume(e) {
    e.preventDefault();
    const resumeData = {
      fullName: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      location: document.getElementById('location')?.value || '',
      linkedin: document.getElementById('linkedin')?.value || '',
      github: document.getElementById('github')?.value || '',
      summary: document.getElementById('summary')?.value || '',
      skills: document.getElementById('skills')?.value || '',
      experience: document.getElementById('experience')?.value || ''
    };

    try {
      await storage.saveResume(resumeData);
      this.showStatus('✅ Resume saved successfully!', 'success', 'resumeStatus');
      console.log('✅ Resume saved to local storage');
    } catch (error) {
      this.showStatus('❌ Error: ' + error.message, 'error', 'resumeStatus');
    }
  }

  async triggerAutofill() {
    try {
      const resume = await storage.getResume();
      if (Object.keys(resume).length === 0) {
        this.showStatus('⚠️ Please save your resume first!', 'error');
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'autofill', data: resume }, (response) => {
        if (response?.success) {
          this.showStatus('✅ Autofill completed!', 'success');
        }
      });
    } catch (error) {
      this.showStatus('❌ Error: ' + error.message, 'error');
    }
  }

  async analyzeCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'getPageAnalysis' }, (response) => {
        if (response?.analysis) {
          const msg = `📊 Found: ${response.analysis.fieldCount} fields\n✓ Workday: ${response.analysis.isWorkday}\n✓ LinkedIn: ${response.analysis.isLinkedIn}`;
          alert(msg);
        }
      });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async loadApplications() {
    const applications = await storage.getApplications();
    const list = document.getElementById('applicationsList');
    if (!list) return;

    if (applications.length === 0) {
      list.innerHTML = '<p class="empty-state">No applications tracked yet</p>';
      return;
    }

    list.innerHTML = applications.map(app => `
      <div class="application-item">
        <h4>${app.company}</h4>
        <p><strong>Position:</strong> ${app.position}</p>
        <p><strong>Applied:</strong> ${new Date(app.timestamp).toLocaleDateString()}</p>
        <span class="application-status status-${app.status}">${app.status.toUpperCase()}</span>
      </div>
    `).join('');
  }

  showAddApplicationDialog() {
    const company = prompt('Company name:');
    if (!company) return;
    const position = prompt('Position:');
    if (!position) return;
    const url = prompt('Job URL:');
    if (!url) return;

    this.addApplication(company, position, url);
  }

  async addApplication(company, position, url) {
    const applicationData = { company, position, url, status: 'applied' };
    try {
      await storage.saveApplication(applicationData);
      this.loadApplications();
      this.showStatus('✅ Application added!', 'success');
    } catch (error) {
      this.showStatus('❌ Error: ' + error.message, 'error');
    }
  }

  async clearAllData() {
    if (confirm('⚠️ Delete ALL data?')) {
      if (confirm('⚠️ Last warning - cannot undo!')) {
        await storage.clearAllData();
        this.showStatus('✅ Data cleared', 'success');
        this.loadResumeData();
        this.loadApplications();
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
    a.download = `simplify-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await chrome.storage.local.set({ 'simplify_copilot_data': data });
      this.loadResumeData();
      this.loadApplications();
      this.showStatus('✅ Data imported!', 'success');
    } catch (error) {
      this.showStatus('❌ Import failed: ' + error.message, 'error');
    }
  }

  showStatus(message, type, elementId = 'resumeStatus') {
    const statusDiv = document.getElementById(elementId);
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `status-message ${type}`;
      setTimeout(() => {
        statusDiv.className = 'status-message';
      }, 3000);
    }
  }
}

const popup = new EnhancedPopupController();
