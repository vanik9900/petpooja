// Inventory Page Handlers
function setupInventoryHandlers() {
    // Add item button
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            const modal = document.getElementById('addItemModal');
            if (modal) modal.style.display = 'block';
        });
    }

    // Search functionality
    const searchInput = document.getElementById('inventorySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.item');
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status;
            const items = document.querySelectorAll('.item');
            items.forEach(item => {
                if (status === 'all' || item.dataset.status === status) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Menu Page Handlers
function setupMenuHandlers() {
    // Add menu item button
    const addMenuItemBtn = document.getElementById('addMenuItemBtn');
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener('click', () => {
            const modal = document.getElementById('addMenuItemModal');
            if (modal) modal.style.display = 'block';
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            const items = document.querySelectorAll('.menu-item');
            items.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Search functionality
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.menu-item');
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
}

// Waste Analysis Page Handlers
function setupWasteHandlers() {
    // Add waste entry button
    const addWasteBtn = document.getElementById('addWasteBtn');
    if (addWasteBtn) {
        addWasteBtn.addEventListener('click', () => {
            const modal = document.getElementById('addWasteModal');
            if (modal) modal.style.display = 'block';
        });
    }

    // Period selector
    const periodSelector = document.getElementById('wastePeriod');
    if (periodSelector) {
        periodSelector.addEventListener('change', (e) => {
            const period = e.target.value;
            updateWasteChart(period);
        });
    }

    // Export button
    const exportBtn = document.getElementById('exportWasteBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportWasteData);
    }
}

// Predictions Page Handlers
function setupPredictionHandlers() {
    // Period selector
    const periodSelector = document.getElementById('predictionPeriod');
    if (periodSelector) {
        periodSelector.addEventListener('change', (e) => {
            const period = e.target.value;
            updatePredictions(period);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshPredictions');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            initializePredictions();
            updatePredictionsUI();
        });
    }
}

// Settings Page Handlers
function setupSettingsHandlers() {
    // Theme selector
    const themeSelector = document.getElementById('themeSelect');
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const theme = e.target.value;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    }

    // Reset settings button
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                localStorage.removeItem('settings');
                initializeSettings();
                location.reload();
            }
        });
    }

    // Save settings button
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const settings = {
                theme: themeSelector.value,
                notifications: {
                    lowStock: document.getElementById('lowStockNotif').checked,
                    waste: document.getElementById('wasteNotif').checked,
                    sales: document.getElementById('salesNotif').checked,
                    updates: document.getElementById('updatesNotif').checked
                },
                language: document.getElementById('languageSelect').value,
                timezone: document.getElementById('timezoneSelect').value,
                dateFormat: document.getElementById('dateFormatSelect').value,
                autoBackup: document.getElementById('autoBackup').checked
            };
            updateSettings(settings);
            showNotification('Settings saved successfully!');
        });
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function exportWasteData() {
    const waste = JSON.parse(localStorage.getItem('waste')) || [];
    const csv = convertToCSV(waste);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waste-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => item[header]));
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Initialize page handlers based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'inventory.html':
            setupInventoryHandlers();
            break;
        case 'menu.html':
            setupMenuHandlers();
            break;
        case 'waste.html':
            setupWasteHandlers();
            break;
        case 'predictions.html':
            setupPredictionHandlers();
            break;
        case 'settings.html':
            setupSettingsHandlers();
            break;
    }
}); 