// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;
const SUPABASE_URL = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kDN7Xyf9FWwfQI5skcwR_w_jhR5eu9m';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        menu_users: 'Users',
        menu_wastage: 'Wastage',
        menu_settings: 'Settings',
        menu_logout: 'Logout',
        wastage_title: 'Wastage Logging',
        th_date: 'Date',
        th_item: 'Item Name',
        th_qty: 'Qty Wasted',
        th_reason: 'Reason',
        th_branch: 'Branch',
        welcome_banner: 'Welcome, ✨🌙',
        ramadan_wish: 'Wishing you a blessed Ramadan',
        general_tab: 'General',
        branches_tab: 'Branches',
        kitchen_tab: 'Kitchen',
        orders_label: 'Orders',
        net_sales_label: 'Net Sales',
        net_payments_label: 'Net Payments',
        return_amount_label: 'Return Amount',
        discount_amount_label: 'Discount Amount',
        view_report: 'View Report',
        order_types: 'Order types',
        hourly_sales: 'Hourly Sales',
        top_products: 'Top Products by Net Sales (SAR)',
        top_payments: 'Top Payments (SAR)',
        top_branches: 'Top Branches by Net Sales (SAR)'
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
        menu_users: 'المستخدمون',
        menu_wastage: 'الهدر',
        menu_settings: 'الإعدادات',
        menu_logout: 'تسجيل خروج',
        wastage_title: 'تسجيل الهدر',
        th_date: 'التاريخ',
        th_item: 'اسم المنتج',
        th_qty: 'الكمية المهدرة',
        th_reason: 'السبب',
        th_branch: 'الفرع',
        welcome_banner: 'أهلاً بك، ✨🌙',
        ramadan_wish: 'نتمنى لك رمضان مبارك',
        general_tab: 'عام',
        branches_tab: 'الفروع',
        kitchen_tab: 'المطبخ',
        orders_label: 'الطلبات',
        net_sales_label: 'صافي المبيعات',
        net_payments_label: 'صافي المدفوعات',
        return_amount_label: 'مبلغ المرتجعات',
        discount_amount_label: 'مبلغ الخصم',
        view_report: 'عرض التقرير',
        order_types: 'أنواع الطلبات',
        hourly_sales: 'المبيعات الساعية',
        top_products: 'أفضل المنتجات حسب صافي المبيعات (ر.س)',
        top_payments: 'أفضل طرق الدفع (ر.س)',
        top_branches: 'أفضل الفروع حسب صافي المبيعات (ر.س)'
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
}

function handleLogout() {
    supabaseClient.auth.signOut();
    document.getElementById('auth-overlay').classList.add('active');
    toggleAuthMode('login');
}

// ============================================================
// INVENTORY & USER LOGIC
// ============================================================
function submitAddItem() {
    alert('Inventory item added successfully!');
    closeModal('add-item-modal');
}

function submitStockTransfer() {
    alert('Stock transfer completed successfully!');
    closeModal('stock-transfer-modal');
}

function submitUser() {
    alert('User settings and permissions saved successfully!');
    closeModal('user-modal');
}

// ============================================================
// PRODUCTION & RECIPE LOGIC
// ============================================================
let productionLog = [];
let recipes = [];

function submitProduction() {
    const item = document.getElementById('prod-menu-item').value;
    const branch = document.getElementById('prod-branch').value;
    const qty = parseFloat(document.getElementById('prod-qty').value);

    if (!qty || qty <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    const entry = {
        date: new Date().toLocaleDateString('en-GB'),
        item,
        branch,
        qty: `${qty} Portions`,
        cost: (qty * 4.5).toFixed(2), // Mock cost calculation
        wastage: '0 Portions'
    };

    productionLog.unshift(entry);
    renderProductionTable();
    closeModal('production-modal');
}

function renderProductionTable() {
    const tbody = document.querySelector('#production-section .styled-table tbody');
    if (!tbody) return;
    tbody.innerHTML = productionLog.map(row => `
        <tr>
            <td>${row.date}</td>
            <td>${row.item}</td>
            <td>${row.branch}</td>
            <td><strong>${row.qty}</strong></td>
            <td>${row.cost}</td>
            <td>${row.wastage}</td>
        </tr>
    `).join('') + tbody.innerHTML; // Prepend new entries
}

function submitRecipe() {
    const name = document.getElementById('recipe-name').value.trim();
    const category = document.getElementById('recipe-category').value;

    if (!name) {
        alert('Please enter a recipe name.');
        return;
    }

    alert(`Recipe "${name}" created successfully!`);
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
        const miniCtxs = ['miniChartOrders', 'miniChartSales', 'miniChartPayments', 'miniChartReturns', 'miniChartDiscounts'];
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

        // Large Order Types Chart
        const ctxOrderTypes = document.getElementById('orderTypesChart');
        if (ctxOrderTypes) {
            new Chart(ctxOrderTypes, {
                type: 'line',
                data: {
                    labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '11 PM'],
                    datasets: [
                        { label: 'Delivery', data: [5, 10, 5, 20, 45, 30, 60, 40, 20], borderColor: '#1F3A93', fill: false },
                        { label: 'Dine-in', data: [2, 5, 2, 15, 30, 20, 50, 30, 15], borderColor: '#E67E22', fill: false },
                        { label: 'Pickup', data: [3, 8, 3, 10, 25, 15, 40, 25, 10], borderColor: '#5D3FD3', fill: false }
                    ]
                },
                options: { ...barOptions, plugins: { legend: { display: true, labels: { color: textColor } } } }
            });
        }

        // Hourly Sales Chart
        const ctxHourly = document.getElementById('hourlySalesChart');
        if (ctxHourly) {
            new Chart(ctxHourly, {
                type: 'bar',
                data: {
                    labels: ['11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'],
                    datasets: [{
                        data: [0, 0, 0, 0, 0, 120, 420, 0, 0, 180, 80, 0],
                        backgroundColor: accentColor,
                        borderRadius: 5
                    }]
                },
                options: barOptions
            });
        }

        // Pie Charts
        const pieCtxs = {
            'productsPieChart': { labels: ['Shawarma', 'Burger', 'Salad', 'Juice'], data: [45, 25, 20, 10] },
            'paymentsPieChart': { labels: ['Cash', 'Mada', 'Visa', 'Apple Pay'], data: [30, 40, 20, 10] },
            'branchesPieChart': { labels: ['Main', 'Jeddah', 'Dammam'], data: [60, 25, 15] }
        };

        const colors = ['#002147', '#E67E22', '#5D3FD3', '#89CFF0', '#2ECC71'];

        Object.keys(pieCtxs).forEach(id => {
            const ctx = document.getElementById(id);
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: pieCtxs[id].labels,
                        datasets: [{ data: pieCtxs[id].data, backgroundColor: colors, borderWidth: 0 }]
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
