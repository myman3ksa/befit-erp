// ============================================================
// SUPABASE + CONFIG
// ============================================================
const { createClient } = supabase;
const SUPABASE_URL  = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta2RlcnpkaXBremdpdGlkbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODMzMTEsImV4cCI6MjA4ODU1OTMxMX0.5lcOpcwG6op3El3Sa0hRecvjFmV2KTdgiJ2XA2-Ebd0';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// GLOBAL CACHE
// ============================================================
let cachedItems     = [];
let cachedBranches  = [];
let cachedSuppliers = [];
let dashCharts      = {};

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(pageId) {
    const target = document.getElementById(pageId);
    if (!target) return;

    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links li[data-target="${pageId}"]`)?.classList.add('active');

    document.querySelectorAll('.page-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    target.classList.add('active');
    target.style.display = 'block';

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open'); // Close on mobile navigation

    history.replaceState(null, '', '#' + pageId);
    localStorage.setItem('man3_page', pageId);

    if (pageId === 'dashboard-section') loadDashboard();
    if (pageId === 'purchasing-section') loadPurchaseOrders();
    if (pageId === 'inventory-section') loadInventoryItems();
    if (pageId === 'admin-section') loadBranches();
    if (pageId === 'suppliers-section') loadSuppliers();
    if (pageId === 'wastage-section') loadWastageLogs();
}

window.addEventListener('hashchange', () => {
    const h = window.location.hash.substring(1);
    if (h) navigateTo(h);
});

// ============================================================
// BOOT
// ============================================================
async function boot() {
    console.log("🚀 MAN-3 ERP Initializing...");
    await Promise.all([
        loadBranches(),
        loadInventoryItems(),
        loadSuppliers(),
        loadPurchaseOrders()
    ]);
    
    const saved = window.location.hash.substring(1) || localStorage.getItem('man3_page') || 'dashboard-section';
    navigateTo(document.getElementById(saved) ? saved : 'dashboard-section');
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
    const [
        { data: branches },
        { data: suppliers },
        { data: items },
        { data: inventory },
        { data: pos },
        { data: wastage },
        { data: production }
    ] = await Promise.all([
        sb.from('branches').select('*'),
        sb.from('suppliers').select('*'),
        sb.from('items').select('*, inventory(quantity)'),
        sb.from('inventory').select('*, items(name,base_cost), branches(name)'),
        sb.from('purchase_orders').select('*, suppliers(name), branches(name)').order('created_at', { ascending: false }),
        sb.from('wastage_logs').select('*, items(name)').order('created_at', { ascending: false }),
        sb.from('production_logs').select('*, branches(name)').order('created_at', { ascending: false })
    ]);

    const B = branches || [];
    const S = suppliers || [];
    const I = items || [];
    const IV = inventory || [];
    const P = pos || [];
    const W = wastage || [];
    const PR = production || [];

    const totalSpend = P.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0);
    const lowStock = I.filter(i => { 
        const q = (i.inventory||[]).reduce((s,r)=>s+(parseFloat(r.quantity)||0),0); 
        return q > 0 && q <= 10; 
    }).length;

    // Mini KPIs (Top 3)
    setKPI('kpi-po-count', P.length);
    setKPI('kpi-branch-orders', `SAR ${fmtNum(totalSpend)}`);
    setKPI('kpi-total-orders', PR.length);

    // 12-Card Grid (Full Operational View)
    setKPI('dash-kpi-1', dashboardCardHTML('bx-cart', '#f39c12', P.length, 'Total POs', `${P.filter(p=>p.status==='pending').length} Pending`));
    setKPI('dash-kpi-2', dashboardCardHTML('bx-money', '#2ecc71', `SAR ${fmtNum(totalSpend)}`, 'Total Spend', 'Gross Value'));
    setKPI('dash-kpi-3', dashboardCardHTML('bx-buildings', '#3498db', B.length, 'Branches', `${B.filter(b=>b.status==='active').length} Active`));
    setKPI('dash-kpi-4', dashboardCardHTML('bx-store', '#9b59b6', S.length, 'Suppliers', 'Active Network'));
    setKPI('dash-kpi-5', dashboardCardHTML('bx-package', '#2ecc71', I.length, 'Total Items', 'SKU Catalog'));
    setKPI('dash-kpi-6', dashboardCardHTML('bx-error', '#e74c3c', lowStock, 'Low Stock', 'Requires Order'));
    
    const invVal = IV.reduce((s,r)=>(s+(parseFloat(r.quantity)||0)*(parseFloat(r.items?.base_cost)||0)),0);
    setKPI('dash-kpi-7', dashboardCardHTML('bx-money-withdraw', '#f1c40f', `SAR ${fmtNum(invVal)}`, 'Inventory Value', 'Asset Estimate'));
    setKPI('dash-kpi-8', dashboardCardHTML('bx-trash', '#e74c3c', W.length, 'Wastage Items', 'Loss Reporting'));
    setKPI('dash-kpi-9', dashboardCardHTML('bx-dish', '#3498db', PR.length, 'Production', 'Daily Output'));
    setKPI('dash-kpi-10', dashboardCardHTML('bx-credit-card', '#e74c3c', '0.00', 'Payables', 'Past Due'));
    setKPI('dash-kpi-11', dashboardCardHTML('bx-check-circle', '#2ecc71', P.filter(p=>p.status==='received').length, 'Received POs', 'Success Rate'));
    setKPI('dash-kpi-12', dashboardCardHTML('bx-file', '#f39c12', '0', 'VAT Invoices', 'Tax Reporting'));

    buildDashCharts({ B, S, I, IV, P, W, PR });
}

function dashboardCardHTML(icon, color, val, label, sub) {
    return `
    <div class="dk-icon" style="background:${color}22"><i class='bx ${icon}' style="color:${color}"></i></div>
    <div class="dk-info">
        <span class="dk-val">${val}</span>
        <span class="dk-label">${label}</span>
        <span class="dk-sub">${sub}</span>
    </div>`;
}

// ============================================================
// CHARTS (COMPREHENSIVE)
// ============================================================
function buildDashCharts({ B, S, I, IV, P, W, PR }) {
    const GRID = { color: 'rgba(255,255,255,0.04)' };
    const TICK = { color: '#888' };
    const baseOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: GRID, ticks: TICK }, y: { grid: GRID, ticks: TICK } }
    };

    const mkChart = (id, cfg) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (dashCharts[id]) dashCharts[id].destroy();
        dashCharts[id] = new Chart(el, cfg);
    };

    // 1. Daily PO Spend
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6-i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
    mkChart('dailyUsageChart', {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Spend', data: [1200, 1900, 1500, 2400, 2100, 3000, 2800],
                borderColor: '#f39c12', tension: 0.4, fill: true, backgroundColor: 'rgba(243,156,18,0.1)'
            }]
        },
        options: baseOpts
    });

    // 2. POs by Hour (Simulated)
    mkChart('hourlyPOChart', {
        type: 'bar',
        data: {
            labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'],
            datasets: [{ data: [2, 5, 8, 4, 6, 9, 3, 1], backgroundColor: '#3498db', borderRadius: 4 }]
        },
        options: baseOpts
    });

    // 3. Mini Sparklines
    const mkSpark = (id, data, color) => {
        mkChart(id, {
            type: 'line',
            data: { labels: data.map((_,i)=>i), datasets: [{ data, borderColor: color, borderWidth: 2, pointRadius: 0, fill: true, backgroundColor: color+'11', tension: 0.4 }] },
            options: { ...baseOpts, scales: { x: { display: false }, y: { display: false } } }
        });
    };
    mkSpark('miniChartPO', [10, 15, 8, 20, 15, 25, 22], '#f39c12');
    mkSpark('miniChartBranchOrders', [4000, 3000, 5000, 4500, 6000, 5500, 7000], '#2ecc71');
    mkSpark('miniChartTotalOrders', [50, 60, 45, 80, 70, 90, 85], '#3498db');

    // 4. Pie Charts
    const PIE_COLORS = ['#f39c12', '#2ecc71', '#e74c3c', '#3498db', '#9b59b6'];

    // Top Produced
    mkChart('productionPieChart', {
        type: 'doughnut',
        data: { labels: ['Meat', 'Dairy', 'Veg', 'Dry'], datasets: [{ data: [40, 25, 20, 15], backgroundColor: PIE_COLORS, borderWidth: 0 }] },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { size: 10 } } } } }
    });

    // Top Wastage
    mkChart('wastagePieChart', {
        type: 'doughnut',
        data: { labels: ['Expired', 'Prep Loss', 'Spoiled'], datasets: [{ data: [50, 30, 20], backgroundColor: ['#e74c3c', '#f39c12', '#9b59b6'], borderWidth: 0 }] },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { size: 10 } } } } }
    });

    // Branch Production
    const branchLabels = B.slice(0, 4).map(b => b.name);
    mkChart('branchesProductionPieChart', {
        type: 'doughnut',
        data: { labels: branchLabels.length ? branchLabels : ['Main', 'Jeddah', 'Dammam'], datasets: [{ data: [55, 30, 15], backgroundColor: PIE_COLORS, borderWidth: 0 }] },
        options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { size: 10 } } } } }
    });
}

// ============================================================
// DATA LOADERS
// ============================================================
window.filterPO = s => loadPurchaseOrders(s);

async function loadPurchaseOrders(filter = 'all') {
    let q = sb.from('purchase_orders').select('*, branches(name), suppliers(name)');
    if (filter !== 'all') q = q.eq('status', filter);
    
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error || !data) return;
    const tbody = document.getElementById('purchasing-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(po => {
        const sub = (po.total_amount || 0) / 1.15;
        const vat = (po.total_amount || 0) - sub;
        const num = po.po_number || po.id.slice(0, 5).toUpperCase();
        return `
        <tr>
            <td><input type="checkbox"></td>
            <td>#PO-${num}</td>
            <td>${new Date(po.created_at).toLocaleDateString()}</td>
            <td>${po.branches?.name || '—'}</td>
            <td>${po.suppliers?.name || '—'}</td>
            <td>${fmtNum(sub)}</td>
            <td>${fmtNum(vat)}</td>
            <td>SAR ${fmtNum(po.total_amount)}</td>
            <td><span class="status-badge ${po.status}">${po.status}</span></td>
            <td>
                <button class="action-btn" title="View"><i class='bx bx-show'></i></button>
            </td>
        </tr>`;
    }).join('');

    // Page KPIs
    const spend = data.reduce((s,p) => s + (parseFloat(p.total_amount)||0), 0);
    setKPI('po-kpi-total-val', `${data.length} <span class="subtitle">Requests</span>`);
    setKPI('po-kpi-pending-val', `${data.filter(p=>p.status==='pending').length} <span class="subtitle">Pending</span>`);
    setKPI('po-kpi-spend-val', `${fmtNum(spend)} <span class="currency">SAR</span>`);
    setKPI('po-kpi-suppliers', `${cachedSuppliers.length} <span class="subtitle">Vendors</span>`);
}

async function loadInventoryItems() {
    const { data: items, error } = await sb.from('items').select('*, inventory(quantity)').order('name');
    if (error || !items) return;
    cachedItems = items;
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = items.map(i => {
        const qty = (i.inventory||[]).reduce((s,r)=>s+(parseFloat(r.quantity)||0),0);
        const st = qty > 10 ? 'approved' : qty > 0 ? 'pending' : 'danger';
        const lb = qty > 10 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock';
        return `
        <tr>
            <td><input type="checkbox"></td>
            <td>${i.name}</td>
            <td>${i.category || 'General'}</td>
            <td>${i.unit}</td>
            <td>50.0</td>
            <td>200.0</td>
            <td>${qty.toFixed(1)} / 0.0</td>
            <td><strong class="${st==='danger'?'text-danger':st==='pending'?'text-warning':''}">${qty.toFixed(1)}</strong></td>
            <td><span class="status-badge ${st}">${lb}</span></td>
        </tr>`;
    }).join('');

    setKPI('inv-kpi-total', `${items.length} <span class="subtitle">SKUs</span>`);
    setKPI('inv-kpi-low', `${items.filter(i=> {
        const q = (i.inventory||[]).reduce((s,r)=>s+(parseFloat(r.quantity)||0),0);
        return q > 0 && q <= 10;
    }).length} <span class="subtitle">Alerts</span>`);
}

async function loadSuppliers() {
    const { data, error } = await sb.from('suppliers').select('*').order('name');
    if (error || !data) return;
    cachedSuppliers = data;
    const tbody = document.getElementById('suppliers-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(s => `
    <tr>
        <td><input type="checkbox"></td>
        <td><strong>${s.name}</strong></td>
        <td>General</td>
        <td>${s.phone || s.contact_person || '—'}</td>
        <td>—</td>
        <td>SAR 0.00</td>
        <td><span class="status-badge approved">Active</span></td>
        <td>
            <button class="action-btn" onclick="openModal('add-supplier-modal')"><i class='bx bx-edit'></i></button>
        </td>
    </tr>`).join('');

    setKPI('suppliers-kpi-total', `${data.length} <span class="subtitle">Enrolled</span>`);
    setKPI('suppliers-kpi-active', `${data.length} <span class="subtitle">Approved</span>`);

    const poSup = document.getElementById('po-supplier-select');
    if (poSup) poSup.innerHTML = '<option value="">Select Supplier</option>' + data.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
}

async function loadBranches() {
    const { data, error } = await sb.from('branches').select('*').order('name');
    if (error || !data) return;
    cachedBranches = data;
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(b => `
    <tr>
        <td><input type="checkbox"></td>
        <td>${b.name}</td>
        <td>${b.location || '—'}</td>
        <td>${b.manager_name || '—'}</td>
        <td>${b.staff_count || 0}</td>
        <td><span class="status-badge approved">${b.status}</span></td>
        <td>
            <button class="action-btn" onclick="openModal('edit-branch-modal')"><i class='bx bx-edit'></i></button>
        </td>
    </tr>`).join('');

    setKPI('branch-kpi-total', `${data.length} <span class="subtitle">Locations</span>`);
    setKPI('branch-kpi-active', `${data.filter(b=>b.status==='active').length} <span class="subtitle">Operational</span>`);

    const bSels = ['global-branch-select', 'po-branch', 'wastage-branch', 'prod-branch'];
    bSels.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const prefix = id === 'global-branch-select' ? '<option value="all">All Branches</option>' : '';
        el.innerHTML = prefix + data.map(b=>`<option value="${b.id}">${b.name}</option>`).join('');
    });
}

async function loadWastageLogs() {
    const { data, error } = await sb.from('wastage_logs').select('*, items(name), branches(name)').order('created_at', { ascending: false });
    if (error || !data) return;
    const tbody = document.getElementById('wastage-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(l => `
    <tr>
        <td>${new Date(l.created_at).toLocaleDateString()}</td>
        <td>${l.items?.name || '—'}</td>
        <td>${l.branches?.name || 'Main'}</td>
        <td>${l.quantity}</td>
        <td>${l.reason || 'Expired'}</td>
        <td>System</td>
    </tr>`).join('');
}

// ============================================================
// MODALS
// ============================================================
window.openModal = id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; setTimeout(() => el.classList.add('show'), 10); }
};

window.closeModal = id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('show'); setTimeout(() => el.style.display = 'none', 300); }
};

window.addPOItemRow = () => {
    const list = document.getElementById('po-items-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'po-item-row';
    div.innerHTML = `
        <select class="po-item-id" onchange="calculatePOTotal()">
            <option value="">Select Item</option>
            ${cachedItems.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
        </select>
        <input type="number" class="po-item-qty" placeholder="Qty" value="1" oninput="calculatePOTotal()">
        <input type="number" class="po-item-price" placeholder="Price" value="0.00" oninput="calculatePOTotal()">
        <span class="item-total">0.00 SAR</span>
        <i class='bx bx-trash' onclick="this.parentElement.remove();calculatePOTotal()"></i>
    `;
    list.appendChild(div);
};

window.calculatePOTotal = () => {
    let total = 0;
    document.querySelectorAll('.po-item-row').forEach(row => {
        const q = parseFloat(row.querySelector('.po-item-qty').value) || 0;
        const p = parseFloat(row.querySelector('.po-item-price').value) || 0;
        const sub = q * p;
        row.querySelector('.item-total').innerText = sub.toFixed(2) + ' SAR';
        total += sub;
    });
    const el = document.getElementById('po-total-calc');
    if (el) el.innerText = total.toFixed(2);
};

window.submitPO = async () => {
    const sid = document.getElementById('po-supplier-select').value;
    const bid = document.getElementById('po-branch').value;
    const tot = parseFloat(document.getElementById('po-total-calc').innerText);
    if (!sid || !bid || tot <= 0) return alert("Fill all fields.");

    const { data, error } = await sb.from('purchase_orders').insert([{
        supplier_id: sid, branch_id: bid, total_amount: tot, status: 'pending'
    }]).select();

    if (error) return alert(error.message);
    toast("✅ Purchase Order Created!");
    closeModal('po-modal');
    loadPurchaseOrders();
};

// ============================================================
// AI ASSISTANT
// ============================================================
window.askAiAssistant = async () => {
    const input = document.getElementById('ai-user-prompt');
    const q = input.value.trim();
    if (!q) return;

    appendChat('user', q);
    input.value = '';
    
    toast("🤖 Oracle is thinking...");
    
    setTimeout(() => {
        let msg = "Spend analysis: This month SAR 45k. Top supplier: Almarai. Warning: Beef stock low.";
        if (q.toLowerCase().includes('branch')) msg = "Riyadh Olaya is the most active branch this week with 14 production logs.";
        appendChat('assistant', msg);
    }, 1200);
};

function appendChat(role, text) {
    const h = document.getElementById('ai-chat-history');
    if (!h) return;
    const d = document.createElement('div');
    d.className = `ai-bubble ${role}`;
    d.innerText = text;
    h.appendChild(d);
    h.scrollTop = h.scrollHeight;
}

// ============================================================
// HELPERS
// ============================================================
function fmtNum(n) { return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function setKPI(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = val; }
function toast(msg) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed; bottom:30px; right:30px; background:#2ecc71; color:#fff; padding:12px 25px; border-radius:10px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.3); font-weight:500;`;
    t.innerHTML = `<i class='bx bx-check-circle'></i> ${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
}

window.toggleAllCheckboxes = cb => {
    cb.closest('table').querySelectorAll('tbody input[type="checkbox"]').forEach(c => c.checked = cb.checked);
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', () => navigateTo(li.dataset.target));
    });

    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('open');
    });

    document.getElementById('lang-toggle')?.addEventListener('click', () => {
        const isAr = document.documentElement.getAttribute('lang') === 'ar';
        document.documentElement.setAttribute('lang', isAr ? 'en' : 'ar');
        document.documentElement.setAttribute('dir', isAr ? 'ltr' : 'rtl');
    });

    boot();
});
