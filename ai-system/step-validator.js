/**
 * FreshFold Step Validator
 * Validates step completion logic
 */

class StepValidator {
  /**
   * Validate step completion
   */
  validate(validationType, element, context = {}) {
    switch (validationType) {
      case 'input_not_empty':
        return this.validateInputNotEmpty(element);
      case 'number_entered':
        return this.validateNumberEntered(element);
      case 'phone_valid':
        return this.validatePhoneNumber(element);
      case 'email_valid':
        return this.validateEmail(element);
      case 'option_selected':
      case 'driver_selected':
      case 'vehicle_selected':
        return this.validateSelectOption(element);
      case 'date_selected':
        return this.validateDateSelected(element);
      case 'time_selected':
        return this.validateTimeSelected(element);
      case 'button_clicked':
        return this.validateButtonClicked(element, context);
      case 'form_opened':
      case 'modal_opened':
        return this.validateModalOpen(context);
      case 'order_selected':
        return this.validateOrderSelected(context);
      case 'page_loaded':
        return this.validatePageLoaded(context);
      case 'summary_visible':
        return this.validateSummaryVisible();
      case 'optional_field':
        return true; // Always pass for optional fields
      default:
        return false;
    }
  }

  /**
   * Validate input not empty
   */
  validateInputNotEmpty(element) {
    if (!element) return false;
    const value = element.value || element.textContent;
    return value && value.trim().length > 0;
  }

  /**
   * Validate number entered
   */
  validateNumberEntered(element) {
    if (!element) return false;
    const value = element.value || element.textContent;
    return /^\d+(\.\d+)?$/.test(value.trim());
  }

  /**
   * Validate phone number (India format: 10 digits)
   */
  validatePhoneNumber(element) {
    if (!element) return false;
    const value = element.value.replace(/\D/g, '');
    return value.length === 10;
  }

  /**
   * Validate email
   */
  validateEmail(element) {
    if (!element) return false;
    const email = element.value || element.textContent;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate select option chosen
   */
  validateSelectOption(element) {
    if (!element) return false;
    const value = element.value;
    return value && value.trim().length > 0 && value !== '';
  }

  /**
   * Validate date selected
   */
  validateDateSelected(element) {
    if (!element) return false;
    const value = element.value;
    if (!value) return false;

    // Check if date is in future
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }

  /**
   * Validate time selected
   */
  validateTimeSelected(element) {
    if (!element) return false;
    const value = element.value;
    return value && /^\d{2}:\d{2}/.test(value);
  }

  /**
   * Validate button clicked (always true when checking)
   */
  validateButtonClicked(element, context) {
    return true; // Detected via event listener
  }

  /**
   * Validate modal is open
   */
  validateModalOpen(context) {
    const modal = document.querySelector('.modal-overlay:not(.hidden), [role="dialog"]:not(.hidden)');
    return modal !== null;
  }

  /**
   * Validate order is selected
   */
  validateOrderSelected(context) {
    return contextDetector.selectedOrder !== null;
  }

  /**
   * Validate page is loaded
   */
  validatePageLoaded(context) {
    return document.readyState === 'complete';
  }

  /**
   * Validate order summary is visible
   */
  validateSummaryVisible() {
    const summary = document.querySelector('[data-summary="order-summary"]');
    if (!summary) return false;
    return window.getComputedStyle(summary).display !== 'none';
  }

  /**
   * Get validation error message
   */
  getErrorMessage(validationType) {
    const messages = {
      input_not_empty: 'Please fill in this field',
      number_entered: 'Please enter a valid number',
      phone_valid: 'Phone must be 10 digits',
      email_valid: 'Please enter a valid email',
      option_selected: 'Please select an option',
      driver_selected: 'Please select a driver',
      vehicle_selected: 'Please select a vehicle',
      date_selected: 'Please select a future date',
      time_selected: 'Please select a time',
      button_clicked: 'Please click the button',
      form_opened: 'Please open the form',
      modal_opened: 'Please open the dialog',
      order_selected: 'Please select an order',
      page_loaded: 'Please wait for the page to load',
      summary_visible: 'Please review the summary'
    };
    return messages[validationType] || 'Invalid input';
  }
}
