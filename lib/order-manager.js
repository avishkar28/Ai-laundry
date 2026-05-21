/**
 * Order Manager
 * Handles order creation, retrieval, and business logic
 */

class OrderManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.orders = {}; // Local cache of orders
  }

  /**
   * Service types and pricing
   */
  SERVICE_TYPES = {
    'Wash & Fold': { basePrice: 50, perKg: 0 },
    'Dry Cleaning': { basePrice: 150, perKg: 0 },
    'Iron & Press': { basePrice: 30, perKg: 0 },
    'Stain Removal': { basePrice: 100, perKg: 0 },
    'Shoe Cleaning': { basePrice: 80, perKg: 0 }
  };

  /**
   * Item types available
   */
  ITEM_TYPES = [
    'Shirt', 'T-Shirt', 'Pants', 'Jeans', 'Skirt', 'Dress',
    'Blazer', 'Jacket', 'Sweater', 'Suit', 'Shorts',
    'Bedsheet', 'Comforter', 'Blanket', 'Pillow Cover',
    'Towel', 'Handkerchief', 'Socks', 'Undergarments',
    'Shoes', 'Leather Jacket', 'Formal Wear', 'Sports Wear'
  ];

  /**
   * Calculate price for items
   * @param {Array} items - Order items
   * @param {String} serviceType - Service type
   * @returns {Number} Total price
   */
  calculatePrice(items, serviceType) {
    const serviceConfig = this.SERVICE_TYPES[serviceType];
    if (!serviceConfig) throw new Error('Invalid service type');

    let totalPrice = serviceConfig.basePrice;

    items.forEach(item => {
      let itemPrice = item.quantity * (serviceConfig.perKg || 0);
      if (item.weightKg) {
        itemPrice = item.weightKg * (serviceConfig.perKg || 50); // Default 50/kg if not specified
      }
      totalPrice += itemPrice;
    });

    return totalPrice;
  }

  /**
   * Create a new order
   * @param {Object} customerData - Customer info
   * @param {Array} items - Order items
   * @param {String} serviceType - Service type
   * @param {Object} dates - Pickup and delivery dates
   * @param {String} specialInstructions - Special instructions
   * @returns {Object} Created order
   */
  async createOrder(customerData, items, serviceType, dates, specialInstructions = '') {
    try {
      // Validate inputs
      if (!customerData || !customerData.name || !customerData.phone) {
        throw new Error('Customer name and phone are required');
      }

      if (!items || items.length === 0) {
        throw new Error('At least one item is required');
      }

      if (!serviceType) {
        throw new Error('Service type is required');
      }

      if (!dates || !dates.pickupDate || !dates.deliveryDate) {
        throw new Error('Pickup and delivery dates are required');
      }

      // Validate dates
      const pickup = new Date(dates.pickupDate);
      const delivery = new Date(dates.deliveryDate);
      if (delivery <= pickup) {
        throw new Error('Delivery date must be after pickup date');
      }

      // Calculate total price
      const totalPrice = this.calculatePrice(items, serviceType);

      // Add price to each item
      const itemsWithPrice = items.map(item => ({
        ...item,
        price: this.calculatePrice([item], serviceType)
      }));

      // Create order via API
      const result = await this.apiClient.createOrder(
        customerData,
        itemsWithPrice,
        serviceType,
        dates,
        specialInstructions
      );

      if (result.success) {
        this.orders[result.order.id] = result.order;
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {String} orderId - Order ID
   * @returns {Object} Order details
   */
  async getOrder(orderId) {
    try {
      // Check local cache first
      if (this.orders[orderId]) {
        return this.orders[orderId];
      }

      const result = await this.apiClient.getOrderDetails(orderId);
      if (result.success) {
        this.orders[result.order.id] = result.order;
        return result.order;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Get all orders with optional filters
   * @param {Object} filters - Filter options
   * @returns {Array} Orders list
   */
  async getAllOrders(filters = {}) {
    try {
      const result = await this.apiClient.getOrders(filters);
      if (result.success) {
        // Update local cache
        result.orders.forEach(order => {
          this.orders[order.id] = order;
        });
        return result.orders;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Search orders by various criteria
   * @param {String} query - Search query
   * @param {String} searchType - 'id', 'customer', 'phone', 'status'
   * @returns {Array} Matching orders
   */
  async searchOrders(query, searchType = 'id') {
    try {
      let filters = {};

      switch (searchType) {
        case 'status':
          filters.status = query;
          break;
        case 'customer':
        case 'phone':
          // Note: Backend doesn't have customer search by name yet,
          // This would require database query enhancement
          return Object.values(this.orders).filter(o =>
            o.customer?.name.toLowerCase().includes(query.toLowerCase()) ||
            o.customer?.phone.includes(query)
          );
        default:
          // Local search in cache
          return Object.values(this.orders).filter(o =>
            o.orderId.toLowerCase().includes(query.toLowerCase())
          );
      }

      return await this.getAllOrders(filters);
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  }

  /**
   * Get orders by status
   * @param {String} status - Order status
   * @returns {Array} Orders with status
   */
  async getOrdersByStatus(status) {
    try {
      return await this.getAllOrders({ status });
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  }

  /**
   * Get orders by customer
   * @param {String} customerId - Customer ID
   * @returns {Array} Orders for customer
   */
  async getOrdersByCustomer(customerId) {
    try {
      return await this.getAllOrders({ customerId });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   * @param {String} orderId - Order ID
   * @param {String} newStatus - New status
   * @param {String} staffId - Optional staff ID
   * @param {String} notes - Optional notes
   * @returns {Object} Updated order
   */
  async updateStatus(orderId, newStatus, staffId = null, notes = '') {
    try {
      const result = await this.apiClient.updateOrderStatus(
        orderId,
        newStatus,
        staffId,
        notes
      );

      if (result.success) {
        this.orders[orderId] = result.order;
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get workflow timeline for order
   * @param {String} orderId - Order ID
   * @returns {Array} Timeline events
   */
  async getTimeline(orderId) {
    try {
      const result = await this.apiClient.getWorkflowTimeline(orderId);
      if (result.success) {
        return result.timeline;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  /**
   * Assign staff to order task
   * @param {String} orderId - Order ID
   * @param {String} staffId - Staff ID
   * @param {String} taskType - Task type
   * @param {String} notes - Optional notes
   * @returns {Object} Assignment result
   */
  async assignStaff(orderId, staffId, taskType, notes = '') {
    try {
      const result = await this.apiClient.assignStaffToTask(
        orderId,
        staffId,
        taskType,
        notes
      );

      if (result.success) {
        // Refresh order to get updated assignments
        const order = await this.getOrder(orderId);
        return { success: true, order, assignment: result.assignment };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }
  }

  /**
   * Generate order summary for display
   * @param {String} orderId - Order ID
   * @returns {Object} Summary
   */
  async getOrderSummary(orderId) {
    try {
      const order = await this.getOrder(orderId);
      const timeline = await this.getTimeline(orderId);

      return {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customer?.name || 'Unknown',
        customerPhone: order.customer?.phone || 'N/A',
        status: order.status,
        totalPrice: order.totalPrice,
        itemCount: order.items?.length || 0,
        pickupDate: order.pickupDate,
        deliveryDate: order.deliveryDate,
        createdAt: order.createdAt,
        timeline,
        assignments: order.assignments || [],
        specialInstructions: order.specialInstructions || ''
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  /**
   * Clear local cache
   */
  clearCache() {
    this.orders = {};
  }

  /**
   * Get cached order count
   * @returns {Number} Count
   */
  getCacheSize() {
    return Object.keys(this.orders).length;
  }
}

// Export as singleton
const orderManager = new OrderManager(apiClient);
