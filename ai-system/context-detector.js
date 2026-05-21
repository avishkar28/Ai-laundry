/**
 * FreshFold Context Detector
 * Detects current page, user state, and workflow context
 * Uses existing AGENT_CONTEXT telemetry system
 */

class ContextDetector {
  constructor() {
    this.currentPage = 'dashboard';
    this.currentModal = null;
    this.selectedOrder = null;
    this.focusedElement = null;
    this.pageContext = {};
    this.validationErrors = [];
    this.init();
  }

  /**
   * Initialize context detection
   */
  init() {
    this.detectPageContext();
    this.setupObservers();
    this.watchValidationErrors();
  }

  /**
   * Detect current page from navigation
   */
  detectPageContext() {
    const navItems = document.querySelectorAll('[data-nav]');
    navItems.forEach(item => {
      if (item.classList.contains('active')) {
        this.currentPage = item.getAttribute('data-nav');
        return;
      }
    });

    // Fallback: detect by visible sections
    const sections = document.querySelectorAll('[data-page]');
    sections.forEach(section => {
      if (!section.classList.contains('hidden')) {
        this.currentPage = section.getAttribute('data-page');
      }
    });

    return this.currentPage;
  }

  /**
   * Detect active modal or overlay
   */
  detectActiveModal() {
    const modals = document.querySelectorAll('.modal-overlay, [role="dialog"]');
    modals.forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        this.currentModal = modal.id || 'unknown-modal';
        this.pageContext.modalTitle = modal.querySelector('[data-title]')?.textContent || '';
      }
    });
    return this.currentModal;
  }

  /**
   * Detect selected order from table
   */
  detectSelectedOrder() {
    const selected = document.querySelector('[data-order-id][data-selected="true"]');
    if (selected) {
      this.selectedOrder = {
        id: selected.getAttribute('data-order-id'),
        status: selected.getAttribute('data-status'),
        customer: selected.querySelector('[data-field="customer"]')?.textContent,
        amount: selected.querySelector('[data-field="amount"]')?.textContent
      };
    }
    return this.selectedOrder;
  }

  /**
   * Get all visible form fields with values
   */
  getFormState() {
    const form = document.querySelector('form[data-form-id], [data-form]');
    if (!form) return {};

    const state = {};
    form.querySelectorAll('input, select, textarea').forEach(field => {
      const name = field.name || field.id;
      if (name) {
        state[name] = {
          value: field.value,
          type: field.type,
          valid: field.validity?.valid || true,
          error: field.validationMessage
        };
      }
    });
    return state;
  }

  /**
   * Detect validation errors in current form
   */
  watchValidationErrors() {
    document.addEventListener('invalid', (e) => {
      const field = e.target;
      this.validationErrors.push({
        fieldName: field.name || field.id,
        message: field.validationMessage,
        timestamp: Date.now()
      });
    }, true);

    // Also watch for custom error displays
    const observer = new MutationObserver(() => {
      const errorElements = document.querySelectorAll('.error-message, [data-error], .form-error');
      this.validationErrors = Array.from(errorElements).map(el => ({
        fieldName: el.closest('[data-field]')?.getAttribute('data-field') || 'unknown',
        message: el.textContent,
        timestamp: Date.now()
      }));
    });

    observer.observe(document.body, { subtree: true, childList: true });
  }

  /**
   * Get focused element details
   */
  getFocusedElement() {
    const focused = document.activeElement;
    if (!focused || focused === document.body) return null;

    return {
      type: focused.tagName,
      id: focused.id,
      name: focused.name,
      placeholder: focused.placeholder,
      value: focused.value,
      required: focused.required,
      tagName: focused.tagName
    };
  }

  /**
   * Get completed steps from page
   */
  getCompletedSteps(workflowId) {
    const completedElements = document.querySelectorAll('[data-step-completed="true"]');
    const completed = [];
    completedElements.forEach(el => {
      const stepId = el.getAttribute('data-step-id');
      if (stepId) completed.push(stepId);
    });
    return completed;
  }

  /**
   * Get visibility status of an element
   */
  isElementVisible(selector) {
    const element = document.querySelector(selector);
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }

  /**
   * Get all clickable buttons on current page
   */
  getAvailableButtons() {
    const buttons = [];
    document.querySelectorAll('button:not([disabled]), [role="button"]:not([aria-disabled="true"])').forEach(btn => {
      // Check visibility directly on the element
      const style = window.getComputedStyle(btn);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       btn.offsetParent !== null;
      
      if (isVisible) {
        buttons.push({
          text: btn.textContent.trim(),
          id: btn.id,
          dataAction: btn.getAttribute('data-action'),
          ariaLabel: btn.getAttribute('aria-label')
        });
      }
    });
    return buttons;
  }

  /**
   * Get all form fields on current page
   */
  getAvailableFields() {
    const fields = [];
    document.querySelectorAll('input, select, textarea').forEach(field => {
      // Check visibility directly on the element
      const style = window.getComputedStyle(field);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       field.offsetParent !== null;
      
      if (isVisible && field.offsetHeight > 0) {
        fields.push({
          name: field.name || field.id,
          type: field.type,
          label: document.querySelector(`label[for="${field.id}"]`)?.textContent || field.placeholder,
          required: field.required,
          value: field.value
        });
      }
    });
    return fields;
  }

  /**
   * Get current state snapshot
   */
  getContextSnapshot() {
    return {
      timestamp: new Date().toISOString(),
      currentPage: this.detectPageContext(),
      currentModal: this.detectActiveModal(),
      selectedOrder: this.detectSelectedOrder(),
      focusedElement: this.getFocusedElement(),
      formState: this.getFormState(),
      availableButtons: this.getAvailableButtons(),
      availableFields: this.getAvailableFields(),
      validationErrors: this.validationErrors,
      visibleElements: {
        modals: Array.from(document.querySelectorAll('.modal-overlay:not(.hidden)')).map(m => m.id),
        drawers: Array.from(document.querySelectorAll('.drawer:not(.hidden)')).map(d => d.id)
      }
    };
  }

  /**
   * Setup MutationObserver to track page changes
   */
  setupObservers() {
    // Watch for navigation changes
    const observer = new MutationObserver(() => {
      this.detectPageContext();
      this.detectActiveModal();
      this.detectSelectedOrder();
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-nav', 'data-page', 'data-selected']
    });

    // Track focus changes
    document.addEventListener('focus', (e) => {
      if (e.target.tagName.match(/INPUT|SELECT|TEXTAREA/i)) {
        this.focusedElement = e.target;
      }
    }, true);
  }

  /**
   * Check if a specific workflow can be started
   */
  canStartWorkflow(workflowId) {
    const workflow = getWorkflow(workflowId);
    if (!workflow) return false;

    // Basic checks
    if (workflowId === 'create_order') {
      return this.currentPage === 'orders';
    }
    if (workflowId === 'assign_pickup') {
      return this.selectedOrder && this.selectedOrder.status === 'pending';
    }
    if (workflowId === 'mark_delivered') {
      return this.selectedOrder && this.selectedOrder.status === 'in-cleaning';
    }
    if (workflowId === 'generate_invoice') {
      return this.selectedOrder && this.selectedOrder.status === 'delivered';
    }

    return true;
  }

  /**
   * Get recommended workflows for current context
   */
  getRecommendedWorkflows() {
    const workflows = getAllWorkflows();
    return workflows.filter(w => this.canStartWorkflow(w.id));
  }

  /**
   * Format context for AI prompt
   */
  getContextForAI() {
    const snapshot = this.getContextSnapshot();
    return `
Current Context:
- Page: ${snapshot.currentPage}
- Modal: ${snapshot.currentModal || 'none'}
- Selected Order: ${snapshot.selectedOrder?.id || 'none'}
- Focused Element: ${snapshot.focusedElement?.name || 'none'}
- Available Buttons: ${snapshot.availableButtons.map(b => b.text).join(', ')}
- Validation Errors: ${snapshot.validationErrors.length > 0 ? snapshot.validationErrors.map(e => e.message).join('; ') : 'none'}
    `.trim();
  }
}

// Initialize global context detector
const contextDetector = new ContextDetector();
