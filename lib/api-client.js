/**
 * FreshFold API Client
 * Handles all HTTP communication with the backend API
 */

class APIClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.timeout = 10000; // 10 seconds
  }

  // Helper method for fetch with timeout
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // ─── ORDERS ENDPOINTS ────────────────────────────────────────────────

  /**
   * Create a new order
   * @param {Object} customerData - Customer information
   * @param {Array} items - Order items
   * @param {String} serviceType - Service type
   * @param {Object} dates - Pickup and delivery dates
   * @param {String} specialInstructions - Special handling instructions
   */
  async createOrder(customerData, items, serviceType, dates, specialInstructions = '') {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/orders`, {
        method: 'POST',
        body: JSON.stringify({
          customerData,
          items,
          serviceType,
          dates,
          specialInstructions
        })
      });
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get all orders with optional filters
   * @param {Object} filters - Filter options (status, customerId, limit, offset)
   */
  async getOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.customerId) queryParams.append('customerId', filters.customerId);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseUrl}/api/orders${queryParams.toString() ? '?' + queryParams : ''}`;
      return await this.fetchWithTimeout(url);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get order details by ID
   * @param {String} orderId - Order UUID
   */
  async getOrderDetails(orderId) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/orders/${orderId}`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Update order status
   * @param {String} orderId - Order UUID
   * @param {String} newStatus - New status
   * @param {String} staffId - Optional staff ID
   * @param {String} notes - Optional notes
   */
  async updateOrderStatus(orderId, newStatus, staffId = null, notes = '') {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({
            newStatus,
            staffId,
            notes
          })
        }
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get workflow timeline for order
   * @param {String} orderId - Order UUID
   */
  async getWorkflowTimeline(orderId) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/orders/${orderId}/timeline`);
    } catch (error) {
      console.error('Error fetching workflow timeline:', error);
      throw error;
    }
  }

  // ─── STAFF ENDPOINTS ────────────────────────────────────────────────

  /**
   * Get all staff with optional filters
   * @param {Object} filters - Filter options (role, status)
   */
  async getStaff(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.status) queryParams.append('status', filters.status);

      const url = `${this.baseUrl}/api/staff${queryParams.toString() ? '?' + queryParams : ''}`;
      return await this.fetchWithTimeout(url);
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  /**
   * Get staff by role
   * @param {String} role - Staff role
   */
  async getStaffByRole(role) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/staff/role/${role}`);
    } catch (error) {
      console.error('Error fetching staff by role:', error);
      throw error;
    }
  }

  /**
   * Get staff workload
   * @param {String} staffId - Staff UUID
   */
  async getStaffWorkload(staffId) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/staff/${staffId}`);
    } catch (error) {
      console.error('Error fetching staff workload:', error);
      throw error;
    }
  }

  // ─── STAFF ASSIGNMENT ENDPOINTS ────────────────────────────────────

  /**
   * Assign staff to order task
   * @param {String} orderId - Order UUID
   * @param {String} staffId - Staff UUID
   * @param {String} taskType - Task type
   * @param {String} notes - Optional notes
   */
  async assignStaffToTask(orderId, staffId, taskType, notes = '') {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/orders/${orderId}/assign`,
        {
          method: 'POST',
          body: JSON.stringify({
            staffId,
            taskType,
            notes
          })
        }
      );
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }
  }

  // ─── CUSTOMER ENDPOINTS ────────────────────────────────────────────

  /**
   * Search customer by phone
   * @param {String} phone - Customer phone number
   */
  async searchCustomer(phone) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/customers/${phone}`);
    } catch (error) {
      // Return null if customer not found (404)
      if (error.message.includes('404')) {
        return null;
      }
      console.error('Error searching customer:', error);
      throw error;
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer information
   */
  async createCustomer(customerData) {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/customers`,
        {
          method: 'POST',
          body: JSON.stringify(customerData)
        }
      );
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // ─── WORKFLOW ENDPOINTS ────────────────────────────────────────────

  /**
   * Get current workflow state
   * @param {String} orderId - Order UUID
   */
  async getWorkflowState(orderId) {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/api/workflows/${orderId}`);
    } catch (error) {
      console.error('Error fetching workflow state:', error);
      throw error;
    }
  }

  /**
   * Execute workflow step
   * @param {Object} workflowData - Workflow execution data
   */
  async executeWorkflow(workflowData) {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/workflows/execute`,
        {
          method: 'POST',
          body: JSON.stringify(workflowData)
        }
      );
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  // ─── AI ENDPOINTS ──────────────────────────────────────────────────

  /**
   * Detect workflow context
   * @param {Object} context - Current context (orderId, currentPage)
   */
  async detectWorkflow(context) {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/ai/detect-workflow`,
        {
          method: 'POST',
          body: JSON.stringify(context)
        }
      );
    } catch (error) {
      console.error('Error detecting workflow:', error);
      throw error;
    }
  }

  /**
   * Get AI hints for next steps
   * @param {Object} context - Current context (orderId, currentStep)
   */
  async getHints(context) {
    try {
      return await this.fetchWithTimeout(
        `${this.baseUrl}/api/ai/get-hints`,
        {
          method: 'POST',
          body: JSON.stringify(context)
        }
      );
    } catch (error) {
      console.error('Error getting hints:', error);
      throw error;
    }
  }

  // ─── HEALTH CHECK ──────────────────────────────────────────────────

  async checkHealth() {
    try {
      return await this.fetchWithTimeout(`${this.baseUrl}/health`);
    } catch (error) {
      console.error('API health check failed:', error);
      return { status: 'down' };
    }
  }
}

// Export as singleton
const apiClient = new APIClient();
