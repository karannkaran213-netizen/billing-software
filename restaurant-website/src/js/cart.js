// cart.js

let cart = [];

function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
}

function clearCart() {
    cart = [];
    updateCartDisplay();
}

function calculateTotal() {
    return cart.reduce((total, item) => total + item.price, 0);
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        cartContainer.appendChild(itemElement);
    });
    const totalElement = document.getElementById('total');
    totalElement.textContent = `Total: $${calculateTotal().toFixed(2)}`;
}

function getCartItems() {
    return cart;
}

function checkout() {
    // Implement checkout logic here
    alert('Proceeding to checkout');
}

document.getElementById('clear-cart').addEventListener('click', clearCart);

// Export functions for use in other modules
export { addToCart, clearCart, calculateTotal, getCartItems, checkout };