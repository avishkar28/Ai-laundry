/**
 * FreshFold AI System Initialization
 * Bootstraps all AI tutorial and chat components
 */

class AISystemBootstrap {
  constructor() {
    this.ready = false;
  }

  /**
   * Initialize all AI systems
   */
  init() {
    console.log('[AI System] Initializing...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bootstrap());
    } else {
      this.bootstrap();
    }
  }

  /**
   * Bootstrap process
   */
  bootstrap() {
    console.log('[AI System] Bootstrap started');

    // Initialize components in order
    this.initializeCoreUI();
    this.initializeFloatingButton();
    this.setupEventDelegation();
    this.setupTelemetry();

    this.ready = true;
    console.log('[AI System] Bootstrap complete - Ready!');

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('aiSystemReady'));
  }

  /**
   * Initialize core UI components
   */
  initializeCoreUI() {
    // All UI systems are already initialized in their constructors
    // This just logs them
    console.log('[AI System] Highlight system ready:', !!highlightSystem);
    console.log('[AI System] Tutorial controller ready:', !!aiTutorial);
    console.log('[AI System] Context detector ready:', !!contextDetector);
    console.log('[AI System] AI Chat ready:', !!aiChat);
  }

  /**
   * Initialize floating AI button
   */
  initializeFloatingButton() {
    // Check if button already exists
    if (document.querySelector('.floating-ai-button')) return;

    const button = document.createElement('button');
    button.className = 'floating-ai-button';
    button.title = 'AI Assistant - Click for help';
    button.innerHTML = '<i class="fas fa-brain"></i>';
    button.addEventListener('click', () => this.openAIMenu());

    document.body.appendChild(button);
    console.log('[AI System] Floating button created');
  }

  /**
   * Open AI assistant menu
   */
  openAIMenu() {
    if (aiChat.isOpen) {
      aiChat.close();
    } else {
      aiChat.open();
    }
  }

  /**
   * Setup event delegation for workflow triggers
   */
  setupEventDelegation() {
    document.addEventListener('click', (e) => {
      // Tutorial trigger buttons
      if (e.target.closest('[data-tutorial-workflow]')) {
        const workflowId = e.target.closest('[data-tutorial-workflow]').getAttribute('data-tutorial-workflow');
        aiTutorial.startWorkflow(workflowId);
      }

      // AI Help buttons
      if (e.target.closest('[data-ai-help]')) {
        aiChat.open();
      }
    });
  }

  /**
   * Setup telemetry tracking
   */
  setupTelemetry() {
    // Track workflow starts
    window.addEventListener('aiWorkflowStart', (e) => {
      const { workflowId, timestamp } = e.detail;
      console.log(`[Telemetry] Workflow started: ${workflowId} at ${timestamp}`);

      // Send to analytics if available
      if (window.gtag) {
        gtag('event', 'workflow_start', {
          workflow_id: workflowId,
          timestamp: timestamp
        });
      }
    });

    // Track workflow completions
    window.addEventListener('aiWorkflowComplete', (e) => {
      const { workflowId, timestamp, duration } = e.detail;
      console.log(`[Telemetry] Workflow completed: ${workflowId} in ${duration}ms`);

      if (window.gtag) {
        gtag('event', 'workflow_complete', {
          workflow_id: workflowId,
          duration_ms: duration,
          timestamp: timestamp
        });
      }
    });
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      ready: this.ready,
      highlight: !!highlightSystem,
      tutorial: !!aiTutorial,
      context: !!contextDetector,
      chat: !!aiChat,
      workflows: Object.keys(WORKFLOWS).length
    };
  }

  /**
   * Get recommended workflows for current page
   */
  getRecommendations() {
    return contextDetector.getRecommendedWorkflows();
  }

  /**
   * Start a workflow programmatically
   */
  startWorkflow(workflowId) {
    return aiTutorial.startWorkflow(workflowId);
  }

  /**
   * Open AI chat
   */
  openChat() {
    aiChat.open();
  }

  /**
   * Close AI chat
   */
  closeChat() {
    aiChat.close();
  }
}

// Initialize on script load
const aiSystem = new AISystemBootstrap();
aiSystem.init();

// Expose globally for debugging
window.AISystem = {
  start: (workflowId) => aiSystem.startWorkflow(workflowId),
  chat: () => aiSystem.openChat(),
  status: () => aiSystem.getStatus(),
  recommendations: () => aiSystem.getRecommendations(),
  context: () => contextDetector.getContextSnapshot(),
  workflows: () => getAllWorkflows()
};

console.log('[AI System] Global API available as window.AISystem');
