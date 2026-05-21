/**
 * FreshFold Interactive Highlight System
 * Game-like tutorial overlay with glowing highlights, arrows, and tooltips
 */

class HighlightSystem {
  constructor() {
    this.overlay = null;
    this.highlightBox = null;
    this.arrow = null;
    this.tooltip = null;
    this.isActive = false;
    this.currentTarget = null;
    this.padding = 12;
    this.init();
  }

  /**
   * Initialize highlight system UI
   */
  init() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay hidden';
    this.overlay.id = 'tutorial-overlay';
    document.body.appendChild(this.overlay);

    // Create highlight box
    this.highlightBox = document.createElement('div');
    this.highlightBox.className = 'highlight-box hidden';
    this.highlightBox.id = 'highlight-box';
    document.body.appendChild(this.highlightBox);

    // Create arrow pointer
    this.arrow = document.createElement('div');
    this.arrow.className = 'highlight-arrow hidden';
    this.arrow.id = 'highlight-arrow';
    document.body.appendChild(this.arrow);

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'highlight-tooltip hidden';
    this.tooltip.id = 'highlight-tooltip';
    document.body.appendChild(this.tooltip);

    // Close overlay on overlay click
    this.overlay.addEventListener('click', () => this.dismiss());

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.isActive && this.currentTarget) {
        this.updatePosition();
      }
    });
  }

  /**
   * Highlight an element
   */
  highlight(selector, instruction, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`[Highlight] Element not found: ${selector}`);
      return false;
    }

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait a bit for scroll to complete
    setTimeout(() => {
      this.currentTarget = element;
      this.isActive = true;

      // Show overlay
      this.overlay.classList.remove('hidden');
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay.style.opacity = '1';
      }, 10);

      // Position and show highlight box
      this.updatePosition();
      this.highlightBox.classList.remove('hidden');

      // Set up tooltip
      this.setupTooltip(instruction, options);

      // Add pulsing effect to target
      element.classList.add('tutorial-target-pulse');

      // Optional: Auto-focus input
      if (options.autoFocus && element.tagName.match(/INPUT|TEXTAREA/i)) {
        element.focus();
      }
    }, 300);

    return true;
  }

  /**
   * Update highlight box position
   */
  updatePosition() {
    if (!this.currentTarget) return;

    const rect = this.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Update highlight box
    this.highlightBox.style.top = (rect.top + scrollTop - this.padding) + 'px';
    this.highlightBox.style.left = (rect.left + scrollLeft - this.padding) + 'px';
    this.highlightBox.style.width = (rect.width + this.padding * 2) + 'px';
    this.highlightBox.style.height = (rect.height + this.padding * 2) + 'px';
    this.highlightBox.style.borderRadius = window.getComputedStyle(this.currentTarget).borderRadius;

    // Position arrow
    this.updateArrow(rect, scrollTop, scrollLeft);

    // Position tooltip
    this.updateTooltipPosition(rect, scrollTop, scrollLeft);
  }

  /**
   * Update arrow pointer position
   */
  updateArrow(rect, scrollTop, scrollLeft) {
    this.arrow.classList.remove('hidden');

    const arrowSize = 30;
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let position = 'top';
    let arrowX, arrowY;

    // Decide arrow position based on available space
    if (targetCenterY < viewportHeight / 3) {
      position = 'bottom';
      arrowX = targetCenterX - arrowSize / 2;
      arrowY = rect.bottom + scrollTop + 10;
    } else if (targetCenterY > (viewportHeight * 2) / 3) {
      position = 'top';
      arrowX = targetCenterX - arrowSize / 2;
      arrowY = rect.top + scrollTop - arrowSize - 10;
    } else if (targetCenterX < viewportWidth / 3) {
      position = 'right';
      arrowX = rect.right + scrollLeft + 10;
      arrowY = targetCenterY - arrowSize / 2;
    } else {
      position = 'left';
      arrowX = rect.left + scrollLeft - arrowSize - 10;
      arrowY = targetCenterY - arrowSize / 2;
    }

    this.arrow.style.top = arrowY + 'px';
    this.arrow.style.left = arrowX + 'px';
    this.arrow.setAttribute('data-position', position);
  }

  /**
   * Setup tooltip with instruction
   */
  setupTooltip(instruction, options = {}) {
    const errorClass = options.isError ? ' error' : '';
    const stepText = options.stepNumber ? `<strong>Step ${options.stepNumber}</strong><br>` : '';

    this.tooltip.innerHTML = `
      <div class="tooltip-content${errorClass}">
        ${options.icon ? `<div class="tooltip-icon">${options.icon}</div>` : ''}
        <div class="tooltip-text">
          ${stepText}
          ${instruction}
        </div>
        ${options.hint ? `<div class="tooltip-hint">💡 ${options.hint}</div>` : ''}
      </div>
      <div class="tooltip-actions">
        ${options.showSkip ? `<button class="tooltip-btn tooltip-skip" onclick="highlightSystem.dismiss()">Skip</button>` : ''}
        ${options.showNext ? `<button class="tooltip-btn tooltip-next" onclick="highlightSystem.nextStep()">Next</button>` : ''}
      </div>
    `;

    this.tooltip.classList.remove('hidden');
  }

  /**
   * Update tooltip position
   */
  updateTooltipPosition(rect, scrollTop, scrollLeft) {
    const tooltipWidth = 300;
    const tooltipHeight = 120;
    const margin = 20;

    let tooltipX, tooltipY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Position tooltip to the right of target
    tooltipX = rect.right + scrollLeft + 15;

    // If would go off-screen to the right, place to the left
    if (tooltipX + tooltipWidth > viewportWidth + scrollLeft - margin) {
      tooltipX = rect.left + scrollLeft - tooltipWidth - 15;
    }

    // Position tooltip below or above based on space
    tooltipY = rect.top + scrollTop - tooltipHeight - 10;
    if (rect.top < tooltipHeight + margin) {
      tooltipY = rect.bottom + scrollTop + 10;
    }

    this.tooltip.style.top = tooltipY + 'px';
    this.tooltip.style.left = tooltipX + 'px';
  }

  /**
   * Show step progress
   */
  showProgress(current, total) {
    const progressBar = document.querySelector('#tutorial-progress-bar') || this.createProgressBar();
    const percentage = (current / total) * 100;
    progressBar.querySelector('.progress-fill').style.width = percentage + '%';
    progressBar.querySelector('.progress-text').textContent = `Step ${current} of ${total}`;
  }

  /**
   * Create progress bar if not exists
   */
  createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'tutorial-progress-bar';
    bar.className = 'tutorial-progress-bar';
    bar.innerHTML = `
      <div class="progress-fill"></div>
      <span class="progress-text">Step 1 of X</span>
    `;
    document.body.appendChild(bar);
    return bar;
  }

  /**
   * Show error state
   */
  showError(message, hint) {
    const currentTooltip = this.tooltip.querySelector('.tooltip-content');
    if (currentTooltip) {
      currentTooltip.classList.add('error');
    }

    this.setupTooltip(message, {
      isError: true,
      hint: hint || 'Make sure to fill in all required fields'
    });
  }

  /**
   * Dismiss highlight
   */
  dismiss() {
    if (!this.isActive) return;

    this.overlay.style.opacity = '0';
    this.highlightBox.style.opacity = '0';
    this.tooltip.style.opacity = '0';
    this.arrow.style.opacity = '0';

    setTimeout(() => {
      this.overlay.classList.add('hidden');
      this.highlightBox.classList.add('hidden');
      this.tooltip.classList.add('hidden');
      this.arrow.classList.add('hidden');

      if (this.currentTarget) {
        this.currentTarget.classList.remove('tutorial-target-pulse');
      }

      this.isActive = false;
      this.currentTarget = null;
    }, 300);
  }

  /**
   * Next step callback
   */
  nextStep() {
    // Will be overridden by tutorial controller
  }

  /**
   * Show multi-step hints (like breadcrumb)
   */
  showStepIndicator(currentStep, steps) {
    let indicator = document.querySelector('#tutorial-step-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'tutorial-step-indicator';
      indicator.className = 'tutorial-step-indicator';
      document.body.appendChild(indicator);
    }

    const stepsHtml = steps
      .map(
        (step, idx) =>
          `<div class="step-dot ${idx === currentStep ? 'active' : ''}" title="${step.title}">
        ${idx < currentStep ? '✓' : idx === currentStep ? '●' : idx + 1}
      </div>`
      )
      .join('');

    indicator.innerHTML = stepsHtml;
  }
}

// Initialize global highlight system
const highlightSystem = new HighlightSystem();
