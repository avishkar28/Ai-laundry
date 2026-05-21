# FreshFold AI-Guided Interactive Demo System

## Overview

A sophisticated, game-like onboarding and tutorial system that guides users through FreshFold workflows step-by-step with interactive visual highlights, animated tooltips, and intelligent AI assistance.

## Features

### 🎮 Game-Like Tutorial UI
- **Glowing Highlight Box**: Pulsing border around target elements
- **Animated Arrows**: Bouncing arrows pointing to interactive elements
- **Smart Tooltips**: Context-aware instruction cards with hints
- **Dark Overlay**: Darkens background to focus user attention
- **Progress Tracking**: Visual progress bar and step indicators
- **Smooth Animations**: Cubic-bezier transitions and keyframe animations

### 🤖 AI Assistant Modes

#### 1. **Step-by-Step Guide**
- Visual checklist of workflow steps
- Estimated completion time
- Required actions for each step
- Validation feedback

#### 2. **Interactive Demo**
- Live guided tutorial mode
- AI analyzes current page context
- Guides user through each step
- Waits for step completion before advancing
- Shows helpful hints and common errors

### 🧠 Intelligent Features

#### Context Detection
- Detects current page
- Tracks focused elements
- Monitors form state
- Detects validation errors
- Identifies available actions

#### Step Validation
- Input validation (text, numbers, phone, email, dates)
- Button click detection
- Form submission detection
- Modal/dialog detection
- Dynamic element visibility detection

#### Workflow Orchestration
- 5 pre-built workflows
- Extensible workflow definitions
- Step sequencing
- Conditional flow logic
- Error recovery guidance

### 💬 AI Chat Interface

- **Conversational UI**: Natural language input
- **Quick Actions**: Suggested workflows
- **Contextual Help**: Page-specific guidance
- **Workflow Recommendations**: Suggests relevant workflows based on context
- **Message History**: Maintains conversation context

## Architecture

```
ai-system/
├── workflows.js              # Workflow definitions
├── context-detector.js       # Page/state detection
├── highlight-system.js       # Visual overlays
├── tutorial-controller.js    # Workflow orchestration
├── step-validator.js         # Step validation logic
├── ai-chat.js               # Chat interface
├── tutorial-styles.css       # All styles
└── init.js                  # Bootstrap
```

### Component Responsibilities

**workflows.js**
- Defines all available workflows
- Contains step definitions
- Workflow metadata (name, icon, category, duration)
- Validation rules per step

**context-detector.js**
- Continuously monitors page state
- Detects current page/modal
- Tracks selected items
- Captures form state
- Identifies errors
- Provides AI-friendly context summaries

**highlight-system.js**
- Creates visual overlays and highlights
- Positions highlight boxes around targets
- Animates arrow pointers
- Manages tooltips
- Handles element scrolling
- Updates positions on resize

**tutorial-controller.js**
- Orchestrates workflow execution
- Manages step transitions
- Detects step completion
- Shows introduction/completion modals
- Handles user cancellation
- Provides feedback

**step-validator.js**
- Validates different input types
- Checks element states
- Provides error messages
- Generates validation hints

**ai-chat.js**
- Chat UI panel
- Message rendering
- Intent parsing
- Conversational responses
- Quick action suggestions
- Workflow integration

## Workflows

### 1. Create New Order
- **Duration**: ~1.25 minutes
- **Steps**: 8
- **Description**: Complete guide to create a customer order
- **Key Steps**:
  1. Open New Order form
  2. Enter customer name
  3. Enter phone number
  4. Select service type
  5. Enter cloth quantity
  6. Choose delivery date
  7. Review order details
  8. Save order

### 2. Assign Pickup
- **Duration**: ~1 minute
- **Steps**: 6
- **Description**: Assign a driver for order pickup
- **Key Steps**:
  1. Select pending order
  2. Open Assign Pickup
  3. Select driver
  4. Select vehicle
  5. Set pickup time
  6. Confirm assignment

### 3. Mark as Delivered
- **Duration**: ~55 seconds
- **Steps**: 5
- **Description**: Complete an order and mark it delivered
- **Key Steps**:
  1. Find in-cleaning order
  2. Mark as Ready
  3. Take photo (optional)
  4. Add delivery notes (optional)
  5. Confirm delivery

### 4. Generate Invoice
- **Duration**: ~1 minute
- **Steps**: 5
- **Description**: Create and send an invoice
- **Key Steps**:
  1. Select delivered order
  2. Open Invoice Generator
  3. Review invoice details
  4. Add notes (optional)
  5. Send to Customer

### 5. Restock Inventory
- **Duration**: ~55 seconds
- **Steps**: 7
- **Description**: Add new inventory items
- **Key Steps**:
  1. Navigate to Inventory
  2. Select low-stock item
  3. Open Restock Form
  4. Enter quantity
  5. Enter unit cost
  6. Select supplier
  7. Complete restock

## Usage

### Starting a Tutorial

```javascript
// Via floating button (automatic)
// Users click the brain icon → AI Chat opens

// Via code
AISystem.start('create_order');

// Via HTML attribute
<button data-tutorial-workflow="create_order">
  Start Order Creation
</button>

// Via chat
// User: "Create an order"
// AI suggests workflow → User clicks Start
```

### Chat Integration

```javascript
// Open chat
AISystem.chat();

// Programmatically send message
aiChat.addMessage("User query", "user");
aiChat.getAIResponse("User query");

// Listen for workflow starts
document.addEventListener('start-workflow', (e) => {
  const { workflowId } = e.detail;
  console.log('Starting:', workflowId);
});
```

### Context Access

```javascript
// Get current context
const context = contextDetector.getContextSnapshot();
console.log(context.currentPage);
console.log(context.selectedOrder);
console.log(context.validationErrors);

// Check if workflow can start
const canStart = contextDetector.canStartWorkflow('create_order');

// Get recommendations
const workflows = contextDetector.getRecommendedWorkflows();
```

### System Status

```javascript
// Get full status
const status = AISystem.status();

// Get all workflows
const workflows = AISystem.workflows();

// Get recommendations for current page
const recommended = AISystem.recommendations();
```

## Styling

All styles are in `tutorial-styles.css` and feature:

- **CSS Variables**: For consistent colors and spacing
- **Animations**: Smooth transitions and keyframe animations
- **Responsive Design**: Mobile-friendly layouts
- **Dark Mode Ready**: Can be extended for dark mode
- **Accessibility**: Focus states and semantic HTML

Key styles:
- `.tutorial-overlay`: Dark overlay
- `.highlight-box`: Glowing highlight around target
- `.highlight-arrow`: Animated pointer
- `.highlight-tooltip`: Instruction card
- `.ai-chat-panel`: Chat interface

## Integration

### Add to HTML

```html
<!-- AI System Styles -->
<link rel="stylesheet" href="ai-system/tutorial-styles.css"/>

<!-- AI System Scripts (in order) -->
<script src="ai-system/workflows.js"></script>
<script src="ai-system/context-detector.js"></script>
<script src="ai-system/highlight-system.js"></script>
<script src="ai-system/step-validator.js"></script>
<script src="ai-system/tutorial-controller.js"></script>
<script src="ai-system/ai-chat.js"></script>
<script src="ai-system/init.js"></script>
```

### Update Existing Code

No changes required to existing FreshFold code! The AI system:
- Uses data attributes for targeting
- Doesn't modify DOM structure
- Doesn't affect form functionality
- Works with existing JavaScript

### Data Attributes (Optional)

To enhance the system, add these attributes to your HTML:

```html
<!-- Navigation items -->
<a data-nav="orders">Orders</a>
<a data-nav="inventory">Inventory</a>

<!-- Forms -->
<form data-form-id="new-order">
  <input placeholder="customer name"/>
  <button type="submit">Save</button>
</form>

<!-- Workflow buttons -->
<button data-action="new-order">New Order</button>
<button data-action="assign-pickup">Assign Pickup</button>

<!-- Status indicators -->
<tr data-status="pending">...</tr>
<tr data-status="in-cleaning">...</tr>
<tr data-status="delivered">...</tr>

<!-- Tutorial workflow starters -->
<button data-tutorial-workflow="create_order">
  Learn: Create Order
</button>
```

## Future Enhancements

### Ready for LangGraph Integration
- Context provided to LangGraph for decision-making
- Workflow steps can trigger MCP tools
- Multi-turn conversations with stateful context
- PostgreSQL checkpoints for session persistence
- pgvector embeddings for similar workflows

### Ready for OpenAI Integration
- Use GPT-4 for dynamic instructions
- Natural language workflow instructions
- Smart error recovery suggestions
- Personalized guidance

### Analytics & Tracking
- Workflow completion rates
- Step-level metrics
- Error patterns
- User journey analysis

### Multi-language Support
- i18n framework ready
- Dynamic text loading
- Language-specific validation

## Debugging

```javascript
// Global API for debugging
window.AISystem

// Get current context
window.AISystem.context()

// Start workflow
window.AISystem.start('create_order')

// Open chat
window.AISystem.chat()

// Get status
window.AISystem.status()

// Get all workflows
window.AISystem.workflows()
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **Lightweight**: ~50KB CSS + JS combined
- **No External Dependencies**: Pure vanilla JavaScript
- **Efficient DOM Updates**: Minimal reflows
- **Smooth Animations**: GPU-accelerated transforms
- **Memory Efficient**: Cleans up listeners on dismiss

## Accessibility

- Keyboard navigation support
- Focus management
- ARIA labels
- High contrast options
- Screen reader friendly

## License

FreshFold AI System © 2026. All rights reserved.
