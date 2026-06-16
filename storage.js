// Advanced Local Storage Manager - 100% OFFLINE
// All data stored ONLY in browser's local storage - NEVER sent anywhere

class AdvancedStorageManager {
  constructor() {
    this.storageKey = 'simplify_copilot_data';
    this.fieldLearnKey = 'simplify_copilot_learned_fields';
    this.questionsKey = 'simplify_copilot_questions';
    this.init();
  }

  async init() {
    // Verify storage is working
    try {
      await chrome.storage.local.get([this.storageKey]);
      console.log('✅ Storage initialized successfully');
    } catch (error) {
      console.error('❌ Storage error:', error);
    }
  }

  // ===== RESUME DATA =====
  async saveResume(resumeData) {
    const data = await this.getData();
    data.resume = { ...resumeData, savedAt: new Date().toISOString() };
    await chrome.storage.local.set({ [this.storageKey]: data });
    console.log('✅ Resume saved:', resumeData);
    return data.resume;
  }

  async getResume() {
    const data = await this.getData();
    return data.resume || {};
  }

  // ===== FIELD LEARNING (Smart AI) =====
  // Learns field patterns to improve autofill accuracy
  async learnField(fieldName, fieldId, fieldLabel, userProvidedValue, autofilledValue) {
    const learned = await this.getLearnedFields();
    
    const fieldKey = `${fieldName}|${fieldId}|${fieldLabel}`.toLowerCase();
    
    if (!learned[fieldKey]) {
      learned[fieldKey] = {
        possibleValues: [],
        autofilledCount: 0,
        userCorrectedCount: 0,
        bestMatch: null,
        fieldType: this.inferFieldType(fieldLabel || fieldName),
        examples: []
      };
    }

    // Track if user corrected the autofilled value
    if (userProvidedValue !== autofilledValue) {
      learned[fieldKey].userCorrectedCount++;
      learned[fieldKey].possibleValues.push(userProvidedValue);
    } else {
      learned[fieldKey].autofilledCount++;
    }

    learned[fieldKey].examples.push({
      autofilled: autofilledValue,
      actual: userProvidedValue,
      timestamp: new Date().toISOString()
    });

    // Keep only last 5 examples
    if (learned[fieldKey].examples.length > 5) {
      learned[fieldKey].examples = learned[fieldKey].examples.slice(-5);
    }

    // Determine best match
    if (learned[fieldKey].possibleValues.length > 0) {
      learned[fieldKey].bestMatch = this.mostFrequent(learned[fieldKey].possibleValues);
    }

    await chrome.storage.local.set({ [this.fieldLearnKey]: learned });
    console.log('📚 Learned field pattern:', fieldKey, learned[fieldKey]);
  }

  async getLearnedFields() {
    const result = await chrome.storage.local.get([this.fieldLearnKey]);
    return result[this.fieldLearnKey] || {};
  }

  inferFieldType(fieldLabel) {
    const label = (fieldLabel || '').toLowerCase();
    if (label.includes('email')) return 'email';
    if (label.includes('phone') || label.includes('mobile')) return 'phone';
    if (label.includes('date') || label.includes('dob')) return 'date';
    if (label.includes('yes') || label.includes('no')) return 'boolean';
    if (label.includes('experience') || label.includes('year')) return 'number';
    return 'text';
  }

  mostFrequent(arr) {
    return arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop();
  }

  // ===== QUESTIONS & ANSWERS =====
  // Store answers to frequently asked questions
  async saveAnswer(question, answer) {
    const questions = await this.getSavedAnswers();
    const questionHash = this.hashQuestion(question);
    
    questions[questionHash] = {
      question: question,
      answer: answer,
      savedAt: new Date().toISOString(),
      useCount: (questions[questionHash]?.useCount || 0) + 1
    };

    await chrome.storage.local.set({ [this.questionsKey]: questions });
    console.log('💾 Question saved:', question);
  }

  async getSavedAnswers() {
    const result = await chrome.storage.local.get([this.questionsKey]);
    return result[this.questionsKey] || {};
  }

  hashQuestion(question) {
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
      const char = question.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  // ===== APPLICATION TRACKING =====
  async saveApplication(applicationData) {
    const data = await this.getData();
    if (!data.applications) data.applications = [];
    applicationData.id = Date.now().toString();
    applicationData.timestamp = new Date().toISOString();
    data.applications.push(applicationData);
    await chrome.storage.local.set({ [this.storageKey]: data });
    return applicationData;
  }

  async getApplications() {
    const data = await this.getData();
    return data.applications || [];
  }

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

  // ===== GENERAL DATA =====
  async getData() {
    const result = await chrome.storage.local.get([this.storageKey]);
    return result[this.storageKey] || { resume: {}, applications: [] };
  }

  async clearAllData() {
    await chrome.storage.local.remove([this.storageKey, this.fieldLearnKey, this.questionsKey]);
    console.log('🗑️ All local data cleared');
  }
}

const storage = new AdvancedStorageManager();
