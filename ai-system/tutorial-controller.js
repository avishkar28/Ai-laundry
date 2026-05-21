/**
 * FreshFold AI Tutorial Controller
 * Main orchestrator for interactive guided workflows
 */

class AITutorialController {
  constructor() {
    this.activeWorkflow = null;
    this.currentStepIndex = 0;
    this.completedSteps = [];
    this.isRunning = false;
    this.stepValidator = new StepValidator();
    this.init();
  }

  /**
   * Initialize tutorial controller
   */
  init() {
    // Setup step completion detection
    this.setupCompletionDetection();
  }

  /**
   * Start a workflow
   */
  async startWorkflow(workflowId) {
    const workflow = getWorkflow(workflowId);
    if (!workflow) {
      console.error(`[Tutorial] Workflow not found: ${workflowId}`);
      return false;
    }

    // Check if workflow can be started
    if (!contextDetector.canStartWorkflow(workflowId)) {
      this.showWorkflowWarning(workflow);
      return false;
    }

    this.activeWorkflow = workflow;
    this.currentStepIndex = 0;
    this.completedSteps = [];
    this.isRunning = true;

    console.log(`[Tutorial] Started workflow: ${workflow.name}`);

    // Show workflow introduction
    await this.showWorkflowIntro(workflow);

    // Start first step
    this.goToStep(0);

    return true;
  }

  /**
   * Show workflow introduction modal
   */
  async showWorkflowIntro(workflow) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'tutorial-intro-modal';
      modal.innerHTML = `
        <div class="tutorial-intro-content">
          <div class="intro-header">
            <i class="fas ${workflow.icon}"></i>
            <h2>${workflow.name}</h2>
          </div>
          <p class="intro-description">${workflow.description}</p>
          
          <div class="intro-stats">
            <div class="stat">
              <strong>${workflow.steps.length}</strong>
              <span>Steps</span>
            </div>
            <div class="stat">
              <strong>${Math.round(workflow.totalEstimatedTime / 60)}</strong>
              <span>Min</span>
            </div>
          </div>

          <div class="intro-steps-preview">
            <h4>What you'll learn:</h4>
            <ol>
              ${workflow.steps.slice(0, 3)
                .map((s) => `<li>${s.title}</li>`)
                .join('')}
              ${workflow.steps.length > 3 ? `<li>... and ${workflow.steps.length - 3} more steps</li>` : ''}
            </ol>
          </div>

          <div class="intro-actions">
            <button class="btn-intro-start" onclick="this.closest('.tutorial-intro-modal').remove(); aiTutorial.goToStep(0);">
              <i class="fas fa-play"></i> Start Tutorial
            </button>
            <button class="btn-intro-cancel" onclick="this.closest('.tutorial-intro-modal').remove(); aiTutorial.cancelWorkflow();">
              Cancel
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Fade in
      setTimeout(() => modal.classList.add('show'), 10);
    });
  }

  /**
   * Show workflow warning if preconditions not met
   */
  showWorkflowWarning(workflow) {
    alert(`Cannot start "${workflow.name}"\n\nPreconditions not met. This workflow requires:\n- ${workflow.description}`);
  }

  /**
   * Go to specific step
   */
  async goToStep(stepIndex) {
    if (!this.activeWorkflow) return;
    if (stepIndex < 0 || stepIndex >= this.activeWorkflow.steps.length) return;

    this.currentStepIndex = stepIndex;
    const step = this.activeWorkflow.steps[stepIndex];

    console.log(`[Tutorial] Step ${stepIndex + 1}/${this.activeWorkflow.steps.length}: ${step.title}`);

    // Show progress
    highlightSystem.showProgress(stepIndex + 1, this.activeWorkflow.steps.length);
    highlightSystem.showStepIndicator(
      stepIndex,
      this.activeWorkflow.steps
    );

    // Highlight target element
    const highlighted = highlightSystem.highlight(step.target, step.instruction, {
      stepNumber: stepIndex + 1,
      autoFocus: step.autoFocus,
      hint: step.hint,
      showSkip: stepIndex < this.activeWorkflow.steps.length - 1
    });

    if (!highlighted) {
      this.showError(step, `Element not found: ${step.target}`);
      return;
    }

    // Setup step completion detection
    this.setupStepDetection(step, stepIndex);
  }

  /**
   * Setup detection for step completion
   */
  setupStepDetection(step, stepIndex) {
    // Clear previous listeners
    const prevListeners = document.querySelectorAll('[data-tutorial-listener]');
    prevListeners.forEach((el) => {
      el.removeAttribute('data-tutorial-listener');
    });

    const target = document.querySelector(step.target);
    if (!target) return;

    // Different detection based on validation type
    switch (step.validation) {
      case 'button_clicked':
        this.detectButtonClick(target, step, stepIndex);
        break;

      case 'input_not_empty':
      case 'number_entered':
        this.detectInputChange(target, step, stepIndex);
        break;

      case 'option_selected':
      case 'driver_selected':
      case 'vehicle_selected':
        this.detectSelectChange(target, step, stepIndex);
        break;

      case 'date_selected':
      case 'time_selected':
        this.detectDateTimeChange(target, step, stepIndex);
        break;

      case 'phone_valid':
        this.detectPhoneInput(target, step, stepIndex);
        break;

      case 'form_opened':
      case 'modal_opened':
        this.detectModalOpen(target, step, stepIndex);
        break;

      default:
        this.detectGenericCompletion(target, step, stepIndex);
    }
  }

  /**
   * Detect button click
   */
  detectButtonClick(target, step, stepIndex) {
    const handler = (e) => {
      e.preventDefault();
      this.completeStep(step, stepIndex);
      target.removeEventListener('click', handler);
    };

    target.addEventListener('click', handler);
    target.setAttribute('data-tutorial-listener', 'true');
  }

  /**
   * Detect input change
   */
  detectInputChange(target, step, stepIndex) {
    const handler = () => {
      const value = target.value.trim();

      if (step.validation === 'input_not_empty' && value.length > 0) {
        this.completeStep(step, stepIndex);
      } else if (step.validation === 'number_entered' && /^\d+(\.\d+)?$/.test(value)) {
        this.completeStep(step, stepIndex);
      }

      // Check for validation errors
      if (target.validity && !target.validity.valid) {
        highlightSystem.showError(step.errorMessage, step.hint);
      }
    };

    target.addEventListener('input', handler);
    target.addEventListener('change', handler);
    target.setAttribute('data-tutorial-listener', 'true');
  }

  /**
   * Detect select change
   */
  detectSelectChange(target, step, stepIndex) {
    const handler = () => {
      const value = target.value;
      if (value && value.trim()) {
        this.completeStep(step, stepIndex);
      } else {
        highlightSystem.showError(step.errorMessage, step.hint);
      }
    };

    target.addEventListener('change', handler);
    target.setAttribute('data-tutorial-listener', 'true');
  }

  /**
   * Detect phone input validation
   */
  detectPhoneInput(target, step, stepIndex) {
    const handler = () => {
      const value = target.value.replace(/\D/g, '');
      if (value.length === 10) {
        this.completeStep(step, stepIndex);
      } else {
        highlightSystem.showError('Phone must be 10 digits', step.hint);
      }
    };

    target.addEventListener('input', handler);
    target.addEventListener('change', handler);
    target.setAttribute('data-tutorial-listener', 'true');
  }

  /**
   * Detect date/time input
   */
  detectDateTimeChange(target, step, stepIndex) {
    const handler = () => {
      const value = target.value;
      if (value) {
        this.completeStep(step, stepIndex);
      }
    };

    target.addEventListener('change', handler);
    target.setAttribute('data-tutorial-listener', 'true');
  }

  /**
   * Detect modal open
   */
  detectModalOpen(target, step, stepIndex) {
    const checkInterval = setInterval(() => {
      const modal = document.querySelector('.modal-overlay:not(.hidden), [role="dialog"]:not(.hidden)');
      if (modal) {
        this.completeStep(step, stepIndex);
        clearInterval(checkInterval);
      }
    }, 500);

    // Timeout after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  /**
   * Detect generic completion
   */
  detectGenericCompletion(target, step, stepIndex) {
    if (!target) return;

    const observer = new MutationObserver(() => {
      if (target.offsetHeight > 0 && window.getComputedStyle(target).display !== 'none') {
        this.completeStep(step, stepIndex);
      }
    });

    observer.observe(target, { attributes: true, subtree: true });
  }

  /**
   * Complete current step
   */
  completeStep(step, stepIndex) {
    console.log(`[Tutorial] Completed: ${step.title}`);

    this.completedSteps.push(step.id);
    highlightSystem.dismiss();

    // Show completion feedback
    this.showStepComplete(step);

    // Delay before next step
    setTimeout(() => {
      const nextIndex = stepIndex + 1;

      if (nextIndex >= this.activeWorkflow.steps.length) {
        this.completeWorkflow();
      } else {
        this.goToStep(nextIndex);
      }
    }, 1500);
  }

  /**
   * Show step completion feedback
   */
  showStepComplete(step) {
    const feedback = document.createElement('div');
    feedback.className = 'tutorial-step-complete';
    feedback.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>Great! ${step.title}</p>
    `;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.add('show');
    }, 10);

    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }

  /**
   * Complete entire workflow
   */
  completeWorkflow() {
    console.log(`[Tutorial] Completed workflow: ${this.activeWorkflow.name}`);

    this.isRunning = false;

    // Show completion modal
    const modal = document.createElement('div');
    modal.className = 'tutorial-completion-modal';
    modal.innerHTML = `
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <h2>Workflow Completed!</h2>
        <p>${this.activeWorkflow.completionMessage}</p>
        
        <div class="completion-stats">
          <div class="stat">
            <strong>${this.completedSteps.length}</strong>
            <span>Steps Completed</span>
          </div>
          <div class="stat">
            <strong>100%</strong>
            <span>Progress</span>
          </div>
        </div>

        <div class="completion-actions">
          <button class="btn-primary" onclick="this.closest('.tutorial-completion-modal').remove(); aiTutorial.cancelWorkflow();">
            <i class="fas fa-home"></i> Back to Dashboard
          </button>
          <button class="btn-secondary" onclick="this.closest('.tutorial-completion-modal').remove(); aiTutorial.repeatWorkflow();">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  /**
   * Show error during workflow
   */
  showError(step, errorMsg) {
    highlightSystem.showError(errorMsg, step.hint);
  }

  /**
   * Cancel current workflow
   */
  cancelWorkflow() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.activeWorkflow = null;
    this.currentStepIndex = 0;
    this.completedSteps = [];

    highlightSystem.dismiss();

    // Remove all tutorial indicators
    document.querySelectorAll('[id^="tutorial-"]').forEach((el) => {
      if (el.id !== 'tutorial-overlay' && el.id !== 'highlight-box' && el.id !== 'highlight-arrow' && el.id !== 'highlight-tooltip') {
        el.remove();
      }
    });

    console.log('[Tutorial] Workflow cancelled');
  }

  /**
   * Repeat current workflow
   */
  repeatWorkflow() {
    if (!this.activeWorkflow) return;
    const workflowId = this.activeWorkflow.id;
    this.cancelWorkflow();
    setTimeout(() => this.startWorkflow(workflowId), 300);
  }

  /**
   * Setup completion detection by watching DOM
   */
  setupCompletionDetection() {
    document.addEventListener('submit', (e) => {
      if (this.isRunning && this.activeWorkflow) {
        const step = this.activeWorkflow.steps[this.currentStepIndex];
        if (step && step.validation === 'form_submitted') {
          this.completeStep(step, this.currentStepIndex);
        }
      }
    });
  }
}

// Initialize global tutorial controller
const aiTutorial = new AITutorialController();
