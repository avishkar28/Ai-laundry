/**
 * FreshFold AI Chat Interface
 * Conversational AI guidance system
 */

class AIChatInterface {
  constructor() {
    this.chatHistory = [];
    this.chatPanel = null;
    this.isOpen = false;
    this.conversationMode = 'guide'; // guide | freeform
    this.init();
  }

  /**
   * Initialize chat interface
   */
  init() {
    this.createChatPanel();
    this.setupEventListeners();
  }

  /**
   * Create chat panel UI
   */
  createChatPanel() {
    this.chatPanel = document.createElement('div');
    this.chatPanel.id = 'ai-chat-panel';
    this.chatPanel.className = 'ai-chat-panel hidden';
    this.chatPanel.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">
          <i class="fas fa-brain"></i> AI Assistant
          <span class="chat-mode-badge" data-mode="guide">Guide Mode</span>
        </div>
        <button class="chat-close" onclick="aiChat.close()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome">
          <i class="fas fa-wand-magic-sparkles"></i>
          <p>Hi! I'm your FreshFold AI assistant.</p>
          <p>How can I help you today?</p>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="chat-suggestions" id="chat-suggestions">
          <!-- Quick action suggestions -->
        </div>
        <div class="chat-input-wrapper">
          <input type="text" id="chat-input" placeholder="Ask me anything or start a workflow..." 
                 onkeypress="if(event.key==='Enter') aiChat.sendMessage()"/>
          <button class="chat-send" onclick="aiChat.sendMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.chatPanel);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for workflow start requests
    document.addEventListener('start-workflow', (e) => {
      const workflowId = e.detail.workflowId;
      this.close();
      aiTutorial.startWorkflow(workflowId);
    });
  }

  /**
   * Open chat panel
   */
  open(initialMessage = null) {
    this.isOpen = true;
    this.chatPanel.classList.remove('hidden');
    setTimeout(() => this.chatPanel.classList.add('show'), 10);

    // Clear history if new conversation
    if (!initialMessage) {
      this.showSuggestions();
    }

    document.getElementById('chat-input').focus();
  }

  /**
   * Close chat panel
   */
  close() {
    this.chatPanel.classList.remove('show');
    setTimeout(() => {
      this.chatPanel.classList.add('hidden');
      this.isOpen = false;
    }, 300);
  }

  /**
   * Send message
   */
  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';

    // Add user message
    this.addMessage(message, 'user');

    // Get AI response
    this.getAIResponse(message);
  }

  /**
   * Add message to chat history
   */
  addMessage(text, role = 'assistant', options = {}) {
    const messagesContainer = document.getElementById('chat-messages');

    // Remove welcome message if first message
    const welcome = messagesContainer.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-${role} ${options.class || ''}`;
    messageEl.innerHTML = `
      <div class="message-avatar">
        ${role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-brain"></i>'}
      </div>
      <div class="message-content">
        <div class="message-text">${this.escapeHtml(text)}</div>
        ${options.buttons ? `<div class="message-buttons">${options.buttons}</div>` : ''}
      </div>
    `;

    messagesContainer.appendChild(messageEl);

    // Auto scroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageEl;
  }

  /**
   * Get AI response from backend or mock
   */
  async getAIResponse(userMessage) {
    const context = contextDetector.getContextSnapshot();

    // Show thinking indicator
    const thinkingEl = this.addMessage('...', 'assistant', { class: 'thinking' });

    try {
      // Try to call backend API
      let data = null;
      let usesMock = false;

      try {
        const response = await fetch('http://localhost:3001/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage,
            context: {
              currentPage: context.currentPage,
              selectedOrder: context.selectedOrder,
              formFields: context.formState,
              visibleElements: context.visibleElements
            }
          }),
          timeout: 5000
        });

        if (response.ok) {
          data = await response.json();
          console.log('[AI] Backend response:', data);
        } else {
          console.warn('[AI] Backend returned:', response.status);
          usesMock = true;
        }
      } catch (fetchError) {
        console.warn('[AI] Backend unavailable, using mock:', fetchError.message);
        usesMock = true;
      }

      // Use mock response if backend failed
      if (usesMock || !data || !data.success) {
        data = this.getMockResponse(userMessage);
      }

      // Remove thinking indicator
      thinkingEl.remove();

      if (data && data.message) {
        // Add AI response
        this.addMessage(data.message, 'assistant');
        
        // If response mentions a specific workflow, offer quick start
        this.suggestRelatedWorkflow(userMessage, data.message);
      } else {
        // Final fallback
        this.addMessage(
          'I had trouble understanding that. Could you tell me more about what you\'re trying to do?',
          'assistant'
        );
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      thinkingEl.remove();
      
      // Fallback response
      this.addMessage(
        'Sorry, I encountered an error. Please try again or select a workflow below.',
        'assistant'
      );
      
      // Show suggestions
      this.showSuggestions();
    }
  }

  /**
   * Get mock AI response (works offline)
   */
  getMockResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (['create', 'order', 'new'].some(word => lower.includes(word))) {
      return {
        success: true,
        message: '✨ I can help you create a new order! This workflow takes about 75 seconds and involves:\n\n1️⃣ Opening the order form\n2️⃣ Entering customer details\n3️⃣ Adding phone number\n4️⃣ Selecting service type\n5️⃣ Entering quantity\n6️⃣ Choosing pickup/delivery date\n7️⃣ Reviewing details\n8️⃣ Saving the order'
      };
    }
    if (['pickup', 'assign', 'driver'].some(word => lower.includes(word))) {
      return {
        success: true,
        message: '🚗 I can help you assign a pickup! This workflow involves:\n\n1️⃣ Selecting an order\n2️⃣ Opening the assignment modal\n3️⃣ Choosing a driver\n4️⃣ Selecting a vehicle\n5️⃣ Setting pickup time\n6️⃣ Confirming assignment'
      };
    }
    if (['delivered', 'mark', 'complete', 'finish'].some(word => lower.includes(word))) {
      return {
        success: true,
        message: '✅ Let me guide you through marking an order as delivered:\n\n1️⃣ Find the order\n2️⃣ Mark it as ready for delivery\n3️⃣ Upload delivery photo (optional)\n4️⃣ Add delivery notes (optional)\n5️⃣ Confirm completion'
      };
    }
    if (['invoice', 'bill', 'payment'].some(word => lower.includes(word))) {
      return {
        success: true,
        message: '💰 I can help you generate an invoice! The process includes:\n\n1️⃣ Selecting the order\n2️⃣ Opening invoice generator\n3️⃣ Reviewing billing details\n4️⃣ Adding notes (optional)\n5️⃣ Sending the invoice'
      };
    }
    if (['restock', 'inventory', 'stock', 'supplies'].some(word => lower.includes(word))) {
      return {
        success: true,
        message: '📦 I can help you restock inventory! Follow these steps:\n\n1️⃣ Navigate to inventory\n2️⃣ Select an item to restock\n3️⃣ Open the restock form\n4️⃣ Enter quantity\n5️⃣ Enter cost\n6️⃣ Select supplier\n7️⃣ Complete the restock'
      };
    }
    
    // Default response
    return {
      success: true,
      message: '👋 I can help you with:\n\n📝 **Create Order** - Manage customer orders\n🚗 **Assign Pickup** - Dispatch drivers\n✅ **Mark Delivered** - Track completions\n💰 **Generate Invoice** - Handle billing\n📦 **Restock Inventory** - Manage supplies\n\nWhat would you like help with?'
    };
  }

  /**
   * Suggest related workflow based on AI response
   */
  /**
   * Start workflow from chat
   */
  startWorkflow(workflowId) {
    const workflow = getWorkflow(workflowId);
    this.addMessage(`Starting ${workflow.name}...`, 'assistant');
    setTimeout(() => {
      this.close();
      aiTutorial.startWorkflow(workflowId);
    }, 500);
  }

  /**
   * Suggest related workflow
   */
  suggestRelatedWorkflow(userMessage, aiResponse) {
    const lower = userMessage.toLowerCase();
    const workflows = [
      { id: 'create_order', keywords: ['create order', 'new order', 'new customer'] },
      { id: 'assign_pickup', keywords: ['assign pickup', 'assign driver', 'pickup', 'dispatch'] },
      { id: 'mark_delivered', keywords: ['delivered', 'mark delivered', 'complete'] },
      { id: 'generate_invoice', keywords: ['invoice', 'bill', 'payment'] },
      { id: 'restock_inventory', keywords: ['restock', 'inventory', 'stock'] }
    ];

    for (const workflow of workflows) {
      if (workflow.keywords.some(kw => lower.includes(kw))) {
        setTimeout(() => {
          const wf = getWorkflow(workflow.id);
          const buttons = `
            <button class="btn-chat-action" onclick="aiChat.startWorkflow('${workflow.id}')">
              <i class="fas fa-play-circle"></i> Start Tutorial
            </button>
          `;
          this.addMessage(
            `Would you like me to guide you through ${wf.name} step-by-step?`,
            'assistant',
            { buttons }
          );
        }, 500);
        break;
      }
    }
  }

  /**
   * Show quick action suggestions
   */
  showSuggestions() {
    const suggestionsContainer = document.getElementById('chat-suggestions');
    const workflows = [
      { id: 'create_order', label: '📝 Create Order', icon: 'fa-plus-circle' },
      { id: 'assign_pickup', label: '🚗 Assign Pickup', icon: 'fa-map-pin' },
      { id: 'mark_delivered', label: '✅ Mark Delivered', icon: 'fa-check-circle' },
      { id: 'generate_invoice', label: '💰 Generate Invoice', icon: 'fa-receipt' }
    ];

    suggestionsContainer.innerHTML = workflows
      .map(
        (w) =>
          `<button class="suggestion-btn" onclick="aiChat.startWorkflow('${w.id}')">
            <i class="fas ${w.icon}"></i> ${w.label}
          </button>`
      )
      .join('');
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize global AI chat
const aiChat = new AIChatInterface();
