/* ============================================================
   FRESHFOLD — Dashboard Logic (DB + Fake AI Engine + Renderers)
   ============================================================ */

// ─── FAKE DATABASE ────────────────────────────────────────────────────────────
const DB = {
  orders: [
    { id:'FF-2041', customer:'Rahul Sharma',   phone:'98765 43210', service:'Wash & Fold',   kg:4.2,  items:null, amount:206, status:'delivered',  date:'2026-05-03', time:'09:15', rating:5,    area:'Indiranagar'    },
    { id:'FF-2042', customer:'Priya Singh',    phone:'87654 32109', service:'Dry Cleaning',  kg:null, items:3,    amount:447, status:'in-cleaning', date:'2026-05-04', time:'10:30', rating:null, area:'Koramangala'    },
    { id:'FF-2043', customer:'Amit Kumar',     phone:'76543 21098', service:'Iron & Press',  kg:null, items:8,    amount:96,  status:'delivered',  date:'2026-05-03', time:'08:45', rating:4,    area:'HSR Layout'     },
    { id:'FF-2044', customer:'Anita Reddy',    phone:'65432 10987', service:'Wash & Fold',   kg:5.1,  items:null, amount:250, status:'delivered',  date:'2026-05-04', time:'11:20', rating:5,    area:'Whitefield'     },
    { id:'FF-2045', customer:'Sneha Patel',    phone:'54321 09876', service:'Stain Removal', kg:null, items:2,    amount:158, status:'pending',    date:'2026-05-04', time:'13:15', rating:null, area:'JP Nagar'       },
    { id:'FF-2046', customer:'Rajesh Nair',    phone:'43210 98765', service:'Shoe Cleaning', kg:null, items:2,    amount:198, status:'in-cleaning', date:'2026-05-04', time:'09:00', rating:null, area:'BTM Layout'     },
    { id:'FF-2047', customer:'Deepa Iyer',     phone:'32109 87654', service:'Dry Cleaning',  kg:null, items:5,    amount:745, status:'pending',    date:'2026-05-04', time:'14:30', rating:null, area:'Hebbal'         },
    { id:'FF-2048', customer:'Vikram Mehta',   phone:'21098 76543', service:'Wash & Fold',   kg:6.8,  items:null, amount:333, status:'delivered',  date:'2026-05-03', time:'07:30', rating:5,    area:'MG Road'        },
    { id:'FF-2049', customer:'Kavya Sharma',   phone:'10987 65432', service:'Iron & Press',  kg:null, items:12,   amount:144, status:'in-cleaning', date:'2026-05-04', time:'12:00', rating:null, area:'Marathahalli'   },
    { id:'FF-2050', customer:'Ravi Verma',     phone:'09876 54321', service:'Wash & Fold',   kg:3.5,  items:null, amount:172, status:'cancelled',  date:'2026-05-03', time:'15:45', rating:null, area:'Electronic City'},
    { id:'FF-2051', customer:'Meera Nambiar',  phone:'98765 43219', service:'Dry Cleaning',  kg:null, items:4,    amount:596, status:'pending',    date:'2026-05-04', time:'16:00', rating:null, area:'Banashankari'   },
    { id:'FF-2052', customer:'Arjun Pillai',   phone:'87654 32198', service:'Shoe Cleaning', kg:null, items:3,    amount:297, status:'delivered',  date:'2026-05-03', time:'06:45', rating:4,    area:'Jayanagar'      },
    { id:'FF-2053', customer:'Sunita Gupta',   phone:'76543 21987', service:'Stain Removal', kg:null, items:3,    amount:237, status:'in-cleaning', date:'2026-05-04', time:'10:00', rating:null, area:'Rajajinagar'    },
    { id:'FF-2054', customer:'Kiran Bose',     phone:'65432 10876', service:'Wash & Fold',   kg:7.2,  items:null, amount:353, status:'pending',    date:'2026-05-04', time:'17:15', rating:null, area:'Yelahanka'      },
    { id:'FF-2055', customer:'Leela Rao',      phone:'54321 09865', service:'Iron & Press',  kg:null, items:15,   amount:180, status:'pending',    date:'2026-05-04', time:'08:00', rating:null, area:'Peenya'         },
  ],
  inventory: [
    { id:'i1', name:'Liquid Detergent',   icon:'fa-flask',        unit:'L',    stock:18,  max:50,  dailyUsage:3.2, category:'chemical',   cost:180 },
    { id:'i2', name:'Fabric Softener',    icon:'fa-tint',         unit:'L',    stock:12,  max:30,  dailyUsage:1.8, category:'chemical',   cost:220 },
    { id:'i3', name:'Starch Spray',       icon:'fa-spray-can',    unit:'cans', stock:4,   max:20,  dailyUsage:0.8, category:'chemical',   cost:95  },
    { id:'i4', name:'Poly Bags (Small)',  icon:'fa-shopping-bag', unit:'pcs',  stock:320, max:1000,dailyUsage:45,  category:'packaging',  cost:2   },
    { id:'i5', name:'Poly Bags (Large)',  icon:'fa-shopping-bag', unit:'pcs',  stock:85,  max:500, dailyUsage:28,  category:'packaging',  cost:4   },
    { id:'i6', name:'Wire Hangers',       icon:'fa-grip-lines',   unit:'pcs',  stock:240, max:800, dailyUsage:32,  category:'packaging',  cost:3   },
    { id:'i7', name:'Dryer Sheets',       icon:'fa-scroll',       unit:'pcs',  stock:150, max:400, dailyUsage:22,  category:'consumable', cost:1.5 },
    { id:'i8', name:'Washing Powder',     icon:'fa-cubes',        unit:'kg',   stock:8,   max:25,  dailyUsage:1.5, category:'chemical',   cost:140 },
  ],
  staff: [
    { id:'s1', name:'Ramesh Kumar', role:'Driver',       initials:'RK', color:'#2563eb', pickups:48, items:null, checks:null, onTime:98, rating:4.9, shift:'Morning' },
    { id:'s2', name:'Suresh Patel', role:'Driver',       initials:'SP', color:'#0ea5e9', pickups:41, items:null, checks:null, onTime:94, rating:4.7, shift:'Evening' },
    { id:'s3', name:'Anil Sharma',  role:'Driver',       initials:'AS', color:'#6366f1', pickups:35, items:null, checks:null, onTime:91, rating:4.6, shift:'Morning' },
    { id:'s4', name:'Priya Menon',  role:'QC Specialist',initials:'PM', color:'#8b5cf6', pickups:null,items:null, checks:89,  onTime:99, rating:4.9, shift:'Morning' },
    { id:'s5', name:'Deepa Bose',   role:'Cleaner',      initials:'DB', color:'#10b981', pickups:null,items:234,  checks:null,onTime:97, rating:4.7, shift:'Morning' },
    { id:'s6', name:'Vikram Singh', role:'Cleaner',      initials:'VS', color:'#f59e0b', pickups:null,items:198,  checks:null,onTime:88, rating:4.4, shift:'Evening' },
  ],
  weeklyRevenue: [5420, 6180, 4950, 7240, 6830, 8420, 2180],
  weekDays:      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  aiHubFeed:     [],
};

// ─── FAKE AI ENGINE ───────────────────────────────────────────────────────────
// All "AI" here is real data processing + smart template strings.
// It reads actual DB values, does arithmetic, and wraps results in analyst language.

function _jitter(range) { return (Math.random() * range * 2) - range; }

function aiScoreStaff(s) {
  let score = 0;
  if (s.pickups != null) score += Math.min(40, (s.pickups / 55) * 40);
  if (s.items   != null) score += Math.min(40, (s.items   / 260) * 40);
  if (s.checks  != null) score += Math.min(40, (s.checks  / 95)  * 40);
  score += ((s.rating - 3.5) / 1.5) * 30;
  score += ((s.onTime || 90) / 100) * 30;
  return Math.min(99, Math.max(58, Math.round(score)));
}

function aiStaffLabel(score) {
  if (score >= 92) return { label: 'Elite Performer',  cls: 'perf-elite' };
  if (score >= 80) return { label: 'Top Performer',    cls: 'perf-top'   };
  if (score >= 68) return { label: 'Steady Performer', cls: 'perf-avg'   };
  return                   { label: 'Needs Coaching',  cls: 'perf-low'   };
}

function aiInventoryAnalyze(item) {
  const pct       = item.stock / item.max;
  const daysLeft  = Math.max(0, Math.round(item.stock / item.dailyUsage));
  const conf      = Math.round((0.86 + _jitter(0.06)) * 100);
  const urgency   = pct < 0.15 ? 'critical' : pct < 0.35 ? 'warning' : pct < 0.6 ? 'moderate' : 'good';
  const reorderQty= Math.ceil((item.max - item.stock) * 0.9);
  const reasons   = {
    critical: `URGENT: Only ${daysLeft} day${daysLeft===1?'':'s'} left at current usage rate. Reorder ${reorderQty} ${item.unit} immediately to prevent operations stoppage.`,
    warning:  `Stock at ${Math.round(pct*100)}%. AI projects depletion in ${daysLeft} days. Reorder ${reorderQty} ${item.unit} within 2–3 days.`,
    moderate: `Healthy usage. Reorder ${reorderQty} ${item.unit} within ${daysLeft} days to maintain buffer.`,
    good:     `Stock levels optimal at ${Math.round(pct*100)}%. Next predicted reorder in approximately ${daysLeft} days.`,
  };
  return { ...item, pct, daysLeft, conf, urgency, reorderQty, aiReason: reasons[urgency] };
}

function aiOrderRisk(order) {
  let risk = 0;
  if (order.service === 'Stain Removal') risk += 32;
  if (order.service === 'Dry Cleaning')  risk += 18;
  if (order.service === 'Shoe Cleaning') risk += 12;
  if (order.status  === 'pending')       risk += 22;
  if (order.kg > 6)                      risk += 10;
  risk += Math.floor(Math.random() * 18);
  return Math.min(96, risk);
}

function aiRiskLabel(risk) {
  if (risk >= 65) return { label: 'High',   cls: 'risk-high'   };
  if (risk >= 35) return { label: 'Medium', cls: 'risk-medium' };
  return                  { label: 'Low',    cls: 'risk-low'    };
}

function aiDashboardBriefing() {
  const today     = DB.orders.filter(o => o.date === '2026-05-04');
  const totalRev  = today.reduce((s,o) => s + o.amount, 0);
  const pending   = today.filter(o => o.status === 'pending').length;
  const delivered = today.filter(o => o.status === 'delivered').length;
  const lowStock  = DB.inventory.map(aiInventoryAnalyze).filter(i => i.urgency !== 'good');
  const cnt = {}; DB.orders.forEach(o => cnt[o.service] = (cnt[o.service]||0)+1);
  const topService = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
  const peakHour   = [14,15,16,17][Math.floor(Math.random()*4)];

  const lines = [
    `You have ${today.length} orders today totalling ₹${totalRev.toLocaleString()} in revenue. ${delivered} delivered, ${pending} still pending pickup.`,
    `${topService} is leading in volume this week. AI suggests allocating one extra staff member to handle demand.`,
    `Peak demand window predicted between ${peakHour}:00–${peakHour+2}:00 today (${82+Math.floor(Math.random()*12)}% confidence). Keep drivers on standby.`,
    lowStock.length > 0
      ? `Inventory watch: ${lowStock[0].name} is running low (${lowStock[0].daysLeft} days left). Estimated reorder needed: ${lowStock[0].reorderQty} ${lowStock[0].unit}.`
      : `All inventory levels are stable. No immediate restocking required based on current usage rates.`,
    `Your satisfaction score of ${(DB.staff.reduce((a,s)=>a+s.rating,0)/DB.staff.length).toFixed(1)} ⭐ is above the platform average of 4.3. Keep it up!`,
  ];
  // pick 2 random non-duplicate lines
  const i1 = Math.floor(Math.random()*lines.length);
  let i2 = (i1 + 1 + Math.floor(Math.random()*(lines.length-1))) % lines.length;
  return lines[i1] + ' ' + lines[i2];
}

function aiPredictions() {
  const inv      = DB.inventory.map(aiInventoryAnalyze);
  const critical = inv.filter(i => i.urgency === 'critical');
  const warning  = inv.filter(i => i.urgency === 'warning');
  const peakH    = [14,15,16][Math.floor(Math.random()*3)];
  const revFore  = (7200 + Math.floor(Math.random()*1600)).toLocaleString();
  const demandChg= (3 + Math.floor(Math.random()*9));
  return [
    { icon:'fa-clock',      color:'#2563eb', title:'Peak Hours Today',   value:`${peakH}:00 – ${peakH+2}:00`,   conf: 84+Math.floor(Math.random()*10), desc:'Ensure 2+ drivers on standby' },
    { icon:'fa-boxes',      color: critical.length ? '#ef4444' : warning.length ? '#f59e0b' : '#10b981',
      title:'Inventory Status',
      value: critical.length ? `${critical[0].name} – CRITICAL` : warning.length ? `${warning[0].name} – Low` : 'All Stocked',
      conf: 93, desc: critical.length ? `${critical[0].daysLeft} day(s) remaining` : warning.length ? 'Reorder within 3 days' : 'No action needed' },
    { icon:'fa-rupee-sign', color:'#10b981', title:'Revenue Forecast',    value:`₹${revFore}`,                   conf: 76+Math.floor(Math.random()*12), desc:'Estimated end-of-day total' },
    { icon:'fa-chart-line', color:'#8b5cf6', title:'Demand vs Yesterday', value:`+${demandChg}% orders`,         conf: 81+Math.floor(Math.random()*11), desc:'Compared to same day last week' },
  ];
}

function aiAnalyticsInsights(range) {
  const max  = Math.max(...DB.weeklyRevenue.slice(0,6));
  const best = DB.weekDays[DB.weeklyRevenue.indexOf(max)];
  const avg  = Math.round(DB.weeklyRevenue.slice(0,6).reduce((a,b)=>a+b,0)/6);
  const pool = [
    `📈 ${best} was your strongest revenue day at ₹${max.toLocaleString()}. AI attributes this to corporate Dry Cleaning batch orders arriving Thursday evenings.`,
    `💡 Tuesday shows a consistent 12–18% dip across the last 4 weeks. A mid-week flash deal (₹20 off) could lift orders by an estimated 22–28%.`,
    `🔁 Customers who used Wash & Fold twice in a week have a 78% retention rate vs 41% for one-time users. A "2nd wash discount" could significantly boost loyalty.`,
    `⏰ 68% of orders placed between 8–10 AM are delivered same day. Promoting "Book before 10 AM" in push notifications could increase same-day slots by 30%.`,
    `🗺️ Koramangala and Indiranagar account for 38% of all revenue. Consider deploying a dedicated driver for these zones to cut turnaround by ~45 minutes.`,
    `📦 Stain Removal orders have a 2.4× higher re-order rate than other services. Customers who experience it once tend to return. Upsell opportunity on every Wash & Fold.`,
    `📉 Cancelled orders spike on rainy days (avg +34%). Proactive SMS alerts on weather delays can reduce cancellations by an estimated 60%.`,
  ];
  return shuffle(pool).slice(0,3);
}

function aiHubModules() {
  const today      = DB.orders.filter(o => o.date === '2026-05-04');
  const revToday   = today.reduce((s,o) => s+o.amount, 0);
  const invAnalyzed= DB.inventory.map(aiInventoryAnalyze);
  const invScore   = Math.round(invAnalyzed.reduce((s,i) => s + i.pct, 0) / invAnalyzed.length * 100);
  const staffScores= DB.staff.map(s => aiScoreStaff(s));
  const teamScore  = Math.round(staffScores.reduce((a,b)=>a+b,0)/staffScores.length);
  const peakH      = [14,15,16][Math.floor(Math.random()*3)];
  const cnt = {}; DB.orders.forEach(o => cnt[o.service]=(cnt[o.service]||0)+1);
  const topSvc     = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];

  return [
    {
      title: 'Revenue Intelligence',
      icon:  'fa-rupee-sign',
      color: '#10b981',
      score: Math.round((revToday / 9000) * 100),
      scoreLabel: `₹${revToday.toLocaleString()} today`,
      lines: [
        `Weekly avg: ₹${Math.round(DB.weeklyRevenue.slice(0,6).reduce((a,b)=>a+b,0)/6).toLocaleString()}/day`,
        `Projected month: ₹${Math.round(DB.weeklyRevenue.slice(0,6).reduce((a,b)=>a+b,0)/6*30).toLocaleString()}`,
        `Best day (AI): Thursday — corporate orders`,
        `Recommended: Add Tuesday flash deal`,
      ],
      conf: 88,
    },
    {
      title: 'Demand Forecasting',
      icon:  'fa-chart-line',
      color: '#2563eb',
      score: 84,
      scoreLabel: `Peak at ${peakH}:00`,
      lines: [
        `Today's orders: ${today.length} (+${Math.floor(Math.random()*4)+1} vs avg)`,
        `Peak window: ${peakH}:00 – ${peakH+2}:00 (87% conf)`,
        `Tomorrow: ${today.length + Math.floor(Math.random()*4) - 1} orders predicted`,
        `Busiest area: Koramangala (28% of volume)`,
      ],
      conf: 87,
    },
    {
      title: 'Inventory Intelligence',
      icon:  'fa-boxes',
      color: invScore > 60 ? '#f59e0b' : '#ef4444',
      score: invScore,
      scoreLabel: `${invScore}% stock health`,
      lines: invAnalyzed.slice(0,4).map(i =>
        `${i.name}: ${Math.round(i.pct*100)}% — ${i.daysLeft}d left`
      ),
      conf: 94,
    },
    {
      title: 'Staff Performance AI',
      icon:  'fa-users',
      color: '#8b5cf6',
      score: teamScore,
      scoreLabel: `Team score: ${teamScore}/100`,
      lines: DB.staff.map(s => `${s.name}: ${aiScoreStaff(s)}/100 — ${aiStaffLabel(aiScoreStaff(s)).label}`),
      conf: 91,
    },
    {
      title: 'Order Risk Analysis',
      icon:  'fa-shield-alt',
      color: '#0ea5e9',
      score: Math.round((1 - DB.orders.filter(o=>o.status==='cancelled').length/DB.orders.length)*100),
      scoreLabel: `${DB.orders.filter(o=>o.status==='cancelled').length} cancelled today`,
      lines: [
        `High-risk orders: ${DB.orders.filter(o=>aiOrderRisk(o)>=65).length}`,
        `Stain Removal: highest avg risk (62%)`,
        `On-time completion rate: 94.2%`,
        `AI flag: Vikram Singh — 3 late pickups this week`,
      ],
      conf: 79,
    },
    {
      title: 'Customer Intelligence',
      icon:  'fa-heart',
      color: '#ef4444',
      score: 91,
      scoreLabel: `NPS: +67`,
      lines: [
        `Avg rating: ${(DB.orders.filter(o=>o.rating).reduce((s,o)=>s+o.rating,0)/DB.orders.filter(o=>o.rating).length).toFixed(1)} ⭐ (${DB.orders.filter(o=>o.rating).length} reviews)`,
        `Top service: ${topSvc[0]} (${topSvc[1]} orders)`,
        `Repeat customer rate: 64%`,
        `At-risk customers: 2 (no order in 30d)`,
      ],
      conf: 85,
    },
  ];
}

// ─── PAGE SWITCHER ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  orders:    'Orders',
  inventory: 'Inventory',
  analytics: 'Analytics',
  staff:     'Staff Management',
  customers: 'Customers',
  ai:        'AI Hub',
};

function goPage(page, el) {
  soundClick();
  updateAgentContext('page_changed', 'HIGH', { page });
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (el) el.classList.add('active');
  else {
    const navEl = document.querySelector(`[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');
  }
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;

  // Render the page
  const renderFns = {
    dashboard: renderDashboard,
    orders:    renderOrders,
    inventory: renderInventory,
    analytics: renderAnalytics,
    staff:     renderStaff,
    customers: renderCustomers,
    ai:        renderAIHub,
  };
  if (renderFns[page]) renderFns[page]();

  // Refresh AI Assistant suggestions for new page
  if (typeof refreshAIAssistantSuggestions === 'function') {
    setTimeout(() => refreshAIAssistantSuggestions(), 300);
  }

  // Mobile: close sidebar after nav
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.remove('sidebar-open');
    document.getElementById('main-wrap').classList.remove('main-shifted');
  }
}

function toggleSidebar() {
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.toggle('sidebar-open');
    document.getElementById('main-wrap').classList.toggle('main-shifted');
  } else {
    document.getElementById('sidebar').classList.toggle('sidebar-collapsed');
    document.getElementById('main-wrap').classList.toggle('main-collapsed');
  }
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_META = {
  'delivered':   { label:'Delivered',   cls:'s-delivered'  },
  'in-cleaning': { label:'In Progress', cls:'s-progress'   },
  'pending':     { label:'Pending',     cls:'s-pending'     },
  'cancelled':   { label:'Cancelled',   cls:'s-cancelled'  },
};
function statusBadge(s) {
  const m = STATUS_META[s] || { label: s, cls: '' };
  return `<span class="status-badge ${m.cls}">${m.label}</span>`;
}

// ─── RENDER DASHBOARD ─────────────────────────────────────────────────────────
function renderDashboard() {
  const today    = DB.orders.filter(o => o.date === '2026-05-04');
  const revToday = today.reduce((s,o) => s+o.amount, 0);
  const pending  = today.filter(o => o.status === 'pending').length;
  const ratings  = DB.orders.filter(o => o.rating);
  const avgRat   = (ratings.reduce((s,o)=>s+o.rating,0)/ratings.length).toFixed(1);

  // KPIs
  setEl('kpi-orders',  today.length);
  setEl('kpi-revenue', '₹' + revToday.toLocaleString());
  setEl('kpi-pending', pending);
  setEl('kpi-rating',  avgRat + ' ⭐');
  setEl('kpi-orders-trend',  `<i class="fas fa-arrow-up"></i> +12% vs yesterday`);
  setEl('kpi-revenue-trend', `<i class="fas fa-arrow-up"></i> +8% vs yesterday`);
  setEl('kpi-pending-trend', `<i class="fas fa-circle"></i> ${pending} awaiting driver`);
  setEl('kpi-rating-trend',  `<i class="fas fa-arrow-up"></i> Above platform avg`);

  // AI Banner typewriter
  const briefing = aiDashboardBriefing();
  typewriterEffect('ai-banner-text', briefing, 28);

  // Recent Orders mini-table
  const recent = DB.orders.filter(o=>o.date==='2026-05-04').slice(0,6);
  setEl('recent-orders-table', `
    <table class="mini-table">
      <thead><tr><th>Order</th><th>Customer</th><th>Service</th><th>Status</th><th>Amount</th></tr></thead>
      <tbody>${recent.map(o=>`
        <tr>
          <td class="order-id">${o.id}</td>
          <td>${o.customer}</td>
          <td><span class="svc-tag">${o.service}</span></td>
          <td>${statusBadge(o.status)}</td>
          <td class="amount">₹${o.amount}</td>
        </tr>`).join('')}
      </tbody>
    </table>`);

  // AI Predictions
  const preds = aiPredictions();
  setEl('ai-predictions', preds.map(p => `
    <div class="prediction-card">
      <div class="pred-icon" style="background:${p.color}20;color:${p.color}"><i class="fas ${p.icon}"></i></div>
      <div class="pred-body">
        <div class="pred-title">${p.title}</div>
        <div class="pred-value">${p.value}</div>
        <div class="pred-desc">${p.desc}</div>
      </div>
      <div class="pred-conf">
        <div class="conf-ring" style="--pct:${p.conf}%"><span>${p.conf}%</span></div>
        <div class="conf-label">AI Confidence</div>
      </div>
    </div>`).join(''));

  // Quick stats
  const invA = DB.inventory.map(aiInventoryAnalyze);
  const lowCount = invA.filter(i=>i.urgency!=='good').length;
  setEl('quick-stats-row', `
    <div class="qs-card"><div class="qs-icon" style="background:#ede9fe;color:#8b5cf6"><i class="fas fa-tshirt"></i></div><div class="qs-val">${DB.orders.reduce((s,o)=>s+(o.items||Math.round(o.kg*1.8)||0),0)}</div><div class="qs-label">Garments This Week</div></div>
    <div class="qs-card"><div class="qs-icon" style="background:#d1fae5;color:#10b981"><i class="fas fa-star"></i></div><div class="qs-val">${ratings.filter(o=>o.rating===5).length}</div><div class="qs-label">5-Star Reviews</div></div>
    <div class="qs-card"><div class="qs-icon" style="background:#fee2e2;color:#ef4444"><i class="fas fa-exclamation-triangle"></i></div><div class="qs-val">${lowCount}</div><div class="qs-label">Low Stock Items</div></div>
    <div class="qs-card"><div class="qs-icon" style="background:#fef3c7;color:#f59e0b"><i class="fas fa-truck"></i></div><div class="qs-val">${DB.staff.filter(s=>s.role==='Driver').length}</div><div class="qs-label">Drivers On Duty</div></div>
    <div class="qs-card"><div class="qs-icon" style="background:#dbeafe;color:#2563eb"><i class="fas fa-clock"></i></div><div class="qs-val">18.4h</div><div class="qs-label">Avg Turnaround</div></div>`);

  // Nav badges
  setEl('badge-orders',    today.filter(o=>o.status==='pending').length);
  setEl('badge-inventory', invA.filter(i=>i.urgency!=='good').length);

  // Date
  setEl('dash-date', new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }));

  // Smart Alerts
  renderSmartAlerts();
}

// ─── RENDER ORDERS ────────────────────────────────────────────────────────────
let _currentFilter = 'all';
function renderOrders(filter) {
  filter = filter || _currentFilter;
  const list = filter === 'all' ? DB.orders : DB.orders.filter(o=>o.status===filter);
  setEl('orders-count-label', `${list.length} orders ${filter !== 'all' ? `— ${filter}` : 'total'}`);
  setEl('orders-table-wrap', `
    <div class="table-scroll">
    <table class="data-table">
      <thead><tr>
        <th>Order ID</th><th>Customer</th><th>Service</th><th>Weight / Items</th>
        <th>Status</th><th>Amount</th><th>AI Risk</th><th>Time</th><th>Payment</th>
      </tr></thead>
      <tbody>${list.map(o => {
        const risk = aiOrderRisk(o);
        const rl   = aiRiskLabel(risk);
        return `<tr>
          <td class="order-id">${o.id}</td>
          <td>
            <div class="customer-cell">
              <div class="cust-avatar" style="background:${stringToColor(o.customer)}">${o.customer.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div><div class="cust-name">${o.customer}</div><div class="cust-area">${o.area}</div></div>
            </div>
          </td>
          <td><span class="svc-tag">${o.service}</span></td>
          <td>${o.kg ? o.kg + ' kg' : (o.items + ' pcs')}</td>
          <td>${statusBadge(o.status)}</td>
          <td class="amount">₹${o.amount}</td>
          <td><span class="risk-badge ${rl.cls}">${rl.label} ${risk}%</span></td>
          <td class="time-col">${o.time}</td>
          <td>${o.status !== 'completed' ? `<button class="pay-btn" onclick="markOrderPaid('${o.id}','${o.customer}','${o.service}',${o.amount})"><i class="fas fa-check"></i> Mark Paid</button>` : `<span class="paid-tag">✓ Paid</span>`}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>`);

  // AI bar
  const cnt = {}; list.forEach(o => cnt[o.service]=(cnt[o.service]||0)+1);
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  const highRisk = list.filter(o=>aiOrderRisk(o)>=65).length;
  if (top) {
    setEl('orders-ai-bar', `
      <div class="ai-bar">
        <div class="ai-bar-icon"><i class="fas fa-brain"></i></div>
        <div class="ai-bar-text">
          <strong>AI Analysis:</strong> ${top[0]} dominates with ${top[1]} orders (${Math.round(top[1]/list.length*100)}% of total).
          ${highRisk > 0 ? `<span class="ai-bar-warn"> ⚠️ ${highRisk} high-risk order${highRisk>1?'s':''} flagged for review.</span>` : ' All orders are low-risk today.'}
        </div>
        <button class="ai-bar-btn" onclick="openAIModal('orders')">Full AI Report <i class="fas fa-arrow-right"></i></button>
      </div>`);
  }
}

function readOrdersAloud() {
  const filter = _currentFilter;
  const list = (filter === 'all' ? DB.orders : DB.orders.filter(o => o.status === filter)).slice(0, 8);
  if (!list.length) { speak('No orders to read.', 'orders'); return; }
  soundClick();
  const lines = list.map(o => `${o.customer.split(' ')[0]} placed an order for ${o.service}`);
  const summary = lines.join('. ') + '.';
  speak(summary, 'orders');
  showToast('Reading Orders', `${list.length} order${list.length > 1 ? 's' : ''} being read aloud`, 'info', 3000, 'orders');
}

function filterOrders(f, el) {
  _currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderOrders(f);
}

// ─── RENDER INVENTORY ─────────────────────────────────────────────────────────
function renderInventory() {
  const items = DB.inventory.map(aiInventoryAnalyze);
  const lowItems = items.filter(i => i.urgency !== 'good');

  setEl('inv-summary-label', `${DB.inventory.length} items tracked · ${lowItems.length} need attention`);

  // Alert strip
  setEl('inv-alert-strip', lowItems.length > 0 ? `
    <div class="alert-strip">
      <i class="fas fa-exclamation-triangle"></i>
      <span><strong>AI Inventory Alert:</strong> ${lowItems.map(i=>`<b>${i.name}</b> (${i.daysLeft}d left)`).join(', ')} — reorder recommended.</span>
      <button class="btn-sm-primary" onclick="openAIModal('inventory')">View AI Plan</button>
    </div>` : '');

  setEl('inv-grid', items.map(item => {
    const pct   = Math.round(item.pct * 100);
    const color = item.urgency === 'critical' ? '#ef4444' : item.urgency === 'warning' ? '#f59e0b' : item.urgency === 'moderate' ? '#2563eb' : '#10b981';
    return `
    <div class="inv-card ${item.urgency === 'critical' ? 'inv-card-critical' : ''}">
      <div class="inv-card-top">
        <div class="inv-icon" style="background:${color}18;color:${color}"><i class="fas ${item.icon}"></i></div>
        <div class="inv-urgency urgency-${item.urgency}">${item.urgency === 'critical' ? '⚠️ Critical' : item.urgency === 'warning' ? '⚡ Low' : item.urgency === 'moderate' ? '📊 Moderate' : '✅ Good'}</div>
      </div>
      <div class="inv-name">${item.name}</div>
      <div class="inv-stock-row">
        <span>${item.stock} ${item.unit}</span>
        <span class="inv-max">/ ${item.max} ${item.unit}</span>
      </div>
      <div class="inv-bar-bg"><div class="inv-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="inv-meta-row">
        <div><i class="fas fa-fire" style="color:#f59e0b"></i> ${item.dailyUsage} ${item.unit}/day</div>
        <div><i class="fas fa-calendar" style="color:#6366f1"></i> ${item.daysLeft}d left</div>
      </div>
      <div class="inv-ai-box">
        <div class="inv-ai-conf"><div class="ai-conf-pill">${item.conf}% AI</div></div>
        <div class="inv-ai-text">${item.aiReason}</div>
      </div>
      <button class="btn-restock" onclick="restockItem('${item.id}','${item.name}',${item.reorderQty},'${item.unit}')">
        <i class="fas fa-plus"></i> Restock ${item.reorderQty} ${item.unit}
      </button>
    </div>`;
  }).join(''));
}

function restockItem(id, name, qty, unit) {
  soundPaytm();
  showToast('Restock Order Placed', `AI recommended reorder: ${qty} ${unit} of ${name} placed with supplier.`, 'success', 5000, 'orders');
  // Update DB stock optimistically
  const item = DB.inventory.find(i=>i.id===id);
  if (item) {
    item.stock = Math.min(item.max, item.stock + qty);
    setTimeout(renderInventory, 500);
  }
}

function aiRevenueForecast() {
  const avg = Math.round(DB.weeklyRevenue.slice(0,6).reduce((a,b)=>a+b,0)/6);
  const data = [
    { day:'Mon', val: Math.round(avg*(0.88+Math.random()*0.08)), type:'normal' },
    { day:'Tue', val: Math.round(avg*(0.78+Math.random()*0.08)), type:'low'    },
    { day:'Wed', val: Math.round(avg*(0.95+Math.random()*0.10)), type:'normal' },
    { day:'Thu', val: Math.round(avg*(1.12+Math.random()*0.10)), type:'peak'   },
    { day:'Fri', val: Math.round(avg*(1.05+Math.random()*0.08)), type:'normal' },
    { day:'Sat', val: Math.round(avg*(1.18+Math.random()*0.12)), type:'peak'   },
    { day:'Sun', val: Math.round(avg*(0.42+Math.random()*0.10)), type:'low'    },
  ];
  const maxVal = Math.max(...data.map(d=>d.val));
  const weekTotal = data.reduce((s,d)=>s+d.val,0);
  return { data, maxVal, weekTotal, avg };
}

function aiAnomalyDetect() {
  const pool = [
    { icon:'fa-arrow-down', color:'#ef4444', severity:'High',
      title:'Revenue dip: Tuesday 2–4 PM',
      detail:'Zero orders in this slot for 3 consecutive Tuesdays. AI suggests a targeted flash deal to fill the gap.',
      conf: 91 },
    { icon:'fa-exclamation-triangle', color:'#f59e0b', severity:'Medium',
      title:'Cancellation spike detected',
      detail:'Cancellations ran 3.1× above the 30-day average on Wednesday. Correlates with rain forecast data — proactive SMS alerts recommended.',
      conf: 78 },
    { icon:'fa-clock', color:'#2563eb', severity:'Low',
      title:'Delivery delay — Electronic City',
      detail:'Orders from Electronic City taking 22% longer than predicted after 5 PM. Possible Hosur Road congestion. Consider dedicated evening slot.',
      conf: 82 },
    { icon:'fa-chart-line', color:'#8b5cf6', severity:'Low',
      title:'Unusual demand surge predicted',
      detail:'Model detects a 34% demand spike next Friday based on local event data and historical patterns. Prepare additional driver capacity.',
      conf: 74 },
  ];
  return pool.slice(0, 3);
}

function aiCustomerRetentionData() {
  const segments = [
    { label:'Champions',  pct:28, color:'#10b981', desc:'Order frequently & highly rated — priority retention' },
    { label:'Loyal',      pct:22, color:'#2563eb', desc:'2+ orders/month, consistent spenders' },
    { label:'At-Risk',    pct:18, color:'#f59e0b', desc:'Frequency dropping — AI recommends re-engagement offer' },
    { label:'New',        pct:21, color:'#8b5cf6', desc:'First order within last 14 days' },
    { label:'Churned',    pct:11, color:'#ef4444', desc:'No order in 30+ days — flagged for winback campaign' },
  ];
  const retentionRate  = 64 + Math.floor(Math.random()*8);
  const ltvAvg         = 1240 + Math.floor(Math.random()*320);
  const repeatRate     = 58 + Math.floor(Math.random()*12);
  return { segments, retentionRate, ltvAvg, repeatRate };
}

// ─── RENDER ANALYTICS ─────────────────────────────────────────────────────────
let _dateRange = '7d';
function setDateRange(range, el) {
  _dateRange = range;
  document.querySelectorAll('.dr-btn').forEach(b=>b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderAnalytics();
}

function renderAnalytics() {
  const maxRev = Math.max(...DB.weeklyRevenue);

  // ── AI Engine Banner counter animation ──
  const totalPoints = (DB.orders.length + DB.inventory.length + DB.staff.length) * 12 + 847;
  const animEl = document.getElementById('ai-data-points');
  if (animEl) {
    let n = 0; const step = Math.ceil(totalPoints/40);
    const iv = setInterval(() => { n = Math.min(n+step, totalPoints); animEl.textContent = n.toLocaleString(); if(n>=totalPoints) clearInterval(iv); }, 25);
  }
  const avgConf = 85 + Math.floor(Math.random()*10);
  const confEl = document.getElementById('analytics-conf');
  if (confEl) {
    confEl.textContent = '0%';
    setTimeout(() => { if(confEl) confEl.textContent = avgConf + '%'; }, 900);
  }

  // ── Bar Chart ──
  setEl('bar-chart', `
    <div class="bar-chart-inner">
      ${DB.weeklyRevenue.map((v,i) => `
        <div class="bar-col">
          <div class="bar-val">₹${v>0?(v/1000).toFixed(1)+'k':'—'}</div>
          <div class="bar-wrap"><div class="bar-fill ${i===6?'bar-today':''}" style="height:${v>0?Math.round(v/maxRev*100):2}%"></div></div>
          <div class="bar-day ${i===6?'bar-day-today':''}">${DB.weekDays[i]}</div>
        </div>`).join('')}
    </div>`);

  // ── Revenue AI Footer ──
  const weekTotal = DB.weeklyRevenue.slice(0,6).reduce((a,b)=>a+b,0);
  const avgDay    = Math.round(weekTotal/6);
  const bestI     = DB.weeklyRevenue.indexOf(Math.max(...DB.weeklyRevenue.slice(0,6)));
  setEl('revenue-ai-footer', `
    <div class="revenue-ai-footer">
      <div class="raf-stat"><i class="fas fa-brain" style="color:#6366f1"></i> <strong>AI Summary:</strong> Best day was ${DB.weekDays[bestI]} — ₹${DB.weeklyRevenue[bestI].toLocaleString()}</div>
      <div class="raf-stat"><i class="fas fa-calculator" style="color:#10b981"></i> Daily avg: ₹${avgDay.toLocaleString()}</div>
      <div class="raf-stat"><i class="fas fa-chart-line" style="color:#2563eb"></i> Projected month: ₹${(avgDay*30).toLocaleString()}</div>
      <span class="ai-conf-pill">${88+Math.floor(Math.random()*7)}% conf</span>
    </div>`);

  // ── AI Insights ──
  const insights = aiAnalyticsInsights(_dateRange);
  setEl('analytics-ai-insights', insights.map((txt,i) => `
    <div class="analytics-insight-row">
      <div class="insight-body">${txt}</div>
      <div class="insight-conf-bar-wrap">
        <div class="insight-conf-bar" style="width:${72+i*7}%"></div>
        <span class="insight-conf-label">${72+i*7}% confidence</span>
      </div>
    </div>`).join(''));

  // ── Revenue Forecast ──
  const fc = aiRevenueForecast();
  const colMap = { peak:'#10b981', low:'#f59e0b', normal:'#6366f1' };
  setEl('revenue-forecast', `
    <div class="forecast-chart">
      ${fc.data.map(d=>`
        <div class="fc-col">
          <div class="fc-val">₹${(d.val/1000).toFixed(1)}k</div>
          <div class="fc-bar-wrap">
            <div class="fc-bar" style="height:${Math.round(d.val/fc.maxVal*100)}%;background:${colMap[d.type]}">
              ${d.type==='peak'?'<div class="fc-peak-glow"></div>':''}
            </div>
          </div>
          <div class="fc-day">${d.day}</div>
          ${d.type==='peak'?'<div class="fc-tag fc-peak-tag">Peak</div>':''}
          ${d.type==='low'?'<div class="fc-tag fc-low-tag">Low</div>':''}
        </div>`).join('')}
    </div>
    <div class="forecast-footer">
      <div class="ff-item"><i class="fas fa-brain" style="color:#6366f1"></i> <strong>AI Predicted Weekly Total:</strong> ₹${fc.weekTotal.toLocaleString()}</div>
      <div class="ff-item"><i class="fas fa-arrow-up" style="color:#10b981"></i> +${Math.floor(Math.random()*8+4)}% vs this week</div>
      <span class="ai-conf-pill">${76+Math.floor(Math.random()*12)}% conf</span>
    </div>`);

  // ── Service Breakdown ──
  const cnt   = {}; DB.orders.forEach(o => cnt[o.service]=(cnt[o.service]||0)+1);
  const total = DB.orders.length;
  const colors= { 'Wash & Fold':'#2563eb','Dry Cleaning':'#8b5cf6','Iron & Press':'#0ea5e9','Stain Removal':'#ef4444','Shoe Cleaning':'#f59e0b' };
  const aiTips= {
    'Wash & Fold':'High volume — AI recommends loyalty bundle pricing',
    'Dry Cleaning':'Highest margin per order — prioritise turnaround speed',
    'Iron & Press':'High frequency — consider subscription tier',
    'Stain Removal':'Premium upsell opportunity on every Wash & Fold',
    'Shoe Cleaning':'Seasonal spike expected — stock shoe cleaner +40%',
  };
  setEl('service-breakdown', `
    <div class="svc-breakdown-list">
      ${Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([svc,n]) => `
        <div class="svc-row">
          <div class="svc-row-label">${svc}</div>
          <div class="svc-row-bar-bg"><div class="svc-row-bar" style="width:${Math.round(n/total*100)}%;background:${colors[svc]||'#6366f1'}"></div></div>
          <div class="svc-row-val">${n} (${Math.round(n/total*100)}%)</div>
        </div>
        <div class="svc-ai-tip"><i class="fas fa-lightbulb" style="color:#f59e0b;margin-right:5px"></i>${aiTips[svc]||'AI monitoring this service'}</div>`).join('')}
    </div>`);

  // ── Peak Hours ──
  const hours = [
    {h:'8–10 AM',pct:45},{h:'10–12 PM',pct:72},{h:'12–2 PM',pct:60},
    {h:'2–4 PM', pct:88},{h:'4–6 PM', pct:78},{h:'6–8 PM', pct:35},
  ];
  setEl('peak-hours-chart', `
    <div class="peak-chart">
      ${hours.map(p=>`
        <div class="peak-bar-col">
          <div class="peak-bar-wrap"><div class="peak-bar-fill ${p.pct>=80?'peak-hot':p.pct>=60?'peak-warm':''}" style="height:${p.pct}%"></div></div>
          <div class="peak-bar-label">${p.h}</div>
        </div>`).join('')}
    </div>
    <div class="peak-footer">
      <i class="fas fa-brain" style="color:#6366f1"></i>
      <span><strong>AI Insight:</strong> 2–4 PM is your peak window (88%). Keep 2+ drivers on standby. Consider +10% surge pricing for this slot.</span>
    </div>`);

  // ── Anomaly Detection ──
  const anomalies = aiAnomalyDetect();
  setEl('anomaly-detection', anomalies.map(a => `
    <div class="anomaly-card">
      <div class="anomaly-top">
        <div class="anomaly-icon" style="color:${a.color}"><i class="fas ${a.icon}"></i></div>
        <div class="anomaly-severity sev-${a.severity.toLowerCase()}">${a.severity}</div>
        <div class="anomaly-conf">${a.conf}% conf</div>
      </div>
      <div class="anomaly-title">${a.title}</div>
      <div class="anomaly-detail">${a.detail}</div>
    </div>`).join(''));

  // ── Top Areas ──
  const areaCnt = {}; DB.orders.forEach(o => areaCnt[o.area]=(areaCnt[o.area]||0)+1);
  const topAreas = Object.entries(areaCnt).sort((a,b)=>b[1]-a[1]).slice(0,5);
  setEl('top-areas', topAreas.map(([area,n],i) => `
    <div class="area-row">
      <div class="area-rank">#${i+1}</div>
      <div class="area-name">${area}</div>
      <div class="area-count">${n} orders</div>
      <div class="area-bar-bg"><div class="area-bar" style="width:${Math.round(n/topAreas[0][1]*100)}%"></div></div>
    </div>`).join(''));

  // ── Customer Retention AI ──
  const ret = aiCustomerRetentionData();
  setEl('customer-retention-ai', `
    <div class="retention-kpis">
      <div class="ret-kpi"><div class="ret-kpi-val" style="color:#10b981">${ret.retentionRate}%</div><div class="ret-kpi-lbl">Retention Rate</div></div>
      <div class="ret-kpi"><div class="ret-kpi-val" style="color:#2563eb">₹${ret.ltvAvg}</div><div class="ret-kpi-lbl">Avg LTV</div></div>
      <div class="ret-kpi"><div class="ret-kpi-val" style="color:#8b5cf6">${ret.repeatRate}%</div><div class="ret-kpi-lbl">Repeat Rate</div></div>
    </div>
    <div class="retention-segs">
      ${ret.segments.map(s=>`
        <div class="ret-seg">
          <div class="ret-seg-top">
            <div class="ret-seg-dot" style="background:${s.color}"></div>
            <div class="ret-seg-label">${s.label}</div>
            <div class="ret-seg-pct" style="color:${s.color}">${s.pct}%</div>
          </div>
          <div class="ret-seg-bar-bg"><div class="ret-seg-bar" style="width:${s.pct*2.8}%;background:${s.color}"></div></div>
          <div class="ret-seg-desc">${s.desc}</div>
        </div>`).join('')}
    </div>
    <div class="retention-ai-note">
      <i class="fas fa-brain" style="color:#6366f1"></i>
      <span><strong>AI Recommendation:</strong> Focus winback campaign on ${ret.segments[4].pct}% churned customers — estimated ₹${Math.round(ret.ltvAvg*0.3).toLocaleString()} recovery potential.</span>
    </div>`);

  // ── Price Optimizer ──
  renderPriceOptimizer();
}

// ─── RENDER STAFF ─────────────────────────────────────────────────────────────
function renderStaff() {
  const scored = DB.staff.map(s => ({ ...s, score: aiScoreStaff(s) }));
  const avgScore = Math.round(scored.reduce((a,s)=>a+s.score,0)/scored.length);
  const top = scored.sort((a,b)=>b.score-a.score)[0];
  setEl('staff-summary-label', `${DB.staff.length} team members · Avg AI Score: ${avgScore}/100`);
  setEl('ai-team-banner', `
    <div class="ai-team-insight">
      <div class="ai-team-icon"><i class="fas fa-brain"></i></div>
      <div class="ai-team-text">
        <strong>AI Team Report:</strong> ${aiTeamInsight()}
        <span class="ai-team-conf">Confidence: ${88+Math.floor(Math.random()*8)}%</span>
      </div>
    </div>`);

  setEl('staff-grid', DB.staff.map(s => {
    const score = aiScoreStaff(s);
    const lbl   = aiStaffLabel(score);
    const statLine = s.pickups ? `${s.pickups} pickups` : s.items ? `${s.items} items cleaned` : `${s.checks} QC checks`;
    return `
    <div class="staff-card">
      <div class="staff-card-top">
        <div class="staff-avatar" style="background:${s.color}">${s.initials}</div>
        <div class="staff-info">
          <div class="staff-name">${s.name}</div>
          <div class="staff-role">${s.role} · ${s.shift}</div>
        </div>
        <div class="staff-score-badge">
          <div class="score-ring" style="--score:${score}">${score}</div>
          <div style="font-size:10px;color:#64748b;text-align:center">AI Score</div>
        </div>
      </div>
      <div class="staff-stats">
        <div class="staff-stat"><i class="fas fa-check" style="color:#10b981"></i> ${statLine}</div>
        <div class="staff-stat"><i class="fas fa-star" style="color:#f59e0b"></i> ${s.rating} rating</div>
        <div class="staff-stat"><i class="fas fa-clock" style="color:#2563eb"></i> ${s.onTime||'—'}% on-time</div>
      </div>
      <div class="staff-perf-label ${lbl.cls}">
        <i class="fas fa-brain"></i> ${lbl.label}
      </div>
      <div class="staff-ai-tip">
        ${getStaffTip(s, score)}
      </div>
    </div>`;
  }).join(''));
}

function getStaffTip(s, score) {
  if (s.role === 'Driver') {
    if (score >= 90) return '💡 Consistently beats delivery windows. Ideal for VIP customer routes.';
    if (score >= 78) return '💡 Reliable performer. Consider as team lead for new driver onboarding.';
    return '💡 On-time rate could improve. Suggest route optimisation training.';
  }
  if (s.role === 'QC Specialist') return '💡 Highest accuracy in team. Zero defect rate this week — exceptional.';
  if (s.items > 220) return '💡 High throughput. Ensure workload doesn\'t exceed safe limits.';
  return '💡 Steady output. A refresher on premium fabric care could boost ratings.';
}

function aiTeamInsight() {
  const scored = DB.staff.map(s => ({...s, score:aiScoreStaff(s)}));
  const top    = scored.sort((a,b)=>b.score-a.score)[0];
  const low    = [...scored].sort((a,b)=>a.score-b.score)[0];
  const avgOnTime = Math.round(DB.staff.filter(s=>s.onTime).reduce((a,s)=>a+s.onTime,0)/DB.staff.filter(s=>s.onTime).length);
  const tips = [
    `${top.name} leads with an AI score of ${top.score}/100. Consider assigning them to high-value Dry Cleaning orders.`,
    `Team on-time rate averages ${avgOnTime}% this week. AI target is 95%+ — you're ${avgOnTime >= 95 ? 'above' : 'below'} target.`,
    `${low.name} scored lowest this week. AI recommends a 1:1 check-in and route optimisation review.`,
    `Evening shift staff show 6% lower on-time rates. Staggering pickup windows could close this gap.`,
  ];
  return pickRandom(tips);
}

// ─── RENDER AI HUB ────────────────────────────────────────────────────────────
function renderAIHub() {
  // Status bar
  const recCount = DB.orders.length + DB.inventory.length + DB.staff.length;
  setEl('ai-records-processed', `${recCount} records analyzed`);
  setEl('ai-confidence', `${88 + Math.floor(Math.random()*8)}%`);
  setEl('ai-last-updated', `Last updated: ${new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}`);

  // Modules
  const modules = aiHubModules();
  setEl('ai-module-grid', modules.map(m => `
    <div class="ai-module-card">
      <div class="ai-module-top">
        <div class="ai-module-icon" style="background:${m.color}18;color:${m.color}"><i class="fas ${m.icon}"></i></div>
        <div class="ai-module-title">${m.title}</div>
        <div class="ai-module-conf">${m.conf}%</div>
      </div>
      <div class="ai-score-bar-wrap">
        <div class="ai-score-bar" style="width:${m.score}%;background:${m.color}"></div>
      </div>
      <div class="ai-score-label">${m.scoreLabel}</div>
      <ul class="ai-module-lines">
        ${m.lines.map(l=>`<li>${l}</li>`).join('')}
      </ul>
    </div>`).join(''));

  // Live feed (keep last 12 entries, prepend new ones)
  const feedEntries = generateAIFeedEntries();
  if (DB.aiHubFeed.length === 0) DB.aiHubFeed.push(...feedEntries);
  setEl('ai-feed', DB.aiHubFeed.slice(0,15).map(e=>`
    <div class="ai-feed-item">
      <div class="ai-feed-dot" style="background:${e.color}"></div>
      <div class="ai-feed-body">
        <div class="ai-feed-text">${e.text}</div>
        <div class="ai-feed-time">${e.time}</div>
      </div>
      <div class="ai-feed-conf">${e.conf}% conf</div>
    </div>`).join(''));

  // Social Media AI
  renderSocialAI();
}

function generateAIFeedEntries() {
  const entries = [
    { text: 'Demand spike predicted for 3–5 PM window based on historical Sunday patterns.', color: '#2563eb', conf: 86 },
    { text: 'Liquid Detergent usage 12% above weekly average — AI flags potential over-dispensing.', color: '#f59e0b', conf: 79 },
    { text: `${DB.orders.filter(o=>o.rating===5).length} five-star ratings received this week — above city average.`, color: '#10b981', conf: 99 },
    { text: 'Koramangala zone shows 18% higher revenue density per order than other areas.', color: '#8b5cf6', conf: 83 },
    { text: `Stain Removal re-order rate: 71%. AI recommends upsell prompt on Wash & Fold completion.`, color: '#6366f1', conf: 77 },
    { text: 'Evening shift on-time rate dropped 6% this week — route overlap detected in BTM/HSR zones.', color: '#ef4444', conf: 82 },
    { text: 'Dry Cleaning revenue up 22% vs last Sunday. Corporate account orders detected.', color: '#10b981', conf: 91 },
    { text: `AI confidence in today's revenue forecast upgraded to ${88+Math.floor(Math.random()*8)}% based on order velocity.`, color: '#2563eb', conf: 88+Math.floor(Math.random()*8) },
    { text: 'Customer Rahul Sharma is a potential VIP — 4 orders in 3 weeks, all 5-star rated.', color: '#8b5cf6', conf: 85 },
    { text: 'Poly Bags (Large) reorder window opens in 3 days — AI suggests batch order to save 12%.', color: '#f59e0b', conf: 93 },
    { text: `Priya Menon maintains 99% QC accuracy this week — zero re-cleans flagged.`, color: '#10b981', conf: 97 },
    { text: 'Iron & Press orders peak on Sunday evenings — prep steam units before 5 PM.', color: '#0ea5e9', conf: 74 },
  ];
  const now = new Date();
  return entries.map((e, i) => ({
    ...e,
    time: new Date(now - i * 4.5 * 60000).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  }));
}

function generateFullAIReport() {
  soundAI();
  showToast('AI Report Generating...', 'Full business intelligence report is being compiled. Ready in a moment.', 'info', 3000, 'updates');

  setTimeout(() => {
    // Add new entry to feed
    DB.aiHubFeed.unshift({
      text: `Full AI report generated at ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} — All 6 modules analyzed.`,
      color: '#10b981', conf: 99,
      time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
    });
    renderAIHub();
    showToast('Report Ready!', 'Your AI business report is ready. All insights updated.', 'success', 5000, 'updates');
  }, 2200);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function setEl(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function stringToColor(str) {
  const colors = ['#2563eb','#8b5cf6','#10b981','#f59e0b','#ef4444','#0ea5e9','#6366f1'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function typewriterEffect(id, text, delay) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, delay);
}

function globalSearch(q) {
  if (!q.trim()) return;
  const matches = DB.orders.filter(o =>
    o.customer.toLowerCase().includes(q.toLowerCase()) ||
    o.id.toLowerCase().includes(q.toLowerCase()) ||
    o.service.toLowerCase().includes(q.toLowerCase())
  );
  if (matches.length > 0) {
    goPage('orders', null);
    setTimeout(() => {
      setEl('orders-table-wrap', `
        <div style="padding:12px 16px;font-size:13px;color:#6366f1;font-weight:600">
          <i class="fas fa-search"></i> Search results for "${q}" — ${matches.length} found
        </div>
        <div class="table-scroll"><table class="data-table"><thead><tr>
          <th>Order ID</th><th>Customer</th><th>Service</th><th>Status</th><th>Amount</th>
        </tr></thead><tbody>${matches.map(o=>`<tr>
          <td class="order-id">${o.id}</td><td>${o.customer}</td>
          <td><span class="svc-tag">${o.service}</span></td><td>${statusBadge(o.status)}</td>
          <td class="amount">₹${o.amount}</td>
        </tr>`).join('')}</tbody></table></div>`);
    }, 200);
  }
}

function triggerTestNotif() {
  const types = ['orders','driver','payments','alerts','updates','promos'];
  const cat   = pickRandom(types);
  fireRandomEvent();
}

function showAddOrderForm() {
  openVoiceInvoice();
}

function showRestockModal() {
  showToast('Restock', 'Select an inventory item to restock using the card buttons below.', 'info', 3000, 'updates');
}

// ─── CUSTOMER DATABASE ────────────────────────────────────────────────────────
const CUSTOMERS_DB = [
  { id:'c1',  name:'Rahul Sharma',   phone:'98765 43210', area:'Indiranagar',     orders:4, totalSpend:824,  lastOrder:'2026-05-03', services:['Wash & Fold','Dry Cleaning'],   rating:5   },
  { id:'c2',  name:'Priya Singh',    phone:'87654 32109', area:'Koramangala',     orders:3, totalSpend:1341, lastOrder:'2026-05-04', services:['Dry Cleaning'],                 rating:4.7 },
  { id:'c3',  name:'Amit Kumar',     phone:'76543 21098', area:'HSR Layout',      orders:6, totalSpend:576,  lastOrder:'2026-05-03', services:['Iron & Press'],                 rating:4   },
  { id:'c4',  name:'Anita Reddy',    phone:'65432 10987', area:'Whitefield',      orders:5, totalSpend:1250, lastOrder:'2026-05-04', services:['Wash & Fold','Stain Removal'],   rating:5   },
  { id:'c5',  name:'Sneha Patel',    phone:'54321 09876', area:'JP Nagar',        orders:2, totalSpend:316,  lastOrder:'2026-05-04', services:['Stain Removal'],                rating:null},
  { id:'c6',  name:'Rajesh Nair',    phone:'43210 98765', area:'BTM Layout',      orders:3, totalSpend:594,  lastOrder:'2026-05-04', services:['Shoe Cleaning'],                rating:null},
  { id:'c7',  name:'Deepa Iyer',     phone:'32109 87654', area:'Hebbal',          orders:4, totalSpend:2980, lastOrder:'2026-05-04', services:['Dry Cleaning'],                 rating:4.5 },
  { id:'c8',  name:'Vikram Mehta',   phone:'21098 76543', area:'MG Road',         orders:7, totalSpend:2331, lastOrder:'2026-05-03', services:['Wash & Fold'],                  rating:5   },
  { id:'c9',  name:'Kavya Sharma',   phone:'10987 65432', area:'Marathahalli',    orders:3, totalSpend:432,  lastOrder:'2026-05-04', services:['Iron & Press'],                 rating:null},
  { id:'c10', name:'Ravi Verma',     phone:'09876 54321', area:'Electronic City', orders:1, totalSpend:172,  lastOrder:'2026-04-20', services:['Wash & Fold'],                  rating:null},
  { id:'c11', name:'Meera Nambiar',  phone:'98765 43219', area:'Banashankari',    orders:2, totalSpend:1192, lastOrder:'2026-05-04', services:['Dry Cleaning'],                 rating:4.8 },
  { id:'c12', name:'Arjun Pillai',   phone:'87654 32198', area:'Jayanagar',       orders:5, totalSpend:1485, lastOrder:'2026-05-03', services:['Shoe Cleaning','Dry Cleaning'], rating:4   },
  { id:'c13', name:'Sunita Gupta',   phone:'76543 21987', area:'Rajajinagar',     orders:4, totalSpend:948,  lastOrder:'2026-04-25', services:['Stain Removal','Wash & Fold'],  rating:null},
  { id:'c14', name:'Kiran Bose',     phone:'65432 10876', area:'Yelahanka',       orders:2, totalSpend:706,  lastOrder:'2026-05-04', services:['Wash & Fold'],                  rating:null},
  { id:'c15', name:'Leela Rao',      phone:'54321 09865', area:'Peenya',          orders:3, totalSpend:540,  lastOrder:'2026-04-28', services:['Iron & Press'],                 rating:null},
];

function aiCustomerLTV(c) {
  const avgOrderValue = c.totalSpend / c.orders;
  const growthFactor  = c.orders >= 5 ? 1.3 : c.orders >= 3 ? 1.15 : 1.0;
  return Math.round(avgOrderValue * c.orders * growthFactor * 1.2);
}

function aiChurnRisk(c) {
  const daysSince = Math.floor((new Date('2026-05-04') - new Date(c.lastOrder)) / 86400000);
  let risk = 0;
  if (daysSince > 14) risk += 40; else if (daysSince > 7) risk += 20;
  if (c.orders <= 1) risk += 35; else if (c.orders <= 2) risk += 18;
  if (!c.rating) risk += 12;
  if (c.rating && c.rating < 4) risk += 22;
  risk += Math.floor(Math.random() * 8);
  return Math.min(95, risk);
}

function aiCustomerSegment(c) {
  const ltv = aiCustomerLTV(c); const churn = aiChurnRisk(c);
  if (ltv > 2800 && churn < 30) return { label:'VIP',     cls:'seg-vip',     icon:'👑' };
  if (c.orders >= 5 && churn < 40) return { label:'Loyal',   cls:'seg-loyal',   icon:'⭐' };
  if (churn > 60)                   return { label:'At Risk', cls:'seg-atrisk',  icon:'⚠️' };
  if (c.orders <= 2)                return { label:'New',     cls:'seg-new',     icon:'🌱' };
  return                                   { label:'Regular', cls:'seg-regular', icon:'✅' };
}

function renderCustomers() {
  const vip    = CUSTOMERS_DB.filter(c => aiCustomerSegment(c).label === 'VIP');
  const atRisk = CUSTOMERS_DB.filter(c => aiChurnRisk(c) > 60);
  const totalLTV = CUSTOMERS_DB.reduce((s,c) => s + aiCustomerLTV(c), 0);
  document.getElementById('cust-summary-label').textContent =
    `${CUSTOMERS_DB.length} customers · ₹${totalLTV.toLocaleString()} projected LTV · ${vip.length} VIP · ${atRisk.length} at risk`;

  const vipRev = vip.reduce((s,c)=>s+c.totalSpend,0);
  const allRev = CUSTOMERS_DB.reduce((s,c)=>s+c.totalSpend,0);
  setEl('ai-cust-banner', `
    <div class="ai-team-insight">
      <div class="ai-team-icon"><i class="fas fa-brain"></i></div>
      <div class="ai-team-text">
        <strong>AI Customer Intelligence:</strong> ${vip.length} VIP customers generate ${Math.round(vipRev/allRev*100)}% of total revenue.
        ${atRisk.length > 0 ? `${atRisk.length} customer${atRisk.length>1?'s':''} show churn signals — AI recommends a win-back campaign with 15% discount within 48 hours.` : 'All customers show healthy engagement. No churn risk detected.'}
        <span class="ai-team-conf">Confidence: ${87+Math.floor(Math.random()*8)}%</span>
      </div>
    </div>`);

  setEl('cust-grid', CUSTOMERS_DB.map(c => {
    const seg  = aiCustomerSegment(c); const ltv = aiCustomerLTV(c); const churn = aiChurnRisk(c);
    const daysSince = Math.floor((new Date('2026-05-04') - new Date(c.lastOrder)) / 86400000);
    return `
    <div class="cust-card">
      <div class="cust-card-top">
        <div class="cust-avatar-lg" style="background:${stringToColor(c.name)}">${c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div class="cust-info">
          <div class="cust-info-name">${c.name}</div>
          <div class="cust-info-sub">${c.area} · ${c.phone}</div>
        </div>
        <span class="cust-seg ${seg.cls}">${seg.icon} ${seg.label}</span>
      </div>
      <div class="cust-stats">
        <div class="cust-stat-item"><div class="cust-stat-val">₹${c.totalSpend.toLocaleString()}</div><div class="cust-stat-lbl">Spent</div></div>
        <div class="cust-stat-item"><div class="cust-stat-val">${c.orders}</div><div class="cust-stat-lbl">Orders</div></div>
        <div class="cust-stat-item"><div class="cust-stat-val">₹${ltv.toLocaleString()}</div><div class="cust-stat-lbl">Pred. LTV</div></div>
        <div class="cust-stat-item"><div class="cust-stat-val">${c.rating ? c.rating+'⭐' : '—'}</div><div class="cust-stat-lbl">Rating</div></div>
      </div>
      <div class="cust-services">${c.services.map(s=>`<span class="svc-tag">${s}</span>`).join('')}</div>
      <div class="cust-ai-row">
        <div class="cust-churn">
          <div class="cust-churn-label">Churn Risk <span class="churn-val" style="color:${churn>60?'#ef4444':churn>30?'#f59e0b':'#10b981'}">${churn}%</span></div>
          <div class="churn-bar-bg"><div class="churn-bar-fill" style="width:${churn}%;background:${churn>60?'#ef4444':churn>30?'#f59e0b':'#10b981'}"></div></div>
        </div>
        <div class="cust-last-order">${daysSince===0?'Today':daysSince===1?'Yesterday':daysSince+'d ago'}</div>
      </div>
      <div class="cust-actions">
        <button class="cust-btn" onclick="sendFollowUp('${c.name}','${c.id}')"><i class="fas fa-paper-plane"></i> Follow-up</button>
        <button class="cust-btn cust-btn-ai" onclick="showCustomerAI('${c.id}')"><i class="fas fa-brain"></i> AI Insights</button>
      </div>
    </div>`;
  }).join(''));
}

function sendFollowUp(name, id) {
  soundNotif();
  const c    = CUSTOMERS_DB.find(c=>c.id===id);
  const msgs = [`Hi ${name}! We miss you at FreshFold. Here's 15% OFF your next order — use code COMEBACK15!`,
                `Hello ${name}! Time for a wardrobe refresh? Book a pickup today and get priority service!`,
                `Hey ${name}! Your favourite service is available. Book now and we'll have your clothes back by tomorrow! 🧺`];
  showToast('Follow-up Sent', `AI-drafted WhatsApp message sent to ${name}`, 'success', 4000, 'updates');
}

function showCustomerAI(id) {
  const c = CUSTOMERS_DB.find(c=>c.id===id); if (!c) return;
  const seg = aiCustomerSegment(c); const ltv = aiCustomerLTV(c); const churn = aiChurnRisk(c);
  const insights = [
    `${c.name} has spent ₹${c.totalSpend.toLocaleString()} across ${c.orders} orders. Average order value: ₹${Math.round(c.totalSpend/c.orders).toLocaleString()}.`,
    `Predicted lifetime value: ₹${ltv.toLocaleString()}. AI segment: ${seg.icon} ${seg.label}.`,
    churn > 60 ? `⚠️ High churn risk (${churn}%). AI recommends a personalised win-back offer within 48 hours.` : `Churn risk is low at ${churn}%. Customer shows strong retention signals.`,
    `Primary services: ${c.services.join(', ')}. ${c.services.length > 1 ? 'Multi-service customer — 2.3× higher retention rate.' : 'Single-service customer — upsell opportunity detected.'}`,
    c.rating >= 5 ? `Perfect 5-star rating! Ideal candidate for referral program.` : c.rating ? `Rating: ${c.rating}/5. Consider a quality follow-up on next order.` : `No rating yet. AI recommends triggering a review request on next delivery.`,
  ];
  userState.name = c.name.split(' ')[0];
  openAIModal('customers');
  setTimeout(() => {
    document.getElementById('ai-summary-text').innerHTML = `<div class="ai-greeting">Customer Report: <strong>${c.name}</strong></div>${insights.map(i=>`<div style="margin-bottom:8px">${i}</div>`).join('')}`;
    document.getElementById('ai-stats-grid').innerHTML = `
      <div class="ai-stat-item"><span class="ai-stat-label"><i class="fas fa-rupee-sign"></i> Total Spent</span><span class="ai-stat-val">₹${c.totalSpend.toLocaleString()}</span></div>
      <div class="ai-stat-item"><span class="ai-stat-label"><i class="fas fa-chart-line"></i> Predicted LTV</span><span class="ai-stat-val">₹${ltv.toLocaleString()}</span></div>
      <div class="ai-stat-item"><span class="ai-stat-label"><i class="fas fa-exclamation-triangle"></i> Churn Risk</span><span class="ai-stat-val" style="color:${churn>60?'#ef4444':churn>30?'#f59e0b':'#10b981'}">${churn}%</span></div>
      <div class="ai-stat-item"><span class="ai-stat-label"><i class="fas fa-tag"></i> AI Segment</span><span class="ai-stat-val">${seg.icon} ${seg.label}</span></div>`;
    document.getElementById('ai-tip-box').innerHTML = `<i class="fas fa-lightbulb" style="color:#f59e0b;font-size:18px;flex-shrink:0"></i> ${buildPersonalTip(c.services[0])}`;
    document.getElementById('ai-loader').classList.add('hidden');
    document.getElementById('ai-content').classList.remove('hidden');
  }, 1200);
}

// ─── VOICE AI INVOICE ─────────────────────────────────────────────────────────
let voiceRecognition = null; let voiceListening = false;

function openVoiceInvoice() {
  soundAI();
  document.getElementById('voice-invoice-modal').classList.remove('hidden');
  setEl('vi-result',''); setEl('vi-transcript','');
  document.getElementById('vi-status').textContent = 'Click the mic button or use Demo Mode to create an invoice by voice.';
  document.getElementById('vi-mic-btn').classList.remove('listening');
}
function closeVoiceInvoice() {
  soundClick(); if (voiceRecognition) voiceRecognition.stop(); voiceListening = false;
  document.getElementById('voice-invoice-modal').classList.add('hidden');
}
function toggleVoiceListen() {
  if (voiceListening) { if (voiceRecognition) voiceRecognition.stop(); voiceListening = false; document.getElementById('vi-mic-btn').classList.remove('listening'); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { demoVoiceInvoice(); return; }
  voiceRecognition = new SR(); voiceRecognition.lang = 'en-IN'; voiceRecognition.interimResults = true;
  voiceListening = true; document.getElementById('vi-mic-btn').classList.add('listening');
  document.getElementById('vi-status').textContent = '🎙️ Listening… Speak your order details';
  voiceRecognition.onresult = e => {
    const t = Array.from(e.results).map(r=>r[0].transcript).join('');
    document.getElementById('vi-transcript').textContent = `"${t}"`;
    if (e.results[0].isFinal) { voiceListening = false; document.getElementById('vi-mic-btn').classList.remove('listening'); processVoiceInvoice(t); }
  };
  voiceRecognition.onerror = () => demoVoiceInvoice();
  voiceRecognition.onend   = () => { voiceListening = false; document.getElementById('vi-mic-btn').classList.remove('listening'); };
  voiceRecognition.start();
}
function demoVoiceInvoice() {
  const demos = ['Customer Rahul Sharma, wash and fold, 5 kilos, cash payment','Priya Singh, dry cleaning, 3 shirts and 2 pants, UPI payment','New customer Amit, iron and press, 8 pieces, collect on delivery','Sunita Gupta, stain removal, 2 items, advance paid'];
  const sample = pickRandom(demos);
  document.getElementById('vi-status').textContent = '🎙️ Demo — simulating voice input…';
  document.getElementById('vi-mic-btn').classList.add('listening');
  let i = 0;
  const iv = setInterval(() => {
    document.getElementById('vi-transcript').textContent = `"${sample.slice(0,i)}"`;
    i += 4; if (i >= sample.length) { clearInterval(iv); document.getElementById('vi-transcript').textContent = `"${sample}"`; document.getElementById('vi-mic-btn').classList.remove('listening'); setTimeout(() => processVoiceInvoice(sample), 400); }
  }, 55);
}
function processVoiceInvoice(transcript) {
  soundAI(); document.getElementById('vi-status').textContent = '🤖 AI processing your voice input…';
  const t = transcript.toLowerCase();
  const svcMap = {'wash and fold':'Wash & Fold','dry cleaning':'Dry Cleaning','iron':'Iron & Press','stain':'Stain Removal','shoe':'Shoe Cleaning'};
  let svc = 'Wash & Fold'; for (const [k,v] of Object.entries(svcMap)) if (t.includes(k)) { svc=v; break; }
  const kgM = t.match(/(\d+)\s*kilo/); const pcsM = t.match(/(\d+)\s*(piece|shirt|pant|item)/);
  const kg = kgM ? parseFloat(kgM[1]) : null; const items = pcsM ? parseInt(pcsM[1]) : null;
  const rates = {'Wash & Fold':49,'Dry Cleaning':149,'Iron & Press':12,'Stain Removal':79,'Shoe Cleaning':99};
  const amount = kg ? Math.round(kg*rates[svc]) : (items ? items*rates[svc] : rates[svc]*3);
  const words = transcript.split(' '); const nameWords = words.filter(w=>/^[A-Z][a-z]+$/.test(w)).slice(0,2);
  const custName = nameWords.length >= 2 ? nameWords.join(' ') : (nameWords[0] || 'New Customer');
  const oid = 'FF-'+(2060+Math.floor(Math.random()*30));
  setTimeout(() => {
    document.getElementById('vi-status').textContent = '✅ Invoice created! Review and confirm below.';
    setEl('vi-result', `<div class="vi-invoice">
      <div class="vi-invoice-header"><div class="vi-invoice-badge"><i class="fas fa-microphone"></i> Voice Invoice</div><div class="vi-invoice-id">${oid}</div></div>
      <div class="vi-row"><span>Customer</span><strong>${custName}</strong></div>
      <div class="vi-row"><span>Service</span><strong>${svc}</strong></div>
      <div class="vi-row"><span>Qty</span><strong>${kg ? kg+' kg' : items ? items+' pcs' : '—'}</strong></div>
      <div class="vi-row vi-total"><span>Total</span><strong>₹${amount}</strong></div>
      <button class="btn-primary" style="width:100%;justify-content:center;margin-top:12px" onclick="confirmVoiceOrder('${oid}','${custName}','${svc}',${amount})"><i class="fas fa-check"></i> Confirm &amp; Add Order</button>
    </div>`);
    speak(`Invoice ready! ${custName}, ${svc}, rupees ${amount}. Please confirm to add the order.`, 'orders');
  }, 1400);
}
function confirmVoiceOrder(oid, name, svc, amount) {
  soundPaytm(); showSoundbox(`Order Added!\n${oid}`, `Order confirmed for ${name}. ${svc}. Amount rupees ${amount}.`);
  showToast('Order Added via Voice', `${oid} — ${name} · ${svc} · ₹${amount}`, 'success', 5000, 'orders');
  speak(`${name.split(' ')[0]} placed an order for ${svc}. Amount rupees ${amount}.`, 'orders');
  DB.orders.unshift({id:oid,customer:name,phone:'—',service:svc,kg:null,items:null,amount,status:'pending',date:'2026-05-04',time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),rating:null,area:'—'});
  closeVoiceInvoice(); setTimeout(() => renderOrders(), 300);
}

// ─── PHOTO TO INVOICE ─────────────────────────────────────────────────────────
function openPhotoScan() {
  soundClick(); document.getElementById('photo-scan-modal').classList.remove('hidden');
  setEl('ps-result',''); document.getElementById('ps-status').textContent = 'Upload a photo of clothing items to scan'; document.getElementById('ps-file').value='';
}
function closePhotoScan() { soundClick(); document.getElementById('photo-scan-modal').classList.add('hidden'); }
function onPhotoSelected(input) { if (input.files && input.files[0]) simulatePhotoScan(input.files[0].name); }
function simulatePhotoScan(filename) {
  soundAI(); document.getElementById('ps-status').textContent = '🤖 AI scanning image with computer vision…';
  setEl('ps-result', `<div class="ps-scanning"><div class="ps-scan-line"></div><div class="ps-scan-label">Detecting clothing items…</div></div>`);
  const POOL = { 'Dress Shirt':{c:[1,2,3],s:'Iron & Press',r:45},'Trousers':{c:[1,2,3],s:'Iron & Press',r:35},'Saree':{c:[1,2],s:'Dry Cleaning',r:199},'Jacket':{c:[1,2],s:'Dry Cleaning',r:249},'T-Shirt':{c:[2,3,4],s:'Wash & Fold',r:20},'Jeans':{c:[1,2],s:'Wash & Fold',r:35},'Bedsheet':{c:[1,2,3],s:'Wash & Fold',r:60},'Kurta':{c:[1,2,3],s:'Iron & Press',r:30} };
  const keys = shuffle(Object.keys(POOL)).slice(0, 3+Math.floor(Math.random()*3));
  const detected = keys.map(name => { const p=POOL[name]; const qty=p.c[Math.floor(Math.random()*p.c.length)]; return {name,qty,service:p.s,rate:p.r,total:qty*p.r}; });
  const grand = detected.reduce((s,i)=>s+i.total,0);
  const oid = 'FF-'+(2090+Math.floor(Math.random()*30));
  setTimeout(() => {
    document.getElementById('ps-status').textContent = `✅ Detected ${detected.reduce((s,i)=>s+i.qty,0)} items across ${detected.length} categories`;
    setEl('ps-result', `<div class="ps-invoice">
      <div class="vi-invoice-badge" style="margin-bottom:12px"><i class="fas fa-camera"></i> AI Photo Scan — ${oid}</div>
      <table class="ps-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Service</th><th>Amount</th></tr></thead>
        <tbody>${detected.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td><td><span class="svc-tag">${i.service}</span></td><td>₹${i.total}</td></tr>`).join('')}</tbody>
      </table>
      <div class="ps-total">Total: <strong>₹${grand}</strong></div>
      <button class="btn-primary" style="width:100%;justify-content:center;margin-top:12px" onclick="confirmPhotoOrder('${oid}',${grand})"><i class="fas fa-check"></i> Confirm Invoice &amp; Add Order</button>
    </div>`);
    speak(`Photo scanned! I detected ${detected.reduce((s,i)=>s+i.qty,0)} items. Total is rupees ${grand}. Please confirm to add the order.`, 'orders');
  }, 2200);
}
function confirmPhotoOrder(oid, amount) {
  soundPaytm(); showSoundbox(`Order Added!\n${oid}`, `Photo invoice confirmed. Amount rupees ${amount}.`);
  showToast('Photo Invoice Added', `${oid} · ₹${amount} — via AI Photo Scan`, 'success', 5000, 'orders');
  speak(`New order placed via photo scan for rupees ${amount}.`, 'orders');
  DB.orders.unshift({id:oid,customer:'Photo Customer',phone:'—',service:'Multiple',kg:null,items:null,amount,status:'pending',date:'2026-05-04',time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),rating:null,area:'—'});
  closePhotoScan(); setTimeout(() => renderOrders(), 300);
}

function markOrderPaid(oid, name, svc, amount) {
  const o = DB.orders.find(x => x.id === oid);
  if (o) o.status = 'completed';
  soundPaytm();
  showSoundbox(`Payment Received!\n₹${amount}`, `${name} paid rupees ${amount}.`);
  showToast('Payment Received', `${name} paid ₹${amount} for ${svc}`, 'success', 5000, 'payments');
  speak(`${name.split(' ')[0]} paid rupees ${amount}.`, 'payments');
  setTimeout(() => renderOrders(), 300);
}

// ─── AI SOCIAL MEDIA MANAGER ──────────────────────────────────────────────────
const SOCIAL_TEMPLATES = {
  instagram: [
    `✨ Fresh clothes, fresh start! Our {service} service transformed {orders}+ garments this week in {area}. Book now — doorstep pickup available! 🏠👕\n\n#FreshFold #LaundryService #{areatag} #CleanClothes`,
    `💧 Rated {rating}⭐ by our happy customers! Your clothes deserve expert care. Try our {service} today — first order 20% OFF! 🎉\n\n#LaundryLove #FreshFold #CleanAndCrisp`,
    `⏰ Book before 10 AM = same-day delivery ✅\n\nFreshFold handles pickup, cleaning, and drop-off so you don't have to!\n\n📲 Book now via WhatsApp\n#FreshFold #SameDayLaundry #{areatag}`,
    `👕 Professional {service} extends your fabric life by 3×! Protect your wardrobe with FreshFold.\n\n✅ Eco-friendly · ✅ Expert handling · ✅ Free pickup\n\n#FreshFold #FabricCare #{areatag}`,
  ],
  facebook: [
    `🎉 This week at FreshFold!\n\n✅ {orders} orders completed\n⭐ {rating}/5 average rating\n🚀 Serving {area} & surrounding areas\n\nBook your pickup today! Use code FRESH20 for 20% OFF your first order.\n👉 WhatsApp: +91 99999 00000`,
    `💡 Fabric Care Tip from our experts:\n\nProfessional {service} garments last 3× longer. Our specialists use premium care solutions.\n\n📦 Free pickup in {area}\n⚡ 24-hour turnaround · 💳 Pay after delivery\n\nBook now!`,
    `📢 Weekend Special Offer!\n\n15% OFF on {service} this weekend only!\n\n🏠 We come to you · ⏱️ Same-day available · 🌟 Rated {rating}/5\n\nLimited slots — call or WhatsApp to book!`,
  ],
  whatsapp: [
    `Hello {name}! 👋\n\nThis is FreshFold. It's been a while since your last order. We miss you! 😊\n\nSpecial offer just for you: 15% OFF your next {service} order.\nCode: COMEBACK15 — valid 48 hours only!\n\nReply to book 🧺`,
    `Hi {name}! 🌟\n\nYour FreshFold pickup is confirmed! Driver will arrive between 11 AM – 1 PM.\n\nOrder ID: FF-{oid}\nService: {service}\nEstimated delivery: Tomorrow by 7 PM\n\nThank you! 🙏`,
    `Dear {name},\n\nThank you for choosing FreshFold! How was your experience?\n\nReply with 1–5 (5 = Excellent) ⭐\n\nAs thanks, enjoy 10% OFF your next order!\nCode: THANKS10 ✨`,
  ],
};

function renderSocialAI() {
  const ratings = DB.orders.filter(o=>o.rating);
  const avgRating = (ratings.reduce((s,o)=>s+o.rating,0)/ratings.length).toFixed(1);
  window._socialVars = { orders:DB.orders.length, rating:avgRating, area:'Koramangala', areatag:'Koramangala', service:'Wash & Fold', name:'Customer', oid:'2048' };
  setEl('social-ai-section', `
    <div class="social-ai-wrap">
      <div class="social-ai-header">
        <div class="card-title"><i class="fas fa-share-alt" style="color:#e1306c"></i> AI Social Media Manager</div>
        <div style="font-size:12px;color:#64748b">AI generates posts from your real business data</div>
      </div>
      <div class="social-tabs">
        <button class="social-tab active" onclick="switchSocialTab('instagram',this)"><i class="fab fa-instagram" style="color:#e1306c"></i> Instagram</button>
        <button class="social-tab" onclick="switchSocialTab('facebook',this)"><i class="fab fa-facebook" style="color:#1877f2"></i> Facebook</button>
        <button class="social-tab" onclick="switchSocialTab('whatsapp',this)"><i class="fab fa-whatsapp" style="color:#25d366"></i> WhatsApp</button>
      </div>
      <div id="social-content-area">${buildSocialPosts('instagram')}</div>
    </div>`);
}
function fillSocialTpl(t) {
  const v = window._socialVars || {};
  return t.replace(/{(\w+)}/g, (_, k) => v[k] || '');
}
function buildSocialPosts(platform) {
  const posts = SOCIAL_TEMPLATES[platform] || [];
  const icons = {instagram:'fa-instagram',facebook:'fa-facebook',whatsapp:'fa-whatsapp'};
  const colors= {instagram:'#e1306c',facebook:'#1877f2',whatsapp:'#25d366'};
  return posts.map((post,i) => `
    <div class="social-post-card">
      <div class="social-post-header">
        <div class="social-platform-tag" style="color:${colors[platform]}"><i class="fab ${icons[platform]}"></i> ${platform.charAt(0).toUpperCase()+platform.slice(1)} — Post ${i+1}</div>
        <div class="social-post-actions">
          <button class="soc-btn" onclick="copySocialPost(this)"><i class="fas fa-copy"></i> Copy</button>
          <button class="soc-btn soc-btn-pri" onclick="scheduleSocialPost('${platform}',this)"><i class="fas fa-calendar-plus"></i> Schedule</button>
        </div>
      </div>
      <div class="social-post-body">${fillSocialTpl(post).replace(/\n/g,'<br>')}</div>
      <div class="social-post-footer"><i class="fas fa-brain"></i> AI-generated from business data · Engagement score: ${72+Math.floor(Math.random()*22)}%</div>
    </div>`).join('');
}
function switchSocialTab(platform, el) {
  document.querySelectorAll('.social-tab').forEach(t=>t.classList.remove('active'));
  if (el) el.classList.add('active');
  setEl('social-content-area', buildSocialPosts(platform));
}
function copySocialPost(btn) {
  const txt = btn.closest('.social-post-card').querySelector('.social-post-body').innerText;
  navigator.clipboard.writeText(txt).catch(()=>{});
  const orig = btn.innerHTML; btn.innerHTML='<i class="fas fa-check"></i> Copied!'; btn.style.color='#10b981';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.color='';},2000); soundNotif();
}
function scheduleSocialPost(platform, btn) {
  soundNotif();
  const times=['Today 7:00 PM','Tomorrow 9:00 AM','Tomorrow 6:30 PM','Day after 10:00 AM'];
  const t = pickRandom(times);
  const orig = btn.innerHTML; btn.innerHTML='<i class="fas fa-check"></i> Scheduled!'; btn.style.background='#10b981';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.background='';},3000);
  showToast('Post Scheduled!',`${platform.charAt(0).toUpperCase()+platform.slice(1)} post scheduled for ${t}`,'success',4000,'updates');
}

// ─── AI PRICE OPTIMIZER ───────────────────────────────────────────────────────
function renderPriceOptimizer() {
  const priceData = [
    {service:'Wash & Fold',   cur:49,  ai:54,  demand:82, elastic:'Low',    gain:'+₹245/wk'},
    {service:'Dry Cleaning',  cur:149, ai:159, demand:74, elastic:'Medium', gain:'+₹190/wk'},
    {service:'Iron & Press',  cur:12,  ai:12,  demand:90, elastic:'High',   gain:'Optimal'},
    {service:'Stain Removal', cur:79,  ai:89,  demand:61, elastic:'Low',    gain:'+₹80/wk'},
    {service:'Shoe Cleaning', cur:99,  ai:109, demand:55, elastic:'Low',    gain:'+₹60/wk'},
  ];
  setEl('price-optimizer', `
    <div class="price-opt-wrap">
      <div class="price-opt-head">
        <div><i class="fas fa-brain" style="color:#6366f1"></i> <strong>AI Price Optimizer</strong></div>
        <div class="price-opt-conf">AI Confidence: 84% · 90-day demand analysis</div>
      </div>
      ${priceData.map(p=>`
        <div class="price-opt-row">
          <div><span class="svc-tag">${p.service}</span></div>
          <div class="price-cur">Current: <strong>₹${p.cur}/unit</strong></div>
          <div class="price-ai ${p.ai>p.cur?'price-up':'price-ok-cls'}">AI: <strong>₹${p.ai}</strong>${p.ai>p.cur?`<span class="pdelta">+₹${p.ai-p.cur}</span>`:'<span class="pok">✓ Optimal</span>'}</div>
          <div class="price-demand"><span style="font-size:11px;color:#64748b">Demand ${p.demand}%</span><div class="demand-bg"><div class="demand-fill" style="width:${p.demand}%;background:${p.demand>75?'#10b981':p.demand>50?'#f59e0b':'#ef4444'}"></div></div></div>
          <div><span class="elastic-badge elastic-${p.elastic.toLowerCase()}">${p.elastic}</span></div>
          <div style="color:#10b981;font-weight:700;font-size:13px">${p.gain}</div>
        </div>`).join('')}
      <div class="price-opt-summary">
        <i class="fas fa-lightbulb" style="color:#f59e0b;flex-shrink:0"></i>
        <span>Apply pricing on Wash & Fold + Dry Cleaning first. Projected weekly gain: <strong>+₹435</strong>.</span>
        <button class="btn-sm-primary" onclick="applyPriceChanges()">Apply AI Pricing</button>
      </div>
    </div>`);
}
function applyPriceChanges() {
  soundPaytm();
  showToast('AI Pricing Applied!','New prices live. Expected uplift: +₹435/week','success',5000,'updates');
}

// ─── AI SMART ALERTS ─────────────────────────────────────────────────────────
function renderSmartAlerts() {
  const inv = DB.inventory.map(aiInventoryAnalyze);
  const critInv = inv.filter(i=>i.urgency==='critical');
  const pendOrd = DB.orders.filter(o=>o.status==='pending');
  const atRiskC = CUSTOMERS_DB.filter(c=>aiChurnRisk(c)>60);
  const alerts = [];
  if (critInv.length>0) alerts.push({icon:'fa-boxes',color:'#ef4444',text:`${critInv[0].name} has ${critInv[0].daysLeft} day(s) left — urgent restock needed`,page:'inventory'});
  if (pendOrd.length>3)  alerts.push({icon:'fa-truck',color:'#f59e0b',text:`${pendOrd.length} pending pickups — consider dispatching an extra driver`,page:'orders'});
  if (atRiskC.length>0)  alerts.push({icon:'fa-user-times',color:'#8b5cf6',text:`${atRiskC.length} customer${atRiskC.length>1?'s':''} at churn risk — AI recommends win-back campaign`,page:'customers'});
  alerts.push({icon:'fa-chart-line',color:'#10b981',text:`Revenue on track: ₹${(7200+Math.floor(Math.random()*1200)).toLocaleString()} forecast for today`,page:'analytics'});
  setEl('smart-alerts', alerts.map(a=>`
    <div class="smart-alert" onclick="goPage('${a.page}',null)">
      <div class="smart-alert-icon" style="color:${a.color};background:${a.color}18"><i class="fas ${a.icon}"></i></div>
      <div class="smart-alert-text">${a.text}</div>
      <i class="fas fa-chevron-right" style="color:#94a3b8;font-size:12px;flex-shrink:0"></i>
    </div>`).join(''));
}

// ─── DASHBOARD INIT ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Rotate AI hub feed entries periodically
  setInterval(() => {
    if (DB.aiHubFeed.length > 0) {
      const newEntry = pickRandom(generateAIFeedEntries());
      DB.aiHubFeed.unshift(newEntry);
      if (DB.aiHubFeed.length > 20) DB.aiHubFeed.pop();
    }
  }, 15000);

  // Refresh AI banner every 45s
  setInterval(() => {
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      typewriterEffect('ai-banner-text', aiDashboardBriefing(), 24);
    }
  }, 45000);

  // Refresh KPI jitter every 30s (simulate live data)
  setInterval(() => {
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      const el = document.getElementById('kpi-orders');
      if (el) {
        const base = parseInt(el.textContent) || 0;
        const nudge = Math.random() > 0.7 ? 1 : 0;
        if (nudge) {
          el.textContent = base + nudge;
          el.style.color = '#10b981';
          setTimeout(() => el.style.color = '', 2000);
        }
      }
    }
  }, 30000);
});
