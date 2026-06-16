// Content Script - Runs on web pages to detect and autofill forms

class FormAutofiller {
  constructor() {
    this.fieldMappings = {
      'fullName': ['name', 'full-name', 'fullname', 'full_name', 'applicant-name', 'applicantname'],
      'firstName': ['first-name', 'firstname', 'first_name', 'fname'],
      'lastName': ['last-name', 'lastname', 'last_name', 'lname'],
      'email': ['email', 'email-address', 'emailaddress', 'contact-email'],
      'phone': ['phone', 'phone-number', 'phonenumber', 'phone_number', 'mobile', 'contact-phone'],
      'location': ['city', 'location', 'address', 'state', 'country'],
      'linkedin': ['linkedin', 'linkedin-url', 'linkedin_url'],
      'github': ['github', 'github-url', 'github_url']
    };
    
    this.init();
  }

  async init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'autofill') {
        this.autofillPage(request.data);
        sendResponse({ success: true });
      }
    });
  }

  async autofillPage(resumeData) {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => this.autofillForm(form, resumeData));
  }

  autofillForm(form, resumeData) {
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    
    inputs.forEach(input => {
      const name = (input.getAttribute('name') || '').toLowerCase();
      const id = (input.getAttribute('id') || '').toLowerCase();
      const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      const combined = `${name} ${id} ${placeholder}`;

      // Try to match field
      for (const [resumeField, patterns] of Object.entries(this.fieldMappings)) {
        for (const pattern of patterns) {
          if (combined.includes(pattern)) {
            const value = resumeData[resumeField];
            if (value && input.value === '') {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.classList.add('simplify-autofilled');
              break;
            }
          }
        }
      }
    });
  }

  detectFormFields() {
    const forms = document.querySelectorAll('form');
    const detectedFields = [];

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
      inputs.forEach(input => {
        const name = (input.getAttribute('name') || '').toLowerCase();
        const id = (input.getAttribute('id') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        
        detectedFields.push({
          name,
          id,
          placeholder,
          type: input.type
        });
      });
    });

    return detectedFields;
  }
}

// Initialize
const autofiller = new FormAutofiller();

// Add context menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectForms') {
    const fields = autofiller.detectFormFields();
    sendResponse({ fields });
  }
});
