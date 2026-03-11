// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;
const SUPABASE_URL = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta2RlcnpkaXBremdpdGlkbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODMzMTEsImV4cCI6MjA4ODU1OTMxMX0.5lcOpcwG6op3El3Sa0hRecvjFmV2KTdgiJ2XA2-Ebd0';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// BLOCKCHAIN NETWORK ANIMATION (Login Screen)
// ============================================================
(function initBlockchainCanvas() {
    const canvas = document.getElementById('auth-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let mouse = { x: -9999, y: -9999 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
    }

    const NODE_COUNT = 80;
    const MAX_DIST = 160;
    const CURSOR_DIST = 200;

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 1.5,
        pulse: Math.random() * Math.PI * 2
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = 'rgba(255, 69, 0,' + alpha + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        for (let i = 0; i < nodes.length; i++) {
            const dx = nodes[i].x - mouse.x;
            const dy = nodes[i].y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CURSOR_DIST) {
                const alpha = (1 - dist / CURSOR_DIST) * 0.75;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(0, 100, 50,' + alpha + ')';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
        }

        for (const node of nodes) {
            node.pulse += 0.04;
            const glow = Math.abs(Math.sin(node.pulse));
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r + glow, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, ' + (140 + Math.floor(glow * 40)) + ', 0,' + (0.6 + glow * 0.3) + ')';
            ctx.shadowColor = '#ff4500';
            ctx.shadowBlur = 8 * glow;
            ctx.fill();
            ctx.shadowBlur = 0;
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > canvas.width)  node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        }

        if (mouse.x > -1000) {
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 30);
            grad.addColorStop(0, 'rgba(0, 80, 40, 0.6)');
            grad.addColorStop(1, 'rgba(0, 80, 40, 0)');
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
})();

// ============================================================
// LANGUAGE TRANSLATIONS (English / Arabic)
// ============================================================
const translations = {
    en: {
        admin_user: 'Admin User',
        super_admin: 'Super Admin',
        menu_dashboard: 'Dashboard',
        menu_purchasing: 'Purchasing',
        menu_inventory: 'Inventory',
        menu_production: 'Production',
        menu_costing: 'Costing',
        menu_branches: 'Branches',
        menu_finance: 'Finance',
        menu_users: 'Users',
        menu_wastage: 'Wastage',
        menu_settings: 'Settings',
        menu_logout: 'Logout',
        welcome_user: 'Welcome',
        system_ready: 'System is ready for operations',
        general_tab: 'General',
        branches_tab: 'Branches',
        kitchen_tab: 'Kitchen',
        compare_label: 'Compare',
        po_label: 'P.O.',
        branch_orders_label: 'Branch Orders',
        total_orders_label: 'Total Orders',
        view_report: 'View Report',
        daily_usage_label: 'Daily Product Usage',
        hourly_po_label: 'Hourly P.O.',
        top_production_label: 'Top Production',
        top_wastage_label: 'Top Wastage',
        top_branches_production_label: 'Top Branches Production',
        record_production: 'Record Daily Production'
    },
    ar: {
        admin_user: 'مستخدم الإدارة',
        super_admin: 'مشرف عام',
        menu_dashboard: 'لوحة القيادة',
        menu_purchasing: 'المشتريات',
        menu_inventory: 'المخزون',
        menu_production: 'الإنتاج',
        menu_costing: 'التكاليف',
        menu_branches: 'الفروع',
        menu_finance: 'المالية',
        menu_users: 'المستخدمون',
        menu_wastage: 'الهدر',
        menu_settings: 'الإعدادات',
        menu_logout: 'تسجيل خروج',
        welcome_user: 'أهلاً بك',
        system_ready: 'النظام جاهز للعمليات',
        general_tab: 'عام',
        branches_tab: 'الفروع',
        kitchen_tab: 'المطبخ',
        compare_label: 'مقارنة',
        po_label: 'طلبات الشراء',
        branch_orders_label: 'طلبات الفروع',
        total_orders_label: 'إجمالي الطلبات',
        view_report: 'عرض التقرير',
        daily_usage_label: 'استخدام المنتج اليومي',
        hourly_po_label: 'طلبات الشراء كل ساعة',
        top_production_label: 'أعلى الإنتاج',
        top_wastage_label: 'أعلى الهدر',
        top_branches_production_label: 'أعلى إنتاج الفروع',
        record_production: 'تسجيل الإنتاج اليومي'
    }
};

let currentLang = 'en';

function applyLanguage(lang) {
    currentLang = lang;
    const map = translations[lang];
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (map[key]) el.textContent = map[key];
    });
    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.getElementById('lang-text').textContent = 'English';
    } else {
        document.body.classList.remove('rtl');
        document.getElementById('lang-text').textContent = 'عربي';
    }
}

// ============================================================
// AUTHENTICATION LOGIC (Supabase Auth)
// ============================================================
let authMode = 'login'; // 'login' | 'signup' | 'forgot'

function toggleAuthMode(mode) {
    authMode = mode;
    const signupFields = document.querySelectorAll('.signup-only');
    const passwordField = document.querySelector('.login-signup-only');
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const linkSignup = document.getElementById('link-signup');
    const linkLogin = document.getElementById('link-login');
    const linkForgot = document.getElementById('link-forgot');

    clearAuthMessages();

    if (mode === 'login') {
        title.textContent = 'Sign In';
        submitBtn.textContent = 'Sign In';
        signupFields.forEach(f => f.style.display = 'none');
        passwordField.style.display = 'block';
        linkSignup.style.display = 'inline';
        linkLogin.style.display = 'none';
        linkForgot.style.display = 'inline';
    } else if (mode === 'signup') {
        title.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        signupFields.forEach(f => f.style.display = 'block');
        passwordField.style.display = 'block';
        linkSignup.style.display = 'none';
        linkLogin.style.display = 'inline';
        linkForgot.style.display = 'none';
    } else if (mode === 'forgot') {
        title.textContent = 'Reset Password';
        submitBtn.textContent = 'Send Reset Email';
        signupFields.forEach(f => f.style.display = 'none');
        passwordField.style.display = 'none';
        linkSignup.style.display = 'none';
        linkLogin.style.display = 'inline';
        linkForgot.style.display = 'none';
    }
}

function clearAuthMessages() {
    const errMsg = document.getElementById('auth-error-msg');
    const successMsg = document.getElementById('auth-success-msg');
    errMsg.style.display = 'none';
    errMsg.textContent = '';
    successMsg.style.display = 'none';
    successMsg.textContent = '';
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}

function showAuthSuccess(msg) {
    const el = document.getElementById('auth-success-msg');
    el.textContent = msg;
    el.style.display = 'block';
}

async function handleAuthSubmit() {
    clearAuthMessages();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password')?.value || '';
    const submitBtn = document.getElementById('auth-submit-btn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';

    try {
        if (authMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            onLoginSuccess(data.user);

        } else if (authMode === 'signup') {
            const username = document.getElementById('auth-username').value.trim();
            const branchCode = document.getElementById('auth-branch').value.trim();
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { username, branch_code: branchCode } }
            });
            if (error) throw error;
            showAuthSuccess('Account created! Please check your email to confirm your account.');

        } else if (authMode === 'forgot') {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://man-3.com'
            });
            if (error) throw error;
            showAuthSuccess('Password reset email sent! Please check your inbox.');
        }
    } catch (err) {
        showAuthError(err.message || 'An error occurred. Please try again.');
    } finally {
        submitBtn.disabled = false;
        // Restore button text based on mode
        if (authMode === 'login') submitBtn.textContent = 'Sign In';
        else if (authMode === 'signup') submitBtn.textContent = 'Sign Up';
        else if (authMode === 'forgot') submitBtn.textContent = 'Send Reset Email';
    }
}



function onLoginSuccess(user) {
    document.getElementById('auth-overlay').classList.remove('active');
    // Update user info in sidebar
    const emailDisplay = user.email.split('@')[0];
    const usernameDisplay = user.user_metadata?.username || emailDisplay;
    const role = user.user_metadata?.branch_code ? `Branch: ${user.user_metadata.branch_code}` : 'Staff';
    document.querySelector('.user-details h4').textContent = usernameDisplay;
    document.querySelector('.user-details p').textContent = role;
    
    // Update Dashboard Welcome Name
    const bannerName = document.getElementById('display-user-name');
    if (bannerName) bannerName.textContent = usernameDisplay;
}

function handleLogout() {
    supabaseClient.auth.signOut();
    document.getElementById('auth-overlay').classList.add('active');
    toggleAuthMode('login');
}

// ============================================================
// INVENTORY & BRANCH LOGIC
// ============================================================
function submitAddItem() {
    const name = document.getElementById('inv-item-name').value;
    const cat = document.getElementById('inv-item-cat').value;
    const qty = document.getElementById('inv-item-qty').value;
    const unit = document.getElementById('inv-item-unit').value;
    const price = document.getElementById('inv-item-price').value;

    if (!name || !qty) {
        alert('Item name and quantity are required.');
        return;
    }

    const tbody = document.querySelector('#inventory-section .styled-table tbody');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${cat}</td>
            <td>${unit}</td>
            <td>0.0</td>
            <td>${qty}</td>
            <td>0.0 / 0.0</td>
            <td><strong>${qty}</strong></td>
            <td><span class="status-badge approved">New Item</span></td>
        `;
        tbody.prepend(row);
    }

    alert(`Item "${name}" added successfully!`);
    closeModal('add-item-modal');
}

function submitStockTransfer() {
    const from = document.getElementById('transfer-from').value;
    const to = document.getElementById('transfer-to').value;
    const items = document.getElementById('transfer-items').value;

    if (from === to) {
        alert('Cannot transfer to the same branch.');
        return;
    }

    alert(`Transfer of ${items} from ${from} to ${to} initiated!`);
    closeModal('stock-transfer-modal');
}


function submitStockTransfer() {
    const from = document.getElementById('transfer-from').value;
    const to = document.getElementById('transfer-to').value;
    const item = document.getElementById('transfer-item').value;
    const qty = document.getElementById('transfer-qty').value;

    if (!qty || qty <= 0) {
        alert('Please enter a valid transfer quantity.');
        return;
    }

    alert(`Transferred ${qty} units of "${item}" from "${from}" to "${to}".`);
    closeModal('stock-transfer-modal');
}

function submitBranch() {
    const name = document.getElementById('branch-name-val').value;
    const loc = document.getElementById('branch-loc-val').value;
    const mgr = document.getElementById('branch-mgr-val').value;
    const status = document.getElementById('branch-status-val').value;

    const tbody = document.querySelector('#admin-section .styled-table tbody');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${loc}</td>
            <td>${mgr}</td>
            <td>0</td>
            <td><span class="status-badge ${status.toLowerCase() === 'active' ? 'approved' : 'pending'}">${status}</span></td>
            <td>
                <button class="action-btn" onclick="openModal('edit-branch-modal')"><i class='bx bx-edit'></i></button>
                <button class="action-btn delete" onclick="deleteBranch(this)"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.prepend(row);
    }

    alert(`Branch "${name}" saved successfully!`);
    closeModal('edit-branch-modal');
}

function deleteBranch(btn) {
    if (confirm('Are you sure you want to delete this branch?')) {
        btn.closest('tr').remove();
    }
}


function submitUser() {
    alert('User settings and permissions saved successfully!');
    closeModal('user-modal');
}

// ============================================================
// PRODUCTION & RECIPE LOGIC
// ============================================================
function calculateYieldProd() {
    const raw = parseFloat(document.getElementById('raw-weight-prod').value) || 0;
    const loss = parseFloat(document.getElementById('loss-pct-prod').value) || 0;
    const final = raw * (1 - (loss / 100));
    document.getElementById('final-weight-prod').value = final.toFixed(2);
}

function addProdIngredient() {
    const container = document.getElementById('prod-ingredients-list');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Ingredient Name">
        <input type="number" placeholder="Qty">
        <input type="text" placeholder="Unit" value="kg">
        <i class='bx bx-trash text-danger' onclick="this.parentElement.remove()" style="cursor:pointer;"></i>
    `;
    container.appendChild(row);
}

function submitProduction() {
    const item = document.getElementById('prod-menu-item').value;
    const branch = document.getElementById('prod-branch').value;
    const portions = document.getElementById('prod-portions').value;
    const finalKg = document.getElementById('final-weight-prod').value;

    // Simulate inventory deduction
    const ingredients = document.querySelectorAll('#prod-ingredients-list .item-row');
    ingredients.forEach(row => {
        const ingName = row.querySelectorAll('input')[0].value;
        const ingQty = row.querySelectorAll('input')[1].value;
        if (ingName && ingQty) {
            console.log(`Deducting ${ingQty} of ${ingName} from inventory for ${item} production.`);
        }
    });

    alert(`✅ Production logged: ${portions} portions of ${item} (${finalKg}kg) at ${branch}. Ingredients deducted from inventory.`);
    closeModal('production-modal');
}


function addRecipeIngredient() {
    const container = document.getElementById('recipe-ingredients-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Ingredient">
        <input type="number" placeholder="Qty">
        <input type="text" placeholder="Unit" value="kg">
        <i class='bx bx-trash text-danger' onclick="this.parentElement.remove()" style="cursor:pointer;"></i>
    `;
    container.appendChild(row);
}

function submitRecipe() {
    const name = document.getElementById('recipe-name').value.trim();
    if (!name) {
        alert('Please enter a recipe name.');
        return;
    }
    alert(`Recipe "${name}" saved and assigned to branch.`);
    closeModal('recipe-modal');
}

// =// ============================================================
// SETTINGS LOGIC
// ============================================================
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

// ============================================================
// WASTAGE LOGIC (deducts from inventory concept)
// ============================================================
let wastageLog = [];

function submitWastage() {
    const item = document.getElementById('wastage-item').value.trim();
    const qty = parseFloat(document.getElementById('wastage-qty').value);
    const reason = document.getElementById('wastage-reason').value;

    if (!item || !qty || qty <= 0) {
        alert('Please fill in all required fields.');
        return;
    }

    const entry = {
        date: new Date().toLocaleDateString('en-GB'),
        item,
        qty,
        reason,
        branch: 'Main Branch'
    };

    wastageLog.push(entry);
    renderWastageTable();
    updateInventoryForWastage(item, qty);
    closeModal('wastage-modal');

    // Clear form
    document.getElementById('wastage-item').value = '';
    document.getElementById('wastage-qty').value = 1;
}

function renderWastageTable() {
    const tbody = document.getElementById('wastage-table-body');
    if (!tbody) return;
    tbody.innerHTML = wastageLog.map(row => `
        <tr>
            <td>${row.date}</td>
            <td>${row.item}</td>
            <td><strong class="text-danger">${row.qty}</strong></td>
            <td><span class="status-badge pending">${row.reason}</span></td>
            <td>${row.branch}</td>
        </tr>
    `).join('');
    // Update Total Logged KPI
    const kpi = document.querySelector('#wastage-section .kpi-info p');
    if (kpi) kpi.innerHTML = `${wastageLog.length} <span class="subtitle">Logs</span>`;
}

function updateInventoryForWastage(itemName, qty) {
    // Visual feedback: try to match an inventory row and highlight it
    const invRows = document.querySelectorAll('#inventory-section .styled-table tbody tr');
    invRows.forEach(row => {
        const nameCell = row.querySelector('td:first-child');
        if (nameCell && nameCell.textContent.toLowerCase().includes(itemName.toLowerCase())) {
            row.style.transition = 'background 0.5s';
            row.style.background = 'rgba(231, 76, 60, 0.15)';
            const closingCell = row.querySelector('td:nth-child(7) strong');
            if (closingCell) {
                const current = parseFloat(closingCell.textContent) || 0;
                closingCell.textContent = Math.max(0, current - qty).toFixed(1);
                closingCell.classList.add('text-danger');
            }
            setTimeout(() => { row.style.background = ''; }, 2000);
        }
    });
}

// ============================================================
// MAIN DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Check Supabase Session ---
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            onLoginSuccess(session.user);
        } else {
            toggleAuthMode('login');
        }
    });

    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            onLoginSuccess(session.user);
        } else if (event === 'SIGNED_OUT') {
            document.getElementById('auth-overlay').classList.add('active');
        }
    });

    // --- Language Toggle ---
    document.getElementById('lang-toggle').addEventListener('click', () => {
        applyLanguage(currentLang === 'en' ? 'ar' : 'en');
    });

    // --- Hamburger / Mobile Sidebar ---
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    // Close sidebar on section click (mobile)
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) sidebar.classList.remove('open');
        });
    });

    // --- Logout button ---
    document.querySelector('.bottom-menu li').addEventListener('click', handleLogout);

    // --- Navigation System ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(sec => sec.classList.remove('active'));
            const targetId = link.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
            if (targetId === 'dashboard-section') renderCharts();
        });
    });

    // --- Chart.js Implementations ---
    function renderCharts() {
        const accentColor = '#5D3FD3';
        const textColor = '#888888';
        const gridColor = '#222222';

        const miniOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2, borderColor: accentColor } }
        };

        const barOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: textColor }, grid: { display: false } },
                y: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        };

        const pieOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12, usePointStyle: true } } }
        };

        // Mini Charts
        const miniCtxs = ['miniChartPO', 'miniChartBranchOrders', 'miniChartTotalOrders'];
        miniCtxs.forEach(id => {
            const ctx = document.getElementById(id);
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        datasets: [{ data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 50)) }]
                    },
                    options: miniOptions
                });
            }
        });

        // Daily Product Usage Chart
        const ctxDaily = document.getElementById('dailyUsageChart');
        if (ctxDaily) {
            new Chart(ctxDaily, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        { label: 'Chicken', data: [40, 35, 55, 60, 80, 120, 100], borderColor: '#1F3A93', fill: false },
                        { label: 'Rice', data: [20, 25, 20, 30, 45, 60, 50], borderColor: '#E67E22', fill: false }
                    ]
                },
                options: { ...barOptions, plugins: { legend: { display: true, labels: { color: textColor } } } }
            });
        }

        // Hourly P.O. Chart
        const ctxHourly = document.getElementById('hourlyPOChart');
        if (ctxHourly) {
            new Chart(ctxHourly, {
                type: 'bar',
                data: {
                    labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
                    datasets: [{
                        data: [2, 5, 12, 8, 4, 15, 20, 6],
                        backgroundColor: accentColor,
                        borderRadius: 5
                    }]
                },
                options: barOptions
            });
        }

        // Pie Charts
        const colors = ['#002147', '#E67E22', '#5D3FD3', '#89CFF0', '#2ECC71'];

        const pies = [
            { id: 'productionPieChart', labels: ['Keto Box', 'Shawarma', 'Grill', 'Salads'], data: [40, 30, 20, 10] },
            { id: 'wastagePieChart', labels: ['Expired', 'Spoiled', 'Overcooked'], data: [50, 30, 20] },
            { id: 'branchesProductionPieChart', labels: ['Main', 'Jeddah', 'Dammam'], data: [55, 30, 15] }
        ];

        pies.forEach(p => {
            const ctx = document.getElementById(p.id);
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: p.labels,
                        datasets: [{ data: p.data, backgroundColor: colors, borderWidth: 0 }]
                    },
                    options: pieOptions
                });
            }
        });
    }

    // Initial render
    setTimeout(renderCharts, 100);

    // --- Export Functionality (Mock) ---
    const exportBtn = document.getElementById('global-export');
    const exportPOBtn = document.getElementById('export-po-btn');

    function simulateExport(btn) {
        const btnText = btn.innerHTML;
        btn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Exporting...";
        setTimeout(() => {
            btn.innerHTML = "<i class='bx bx-check'></i> Exported";
            setTimeout(() => { btn.innerHTML = btnText; }, 2000);
        }, 1500);
    }

    if (exportBtn) exportBtn.addEventListener('click', () => simulateExport(exportBtn));
    if (exportPOBtn) exportPOBtn.addEventListener('click', () => simulateExport(exportPOBtn));

    // --- Dashboard Filter Logic ---
    const timeFilter = document.getElementById('dashboard-time-filter');
    const datePicker = document.getElementById('dashboard-date-picker');

    if (timeFilter) {
        timeFilter.addEventListener('change', () => {
            renderCharts(); // Refresh charts based on filter
            const badge = document.querySelector('.comp-badge');
            if (timeFilter.value === 'daily') badge.innerHTML = "<i class='bx bx-trending-up'></i> +5% vs yesterday";
            else if (timeFilter.value === 'weekly') badge.innerHTML = "<i class='bx bx-trending-up'></i> +12% vs last week";
            else badge.innerHTML = "<i class='bx bx-trending-down'></i> -3% vs last month";
        });
    }

});

// ============================================================
// MODAL SYSTEM
// ============================================================
window.openModal = function (id) {
    // Reset PO totals if opening po-modal
    if (id === 'po-modal') {
        document.getElementById('po-total-calc').textContent = '0.00';
    }
    document.getElementById(id).style.display = 'flex';
    setTimeout(() => {

        document.getElementById(id).classList.add('show');
    }, 10);
};

window.closeModal = function (id) {
    document.getElementById(id).classList.remove('show');
    setTimeout(() => {
        document.getElementById(id).style.display = 'none';
    }, 300);
};

// Close modal if clicked outside content
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
};

// Export functions
function exportData(format) {
    alert(`Exporting Dashboard reports to ${format.toUpperCase()}...`);
}

function exportSection(section, format) {
    alert(`Exporting ${section.charAt(0).toUpperCase() + section.slice(1)} records to ${format.toUpperCase()}...`);
}

window.calculatePOTotal = function() {
    const qty = parseFloat(document.getElementById('po-item-qty').value) || 0;
    const price = parseFloat(document.getElementById('po-item-price').value) || 0;
    
    const vat = (qty * price) * 0.15;
    const total = (qty * price) + vat;
    
    document.getElementById('po-item-vat').value = vat.toFixed(2);
    document.getElementById('po-total-calc').textContent = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

window.submitPO = function() {
    const supplier = document.getElementById('po-supplier').value;
    const branch = document.getElementById('po-branch').value;
    const item = document.getElementById('po-item-name').value;
    const total = document.getElementById('po-total-calc').textContent;

    if (!supplier || !item) {
        alert('Supplier and Item Name are required.');
        return;
    }

    const tbody = document.querySelector('#purchasing-section .styled-table tbody');
    if (tbody) {
        const row = document.createElement('tr');
        const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        row.innerHTML = `
            <td>${poNum}</td>
            <td>${new Date().toLocaleDateString('en-GB')}</td>
            <td>${branch}</td>
            <td>${supplier}</td>
            <td>${total}</td>
            <td><span class="status-badge pending">Pending Officer</span></td>
            <td><button class="action-btn"><i class='bx bx-show'></i></button></td>
        `;
        tbody.prepend(row);
    }

    alert(`Purchase Order ${supplier} created and sent for approval flow.`);
    closeModal('po-modal');
};

window.submitUrgentRequest = function() {
    const supplier = document.getElementById('urgent-supplier').value;
    const reason = document.getElementById('urgent-reason').value;

    if (!supplier || !reason) {
        alert('Supplier and Reason are required.');
        return;
    }

    const tbody = document.getElementById('urgent-requests-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date().toLocaleDateString('en-GB')}</td>
            <td>${supplier}</td>
            <td>${reason}</td>
            <td>Procurement Dept.</td>
            <td><span class="status-badge pending" style="background: #e67e22; color:#fff;">Urgent</span></td>
        `;
        tbody.prepend(row);
    }

    alert(`Priority message sent to Finance for ${supplier}. Reason: ${reason}`);
    closeModal('urgent-payment-modal');
};

// --- Supplier Management Logic ---
window.calcSupplierRemaining = function() {
    const total = parseFloat(document.getElementById('sup-total').value) || 0;
    const paid = parseFloat(document.getElementById('sup-paid').value) || 0;
    document.getElementById('sup-remaining').value = (total - paid).toFixed(2);
};

window.submitSupplier = function() {
    const name = document.getElementById('sup-name').value;
    const category = document.getElementById('sup-category').value;
    const contact = document.getElementById('sup-contact').value;
    const totalInput = document.getElementById('sup-total').value;
    const paidInput = document.getElementById('sup-paid').value;
    
    const total = parseFloat(totalInput) || 0;
    const paid = parseFloat(paidInput) || 0;
    const remaining = total - paid;
    const due = document.getElementById('sup-due').value || '—';
    const status = document.getElementById('sup-status').value;

    if (!name || totalInput === "") {
        alert('Supplier Name and Total Balance are required.');
        return;
    }

    // Add to Supplier Table
    const tbody = document.getElementById('suppliers-table-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.setAttribute('data-status', status);
        row.setAttribute('data-category', category);
        row.setAttribute('data-name', name.toLowerCase());

        const statusClass = (status === 'active' || status === 'settled') ? 'approved' : 'pending';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        const colorRem = remaining > 0 ? (status === 'overdue' ? '#e67e22' : '#e74c3c') : '#2ecc71';

         +
                        '<td>' + category.charAt(0).toUpperCase() + category.slice(1) + '</td>' +
                        '<td>' + contact + '</td>' +
                        '<td>' + total.toLocaleString('en-US', { minimumFractionDigits: 2 }) + '</td>' +
                        '<td>' + paid.toLocaleString('en-US', { minimumFractionDigits: 2 }) + '</td>' +
                        '<td><span style="color:' + colorRem + '; font-weight:700;">' + remaining.toLocaleString('en-US', { minimumFractionDigits: 2 }) + '</span></td>' +
                        '<td>' + due + '</td>' +
                        '<td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
                        '<td>' +
                            '<button class="action-btn" onclick="openModal(\'add-supplier-modal\')"><i class=\'bx bx-edit\'></i></button>' +
                            '<button class="action-btn delete" onclick="this.closest(\'tr\').remove();"><i class=\'bx bx-trash\'></i></button>' +
                        '</td>';
        tbody.prepend(row);
    }

    const soaBody = document.getElementById('soa-table-body');
    if (soaBody) {
        const row = document.createElement('tr');
        const priority = remaining > 10000 ? 'Urgent' : 'Normal';
        const priorityClass = priority === 'Urgent' ? 'pending' : 'approved';
        const priorityStyle = priority === 'Urgent' ? 'background:#e67e22; color:#fff;' : '';

         +
                        '<td>' + total.toLocaleString() + '</td>' +
                        '<td>' + paid.toLocaleString() + '</td>' +
                        '<td>' + remaining.toLocaleString() + '</td>' +
                        '<td>' + due + '</td>' +
                        '<td><span class="status-badge ' + priorityClass + '" style="' + priorityStyle + '">' + priority + '</span></td>';
        soaBody.prepend(row);
    }

    alert('Supplier record created and added to Finance Statement of Account.');
    closeModal('add-supplier-modal');
};

window.filterSuppliers = function() {
    const search = document.getElementById('supplier-search').value.toLowerCase();
    const status = document.getElementById('supplier-status-filter').value;
    const cat = document.getElementById('supplier-cat-filter').value;
    const rows = document.querySelectorAll('#suppliers-table-body tr');

    rows.forEach(row => {
        const nameMatch = row.getAttribute('data-name').includes(search);
        const statusMatch = status === 'all' || row.getAttribute('data-status') === status;
        const catMatch = cat === 'all' || row.getAttribute('data-category') === cat;
        row.style.display = (nameMatch && statusMatch && catMatch) ? '' : 'none';
    });
};

window.exportSuppliers = function(format) {
    alert('Exporting Supplier list and aging report to ' + format.toUpperCase() + '...');
};

// Expose global functions
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.submitWastage = submitWastage;
window.submitProduction = submitProduction;
window.submitRecipe = submitRecipe;
window.toggleTheme = toggleTheme;
window.applyLanguage = applyLanguage;
window.submitAddItem = submitAddItem;
window.submitStockTransfer = submitStockTransfer;
window.submitUser = submitUser;
window.submitBranch = submitBranch;
window.deleteBranch = deleteBranch;
window.calculateYieldProd = calculateYieldProd;
window.addProdIngredient = addProdIngredient;
window.addRecipeIngredient = addRecipeIngredient;
window.exportData = exportData;
window.exportSection = exportSection;
window.deleteSupplier = function(btn) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        btn.closest('tr').remove();
        alert('Supplier removed.');
        updateSupplierKPIs();
    }
};

window.editSupplier = function(btn) {
    const row = btn.closest('tr');
    const name = row.cells[1].innerText; // Index 1 because of checkbox
    const cat = row.getAttribute('data-category');
    const contact = row.cells[3].innerText;
    const total = row.cells[4].innerText.replace(/,/g, '');
    const paid = row.cells[5].innerText.replace(/,/g, '');
    const due = row.cells[7].innerText;
    const status = row.getAttribute('data-status');

    document.getElementById('sup-name').value = name;
    document.getElementById('sup-category').value = cat;
    document.getElementById('sup-contact').value = contact;
    document.getElementById('sup-total').value = total;
    document.getElementById('sup-paid').value = paid;
    document.getElementById('sup-due').value = due === '—' ? '' : due;
    document.getElementById('sup-status').value = status;
    
    calcSupplierRemaining();
    openModal('add-supplier-modal');
    
    // Remove old row so save creates "new" version or update logic
    row.remove();
};

window.exportTableToCSV = function(tableId, filename) {
    const table = document.getElementById(tableId);
    let csv = [];
    const rows = table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 1; j < cols.length - 1; j++) { // Skip checkbox and actions
            row.push('"' + cols[j].innerText.trim() + '"');
        }
        csv.push(row.join(','));
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.exportSuppliers = function(format) {
    if (format === 'xls') exportTableToCSV('suppliers-table', 'Suppliers_Report');
    else window.print();
};

window.exportSection = function(section, format) {
    if (format === 'xls') {
        const table = document.querySelector('#' + section + '-section table');
        if (table) exportTableToCSV(table.id || 'export-table', section + '_report');
        else alert('No table found to export.');
    } else window.print();
};

window.updateDashboardData = function() {
    // Read exact data from sections
    const supplierCount = document.querySelectorAll('#suppliers-table-body tr').length;
    const poCount = document.querySelectorAll('#purchasing-section .styled-table tbody tr').length;
    
    const poKpi = document.querySelector('.kpi-card .kpi-info h3:contains("Total P.O")');
    // Simplified update for demo
    alert('Dashboard synchronized with latest records.');
};

window.toggleAllCheckboxes = function(master) {
    const table = master.closest('table');
    const checks = table.querySelectorAll('tbody input[type="checkbox"]');
    checks.forEach(c => c.checked = master.checked);
};
window.syncDashboard = function() {
    console.log('Syncing dashboard data...');
    const supRows = document.querySelectorAll('#suppliers-table-body tr').length;
    const poRows = document.querySelectorAll('#purchasing-section .styled-table tbody tr').length;
    const invRows = document.querySelectorAll('#inventory-table tbody tr').length;
    const wastRows = document.querySelectorAll('#wastage-section table tbody tr').length;

    // Update Mini Cards
    const miniCards = document.querySelectorAll('.mini-card p');
    if (miniCards.length >= 4) {
        miniCards[0].innerText = poRows;    // P.O
        miniCards[1].innerText = supRows;   // Branch Orders (Mocked as suppliers for demo)
        miniCards[2].innerText = poRows;    // Total Orders
        miniCards[3].innerText = invRows;   // Daily usage
    }

    // Update KPIs in headers
    const kpis = document.querySelectorAll('.kpi-card p');
    kpis.forEach(k => {
        if (k.innerText.includes('Suppliers')) k.firstChild.innerText = supRows;
    });
};

window.exportSuppliers = function(fmt) {
    if (fmt === 'xls') exportTableHTML('suppliers-table', 'Supplier_Report');
    else window.print();
};

window.exportSection = function(sec, fmt) {
    if (fmt === 'xls') {
        const table = document.querySelector('#' + sec + '-section table');
        if (table) exportTableHTML(table.id || 'export-table', sec + '_report');
        else alert('No table found.');
    } else window.print();
};

function exportTableHTML(id, name) {
    const table = document.getElementById(id);
    let csv = [];
    table.querySelectorAll('tr').forEach(r => {
        let rowData = [];
        r.querySelectorAll('td, th').forEach((c, i) => {
            if (i > 0 && i < r.cells.length - 1) rowData.push('"' + c.innerText.trim() + '"');
        });
        csv.push(rowData.join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name + '.csv';
    link.click();
}

// Fixed actions
window.deleteSupplier = function(btn) {
    if (confirm('Delete supplier?')) { btn.closest('tr').remove(); syncDashboard(); }
};
window.editSupplier = function(btn) {
    const r = btn.closest('tr');
    document.getElementById('sup-name').value = r.cells[1].innerText;
    openModal('add-supplier-modal');
    r.remove();
};

window.toggleAllCheckboxes = function(m) {
    m.closest('table').querySelectorAll('tbody input[type=checkbox]').forEach(c => c.checked = m.checked);
};

// Initial sync
setTimeout(syncDashboard, 1000);
window.syncDashboard = function() {
    console.log('Synchronizing ERP data for real-time reporting...');
    
    // Exact count from modules
    const poCount = document.querySelectorAll('#purchasing-section .styled-table tbody tr').length;
    const supCount = document.querySelectorAll('#suppliers-table-body tr').length;
    const itemCount = document.querySelectorAll('#inventory-table tbody tr').length;
    const wastCount = document.querySelectorAll('#wastage-section table tbody tr').length;
    const prodCount = document.querySelectorAll('#production-section table tbody tr').length;

    // Update Dashboard Mini Cards
    const poEl = document.getElementById('kpi-po-count');
    if (poEl) poEl.innerText = poCount;
    
    const branchEl = document.getElementById('kpi-branch-orders');
    if (branchEl) branchEl.innerText = (supCount * 125.5).toFixed(2); // Simulated calculation based on suppliers

    const totalOrdersEl = document.getElementById('kpi-total-orders');
    if (totalOrdersEl) totalOrdersEl.innerText = (poCount + prodCount);

    const dailyUsageEl = document.getElementById('kpi-daily-usage');
    if (dailyUsageEl) dailyUsageEl.innerText = itemCount;

    // Update Module Header KPIs
    const supKpi = document.getElementById('kpi-sup-total');
    if (supKpi) supKpi.innerHTML = supCount + ' <span class="subtitle">Active</span>';

    // Update charts if they exist
    if (typeof charts !== 'undefined' && charts.length > 0) {
        // ... Logic to update charts could go here ...
    }
};

// Handle Sidebar Filters
document.querySelectorAll('.filter-item select').forEach(s => {
    s.addEventListener('change', () => {
        alert('Filtering Dashboard by: ' + s.value);
        syncDashboard();
    });
});

setInterval(syncDashboard, 3000);

// ============================================================
// AI DATA ASSISTANT LOGIC
// ============================================================
window.askAiAssistant = async function() {
    const prompt = document.getElementById('ai-user-prompt').value;
    const responseArea = document.getElementById('ai-response-area');
    const sqlDisplay = document.getElementById('ai-sql-display');
    
    if (!prompt) {
        alert('Please enter a question first.');
        return;
    }

    // Show loading state
    responseArea.style.display = 'block';
    sqlDisplay.innerText = '-- Generating query...';

    try {
        // In a production app, you would send this prompt to an LLM (OpenAI/Claude)
        // with the system prompt provided in your instructions.
        // For now, we will use a logic mapper for common ERP questions.
        
        let sql = "";
        const p = prompt.toLowerCase();

        if (p.includes('branch')) sql = "SELECT * FROM branches ORDER BY name LIMIT 50;";
        else if (p.includes('inventory')) sql = "SELECT * FROM inventory LIMIT 50;";
        else if (p.includes('supplier')) sql = "SELECT name, balance FROM suppliers ORDER BY balance DESC LIMIT 50;";
        else if (p.includes('purchase')) sql = "SELECT * FROM purchase_orders ORDER BY created_at DESC LIMIT 50;";
        else if (p.includes('wastage')) sql = "SELECT * FROM wastage ORDER BY date DESC LIMIT 50;";
        else {
            sql = "-- Manual Query Generated (Requires AI API Integration)\nSELECT * FROM " + (p.split(' ')[0] || 'inventory') + " LIMIT 50;";
        }

        sqlDisplay.innerText = sql;

        // Execute via Supabase (if rpc is enabled) or just Mock the result
        // Note: Real SQL execution requires a Supabase function 'exec_sql' or similar
        const { data, error } = await supabaseClient.from(p.includes('branch') ? 'branches' : 'inventory').select('*').limit(10);
        
        if (data) {
            renderAiResults(data);
        } else {
            console.error(error);
            renderAiResults([{ "Note": "AI integration ready. Connect an LLM API to run custom PostgreSQL queries." }]);
        }

    } catch (e) {
        sqlDisplay.innerText = "-- Error generating or running query.";
        console.error(e);
    }
};

function renderAiResults(data) {
    const head = document.getElementById('ai-results-head');
    const body = document.getElementById('ai-results-body');
    head.innerHTML = "";
    body.innerHTML = "";

    if (!data || data.length === 0) {
        body.innerHTML = "<tr><td colspan='100%'>No data found.</td></tr>";
        return;
    }

    // Header
    const keys = Object.keys(data[0]);
    const hr = document.createElement('tr');
    keys.forEach(k => hr.innerHTML += `<th>${k.toUpperCase()}</th>`);
    head.appendChild(hr);

    // Rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        keys.forEach(k => tr.innerHTML += `<td>${row[k]}</td>`);
        body.appendChild(tr);
    });
}
// Global Exports for HTML onclick events
window.submitBranch = submitBranch;
window.submitAddItem = submitAddItem;
window.submitStockTransfer = submitStockTransfer;
window.submitUser = submitUser;
window.submitProduction = submitProduction;
window.submitRecipe = submitRecipe;
window.submitWastage = submitWastage;
window.addProdIngredient = addProdIngredient;
window.calculateYieldProd = calculateYieldProd;
window.addRecipeIngredient = addRecipeIngredient;
window.deleteBranch = deleteBranch;
