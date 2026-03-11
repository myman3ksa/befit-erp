// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;
const SUPABASE_URL = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta2RlcnpkaXBremdpdGlkbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODMzMTEsImV4cCI6MjA4ODU1OTMxMX0.5lcOpcwG6op3El3Sa0hRecvjFmV2KTdgiJ2XA2-Ebd0';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ROUTING & NAVIGATION
// ============================================================
function navigateTo(pageId) {
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.page-section');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links li[data-target="${pageId}"]`)?.classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        if (pageId === 'ai-assistant-section') target.style.display = 'block';
        else document.getElementById('ai-assistant-section').style.display = 'none';
    }
    window.location.hash = pageId;
    localStorage.setItem('activeSec', pageId);
    if (pageId === 'dashboard-section') renderCharts();
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) navigateTo(hash);
});

// ============================================================
// DATA LOADING & DOM UPDATES
// ============================================================
async function loadInitialData() {
    console.log("Initializing ERP data...");
    await Promise.all([
        loadBranches(), 
        loadInventoryItems(), 
        loadSuppliers(), 
        loadWastageLogs(), 
        loadPurchaseOrders(),
        cacheItemsForDropdowns()
    ]);
    syncDashboard();
}

let cachedItems = [];
async function cacheItemsForDropdowns() {
    const { data } = await supabaseClient.from('items').select('id, name');
    if (data) cachedItems = data;
}

async function loadSuppliers() {
    const { data } = await supabaseClient.from('suppliers').select('*').order('name');
    if (!data) return;
    
    const tbody = document.getElementById('suppliers-table-body');
    if (tbody) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align: center;">No suppliers found in database.</td></tr>`;
        } else {
            tbody.innerHTML = data.map(s => `
                <tr data-id="${s.id}">
                    <td><input type="checkbox"></td>
                    <td>${s.name}</td>
                    <td>Other</td>
                    <td>${s.phone || '—'}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>—</td>
                    <td><span class="status-badge approved">Active</span></td>
                    <td>
                        <button class="action-btn delete" onclick="deleteSupplier('${s.id}')"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>`).join('');
        }
    }

    // Update KPIs
    if (document.getElementById('suppliers-kpi-active')) {
        document.getElementById('suppliers-kpi-active').innerHTML = `${data.length} <span class="subtitle">Vendors</span>`;
    }
    if (document.getElementById('po-kpi-suppliers')) {
        document.getElementById('po-kpi-suppliers').innerHTML = `${data.length} <span class="subtitle">Vendors</span>`;
    }

    // Populate PO Supplier Select
    const poSupplier = document.getElementById('po-supplier-select');
    if (poSupplier) {
        poSupplier.innerHTML = '<option value="">Select Supplier</option>' + 
                            data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}

async function loadBranches() {
    const { data } = await supabaseClient.from('branches').select('*').order('name');
    if (!data) return;
    
    // Update Tables
    const tbody = document.getElementById('admin-table-body');
    if (tbody) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No branches found in database.</td></tr>`;
        } else {
            tbody.innerHTML = data.map(b => `
                <tr data-id="${b.id}">
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td>${b.name}</td>
                    <td>${b.location || '—'}</td>
                    <td>${b.manager_name || '—'}</td>
                    <td>0</td>
                    <td><span class="status-badge approved">${b.status}</span></td>
                    <td>
                        <button class="action-btn delete" onclick="deleteBranch('${b.id}')"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>`).join('');
        }
    }

    // Populate Selects
    const branchSelects = ['global-branch-select', 'po-branch', 'recipe-branch', 'wastage-branch', 'prod-branch'];
    branchSelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            el.innerHTML = (id === 'global-branch-select' ? '<option value="all">All Branches</option>' : '') + 
                           data.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
            if (currentVal) el.value = currentVal;
        }
    });
}

async function loadInventoryItems() {
    const { data: items, error } = await supabaseClient.from('items').select('*, inventory(quantity)').order('name');
    if (error) {
        console.error("Error loading items:", error);
        return;
    }
    
    const tbody = document.getElementById('inventory-table-body');
    if (tbody) {
        if (!items || items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No inventory items found in database.</td></tr>`;
        } else {
            tbody.innerHTML = items.map(i => {
                const totalQty = i.inventory?.reduce((sum, inv) => sum + (parseFloat(inv.quantity) || 0), 0) || 0;
                const status = totalQty > 10 ? 'approved' : 'pending';
                const statusText = totalQty > 10 ? 'In Stock' : (totalQty > 0 ? 'Low Stock' : 'Out of Stock');
                
                return `
                <tr data-id="${i.id}">
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td>${i.name}</td>
                    <td>General</td>
                    <td>${i.unit}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td><strong>${totalQty}</strong></td>
                    <td><span class="status-badge ${status}">${statusText}</span></td>
                </tr>`;
            }).join('');
        }
    }
}


async function loadWastageLogs() {
    const { data } = await supabaseClient.from('wastage_logs').select('*, items(name)').order('created_at', { ascending: false });
    if (!data) return;
    const tbody = document.getElementById('wastage-table-body');
    if (tbody) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No wastage logs found.</td></tr>`;
        } else {
            tbody.innerHTML = data.map(l => `
                <tr>
                    <td><input type="checkbox"></td>
                    <td><input type="checkbox"></td>
                    <td>${new Date(l.created_at).toLocaleDateString()}</td>
                    <td>${l.items?.name || 'Unknown'}</td>
                    <td><strong class="text-danger">${l.quantity}</strong></td>
                    <td>${l.reason || '—'}</td>
                    <td>Main</td>
                </tr>`).join('');
        }
    }
}

async function loadPurchaseOrders(filter = 'all') {
    let query = supabaseClient.from('purchase_orders').select('*, branches(name), suppliers(name)');
    if (filter === 'pending') query = query.eq('status', 'pending');
    
    const { data } = await query.order('created_at', { ascending: false });
    if (!data) return;

    // Update Tables
    const tbody = document.getElementById('purchasing-table-body');
    if (tbody) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No purchase orders found.</td></tr>`;
        } else {
            tbody.innerHTML = data.map(po => `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>PO-${po.id.slice(0, 5)}</td>
                    <td>${new Date(po.created_at).toLocaleDateString()}</td>
                    <td>${po.branches?.name || '—'}</td>
                    <td>${po.suppliers?.name || '—'}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>SAR ${parseFloat(po.total_amount).toLocaleString()}</td>
                    <td><span class="status-badge pending">${po.status}</span></td>
                    <td><i class='bx bx-show'></i></td>
                </tr>`).join('');
        }
    }

    // Update KPIs
    const totalCount = data.length;
    const pendingCount = data.filter(p => p.status === 'pending').length;
    const totalSpend = data.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);
    
    if (document.getElementById('po-kpi-total')) document.getElementById('po-kpi-total').innerHTML = `${totalCount} <span class="subtitle">Orders</span>`;
    if (document.getElementById('po-kpi-pending')) document.getElementById('po-kpi-pending').innerHTML = `${pendingCount} <span class="subtitle">Orders</span>`;
    if (document.getElementById('po-kpi-spend')) document.getElementById('po-kpi-spend').innerHTML = `${totalSpend.toLocaleString()} <span class="currency">SAR</span>`;
}

// Purchase Order Item Logic
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
        <select class="po-item-unit">
            <option>Kg</option><option>Box</option><option>Unit</option><option>Ltr</option>
        </select>
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
        const subtotal = qty * price;
        row.querySelector('.item-total').innerText = subtotal.toFixed(2) + ' SAR';
        total += subtotal;
    });
    document.getElementById('po-total-calc').innerText = total.toFixed(2);
};

window.filterPO = (status) => {
    loadPurchaseOrders(status);
};

window.loadSupplierItems = (id) => {
    // Optional: Fetch specific items for this supplier
    // For now, we allow free-text input
};

// ============================================================
// CRUD OPERATIONS (FIXED)
// ============================================================
async function submitBranch() {
    const name = document.getElementById('branch-name-val').value;
    const loc = document.getElementById('branch-loc-val').value;
    const mgr = document.getElementById('branch-mgr-val').value;
    if (!name) return alert("Branch name is required");

    const { error } = await supabaseClient.from('branches').insert([{ 
        name, 
        location: loc, 
        manager_name: mgr, 
        status: 'active' 
    }]);

    if (error) {
        console.error("Branch Insert Error:", error);
        alert("Error adding branch: " + error.message);
    } else {
        alert("Branch successfully added to Supabase Database!");
        await loadBranches();
        closeModal('edit-branch-modal');
        document.getElementById('branch-form')?.reset();
    }
}

async function deleteBranch(id) {
    if (confirm('Are you sure you want to delete this branch?')) {
        const { error } = await supabaseClient.from('branches').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else loadBranches();
    }
}

async function submitAddItem() {
    console.log("Starting submitAddItem...");
    const name = document.getElementById('inv-item-name').value.trim();
    const unit = document.getElementById('inv-item-unit').value.trim();
    const price = document.getElementById('inv-item-price').value;
    const qty = document.getElementById('inv-item-qty')?.value || 0;
    const catName = document.getElementById('inv-item-cat')?.value.trim();

    if (!name) return alert("Item name is required");

    try {
        // 1. Insert Item
        console.log("Inserting item into database...", { name, unit, price });
        const { data: item, error: itemError } = await supabaseClient
            .from('items')
            .insert([{ 
                name, 
                unit, 
                base_cost: parseFloat(price) || 0 
            }])
            .select()
            .single();

        if (itemError) throw itemError;
        console.log("Item saved successfully:", item);

        // 2. If quantity is provided, add to inventory for the first branch (as default)
        if (qty > 0) {
            const { data: branches } = await supabaseClient.from('branches').select('id').limit(1);
            if (branches && branches.length > 0) {
                console.log("Adding initial stock to inventory...");
                const { error: invError } = await supabaseClient
                    .from('inventory')
                    .insert([{
                        branch_id: branches[0].id,
                        item_id: item.id,
                        quantity: parseFloat(qty)
                    }]);
                if (invError) console.error("Inventory error:", invError);
            }
        }

        alert("Item saved successfully to database!");
        await loadInventoryItems();
        closeModal('add-item-modal');
        
        // Reset form
        document.getElementById('add-item-form')?.reset();
    } catch (err) {
        console.error("Critical error in submitAddItem:", err);
        alert("Database Error: " + (err.message || "Failed to save data"));
    }
}

async function submitSupplier() {
    const name = document.getElementById('sup-name').value;
    const contact = document.getElementById('sup-contact').value;
    if (!name) return alert("Supplier name is required");

    const { error } = await supabaseClient.from('suppliers').insert([{ 
        name, 
        phone: contact 
    }]);

    if (error) {
        console.error("Supplier Insert Error:", error);
        alert("Error adding supplier: " + error.message);
    } else {
        alert("Supplier successfully added to Supabase Database!");
        await loadSuppliers();
        closeModal('add-supplier-modal');
        document.getElementById('add-supplier-form')?.reset();
    }
}

async function deleteSupplier(id) {
    if (confirm('Delete this supplier?')) {
        const { error } = await supabaseClient.from('suppliers').delete().eq('id', id);
        if (error) alert(error.message);
        else loadSuppliers();
    }
}

async function submitWastage() {
    const itemName = document.getElementById('wastage-item').value;
    const qty = parseFloat(document.getElementById('wastage-qty').value);
    const reason = document.getElementById('wastage-reason').value;
    
    // Find item by name
    const { data: item } = await supabaseClient.from('items').select('id').ilike('name', itemName).single();
    if (!item) return alert("Item not found. Please enter a valid item name from inventory.");

    const { error } = await supabaseClient.from('wastage_logs').insert([{ 
        item_id: item.id, 
        quantity: qty, 
        reason 
    }]);

    if (error) {
        console.error("Wastage Log Error:", error);
        alert("Error recording wastage: " + error.message);
    } else {
        alert("Wastage successfully recorded in Supabase Database!");
        await loadWastageLogs();
        closeModal('wastage-modal');
        document.getElementById('wastage-form')?.reset();
    }
}

async function submitPO() {
    const supplierId = document.getElementById('po-supplier-select').value;
    const branchId = document.getElementById('po-branch').value;
    const totalText = document.getElementById('po-total-calc').innerText;
    const total = parseFloat(totalText.replace(/,/g, '')) || 0;

    if (!supplierId || !branchId || total <= 0) {
        alert("Please select a supplier, branch, and add at least one item with a price.");
        return;
    }

    // Insert Order
    const { data: poData, error: poError } = await supabaseClient.from('purchase_orders').insert([{
        supplier_id: supplierId,
        branch_id: branchId,
        total_amount: total,
        status: 'pending'
    }]).select();

    if (poError) {
        console.error("PO Creation Error:", poError);
        alert("Error creating Purchase Order: " + poError.message);
        return;
    }

    const orderId = poData[0].id;
    const items = [];
    document.querySelectorAll('.po-item-row').forEach(row => {
        const itemId = row.querySelector('.po-item-id').value;
        const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
        if (itemId && qty > 0) {
            items.push({
                po_id: orderId,
                item_id: itemId,
                quantity: qty,
                unit_cost: price
            });
        }
    });

    if (items.length > 0) {
        const { error: itemsError } = await supabaseClient.from('purchase_order_items').insert(items);
        if (itemsError) console.error("Error inserting PO items:", itemsError);
    }

    alert("Purchase Order created successfully!");
    await loadPurchaseOrders();
    closeModal('po-modal');
    document.getElementById('po-items-list').innerHTML = '';
    document.getElementById('po-total-calc').innerText = '0.00';
    document.getElementById('po-form')?.reset();
}

// ============================================================
// AUTH & UI LOGIC
// ============================================================
async function handleAuthSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert("Login Failed: " + error.message);
    else onLoginSuccess(data.user);
}

function onLoginSuccess(user) {
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('display-user-name').textContent = user.user_metadata?.username || user.email.split('@')[0];
    loadInitialData();
}

function syncDashboard() {
    const poCount = document.querySelectorAll('#purchasing-section tbody tr').length;
    const itemCount = document.querySelectorAll('#inventory-section tbody tr').length;
    
    const poEl = document.getElementById('kpi-po-count');
    const orderEl = document.getElementById('kpi-total-orders');
    const usageEl = document.getElementById('kpi-daily-usage');

    if (poEl) poEl.innerText = poCount;
    if (orderEl) orderEl.innerText = poCount; // Simplified
    if (usageEl) usageEl.innerText = itemCount;
}

// ============================================================
// AI ASSISTANT
// ============================================================
async function askAiAssistant() {
    const promptValue = document.getElementById('ai-user-prompt').value.trim();
    const promptLower = promptValue.toLowerCase();
    const area = document.getElementById('ai-response-area');
    const sqlDisplay = document.getElementById('ai-sql-display');
    
    if (!promptValue) return;

    area.style.display = 'block';
    sqlDisplay.innerText = "-- Analyzing request & Fetching Data...";

    // 1. Determine which data they want based on keywords
    let table = 'items';
    if (promptLower.includes('branch') || promptLower.includes('location')) table = 'branches';
    else if (promptLower.includes('supplier') || promptLower.includes('vendor')) table = 'suppliers';
    else if (promptLower.includes('order') || promptLower.includes('purchase')) table = 'purchase_orders';
    else if (promptLower.includes('wastage') || promptLower.includes('waste')) table = 'wastage_logs';
    else if (promptLower.includes('user') || promptLower.includes('profile')) table = 'profiles';

    sqlDisplay.innerText = `-- Identified Domain: ${table.toUpperCase()}\nSELECT * FROM ${table} LIMIT 25;`;

    // 2. Fetch the data from Supabase
    const { data: dbData, error } = await supabaseClient.from(table).select('*').limit(25);
    
    if (error) {
        sqlDisplay.innerText += "\n-- Query Error: " + error.message;
        renderAiResults([]);
        return;
    }

    renderAiResults(dbData);

    if (!dbData || dbData.length === 0) {
        sqlDisplay.innerText += "\n-- 0 Results Found. The database is empty for this query.";
        return;
    }

    // 3. Optional: Pass data context to local LLM via Ollama
    sqlDisplay.innerText += "\n-- Asking Local AI (qwen2.5:7b) to analyze data...";
    
    try {
        const aiPrompt = `You are a helpful ERP Assistant. The user asked: "${promptValue}". 
Here is their database data in JSON:\n${JSON.stringify(dbData)}\n
Analyze this data and provide a direct, concise answer to the user's question.`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:7b',
                prompt: aiPrompt,
                stream: false
            })
        });

        if (!response.ok) throw new Error("Ollama returned status: " + response.status);
        
        const aiData = await response.json();
        sqlDisplay.innerText = `-- Local AI Response:\n${aiData.response}`;
        
    } catch (err) {
        sqlDisplay.innerText += `\n\n-- Local AI Connection Failed: ${err.message}
-- Please ensure Ollama is running locally, the 'qwen2.5:7b' model is installed, 
-- and you have started Ollama with OLLAMA_ORIGINS="*". Displaying raw database results below.`;
    }
}

function renderAiResults(data) {
    const head = document.getElementById('ai-results-head');
    const body = document.getElementById('ai-results-body');
    if (!data || data.length === 0) {
        head.innerHTML = ""; body.innerHTML = "<tr><td>No data found</td></tr>";
        return;
    }
    const keys = Object.keys(data[0]);
    head.innerHTML = `<tr>${keys.map(k => `<th>${k.toUpperCase()}</th>`).join('')}</tr>`;
    body.innerHTML = data.map(row => `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`).join('');
}

// ============================================================
// INITIALIZATION
// ============================================================
window.openModal = id => { 
    document.getElementById(id).style.display = 'flex'; 
    setTimeout(() => document.getElementById(id).classList.add('show'), 10); 
};
window.closeModal = id => { 
    document.getElementById(id).classList.remove('show'); 
    setTimeout(() => document.getElementById(id).style.display = 'none', 300); 
};

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.onclick = () => navigateTo(li.dataset.target);
    });
    
    // Check Session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            onLoginSuccess(session.user);
        } else {
            console.log("No active session found, showing login.");
            // If we want to allow viewing data without login (anon mode), call loadInitialData anyway
            loadInitialData();
        }
    });

    const hash = window.location.hash.substring(1) || localStorage.getItem('activeSec');
    if (hash) {
        navigateTo(hash);
    } else {
        navigateTo('dashboard-section');
    }
});

// Global Exports
window.handleAuthSubmit = handleAuthSubmit;
window.submitBranch = submitBranch;
window.deleteBranch = deleteBranch;
window.submitAddItem = submitAddItem;
window.submitSupplier = submitSupplier;
window.deleteSupplier = deleteSupplier;
window.submitWastage = submitWastage;
window.submitPO = submitPO;
window.askAiAssistant = askAiAssistant;

// Chart Mock for Dashboard
function renderCharts() {
    const ctx = document.getElementById('dailyUsageChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [{ label: 'Product Flow', data: [5, 12, 8, 15, 10, 20, 18], borderColor: '#f39c12', tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}
