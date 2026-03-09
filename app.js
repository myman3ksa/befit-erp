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
    let purchasesChartObj = null;
    let salesChartObj = null;
    let inventoryChartObj = null;

    function renderCharts() {
        const primaryColor = '#FFFFFF';
        const infoColor = '#888888';
        const successColor = '#2ECC71';
        const textColor = '#888888';
        const gridColor = '#222222';

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        };

        // 1. Purchases Chart (Bar)
        if (purchasesChartObj) purchasesChartObj.destroy();
        const ctxPurchases = document.getElementById('purchasesChart').getContext('2d');
        purchasesChartObj = new Chart(ctxPurchases, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Purchases (SAR)',
                    data: [12000, 15000, 11000, 18000, 22000, 16000],
                    backgroundColor: infoColor,
                    borderRadius: 4
                }]
            },
            options: chartOptions
        });

        // 2. Top Sales / Production Chart (Doughnut)
        if (salesChartObj) salesChartObj.destroy();
        const ctxSales = document.getElementById('salesChart').getContext('2d');
        salesChartObj = new Chart(ctxSales, {
            type: 'doughnut',
            data: {
                labels: ['Chicken Shawarma', 'Keto Box', 'Fresh Juice', 'Mashed Potato'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#FFFFFF', '#AAAAAA', '#555555', '#333333'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: textColor } } }
            }
        });

        // 3. Inventory Chart (Line)
        if (inventoryChartObj) inventoryChartObj.destroy();
        const ctxInv = document.getElementById('inventoryChart').getContext('2d');
        inventoryChartObj = new Chart(ctxInv, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Meat Usage',
                        data: [50, 60, 45, 80],
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Vegetables',
                        data: [30, 40, 35, 50],
                        borderColor: successColor,
                        backgroundColor: 'rgba(46, 204, 113, 0.05)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: chartOptions
        });
    }

    // Initial render
    setTimeout(renderCharts, 100);

    // --- Export Functionality (Mock) ---
    const exportBtn = document.getElementById('global-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const btnText = exportBtn.innerHTML;
            exportBtn.innerHTML = "<i class='bx bx-loader bx-spin'></i> Exporting...";
            setTimeout(() => {
                exportBtn.innerHTML = "<i class='bx bx-check'></i> Exported";
                setTimeout(() => { exportBtn.innerHTML = btnText; }, 2000);
            }, 1500);
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
