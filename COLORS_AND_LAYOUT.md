# FreshFold — Colors & Layout Documentation

---

## 1. Master Color Palette (CSS Root Variables)

Defined in `style.css` under `:root`. These variables are used throughout every page and component.

```css
--blue:    #2563eb   /* Primary action — buttons, links, active tabs */
--indigo:  #6366f1   /* Brand accent — logo, AI badges, active nav, confidence rings */
--sky:     #0ea5e9   /* Secondary blue — staff avatars, Order Risk module */
--purple:  #8b5cf6   /* Quality/analytics — KPI satisfaction, AI predictions */
--green:   #10b981   /* Success/positive — revenue, live dots, delivered status */
--orange:  #f59e0b   /* Warning/attention — pending, notification dots, low stock */
--red:     #ef4444   /* Critical/urgent — cancelled, critical inventory, Orders badge */
--dark:    #0f172a   /* Primary text + sidebar background */
--gray:    #64748b   /* Secondary text — subtitles, timestamps, column headers */
--light:   #f8fafc   /* Light backgrounds — table headers, inputs, search bar */
--white:   #ffffff   /* Card and modal backgrounds */
--border:  #e2e8f0   /* All borders, dividers, card outlines */
```

**Page background:** `#f1f5f9` — light blue-grey that makes white cards float visually.

**Border radius:** `14px` — applied to all cards, modals, and drawers.

---

## 2. Layout Structure

### Overall Page Layout

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed left)                     │
│  ┌───────────────────────────────────────────┐  │
│  │  MAIN WRAP (flex column, fills remainder) │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  TOP BAR (sticky, 60px height)      │  │  │
│  │  ├─────────────────────────────────────┤  │  │
│  │  │  CONTENT AREA (padding 24px)        │  │  │
│  │  │  (scrollable, flex-1)               │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- **Sidebar width:** `240px` (expanded) / `64px` (collapsed)
- **Top bar height:** `60px`, `position: sticky`, stays visible on scroll
- **Content area padding:** `24px` all sides
- **Z-index layers:** Sidebar `200`, Top bar `100`, Settings drawer `300`, Modals `1000+`

---

## 3. Sidebar Colors

| Element | Color | Hex |
|---|---|---|
| Sidebar background | Deep navy | `#0f172a` |
| Logo soap icon | Indigo | `#6366f1` |
| Logo "Fold" text | Indigo | `#6366f1` |
| Logo divider line | Subtle white | `rgba(255,255,255,0.07)` |
| Inactive nav text + icons | Cool grey | `#94a3b8` |
| Nav item hover background | Subtle white tint | `rgba(255,255,255,0.05)` |
| Active nav background | Indigo tint | `rgba(99,102,241,0.15)` |
| Active nav left border (3px) | Indigo | `#6366f1` |
| Active nav icon | Light indigo | `#818cf8` |
| Active nav text | White | `#ffffff` |
| Orders badge background | Red | `#ef4444` |
| Inventory badge background | Amber | `#f59e0b` |
| AI Hub pulse dot | Green | `#10b981` |
| AI Hub nav background (always) | Faint indigo | `rgba(99,102,241,0.06)` |
| Bottom section divider | Subtle white | `rgba(255,255,255,0.07)` |
| Settings button text | Cool grey | `#94a3b8` |
| User name text | Near-white | `#e2e8f0` |
| User role text | Gray | `#64748b` |
| User avatar gradient | Indigo → Blue | `linear-gradient(135deg, #6366f1, #2563eb)` |

---

## 4. Top Bar Colors

| Element | Color | Hex |
|---|---|---|
| Top bar background | Near-white + blur | `rgba(255,255,255,0.95)` + `backdrop-filter:blur(12px)` |
| Bottom border | Light grey | `#e2e8f0` |
| Hamburger button icon | Gray | `#64748b` |
| Hamburger hover background | Light | `#f8fafc` |
| Page title text | Dark | `#0f172a` |
| Search bar background | Light | `#f8fafc` |
| Search bar border | Border | `#e2e8f0` |
| Search input text | Dark | `#0f172a` |
| Icon button (normal) background | White | `#ffffff` |
| Icon button (normal) border | Border | `#e2e8f0` |
| Icon button (normal) icon | Gray | `#64748b` |
| Icon button hover background | Indigo | `#6366f1` |
| Icon button hover icon | White | `#ffffff` |
| AI brain button gradient | Purple-tint → Blue-tint | `linear-gradient(135deg, #ede9fe, #dbeafe)` |
| AI brain button border | Light indigo | `#c7d2fe` |
| AI brain button icon | Indigo | `#6366f1` |
| Notification / AI orange dot | Orange | `#f59e0b` with `#ffffff` 2px border |
| Top bar avatar gradient | Indigo → Blue | `linear-gradient(135deg, #6366f1, #2563eb)` |

---

## 5. Status Badge Colors

Used in Orders table, Dashboard mini-table, and anywhere order status is displayed.

| Status | Background | Text | Notes |
|---|---|---|---|
| Delivered | `#d1fae5` | `#059669` | Soft green |
| In Progress | `#dbeafe` | `#1d4ed8` | Soft blue |
| Pending | `#fef3c7` | `#b45309` | Soft amber |
| Cancelled | `#fee2e2` | `#dc2626` | Soft red |

---

## 6. KPI Card Colors

Each KPI icon sits in a rounded square (`52×52px`, `border-radius: 14px`) with a tinted background.

| KPI | Icon | Background | Icon Color |
|---|---|---|---|
| Orders Today | Shopping bag | `#dbeafe` | `#2563eb` Blue |
| Revenue Today | Rupee sign | `#d1fae5` | `#10b981` Green |
| Pending Pickups | Truck | `#fef3c7` | `#f59e0b` Orange |
| Avg Satisfaction | Star | `#ede9fe` | `#8b5cf6` Purple |

**KPI value text:** `#0f172a` (dark), `26px`, `font-weight: 800`
**KPI label text:** `#64748b` (gray), `12px`
**KPI trend text:** `#10b981` (green)

---

## 7. AI Daily Briefing Banner Colors

| Element | Color / Value |
|---|---|
| Banner background | `linear-gradient(135deg, #0f172a, #1e1b4b)` — Navy to deep indigo-purple |
| Brain icon color | `#818cf8` — Light indigo |
| Pulse ring border | `#6366f1` — Indigo |
| Label text "AI DAILY BRIEFING" | `#818cf8` — Light indigo, uppercase, letter-spacing |
| Briefing body text | `#e2e8f0` — Very light grey |
| Full Report button background | `rgba(99,102,241,0.25)` |
| Full Report button border | `rgba(99,102,241,0.4)` |
| Full Report button text | `#c7d2fe` — Light indigo |

---

## 8. Card Component Colors

All white cards across every page share these base styles.

| Property | Value |
|---|---|
| Background | `#ffffff` |
| Border | `1px solid #e2e8f0` |
| Border radius | `14px` |
| Box shadow (normal) | `0 2px 12px rgba(15,23,42,0.07)` |
| Box shadow (hover/large) | `0 8px 32px rgba(15,23,42,0.12)` |
| Header divider | `1px solid #e2e8f0` |
| Card title text | `#0f172a` dark, `14px`, `font-weight: 700` |
| Card title icon | `#6366f1` indigo |
| Card link text | `#2563eb` blue |

---

## 9. Button Colors

### Primary Button
```css
background: linear-gradient(135deg, #2563eb, #6366f1)  /* Blue to indigo */
color: #ffffff
border-radius: 50px
hover shadow: 0 6px 20px rgba(37,99,235,0.35)
```

### Outline Button (secondary)
```css
background: #ffffff
border: 1.5px solid #e2e8f0
color: #0f172a
border-radius: 50px
hover: border #6366f1, text #6366f1
```

### Small Primary Button
```css
background: #2563eb
color: #ffffff
border-radius: 50px
```

---

## 10. Filter Tab Colors (Orders page)

| State | Background | Border | Text |
|---|---|---|---|
| Inactive | `#ffffff` | `#e2e8f0` | `#64748b` |
| Inactive hover | `#ffffff` | `#2563eb` | `#2563eb` |
| Active | `#2563eb` | `#2563eb` | `#ffffff` |

---

## 11. Inventory Card Colors (Urgency System)

The same 4 colors are applied consistently to the badge, icon, and progress bar fill on every inventory card.

| Urgency | Trigger | Badge/Icon/Bar Color | Hex |
|---|---|---|---|
| Critical | Stock below 15% | Red | `#ef4444` |
| Low | Stock 15%–35% | Amber | `#f59e0b` |
| Moderate | Stock 35%–60% | Blue | `#2563eb` |
| Good | Stock above 60% | Green | `#10b981` |

**Progress bar track:** `#e2e8f0`
**Confidence pill background:** `#ede9fe` · Text: `#6366f1`
**Critical card border glow:** Red outline ring on entire card

---

## 12. AI Risk Badge Colors (Orders table)

| Risk Level | Score | Background | Text |
|---|---|---|---|
| High | 65+ | `#fee2e2` | `#dc2626` |
| Medium | 35–64 | `#fef3c7` | `#b45309` |
| Low | below 35 | `#d1fae5` | `#059669` |

---

## 13. Customer Segment Badge Colors

| Segment | Background | Text |
|---|---|---|
| 👑 VIP | `#fef3c7` | `#b45309` — Gold/amber |
| ⭐ Loyal | `#dbeafe` | `#1d4ed8` — Blue |
| ⚠️ At Risk | `#fee2e2` | `#dc2626` — Red |
| 🌱 New | `#ede9fe` | `#7c3aed` — Purple |
| ✅ Regular | `#f1f5f9` | `#475569` — Neutral grey |

---

## 14. Churn Risk Bar Colors

| Risk Level | Trigger | Color |
|---|---|---|
| Low | below 30% | `#10b981` — Green |
| Moderate | 30%–60% | `#f59e0b` — Amber |
| High | above 60% | `#ef4444` — Red |

---

## 15. Staff Avatar Colors (fixed per person)

| Staff Member | Role | Color | Hex |
|---|---|---|---|
| Ramesh Kumar | Driver | Blue | `#2563eb` |
| Suresh Patel | Driver | Sky Blue | `#0ea5e9` |
| Anil Sharma | Driver | Indigo | `#6366f1` |
| Priya Menon | QC Specialist | Purple | `#8b5cf6` |
| Deepa Bose | Cleaner | Green | `#10b981` |
| Vikram Singh | Cleaner | Amber | `#f59e0b` |

---

## 16. Staff Performance Label Colors

| Label | Score Range | Color tone |
|---|---|---|
| Elite Performer | 92+ | Green/gold |
| Top Performer | 80–91 | Blue |
| Steady Performer | 68–79 | Amber/neutral |
| Needs Coaching | below 68 | Red/warning |

---

## 17. Toast Notification Colors

| Type | Left Accent + Icon | Icon Class | Background | Border |
|---|---|---|---|---|
| Success | `#10b981` Green | `fa-check-circle` | `#ffffff` | `#e2e8f0` |
| Warning | `#f59e0b` Amber | `fa-exclamation-triangle` | `#ffffff` | `#e2e8f0` |
| Error | `#ef4444` Red | `fa-times-circle` | `#ffffff` | `#e2e8f0` |
| Info | `#2563eb` Blue | `fa-info-circle` | `#ffffff` | `#e2e8f0` |

**Duration:** 4,500ms (standard) / 5,000ms (payments) · **Fade-out:** 350ms

---

## 18. Analytics Page Specific Colors

### Revenue Forecast Chart
| Bar Type | Color | Hex |
|---|---|---|
| Peak day | Green | `#10b981` |
| Low day | Amber | `#f59e0b` |
| Normal day | Indigo | `#6366f1` |

### Service Breakdown Bars
| Service | Color | Hex |
|---|---|---|
| Wash & Fold | Blue | `#2563eb` |
| Dry Cleaning | Purple | `#8b5cf6` |
| Iron & Press | Sky Blue | `#0ea5e9` |
| Stain Removal | Red | `#ef4444` |
| Shoe Cleaning | Amber | `#f59e0b` |

### Anomaly Severity Badges
| Severity | Color | Hex |
|---|---|---|
| High | Red | `#ef4444` |
| Medium | Amber | `#f59e0b` |
| Low | Blue | `#2563eb` |

### Customer Retention Segments
| Segment | Color | Hex |
|---|---|---|
| Champions | Green | `#10b981` |
| Loyal | Blue | `#2563eb` |
| At-Risk | Amber | `#f59e0b` |
| New | Purple | `#8b5cf6` |
| Churned | Red | `#ef4444` |

### Price Optimizer Demand Bar
| Demand Level | Color | Hex |
|---|---|---|
| High (75%+) | Green | `#10b981` |
| Mid (50–75%) | Amber | `#f59e0b` |
| Low (below 50%) | Red | `#ef4444` |

---

## 19. AI Hub Live Feed Dot Colors

| Category | Color | Hex |
|---|---|---|
| Positive metrics (ratings, revenue up) | Green | `#10b981` |
| Supply/usage warnings | Amber | `#f59e0b` |
| Operational alerts, on-time drops | Red | `#ef4444` |
| Demand and forecast observations | Blue | `#2563eb` |
| Customer intelligence | Purple | `#8b5cf6` |
| AI system + upsell recommendations | Indigo | `#6366f1` |
| Service pattern observations | Sky Blue | `#0ea5e9` |

---

## 20. Special UI Elements

### Live Badge (Live Feed, Live Scan)
```css
background: #d1fae5   /* Light green */
color: #059669         /* Dark green */
pulse dot: #10b981     /* Green */
```

### Confidence Ring (Dashboard predictions)
```css
background: conic-gradient(#6366f1 <pct>%, #e2e8f0 <pct>%)
inner circle: #ffffff
text: #6366f1 (indigo)
```

### Floating AI Button (bottom-right)
```css
background: linear-gradient(135deg, #6366f1, #2563eb)
icon: #ffffff
box-shadow: 0 8px 24px rgba(99,102,241,0.4)
pulse dot: #f59e0b (orange)
```

### Soundbox Badge (Paytm-style payment flash)
```css
Full-screen overlay flash on payment received
background: dark overlay with white badge
Triggers: ascending 4-note chime (C→E→G→C)
Duration: 3,200ms then fades out over 400ms
```

---

## 21. Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `max-width: 1100px` | KPI grid → 2 columns, Analytics grid → 1 column |
| `max-width: 900px` | Sidebar hides (translateX -100%), hamburger button appears, main-wrap margin-left → 0 |
| `max-width: 600px` | KPI grid → 2 columns, content padding → 12px, search bar hidden |

### Sidebar Collapse (Desktop only — above 900px)
| State | Sidebar Width | Main Margin | Text Labels |
|---|---|---|---|
| Expanded | `240px` | `240px` | Visible |
| Collapsed | `64px` | `64px` | Hidden, icons only |

Transition: `0.3s cubic-bezier(.22,1,.36,1)` on both width and margin-left

---

## 22. Typography

**Font:** Inter (variable, loaded offline from `assets/fonts/inter-latin.woff2`)
**Weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

| Usage | Size | Weight | Color |
|---|---|---|---|
| Page title | `24px` | `800` | `#0f172a` |
| Card title | `14px` | `700` | `#0f172a` |
| Top bar title | `16px` | `700` | `#0f172a` |
| KPI value | `26px` | `800` | `#0f172a` |
| Table body | `13px` | `400` | `#0f172a` |
| Table header | `11px` | `700` | `#64748b` — uppercase |
| Badge / tag text | `11px` | `700` | varies |
| Subtitle / meta | `14px` | `400` | `#64748b` |
| Tiny labels | `11–12px` | `600` | `#64748b` |
| Order ID | `12px` | `600` | `#6366f1` — monospace |

---

## 23. Shadow System

| Shadow Variable | Value | Used for |
|---|---|---|
| `--shadow` | `0 2px 12px rgba(15,23,42,0.07)` | Default card shadow |
| `--shadow-lg` | `0 8px 32px rgba(15,23,42,0.12)` | Hover state, modals, large cards |
| Button hover | `0 6px 20px rgba(37,99,235,0.35)` | Primary button hover (blue glow) |
| FAB button | `0 8px 24px rgba(99,102,241,0.4)` | Floating AI button (indigo glow) |
