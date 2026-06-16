// Local Storage Manager - All data stored offline in browser
class StorageManager {
  constructor() {
    this.storageKey = 'simplify_copilot';
  }

  // Save resume data
  async saveResume(resumeData) {
    const data = await this.getData();
    data.resume = resumeData;
    await chrome.storage.local.set({ [this.storageKey]: data });
    return resumeData;
  }

  // Get resume data
  async getResume() {
    const data = await this.getData();
    return data.resume || {};
  }

  // Save job application
  async saveApplication(applicationData) {
    const data = await this.getData();
    if (!data.applications) data.applications = [];
    applicationData.id = Date.now().toString();
    applicationData.timestamp = new Date().toISOString();
    data.applications.push(applicationData);
    await chrome.storage.local.set({ [this.storageKey]: data });
    return applicationData;
  }

  // Get all applications
  async getApplications() {
    const data = await this.getData();
    return data.applications || [];
  }

  // Update application status
  async updateApplicationStatus(applicationId, status) {
    const data = await this.getData();
    const app = data.applications.find(a => a.id === applicationId);
    if (app) {
      app.status = status;
      app.updatedAt = new Date().toISOString();
      await chrome.storage.local.set({ [this.storageKey]: data });
    }
    return app;
  }

  // Get all data
  async getData() {
    const result = await chrome.storage.local.get([this.storageKey]);
    return result[this.storageKey] || { resume: {}, applications: [] };
  }

  // Clear all data
  async clearAllData() {
    await chrome.storage.local.remove([this.storageKey]);
  }
}

const storage = new StorageManager();
