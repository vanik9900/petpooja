// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'signin.html';
        return;
    }
}

// Update user info in header
function updateUserInfo() {
    const userName = localStorage.getItem('userName');
    const userSpan = document.querySelector('.user span');
    if (userSpan && userName) {
        userSpan.textContent = userName;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Add logout button to header
function addLogoutButton() {
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = logout;
        userInfo.appendChild(logoutBtn);
    }
}

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Function to apply theme
function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme', 'system-theme');
    
    if (theme === 'system') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
        document.body.classList.add(`${theme}-theme`);
    }

    // Update theme-specific styles
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.style.setProperty('--bg-color', '#1a1a1a');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--card-bg', '#2d2d2d');
        root.style.setProperty('--border-color', '#404040');
    } else {
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-color', '#333333');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-color', '#e0e0e0');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    checkAuth();
    
    // Initialize sample data
    initializeSampleData();
    
    // Update user info
    updateUserInfo();
    
    // Initialize all features
    initializeFeatures();

    // Load and apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });
});

// Add auth token to all API requests
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication failed');
    }
    
    return response;
}

// Initialize all features
function initializeFeatures() {
    try {
        // Load initial data
        loadInventoryData();
        loadMenuData();
        loadWasteData();
        
        // Initialize other features
        initializeNavigation();
        initializeMonitoringControls();
        initializeNotifications();
    } catch (error) {
        console.error('Error initializing features:', error);
    }
}

// Load Data Functions
function loadInventoryData() {
    try {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        updateInventoryUI(inventory);
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function loadMenuData() {
    try {
        const menu = JSON.parse(localStorage.getItem('menu')) || [];
        updateMenuUI(menu);
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

function loadWasteData() {
    try {
        const waste = JSON.parse(localStorage.getItem('waste')) || [];
        updateWasteUI(waste);
    } catch (error) {
        console.error('Error loading waste:', error);
    }
}

// Update UI Functions
function updateInventoryUI(inventory) {
    const itemList = document.querySelector('.item-list');
    itemList.innerHTML = inventory.map(item => `
        <div class="item ${item.quantity <= item.minStock ? 'low-stock' : ''}" data-id="${item._id}">
            <img src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c" alt="${item.name}">
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${item.quantity} ${item.unit}</span>
                <span class="item-price">₹${item.price}/${item.unit}</span>
            </div>
        </div>
    `).join('');

    // Update inventory stats
    updateInventoryStats(inventory);
}

function updateMenuUI(menu) {
    const menuGrid = document.querySelector('.menu-grid');
    menuGrid.innerHTML = menu.map(item => `
        <div class="menu-item" data-id="${item._id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price}</span>
            </div>
        </div>
    `).join('');
}

function updateWasteUI(waste) {
    // Update waste chart
    const wasteChart = Chart.getChart('wasteChart');
    if (wasteChart) {
        wasteChart.data.labels = waste.map(w => new Date(w.date).toLocaleDateString());
        wasteChart.data.datasets[0].data = waste.map(w => w.cost);
        wasteChart.update();
    }

    // Update waste categories
    updateWasteCategories(waste);
}

function updateInventoryStats(inventory) {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(item => item.quantity <= item.minStock).length;
    const expiringSoon = inventory.filter(item => {
        const lastUpdated = new Date(item.lastUpdated);
        const daysSinceUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate >= 7;
    }).length;

    document.querySelector('.inventory-stats .stat:nth-child(1) .number').textContent = totalItems;
    document.querySelector('.inventory-stats .stat:nth-child(2) .number').textContent = lowStock;
    document.querySelector('.inventory-stats .stat:nth-child(3) .number').textContent = expiringSoon;
}

function updateWasteCategories(waste) {
    const categories = {};
    waste.forEach(w => {
        if (!categories[w.category]) {
            categories[w.category] = { amount: 0, cost: 0 };
        }
        categories[w.category].amount += w.amount;
        categories[w.category].cost += w.cost;
    });

    const totalWaste = Object.values(categories).reduce((sum, cat) => sum + cat.cost, 0);
    document.querySelector('.waste-stats .stat:nth-child(1) .number').textContent = `₹${totalWaste.toLocaleString()}`;

    const categoryList = document.querySelector('.category-list');
    categoryList.innerHTML = Object.entries(categories).map(([category, data]) => `
        <div class="category">
            <span class="category-name">${category}</span>
            <div class="progress-bar">
                <div class="progress" style="width: ${(data.cost / totalWaste * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

// Inventory Management System
class InventorySystem {
    constructor() {
        this.setupInventoryListeners();
    }

    setupInventoryListeners() {
        document.querySelector('.item-list').addEventListener('click', (e) => {
            const itemElement = e.target.closest('.item');
            if (itemElement) {
                const itemId = itemElement.dataset.id;
                this.showItemDetails(itemId);
            }
        });
    }

    async showItemDetails(itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`);
            const item = await response.json();
            
            const modal = document.createElement('div');
            modal.className = 'inventory-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>${item.name}</h3>
                    <div class="item-details">
                        <p>Current Stock: ${item.quantity} ${item.unit}</p>
                        <p>Price: ₹${item.price}/${item.unit}</p>
                        <p>Minimum Stock: ${item.minStock} ${item.unit}</p>
                    </div>
                    <div class="stock-controls">
                        <button class="add-stock">Add Stock</button>
                        <button class="remove-stock">Remove Stock</button>
                    </div>
                    <button class="close-modal">&times;</button>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
            modal.querySelector('.add-stock').addEventListener('click', () => this.updateStock(itemId, 1));
            modal.querySelector('.remove-stock').addEventListener('click', () => this.updateStock(itemId, -1));
        } catch (error) {
            console.error('Error showing item details:', error);
            notificationSystem.addNotification('Error loading item details', 'error');
        }
    }

    async updateStock(itemId, change) {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`);
            const item = await response.json();
            
            const newQuantity = item.quantity + change;
            if (newQuantity < 0) {
                notificationSystem.addNotification(`Cannot remove more ${item.name} than available`, 'error');
                return;
            }

            const updateResponse = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...item,
                    quantity: newQuantity,
                    lastUpdated: new Date()
                })
            });

            if (updateResponse.ok) {
                await loadInventoryData();
                if (newQuantity <= item.minStock) {
                    notificationSystem.addNotification(`Low stock alert: ${item.name} running low (${newQuantity} ${item.unit})`, 'warning');
                }
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            notificationSystem.addNotification('Error updating stock', 'error');
        }
    }
}

// Initialize inventory system
const inventorySystem = new InventorySystem();

// Navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's a hash link (starts with #), handle it with smooth scroll
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                this.parentElement.classList.add('active');
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // If it's a page link, just update the active state
                document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                this.parentElement.classList.add('active');
            }
        });
    });
}

// Simulate Real-time Updates
function simulateRealTimeUpdates() {
    // Update temperature
    setInterval(() => {
        const tempElement = document.querySelector('.monitor-item:nth-child(2) .status');
        const currentTemp = parseInt(tempElement.textContent);
        const newTemp = currentTemp + (Math.random() - 0.5) * 2;
        tempElement.textContent = `${Math.round(newTemp)}°C`;
        
        // Add warning if temperature is too high
        if (newTemp > 25) {
            tempElement.style.color = '#e74c3c';
            notificationSystem.addNotification('Temperature alert: Kitchen temperature above 25°C', 'warning');
        } else {
            tempElement.style.color = '#666';
        }
    }, 5000);

    // Update camera feed (simulated)
    setInterval(() => {
        const cameraFeed = document.querySelector('.camera-feed img');
        const timestamp = new Date().getTime();
        cameraFeed.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&t=${timestamp}`;
    }, 10000);

    // Update inventory stats
    setInterval(() => {
        const totalItems = document.querySelector('.inventory-stats .stat:nth-child(1) .number');
        const lowStock = document.querySelector('.inventory-stats .stat:nth-child(2) .number');
        const expiringSoon = document.querySelector('.inventory-stats .stat:nth-child(3) .number');

        // Simulate small random changes
        const newTotal = parseInt(totalItems.textContent) + Math.floor(Math.random() * 3) - 1;
        const newLowStock = parseInt(lowStock.textContent) + Math.floor(Math.random() * 3) - 1;
        const newExpiring = parseInt(expiringSoon.textContent) + Math.floor(Math.random() * 3) - 1;

        totalItems.textContent = newTotal;
        lowStock.textContent = newLowStock;
        expiringSoon.textContent = newExpiring;

        // Add notifications for significant changes
        if (newLowStock > 15) {
            notificationSystem.addNotification('High number of low stock items detected', 'warning');
        }
        if (newExpiring > 5) {
            notificationSystem.addNotification('Multiple items expiring soon', 'warning');
        }
    }, 15000);
}

// Notifications System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.badge = document.querySelector('.badge');
        this.setupNotificationListener();
    }

    setupNotificationListener() {
        document.querySelector('.notifications').addEventListener('click', () => {
            this.showNotifications();
        });
    }

    addNotification(message, type = 'info') {
        this.notifications.unshift({
            message,
            type,
            timestamp: new Date()
        });
        this.updateBadge();
        this.showNotificationToast(message, type);
    }

    updateBadge() {
        this.badge.textContent = this.notifications.length;
        this.badge.style.animation = 'none';
        this.badge.offsetHeight; // Trigger reflow
        this.badge.style.animation = 'pulse 2s infinite';
    }

    showNotificationToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getIconForType(type)}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    getIconForType(type) {
        switch(type) {
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    showNotifications() {
        // Create notification panel
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="close-notifications">&times;</button>
            </div>
            <div class="notification-list">
                ${this.notifications.map(notification => `
                    <div class="notification-item ${notification.type}">
                        <p>${notification.message}</p>
                        <small>${this.formatTime(notification.timestamp)}</small>
                    </div>
                `).join('')}
            </div>
        `;

        // Add panel to body
        document.body.appendChild(panel);

        // Close button functionality
        panel.querySelector('.close-notifications').addEventListener('click', () => {
            panel.remove();
        });

        // Close panel when clicking outside
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && !e.target.closest('.notifications')) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Add some sample notifications
notificationSystem.addNotification('Low stock alert: Tomatoes running low', 'warning');
notificationSystem.addNotification('New waste prediction available', 'info');
notificationSystem.addNotification('Temperature alert: Freezer temperature above threshold', 'error');

// Monitoring Controls
function initializeMonitoringControls() {
    const cameraBtn = document.querySelector('.control-btn:nth-child(1)');
    const tempBtn = document.querySelector('.control-btn:nth-child(2)');

    cameraBtn.addEventListener('click', () => {
        const cameraFeed = document.querySelector('.camera-feed img');
        const timestamp = new Date().getTime();
        cameraFeed.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&t=${timestamp}`;
        notificationSystem.addNotification('Camera feed updated', 'info');
    });

    tempBtn.addEventListener('click', () => {
        const tempElement = document.querySelector('.monitor-item:nth-child(2) .status');
        const currentTemp = parseInt(tempElement.textContent);
        const newTemp = currentTemp - 1;
        tempElement.textContent = `${newTemp}°C`;
        notificationSystem.addNotification('Temperature adjusted', 'info');
    });
}

// Add styles for notification toast
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .notification-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }

    .notification-toast.warning {
        border-left: 4px solid #f1c40f;
    }

    .notification-toast.error {
        border-left: 4px solid #e74c3c;
    }

    .notification-toast.info {
        border-left: 4px solid #3498db;
    }

    .notification-toast.fade-out {
        animation: slideOut 0.3s ease forwards;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
`;
document.head.appendChild(toastStyle);

// Add styles for notification panel
const style = document.createElement('style');
style.textContent = `
    .notification-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 300px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    }

    .notification-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification-header h3 {
        margin: 0;
        color: var(--primary-color);
    }

    .close-notifications {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .notification-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .notification-item {
        padding: 15px;
        border-bottom: 1px solid #eee;
    }

    .notification-item.warning {
        background-color: #fff3cd;
    }

    .notification-item.error {
        background-color: #f8d7da;
    }

    .notification-item small {
        display: block;
        color: #666;
        margin-top: 5px;
    }
`;
document.head.appendChild(style);

// Add styles for inventory modal
const inventoryModalStyle = document.createElement('style');
inventoryModalStyle.textContent = `
    .inventory-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        position: relative;
        width: 90%;
        max-width: 400px;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .item-details {
        margin: 20px 0;
    }

    .stock-controls {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .stock-controls button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .add-stock {
        background-color: #2ecc71;
        color: white;
    }

    .remove-stock {
        background-color: #e74c3c;
        color: white;
    }

    .add-stock:hover {
        background-color: #27ae60;
    }

    .remove-stock:hover {
        background-color: #c0392b;
    }
`;
document.head.appendChild(inventoryModalStyle);

// Initialize data storage
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    notifications: {
        lowStock: true,
        waste: true,
        sales: false,
        updates: true
    },
    theme: 'light',
    language: 'English',
    timezone: 'IST',
    dateFormat: 'DD/MM/YYYY',
    autoBackup: true
};

// Inventory Management Functions
function initializeInventory() {
    if (inventory.length === 0) {
        // Add default inventory items
        inventory = [
            {
                id: 1,
                name: 'Tomatoes',
                category: 'Vegetables',
                quantity: 5,
                unit: 'kg',
                price: 40,
                status: 'low',
                expiryDate: '2024-03-25'
            },
            {
                id: 2,
                name: 'Chicken',
                category: 'Meat',
                quantity: 10,
                unit: 'kg',
                price: 200,
                status: 'medium',
                expiryDate: '2024-03-24'
            },
            {
                id: 3,
                name: 'Basmati Rice',
                category: 'Grains',
                quantity: 25,
                unit: 'kg',
                price: 80,
                status: 'high',
                expiryDate: '2024-04-15'
            },
            {
                id: 4,
                name: 'Onions',
                category: 'Vegetables',
                quantity: 8,
                unit: 'kg',
                price: 30,
                status: 'medium',
                expiryDate: '2024-03-28'
            }
        ];
        saveInventory();
    }
}

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function addInventoryItem(item) {
    item.id = inventory.length + 1;
    item.status = determineStatus(item.quantity);
    inventory.push(item);
    saveInventory();
    updateInventoryTable();
    updateDashboardStats();
}

function updateInventoryItem(id, updatedItem) {
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
        inventory[index] = { ...inventory[index], ...updatedItem };
        inventory[index].status = determineStatus(updatedItem.quantity);
        saveInventory();
        updateInventoryTable();
        updateDashboardStats();
    }
}

function deleteInventoryItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    saveInventory();
    updateInventoryTable();
    updateDashboardStats();
}

function determineStatus(quantity) {
    if (quantity <= 5) return 'low';
    if (quantity <= 15) return 'medium';
    return 'high';
}

function getInventoryStats() {
    return {
        totalItems: inventory.length,
        lowStock: inventory.filter(item => item.status === 'low').length,
        expiringSoon: inventory.filter(item => {
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7;
        }).length
    };
}

// Search and Filter Functions
function searchInventory(query) {
    return inventory.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
}

function filterInventoryByStatus(status) {
    if (status === 'all') return inventory;
    return inventory.filter(item => item.status === status);
}

// UI Update Functions
function updateInventoryTable() {
    const tableBody = document.querySelector('.inventory-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity} ${item.unit}</td>
            <td>₹${item.price}/${item.unit}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
            <td>
                <button onclick="editItem(${item.id})" class="action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteItem(${item.id})" class="action-btn delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDashboardStats() {
    const stats = getInventoryStats();
    
    // Update inventory stats
    const totalItemsElement = document.querySelector('.inventory-stats .stat:nth-child(1) .number');
    const lowStockElement = document.querySelector('.inventory-stats .stat:nth-child(2) .number');
    const expiringSoonElement = document.querySelector('.inventory-stats .stat:nth-child(3) .number');

    if (totalItemsElement) totalItemsElement.textContent = stats.totalItems;
    if (lowStockElement) lowStockElement.textContent = stats.lowStock;
    if (expiringSoonElement) expiringSoonElement.textContent = stats.expiringSoon;
}

// Modal Functions
function showAddItemModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    const modal = document.getElementById('editItemModal');
    if (modal) {
        // Populate form fields
        const form = modal.querySelector('form');
        form.querySelector('[name="name"]').value = item.name;
        form.querySelector('[name="category"]').value = item.category;
        form.querySelector('[name="quantity"]').value = item.quantity;
        form.querySelector('[name="unit"]').value = item.unit;
        form.querySelector('[name="price"]').value = item.price;
        form.querySelector('[name="expiryDate"]').value = item.expiryDate;

        // Store item ID for update
        modal.dataset.itemId = id;
        modal.style.display = 'block';
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        deleteInventoryItem(id);
    }
}

// Chart Functions
function initializeCharts() {
    // Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart');
    if (inventoryCtx) {
        new Chart(inventoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low Stock', 'Medium Stock', 'High Stock'],
                datasets: [{
                    data: [
                        inventory.filter(item => item.status === 'low').length,
                        inventory.filter(item => item.status === 'medium').length,
                        inventory.filter(item => item.status === 'high').length
                    ],
                    backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Waste Chart
    const wasteCtx = document.getElementById('wasteChart');
    if (wasteCtx) {
        new Chart(wasteCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Waste Amount',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#e74c3c',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Settings Functions
function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    saveSettings();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory
    initializeInventory();
    
    // Initialize charts
    initializeCharts();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update inventory table
    updateInventoryTable();

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const filteredItems = searchInventory(e.target.value);
            updateInventoryTable(filteredItems);
        });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const status = this.dataset.status;
            const filteredItems = filterInventoryByStatus(status);
            updateInventoryTable(filteredItems);
        });
    });

    // Form submissions
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newItem = {
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: parseFloat(formData.get('quantity')),
                unit: formData.get('unit'),
                price: parseFloat(formData.get('price')),
                expiryDate: formData.get('expiryDate')
            };
            addInventoryItem(newItem);
            closeModal('addItemModal');
            this.reset();
        });
    }

    const editItemForm = document.getElementById('editItemForm');
    if (editItemForm) {
        editItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const modal = document.getElementById('editItemModal');
            const itemId = parseInt(modal.dataset.itemId);
            const formData = new FormData(this);
            const updatedItem = {
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: parseFloat(formData.get('quantity')),
                unit: formData.get('unit'),
                price: parseFloat(formData.get('price')),
                expiryDate: formData.get('expiryDate')
            };
            updateInventoryItem(itemId, updatedItem);
            closeModal('editItemModal');
        });
    }

    // Settings form
    const settingsForm = document.querySelector('.settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newSettings = {
                notifications: {
                    lowStock: formData.get('lowStock') === 'on',
                    waste: formData.get('waste') === 'on',
                    sales: formData.get('sales') === 'on',
                    updates: formData.get('updates') === 'on'
                },
                theme: formData.get('theme'),
                language: formData.get('language'),
                timezone: formData.get('timezone'),
                dateFormat: formData.get('dateFormat'),
                autoBackup: formData.get('autoBackup') === 'on'
            };
            updateSettings(newSettings);
            alert('Settings saved successfully!');
        });
    }
});

// Prediction Data Management
let predictionData = {
    sales: {
        weekly: [],
        monthly: [],
        yearly: []
    },
    inventory: {
        requirements: [],
        trends: []
    },
    customers: {
        behavior: [],
        segments: []
    },
    popularItems: []
};

// Initialize prediction data
function initializePredictionData() {
    // Sales data
    predictionData.sales.weekly = [
        { date: '2024-01-01', actual: 35000, predicted: 40000 },
        { date: '2024-01-08', actual: 42000, predicted: 45000 },
        { date: '2024-01-15', actual: 38000, predicted: 42000 },
        { date: '2024-01-22', actual: 45000, predicted: 48000 },
        { date: '2024-01-29', actual: 48000, predicted: 50000 }
    ];

    // Inventory requirements
    predictionData.inventory.requirements = [
        { item: 'Chicken', current: 15, required: 20 },
        { item: 'Rice', current: 25, required: 30 },
        { item: 'Vegetables', current: 20, required: 25 },
        { item: 'Spices', current: 8, required: 10 },
        { item: 'Dairy', current: 12, required: 15 }
    ];

    // Customer behavior
    predictionData.customers.segments = [
        { type: 'New Customers', count: 30 },
        { type: 'Returning Customers', count: 50 },
        { type: 'VIP Customers', count: 20 }
    ];

    // Popular items forecast
    predictionData.popularItems = [
        { name: 'Butter Chicken', orders: 45, confidence: 'high' },
        { name: 'Biryani', orders: 38, confidence: 'high' },
        { name: 'Paneer Butter Masala', orders: 32, confidence: 'medium' },
        { name: 'Dal Makhani', orders: 28, confidence: 'medium' }
    ];
}

// Sales Prediction Functions
function getSalesPrediction(period = 'week') {
    const data = predictionData.sales[period];
    if (!data) return null;

    const currentWeek = data[data.length - 1];
    const previousWeek = data[data.length - 2];
    
    return {
        current: currentWeek.predicted,
        previous: previousWeek.predicted,
        trend: ((currentWeek.predicted - previousWeek.predicted) / previousWeek.predicted) * 100
    };
}

function updateSalesChart(period = 'week') {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    const data = predictionData.sales[period];
    const labels = data.map(item => new Date(item.date).toLocaleDateString());
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Actual Sales',
                data: data.map(item => item.actual),
                borderColor: '#3498db',
                tension: 0.1
            }, {
                label: 'Predicted Sales',
                data: data.map(item => item.predicted),
                borderColor: '#2ecc71',
                borderDash: [5, 5],
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Inventory Prediction Functions
function getInventoryPredictions() {
    const requirements = predictionData.inventory.requirements;
    const itemsToOrder = requirements.filter(item => item.current < item.required);
    const totalCost = itemsToOrder.reduce((sum, item) => {
        const price = getItemPrice(item.item);
        return sum + (item.required - item.current) * price;
    }, 0);

    return {
        itemsToOrder: itemsToOrder.length,
        estimatedCost: totalCost,
        savings: calculateInventorySavings(requirements)
    };
}

function updateInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    const data = predictionData.inventory.requirements;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.item),
            datasets: [{
                label: 'Current Stock',
                data: data.map(item => item.current),
                backgroundColor: '#3498db'
            }, {
                label: 'Required Stock',
                data: data.map(item => item.required),
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Customer Behavior Functions
function getCustomerPredictions() {
    const segments = predictionData.customers.segments;
    const totalCustomers = segments.reduce((sum, segment) => sum + segment.count, 0);
    
    return {
        totalCustomers,
        segments: segments,
        averageOrderValue: calculateAverageOrderValue()
    };
}

function updateCustomerChart() {
    const ctx = document.getElementById('customerChart');
    if (!ctx) return;

    const data = predictionData.customers.segments;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(segment => segment.type),
            datasets: [{
                data: data.map(segment => segment.count),
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Popular Items Functions
function getPopularItemsForecast() {
    return predictionData.popularItems.map(item => ({
        name: item.name,
        orders: item.orders,
        confidence: item.confidence
    }));
}

// Helper Functions
function getItemPrice(itemName) {
    // This would typically come from your inventory data
    const prices = {
        'Chicken': 200,
        'Rice': 80,
        'Vegetables': 40,
        'Spices': 150,
        'Dairy': 60
    };
    return prices[itemName] || 0;
}

function calculateInventorySavings(requirements) {
    // Calculate potential savings based on bulk purchasing and seasonal items
    let totalSavings = 0;
    requirements.forEach(item => {
        const price = getItemPrice(item.item);
        if (item.item === 'Vegetables') {
            totalSavings += (item.required * price * 0.15); // 15% savings for seasonal vegetables
        } else if (item.item === 'Rice') {
            totalSavings += (item.required * price * 0.08); // 8% savings for bulk purchase
        }
    });
    return totalSavings;
}

function calculateAverageOrderValue() {
    // This would typically come from your sales data
    return 180; // Example fixed value
}

// Event Listeners for Prediction Page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize prediction data
    initializePredictionData();

    // Handle period selection for sales prediction
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.textContent.toLowerCase();
            updateSalesChart(period);
            
            // Update active state
            const parent = this.parentElement;
            parent.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Update all charts
    updateSalesChart();
    updateInventoryChart();
    updateCustomerChart();

    // Update statistics
    const salesPrediction = getSalesPrediction();
    const inventoryPredictions = getInventoryPredictions();
    const customerPredictions = getCustomerPredictions();

    // Update sales stats
    if (salesPrediction) {
        document.querySelector('.stat-value:nth-child(1)').textContent = `₹${salesPrediction.current.toLocaleString()}`;
        document.querySelector('.trend-indicator span').textContent = `${salesPrediction.trend.toFixed(1)}% vs last week`;
    }

    // Update inventory stats
    document.querySelector('.stat-value:nth-child(1)').textContent = inventoryPredictions.itemsToOrder;
    document.querySelector('.stat-value:nth-child(2)').textContent = `₹${inventoryPredictions.estimatedCost.toLocaleString()}`;

    // Update customer stats
    document.querySelector('.stat-value:nth-child(1)').textContent = customerPredictions.totalCustomers;
    document.querySelector('.stat-value:nth-child(2)').textContent = `₹${customerPredictions.averageOrderValue}`;
}); 