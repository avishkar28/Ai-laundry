/**
 * FreshFold AI Workflow Definitions
 * Defines all workflows, steps, and validation logic
 * Architecture-ready for LangGraph integration
 */

const WORKFLOWS = {
  // ─── CREATE NEW ORDER WORKFLOW ───────────────────────────────────────
  create_order: {
    id: 'create_order',
    name: 'Create New Order',
    icon: 'fa-plus-circle',
    description: 'Complete guide to create a new laundry order',
    category: 'core',
    steps: [
      {
        id: 'open_new_order',
        title: 'Open New Order Form',
        instruction: 'Click the "New Order" button to start',
        target: '[data-action="new-order"]',
        validation: 'form_opened',
        errorMessage: 'Please click the New Order button',
        hint: 'Look for the blue button in the top right',
        estimatedTime: 5
      },
      {
        id: 'enter_customer_name',
        title: 'Enter Customer Name',
        instruction: 'Type the customer\'s name in the field',
        target: 'input[placeholder*="customer" i]',
        validation: 'input_not_empty',
        errorMessage: 'Customer name is required',
        hint: 'This can be a new customer or existing',
        estimatedTime: 10,
        autoFocus: true
      },
      {
        id: 'enter_phone',
        title: 'Enter Phone Number',
        instruction: 'Enter the customer\'s phone number',
        target: 'input[placeholder*="phone" i]',
        validation: 'phone_valid',
        errorMessage: 'Phone number must be 10 digits',
        hint: 'Format: 98765 43210',
        estimatedTime: 10
      },
      {
        id: 'select_service',
        title: 'Select Service Type',
        instruction: 'Choose a laundry service',
        target: 'select[name="service"], [data-field="service"]',
        validation: 'option_selected',
        errorMessage: 'Please select a service',
        hint: 'Options: Wash & Fold, Dry Cleaning, Iron & Press, etc.',
        estimatedTime: 10
      },
      {
        id: 'enter_quantity',
        title: 'Enter Cloth Quantity',
        instruction: 'Enter the amount (in kg or items)',
        target: 'input[placeholder*="quantity" i], input[placeholder*="kg" i], input[placeholder*="items" i]',
        validation: 'number_entered',
        errorMessage: 'Please enter a valid quantity',
        hint: 'Use kg for weight or number of items',
        estimatedTime: 10
      },
      {
        id: 'select_delivery_date',
        title: 'Choose Delivery Date',
        instruction: 'Select when you want the order delivered',
        target: 'input[type="date"], [data-field="delivery-date"]',
        validation: 'date_selected',
        errorMessage: 'Please select a delivery date',
        hint: 'Future dates only',
        estimatedTime: 10
      },
      {
        id: 'review_order',
        title: 'Review Order Details',
        instruction: 'Check all information is correct',
        target: '[data-summary="order-summary"]',
        validation: 'summary_visible',
        errorMessage: 'Review the order summary',
        hint: 'Verify customer name, service, and date',
        estimatedTime: 15
      },
      {
        id: 'click_save',
        title: 'Save Order',
        instruction: 'Click the "Save Order" button to complete',
        target: 'button[type="submit"], [data-action="save-order"]',
        validation: 'button_clicked',
        errorMessage: 'Please click Save to create the order',
        hint: 'Green button at the bottom',
        estimatedTime: 5,
        isFinality: true
      }
    ],
    completionMessage: '✨ Order created successfully! Your workflow is complete.',
    totalEstimatedTime: 75
  },

  // ─── ASSIGN PICKUP WORKFLOW ─────────────────────────────────────────
  assign_pickup: {
    id: 'assign_pickup',
    name: 'Assign Pickup',
    icon: 'fa-map-pin',
    description: 'Assign a driver for order pickup',
    category: 'operations',
    steps: [
      {
        id: 'select_pending_order',
        title: 'Select Pending Order',
        instruction: 'Click on an order with "Pending" status',
        target: '[data-status="pending"]',
        validation: 'order_selected',
        errorMessage: 'Please select a pending order',
        hint: 'Look in the Orders table',
        estimatedTime: 15
      },
      {
        id: 'open_pickup_modal',
        title: 'Open Assign Pickup',
        instruction: 'Click the "Assign Pickup" button',
        target: '[data-action="assign-pickup"]',
        validation: 'modal_opened',
        errorMessage: 'Click the Assign Pickup button',
        hint: 'Usually in the order row actions',
        estimatedTime: 5
      },
      {
        id: 'select_driver',
        title: 'Select Driver',
        instruction: 'Choose an available driver from the list',
        target: '[data-field="driver-select"], select[name="driver"]',
        validation: 'driver_selected',
        errorMessage: 'Please select a driver',
        hint: 'Shows driver ratings and current load',
        estimatedTime: 15
      },
      {
        id: 'select_vehicle',
        title: 'Select Vehicle',
        instruction: 'Choose the vehicle for pickup',
        target: '[data-field="vehicle-select"], select[name="vehicle"]',
        validation: 'vehicle_selected',
        errorMessage: 'Please select a vehicle',
        hint: 'Pick an available vehicle',
        estimatedTime: 10
      },
      {
        id: 'set_pickup_time',
        title: 'Set Pickup Time',
        instruction: 'Select the preferred pickup time',
        target: 'input[type="time"], [data-field="pickup-time"]',
        validation: 'time_selected',
        errorMessage: 'Please set a pickup time',
        hint: 'Working hours: 7 AM - 8 PM',
        estimatedTime: 10
      },
      {
        id: 'confirm_assignment',
        title: 'Confirm Assignment',
        instruction: 'Click "Confirm" to assign the pickup',
        target: '[data-action="confirm-pickup"], button:contains("Confirm")',
        validation: 'button_clicked',
        errorMessage: 'Click Confirm to complete',
        hint: 'Blue Confirm button',
        estimatedTime: 5,
        isFinality: true
      }
    ],
    completionMessage: '✅ Pickup assigned! Driver will be notified.',
    totalEstimatedTime: 60
  },

  // ─── GENERATE INVOICE WORKFLOW ──────────────────────────────────────
  generate_invoice: {
    id: 'generate_invoice',
    name: 'Generate Invoice',
    icon: 'fa-receipt',
    description: 'Create and send an invoice for an order',
    category: 'billing',
    steps: [
      {
        id: 'select_delivered_order',
        title: 'Select Delivered Order',
        instruction: 'Click on a completed order',
        target: '[data-status="delivered"]',
        validation: 'order_selected',
        errorMessage: 'Select an order with "Delivered" status',
        hint: 'Only delivered orders can be invoiced',
        estimatedTime: 15
      },
      {
        id: 'open_invoice_option',
        title: 'Open Invoice Generator',
        instruction: 'Click "Generate Invoice" from the menu',
        target: '[data-action="generate-invoice"]',
        validation: 'form_opened',
        errorMessage: 'Click Generate Invoice option',
        hint: 'In the order actions menu',
        estimatedTime: 5
      },
      {
        id: 'review_invoice_details',
        title: 'Review Invoice Details',
        instruction: 'Check customer info and amounts',
        target: '[data-section="invoice-preview"]',
        validation: 'preview_visible',
        errorMessage: 'Review the invoice preview',
        hint: 'Verify all line items and totals',
        estimatedTime: 20
      },
      {
        id: 'add_notes',
        title: 'Add Notes (Optional)',
        instruction: 'Add any additional notes if needed',
        target: 'textarea[name="invoice-notes"]',
        validation: 'optional_field',
        errorMessage: 'This is optional, you can skip',
        hint: 'Special instructions or terms',
        estimatedTime: 15
      },
      {
        id: 'send_invoice',
        title: 'Send Invoice',
        instruction: 'Click "Send to Customer" to email the invoice',
        target: '[data-action="send-invoice"]',
        validation: 'button_clicked',
        errorMessage: 'Click Send to Customer',
        hint: 'Green button - sends via email & SMS',
        estimatedTime: 5,
        isFinality: true
      }
    ],
    completionMessage: '📧 Invoice sent to customer!',
    totalEstimatedTime: 60
  },

  // ─── INVENTORY RESTOCK WORKFLOW ────────────────────────────────────
  restock_inventory: {
    id: 'restock_inventory',
    name: 'Restock Inventory',
    icon: 'fa-box-open',
    description: 'Add new inventory items to stock',
    category: 'inventory',
    steps: [
      {
        id: 'navigate_inventory',
        title: 'Go to Inventory',
        instruction: 'Click "Inventory" in the sidebar',
        target: '[data-nav="inventory"]',
        validation: 'page_loaded',
        errorMessage: 'Navigate to Inventory page',
        hint: 'Left sidebar menu',
        estimatedTime: 5
      },
      {
        id: 'select_item',
        title: 'Select Item to Restock',
        instruction: 'Click on an item that needs restocking',
        target: '[data-low-stock="true"]',
        validation: 'item_selected',
        errorMessage: 'Select an item with low stock',
        hint: 'Items in red have low stock',
        estimatedTime: 10
      },
      {
        id: 'click_restock',
        title: 'Open Restock Form',
        instruction: 'Click "Restock" button',
        target: '[data-action="restock-item"]',
        validation: 'form_opened',
        errorMessage: 'Click the Restock button',
        hint: 'In the item details panel',
        estimatedTime: 5
      },
      {
        id: 'enter_quantity',
        title: 'Enter Restock Quantity',
        instruction: 'Enter how many units to add',
        target: 'input[name="restock-qty"]',
        validation: 'number_entered',
        errorMessage: 'Enter a quantity',
        hint: 'How many to purchase',
        estimatedTime: 10,
        autoFocus: true
      },
      {
        id: 'enter_cost',
        title: 'Enter Unit Cost',
        instruction: 'Enter the cost per unit',
        target: 'input[name="unit-cost"]',
        validation: 'number_entered',
        errorMessage: 'Enter unit cost',
        hint: 'Price per unit',
        estimatedTime: 10
      },
      {
        id: 'select_supplier',
        title: 'Select Supplier',
        instruction: 'Choose or create a supplier',
        target: '[data-field="supplier"]',
        validation: 'option_selected',
        errorMessage: 'Select a supplier',
        hint: 'Your usual supplier or new one',
        estimatedTime: 10
      },
      {
        id: 'submit_restock',
        title: 'Complete Restock',
        instruction: 'Click "Add to Order" to restock',
        target: '[data-action="add-to-order"]',
        validation: 'button_clicked',
        errorMessage: 'Click Add to Order',
        hint: 'Confirms the restock',
        estimatedTime: 5,
        isFinality: true
      }
    ],
    completionMessage: '📦 Inventory updated successfully!',
    totalEstimatedTime: 55
  },

  // ─── MARK ORDER AS DELIVERED ────────────────────────────────────────
  mark_delivered: {
    id: 'mark_delivered',
    name: 'Mark as Delivered',
    icon: 'fa-check-circle',
    description: 'Complete an order and mark it delivered',
    category: 'operations',
    steps: [
      {
        id: 'find_order_in_cleaning',
        title: 'Find Order Being Cleaned',
        instruction: 'Find an order with status "In Cleaning"',
        target: '[data-status="in-cleaning"]',
        validation: 'order_selected',
        errorMessage: 'Select an order in cleaning',
        hint: 'Look in the Orders table',
        estimatedTime: 15
      },
      {
        id: 'click_mark_complete',
        title: 'Mark as Ready',
        instruction: 'Click "Mark Ready" when cleaning is done',
        target: '[data-action="mark-ready"]',
        validation: 'form_opened',
        errorMessage: 'Click Mark Ready',
        hint: 'Available for in-cleaning orders',
        estimatedTime: 5
      },
      {
        id: 'take_photo',
        title: 'Take Photo (Optional)',
        instruction: 'Upload a photo of the cleaned items',
        target: '[data-action="upload-photo"]',
        validation: 'optional_field',
        errorMessage: 'Optional - you can skip this',
        hint: 'For quality verification',
        estimatedTime: 20
      },
      {
        id: 'add_delivery_notes',
        title: 'Add Delivery Notes',
        instruction: 'Enter any special delivery instructions',
        target: 'textarea[name="delivery-notes"]',
        validation: 'optional_field',
        errorMessage: 'Optional field',
        hint: 'E.g., "Leave at gate"',
        estimatedTime: 10
      },
      {
        id: 'confirm_delivery',
        title: 'Confirm Delivery',
        instruction: 'Click "Confirm Delivery" to finish',
        target: '[data-action="confirm-delivery"]',
        validation: 'button_clicked',
        errorMessage: 'Click Confirm Delivery',
        hint: 'Green button',
        estimatedTime: 5,
        isFinality: true
      }
    ],
    completionMessage: '🎉 Order delivered! Customer notification sent.',
    totalEstimatedTime: 55
  }
};

/**
 * Get workflow by ID
 */
function getWorkflow(workflowId) {
  return WORKFLOWS[workflowId];
}

/**
 * Get all workflows
 */
function getAllWorkflows() {
  return Object.values(WORKFLOWS);
}

/**
 * Get workflows by category
 */
function getWorkflowsByCategory(category) {
  return Object.values(WORKFLOWS).filter(w => w.category === category);
}

/**
 * Calculate workflow completion percentage
 */
function getWorkflowProgress(workflowId, completedSteps) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) return 0;
  return Math.round((completedSteps.length / workflow.steps.length) * 100);
}
