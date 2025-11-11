// Default menu items with images for restaurant
const DEFAULT_MENU_ITEMS = [
    {
        id: 1,
        name: "Idly",
        price: 40,
        image: "https://images.unsplash.com/photo-1630007375246-58440ff1a4e9?w=400"
    },
    {
        id: 2,
        name: "Puttu",
        price: 50,
        image: "https://images.unsplash.com/photo-1589301760014-d929314c3fe6?w=400"
    },
    {
        id: 3,
        name: "Poori",
        price: 35,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"
    },
    {
        id: 4,
        name: "Coffee",
        price: 30,
        image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400"
    },
    {
        id: 5,
        name: "Dosa",
        price: 60,
        image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400"
    },
    {
        id: 6,
        name: "Vada Pav",
        price: 45,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"
    }
];

let cart = [];
let salesData = [];
let menuItems = [];
let expenses = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    try {
        loadMenuItems();
        loadExpenses();
        initializeInvoiceCounter();
        initializeApp();
        setupEventListeners();
        updateDashboard();
        updateDate();
        loadUserData();
    } catch (err) {
        console.error('Initialization error in app.js:', err);
    }
});

function initializeApp() {
    try {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            // If we're already on a page under pages/, redirect to login; otherwise do nothing
            if (window.location.pathname.includes('/pages/')) {
                window.location.href = 'login.html';
            } else {
                // Not inside pages folder - redirect to pages login
                window.location.href = 'pages/login.html';
            }
            return;
        }

        const user = JSON.parse(currentUser);
        console.log('Loaded user:', user); // Debug log
        const userNameEl = document.getElementById('user-name');
        const welcomeNameEl = document.getElementById('welcome-name');
        const displayName = user.name || user.email || 'User';
        if (userNameEl) {
            userNameEl.textContent = displayName;
            console.log('Set user-name to:', displayName);
        }
        if (welcomeNameEl) {
            welcomeNameEl.textContent = displayName;
            console.log('Set welcome-name to:', displayName);
        }

        // Load data from localStorage
        loadCart();
        loadSalesData();
    } catch (err) {
        console.error('Error in initializeApp:', err);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Menu page buttons
    document.getElementById('add-item-btn')?.addEventListener('click', openAddMenuModal);
    // Expenses page buttons
    document.getElementById('add-expense-btn')?.addEventListener('click', openAddExpenseModal);
    document.getElementById('clear-expenses-btn')?.addEventListener('click', clearExpenses);
    // Clear all demo data (menu, cart, sales, user)
    document.getElementById('clear-data-btn')?.addEventListener('click', clearAllData);
    // Clear Pages Menu - full reset and redirect to login
    document.getElementById('clear-pages-menu-btn')?.addEventListener('click', clearPagesMenu);

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Billing buttons
    document.getElementById('pay-now-btn')?.addEventListener('click', showQRCode);
    document.getElementById('print-bill-btn')?.addEventListener('click', printBill);
    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);

    // Reports buttons
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', generateReport);
    });

    document.getElementById('filter-btn')?.addEventListener('click', filterReports);
    document.getElementById('download-pdf')?.addEventListener('click', downloadPDF);
    document.getElementById('download-excel')?.addEventListener('click', downloadExcel);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Menu form submission
    document.getElementById('menu-form')?.addEventListener('submit', saveMenuItem);
    // Expense form submission
    document.getElementById('expense-form')?.addEventListener('submit', saveExpense);

    // Force refresh user display (in case currentUser changed)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const userNameEl = document.getElementById('user-name');
        const welcomeNameEl = document.getElementById('welcome-name');
        const displayName = user.name || user.email || 'User';
        if (userNameEl) userNameEl.textContent = displayName;
        if (welcomeNameEl) welcomeNameEl.textContent = displayName;
    }
}

// Expenses management
function loadExpenses() {
    const stored = localStorage.getItem('expenses');
    if (stored) {
        expenses = JSON.parse(stored);
    } else {
        expenses = [];
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function displayManageExpenses() {
    const container = document.getElementById('manage-expenses-container');
    if (!container) return;
    container.innerHTML = '';

    if (expenses.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#7f8c8d;">No expenses recorded.</p>';
        return;
    }

    expenses.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'expense-card';
        card.innerHTML = `
            <div class="expense-row">
                <div class="expense-left">
                    <h4>${exp.type}</h4>
                    <div class="expense-date">${new Date(exp.date).toLocaleDateString()}</div>
                    <div class="expense-notes">${exp.notes || ''}</div>
                </div>
                <div class="expense-right">
                    <div class="expense-amount">₹${parseFloat(exp.amount).toFixed(2)}</div>
                    <div class="expense-actions">
                        <button class="btn btn-secondary" onclick="editExpense(${exp.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteExpense(${exp.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openAddExpenseModal() {
    document.getElementById('expense-modal-title').textContent = 'Add Expense';
    document.getElementById('expense-form').reset();
    delete document.getElementById('expense-form').dataset.expenseId;
    document.getElementById('expense-modal').classList.add('active');
}

function editExpense(expenseId) {
    const exp = expenses.find(e => e.id === expenseId);
    if (!exp) return;
    document.getElementById('expense-modal-title').textContent = 'Edit Expense';
    document.getElementById('expense-type').value = exp.type;
    document.getElementById('expense-amount').value = exp.amount;
    document.getElementById('expense-date').value = new Date(exp.date).toISOString().slice(0,10);
    document.getElementById('expense-notes').value = exp.notes || '';
    document.getElementById('expense-form').dataset.expenseId = expenseId;
    document.getElementById('expense-modal').classList.add('active');
}

function deleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return;
    expenses = expenses.filter(e => e.id !== expenseId);
    saveExpenses();
    displayManageExpenses();
    alert('Expense deleted');
}

function saveExpense(e) {
    e.preventDefault();
    const type = document.getElementById('expense-type').value;
    const amount = parseFloat(document.getElementById('expense-amount').value || 0);
    const date = document.getElementById('expense-date').value || new Date().toISOString().slice(0,10);
    const notes = document.getElementById('expense-notes').value;
    const expenseId = document.getElementById('expense-form').dataset.expenseId;

    if (expenseId) {
        const exp = expenses.find(ex => ex.id == expenseId);
        if (exp) {
			// Preserve old values when inputs are left unchanged/empty
			exp.type = (type && type.trim()) ? type : exp.type;
			exp.amount = isNaN(amount) ? exp.amount : amount;
			exp.date = (document.getElementById('expense-date').value ? date : exp.date);
			exp.notes = (notes !== undefined && notes !== null && notes.trim() !== '') ? notes : exp.notes;
        }
    } else {
        const newExp = {
            id: Date.now(),
            type,
            amount,
            date,
            notes
        };
        expenses.push(newExp);
    }

    saveExpenses();
    document.getElementById('expense-modal').classList.remove('active');
    displayManageExpenses();
    alert('Expense saved');
}

function clearExpenses() {
    if (!confirm('This will remove all expenses. Continue?')) return;
    expenses = [];
    saveExpenses();
    displayManageExpenses();
    alert('All expenses cleared');
}

// Transaction and Invoice Management
let invoiceCounter = 1001;

function initializeInvoiceCounter() {
    const stored = localStorage.getItem('invoiceCounter');
    if (stored) {
        invoiceCounter = parseInt(stored);
    }
}

function saveTransaction(totalAmount) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const invoiceNo = 'INV-' + invoiceCounter;
    invoiceCounter++;
    localStorage.setItem('invoiceCounter', invoiceCounter);

    const now = new Date();
    const transaction = {
        id: Date.now(),
        invoiceNo: invoiceNo,
        date: now,
        dateFormatted: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        timeFormatted: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        customerName: currentUser?.name || currentUser?.email || 'Customer',
        items: [...cart],
        total: totalAmount
    };

    // Save to sales data
    salesData.push(transaction);
    saveSalesData();

    return transaction;
}

function downloadInvoiceAsText(transaction) {
    let invoiceText = `
╔════════════════════════════════════════════╗
║     🍽️  RESTAURANT INVOICE 🍽️            ║
║     Professional Billing System            ║
╚════════════════════════════════════════════╝

INVOICE DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invoice #: ${transaction.invoiceNo}
Date: ${transaction.dateFormatted}
Time: ${transaction.timeFormatted}
Customer: ${transaction.customerName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    let totalQty = 0;
    transaction.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        invoiceText += `${(index + 1).toString().padStart(2, '0')}. ${item.name.padEnd(20)} | Qty: ${item.quantity.toString().padStart(2)} | ₹${item.price.toFixed(2).padStart(8)} | ₹${itemTotal.toFixed(2).padStart(8)}\n`;
        totalQty += item.quantity;
    });

    invoiceText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Items: ${totalQty}
Total Amount: ₹${transaction.total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount Due: ₹${transaction.total.toFixed(2)}
Status: PAID
Payment Method: UPI / Card / Cash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your order!
Please keep this invoice for your records.

Generated: ${new Date().toLocaleString()}
Powered by Restaurant Billing System
    `;

    // Create blob and download
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transaction.invoiceNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function clearAllData() {
    if (!confirm('This will clear ALL demo data (menu items, cart, sales history, and current user). Proceed?')) return;

    try {
        // Remove specific keys used by the app so other localStorage entries are preserved
        localStorage.removeItem('menuItems');
        localStorage.removeItem('cart');
        localStorage.removeItem('salesData');
        localStorage.removeItem('currentUser');

        // Optionally remove other keys if present
        // localStorage.clear(); // <-- avoid clearing everything

        alert('All demo data cleared. The app will reload now.');
        // Reload page to reflect cleared state
        window.location.reload();
    } catch (err) {
        console.error('Error clearing data:', err);
        alert('Failed to clear data. See console for details.');
    }
}

function clearPagesMenu() {
    if (!confirm('This will clear ALL data (menu items, cart, sales history, user account) and redirect to login. Start over?')) return;

    try {
        // Remove ALL app-related keys
        localStorage.removeItem('menuItems');
        localStorage.removeItem('cart');
        localStorage.removeItem('salesData');
        localStorage.removeItem('currentUser');

        console.log('Pages Menu cleared completely. Redirecting to login...');
        // Redirect to login page for fresh start
        window.location.href = 'pages/login.html';
    } catch (err) {
        console.error('Error clearing Pages Menu:', err);
        alert('Failed to clear Pages Menu. See console for details.');
    }
}

// Logout: clear only currentUser (keep demo data) and go to login
function logout() {
    if (!confirm('Logout and return to login page?')) return;
    try {
        localStorage.removeItem('currentUser');
        // Redirect to login page with absolute path from root
        const basePath = window.location.pathname.includes('/src/') ? '../' : '';
        window.location.href = basePath + 'pages/login.html';
    } catch (err) {
        console.error('Error during logout:', err);
        // Fallback redirect to root
        window.location.href = '/pages/login.html';
    }
}

function handleNavigation(e) {
    e.preventDefault();
    const page = this.getAttribute('data-page');
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    this.classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        menu: 'Menu',
        billing: 'Billing',
        graphs: 'Analytics Graphs',
        reports: 'Sales Reports',
        'manage-menu': 'Manage Menu',
        'manage-expenses': 'Manage Expenses'
    };
    document.getElementById('page-title').textContent = titles[page];

    // Show page content
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');

    // Load page-specific content
    if (page === 'menu') {
        displayMenuItems();
    } else if (page === 'billing') {
        displayCart();
    } else if (page === 'graphs') {
        initializeGraphs();
    } else if (page === 'manage-menu') {
        displayManageMenu();
    } else if (page === 'manage-expenses') {
        displayManageExpenses();
    } else if (page === 'dashboard') {
        updateDashboard();
    }
}

function loadMenuItems() {
    const stored = localStorage.getItem('menuItems');
    if (stored) {
        menuItems = JSON.parse(stored);
    } else {
        menuItems = [...DEFAULT_MENU_ITEMS];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
}

function displayMenuItems() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    menuItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-image" onerror="this.src='https://via.placeholder.com/200'">
            <div class="menu-item-content">
                <h3 class="menu-item-name">${item.name}</h3>
                <p class="menu-item-price">₹${item.price.toFixed(2)}</p>
                <div class="menu-item-actions">
                    <button class="btn btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function addToCart(itemId) {
    const item = menuItems.find(m => m.id === itemId);
    const existingItem = cart.find(c => c.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    saveCart();
    updateBillSummary();
    alert(`${item.name} added to cart!`);
}

function displayCart() {
    const container = document.getElementById('cart-container');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Cart is empty</p>';
        updateBillSummary();
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-qty">
                <button onclick="updateQty(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        container.appendChild(cartItem);
    });

    updateBillSummary();
}

function updateQty(itemId, change) {
    const item = cart.find(c => c.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            displayCart();
        }
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveCart();
    displayCart();
}

function updateBillSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '₹0.00';
    document.getElementById('bill-total').textContent = '₹' + total.toFixed(2);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const stored = localStorage.getItem('cart');
    if (stored) {
        cart = JSON.parse(stored);
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        saveCart();
        displayCart();
        alert('Cart cleared!');
    }
}

function showQRCode() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (total === 0) {
        alert('Cart is empty!');
        return;
    }

    // Save transaction first
    const transaction = saveTransaction(total);

    // Generate QR code (using a simple QR code API)
    const qrCodeElement = document.getElementById('qr-code-display');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=UPI://pay?pa=merchant@upi&pn=Restaurant&am=${total}`;
    
    qrCodeElement.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 100%; max-width: 300px;">`;
    document.getElementById('qr-amount').textContent = `Amount to Pay: ₹${total.toFixed(2)} | Invoice #${transaction.invoiceNo}`;
    
    document.getElementById('qr-modal').classList.add('active');

    // Auto download invoice as text file
    downloadInvoiceAsText(transaction);
}

function printBill() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;

    // Save transaction and get invoice details
    const transaction = saveTransaction(total);

    let billHTML = `
        <html>
            <head>
                <title>Invoice ${transaction.invoiceNo}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .bill-container { max-width: 500px; margin: auto; background: white; border: 2px solid #1abc9c; padding: 30px; border-radius: 8px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1abc9c; padding-bottom: 15px; }
                    .header h1 { margin: 0; color: #1abc9c; font-size: 28px; }
                    .header p { margin: 5px 0; color: #666; }
                    .invoice-info { display: flex; justify-content: space-between; margin: 20px 0; font-size: 13px; }
                    .invoice-info div { flex: 1; }
                    .invoice-info .label { font-weight: bold; color: #333; }
                    .invoice-info .value { color: #666; }
                    table { width: 100%; margin: 20px 0; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background: #1abc9c; color: white; font-weight: bold; }
                    td { font-size: 14px; }
                    .item-name { font-weight: 500; }
                    .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #1abc9c; }
                    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #1abc9c; margin: 10px 0; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
                    .thank-you { text-align: center; color: #1abc9c; font-weight: bold; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="bill-container">
                    <div class="header">
                        <h1>🍽️ RESTAURANT INVOICE</h1>
                        <p>Professional Billing System</p>
                    </div>

                    <div class="invoice-info">
                        <div>
                            <div class="label">Invoice #:</div>
                            <div class="value">${transaction.invoiceNo}</div>
                        </div>
                        <div>
                            <div class="label">Date:</div>
                            <div class="value">${transaction.dateFormatted}</div>
                        </div>
                        <div>
                            <div class="label">Time:</div>
                            <div class="value">${transaction.timeFormatted}</div>
                        </div>
                    </div>

                    <div class="invoice-info">
                        <div>
                            <div class="label">Customer:</div>
                            <div class="value">${transaction.customerName}</div>
                        </div>
                    </div>

                    <table>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
    `;

    cart.forEach(item => {
        billHTML += `
                        <tr>
                            <td class="item-name">${item.name}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                            <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
        `;
    });

    billHTML += `
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Total Amount:</span>
                            <span>₹${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="thank-you">Thank you for your order!</div>
                    <div class="footer">
                        <p>Invoice generated on ${new Date().toLocaleString()}</p>
                        <p>Please keep this invoice for your records</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();

    // Download invoice as text file
    downloadInvoiceAsText(transaction);

    // Clear cart after printing
    cart = [];
    saveCart();
    displayCart();
    updateDashboard();
    
    alert('Invoice saved and printed! Invoice #' + transaction.invoiceNo);
}

function updateDashboard() {
    const today = new Date().toDateString();
    const todaySales = salesData.filter(s => new Date(s.date).toDateString() === today);
    const monthSales = salesData.filter(s => {
        const saleDate = new Date(s.date);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });

    // Calculate real user data for KPIs
    const dailySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
    const monthlySalesTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate real monthly expenses from user's expense records
    const monthlyExpensesData = expenses.filter(e => {
        const expDate = new Date(e.date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
    const monthlyExpenses = monthlyExpensesData.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const profit = monthlySalesTotal - monthlyExpenses;

    document.getElementById('daily-sales').textContent = dailySalesTotal.toFixed(2);
    document.getElementById('monthly-sales').textContent = monthlySalesTotal.toFixed(2);
    document.getElementById('expenses').textContent = monthlyExpenses.toFixed(2);
    document.getElementById('profit').textContent = profit.toFixed(2);

    // Outstanding values (calculated from user's sales)
    document.getElementById('total-receivables').textContent = (monthlySalesTotal * 0.2).toFixed(2);
    document.getElementById('overdue').textContent = (monthlySalesTotal * 0.05).toFixed(2);
    document.getElementById('current').textContent = (monthlySalesTotal * 0.15).toFixed(2);
    document.getElementById('total-payables').textContent = (monthlyExpenses * 0.6).toFixed(2);
    document.getElementById('payables-overdue').textContent = (monthlyExpenses * 0.2).toFixed(2);
    document.getElementById('payables-current').textContent = (monthlyExpenses * 0.4).toFixed(2);

    // Initialize charts with real data
    initializeDashboardCharts();
}

function initializeDashboardCharts() {
    // Build real data from user's sales
    // Daily Sales Trend (last 7 days)
    const dailyData = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        dailyData[dateStr] = 0;
    }
    salesData.forEach(s => {
        const saleDate = new Date(s.date);
        const dateStr = saleDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dateStr in dailyData) {
            dailyData[dateStr] += s.total;
        }
    });

    // Sales by Items
    const itemsSales = {};
    salesData.forEach(s => {
        s.items?.forEach(item => {
            if (!itemsSales[item.name]) itemsSales[item.name] = 0;
            itemsSales[item.name] += item.price * item.quantity;
        });
    });

    // Monthly Sales (all 12 months)
    const monthlySales = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlySales[m] = 0);
    salesData.forEach(s => {
        const month = months[new Date(s.date).getMonth()];
        monthlySales[month] += s.total;
    });

    // Distribution (by time of day - simplified)
    const distribution = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    salesData.forEach(s => {
        const hour = new Date(s.date).getHours();
        if (hour < 12) distribution.Morning += s.total;
        else if (hour < 17) distribution.Afternoon += s.total;
        else if (hour < 21) distribution.Evening += s.total;
        else distribution.Night += s.total;
    });

    // Chart.js configuration
    const ctx1 = document.getElementById('dailySalesChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: Object.keys(dailyData),
                datasets: [{
                    label: 'Sales (₹)',
                    data: Object.values(dailyData),
                    backgroundColor: '#1abc9c',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    const ctx2 = document.getElementById('itemsSalesChart');
    if (ctx2) {
        const itemNames = Object.keys(itemsSales).slice(0, 6);
        const itemValues = itemNames.map(name => itemsSales[name]);
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: itemNames.length > 0 ? itemNames : ['No Data'],
                datasets: [{
                    data: itemValues.length > 0 ? itemValues : [1],
                    backgroundColor: ['#1abc9c', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#34495e']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    const ctx3 = document.getElementById('monthlySalesChart');
    if (ctx3) {
        new Chart(ctx3, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Sales (₹)',
                    data: months.map(m => monthlySales[m]),
                    borderColor: '#1abc9c',
                    backgroundColor: 'rgba(26, 188, 156, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        });
    }

    const ctx4 = document.getElementById('distributionChart');
    if (ctx4) {
        new Chart(ctx4, {
            type: 'pie',
            data: {
                labels: Object.keys(distribution),
                datasets: [{
                    data: Object.values(distribution),
                    backgroundColor: ['#f39c12', '#3498db', '#e74c3c', '#9b59b6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function initializeGraphs() {
    // Build real item sales data from user's sales
    const itemsSalesData = {};
    salesData.forEach(s => {
        s.items?.forEach(item => {
            if (!itemsSalesData[item.name]) {
                itemsSalesData[item.name] = { sales: 0, count: 0 };
            }
            itemsSalesData[item.name].sales += item.price * item.quantity;
            itemsSalesData[item.name].count += item.quantity;
        });
    });

    const itemNames = Object.keys(itemsSalesData).slice(0, 6);
    const itemSales = itemNames.map(name => itemsSalesData[name].sales);
    const itemCounts = itemNames.map(name => itemsSalesData[name].count);

    // Weekly sales
    const weeklyData = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    const weeklyCounts = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    salesData.forEach(s => {
        const saleDate = new Date(s.date);
        const dayOfMonth = saleDate.getDate();
        let week = 'Week 1';
        if (dayOfMonth > 7 && dayOfMonth <= 14) week = 'Week 2';
        else if (dayOfMonth > 14 && dayOfMonth <= 21) week = 'Week 3';
        else if (dayOfMonth > 21) week = 'Week 4';
        
        weeklyData[week] += s.total;
        s.items?.forEach(item => {
            weeklyCounts[week] += item.quantity;
        });
    });

    const ctx1 = document.getElementById('graphDaily');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: itemNames.length > 0 ? itemNames : ['No Data'],
                datasets: [
                    {
                        label: 'Sales (₹)',
                        data: itemSales.length > 0 ? itemSales : [0],
                        backgroundColor: '#1abc9c',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Items Sold',
                        data: itemCounts.length > 0 ? itemCounts : [0],
                        backgroundColor: 'rgba(52, 152, 219, 0.5)',
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true },
                    y1: { beginAtZero: true, position: 'right' }
                }
            }
        });
    }

    const ctx2 = document.getElementById('graphMonthly');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: Object.keys(weeklyData),
                datasets: [
                    {
                        label: 'Sales (₹)',
                        data: Object.values(weeklyData),
                        backgroundColor: '#3498db',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Items Sold',
                        data: Object.values(weeklyCounts),
                        backgroundColor: 'rgba(230, 126, 34, 0.5)',
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true },
                    y1: { beginAtZero: true, position: 'right' }
                }
            }
        });
    }
}

function generateReport(e) {
    const reportType = e.target.getAttribute('data-report');
    document.querySelectorAll('.report-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    let reportHTML = '';
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    let filteredSales = salesData;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredSales = salesData.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= start && saleDate <= end;
        });
    }

    switch(reportType) {
        case 'daily':
            reportHTML = generateDailyReport(filteredSales);
            break;
        case 'monthly':
            reportHTML = generateMonthlyReport(filteredSales);
            break;
        case 'yearly':
            reportHTML = generateYearlyReport(filteredSales);
            break;
        case 'profit':
            reportHTML = generateProfitReport(filteredSales);
            break;
        case 'loss':
            reportHTML = generateLossReport(filteredSales);
            break;
        case 'expenses':
            reportHTML = generateExpensesReport(filteredSales);
            break;
    }

    document.getElementById('report-content').innerHTML = reportHTML;
}

function generateDailyReport(sales) {
    const daily = {};
    sales.forEach(s => {
        const date = new Date(s.date).toDateString();
        if (!daily[date]) {
            daily[date] = { total: 0, count: 0 };
        }
        daily[date].total += s.total;
        daily[date].count += 1;
    });

    let html = '<table class="report-table"><tr><th>Date</th><th>Total Sales</th><th>Orders</th></tr>';
    for (const date in daily) {
        html += `<tr><td>${date}</td><td>₹${daily[date].total.toFixed(2)}</td><td>${daily[date].count}</td></tr>`;
    }
    html += '</table>';
    return html;
}

function generateMonthlyReport(sales) {
    const monthly = {};
    sales.forEach(s => {
        const date = new Date(s.date);
        const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!monthly[month]) {
            monthly[month] = { total: 0, count: 0 };
        }
        monthly[month].total += s.total;
        monthly[month].count += 1;
    });

    let html = '<table class="report-table"><tr><th>Month</th><th>Total Sales</th><th>Orders</th></tr>';
    for (const month in monthly) {
        html += `<tr><td>${month}</td><td>₹${monthly[month].total.toFixed(2)}</td><td>${monthly[month].count}</td></tr>`;
    }
    html += '</table>';
    return html;
}

function generateYearlyReport(sales) {
    const yearly = {};
    sales.forEach(s => {
        const year = new Date(s.date).getFullYear();
        if (!yearly[year]) {
            yearly[year] = { total: 0, count: 0 };
        }
        yearly[year].total += s.total;
        yearly[year].count += 1;
    });

    let html = '<table class="report-table"><tr><th>Year</th><th>Total Sales</th><th>Orders</th></tr>';
    for (const year in yearly) {
        html += `<tr><td>${year}</td><td>₹${yearly[year].total.toFixed(2)}</td><td>${yearly[year].count}</td></tr>`;
    }
    html += '</table>';
    return html;
}

function generateProfitReport(sales) {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate real expenses from the same period
    let reportExpenses = 0;
    if (sales.length > 0) {
        const salesDates = sales.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...salesDates));
        const maxDate = new Date(Math.max(...salesDates));
        
        reportExpenses = expenses.reduce((sum, e) => {
            const expDate = new Date(e.date);
            if (expDate >= minDate && expDate <= maxDate) {
                return sum + parseFloat(e.amount || 0);
            }
            return sum;
        }, 0);
    }
    
    const profit = totalSales - reportExpenses;

    return `<table class="report-table">
        <tr><th>Metric</th><th>Amount</th></tr>
        <tr><td>Total Sales</td><td>₹${totalSales.toFixed(2)}</td></tr>
        <tr><td>Expenses</td><td>₹${reportExpenses.toFixed(2)}</td></tr>
        <tr><td style="font-weight: bold; color: green;">Profit</td><td style="font-weight: bold; color: green;">₹${profit.toFixed(2)}</td></tr>
    </table>`;
}

function generateLossReport(sales) {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    
    // Calculate real expenses from the same period
    let reportExpenses = 0;
    if (sales.length > 0) {
        const salesDates = sales.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...salesDates));
        const maxDate = new Date(Math.max(...salesDates));
        
        reportExpenses = expenses.reduce((sum, e) => {
            const expDate = new Date(e.date);
            if (expDate >= minDate && expDate <= maxDate) {
                return sum + parseFloat(e.amount || 0);
            }
            return sum;
        }, 0);
    }
    
    const loss = Math.max(0, reportExpenses - totalSales);

    return `<table class="report-table">
        <tr><th>Metric</th><th>Amount</th></tr>
        <tr><td>Total Sales</td><td>₹${totalSales.toFixed(2)}</td></tr>
        <tr><td>Expenses</td><td>₹${reportExpenses.toFixed(2)}</td></tr>
        <tr><td style="font-weight: bold; color: ${loss > 0 ? 'red' : 'green'};">Loss</td><td style="font-weight: bold; color: ${loss > 0 ? 'red' : 'green'};">₹${loss.toFixed(2)}</td></tr>
    </table>`;
}

function generateExpensesReport(sales) {
    // Get expenses from the same date range as filtered sales
    let reportExpenses = [];
    
    if (sales.length > 0) {
        const salesDates = sales.map(s => new Date(s.date));
        const minDate = new Date(Math.min(...salesDates));
        const maxDate = new Date(Math.max(...salesDates));
        
        reportExpenses = expenses.filter(e => {
            const expDate = new Date(e.date);
            return expDate >= minDate && expDate <= maxDate;
        });
    } else {
        // If no sales filtered, show all expenses
        reportExpenses = expenses;
    }

    const totalExpenses = reportExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    let html = '<table class="report-table"><tr><th>Expense Type</th><th>Date</th><th>Amount</th><th>Notes</th></tr>';
    if (reportExpenses.length === 0) {
        html += '<tr><td colspan="4" style="text-align: center;">No expenses recorded</td></tr>';
    } else {
        reportExpenses.forEach(exp => {
            const expDate = new Date(exp.date).toLocaleDateString();
            html += `<tr><td>${exp.type}</td><td>${expDate}</td><td>₹${parseFloat(exp.amount).toFixed(2)}</td><td>${exp.notes || '-'}</td></tr>`;
        });
    }
    html += `<tr style="font-weight: bold;"><td colspan="2">Total Expenses:</td><td>₹${totalExpenses.toFixed(2)}</td><td></td></tr>`;
    html += '</table>';
    
    return html;
}

function filterReports() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate) {
        alert(`Filtering reports from ${startDate} to ${endDate}`);
    } else {
        alert('Please select both start and end dates');
    }
}

function downloadPDF() {
    const element = document.getElementById('report-content');
    if (!element.innerHTML.trim()) {
        alert('Please generate a report first');
        return;
    }

    const opt = {
        margin: 10,
        filename: 'report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}

function downloadExcel() {
    const table = document.querySelector('.report-table');
    if (!table) {
        alert('Please generate a report first');
        return;
    }

    let csv = [];
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        let csvRow = [];
        row.querySelectorAll('th, td').forEach(cell => {
            csvRow.push(cell.textContent);
        });
        csv.push(csvRow.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
}

function displayManageMenu() {
    const container = document.getElementById('manage-menu-container');
    container.innerHTML = '';

    menuItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-management-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200'">
            <h4>${item.name}</h4>
            <p>₹${item.price.toFixed(2)}</p>
            <button class="btn btn-secondary" onclick="editMenuItem(${item.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
        `;
        container.appendChild(card);
    });
}

function openAddMenuModal() {
    document.getElementById('modal-title').textContent = 'Add Menu Item';
    document.getElementById('menu-form').reset();
    document.getElementById('menu-modal').classList.add('active');
}

function editMenuItem(itemId) {
    const item = menuItems.find(m => m.id === itemId);
    if (item) {
        document.getElementById('modal-title').textContent = 'Edit Menu Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-image').value = item.image;
        document.getElementById('menu-form').dataset.itemId = itemId;
        document.getElementById('menu-modal').classList.add('active');
    }
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems = menuItems.filter(m => m.id !== itemId);
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        displayManageMenu();
        alert('Item deleted successfully!');
    }
}

function saveMenuItem(e) {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value;
    const itemId = document.getElementById('menu-form').dataset.itemId;

    if (itemId) {
        // Edit existing
        const item = menuItems.find(m => m.id == itemId);
        if (item) {
			// Preserve old values when fields are left unchanged/empty
			item.name = (name && name.trim()) ? name : item.name;
			item.price = isNaN(price) ? item.price : price;
			item.image = (image && image.trim()) ? image : item.image;
        }
    } else {
        // Add new
        const newItem = {
            id: Date.now(),
            name: name,
            price: price,
            image: image
        };
        menuItems.push(newItem);
    }

    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    document.getElementById('menu-modal').classList.remove('active');
    document.getElementById('menu-form').dataset.itemId = '';
    displayManageMenu();
    alert('Item saved successfully!');
}

function saveSalesData() {
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

function loadSalesData() {
    const stored = localStorage.getItem('salesData');
    if (stored) {
        salesData = JSON.parse(stored);
    }
}

function updateDate() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('user-name').textContent = user.name || user.email || 'User';
        document.getElementById('welcome-name').textContent = user.name || user.email || 'User';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});