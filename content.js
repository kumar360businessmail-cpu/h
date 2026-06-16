// Enhanced Content Script - Smart Form Detection & Autofill
// Works with LinkedIn, Indeed, Glassdoor, Workday, and generic forms
// ZERO external API calls - 100% local intelligence

class SmartFormAutofiller {
  constructor() {
    this.fieldPatterns = this.buildPatterns();
    this.workdayQuestions = [];
    this.init();
  }

  buildPatterns() {
    return {
      'fullName': {
        patterns: ['name', 'full.?name', 'fullname', 'full_name', 'applicant.?name', 'your.?name', 'candidate.?name'],
        selectors: ['[name*="name"]', '[id*="name"]', '[placeholder*="name"]', '[aria-label*="name"]']
      },
      'firstName': {
        patterns: ['first.?name', 'firstname', 'first_name', 'fname', 'given.?name'],
        selectors: ['[name*="first"]', '[id*="first"]']
      },
      'lastName': {
        patterns: ['last.?name', 'lastname', 'last_name', 'lname', 'surname'],
        selectors: ['[name*="last"]', '[id*="last"]']
      },
      'email': {
        patterns: ['email', 'e.?mail', 'email.?address', 'contact.?email'],
        selectors: ['[name*="email"]', '[id*="email"]', 'input[type="email"]']
      },
      'phone': {
        patterns: ['phone', 'mobile', 'telephone', 'cell', 'contact.?phone'],
        selectors: ['[name*="phone"]', '[id*="phone"]', 'input[type="tel"]']
      },
      'location': {
        patterns: ['location', 'city', 'address', 'state', 'country'],
        selectors: ['[name*="location"]', '[id*="location"]', '[name*="city"]']
      },
      'linkedin': {
        patterns: ['linkedin', 'linkedin.?url', 'linkedin.?profile'],
        selectors: ['[name*="linkedin"]', '[id*="linkedin"]']
      },
      'github': {
        patterns: ['github', 'github.?url', 'github.?profile'],
        selectors: ['[name*="github"]', '[id*="github"]']
      }
    };
  }

  async init() {
    console.log('🚀 Smart Form Autofiller initialized');
    
    // Listen for autofill requests
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'autofill') {
        console.log('📝 Autofill request received');
        this.autofillAllForms(request.data);
        sendResponse({ success: true });
      } else if (request.action === 'detectForms') {
        const fields = this.detectAllFormFields();
        sendResponse({ fields, count: fields.length });
      } else if (request.action === 'getPageAnalysis') {
        const analysis = this.analyzePageForms();
        sendResponse({ analysis });
      }
    });
  }

  // ===== MAIN AUTOFILL =====
  async autofillAllForms(resumeData) {
    const forms = document.querySelectorAll('form');
    console.log(`📋 Found ${forms.length} forms on page`);

    forms.forEach((form, index) => {
      console.log(`🔄 Processing form ${index + 1}`);
      this.autofillForm(form, resumeData);
    });

    // Also fill fields outside forms
    this.autofillStandaloneFields(resumeData);
  }

  autofillForm(form, resumeData) {
    const fields = form.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      const matched = this.matchFieldToResume(field, resumeData);
      if (matched) {
        this.fillField(field, matched.value);
        console.log(`✅ Filled: ${matched.type} = ${String(matched.value).substring(0, 30)}`);
      }
    });
  }

  autofillStandaloneFields(resumeData) {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    inputs.forEach(input => {
      if (!input.closest('form')) {
        const matched = this.matchFieldToResume(input, resumeData);
        if (matched) {
          this.fillField(input, matched.value);
        }
      }
    });
  }

  // ===== SMART FIELD MATCHING =====
  matchFieldToResume(field, resumeData) {
    const name = (field.getAttribute('name') || '').toLowerCase();
    const id = (field.getAttribute('id') || '').toLowerCase();
    const placeholder = (field.getAttribute('placeholder') || '').toLowerCase();
    const label = this.getFieldLabel(field).toLowerCase();
    const combined = `${name} ${id} ${placeholder} ${label}`;

    // Try to match against patterns
    for (const [resumeField, value] of Object.entries(resumeData)) {
      if (!value) continue;

      const patterns = this.fieldPatterns[resumeField]?.patterns || [resumeField];
      
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(combined)) {
          return { type: resumeField, value };
        }
      }
    }

    return null;
  }

  getFieldLabel(field) {
    // Check for associated label
    const id = field.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent;
    }

    // Check aria-label
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check placeholder
    const placeholder = field.getAttribute('placeholder');
    if (placeholder) return placeholder;

    return '';
  }

  // ===== FIELD FILLING =====
  fillField(field, value) {
    const tagName = field.tagName.toLowerCase();

    if (tagName === 'select') {
      this.fillSelect(field, value);
    } else if (tagName === 'textarea' || tagName === 'input') {
      field.value = String(value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
      field.classList.add('simplify-autofilled');
    }
  }

  fillSelect(select, value) {
    const options = select.querySelectorAll('option');
    for (const option of options) {
      if (option.text.toLowerCase().includes(String(value).toLowerCase()) ||
          option.value.toLowerCase().includes(String(value).toLowerCase())) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  }

  // ===== FORM DETECTION =====
  detectAllFormFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(field => {
      if (this.isVisible(field)) {
        fields.push({
          name: field.getAttribute('name') || '',
          id: field.getAttribute('id') || '',
          type: field.type || field.tagName.toLowerCase(),
          placeholder: field.getAttribute('placeholder') || '',
          label: this.getFieldLabel(field) || '',
          isRequired: field.required,
          value: field.value
        });
      }
    });
    
    return fields;
  }

  isVisible(element) {
    return element.offsetParent !== null &&
           getComputedStyle(element).display !== 'none' &&
           getComputedStyle(element).visibility !== 'hidden';
  }

  analyzePageForms() {
    return {
      formCount: document.querySelectorAll('form').length,
      fieldCount: this.detectAllFormFields().length,
      isWorkday: document.body.innerHTML.includes('workday'),
      isLinkedIn: document.domain.includes('linkedin'),
      isIndeed: document.domain.includes('indeed'),
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize
const autofiller = new SmartFormAutofiller();
