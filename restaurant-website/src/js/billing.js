// billing.js

let cart = [];
let totalAmount = 0;

function addToCart(item) {
    cart.push(item);
    totalAmount += item.price;
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    totalAmount = 0;
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartDisplay = document.getElementById('cart-display');
    cartDisplay.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - $${item.price}`;
        cartDisplay.appendChild(itemElement);
    });
    document.getElementById('total-amount').textContent = `Total: $${totalAmount}`;
}

function generateBill() {
    const billStatement = document.getElementById('bill-statement');
    billStatement.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - $${item.price}`;
        billStatement.appendChild(itemElement);
    });
    billStatement.appendChild(document.createElement('hr'));
    const totalElement = document.createElement('div');
    totalElement.textContent = `Total: $${totalAmount}`;
    billStatement.appendChild(totalElement);
    displayQRCode();
}

function displayQRCode() {
    const qrCodeContainer = document.getElementById('qr-code');
    qrCodeContainer.innerHTML = ''; // Clear previous QR code
    const qrCode = document.createElement('img');
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?data=Total%20Amount%20$${totalAmount}&size=100x100`;
    qrCodeContainer.appendChild(qrCode);
}

function printBill() {
    const printContent = document.getElementById('bill-statement').innerHTML;
    const newWindow = window.open('', '', 'height=600,width=800');
    newWindow.document.write('<html><head><title>Bill Statement</title>');
    newWindow.document.write('</head><body>');
    newWindow.document.write(printContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
}

document.getElementById('pay-now').addEventListener('click', function() {
    generateBill();
});

document.getElementById('clear-cart').addEventListener('click', function() {
    clearCart();
});