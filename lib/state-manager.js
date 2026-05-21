/**
 * State Manager
 * Global application state synchronized with backend
 */

class StateManager {
  constructor(apiClient, orderManager, workflowEngine) {
    this.apiClient = apiClient;
    this.orderManager = orderManager;
    this.workflowEngine = workflowEngine;

    // Global app state
    this.state = {
      // Current user/session
      currentUser: null,
      isAuthenticated: false,

      // Current order in focus
      currentOrderId: null,
      currentOrder: null,

      // Data collections
      orders: {},
      customers: {},
      staff: {},
      workflowHistory: {},

      // UI state
      currentPage: 'dashboard',
      modalOpen: null,
      sidebarOpen: true,
      loading: false,
      error: null,
      success: null,

      // Filters
      filters: {
        orderStatus: null,
        dateRange: null,
        sortBy: 'createdAt'
      },

      // Cache metadata
      lastSyncTime: null,
      syncInterval: 30000 // 30 seconds
    };

    // Event listeners for state changes
    this.listeners = {};

    // Start auto-sync if in production
    if (process.env.NODE_ENV !== 'development') {
      this.startAutoSync();
    }
  }

  /**
   * Subscribe to state changes
   * @param {String} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {String} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit state change event
   * @param {String} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  /**
   * Set global state
   * @param {String} path - State path (e.g., 'currentOrderId')
   * @param {Any} value - New value
   */
  setState(path, value) {
    const keys = path.split('.');
    let current = this.state;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Emit change event
    this.emit('stateChange', { path, oldValue, newValue: value });
  }

  /**
   * Get state value
   * @param {String} path - State path
   * @returns {Any} State value
   */
  getState(path) {
    if (!path) return this.state;

    const keys = path.split('.');
    let current = this.state;

    for (const key of keys) {
      if (current[key] === undefined) return undefined;
      current = current[key];
    }

    return current;
  }

  /**
   * Initialize app state from backend
   */
  async initialize() {
    try {
      this.setState('loading', true);

      // Check API health
      const health = await this.apiClient.checkHealth();
      if (health.status !== 'ok') {
        throw new Error('Backend API is not available');
      }

      // Load initial data
      await this.syncOrders();
      await this.syncStaff();

      this.setState('lastSyncTime', new Date());
      this.setState('loading', false);
      this.emit('initialized', true);

      return true;
    } catch (error) {
      console.error('State initialization failed:', error);
      this.setState('error', error.message);
      this.setState('loading', false);
      return false;
    }
  }

  /**
   * Sync orders from backend
   */
  async syncOrders() {
    try {
      const orders = await this.orderManager.getAllOrders();
      this.state.orders = {};

      orders.forEach(order => {
        this.state.orders[order.id] = order;
      });

      this.emit('ordersSynced', { count: orders.length });
    } catch (error) {
      console.error('Order sync failed:', error);
      this.setState('error', `Failed to sync orders: ${error.message}`);
    }
  }

  /**
   * Sync staff from backend
   */
  async syncStaff() {
    try {
      const result = await this.apiClient.getStaff();
      if (result.success) {
        this.state.staff = {};

        result.staff.forEach(member => {
          this.state.staff[member.id] = member;
        });

        this.emit('staffSynced', { count: result.staff.length });
      }
    } catch (error) {
      console.error('Staff sync failed:', error);
      this.setState('error', `Failed to sync staff: ${error.message}`);
    }
  }

  /**
   * Set current order in focus
   * @param {String} orderId - Order ID
   */
  async setCurrentOrder(orderId) {
    try {
      const order = await this.orderManager.getOrder(orderId);
      this.setState('currentOrderId', orderId);
      this.setState('currentOrder', order);
      this.emit('orderSelected', order);
    } catch (error) {
      console.error('Error setting current order:', error);
      this.setState('error', error.message);
    }
  }

  /**
   * Set current page
   * @param {String} pageName - Page name
   */
  setCurrentPage(pageName) {
    this.setState('currentPage', pageName);
    this.emit('pageChanged', { page: pageName });
  }

  /**
   * Open modal
   * @param {String} modalName - Modal name
   */
  openModal(modalName) {
    this.setState('modalOpen', modalName);
    this.emit('modalOpened', { modal: modalName });
  }

  /**
   * Close modal
   */
  closeModal() {
    this.setState('modalOpen', null);
    this.emit('modalClosed', {});
  }

  /**
   * Set loading state
   * @param {Boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.setState('loading', isLoading);
  }

  /**
   * Set error message
   * @param {String} message - Error message
   */
  setError(message) {
    this.setState('error', message);
    this.emit('error', { message });
  }

  /**
   * Clear error
   */
  clearError() {
    this.setState('error', null);
  }

  /**
   * Set success message
   * @param {String} message - Success message
   */
  setSuccess(message) {
    this.setState('success', message);
    this.emit('success', { message });
    // Auto-clear after 3 seconds
    setTimeout(() => this.setState('success', null), 3000);
  }

  /**
   * Apply filter
   * @param {String} filterName - Filter name
   * @param {Any} value - Filter value
   */
  applyFilter(filterName, value) {
    this.setState(`filters.${filterName}`, value);
    this.emit('filterChanged', { filter: filterName, value });
  }

  /**
   * Clear filters
   */
  clearFilters() {
    this.setState('filters', {
      orderStatus: null,
      dateRange: null,
      sortBy: 'createdAt'
    });
    this.emit('filtersCleared', {});
  }

  /**
   * Get filtered orders
   * @returns {Array} Filtered orders
   */
  getFilteredOrders() {
    let orders = Object.values(this.state.orders);

    if (this.state.filters.orderStatus) {
      orders = orders.filter(o => o.status === this.state.filters.orderStatus);
    }

    // Sort
    switch (this.state.filters.sortBy) {
      case 'createdAt':
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'status':
        orders.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'price':
        orders.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
    }

    return orders;
  }

  /**
   * Start automatic sync with backend
   */
  startAutoSync() {
    this.autoSyncInterval = setInterval(async () => {
      try {
        await this.syncOrders();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, this.state.syncInterval);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }

  /**
   * Get app statistics
   * @returns {Object} Stats
   */
  getStats() {
    const orders = Object.values(this.state.orders);
    const pending = orders.filter(o => o.status.includes('Pending')).length;
    const inProgress = orders.filter(o => !o.status.includes('Delivered') && !o.status.includes('Completed')).length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      totalOrders: orders.length,
      pending,
      inProgress,
      completed,
      totalRevenue
    };
  }

  /**
   * Reset state to initial
   */
  reset() {
    this.stopAutoSync();
    this.state = {
      currentUser: null,
      isAuthenticated: false,
      currentOrderId: null,
      currentOrder: null,
      orders: {},
      customers: {},
      staff: {},
      workflowHistory: {},
      currentPage: 'dashboard',
      modalOpen: null,
      sidebarOpen: true,
      loading: false,
      error: null,
      success: null,
      filters: {
        orderStatus: null,
        dateRange: null,
        sortBy: 'createdAt'
      },
      lastSyncTime: null,
      syncInterval: 30000
    };
    this.emit('reset', {});
  }
}

// Export as singleton
const stateManager = new StateManager(apiClient, orderManager, workflowEngine);
