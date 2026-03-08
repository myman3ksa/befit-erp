// --- Supabase Client Initialization ---
const { createClient } = supabase;
const SUPABASE_URL = 'https://dmkderzdipkzgitidnzy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kDN7Xyf9FWwfQI5skcwR_w_jhR5eu9m';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation System ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Hide all sections
            sections.forEach(sec => sec.classList.remove('active'));

            // Show target section
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Re-render charts if dashboard is active to ensure proper sizing
            if (targetId === 'dashboard-section') {
                renderCharts();
            }
        });
    });

    // --- Chart.js Implementations ---
    let purchasesChartObj = null;
    let salesChartObj = null;
    let inventoryChartObj = null;

    function renderCharts() {
        const primaryColor = '#FCA311';
        const infoColor = '#3498DB';
        const successColor = '#2ECC71';
        const textColor = '#8A96AC';
        const gridColor = '#2A3042';

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

        // 2. Top Sales / Production Chart (Pie or Doughnut)
        if (salesChartObj) salesChartObj.destroy();
        const ctxSales = document.getElementById('salesChart').getContext('2d');
        salesChartObj = new Chart(ctxSales, {
            type: 'doughnut',
            data: {
                labels: ['Chicken Shawarma', 'Keto Box', 'Fresh Juice', 'Mashed Potato'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [primaryColor, successColor, infoColor, '#E74C3C'],
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
                        backgroundColor: 'rgba(252, 163, 17, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Vegetables',
                        data: [30, 40, 35, 50],
                        borderColor: successColor,
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
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
                setTimeout(() => {
                    exportBtn.innerHTML = btnText;
                }, 2000);
            }, 1500);
        });
    }

});

// --- Modal System ---
window.openModal = function (id) {
    document.getElementById(id).style.display = 'flex';
    // Add show class after a tiny delay for animation
    setTimeout(() => {
        document.getElementById(id).classList.add('show');
    }, 10);
};

window.closeModal = function (id) {
    document.getElementById(id).classList.remove('show');
    setTimeout(() => {
        document.getElementById(id).style.display = 'none';
    }, 300); // Wait for transition
};

// Close modal if clicked outside of content
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}
