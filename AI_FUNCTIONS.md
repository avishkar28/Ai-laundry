# FreshFold — AI Engine & Functions Documentation

---

## Overview

FreshFold's AI system is a **fully offline, zero-cost intelligence engine** built entirely in JavaScript. It does not call any external API, does not use OpenAI, Claude, or any cloud LLM. Every "AI" output is produced by reading real data from the in-memory database (`DB`), running arithmetic and rule-based logic on it, and wrapping the results in natural analyst language.

The AI engine runs in the browser on `localhost`. No internet connection is required at any point.

---

## 1. Core Philosophy

> **"Real data + smart templates = analyst-quality output"**

Instead of a language model, FreshFold uses:
- **Real DB values** (orders, inventory stock, staff stats, customer spend)
- **Arithmetic scoring formulas** (percentages, averages, projections)
- **Template strings** with data injected at runtime
- **Randomised variance** (small ± jitter) to simulate model uncertainty and prevent identical outputs on every load

---

## 2. The Database (`DB`)

All AI functions read from a single in-memory JavaScript object called `DB`. It is defined at the top of `dashboard.js` and contains:

| Key | Contents |
|---|---|
| `DB.orders` | 15 orders — customer, service, amount, status, date, rating, area |
| `DB.inventory` | 8 inventory items — stock, max, dailyUsage, cost, category |
| `DB.staff` | 6 staff members — role, pickups/items/checks, rating, onTime, shift |
| `DB.weeklyRevenue` | 7 daily revenue figures (Mon–Sun) |
| `DB.weekDays` | Day labels array |
| `DB.aiHubFeed` | Live feed entries (populated at runtime) |

---

## 3. AI Functions Reference

---

### `aiInventoryAnalyze(item)`
**Purpose:** Scores a single inventory item and generates a reorder recommendation.

**Inputs:** One inventory item object from `DB.inventory`

**Calculations:**
- `pct = item.stock / item.max` — stock as a fraction
- `daysLeft = Math.max(0, round(item.stock / item.dailyUsage))` — days until empty
- `urgency` — derived from `pct`:
  - below 0.15 → `"critical"`
  - 0.15–0.35 → `"warning"`
  - 0.35–0.60 → `"moderate"`
  - above 0.60 → `"good"`
- `reorderQty = ceil((item.max − item.stock) × 0.9)` — 90% of deficit
- `conf = round((0.86 ± 0.06) × 100)` — confidence with jitter

**Output:** Extended item object with `{ pct, daysLeft, urgency, reorderQty, conf, aiReason }`

**Used in:** Inventory page cards, Dashboard smart alerts, AI Hub Inventory module, Dashboard KPI badges

---

### `aiOrderRisk(order)`
**Purpose:** Calculates a risk score (0–96) for an individual order.

**Scoring rules:**
| Condition | Points added |
|---|---|
| Service = Stain Removal | +32 |
| Service = Dry Cleaning | +18 |
| Service = Shoe Cleaning | +12 |
| Status = pending | +22 |
| Weight > 6 kg | +10 |
| Random variance | +0 to +18 |

**Output:** Integer 0–96

**Used in:** Orders table AI Risk column, AI Hub Order Risk module, Dashboard smart alerts

---

### `aiRiskLabel(risk)`
**Purpose:** Converts a numeric risk score into a display label and CSS class.

| Score | Label | Class |
|---|---|---|
| 65+ | High | `risk-high` |
| 35–64 | Medium | `risk-medium` |
| below 35 | Low | `risk-low` |

---

### `aiScoreStaff(staff)`
**Purpose:** Calculates a performance score (58–99) for a staff member.

**Formula by role:**

- **Driver:** `(pickups/55 × 40) + ((rating−3.5)/1.5 × 30) + (onTime/100 × 30)`
- **Cleaner:** `(items/260 × 40) + ((rating−3.5)/1.5 × 30) + (onTime/100 × 30)`
- **QC Specialist:** `(checks/95 × 40) + ((rating−3.5)/1.5 × 30) + (onTime/100 × 30)`

Result is clamped: `Math.min(99, Math.max(58, score))`

**Used in:** Staff page cards, AI Hub Staff Performance module

---

### `aiStaffLabel(score)`
**Purpose:** Maps a staff score to a performance tier label.

| Score | Label | CSS Class |
|---|---|---|
| 92+ | Elite Performer | `perf-elite` |
| 80–91 | Top Performer | `perf-top` |
| 68–79 | Steady Performer | `perf-avg` |
| below 68 | Needs Coaching | `perf-low` |

---

### `aiDashboardBriefing()`
**Purpose:** Generates the AI Daily Briefing text shown in the dashboard banner.

**Process:**
1. Reads today's orders from `DB.orders` filtered by `date === '2026-05-04'`
2. Calculates: `totalRev`, `pending`, `delivered`, `topService`, `peakHour`, `lowStock`
3. Assembles 5 possible insight lines using real numbers
4. Randomly picks 2 non-duplicate lines and joins them into one paragraph

**Output:** A 2-sentence briefing string rendered with typewriter animation

---

### `aiPredictions()`
**Purpose:** Generates the 4 AI Prediction cards on the Dashboard.

**Returns 4 cards:**
1. **Peak Hours Today** — picks from [14, 15, 16] randomly, confidence 84–94%
2. **Inventory Status** — reads most critical inventory item from `aiInventoryAnalyze`, confidence 93%
3. **Revenue Forecast** — `weeklyAvg × random factor`, confidence 76–88%
4. **Demand vs Yesterday** — random +3 to +12% change, confidence 81–92%

---

### `aiAnalyticsInsights(range)`
**Purpose:** Generates the 3 rotating written observations on the Analytics page.

**Process:** Shuffles a pool of 7 hardcoded analyst-style insights (each referencing real calculated values like best day, revenue, service patterns, area stats) and returns 3 randomly selected ones.

**Example output:**
> "Saturday was your strongest revenue day at ₹8,420. AI attributes this to corporate Dry Cleaning batch orders arriving Thursday evenings."

---

### `aiRevenueForecast()`
**Purpose:** Generates the next 7-day revenue forecast chart data.

**Process:**
- Calculates `avg` from current week's revenue
- Applies day-type multipliers:
  - Thursday/Saturday → `peak` (1.12–1.30× avg)
  - Tuesday/Sunday → `low` (0.42–0.86× avg)
  - Other days → `normal` (0.88–1.05× avg)
- Adds random variance per day

**Output:** Array of `{ day, val, type }` objects + `{ weekTotal, maxVal, avg }`

---

### `aiAnomalyDetect()`
**Purpose:** Returns a list of 3 pre-defined anomaly observations for the Analytics page.

**Fixed anomalies returned:**
1. **High (91%)** — Revenue dip: Tuesday 2–4 PM — zero orders for 3 consecutive Tuesdays
2. **Medium (78%)** — Cancellation spike — 3.1× above 30-day average on Wednesday
3. **Low (82%)** — Delivery delay in Electronic City — 22% longer after 5 PM

These are static but presented with severity levels and confidence scores to simulate live detection.

---

### `aiCustomerLTV(customer)`
**Purpose:** Predicts a customer's lifetime value in rupees.

**Formula:**
```
avgOrderValue = totalSpend / orders
growthFactor  = orders >= 5 ? 1.3 : orders >= 3 ? 1.15 : 1.0
LTV           = avgOrderValue × orders × growthFactor × 1.2
```

**Used in:** Customers page cards, AI Customer Intelligence banner, AI Hub Customer module

---

### `aiChurnRisk(customer)`
**Purpose:** Calculates a churn risk score (0–95) for a customer.

**Scoring rules:**
| Condition | Points added |
|---|---|
| Last order > 14 days ago | +40 |
| Last order 7–14 days ago | +20 |
| Only 1 order | +35 |
| Only 2 orders | +18 |
| No rating given | +12 |
| Rating below 4 stars | +22 |
| Random variance | +0 to +8 |

---

### `aiCustomerSegment(customer)`
**Purpose:** Assigns a customer to one of 5 segments based on LTV and churn risk. Rules are checked in order — first match wins.

| Rule | Segment |
|---|---|
| LTV > ₹2,800 AND churn < 30% | 👑 VIP |
| orders >= 5 AND churn < 40% | ⭐ Loyal |
| churn > 60% | ⚠️ At Risk |
| orders <= 2 | 🌱 New |
| All others | ✅ Regular |

---

### `aiCustomerRetentionData()`
**Purpose:** Generates the Customer Retention AI panel on the Analytics page.

**Returns:**
- 5 customer segments with percentages (Champions, Loyal, At-Risk, New, Churned)
- `retentionRate` — 64–72% (random)
- `ltvAvg` — ₹1,240–₹1,560 (random)
- `repeatRate` — 58–70% (random)

---

### `aiHubModules()`
**Purpose:** Generates data for all 6 AI module cards on the AI Hub page.

**6 modules returned:**

| Module | Score Calculation |
|---|---|
| Revenue Intelligence | `(todayRevenue / 9000) × 100` |
| Demand Forecasting | Fixed 84 |
| Inventory Intelligence | Average stock % across all 8 items |
| Staff Performance AI | Average `aiScoreStaff()` across all staff |
| Order Risk Analysis | `(1 − cancelled/total) × 100` |
| Customer Intelligence | Fixed 91 |

Each module returns: `{ title, icon, color, score, scoreLabel, lines[], conf }`

---

### `aiTeamInsight()`
**Purpose:** Generates one rotating insight line for the Staff Management page banner.

**Pool of 4 options (randomly picked):**
1. Top scorer name + score + assignment recommendation
2. Team average on-time rate vs 95% target
3. Lowest scorer name + coaching recommendation
4. Evening shift on-time gap observation

---

### `_jitter(range)`
**Purpose:** Helper function that adds controlled randomness to AI outputs.

```javascript
function _jitter(range) {
  return (Math.random() * range * 2) - range;
}
```

Used in `aiInventoryAnalyze()` to vary the confidence score so it does not look hardcoded.

---

## 4. Text-to-Speech AI (Piper Engine)

The voice announcement system is a separate AI component from the analytics engine.

### How it works

1. An event fires in the app (payment received, order added, etc.)
2. The `speak(text, category)` function is called
3. Settings are checked — if the category is disabled, speech is silently skipped
4. Text goes through `_humanise(text)` — a pre-processor that expands abbreviations:
   - `FF-2042` → `"order 2042"`
   - `₹447` → `"rupees 447"`
   - `82%` → `"82 percent"`
   - `kg` → `"kilos"`, `km` → `"kilometres"`
5. The system checks if the Piper TTS server is alive at `http://localhost:3001/speak` (result is cached after first check)
6. **If Piper is online:** text is POSTed as JSON, Piper returns a WAV file, WAV is decoded and played through Web Audio API
7. **If Piper is offline:** falls back to Web Speech API (espeak-ng on Linux, system voices on macOS/Windows)

### Voice selection priority (fallback)
1. Microsoft Aria/Jenny/Guy Online (natural voices)
2. Google UK/US English
3. macOS offline voices (Samantha, Karen, Moira)
4. Windows Desktop voices (Microsoft Zira, David)
5. eSpeak NG English (Linux)
6. Any local English voice
7. Any English voice at all

### Queue system
A single queue (`_ttsQueue`) prevents announcements overlapping. Max 1 item can be pending at a time — extras are dropped to prevent audio pile-up when events fire faster than Piper synthesizes.

### Piper TTS Server (`tts_server.py`)
- Runs on `localhost:3001`
- Accepts `POST /speak` with `{ "text": "..." }` JSON body
- Uses the `en_US-amy-medium.onnx` neural voice model (offline, no internet)
- Returns a WAV audio file
- Handles CORS for browser requests

---

## 5. Sound Engine (Web Audio API)

All UI sounds are generated mathematically using the browser's Web Audio API. No sound files are loaded.

| Function | Sound | Used for |
|---|---|---|
| `soundClick()` | Soft 880 Hz sine, 80ms | All button clicks |
| `soundNotif()` | 660 Hz → 880 Hz two-note pop | Toast notifications appearing |
| `soundPaytm()` | C→E→G→C ascending chime (4 notes) | Payments, restocks, order confirmations |
| `soundWarn()` | Descending sawtooth 220→180 Hz | Warnings and errors |
| `soundAI()` | 4-bleep electronic sequence | AI modal opens, report generation |

---

## 6. AI Modal System

The AI Insights modal (`openAIModal(source)`) is context-aware — it adjusts its content based on which page opened it.

| Source | Context label set |
|---|---|
| `'dashboard'` | Business Overview |
| `'orders'` | Order Intelligence |
| `'inventory'` | Inventory Health |
| `'staff'` | Team Performance |
| `'analytics'` | Revenue Analytics |
| `'customers'` | Customer Intelligence |
| `'topbar'` or `'fab'` | Full Report |

**Loading animation:** Shows a three-dot loader for 1.4–2.2 seconds (random delay) before revealing content, simulating AI processing time.

**Regenerate button:** Re-runs `renderAIInsights()` with a new random delay (0.9–1.6s) and picks different summary text and stats from the pool.

---

## 7. Confidence Scores Explained

Every AI output in FreshFold carries a confidence percentage. These are not arbitrary — they follow consistent rules:

- **99%** — Calculations based on exact counted data (e.g., star rating count, feed entry confirmations)
- **91–94%** — Inventory analysis (deterministic math, high certainty)
- **85–92%** — Staff performance (score formula is deterministic, small variance)
- **80–88%** — Revenue and demand forecasts (weekly average + variance)
- **74–82%** — Anomaly detection and area-based predictions (pattern inference)

The jitter function ensures confidence values vary slightly on each page load to prevent outputs looking hardcoded.
