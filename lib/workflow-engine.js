/**
 * Workflow Engine
 * Handles order status transitions and workflow validation
 */

class WorkflowEngine {
  constructor(apiClient) {
    this.apiClient = apiClient;
    
    // Valid status transitions (same as backend)
    this.VALID_TRANSITIONS = {
      'Created': ['Pending Pickup'],
      'Pending Pickup': ['Pickup Assigned'],
      'Pickup Assigned': ['Picked Up'],
      'Picked Up': ['Received At Laundry'],
      'Received At Laundry': ['Sorting'],
      'Sorting': ['Washing'],
      'Washing': ['Drying'],
      'Drying': ['Ironing'],
      'Ironing': ['Folding'],
      'Folding': ['Packing'],
      'Packing': ['Quality Check'],
      'Quality Check': ['Out For Delivery', 'Sorting'], // Can go back if failed
      'Out For Delivery': ['Delivered'],
      'Delivered': ['Completed']
    };

    // Status category mapping
    this.STATUS_CATEGORIES = {
      'Created': 'order_creation',
      'Pending Pickup': 'pickup',
      'Pickup Assigned': 'pickup',
      'Picked Up': 'pickup',
      'Received At Laundry': 'receiving',
      'Sorting': 'processing',
      'Washing': 'processing',
      'Drying': 'processing',
      'Ironing': 'processing',
      'Folding': 'processing',
      'Packing': 'packing',
      'Quality Check': 'quality',
      'Out For Delivery': 'delivery',
      'Delivered': 'delivery',
      'Completed': 'completed'
    };

    // Status colors for UI
    this.STATUS_COLORS = {
      'Created': '#gray',
      'Pending Pickup': '#yellow',
      'Pickup Assigned': '#orange',
      'Picked Up': '#orange',
      'Received At Laundry': '#blue',
      'Sorting': '#blue',
      'Washing': '#indigo',
      'Drying': '#indigo',
      'Ironing': '#purple',
      'Folding': '#purple',
      'Packing': '#green',
      'Quality Check': '#cyan',
      'Out For Delivery': '#teal',
      'Delivered': '#emerald',
      'Completed': '#lime'
    };

    // All statuses in order
    this.ALL_STATUSES = [
      'Created', 'Pending Pickup', 'Pickup Assigned', 'Picked Up',
      'Received At Laundry', 'Sorting', 'Washing', 'Drying', 'Ironing',
      'Folding', 'Packing', 'Quality Check', 'Out For Delivery',
      'Delivered', 'Completed'
    ];
  }

  /**
   * Get valid next statuses for current status
   * @param {String} currentStatus - Current order status
   * @returns {Array} Valid next statuses
   */
  getValidTransitions(currentStatus) {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Check if transition is valid
   * @param {String} fromStatus - Current status
   * @param {String} toStatus - Desired status
   * @returns {Boolean}
   */
  isValidTransition(fromStatus, toStatus) {
    const validNexts = this.VALID_TRANSITIONS[fromStatus];
    return validNexts && validNexts.includes(toStatus);
  }

  /**
   * Get workflow progress (0-100%)
   * @param {String} currentStatus - Current status
   * @returns {Number} Progress percentage
   */
  getProgress(currentStatus) {
    const index = this.ALL_STATUSES.indexOf(currentStatus);
    if (index === -1) return 0;
    return Math.round((index / (this.ALL_STATUSES.length - 1)) * 100);
  }

  /**
   * Get status category
   * @param {String} status - Order status
   * @returns {String} Category
   */
  getStatusCategory(status) {
    return this.STATUS_CATEGORIES[status] || 'unknown';
  }

  /**
   * Get color for status
   * @param {String} status - Order status
   * @returns {String} Color hex
   */
  getStatusColor(status) {
    return this.STATUS_COLORS[status] || '#9ca3af';
  }

  /**
   * Get status icon class (for Font Awesome)
   * @param {String} status - Order status
   * @returns {String} FA icon class
   */
  getStatusIcon(status) {
    const icons = {
      'Created': 'fas fa-clipboard-list',
      'Pending Pickup': 'fas fa-hourglass-start',
      'Pickup Assigned': 'fas fa-user-check',
      'Picked Up': 'fas fa-dolly',
      'Received At Laundry': 'fas fa-warehouse',
      'Sorting': 'fas fa-object-group',
      'Washing': 'fas fa-water',
      'Drying': 'fas fa-fan',
      'Ironing': 'fas fa-fire',
      'Folding': 'fas fa-layer-group',
      'Packing': 'fas fa-boxes',
      'Quality Check': 'fas fa-check-circle',
      'Out For Delivery': 'fas fa-truck',
      'Delivered': 'fas fa-check-double',
      'Completed': 'fas fa-trophy'
    };
    return icons[status] || 'fas fa-circle';
  }

  /**
   * Get human-readable status label
   * @param {String} status - Order status
   * @returns {String} Label
   */
  getStatusLabel(status) {
    return status.replace(/ /g, '\u00A0'); // Non-breaking spaces
  }

  /**
   * Transition order (calls backend API)
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @param {String} staffId - Optional staff ID
   * @param {String} notes - Optional notes
   * @returns {Object} Result
   */
  async transitionOrder(orderId, newStatus, staffId = null, notes = '') {
    try {
      const result = await this.apiClient.updateOrderStatus(orderId, newStatus, staffId, notes);
      return result;
    } catch (error) {
      console.error('Workflow transition failed:', error);
      throw error;
    }
  }

  /**
   * Record workflow event in history
   * @param {String} orderId - Order ID
   * @param {String} eventType - Event type
   * @param {String} statusFrom - From status
   * @param {String} statusTo - To status
   * @param {String} notes - Notes
   */
  async recordEvent(orderId, eventType, statusFrom, statusTo, notes = '') {
    // This is recorded by the backend automatically
    // This method is here for frontend logging if needed
    console.log(`[Workflow] ${eventType}: ${statusFrom} → ${statusTo}`, notes);
  }

  /**
   * Get step number in workflow
   * @param {String} status - Order status
   * @returns {Number} Step number (1-15)
   */
  getStepNumber(status) {
    return this.ALL_STATUSES.indexOf(status) + 1;
  }

  /**
   * Get total workflow steps
   * @returns {Number} Total steps
   */
  getTotalSteps() {
    return this.ALL_STATUSES.length;
  }

  /**
   * Check if status is a final status
   * @param {String} status - Order status
   * @returns {Boolean}
   */
  isFinalStatus(status) {
    return status === 'Completed';
  }

  /**
   * Check if status is terminal (no more transitions possible)
   * @param {String} status - Order status
   * @returns {Boolean}
   */
  isTerminalStatus(status) {
    const validNext = this.VALID_TRANSITIONS[status];
    return !validNext || validNext.length === 0;
  }

  /**
   * Get next expected status
   * @param {String} currentStatus - Current status
   * @returns {String|null} Next status or null
   */
  getNextExpectedStatus(currentStatus) {
    const nexts = this.VALID_TRANSITIONS[currentStatus];
    return nexts && nexts.length > 0 ? nexts[0] : null;
  }

  /**
   * Get all completed statuses up to current
   * @param {String} currentStatus - Current status
   * @returns {Array} Completed statuses
   */
  getCompletedStatuses(currentStatus) {
    const index = this.ALL_STATUSES.indexOf(currentStatus);
    if (index === -1) return [];
    return this.ALL_STATUSES.slice(0, index + 1);
  }

  /**
   * Get remaining statuses
   * @param {String} currentStatus - Current status
   * @returns {Array} Remaining statuses
   */
  getRemainingStatuses(currentStatus) {
    const index = this.ALL_STATUSES.indexOf(currentStatus);
    if (index === -1) return this.ALL_STATUSES;
    return this.ALL_STATUSES.slice(index + 1);
  }

  /**
   * Generate workflow summary
   * @param {Object} order - Order object with status and history
   * @returns {Object} Summary
   */
  generateSummary(order) {
    const currentStep = this.getStepNumber(order.status);
    const totalSteps = this.getTotalSteps();
    const progress = this.getProgress(order.status);
    
    return {
      currentStatus: order.status,
      currentStep,
      totalSteps,
      progress,
      label: this.getStatusLabel(order.status),
      icon: this.getStatusIcon(order.status),
      color: this.getStatusColor(order.status),
      category: this.getStatusCategory(order.status),
      isComplete: this.isFinalStatus(order.status),
      isTerminal: this.isTerminalStatus(order.status),
      nextStatus: this.getNextExpectedStatus(order.status),
      validTransitions: this.getValidTransitions(order.status),
      completedStatuses: this.getCompletedStatuses(order.status),
      remainingStatuses: this.getRemainingStatuses(order.status)
    };
  }
}

// Export as singleton
const workflowEngine = new WorkflowEngine(apiClient);
