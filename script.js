/* ============================================================
   FRESHFOLD — JavaScript
   Sounds · Toast Notifications · AI Assistant · Smart Insights
   ============================================================ */

// ─── DEVELOPER MODE (R&D / Debug) ───────────────────────────────────────────
// Set to true to see: telemetry, debug sidebar, snapshots, event logs
// Set to false for production: users see only AI Assistant + smart suggestions
window.DEV_MODE = new URL(window.location).searchParams.has('dev') || localStorage.getItem('DEV_MODE') === 'true';

// ─── AUDIO ENGINE (Web Audio API — no external files) ───────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, type, duration, gainVal, delay = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch (e) { /* silent fail */ }
}

// Paytm-style payment success sound: ascending chime
function soundPaytm() {
  playTone(523, 'sine', 0.18, 0.4, 0.00);
  playTone(659, 'sine', 0.18, 0.4, 0.12);
  playTone(784, 'sine', 0.18, 0.4, 0.24);
  playTone(1046,'sine', 0.35, 0.5, 0.38);
}

// Soft click
function soundClick() {
  playTone(880, 'sine', 0.08, 0.25);
}

// Notification pop
function soundNotif() {
  playTone(660, 'sine', 0.12, 0.3, 0.00);
  playTone(880, 'sine', 0.18, 0.35, 0.10);
}

// Error / warning
function soundWarn() {
  playTone(220, 'sawtooth', 0.2, 0.2, 0.00);
  playTone(180, 'sawtooth', 0.2, 0.2, 0.18);
}

// AI "thinking" bleep
function soundAI() {
  playTone(1200, 'sine', 0.06, 0.15, 0.00);
  playTone(900,  'sine', 0.06, 0.15, 0.09);
  playTone(1100, 'sine', 0.06, 0.15, 0.18);
  playTone(1400, 'sine', 0.12, 0.2,  0.28);
}

// ─── TELEMETRY BRIDGE SYSTEM (AI-Optimized UI Awareness Engine) ───────────────
window.TELEMETRY_ENABLED = true;
window.TELEMETRY_DEBUG = true;
window.TELEMETRY_COMPRESSION = true;
window.TELEMETRY_MAX_SNAPSHOTS = 50;
window.TELEMETRY_MIN_PRIORITY = 'MEDIUM';

const TELEMETRY_PRIORITIES = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function _getPriorityValue(priority) {
  return TELEMETRY_PRIORITIES[priority] || TELEMETRY_PRIORITIES.MEDIUM;
}

function _shouldLogTelemetry(priority) {
  if (!window.TELEMETRY_ENABLED) return false;
  return _getPriorityValue(priority) <= _getPriorityValue(window.TELEMETRY_MIN_PRIORITY);
}

function sanitizeContext(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return obj;
  const SENSITIVE_PATTERN = /(password|token|secret|apikey|auth|jwt|bearer|ssn|credit|card)/i;
  
  if (typeof obj === 'string') {
    if (SENSITIVE_PATTERN.test(obj)) return '[REDACTED]';
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeContext(item, depth + 1));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (SENSITIVE_PATTERN.test(key)) continue;
    const val = obj[key];
    if (typeof val === 'string' && SENSITIVE_PATTERN.test(val)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      sanitized[key] = sanitizeContext(val, depth + 1);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

function generateAccessibilitySnapshot(element) {
  if (!element) return null;
  try {
    const snapshot = {
      tag: element.tagName ? element.tagName.toLowerCase() : 'unknown',
      id: element.id || undefined,
      role: element.getAttribute('role') || undefined,
      label: element.getAttribute('aria-label') || element.placeholder || element.textContent?.trim() || undefined,
      value: element.value ? sanitizeContext({ value: element.value }).value : undefined,
      disabled: element.disabled || false,
      visible: element.offsetParent !== null,
      errors: []
    };
    
    // Collect associated error messages
    if (element.id) {
      const errorEl = document.querySelector(`[aria-describedby="${element.id}"]`)?.parentElement?.querySelector('.error-message');
      if (errorEl) snapshot.errors.push(errorEl.textContent.trim());
    }
    
    // Remove undefined fields to keep compact
    Object.keys(snapshot).forEach(k => snapshot[k] === undefined && delete snapshot[k]);
    return snapshot;
  } catch (e) {
    return null;
  }
}

function _compressSnapshot(snapshot) {
  if (!window.TELEMETRY_COMPRESSION) return snapshot;
  const compressed = {};
  for (const key in snapshot) {
    const val = snapshot[key];
    if (val === null || val === undefined || (Array.isArray(val) && val.length === 0)) continue;
    compressed[key] = val;
  }
  return compressed;
}

function _getCurrentPage() {
  const activePage = document.querySelector('.page.active');
  if (!activePage || !activePage.id) return 'unknown';
  return activePage.id.replace('page-', '');
}

function _getActiveModal() {
  const modals = ['ai-modal', 'voice-invoice-modal', 'photo-scan-modal', 'track-modal', 'settings-drawer'];
  for (const modalId of modals) {
    const modal = document.getElementById(modalId);
    if (modal && !modal.classList.contains('hidden')) return modalId;
  }
  return null;
}

function _getVisibleErrors() {
  const errors = [];
  document.querySelectorAll('.toast.error, [role="alert"].error').forEach(el => {
    const text = el.textContent.trim();
    if (text) errors.push(text);
  });
  return errors;
}

function _getSidebarState() {
  const sidebar = document.getElementById('sidebar');
  return sidebar ? sidebar.classList.contains('sidebar-collapsed') : false;
}

function _logTelemetry(action, priority, data) {
  // Only log telemetry in dev mode
  if (!window.DEV_MODE || !window.TELEMETRY_DEBUG) return;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const colors = { CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#94a3b8' };
  const color = colors[priority] || colors.MEDIUM;
  
  console.group(`%c[TELEMETRY] ${time} | ${action} | ${priority}`, `color: ${color}; font-weight: bold;`);
  console.log('Data:', data);
  console.groupEnd();
}

let AGENT_CONTEXT = null;

function _initializeAgentContext() {
  AGENT_CONTEXT = {
    snapshotVersion: '1.0',
    sessionId: crypto.randomUUID(),
    appVersion: '1.0',
    environment: 'browser',
    startTimestamp: Date.now(),
    currentPage: _getCurrentPage(),
    currentURL: window.location.href,
    activeModal: _getActiveModal(),
    visibleErrors: _getVisibleErrors(),
    lastAction: null,
    lastActionTimestamp: null,
    focusedElement: generateAccessibilitySnapshot(document.activeElement),
    updateCount: 0,
    snapshots: []
  };
  
  if (window.TELEMETRY_DEBUG) {
    console.group('%c[TELEMETRY] Session Initialized', 'color: #10b981; font-weight: bold; font-size: 12px;');
    console.log('Session ID:', AGENT_CONTEXT.sessionId);
    console.log('Start Time:', new Date(AGENT_CONTEXT.startTimestamp).toISOString());
    console.groupEnd();
  }
}

function _pushSnapshot() {
  if (!AGENT_CONTEXT) return;
  const snapshot = _compressSnapshot({
    snapshotVersion: AGENT_CONTEXT.snapshotVersion,
    timestamp: Date.now(),
    sessionId: AGENT_CONTEXT.sessionId,
    currentPage: AGENT_CONTEXT.currentPage,
    activeModal: AGENT_CONTEXT.activeModal,
    visibleErrors: AGENT_CONTEXT.visibleErrors,
    lastAction: AGENT_CONTEXT.lastAction ? { 
      type: AGENT_CONTEXT.lastAction.type, 
      priority: AGENT_CONTEXT.lastAction.priority 
    } : null,
    focusedElement: AGENT_CONTEXT.focusedElement,
    sidebarCollapsed: _getSidebarState()
  });
  
  AGENT_CONTEXT.snapshots.push(snapshot);
  if (AGENT_CONTEXT.snapshots.length > window.TELEMETRY_MAX_SNAPSHOTS) {
    AGENT_CONTEXT.snapshots.shift();
  }
}

function updateAgentContext(action, priority = 'MEDIUM', metadata = {}) {
  if (!AGENT_CONTEXT) return;
  if (!_shouldLogTelemetry(priority)) return;
  
  AGENT_CONTEXT.lastAction = {
    type: action,
    priority: priority,
    timestamp: Date.now(),
    data: sanitizeContext(metadata)
  };
  AGENT_CONTEXT.lastActionTimestamp = Date.now();
  AGENT_CONTEXT.currentPage = _getCurrentPage();
  AGENT_CONTEXT.currentURL = window.location.href;
  AGENT_CONTEXT.activeModal = _getActiveModal();
  AGENT_CONTEXT.visibleErrors = _getVisibleErrors();
  AGENT_CONTEXT.focusedElement = generateAccessibilitySnapshot(document.activeElement);
  AGENT_CONTEXT.updateCount++;
  
  if (AGENT_CONTEXT.updateCount % 10 === 0) {
    _pushSnapshot();
  }
  
  _logTelemetry(action, priority, AGENT_CONTEXT.lastAction);
}

function generateContextSnapshot(label = 'manual', asJSON = false) {
  if (!AGENT_CONTEXT) return null;
  updateAgentContext('snapshot_generated', 'LOW', { label });
  
  const snapshot = _compressSnapshot({
    snapshotVersion: AGENT_CONTEXT.snapshotVersion,
    timestamp: Date.now(),
    sessionId: AGENT_CONTEXT.sessionId,
    currentPage: AGENT_CONTEXT.currentPage,
    visibleErrors: AGENT_CONTEXT.visibleErrors,
    lastAction: AGENT_CONTEXT.lastAction,
    focusedElement: AGENT_CONTEXT.focusedElement,
    activeModal: AGENT_CONTEXT.activeModal,
    updateCount: AGENT_CONTEXT.updateCount,
    sidebarCollapsed: _getSidebarState()
  });
  
  const sanitized = sanitizeContext(snapshot);
  if (asJSON) return JSON.stringify(sanitized, null, 2);
  return sanitized;
}

function resetTransientContext() {
  if (!AGENT_CONTEXT) return;
  AGENT_CONTEXT.lastAction = null;
  AGENT_CONTEXT.lastActionTimestamp = null;
  AGENT_CONTEXT.visibleErrors = [];
  AGENT_CONTEXT.focusedElement = null;
  
  if (window.TELEMETRY_DEBUG) {
    console.log('%c[TELEMETRY] Transient context reset', 'color: #8b5cf6; font-style: italic;');
  }
}

// ─── DEBUG SIDEBAR ENGINE ───────────────────────────────────────────────────────

// Telemetry event tracking (circular buffer for latest 50 events)
let TELEMETRY_EVENTS = [];
const TELEMETRY_MAX_EVENTS = 50;

function _recordTelemetryEvent(action, priority, data) {
  const event = {
    timestamp: Date.now(),
    action,
    priority,
    data: sanitizeContext(data)
  };
  TELEMETRY_EVENTS.push(event);
  if (TELEMETRY_EVENTS.length > TELEMETRY_MAX_EVENTS) {
    TELEMETRY_EVENTS.shift();
  }
}

// Override updateAgentContext to also track events
const _originalUpdateAgentContext = window.updateAgentContext;
window.updateAgentContext = function(action, priority = 'MEDIUM', metadata = {}) {
  _recordTelemetryEvent(action, priority, metadata);
  return _originalUpdateAgentContext.call(this, action, priority, metadata);
};

// Debug Sidebar Management
let DEBUG_SIDEBAR_STATE = {
  isOpen: false,
  currentTab: 'context',
  lastSnapshot: null,
  autoRefreshInterval: null
};

function toggleDebugSidebar() {
  // Dev mode only - end users never see this
  if (!window.DEV_MODE) return;
  
  const sidebar = document.getElementById('debug-sidebar');
  const toggleBtn = document.getElementById('debug-toggle-btn');
  
  DEBUG_SIDEBAR_STATE.isOpen = !DEBUG_SIDEBAR_STATE.isOpen;
  
  if (DEBUG_SIDEBAR_STATE.isOpen) {
    sidebar.classList.remove('hidden');
    toggleBtn.classList.add('hidden');
    startDebugAutoRefresh();
  } else {
    sidebar.classList.add('hidden');
    toggleBtn.classList.remove('hidden');
    stopDebugAutoRefresh();
  }
}

function toggleDebugSidebarCollapse() {
  const sidebar = document.getElementById('debug-sidebar');
  sidebar.classList.toggle('collapsed');
}

function switchDebugTab(tabName) {
  // Update active tab button
  document.querySelectorAll('.debug-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update active tab content
  document.querySelectorAll('.debug-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `debug-tab-${tabName}`);
  });
  
  DEBUG_SIDEBAR_STATE.currentTab = tabName;
  
  if (tabName === 'analysis') {
    refreshDebugAIAnalysis();
  }
}

function startDebugAutoRefresh() {
  // Dev mode only
  if (!window.DEV_MODE) return;
  if (DEBUG_SIDEBAR_STATE.autoRefreshInterval) return;
  
  DEBUG_SIDEBAR_STATE.autoRefreshInterval = setInterval(() => {
    if (DEBUG_SIDEBAR_STATE.isOpen) {
      refreshDebugDisplay();
    }
  }, 1000);
}

function stopDebugAutoRefresh() {
  // Dev mode only
  if (!window.DEV_MODE) return;
  if (DEBUG_SIDEBAR_STATE.autoRefreshInterval) {
    clearInterval(DEBUG_SIDEBAR_STATE.autoRefreshInterval);
    DEBUG_SIDEBAR_STATE.autoRefreshInterval = null;
  }
}

function refreshDebugDisplay() {
  if (!AGENT_CONTEXT) return;
  
  // Update Context Tab
  document.getElementById('debug-page').textContent = AGENT_CONTEXT.currentPage || '—';
  document.getElementById('debug-url').textContent = (AGENT_CONTEXT.currentURL || '').substring(0, 40);
  document.getElementById('debug-modal').textContent = AGENT_CONTEXT.activeModal || 'none';
  document.getElementById('debug-update-count').textContent = AGENT_CONTEXT.updateCount;
  document.getElementById('debug-snapshots-count').textContent = AGENT_CONTEXT.snapshots.length;
  
  // Update status indicator
  const statusDot = document.getElementById('debug-status-dot');
  const statusLabel = document.getElementById('debug-status-label');
  
  if (window.TELEMETRY_ENABLED && window.TELEMETRY_DEBUG) {
    statusDot.className = 'debug-status-dot';
    statusLabel.textContent = 'Active';
  } else if (window.TELEMETRY_ENABLED && !window.TELEMETRY_DEBUG) {
    statusDot.className = 'debug-status-dot warning';
    statusLabel.textContent = 'Paused (no console)';
  } else {
    statusDot.className = 'debug-status-dot error';
    statusLabel.textContent = 'Disabled';
  }
  
  // Update Session ID
  document.getElementById('debug-session-id').textContent = AGENT_CONTEXT.sessionId.substring(0, 8) + '...';
  
  // Update Last Action
  const lastActionEl = document.getElementById('debug-last-action');
  if (AGENT_CONTEXT.lastAction) {
    lastActionEl.innerHTML = `
      <div class="debug-action-type"><i class="fas fa-arrow-right"></i> ${AGENT_CONTEXT.lastAction.type}</div>
      <div style="font-size:11px;color:#94a3b8">Priority: <span style="color:#fbbf24">${AGENT_CONTEXT.lastAction.priority}</span></div>
      ${AGENT_CONTEXT.lastAction.data ? `<div class="debug-action-data">${JSON.stringify(AGENT_CONTEXT.lastAction.data).substring(0, 100)}...</div>` : ''}
    `;
  } else {
    lastActionEl.innerHTML = '<div class="debug-action-none">No action yet</div>';
  }
  
  // Update Visible Errors
  const errorsEl = document.getElementById('debug-errors');
  if (AGENT_CONTEXT.visibleErrors && AGENT_CONTEXT.visibleErrors.length > 0) {
    errorsEl.innerHTML = AGENT_CONTEXT.visibleErrors.map(err => 
      `<div class="debug-error-item"><i class="fas fa-exclamation-circle"></i> ${err}</div>`
    ).join('');
  } else {
    errorsEl.innerHTML = '<div class="debug-none">No visible errors</div>';
  }
  
  // Update Accessibility Snapshot
  const focusedEl = document.getElementById('debug-focused-element');
  if (AGENT_CONTEXT.focusedElement) {
    focusedEl.textContent = JSON.stringify(AGENT_CONTEXT.focusedElement, null, 2);
  } else {
    focusedEl.innerHTML = '<div class="debug-none">No focused element</div>';
  }
  
  // Update Event Stream
  refreshDebugEventStream();
}

function refreshDebugEventStream() {
  const streamEl = document.getElementById('debug-event-stream');
  
  if (TELEMETRY_EVENTS.length === 0) {
    streamEl.innerHTML = '<div class="debug-none">Waiting for events...</div>';
    return;
  }
  
  // Show latest 10 events (most recent first)
  const recentEvents = [...TELEMETRY_EVENTS].reverse().slice(0, 10);
  streamEl.innerHTML = recentEvents.map(evt => {
    const time = new Date(evt.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });
    const priorityColor = {
      'CRITICAL': '#ef4444',
      'HIGH': '#f59e0b',
      'MEDIUM': '#3b82f6',
      'LOW': '#94a3b8'
    }[evt.priority] || '#94a3b8';
    
    return `
      <div class="debug-event-item">
        <span class="debug-event-time">${time}</span>
        <span class="debug-event-type" style="background-color:${priorityColor}">${evt.priority}</span>
        <span style="color:#cbd5e1">${evt.action}</span>
        ${Object.keys(evt.data || {}).length > 0 ? `<span class="debug-event-data">${JSON.stringify(evt.data).substring(0, 80)}...</span>` : ''}
      </div>
    `;
  }).join('');
}

function refreshDebugAIAnalysis() {
  const analysisEl = document.getElementById('debug-ai-analysis');
  
  // Simulate loading for 1 second
  analysisEl.innerHTML = `
    <div class="debug-analysis-loading">
      <div class="debug-ai-dots"><span></span><span></span><span></span></div>
      <p>Analyzing context...</p>
    </div>
  `;
  
  setTimeout(() => {
    const analysis = analyzeCurrentContext();
    if (analysis) {
      analysisEl.innerHTML = `<div class="debug-analysis-result">${analysis}</div>`;
    }
  }, 800);
}

function analyzeCurrentContext() {
  if (!AGENT_CONTEXT) return null;
  
  const parts = [];
  
  // Page analysis
  parts.push(`📄 Currently on <strong>${AGENT_CONTEXT.currentPage}</strong> page.`);
  
  // Modal analysis
  if (AGENT_CONTEXT.activeModal) {
    parts.push(`🔲 Modal <strong>${AGENT_CONTEXT.activeModal}</strong> is active.`);
  }
  
  // Error analysis
  if (AGENT_CONTEXT.visibleErrors && AGENT_CONTEXT.visibleErrors.length > 0) {
    parts.push(`⚠️ <strong>${AGENT_CONTEXT.visibleErrors.length}</strong> validation error(s) detected.`);
  }
  
  // Action analysis
  if (AGENT_CONTEXT.lastAction) {
    const timeSinceAction = Date.now() - AGENT_CONTEXT.lastAction.timestamp;
    const secondsAgo = Math.floor(timeSinceAction / 1000);
    parts.push(`🎯 Last action: <strong>${AGENT_CONTEXT.lastAction.type}</strong> (${secondsAgo}s ago).`);
  }
  
  // Session analysis
  const sessionDuration = Math.floor((Date.now() - AGENT_CONTEXT.startTimestamp) / 1000 / 60);
  parts.push(`⏱️ Session active for <strong>${sessionDuration}</strong> minute(s).`);
  
  // Telemetry health
  parts.push(`📊 Telemetry: <strong>${AGENT_CONTEXT.updateCount}</strong> events tracked.`);
  
  return `<strong>Context Analysis (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })})</strong><br><br>` + parts.join('<br>');
}

function generateDebugSnapshot() {
  if (!AGENT_CONTEXT) {
    showToast('error', 'Error', 'AGENT_CONTEXT not initialized', 'alerts');
    return;
  }
  
  const snapshot = generateContextSnapshot('debug_export', true);
  DEBUG_SIDEBAR_STATE.lastSnapshot = snapshot;
  
  const modal = document.getElementById('debug-snapshot-modal');
  const display = document.getElementById('debug-snapshot-display');
  
  display.textContent = snapshot;
  modal.classList.remove('hidden');
  
  showToast('success', 'Success', 'Snapshot generated and ready for copy', 'alerts');
}

function closeDebugSnapshotModal() {
  const modal = document.getElementById('debug-snapshot-modal');
  modal.classList.add('hidden');
}

function copyDebugSnapshotToClipboard() {
  if (!DEBUG_SIDEBAR_STATE.lastSnapshot) return;
  
  navigator.clipboard.writeText(DEBUG_SIDEBAR_STATE.lastSnapshot).then(() => {
    showToast('success', 'Copied!', 'Snapshot copied to clipboard', 'alerts');
    setTimeout(() => {
      closeDebugSnapshotModal();
    }, 800);
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('error', 'Copy Failed', 'Could not copy to clipboard', 'alerts');
  });
}

// Initialize Debug Sidebar on page load
function initializeDebugSidebar() {
  // Dev mode only - never show debug sidebar to end users
  if (!window.DEV_MODE) return;
  
  // Check for debug query param or localStorage flag
  const showDebug = new URLSearchParams(window.location.search).has('debug') || 
                    localStorage.getItem('ff_debug_sidebar') === '1';
  
  if (showDebug) {
    setTimeout(() => {
      toggleDebugSidebar();
      localStorage.setItem('ff_debug_sidebar', '1');
    }, 500);
  }
}

// ─── AI ASSISTANT WIDGET (User-Facing) ──────────────────────────────────────
// Shows smart suggestions and insights based on current context
function toggleAIAssistant() {
  const panel = document.getElementById('ai-assistant-panel');
  if (!panel) return;
  
  panel.classList.toggle('hidden');
  
  if (!panel.classList.contains('hidden')) {
    refreshAIAssistantSuggestions();
  }
}

function generateAISuggestions() {
  if (!AGENT_CONTEXT) return [];
  
  const suggestions = [];
  const page = AGENT_CONTEXT.currentPage;
  const lastAction = AGENT_CONTEXT.lastAction;
  const errors = AGENT_CONTEXT.visibleErrors || [];
  
  // Page-specific suggestions
  if (page === 'dashboard') {
    suggestions.push({
      icon: '📊',
      title: 'Check Inventory Levels',
      text: 'Liquid Detergent stock is running low. Reorder soon to avoid stockouts.'
    });
    suggestions.push({
      icon: '⭐',
      title: 'Your Rating: 4.7/5',
      text: 'Above platform average! Keep maintaining this quality.'
    });
  } else if (page === 'orders') {
    suggestions.push({
      icon: '🚚',
      title: 'Pending Pickups',
      text: '3 orders are ready for pickup. Schedule drivers now.'
    });
    suggestions.push({
      icon: '✅',
      title: 'Quality Check Tips',
      text: 'Focus on stain removal for delicate fabrics.'
    });
  } else if (page === 'inventory') {
    suggestions.push({
      icon: '📦',
      title: 'Stock Optimization',
      text: 'Consider bulk ordering to reduce per-unit costs.'
    });
  } else if (page === 'analytics') {
    suggestions.push({
      icon: '📈',
      title: 'Revenue Trend',
      text: 'Your revenue is trending up 12% this month!'
    });
  }
  
  // Action-based suggestions
  if (errors.length > 0) {
    suggestions.push({
      icon: '⚠️',
      title: 'Fix Required',
      text: `${errors[0]} Please check and try again.`
    });
  }
  
  if (lastAction && lastAction.type === 'form_submitted') {
    suggestions.push({
      icon: '💡',
      title: 'Smart Tip',
      text: 'Use keyboard shortcuts to speed up your workflow.'
    });
  }
  
  // Default helpful suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      icon: '👋',
      title: 'Welcome to FreshFold',
      text: 'I\'m here to help. Try clicking around or check inventory!'
    });
  }
  
  return suggestions.slice(0, 3); // Top 3 suggestions
}

// ─── OLLAMA LOCAL AI INTEGRATION ───────────────────────────────────────────────
// Uses locally installed Ollama for completely offline AI inference
const OLLAMA_API = 'http://localhost:11434/api';
const OLLAMA_MODEL = 'mistral'; // Change to: neural-chat, orca-mini, llama2, etc.
const OLLAMA_ENABLED = true; // Set to false to disable and use static suggestions

function extractPageContent() {
  // Deep page analysis - extract ALL meaningful content from current page
  const page = AGENT_CONTEXT.currentPage;
  const content = {
    page: page,
    pageTitle: document.title,
    visibleText: [],
    dataPoints: [],
    tableData: [],
    listItems: [],
    actions: [],
    pageContext: ''
  };
  
  try {
    // Get main content area - EXCLUDE navigation/header completely
    let mainContent = document.querySelector('main');
    if (!mainContent) return content;
    
    // Remove topbar/header/nav from analysis
    const headerEl = document.querySelector('header, .topbar, .navbar, [class*="topbar"]');
    const navEl = document.querySelector('nav, [class*="navbar"]');
    
    // ─── Extract Page-Specific Headings ───
    const allHeadings = Array.from(mainContent.querySelectorAll('h1, h2, h3, h4'));
    const headings = allHeadings
      .filter(h => {
        // Skip if element is in header/nav
        if (h.closest('header') || h.closest('nav') || h.closest('[class*="topbar"]')) return false;
        const text = h.textContent.trim();
        // Skip navigation page titles
        if (['Orders', 'Inventory', 'Analytics', 'Customers', 'AI Hub', 'Dashboard'].includes(text)) return false;
        return text.length > 0;
      })
      .map(h => h.textContent.trim())
    
    // ─── Extract Paragraphs & Detailed Text ───
    const paragraphs = Array.from(mainContent.querySelectorAll('p, span[class*="description"], div[class*="text"], li, div[class*="info"]'))
      .map(p => p.textContent.trim())
      .filter(p => {
        // Skip if too short or too generic
        if (p.length < 5 || p.length > 200) return false;
        if (p.includes('<')) return false;
        // Skip dashboard-specific alerts
        if (p.includes('satisfaction score') || p.includes('demand window') || p.includes('running low')) return false;
        // Skip navigation
        if (['Orders', 'Inventory', 'Analytics', 'Customers', 'AI Hub', 'Dashboard'].includes(p)) return false;
        return true;
      });
    
    // ─── Extract Cards with Better Detection ───
    const cards = Array.from(mainContent.querySelectorAll(
      '[class*="card"], [class*="metric"], [class*="stat"], [class*="member"], [class*="performer"], [class*="team"], [class*="staff"], [class*="box"]'
    ));
    const dataPoints = cards.slice(0, 8).map(card => {
      const title = card.querySelector('h3, h4, .card-title, [class*="name"], [class*="label"], .title, strong')?.textContent?.trim() || '';
      const value = card.querySelector('[class*="value"], [class*="amount"], [class*="number"], .stat-value, [class*="score"], span[class*="big"]')?.textContent?.trim() || '';
      const text = card.textContent?.trim().substring(0, 120) || '';
      return { title, value, text };
    }).filter(d => d.title || d.value);
    
    // ─── Extract Table Data ───
    const tables = Array.from(mainContent.querySelectorAll('table'));
    const tableData = tables.slice(0, 3).map(table => ({
      headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim()),
      rows: Array.from(table.querySelectorAll('tbody tr')).slice(0, 5).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
      )
    })).filter(t => t.headers.length > 0);
    
    // ─── Extract List Items ───
    const lists = Array.from(mainContent.querySelectorAll('ul, ol'));
    const listItems = lists.slice(0, 3).flatMap(list => 
      Array.from(list.querySelectorAll('li')).slice(0, 8).map(li => li.textContent.trim())
    ).filter(t => t.length > 0);
    
    // ─── Extract All Actionable Buttons ───
    const buttons = Array.from(mainContent.querySelectorAll('button, a[class*="btn"], a[class*="button"]'));
    const actions = buttons
      .map(btn => btn.textContent?.trim())
      .filter(t => t && t.length > 0 && t.length < 50 && !t.includes('Orders') && !t.includes('Inventory') && !t.includes('Analytics'))
      .slice(0, 8);
    
    // ─── Build Page Context Description ───
    const contextParts = [];
    if (page === 'dashboard') contextParts.push('Dashboard showing business overview with orders, revenue, and inventory status');
    else if (page === 'orders') contextParts.push('Orders management page with order list, customer details, service types, and order status tracking');
    else if (page === 'inventory') contextParts.push('Inventory management showing stock levels, items, supplies, and reorder information');
    else if (page === 'analytics') contextParts.push('Analytics dashboard with business metrics, performance trends, sales data, and KPI insights');
    else if (page === 'staff') contextParts.push('Staff management page showing team member profiles, AI performance scores, ratings, and staff metrics');
    else if (page === 'customers') contextParts.push('Customer management page showing client list, contact information, customer data, and engagement metrics');
    else if (page === 'ai') contextParts.push('AI Hub page with smart insights, AI recommendations, predictive analysis, and intelligent features');
    
    content.pageContext = contextParts.join('. ');
    content.visibleText = [...new Set(headings.concat(paragraphs).filter(t => t.length > 3).slice(0, 15))];
    content.dataPoints = dataPoints;
    content.tableData = tableData;
    content.listItems = [...new Set(listItems)];
    content.actions = [...new Set(actions)];
  } catch (e) {
    // Silent fail - use basic content
    console.log('Page extraction error:', e.message);
  }
  
  return content;
}

async function fetchOllamaAISuggestions() {
  if (!OLLAMA_ENABLED || !AGENT_CONTEXT) return null;
  
  try {
    // Get comprehensive page content
    const pageContent = extractPageContent();
    
    // Build rich context object
    const contextObject = {
      page: AGENT_CONTEXT.currentPage,
      pageTitle: pageContent.pageTitle,
      pageContext: pageContent.pageContext,
      visibleContent: pageContent.visibleText.slice(0, 8),
      metrics: pageContent.dataPoints.map(d => `${d.title}: ${d.value}`).slice(0, 5),
      tables: pageContent.tableData.length > 0 ? `Table with ${pageContent.tableData[0].rows.length} rows` : 'None',
      lists: pageContent.listItems.slice(0, 3),
      errors: AGENT_CONTEXT.visibleErrors || [],
      lastAction: AGENT_CONTEXT.lastAction?.type || 'Page viewed',
      activeModal: AGENT_CONTEXT.activeModal || 'None'
    };
    
    // Build comprehensive prompt
    const prompt = `You are FreshFold AI Assistant - an expert in laundry management optimization. 
Your role: Analyze the user's current page and context, then suggest 2-3 SPECIFIC, actionable improvements.

PAGE ANALYSIS:
Page Name: ${pageContent.page}
Page Type: ${pageContent.pageContext}
Page Title: ${pageContent.pageTitle}

VISIBLE CONTENT:
- Main sections: ${pageContent.visibleText.slice(0, 5).join(' | ')}
- Key metrics: ${pageContent.dataPoints.map(d => d.title + (d.value ? ': ' + d.value : '')).slice(0, 4).join(' | ')}
- Available actions: ${pageContent.actions.slice(0, 6).join(', ')}
${pageContent.listItems.length > 0 ? `- Important items: ${pageContent.listItems.slice(0, 3).join(', ')}` : ''}

CONTEXT:
- Last action: ${contextObject.lastAction}
- Current modal: ${contextObject.activeModal}
- Errors: ${contextObject.errors.length > 0 ? contextObject.errors.join(', ') : 'None'}

TASK: Based on this SPECIFIC page content and data, suggest 2-3 improvements or next actions the user should take.
Make suggestions DIRECTLY RELEVANT to what's visible on this exact page.
Format as JSON array: [{"icon": "emoji", "title": "short title", "text": "brief explanation"}]

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations. Start with [ and end with ].`;

    const response = await fetch(`${OLLAMA_API}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.4,
        top_p: 0.9,
        top_k: 40
      })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    
    const data = await response.json();
    const responseText = data.response || '';
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : null;
    }
    
    return null;
  } catch (err) {
    console.log('Ollama unavailable:', err.message);
    return null;
  }
}

async function askOllamaQuestion(question) {
  if (!OLLAMA_ENABLED || !AGENT_CONTEXT) return null;
  
  try {
    const contextSnapshot = generateContextSnapshot('object');
    const prompt = `You are an expert FreshFold laundry management assistant.
User question: "${question}"

Current context:
${JSON.stringify(contextSnapshot, null, 2)}

Provide a helpful, concise response (1-2 sentences). Be specific and actionable.`;
    
    const response = await fetch(`${OLLAMA_API}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.3
      })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    
    const data = await response.json();
    return data.response || 'No response from AI';
  } catch (err) {
    console.log('Ollama question failed:', err.message);
    return null;
  }
}

function refreshAIAssistantSuggestions() {
  const suggestionsContainer = document.getElementById('ai-assistant-suggestions');
  const loadingState = document.getElementById('ai-assistant-loading');
  
  if (!suggestionsContainer) return;
  
  // Show loading state
  loadingState.style.display = 'flex';
  suggestionsContainer.innerHTML = '';
  
  // Try Ollama first, fallback to static suggestions
  if (OLLAMA_ENABLED) {
    fetchOllamaAISuggestions()
      .then(suggestions => {
        if (suggestions && suggestions.length > 0) {
          renderSuggestions(suggestions);
        } else {
          loadStaticSuggestions();
        }
      })
      .catch(err => {
        console.log('Ollama fetch failed:', err.message);
        loadStaticSuggestions();
      });
  } else {
    loadStaticSuggestions();
  }
  
  function loadStaticSuggestions() {
    setTimeout(() => {
      const suggestions = generateAISuggestions();
      renderSuggestions(suggestions);
    }, 300);
  }
  
  function renderSuggestions(suggestions) {
    suggestionsContainer.innerHTML = suggestions.map(s => `
      <div class="ai-suggestion-item">
        <span class="ai-suggestion-item-icon">${s.icon}</span>
        <span class="ai-suggestion-item-title">${s.title}</span>
        <span class="ai-suggestion-item-text">${s.text}</span>
      </div>
    `).join('');
    loadingState.style.display = 'none';
  }
}

// ─── LANGGRAPH AGENT INTEGRATION ─────────────────────────────────────────────
// Multi-turn conversations with stateful agent, tool-use, and memory

const LANGGRAPH_API = 'http://localhost:3002/api';
let LANGGRAPH_SESSION_ID = null;
let LANGGRAPH_ENABLED = true;

function initializeLangGraphSession() {
  if (!LANGGRAPH_SESSION_ID) {
    LANGGRAPH_SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return LANGGRAPH_SESSION_ID;
}

async function sendToLangGraphAgent(userMessage, page = null) {
  if (!LANGGRAPH_ENABLED || !LANGGRAPH_SESSION_ID) {
    console.log('LangGraph not initialized');
    return null;
  }
  
  try {
    const response = await fetch(`${LANGGRAPH_API}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: LANGGRAPH_SESSION_ID,
        message: userMessage,
        page: page || AGENT_CONTEXT.currentPage,
        context: {
          currentPage: AGENT_CONTEXT.currentPage,
          visibleErrors: AGENT_CONTEXT.visibleErrors,
          lastAction: AGENT_CONTEXT.lastAction?.type
        }
      })
    });
    
    if (!response.ok) throw new Error(`LangGraph API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.error) {
      console.log('LangGraph error:', data.error);
      return null;
    }
    
    return {
      response: data.response,
      tools_used: data.tools_used || [],
      message_count: data.message_count,
      timestamp: data.timestamp
    };
  } catch (err) {
    console.log('LangGraph unavailable:', err.message);
    return null;
  }
}

async function callLangGraphTool(toolName, params) {
  if (!LANGGRAPH_ENABLED) return null;
  
  try {
    const response = await fetch(`${LANGGRAPH_API}/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: toolName,
        params: params
      })
    });
    
    if (!response.ok) throw new Error(`LangGraph tool error: ${response.status}`);
    
    const data = await response.json();
    return data.success ? data.result : null;
  } catch (err) {
    console.log('LangGraph tool call failed:', err.message);
    return null;
  }
}

function getConversationHistory() {
  if (!LANGGRAPH_SESSION_ID) return [];
  
  // In production: fetch from /api/conversations/{session_id}
  return {
    session_id: LANGGRAPH_SESSION_ID,
    timestamp: new Date().toISOString()
  };
}

// ─── CONVERSATION MODAL UI ──────────────────────────────────────────────────

function openConversation() {
  const modal = document.getElementById('conversation-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Focus on input
    setTimeout(() => {
      const input = document.getElementById('conversation-input');
      if (input) input.focus();
    }, 100);
  }
}

function closeConversation() {
  const modal = document.getElementById('conversation-modal');
  if (modal) modal.classList.add('hidden');
}

function addMessageToHistory(role, content) {
  const history = document.getElementById('conversation-history');
  if (!history) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    display: flex;
    ${role === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
    margin: 8px 0;
  `;
  
  const msgBubble = document.createElement('div');
  msgBubble.style.cssText = `
    max-width: 80%;
    padding: 10px 12px;
    border-radius: 12px;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.4;
    ${role === 'user' 
      ? 'background: #6366f1; color: white; border-radius: 12px 4px 12px 12px;'
      : 'background: #f3f4f6; color: #1f2937; border-radius: 4px 12px 12px 12px;'
    }
  `;
  
  msgBubble.textContent = content;
  messageDiv.appendChild(msgBubble);
  history.appendChild(messageDiv);
  
  // Scroll to bottom
  history.scrollTop = history.scrollHeight;
}

async function sendConversationMessage() {
  const input = document.getElementById('conversation-input');
  const message = (input?.value || '').trim();
  
  if (!message) return;
  
  // Show user message
  addMessageToHistory('user', message);
  input.value = '';
  
  // Get AI response
  const response = await sendToLangGraphAgent(message);
  
  if (response) {
    addMessageToHistory('assistant', response.response);
    
    // Log tools used
    if (response.tools_used && response.tools_used.length > 0) {
      console.log(`🔧 Tools used: ${response.tools_used.join(', ')}`);
    }
  } else {
    addMessageToHistory('assistant', '❌ Unable to get response. Please try again.');
  }
}

// ─── SETTINGS ENGINE ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  voice: {
    enabled: true,
    speed: 'normal',
    categories: { orders: true, driver: true, payments: true, alerts: true, promos: false, updates: true }
  },
  toast: {
    enabled: true,
    categories: { orders: true, driver: true, payments: true, alerts: true, promos: true, updates: true }
  }
};

let settings = (() => {
  try {
    const saved = localStorage.getItem('ff_settings');
    if (saved) {
      const p = JSON.parse(saved);
      return {
        voice: { ...DEFAULT_SETTINGS.voice, ...p.voice,
          categories: { ...DEFAULT_SETTINGS.voice.categories, ...(p.voice || {}).categories } },
        toast: { ...DEFAULT_SETTINGS.toast, ...p.toast,
          categories: { ...DEFAULT_SETTINGS.toast.categories, ...(p.toast || {}).categories } },
      };
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
})();

function saveSettings() {
  localStorage.setItem('ff_settings', JSON.stringify(settings));
  const ind = document.getElementById('saved-indicator');
  if (!ind) return;
  ind.textContent = '✓ Saved';
  setTimeout(() => { ind.textContent = ''; }, 2000);
}

function canToast(cat) {
  // Master notifications toggle takes priority
  if (!window.NOTIFICATIONS_ENABLED) return false;
  if (!settings.toast.enabled) return false;
  return settings.toast.categories[cat] === true;
}
function canSpeak(cat) {
  // Master notifications toggle takes priority
  if (!window.NOTIFICATIONS_ENABLED) return false;
  if (!settings.voice.enabled) return false;
  return settings.voice.categories[cat] === true;
}
function getSpeedRate() {
  return { slow: 0.82, normal: 0.94, fast: 1.1 }[settings.voice.speed] || 0.94;
}

// ─── VOICE ENGINE ─────────────────────────────────────────────────────────────
let _preferredVoice = null;
if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => { _preferredVoice = null; });
}

function getBestVoice() {
  if (_preferredVoice) return _preferredVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority 1: high-quality online voices (when internet available)
  const onlinePriority = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Google UK English Female',
    'Google US English',
  ];
  for (const name of onlinePriority) {
    const v = voices.find(v => v.name === name);
    if (v) { _preferredVoice = v; return v; }
  }

  // Priority 2: offline local voices (espeak-ng, macOS built-in, Windows Desktop)
  const offlinePriority = [
    'Samantha', 'Karen', 'Moira', 'Victoria',           // macOS offline
    'Microsoft Zira Desktop - English (United States)',   // Windows offline
    'Microsoft David Desktop - English (United States)',
    'eSpeak NG English',                                  // Linux espeak-ng
    'English (Great Britain)',
    'English',
  ];
  for (const name of offlinePriority) {
    const v = voices.find(v => v.name.includes(name));
    if (v) { _preferredVoice = v; return v; }
  }

  // Priority 3: any local English voice (espeak-ng will appear here on Linux)
  const local = voices.find(v => v.localService && v.lang.startsWith('en'));
  if (local) { _preferredVoice = local; return local; }

  // Priority 4: any English voice at all
  const anyEn = voices.find(v => v.lang.startsWith('en'));
  if (anyEn) { _preferredVoice = anyEn; return anyEn; }

  return voices[0] || null;
}

// ─── OFFLINE TTS ENGINE (Piper neural voice on port 3001) ────────────────────
// All speech goes through the local Piper server — 100% offline, no internet.
// Falls back to Web Speech API only if Piper server is not running.

const PIPER_URL    = 'http://localhost:3001/speak';
let   _piperOnline = null; // null = unchecked, true = available, false = unavailable
let   _ttsQueue    = [];
let   _ttsBusy     = false;

// Check if Piper server is alive (cached after first check)
async function _checkPiper() {
  if (_piperOnline !== null) return _piperOnline;
  try {
    const r = await fetch(PIPER_URL, { method:'OPTIONS', signal: AbortSignal.timeout(800) });
    _piperOnline = r.ok || r.status === 200 || r.status === 405;
  } catch { _piperOnline = false; }
  return _piperOnline;
}

// Pre-process text — expand abbreviations so Piper reads them correctly
function _humanise(text) {
  return text
    .replace(/—/g, ', ')
    .replace(/ - /g, ', ')
    .replace(/\bFF-?(\d+)/g, 'order $1')
    .replace(/\bUPI\b/g, 'U P I')
    .replace(/\b(\d+)%/g, '$1 percent')
    .replace(/₹(\d+(?:,\d+)*)/g, (_, n) => 'rupees ' + n.replace(/,/g,''))
    .replace(/\bkm\b/gi, 'kilometres')
    .replace(/\bkg\b/gi, 'kilos')
    .replace(/([.!?])([A-Z])/g, '$1 $2');
}

// Play WAV bytes via Web Audio API (no <audio> element needed)
async function _playWav(arrayBuffer) {
  const ctx    = new (window.AudioContext || window.webkitAudioContext)();
  const decoded= await ctx.decodeAudioData(arrayBuffer);
  const src    = ctx.createBufferSource();
  src.buffer   = decoded;
  src.connect(ctx.destination);
  return new Promise(resolve => {
    src.onended = () => { ctx.close(); resolve(); };
    src.start(0);
  });
}

// Drain the TTS queue one item at a time
async function _drainQueue() {
  if (_ttsBusy || _ttsQueue.length === 0) return;
  _ttsBusy = true;
  const text = _ttsQueue.shift();
  try {
    const online = await _checkPiper();
    if (online) {
      const res = await fetch(PIPER_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
        signal:  AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        await _playWav(buf);
        _ttsBusy = false; _drainQueue(); return;
      }
    }
  } catch { /* fall through to Web Speech */ }

  // Fallback: Web Speech API (espeak-ng on Linux)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter  = new SpeechSynthesisUtterance(text);
    const voice  = getBestVoice();
    if (voice) utter.voice = voice;
    utter.rate  = getSpeedRate();
    utter.pitch = 1.05;
    utter.onend = () => { _ttsBusy = false; _drainQueue(); };
    window.speechSynthesis.speak(utter);
  } else {
    _ttsBusy = false; _drainQueue();
  }
}

function _tts(text) {
  const processed = _humanise(text);
  // Limit queue to 1 pending item: if one is already playing + one waiting, drop extras
  // This prevents audio pile-up when events fire faster than Piper synthesises
  if (_ttsQueue.length >= 1) return;
  _ttsQueue.push(processed);
  _drainQueue();
}

function speak(text, cat) {
  if (!canSpeak(cat || 'updates')) return;
  _tts(text);
}

function speakDirect(text) {
  if (!settings.voice.enabled) return;
  _tts(text);
}

function testVoice() {
  const nameEl    = document.getElementById('f-name');
  const firstName = (nameEl && nameEl.value.trim().split(' ')[0]) || 'Admin';
  _tts(`Hey ${firstName}! This is your FreshFold AI assistant. I'll keep you updated on orders, driver locations, inventory alerts, and all key business events in real time. Use the toggles to control exactly what I announce.`);
}

// ─── SOUNDBOX (Paytm-style full-screen badge) ─────────────────────────────────
function showSoundbox(text, speechText) {
  const badge = document.getElementById('soundbox-badge');
  const label = document.getElementById('soundbox-text');
  label.textContent = text;
  badge.classList.remove('hidden');
  requestAnimationFrame(() => badge.classList.add('show'));
  soundPaytm();
  if (speechText) setTimeout(() => speakDirect(speechText), 850);
  setTimeout(() => {
    badge.classList.remove('show');
    setTimeout(() => badge.classList.add('hidden'), 400);
  }, 3200);
}

// ─── SETTINGS DRAWER UI ───────────────────────────────────────────────────────
function openSettings() {
  soundClick();
  updateAgentContext('modal_opened', 'HIGH', { modal: 'settings-drawer' });
  
  const drawer  = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-overlay');
  if (!drawer || !overlay) return;
  overlay.classList.remove('hidden');
  drawer.classList.add('open');
  syncSettingsUI();
}

function closeSettings() {
  soundClick();
  updateAgentContext('modal_closed', 'HIGH', { modal: 'settings-drawer' });
  
  const drawer  = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-overlay');
  if (drawer)  drawer.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
}

function syncSettingsUI() {
  // Sync master notifications toggle
  const nm = document.getElementById('toggle-notifications-master');
  if (nm) nm.checked = window.NOTIFICATIONS_ENABLED;
  
  const vm = document.getElementById('toggle-voice-master');
  const tm = document.getElementById('toggle-toast-master');
  if (vm) vm.checked = settings.voice.enabled;
  if (tm) tm.checked = settings.toast.enabled;

  const vo = document.getElementById('voice-options');
  const to = document.getElementById('toast-options');
  if (vo) vo.style.opacity = settings.voice.enabled ? '1' : '0.4';
  if (to) to.style.opacity = settings.toast.enabled ? '1' : '0.4';

  Object.keys(settings.voice.categories).forEach(cat => {
    const el = document.getElementById(`v-${cat}`);
    if (el) el.checked = settings.voice.categories[cat];
  });
  Object.keys(settings.toast.categories).forEach(cat => {
    const el = document.getElementById(`t-${cat}`);
    if (el) el.checked = settings.toast.categories[cat];
  });

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.speed === settings.voice.speed);
  });
}

function toggleMaster(type) {
  const el = document.getElementById(`toggle-${type}-master`);
  if (!el) return;
  settings[type].enabled = el.checked;
  const opts = document.getElementById(`${type}-options`);
  if (opts) opts.style.opacity = settings[type].enabled ? '1' : '0.4';
  saveSettings();
}

function toggleCat(type, cat) {
  const prefix = type === 'voice' ? 'v' : 't';
  const el = document.getElementById(`${prefix}-${cat}`);
  if (!el) return;
  settings[type].categories[cat] = el.checked;
  saveSettings();
}

function setSpeed(speed) {
  settings.voice.speed = speed;
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.speed === speed);
  });
  saveSettings();
}

function toggleNotifications() {
  const el = document.getElementById('toggle-notifications-master');
  if (!el) return;
  
  // Update global flag
  window.NOTIFICATIONS_ENABLED = el.checked;
  
  // Persist to localStorage
  localStorage.setItem('NOTIFICATIONS_ENABLED', el.checked);
  
  // Show confirmation toast
  if (el.checked) {
    console.log('%c✅ Notifications ENABLED', 'color: #10b981; font-weight: bold;');
  } else {
    console.log('%c🔇 Notifications DISABLED - All popups, toasts, sounds, and voice alerts are now silent', 'color: #ef4444; font-weight: bold;');
  }
}

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────────────────────
const ICONS = {
  success: 'fa-check-circle',
  warning: 'fa-exclamation-triangle',
  error:   'fa-times-circle',
  info:    'fa-info-circle',
};

function showToast(title, message, type = 'info', duration = 4500, cat = 'updates') {
  if (!canToast(cat)) return;
  
  updateAgentContext('notification_shown', 'HIGH', { 
    type, 
    title: title.substring(0, 50),
    category: cat 
  });
  
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${ICONS[type]} toast-icon"></i>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  soundNotif();

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── USER SESSION STATE — populated as user interacts ───────────────────────
const userState = {
  name:    '',
  service: '',
  orders:  0,
  lastOid: '',
};

// ─── FAKE AI ENGINE ──────────────────────────────────────────────────────────

// Generic summaries (used when user hasn't filled the form yet)
const AI_SUMMARIES_GENERIC = [
  "Based on aggregate data from 50,000+ FreshFold customers, households that schedule pickups on Monday or Thursday receive 22% faster processing. Splitting large loads into two smaller ones also cuts average turnaround from 24 hrs to just 16 hrs.",
  "Seasonal analysis shows fabric care needs are shifting — humidity this month is 18% above average, increasing drying time and mold risk. Pre-treating garments with a light anti-mildew spray before storage is highly recommended.",
  "Our pattern engine scanned 12,000 similar customer profiles: those who switch to a weekly subscription save an average of ₹342/month and get 1.6× faster pickup slots. Your estimated annual saving could reach ₹4,100.",
  "Water hardness in metro areas contributes to towel stiffness. Adding a fabric softener to your wash cycle can raise textile softness from 61/100 to an estimated 89/100 — a noticeable difference from the first wash.",
];

// Personalized summaries — use {name} and {service} placeholders
const AI_SUMMARIES_PERSONAL = [
  "{name}, your {service} orders trend highest on weekday mornings. Booking before 10 AM gives you a 31% higher chance of same-day delivery. You could save up to 45 minutes per week by pre-sorting clothes the night before pickup.",
  "{name}, based on your {service} preference, our AI predicts you generate approx. 5.8 kg of laundry per week — just above average. Switching to bi-weekly bulk pickups could save you ₹280/month without sacrificing freshness.",
  "For {service} orders like yours, {name}, the peak stain types are food and sweat — both treatable with a 20-min cold soak before drop-off. This single habit reduces re-wash rates by 78% and keeps your garments in Grade-A condition longer.",
  "{name}, customers who book {service} on Tuesdays experience an average 19% shorter wait time. Our drivers complete 40% fewer pickups that day, meaning more care per order. Consider shifting your schedule — you'd save roughly 2 hours a month.",
  "{name}, your selected service ({service}) qualifies for the FreshFold Premium upgrade at just ₹40 more per order. AI analysis shows Premium customers report 94% garment satisfaction vs 76% on Basic — worth it for your fabric types.",
];

const AI_STATS = [
  { label: "Wash Efficiency", val: "94%",  icon: "fa-chart-line" },
  { label: "Avg Turnaround",  val: "19h",   icon: "fa-clock" },
  { label: "Fabric Score",    val: "A",     icon: "fa-award" },
  { label: "Weekly Orders",   val: "1,241", icon: "fa-box" },
  { label: "Cost Saved",      val: "₹318",  icon: "fa-rupee-sign" },
  { label: "On-Time Rate",    val: "98.4%", icon: "fa-check" },
  { label: "Eco Index",       val: "87/100",icon: "fa-leaf" },
  { label: "Garments Cleaned",val: "4,832", icon: "fa-tshirt" },
];

const ROTATING_INSIGHTS = [
  "Cotton fabrics show 34% longer lifespan with cold-wash cycles.",
  "Monday bookings get 22% faster processing than Friday bookings.",
  "Wool garments last 3× longer when dry-cleaned professionally.",
  "Customers who pre-sort laundry save avg. 18 min per wash cycle.",
  "Synthetic fabrics release 15% fewer micro-plastics with slow-spin cycles.",
  "Spring season increases delicate-fabric orders by 31% in metro cities.",
  "Express orders have a 97.8% on-time delivery rate at FreshFold.",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function openAIModal(source) {
  soundClick();
  updateAgentContext('modal_opened', 'CRITICAL', { modal: 'ai-modal', source });
  
  // snapshot form values if old booking form exists
  const nameEl    = document.getElementById('f-name');
  const serviceEl = document.getElementById('f-service');
  if (nameEl    && nameEl.value.trim())    userState.name    = nameEl.value.trim().split(' ')[0];
  if (serviceEl && serviceEl.value.trim()) userState.service = serviceEl.value.trim();
  // Use DB context when available (dashboard mode)
  if (typeof DB !== 'undefined' && source && source !== 'fab') {
    const ctx = { dashboard:'Business Overview', orders:'Order Intelligence', inventory:'Inventory Health', staff:'Team Performance', analytics:'Revenue Analytics', topbar:'Full Report' };
    userState.service = ctx[source] || 'Dashboard Analysis';
  }

  document.getElementById('ai-modal').classList.remove('hidden');
  document.getElementById('ai-loader').classList.remove('hidden');
  document.getElementById('ai-content').classList.add('hidden');
  soundAI();
  const delay = 1400 + Math.random() * 800;
  setTimeout(() => renderAIInsights(), delay);
}

function closeAIModal() {
  soundClick();
  updateAgentContext('modal_closed', 'HIGH', { modal: 'ai-modal' });
  document.getElementById('ai-modal').classList.add('hidden');
}

function refreshAIInsights() {
  document.getElementById('ai-loader').classList.remove('hidden');
  document.getElementById('ai-content').classList.add('hidden');
  soundAI();
  const delay = 900 + Math.random() * 700;
  setTimeout(() => renderAIInsights(), delay);
}

function renderAIInsights() {
  // Pick personalised summary if we have user data, else generic
  let rawSummary;
  if (userState.name && userState.service) {
    rawSummary = pickRandom(AI_SUMMARIES_PERSONAL)
      .replace(/{name}/g,    userState.name)
      .replace(/{service}/g, userState.service);
  } else {
    rawSummary = pickRandom(AI_SUMMARIES_GENERIC);
  }

  // Build personalised stat cards based on service
  const serviceStats = buildServiceStats(userState.service);
  const stats = shuffle([...serviceStats, ...AI_STATS]).slice(0, 4);
  const tip   = buildPersonalTip(userState.service);

  // Greeting header
  const greeting = userState.name
    ? `<div class="ai-greeting">Hi <strong>${userState.name}</strong> — here's your personalised analysis</div>`
    : `<div class="ai-greeting">Here's your laundry intelligence report</div>`;

  document.getElementById('ai-summary-text').innerHTML = greeting + rawSummary;

  const statsGrid = document.getElementById('ai-stats-grid');
  statsGrid.innerHTML = stats.map(s => `
    <div class="ai-stat-item">
      <span class="ai-stat-label"><i class="fas ${s.icon}"></i> ${s.label}</span>
      <span class="ai-stat-val">${s.val}</span>
    </div>
  `).join('');

  document.getElementById('ai-tip-box').innerHTML =
    `<i class="fas fa-lightbulb" style="color:#f59e0b;font-size:18px;flex-shrink:0"></i> ${tip}`;

  document.getElementById('ai-loader').classList.add('hidden');
  document.getElementById('ai-content').classList.remove('hidden');
}

// ─── PERSONALISED STATS BY SERVICE ───────────────────────────────────────────
function buildServiceStats(service) {
  const base = {
    'Wash & Fold':   [{ label:'Avg Load Size',   val: (4+Math.random()*3).toFixed(1)+' kg', icon:'fa-weight-hanging' },
                     { label:'Time Saved/Week',  val: (40+Math.floor(Math.random()*25))+' min', icon:'fa-clock' }],
    'Dry Cleaning':  [{ label:'Garments/Order',  val: (3+Math.floor(Math.random()*4))+'',   icon:'fa-tshirt' },
                     { label:'Fabric Grade',     val: pickRandom(['A','A+','B+']),            icon:'fa-award' }],
    'Iron & Press':  [{ label:'Pieces/Order',    val: (8+Math.floor(Math.random()*7))+'',   icon:'fa-layer-group' },
                     { label:'Crease Score',     val: (92+Math.floor(Math.random()*7))+'%', icon:'fa-chart-bar' }],
    'Stain Removal': [{ label:'Success Rate',    val: (88+Math.floor(Math.random()*10))+'%',icon:'fa-magic' },
                     { label:'Treatments Done',  val: (2+Math.floor(Math.random()*3))+'',   icon:'fa-flask' }],
    'Shoe Cleaning': [{ label:'Pairs Cleaned',   val: (1+Math.floor(Math.random()*3))+'',   icon:'fa-shoe-prints' },
                     { label:'Odour Index',      val: 'A+',                                   icon:'fa-wind' }],
  };
  return base[service] || [];
}

// ─── PERSONALISED TIPS BY SERVICE ────────────────────────────────────────────
function buildPersonalTip(service) {
  const tips = {
    'Wash & Fold':   [
      '💡 Pre-sorting your load by colour takes 3 minutes but prevents 90% of colour-bleed issues.',
      '💡 Booking Wash & Fold twice a week instead of once keeps your wardrobe fresher and halves per-kg cost.',
      '💡 A mesh laundry bag for delicates in your Wash & Fold order reduces fabric snag damage by 65%.',
    ],
    'Dry Cleaning':  [
      '💡 Dry-cleaning wool garments quarterly — not just when visibly dirty — extends fibre life by 3×.',
      '💡 Storing dry-cleaned suits in breathable garment bags (not plastic) prevents yellowing over time.',
      '💡 Tell us the fabric type on each piece — our specialists apply different solvents for 40% better results.',
    ],
    'Iron & Press':  [
      '💡 Slightly damp clothes (10% moisture) iron 2× faster and come out crisper than bone-dry garments.',
      '💡 Grouping office shirts together in your order ensures our team uses the right temperature setting for each.',
      '💡 Regular ironing (every 1–2 wears) reduces collar fraying by up to 50% over a garment\'s lifetime.',
    ],
    'Stain Removal': [
      '💡 Blotting (not rubbing) a fresh stain within 5 minutes raises removal success from 60% to 92%.',
      '💡 Cold water is better than hot for protein-based stains — hot water sets them permanently into fibres.',
      '💡 Mentioning the stain type when booking lets us pre-treat before the main wash for best results.',
    ],
    'Shoe Cleaning': [
      '💡 Cleaning shoes every 2 weeks prevents sole oxidation — extending sole life by up to 18 months.',
      '💡 A quick brush-off before handing shoes to us removes surface debris that can scratch during deep clean.',
      '💡 Leather shoes last 40% longer with conditioning treatment after cleaning — add it to your next order.',
    ],
  };
  const pool = tips[service] || [
    '💡 Scheduling weekly pickups saves the average household ₹320/month compared to ad-hoc bookings.',
    '💡 Customers who leave clear instructions get 97% satisfaction vs 81% for those who don\'t.',
    '💡 Booking before 10 AM guarantees same-day pickup in most FreshFold service areas.',
  ];
  return pickRandom(pool);
}

// ─── ORDER TRACKING ──────────────────────────────────────────────────────────

const TRACK_STATUSES = [
  { label: "Order Placed",      time: "Today, 9:02 AM",  done: true  },
  { label: "Pickup Scheduled",  time: "Today, 9:15 AM",  done: true  },
  { label: "Picked Up",         time: "Today, 10:30 AM", done: true  },
  { label: "In Cleaning",       time: "Today, 11:45 AM", done: false, active: true },
  { label: "Quality Check",     time: "Estimated 4:00 PM",done: false },
  { label: "Out for Delivery",  time: "Estimated 6:00 PM",done: false },
  { label: "Delivered",         time: "Estimated 7:30 PM",done: false },
];

function openTrackModal() {
  soundClick();
  updateAgentContext('modal_opened', 'HIGH', { modal: 'track-modal' });
  
  document.getElementById('track-modal').classList.remove('hidden');
  document.getElementById('track-result').classList.add('hidden');
  document.getElementById('track-input').value = '';
}

function closeTrackModal() {
  soundClick();
  updateAgentContext('modal_closed', 'MEDIUM', { modal: 'track-modal' });
  
  document.getElementById('track-modal').classList.add('hidden');
}

function trackOrder() {
  const val = document.getElementById('track-input').value.trim();
  if (!val) {
    showToast('Enter Order ID', 'Please type your order ID to track.', 'warning');
    soundWarn();
    return;
  }
  soundAI();
  const result = document.getElementById('track-result');
  result.classList.remove('hidden');

  // Pick a random number of "done" steps (2–5) so it always looks different
  const doneCount = 2 + Math.floor(Math.random() * 4);
  const steps = TRACK_STATUSES.map((s, i) => ({
    ...s,
    done:   i < doneCount,
    active: i === doneCount,
  }));

  result.innerHTML = `
    <div style="font-weight:700;font-size:15px;margin-bottom:16px;color:#0f172a">
      <i class="fas fa-box" style="color:#2563eb"></i> Order #${val.toUpperCase()}
    </div>
    ${steps.map(s => `
      <div class="track-step">
        <div class="track-dot ${s.done ? 'done' : s.active ? 'active' : ''}"></div>
        <div>
          <div class="track-step-label" style="color:${s.done ? '#10b981' : s.active ? '#2563eb' : '#94a3b8'}">${s.label}</div>
          <div class="track-step-time">${s.time}</div>
        </div>
        ${s.done ? '<i class="fas fa-check" style="margin-left:auto;color:#10b981"></i>' : ''}
      </div>
    `).join('')}
  `;
}

// ─── ORDER FORM ──────────────────────────────────────────────────────────────
function submitOrder(e) {
  e.preventDefault();
  const name    = document.getElementById('f-name').value.trim();
  const service = document.getElementById('f-service').value;
  const firstName = name.split(' ')[0];

  // Save to userState for AI personalisation
  userState.name    = firstName;
  userState.service = service;
  userState.orders  += 1;

  // Generate random order ID
  const oid = 'FF-' + (2000 + Math.floor(Math.random() * 900));
  userState.lastOid = oid;

  // Soundbox + speak (Paytm-style)
  const confirmSpeech = `You're all booked, ${firstName}! Your ${service} pickup's confirmed, and your order number is ${oid.replace('-', ' ')}. We'll keep you posted every step of the way, so just sit back and relax!`;
  showSoundbox(`Order Confirmed!\n${oid}`, confirmSpeech);

  showToast('Pickup Confirmed!', `Hey ${firstName}! Your ${service} pickup is booked. ID: ${oid}`, 'success', 6000, 'orders');

  document.getElementById('order-form').reset();
  setDateMin();

  setTimeout(() => {
    const driverNames = ['Ramesh Kumar', 'Suresh Patel', 'Anil Sharma', 'Vijay Singh'];
    const driver = pickRandom(driverNames);
    showToast('Driver Assigned', `${driver} will arrive for your pickup shortly.`, 'info', 4500, 'driver');
    speak(`Hey ${firstName}, just wanted to let you know, we've assigned ${driver} as your pickup driver! They're heading your way right now. You'll hear from me again when they're close!`, 'driver');
  }, 5000);

  setTimeout(() => {
    showToast('Driver Nearby', `${firstName}, your driver's almost there!`, 'info', 4500, 'driver');
    speak(`${firstName}, your driver's super close now, like less than two kilometres away! Maybe grab that bag and head towards the door? They'll be there before you know it.`, 'driver');
  }, 12000);

  setTimeout(() => {
    showToast('Pickup Complete!', `Clothes picked up! We're getting started on your ${service} now.`, 'success', 4500, 'orders');
    speak(`And we've got your clothes! Pickup's done, and we're getting straight into your ${service}. I'll let you know as soon as it's done and ready to come home!`, 'orders');
  }, 22000);
}

// ─── SERVICE SELECTION ───────────────────────────────────────────────────────
function selectService(card, name) {
  soundClick();
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('f-service').value = name;
  showToast('Service Selected', `${name} selected. Complete the form below to book.`, 'info', 3000);
  setTimeout(() => scrollToOrder(), 400);
}

// ─── PLAN SELECTION ──────────────────────────────────────────────────────────
function selectPlan(plan) {
  soundClick();
  showToast(`${plan} Plan Selected`, `Great choice! Scroll down to complete your booking.`, 'success', 3500);
  setTimeout(() => scrollToOrder(), 500);
}

// ─── SCROLL HELPERS ──────────────────────────────────────────────────────────
function scrollToOrder() {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// ─── MOBILE MENU ─────────────────────────────────────────────────────────────
function toggleMobileMenu() {
  soundClick();
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

// ─── AI LIVE METRICS (rotating in the AI preview card) ──────────────────────
const LIVE_METRICS = [
  { m1: '18.4 hrs', m2: '97.2%',  m3: '1,248', m4: 'A+' },
  { m1: '21.1 hrs', m2: '96.8%',  m3: '1,195', m4: 'A'  },
  { m1: '16.7 hrs', m2: '98.1%',  m3: '1,312', m4: 'A+' },
  { m1: '19.3 hrs', m2: '95.9%',  m3: '1,077', m4: 'B+' },
  { m1: '17.0 hrs', m2: '97.5%',  m3: '1,384', m4: 'A+' },
];

function updateLiveMetrics() {
  const m = pickRandom(LIVE_METRICS);
  const ids = ['m1','m2','m3','m4'];
  const vals = [m.m1, m.m2, m.m3, m.m4];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = vals[i]; el.style.opacity = '1'; el.style.transition = 'opacity .4s'; }, 300);
    }
  });
}

function updateRotatingInsight() {
  const el = document.getElementById('rotating-insight');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = pickRandom(ROTATING_INSIGHTS);
    el.style.opacity = '1';
    el.style.transition = 'opacity .5s';
  }, 300);
}

function updateLiveClock() {
  const el = document.getElementById('ai-live-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── RANDOM EXTERNAL EVENT NOTIFICATIONS ─────────────────────────────────────
// Simulates "external events" like a real platform would receive

const EXTERNAL_EVENTS = [
  { title: "New Order Received",   msg: "FF-2051 — Priya placed an order for Wash & Fold, 4.5 kg",    type: 'success', cat: 'orders',
    speech: "Priya placed an order for Wash and Fold.", soundbox: true, soundboxText: 'New Order!' },
  { title: "New Order Received",   msg: "FF-2055 — Rahul placed an order for Dry Cleaning, 3 shirts", type: 'success', cat: 'orders',
    speech: "Rahul placed an order for Dry Cleaning.", soundbox: true, soundboxText: 'New Order!' },
  { title: "New Order Received",   msg: "FF-2058 — Sunita placed an order for Iron & Press, 8 pieces",type: 'success', cat: 'orders',
    speech: "Sunita placed an order for Iron and Press.", soundbox: true, soundboxText: 'New Order!' },
  { title: "New Order Received",   msg: "FF-2061 — Amit placed an order for Stain Removal, 2 items",  type: 'success', cat: 'orders',
    speech: "Amit placed an order for Stain Removal.", soundbox: true, soundboxText: 'New Order!' },
  { title: "New Order Received",   msg: "FF-2063 — Meena placed an order for Wash & Fold, 6 kg",      type: 'success', cat: 'orders',
    speech: "Meena placed an order for Wash and Fold.", soundbox: true, soundboxText: 'New Order!' },
  { title: "Payment Received",     msg: "₹348 received from Priya — order FF-2048 via UPI",           type: 'success', cat: 'payments',
    speech: "Priya paid three hundred and forty eight rupees.", soundbox: true, soundboxText: '₹348 Received!' },
  { title: "Payment Received",     msg: "₹520 received from Rahul — order FF-2055 via cash",          type: 'success', cat: 'payments',
    speech: "Rahul paid five hundred and twenty rupees.", soundbox: true, soundboxText: '₹520 Received!' },
  { title: "Pickup Completed",     msg: "Driver Suresh completed pickup for FF-2049",                  type: 'info',    cat: 'driver',
    speech: "Pickup done. Suresh collected the clothes and they're heading to the facility." },
  { title: "Order Delivered",      msg: "FF-2044 delivered to Anita, Indiranagar. ⭐ 5 stars!",        type: 'success', cat: 'updates',
    speech: "Order delivered to Anita. She gave five stars!" },
  { title: "Stain Alert",          msg: "FF-2050: Stubborn wine stain detected — specialist assigned", type: 'warning', cat: 'alerts',
    speech: "Quick heads up. A stubborn stain was found on order FF-2050. A specialist has been assigned." },
  { title: "Flash Deal Live!",     msg: "20% OFF Dry Cleaning — next 3 hours only!",                  type: 'info',    cat: 'promos',
    speech: "Dry cleaning is now twenty percent off for the next three hours." },
  { title: "New 5-Star Review",    msg: 'Rohit gave 5 stars: "Exceptional service, as always!"',      type: 'success', cat: 'updates',
    speech: "New five star review from Rohit. Exceptional service, as always." },
  { title: "Pickup Delay Alert",   msg: "Driver ETA for FF-2053 is 15 min later due to traffic",      type: 'warning', cat: 'alerts',
    speech: "Pickup delay alert. The driver is fifteen minutes behind schedule due to traffic." },
  { title: "Quality Check Passed", msg: "FF-2046 passed quality inspection. Out for delivery soon.",  type: 'success', cat: 'updates',
    speech: "Order FF-2046 passed quality check and is out for delivery." },
];

let eventIndex = 0;
function fireRandomEvent() {
  const events = shuffle(EXTERNAL_EVENTS);
  const ev = events[eventIndex % events.length];
  eventIndex++;
  showToast(ev.title, ev.msg, ev.type, 5000, ev.cat);
  if (ev.speech) setTimeout(() => speak(ev.speech, ev.cat), 400);
  if (ev.soundbox && canToast(ev.cat)) setTimeout(() => showSoundbox(ev.soundboxText || ev.title, null), 600);
}

// ─── SET DATE MIN ON FORM ────────────────────────────────────────────────────
function setDateMin() {
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // ─── Apply Dev Mode Styling ────────────────────────────────────────────
  if (window.DEV_MODE) {
    document.body.classList.add('dev-mode');
    console.log('%c🔧 DEVELOPER MODE ENABLED', 'color: #6366f1; font-size: 14px; font-weight: bold;');
    console.log('%cDebug Sidebar: ?dev parameter or localStorage', 'color: #818cf8;');
    console.log('%cTelemetry Logging: All infrastructure systems visible', 'color: #818cf8;');
  }
  
  // ─── Initialize Telemetry System ─────────────────────────────────────────
  _initializeAgentContext();
  updateAgentContext('app_initialized', 'CRITICAL', { page: AGENT_CONTEXT.currentPage });
  
  // ─── Initialize Debug Sidebar ───────────────────────────────────────────
  initializeDebugSidebar();
  
  // ─── Initialize LangGraph Agent Session ──────────────────────────────────
  initializeLangGraphSession();
  console.log(`%c🤖 LangGraph Agent initialized (Session: ${LANGGRAPH_SESSION_ID})`, 'color: #8b5cf6; font-size: 12px;');
  
  setDateMin();

  // ─── Smart Input Tracking (blur, submit, enter key) ───────────────────
  document.addEventListener('blur', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      updateAgentContext('element_blur', 'MEDIUM', { 
        element: e.target.id || e.target.name || e.target.tagName,
        value: e.target.value ? '[VALUE]' : '' 
      });
    }
  }, true);
  
  document.addEventListener('submit', (e) => {
    updateAgentContext('form_submitted', 'CRITICAL', { 
      formId: e.target.id || 'unnamed',
      fields: e.target.querySelectorAll('input, textarea, select').length 
    });
  }, true);
  
  document.addEventListener('keydown', (e) => {
    if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.key === 'Enter') {
      updateAgentContext('enter_pressed', 'MEDIUM', { 
        element: e.target.id || e.target.name,
        type: e.target.type 
      });
    }
  }, true);

  // ─── Global Click Tracking ───────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button, a, [role="button"]');
    if (button && !button.classList.contains('hidden')) {
      const buttonInfo = {
        text: button.textContent?.trim().substring(0, 50),
        id: button.id,
        class: button.className?.substring(0, 100)
      };
      updateAgentContext('button_clicked', 'MEDIUM', buttonInfo);
    }
  }, true);

  // Live clock & metrics
  setInterval(updateLiveClock, 1000);
  setInterval(updateLiveMetrics, 6000);
  setInterval(updateRotatingInsight, 5000);

  // Random external event notifications every 8–18s (gated by NOTIFICATIONS_ENABLED)
  function scheduleNextEvent() {
    if (!window.NOTIFICATIONS_ENABLED) return; // Skip if notifications disabled
    
    const delay = 8000 + Math.random() * 10000;
    setTimeout(() => {
      fireRandomEvent();
      scheduleNextEvent();
    }, delay);
  }
  if (window.NOTIFICATIONS_ENABLED) {
    scheduleNextEvent();
  }

  // Welcome toast only (gated by NOTIFICATIONS_ENABLED)
  if (window.NOTIFICATIONS_ENABLED) {
    setTimeout(() => {
      showToast('FreshFold Dashboard', 'Good morning, Admin! AI engine is live — 3 inventory alerts detected.', 'info', 6000, 'updates');
    }, 1800);
  }

  // Sync settings UI state after DOM is ready
  syncSettingsUI();

  // Close modals on overlay click
  const aiModal = document.getElementById('ai-modal');
  if (aiModal) aiModal.addEventListener('click', function(e) {
    if (e.target === this) closeAIModal();
  });
  const trackModal = document.getElementById('track-modal');
  if (trackModal) trackModal.addEventListener('click', function(e) {
    if (e.target === this) closeTrackModal();
  });

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAIModal(); if(typeof closeTrackModal==='function') closeTrackModal(); closeSettings(); }
  });

  // Settings overlay click to close
  const settingsOverlay = document.getElementById('settings-overlay');
  if (settingsOverlay) settingsOverlay.addEventListener('click', closeSettings);
  
  // Initialize AI Assistant with initial suggestions
  setTimeout(() => {
    refreshAIAssistantSuggestions();
  }, 1200);
});
