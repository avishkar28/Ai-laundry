# AI Context Debug Sidebar — R&D Visualization & Telemetry Inspector

## Overview

The **AI Context Debug Sidebar** is a comprehensive real-time visualization tool for the Telemetry Bridge system. It provides live inspection of application state, telemetry events, accessibility snapshots, and AI analysis—all designed to streamline R&D, debugging, and integration with LangGraph, MCP, OpenAI, and PostgreSQL systems.

---

## Quick Start

### Open the Debug Sidebar

**Method 1: Via URL Parameter**
```
file:///path/to/index.html?debug
```

**Method 2: Via Console**
```javascript
toggleDebugSidebar()
```

**Method 3: Via localStorage**
```javascript
localStorage.setItem('ff_debug_sidebar', '1');
location.reload();
```

Once opened, the sidebar persists during your session. You can collapse, switch tabs, and generate snapshots without leaving the app.

---

## User Interface

### Layout

```
┌─────────────────────────────────────────┐
│ ⚗️ AI Context Debug        [−] [×]     │  ← Header with controls
├─────────────────────────────────────────┤
│ ● Active  Session: 51edc...             │  ← Status bar (green/red/yellow indicator)
├─────────────────────────────────────────┤
│ [Context] [A11y] [History] [Analysis]  │  ← Tab navigation
├─────────────────────────────────────────┤
│                                         │
│  ┌─ Application State ─────────────┐   │
│  │ Current Page: dashboard         │   │
│  │ Current URL: file:///...        │   │
│  │ Active Modal: none              │   │
│  │ Update Count: 42                │   │
│  │ Snapshots Stored: 12/50         │   │  ← Live telemetry data
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─ Last User Action ──────────────┐   │
│  │ → button_clicked (MEDIUM)       │   │
│  │ Data: {"text":"Save","id":"..."}│   │
│  └─────────────────────────────────┘   │
│                                         │  ← Auto-refreshes every 1s
│  ┌─ Visible Errors ────────────────┐   │
│  │ No visible errors               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ ✨ Generate AI Snapshot ]            │
│                                         │
│ (scrollable content area)               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 4 Main Tabs

### 1. Context Tab (Default)

**Purpose:** Real-time view of application state

**Displays:**
- **Current Page** — Active page (dashboard, orders, inventory, etc.)
- **Current URL** — Browser location
- **Active Modal** — Currently visible modal or "none"
- **Update Count** — Total telemetry events fired
- **Snapshots Stored** — Current snapshot count (max 50)
- **Last User Action** — Type, priority, and metadata
- **Visible Errors** — Any validation/system errors on screen

**Refresh Rate:** Every 1 second (auto)

**Use Case:** Monitor real-time user interactions, detect errors, verify page state changes

### 2. Accessibility Snapshot Tab (A11y)

**Purpose:** Inspect semantic UI element data without raw HTML

**Displays:**
- **Focused Element** — Full structured snapshot (role, label, value, disabled, visible, errors)
- Machine-readable format for AI consumption

**Example Output:**
```json
{
  "tag": "button",
  "id": "btn-save",
  "role": "button",
  "label": "Save Order",
  "value": undefined,
  "disabled": false,
  "visible": true,
  "errors": []
}
```

**Use Case:** Verify that accessibility data is correctly extracted for AI systems (no raw HTML)

### 3. Snapshot History Tab (History)

**Purpose:** Live event stream of telemetry events

**Displays:**
- **Latest 10 events** (most recent first)
- Each event shows: timestamp, priority (color-coded), action type, and data summary
- Color coding:
  - 🔴 **CRITICAL** — Red (#ef4444)
  - 🟠 **HIGH** — Orange (#f59e0b)
  - 🔵 **MEDIUM** — Blue (#3b82f6)
  - ⚫ **LOW** — Gray (#94a3b8)

**Events Tracked:**
- `app_initialized` (CRITICAL)
- `page_changed` (HIGH)
- `modal_opened` / `modal_closed` (CRITICAL/HIGH)
- `button_clicked` (MEDIUM)
- `form_submitted` (CRITICAL)
- `enter_pressed` (MEDIUM)
- `element_blur` (MEDIUM)
- `notification_shown` (HIGH)

**Use Case:** Debug event ordering, verify priority assignment, trace user interaction flows

### 4. AI Analysis Tab (Analysis)

**Purpose:** Real-time context analysis for AI integration

**Displays:**
- Auto-generated analysis of current application state
- Key insights:
  - Current page and focus
  - Active modals or dialogs
  - Detected errors or validation issues
  - Time since last user action
  - Session duration
  - Telemetry event count

**Example Analysis:**
```
📄 Currently on orders page.
⚠️ 1 validation error(s) detected.
🎯 Last action: button_clicked (3s ago).
⏱️ Session active for 2 minute(s).
📊 Telemetry: 87 events tracked.
```

**Use Case:** Prepare AI context before making decisions, verify AI understanding of current state

---

## Generate AI Snapshot

### What It Does

Calls `generateContextSnapshot(asJSON = true)` and displays formatted JSON in a modal window.

### Output

```json
{
  "snapshotVersion": "1.0",
  "timestamp": 1716207165123,
  "sessionId": "51edc598-39c5-463c-89de-589abb701ea1",
  "currentPage": "orders",
  "visibleErrors": [],
  "lastAction": {
    "type": "button_clicked",
    "priority": "MEDIUM",
    "timestamp": 1716207160000,
    "data": { "text": "View Order", "id": "btn-view-123" }
  },
  "focusedElement": {
    "tag": "input",
    "id": "search-orders",
    "role": "searchbox",
    "label": "Search orders",
    "value": "",
    "disabled": false,
    "visible": true
  },
  "activeModal": null,
  "updateCount": 42,
  "sidebarCollapsed": false
}
```

### Copy to Clipboard

Button to copy the entire JSON snapshot to clipboard for:
- Sending to LangGraph state machines
- Storing in PostgreSQL
- Feeding to OpenAI context
- Logging to MCP protocol servers

---

## Status Indicator

**Top-right corner of sidebar:**

- **🟢 Green (Active)** — Telemetry enabled and console logging on
- **🟡 Yellow (Paused)** — Telemetry enabled but console logging disabled (quiet mode)
- **🔴 Red (Disabled)** — Telemetry master switch off

### Toggle States

```javascript
// Enable/disable telemetry
window.TELEMETRY_ENABLED = true/false;

// Enable/disable console logging (independent of ENABLED)
window.TELEMETRY_DEBUG = true/false;

// Filter by priority (reduces noise)
window.TELEMETRY_MIN_PRIORITY = 'HIGH'; // Only HIGH and CRITICAL
```

---

## Modular Architecture for Future Integration

### LangGraph Integration

The Debug Sidebar is designed to work seamlessly with LangGraph state machines:

```python
# In your LangGraph workflow
from anthropic import Anthropic

def node_read_context(state):
    # Sidebar provides sessionId for session continuity
    session = get_session(AGENT_CONTEXT.sessionId)
    
    # Fetch latest snapshot from sidebar via MCP
    context_snapshot = mcp_call('generateContextSnapshot', 'langgraph_sync')
    
    # Feed to Claude
    response = client.messages.create(
        model="claude-opus",
        system=f"Current UI State: {json.dumps(context_snapshot)}",
        messages=[{"role": "user", "content": user_input}]
    )
    return {"response": response.content}
```

### MCP Resource Definition

The sidebar exposes functions as MCP resources:

```json
{
  "resources": [
    {
      "name": "generateContextSnapshot",
      "description": "Get current UI state snapshot (with sessionId)",
      "returns": "object"
    },
    {
      "name": "resetTransientContext",
      "description": "Clear temporary state without losing session",
      "returns": "void"
    },
    {
      "name": "analyzeCurrentContext",
      "description": "Get AI-ready context analysis",
      "returns": "string"
    }
  ]
}
```

### PostgreSQL Checkpoint Storage

Store snapshots for session resumption:

```sql
CREATE TABLE debug_snapshots (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  timestamp BIGINT NOT NULL,
  snapshot JSONB NOT NULL,
  page TEXT,
  modal TEXT,
  errors TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES user_sessions(id)
);

-- Store snapshot from sidebar
INSERT INTO debug_snapshots (session_id, timestamp, snapshot, page)
SELECT $1, $2, $3, $4
FROM generateContextSnapshot();

-- Retrieve session context
SELECT snapshot FROM debug_snapshots 
WHERE session_id = $1 
ORDER BY timestamp DESC LIMIT 50;
```

### OpenAI/Claude Integration

Directly feed snapshots to AI models:

```javascript
// From sidebar
const snapshot = generateContextSnapshot('openai_sync', true);

// Send to OpenAI
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  system: `You are analyzing a laundry management UI. Current state:\n${snapshot}`,
  messages: [{ role: "user", content: userQuery }]
});
```

---

## JavaScript API

### Core Functions

#### `toggleDebugSidebar()`
Open/close the debug sidebar

```javascript
toggleDebugSidebar(); // Toggle on/off
```

#### `switchDebugTab(tabName)`
Switch between tabs

```javascript
switchDebugTab('context');      // Application State
switchDebugTab('accessibility'); // Accessibility Snapshot
switchDebugTab('history');       // Event Stream
switchDebugTab('analysis');      // AI Analysis
```

#### `generateDebugSnapshot()`
Generate and display AI snapshot in modal

```javascript
generateDebugSnapshot();
```

#### `copyDebugSnapshotToClipboard()`
Copy snapshot JSON to system clipboard

```javascript
copyDebugSnapshotToClipboard();
```

#### `analyzeCurrentContext()`
Get AI-ready context analysis (called automatically on Analysis tab)

```javascript
const analysis = analyzeCurrentContext();
// Returns human-readable analysis string
```

#### `refreshDebugDisplay()`
Manually refresh all telemetry data (normally automatic every 1s)

```javascript
refreshDebugDisplay();
```

---

## Performance & Memory

- **Sidebar Overhead:** ~5-10ms per refresh cycle
- **Memory Usage:** ~150-200KB (50 compressed snapshots + event buffer)
- **Event Buffer:** Max 50 events (circular rotation)
- **Refresh Interval:** 1 second (configurable)
- **Snapshot Compression:** Automatic removal of null/undefined fields

### Optimize for Production

```javascript
// Disable console logging (runs telemetry silently)
window.TELEMETRY_DEBUG = false;

// Filter only critical events
window.TELEMETRY_MIN_PRIORITY = 'HIGH';

// Close sidebar when not debugging
toggleDebugSidebar();
```

---

## Advanced Usage

### Monitor Specific Pages

```javascript
// Open sidebar on Orders page
if (AGENT_CONTEXT.currentPage === 'orders') {
  toggleDebugSidebar();
}
```

### Debug Errors in Real-Time

```javascript
// Auto-expand debug sidebar when errors appear
if (AGENT_CONTEXT.visibleErrors.length > 0) {
  if (!DEBUG_SIDEBAR_STATE.isOpen) toggleDebugSidebar();
  switchDebugTab('context'); // Show errors tab
}
```

### Export Session for Analysis

```javascript
// Generate snapshot after user session
const snapshot = generateContextSnapshot('session_export', true);
const blob = new Blob([snapshot], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `session-${AGENT_CONTEXT.sessionId}.json`;
a.click();
```

### Correlate with Backend Logs

```javascript
// Every snapshot includes sessionId
const snapshot = generateContextSnapshot();
console.log(`[${snapshot.sessionId}] Sending telemetry to server`);

// Backend can now correlate with logs using sessionId
```

---

## Troubleshooting

### Sidebar Not Opening

```javascript
// Check telemetry initialization
console.log(AGENT_CONTEXT);

// Force open
DEBUG_SIDEBAR_STATE.isOpen = true;
document.getElementById('debug-sidebar').classList.remove('hidden');
startDebugAutoRefresh();
```

### Events Not Showing

```javascript
// Check if events are being recorded
console.log(TELEMETRY_EVENTS);

// Verify telemetry is enabled
console.log(window.TELEMETRY_ENABLED, window.TELEMETRY_DEBUG);

// Check priority filtering
console.log(window.TELEMETRY_MIN_PRIORITY);
```

### Snapshot Modal Blank

```javascript
// Regenerate snapshot
generateDebugSnapshot();

// Check clipboard support
navigator.clipboard.writeText("test").then(
  () => console.log("Clipboard works"),
  (err) => console.error("Clipboard error:", err)
);
```

---

## Best Practices

### For R&D & Development

1. **Keep sidebar open** during feature development
2. **Monitor Event Stream** to verify user actions are tracked
3. **Check Accessibility Tab** to ensure semantic data quality
4. **Review AI Analysis** before integrating with LangGraph

### For AI System Integration

1. **Use sessionId** for all multi-turn interactions
2. **Call generateContextSnapshot()** at decision points
3. **Respect activeModal** when providing suggestions
4. **Check visibleErrors** to understand user pain points

### For Production Deployment

1. **Disable TELEMETRY_DEBUG** for silent operation
2. **Set TELEMETRY_MIN_PRIORITY = 'HIGH'** to reduce noise
3. **Keep sidebar hidden** (don't expose to end users)
4. **Monitor memory usage** of snapshot buffer

---

## Architecture Diagram

```
User Interaction
       ↓
[Event Listener] → updateAgentContext() → _recordTelemetryEvent()
       ↓                                              ↓
[AGENT_CONTEXT]  ← Auto-refresh every 1s ← [TELEMETRY_EVENTS] (max 50)
       ↓
[Debug Sidebar Display]
├─ Context Tab (Application State)
├─ A11y Tab (Accessibility Snapshot)
├─ History Tab (Event Stream)
└─ Analysis Tab (AI Analysis)
       ↓
[Generate Snapshot] → [Copy to Clipboard]
       ↓
[LangGraph] / [MCP] / [OpenAI] / [PostgreSQL]
```

---

## Future Enhancements

- [ ] Export event history to CSV
- [ ] Filter events by priority/action type
- [ ] Replay session from snapshot
- [ ] Real-time pgvector embedding generation
- [ ] WebSocket sync with backend telemetry
- [ ] Custom analysis templates for AI systems
- [ ] A/B testing variant tracking
- [ ] Performance metrics (CPU, memory, paint time)

---

## Questions or Issues?

The Debug Sidebar is designed as an R&D tool first, production integration tool second. It's extensible and modular—adapt it to your LangGraph workflows, MCP servers, and PostgreSQL schemas.

**Happy debugging! 🧪✨**
