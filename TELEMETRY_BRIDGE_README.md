# Telemetry Bridge System — AI-Optimized UI Awareness Engine

## Overview

The Telemetry Bridge is a production-grade, machine-readable UI awareness engine that continuously tracks FreshFold application state for AI system integration. It captures user interactions, page state, modal visibility, focused elements, and visible errors — all sanitized and compressed for efficient memory usage.

---

## Global Flags

```javascript
window.TELEMETRY_ENABLED = true          // Master on/off switch
window.TELEMETRY_DEBUG = true            // Console logging (independent of ENABLED)
window.TELEMETRY_COMPRESSION = true      // Compress snapshots for memory efficiency
window.TELEMETRY_MAX_SNAPSHOTS = 50      // Max snapshots in memory
window.TELEMETRY_MIN_PRIORITY = 'MEDIUM' // Filter events by priority
```

### Priorities

- **CRITICAL** — app_initialized, modal_opened, form_submitted, errors
- **HIGH** — page_changed, modal_closed, notification_shown, settings changes
- **MEDIUM** — button_clicked, element_blur, enter_pressed, filter_changed
- **LOW** — sidebar_toggle (rarely used)

---

## Core Global Object: AGENT_CONTEXT

Automatically initialized on page load.

```javascript
{
  snapshotVersion: "1.0",           // API version
  sessionId: "<UUID>",              // Stable session ID for LangGraph/PostgreSQL/MCP
  appVersion: "1.0",                // App version
  environment: "browser",           // Execution environment
  startTimestamp: <ms>,             // Session start time
  currentPage: "dashboard",         // Current page (dashboard, orders, inventory, etc.)
  currentURL: "file:///...",        // Current browser URL
  activeModal: "ai-modal" | null,   // Currently visible modal or null
  visibleErrors: [],                // Array of visible error messages
  lastAction: {                     // Most recent user action
    type: "page_changed",
    priority: "HIGH",
    timestamp: <ms>,
    data: {...}                     // Sanitized metadata
  },
  focusedElement: {...},            // Semantic snapshot of focused element
  updateCount: 0,                   // Total telemetry events fired
  snapshots: []                     // Circular buffer of last 50 snapshots (compressed)
}
```

---

## Core Functions

### 1. updateAgentContext(action, priority, metadata)

Fires a telemetry event and updates AGENT_CONTEXT state.

```javascript
// Page navigation
updateAgentContext('page_changed', 'HIGH', { page: 'orders' });

// Modal events
updateAgentContext('modal_opened', 'CRITICAL', { modal: 'ai-modal', source: 'topbar' });

// Form events
updateAgentContext('form_submitted', 'CRITICAL', { formId: 'contact-form' });

// Button clicks
updateAgentContext('button_clicked', 'MEDIUM', { text: 'Save Order', id: 'btn-save' });

// Input blur
updateAgentContext('element_blur', 'MEDIUM', { element: 'email-input' });
```

**Auto-refreshes:** currentPage, currentURL, activeModal, visibleErrors, focusedElement  
**Every 10 updates:** Pushes a compressed snapshot to snapshots[]  
**Console output:** Formatted with timestamp, priority color badge, and event data

---

### 2. generateContextSnapshot(label, asJSON)

Returns a machine-readable snapshot of current application state. Ideal for AI agent context preparation.

```javascript
// Get snapshot as JavaScript object (default)
const snapshot = generateContextSnapshot('user_interaction');
console.log(snapshot);

// Get snapshot as JSON string (easy copy/paste to AI)
const json = generateContextSnapshot('user_interaction', true);
console.log(json); // Pretty-printed JSON

// Returns:
{
  snapshotVersion: "1.0",
  timestamp: 1716207165123,
  sessionId: "51edc598-39c5-463c-89de-589abb701ea1",
  currentPage: "orders",
  visibleErrors: [],
  lastAction: {
    type: "button_clicked",
    priority: "MEDIUM",
    timestamp: 1716207160000,
    data: { text: "View Order", id: "btn-view-123" }
  },
  focusedElement: {
    tag: "input",
    id: "search-orders",
    role: "searchbox",
    label: "Search orders",
    value: "",
    disabled: false,
    visible: true
  },
  activeModal: null,
  updateCount: 42,
  sidebarCollapsed: false
}
```

---

### 3. sanitizeContext(obj, depth)

Recursively removes sensitive data before logging or storage.

```javascript
// Automatically redacts:
// - password, token, secret, apikey, auth, jwt, bearer fields
// - Hidden auth inputs
// - SSN and credit card patterns

const userData = {
  username: 'admin',
  password: 'secret123',      // <- REMOVED
  email: 'admin@example.com',
  apiToken: 'xyz789'           // <- REMOVED
};

const safe = sanitizeContext(userData);
// Result: { username: 'admin', email: 'admin@example.com' }
```

---

### 4. generateAccessibilitySnapshot(element)

Extracts semantic UI information WITHOUT raw HTML. Machine-readable format for AI systems.

```javascript
// Works on any element
const button = document.querySelector('button.btn-save');
const snapshot = generateAccessibilitySnapshot(button);

// Returns:
{
  tag: "button",
  id: "btn-save",
  role: "button",
  label: "Save Order",
  value: undefined,
  disabled: false,
  visible: true,
  errors: []  // Associated error messages
}

// NO raw HTML — only structured semantic data
// Safe for AI consumption
```

---

### 5. resetTransientContext()

Clears temporary state without removing persistent tracking.

```javascript
resetTransientContext();
// Clears:
// - lastAction
// - lastActionTimestamp
// - visibleErrors
// - focusedElement
//
// Does NOT clear:
// - sessionId (critical for LangGraph/PostgreSQL/MCP)
// - startTimestamp
// - snapshots history
```

---

## Automatic Event Tracking

### Smart Input Tracking (NO Keystroke Spam)

Only semantic changes tracked — not every keystroke:

```javascript
// TRACKED:
- element.blur()           // Input loses focus
- form.submit()            // Form submitted
- Enter key on input       // User presses Enter

// NOT TRACKED:
- keydown / keyup          // Too verbose
- input event              // Every character typed
```

### Global Click Tracking

All button/link clicks are automatically logged.

```javascript
// When user clicks <button id="save" class="btn-primary">Save Order</button>
// Automatically fires:
updateAgentContext('button_clicked', 'MEDIUM', {
  text: 'Save Order',
  id: 'save',
  class: 'btn-primary'
});
```

### Modal Events

```javascript
// Automatically tracked:
- openAIModal(source)  → modal_opened (CRITICAL)
- closeAIModal()       → modal_closed (HIGH)
- openSettings()       → modal_opened (HIGH)
- closeSettings()      → modal_closed (HIGH)
- openTrackModal()     → modal_opened (HIGH)
- closeTrackModal()    → modal_closed (MEDIUM)
```

### Page Navigation

```javascript
// Automatically tracked:
goPage('orders') → page_changed (HIGH) with metadata { page: 'orders' }
```

### Notifications

```javascript
// Automatically tracked:
showToast(...) → notification_shown (HIGH) with metadata { type, title, category }
```

---

## Memory & Performance

### Compression

Automatic snapshot compression removes null/undefined fields:

```javascript
// Before compression:
{ sessionId, timestamp, currentPage, lastAction, focusedElement, activeModal, updateCount }

// After compression (if fields are empty):
{ sessionId, timestamp, currentPage, lastAction, activeModal, updateCount }
```

### Snapshot History

- **Max snapshots:** 50 (circular buffer)
- **Memory estimate:** ~50 snapshots × 2–3KB = 100–150KB
- **Time window:** ~2–3 minutes of activity
- **Automatic rotation:** Oldest snapshot removed when 51st snapshot pushed

---

## Integration with AI Systems

### For LangGraph

Use `sessionId` to link all telemetry events to a single conversation/session:

```python
# In LangGraph workflow
session_context = generateContextSnapshot()
print(f"Session: {session_context['sessionId']}")
print(f"Current Page: {session_context['currentPage']}")
print(f"Active Modal: {session_context['activeModal']}")
print(f"Last Action: {session_context['lastAction']}")
```

### For PostgreSQL Checkpointing

Store snapshots with sessionId as foreign key for session resumption:

```sql
INSERT INTO telemetry_snapshots (session_id, timestamp, snapshot_data)
VALUES ($1, $2, $3::jsonb);

SELECT * FROM telemetry_snapshots WHERE session_id = $1 ORDER BY timestamp DESC LIMIT 50;
```

### For MCP Protocol

Expose telemetry functions as MCP resources:

```javascript
// MCP can call:
generateContextSnapshot('mcp_request')  // Get current UI state
resetTransientContext()                 // Clear temporary state
```

---

## Console Output

### Example Log

When `TELEMETRY_DEBUG = true`:

```
[TELEMETRY] 14:32:45.123 | page_changed | HIGH
├─ type: page_changed
├─ priority: HIGH
└─ data: { page: 'orders' }

[TELEMETRY] 14:32:47.856 | button_clicked | MEDIUM
├─ type: button_clicked
├─ priority: MEDIUM
└─ data: { text: 'View Order', id: 'btn-view' }

[TELEMETRY] Session Initialized
├─ Session ID: 51edc598-39c5-463c-89de-589abb701ea1
└─ Start Time: 2026-05-20T14:32:40.123Z
```

### Disabling Console Output

```javascript
window.TELEMETRY_DEBUG = false;  // Stops console logs
window.TELEMETRY_ENABLED = true; // Telemetry still runs in background
```

---

## Data Flow Diagram

```
User Interaction
       ↓
Event Listener (click, blur, submit, etc.)
       ↓
updateAgentContext(action, priority, metadata)
       ↓
[Validate Priority] → [Sanitize Data] → [Update AGENT_CONTEXT]
       ↓
[Log to Console] (if TELEMETRY_DEBUG)
       ↓
[Every 10 updates] → [Push Compressed Snapshot to snapshots[]]
       ↓
[snapshots[] max 50] → [Circular rotation if exceeded]
```

---

## Best Practices

### For AI Agents

1. **Read snapshots regularly** to track user context
2. **Use `sessionId`** to correlate multi-turn interactions
3. **Call `resetTransientContext()`** before major state transitions
4. **Check `visibleErrors`** to understand user pain points
5. **Respect `activeModal`** when providing suggestions

### For Developers

1. **Only call `updateAgentContext()`** with meaningful events (not spam)
2. **Use appropriate priorities** (CRITICAL for errors, MEDIUM for clicks)
3. **Keep metadata small** (strings truncated at 50–100 chars)
4. **Check `TELEMETRY_ENABLED`** before console-heavy operations
5. **Monitor snapshots[]** length (should stay at max 50)

---

## Troubleshooting

### Telemetry not running?

```javascript
console.log(AGENT_CONTEXT);  // Check if initialized
console.log(window.TELEMETRY_ENABLED);  // Check if enabled
console.log(window.TELEMETRY_DEBUG);    // Check if debug is on
```

### Snapshots not storing?

```javascript
console.log(AGENT_CONTEXT.snapshots.length);  // Should be ≤ 50
console.log(AGENT_CONTEXT.updateCount);        // Should increment
```

### Console too noisy?

```javascript
window.TELEMETRY_MIN_PRIORITY = 'HIGH';  // Filter out MEDIUM and LOW
window.TELEMETRY_DEBUG = false;          // Turn off console logging entirely
```

---

## Version History

- **v1.0** — Initial release with sessionId, priority filtering, sanitization, compression
- Next: AI prompt format export, rate limiting, selective export flags

---

## License

Part of FreshFold Laundry Management System (MIT)
