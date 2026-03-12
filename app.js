// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;
const SUPABASE_URL  = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta2RlcnpkaXBremdpdGlkbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODMzMTEsImV4cCI6MjA4ODU1OTMxMX0.5lcOpcwG6op3El3Sa0hRecvjFmV2KTdgiJ2XA2-Ebd0';
const ANTHROPIC_KEY = 'YOUR_ANTHROPIC_API_KEY'; // <-- Replace with your Claude API key
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ROUTING & NAVIGATION
// ============================================================
function navigateTo(pageId) {
    const target = document.getElementById(pageId);
    if (!target) return;

    // Update Sidebar
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links li[data-target="${pageId}"]`)?.classList.add('active');

    // Update Sections
    document.querySelectorAll('.page-section').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });

    target.classList.add('active');
    target.style.display = 'block';

    // Persistence
    history.replaceState(null, '', '#' + pageId);
    localStorage.setItem('activeSec', pageId);

    if (pageId === 'dashboard-section') renderCharts();
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) navigateTo(hash);
});

// ============================================================
// DATA LOADING
// ============================================================
let cachedItems     = [];
let cachedBranches  = [];
let cachedSuppliers = [];

async function loadInitialData() {
    await Promise.all([
        loadBranches(),
        loadInventoryItems(),
        loadSuppliers(),
        loadWastageLogs(),
        loadPurchaseOrders(),
        loadInvoices(),
        cacheItemsForDropdowns()
    ]);
    syncDashboard();
}

async function cacheItemsForDropdowns() {
    const { data } = await supabaseClient.from('items').select('id, name');
    if (data) cachedItems = data;
}

// ── Branches ──────────────────────────────────────────────────
async function loadBranches() {
    const { data, error } = await supabaseClient.from('branches').select('*').order('name');
    if (error) { console.error('loadBranches:', error); return; }
    if (!data) return;
    cachedBranches = data;

    const tbody = document.getElementById('admin-table-body');
    if (tbody) {
        tbody.innerHTML = data.length === 0
            ? `<tr><td colspan="7" style="text-align:center;">No branches found.</td></tr>`
            : data.map(b => `
                <tr data-id="${b.id}">
                    <td><input type="checkbox"></td>
                    <td>${b.name}</td>
                    <td>${b.location || '—'}</td>
                    <td>${b.manager_name || '—'}</td>
                    <td><span class="status-badge ${b.status === 'active' ? 'approved' : 'pending'}">${b.status || 'Active'}</span></td>
                    <td>
                        <button class="action-btn" onclick="openEditBranchModal('${b.id}')"><i class='bx bx-edit'></i></button>
                        <button class="action-btn delete" onclick="deleteBranch('${b.id}')"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>`).join('');
    }

    // Dashboard KPI Mapping
    const activeCount = data.filter(b => b.status === 'active').length;
    const totalStaff  = data.reduce((s, b) => s + (b.staff_count || 0), 0);
    setKPI('dash-kpi-1', `<h3>Total Branches</h3><h2>${data.length}</h2>`);
    setKPI('dash-kpi-2', `<h3>Active Branches</h3><h2>${activeCount}</h2>`);
    setKPI('dash-kpi-3', `<h3>Total Staff</h3><h2>${totalStaff}</h2>`);
}

// ── Suppliers ─────────────────────────────────────────────────
async function loadSuppliers() {
    const { data, error } = await supabaseClient.from('suppliers').select('*').order('name');
    if (error) { console.error('loadSuppliers:', error); return; }
    if (!data) return;
    cachedSuppliers = data;

    const tbody = document.getElementById('suppliers-table-body');
    if (tbody) {
        tbody.innerHTML = data.length === 0
            ? `<tr><td colspan="10" style="text-align:center;">No suppliers found.</td></tr>`
            : data.map(s => `
                <tr data-id="${s.id}">
                    <td><input type="checkbox"></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.phone || '—'}</td>
                    <td><span class="status-badge ${s.status === 'active' ? 'approved' : 'pending'}">${s.status || 'Active'}</span></td>
                    <td>
                        <button class="action-btn" onclick="openEditSupplierModal('${s.id}')"><i class='bx bx-edit'></i></button>
                        <button class="action-btn delete" onclick="deleteSupplier('${s.id}')"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>`).join('');
    }

    // Suppliers Page KPI
    setKPI('suppliers-kpi-active', data.length);

    // Dashboard KPI Mapping
    const totalPayable = data.reduce((s, x) => s + (parseFloat(x.remaining) || 0), 0);
    const overdueCount = data.filter(x => x.status === 'overdue').length;
    setKPI('dash-kpi-4', `<h3>Suppliers</h3><h2>${data.length}</h2>`);
    setKPI('dash-kpi-5', `<h3>Total Payable</h3><h2>${fmtNum(totalPayable)}</h2><p>SAR</p>`);
    setKPI('dash-kpi-6', `<h3>Overdue Vendors</h3><h2>${overdueCount}</h2>`);

    // PO Supplier dropdown
    const poSupplier = document.getElementById('po-supplier-select');
    if (poSupplier) {
        poSupplier.innerHTML = '<option value="">Select Supplier</option>' +
            data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}

// ── Inventory ─────────────────────────────────────────────────
async function loadInventoryItems() {
    const { data: items, error } = await supabaseClient
        .from('items').select('*, inventory(quantity)').order('name');
    if (error) { console.error('loadInventoryItems:', error); return; }

    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No inventory items found.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(i => {
        const qty = i.inventory?.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0) || 0;
        const statusClass = qty > 10 ? 'approved' : (qty > 0 ? 'pending' : 'danger');
        const statusText  = qty > 10 ? 'In Stock' : (qty > 0 ? 'Low Stock' : 'Out of Stock');
        return `
        <tr data-id="${i.id}">
            <td><input type="checkbox"></td>
            <td>${i.name}</td>
            <td>${i.category || 'General'}</td>
            <td>${i.unit}</td>
            <td><strong>${qty}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        </tr>`;
    }).join('');

    // Dashboard KPI Mapping
    const lowStock = items.filter(i => {
        const qty = i.inventory?.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0) || 0;
        return qty <= 10;
    }).length;
    setKPI('dash-kpi-7', `<h3>Inventory SKUs</h3><h2>${items.length}</h2>`);
    setKPI('dash-kpi-8', `<h3>Low Stock Items</h3><h2>${lowStock}</h2>`);
}

// ── Wastage ───────────────────────────────────────────────────
async function loadWastageLogs() {
    const { data, error } = await supabaseClient
        .from('wastage_logs').select('*, items(name)').order('created_at', { ascending: false });
    if (error) { console.error('loadWastageLogs:', error); return; }

    const tbody = document.getElementById('wastage-table-body');
    if (!tbody) return;
    tbody.innerHTML = !data || data.length === 0
        ? `<tr><td colspan="6" style="text-align:center;">No wastage logs found.</td></tr>`
        : data.map(l => `
            <tr>
                <td><input type="checkbox"></td>
                <td>${new Date(l.created_at).toLocaleDateString()}</td>
                <td>${l.items?.name || 'Unknown'}</td>
                <td><strong class="text-danger">${l.quantity}</strong></td>
                <td>${l.reason || '—'}</td>
            </tr>`).join('');
    
    setKPI('dash-kpi-12', `<h3>Wastage Logs</h3><h2>${data.length}</h2>`);
}

// ── Purchase Orders ───────────────────────────────────────────
async function loadPurchaseOrders(filter = 'all') {
    let query = supabaseClient.from('purchase_orders')
        .select('*, branches(name), suppliers(name)');
    if (filter !== 'all') query = query.eq('status', filter);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error('loadPurchaseOrders:', error); return; }

    const tbody = document.getElementById('purchasing-table-body');
    if (tbody) {
        tbody.innerHTML = !data || data.length === 0
            ? `<tr><td colspan="10" style="text-align:center;">No purchase orders found.</td></tr>`
            : data.map(po => `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>PO-${po.id.slice(0, 5).toUpperCase()}</td>
                    <td>${new Date(po.created_at).toLocaleDateString()}</td>
                    <td>${po.branches?.name || '—'}</td>
                    <td>${po.suppliers?.name || '—'}</td>
                    <td>${fmtNum((po.total_amount || 0) / 1.15)}</td>
                    <td>${fmtNum((po.total_amount || 0) * 0.15 / 1.15)}</td>
                    <td>SAR ${fmtNum(po.total_amount || 0)}</td>
                    <td><span class="status-badge ${po.status}">${po.status}</span></td>
                    <td>
                        <button class="action-btn" title="View"><i class='bx bx-show'></i></button>
                    </td>
                </tr>`).join('');
    }

    if (data) {
        const totalSpend   = data.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0);
        const pendingCount = data.filter(p => p.status === 'pending').length;
        
        // Purchasing Page KPIs
        setKPI('po-kpi-total-val',    `${data.length} <span class="subtitle">This Month</span>`);
        setKPI('po-kpi-pending-val',  `${pendingCount} <span class="subtitle">Orders</span>`);
        setKPI('po-kpi-spend-val',    `${fmtNum(totalSpend)} <span class="currency">SAR</span>`);
        setKPI('po-kpi-suppliers',    `${cachedSuppliers.length} <span class="subtitle">Vendors</span>`);

        // Dashboard KPI Mapping
        setKPI('dash-kpi-9',  `<h3>Total POs</h3><h2>${data.length}</h2>`);
        setKPI('dash-kpi-10', `<h3>Pending POs</h3><h2>${pendingCount}</h2>`);
        setKPI('dash-kpi-11', `<h3>Total Spend</h3><h2>${fmtNum(totalSpend)}</h2><p>SAR</p>`);
    }
}

// ── Invoices ──────────────────────────────────────────────────
async function loadInvoices() {
    // Placeholder - implement similarly to loadPurchaseOrders if database table exists
    console.log('loadInvoices called');
}

// ============================================================
// CRUD
// ============================================================
async function submitBranch() {
    const name = document.getElementById('branch-name-val').value.trim();
    if (!name) return alert('Branch name is required');
    const { error } = await supabaseClient.from('branches').insert([{ name, status: 'active' }]);
    if (error) alert(error.message);
    else { closeModal('edit-branch-modal'); loadBranches(); }
}

async function deleteBranch(id) {
    if (!confirm('Delete branch?')) return;
    const { error } = await supabaseClient.from('branches').delete().eq('id', id);
    if (error) alert(error.message);
    else loadBranches();
}

async function submitSupplier() {
    const name = document.getElementById('sup-name').value.trim();
    if (!name) return alert('Supplier name is required');
    const { error } = await supabaseClient.from('suppliers').insert([{ name, status: 'active' }]);
    if (error) alert(error.message);
    else { closeModal('add-supplier-modal'); loadSuppliers(); }
}

async function deleteSupplier(id) {
    if (!confirm('Delete supplier?')) return;
    const { error } = await supabaseClient.from('suppliers').delete().eq('id', id);
    if (error) alert(error.message);
    else loadSuppliers();
}

async function submitWastage() {
    const itemName = document.getElementById('wastage-item').value.trim();
    const qty      = document.getElementById('wastage-qty').value;
    // Simple logic lookup item by name
    const { data: item } = await supabaseClient.from('items').select('id').ilike('name', itemName).single();
    if (!item) return alert('Item not found');
    const { error } = await supabaseClient.from('wastage_logs').insert([{ item_id: item.id, quantity: qty, reason: 'Manual Log' }]);
    if (error) alert(error.message);
    else { closeModal('wastage-modal'); loadWastageLogs(); }
}

// ============================================================
// PURCHASE ORDER MULTI-ITEM LOGIC
// ============================================================
window.addPOItemRow = () => {
    const container = document.getElementById('po-items-list');
    const div = document.createElement('div');
    div.className = 'po-item-row';
    const itemOptions = cachedItems.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    div.innerHTML = `
        <select class="po-item-id" onchange="calculatePOTotal()">
            <option value="">Select Item</option>
            ${itemOptions}
        </select>
        <input type="number" placeholder="Qty" class="po-item-qty" value="1" oninput="calculatePOTotal()">
        <input type="number" placeholder="Price" class="po-item-price" value="0.00" oninput="calculatePOTotal()">
        <span class="item-total">0.00 SAR</span>
        <i class='bx bx-trash delete-item' onclick="this.parentElement.remove(); calculatePOTotal()"></i>
    `;
    container.appendChild(div);
};

window.calculatePOTotal = () => {
    let total = 0;
    document.querySelectorAll('.po-item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
        const sub = qty * price;
        row.querySelector('.item-total').innerText = sub.toFixed(2) + ' SAR';
        total += sub;
    });
    document.getElementById('po-total-calc').innerText = total.toFixed(2);
};

async function submitPO() {
    const supplierId = document.getElementById('po-supplier-select').value;
    const branchId = document.getElementById('po-branch').value;
    const total = parseFloat(document.getElementById('po-total-calc').innerText);

    if (!supplierId || !branchId || total <= 0) return alert('Please complete the form');

    const { data: po, error } = await supabaseClient.from('purchase_orders')
        .insert([{ supplier_id: supplierId, branch_id: branchId, total_amount: total, status: 'pending' }])
        .select().single();

    if (error) return alert(error.message);

    const items = [];
    document.querySelectorAll('.po-item-row').forEach(row => {
        const itemId = row.querySelector('.po-item-id').value;
        const qty = row.querySelector('.po-item-qty').value;
        const price = row.querySelector('.po-item-price').value;
        if (itemId) items.push({ po_id: po.id, item_id: itemId, quantity: qty, unit_cost: price });
    });

    if (items.length) await supabaseClient.from('purchase_order_items').insert(items);
    
    closeModal('po-modal');
    loadPurchaseOrders();
}

window.filterPO = (status) => loadPurchaseOrders(status);

// ============================================================
// DASHBOARD SYNC
// ============================================================
function syncDashboard() {
    const poCount = document.querySelectorAll('#purchasing-table-body tr').length;
    setKPI('kpi-po-count', poCount);
    // Add more dashboard sync logic as needed
}

// ============================================================
// AI ASSISTANT
// ============================================================
async function askAiAssistant() {
    const prompt = document.getElementById('ai-user-prompt').value.trim();
    if (!prompt) return;

    // This section would typically call a cloud function or backend to interact with Claude
    // For now, we will handle it via the AI Data Assistant interface logic
    alert('AI Assistant is analyzing: ' + prompt);
}

// ============================================================
// MODAL HELPERS
// ============================================================
window.openModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    setTimeout(() => el.classList.add('show'), 10);
};

window.closeModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    setTimeout(() => { el.style.display = 'none'; }, 300);
};

// ============================================================
// CHARTS
// ============================================================
let chartsRendered = false;
function renderCharts() {
    if (chartsRendered) return;
    chartsRendered = true;

    const ctx = document.getElementById('dailyUsageChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily PO Spend',
                    data: [1200, 1900, 3000, 5000, 2300, 3400, 1100],
                    borderColor: '#f39c12',
                    tension: 0.4
                }]
            }
        });
    }

    // Mini charts
    const makeMini = (id, color) => {
        const el = document.getElementById(id);
        if (el) new Chart(el, {
            type: 'line',
            data: { labels: ['','','','',''], datasets: [{ data: [1,4,2,5,3], borderColor: color, borderWidth: 2, pointRadius: 0 }] },
            options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    };
    makeMini('miniChartPO', '#f39c12');
    makeMini('miniChartBranchOrders', '#2ecc71');
    makeMini('miniChartTotalOrders', '#3498db');
}

// ============================================================
// UTILITY
// ============================================================
function fmtNum(n) { return parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2 }); }
function setKPI(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.onclick = () => navigateTo(li.dataset.target);
    });

    // Theme & Lang
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
        const isAr = document.documentElement.getAttribute('lang') === 'ar';
        document.documentElement.setAttribute('lang', isAr ? 'en' : 'ar');
        document.documentElement.setAttribute('dir', isAr ? 'ltr' : 'rtl');
    });

    // Handle initial state
    const saved = localStorage.getItem('activeSec') || 'dashboard-section';
    navigateTo(saved);

    // Load Data
    loadInitialData();
});
