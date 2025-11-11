const menuItems = [
    { id: 1, name: "Idly", price: 30, image: "images/idly.jpg" },
    { id: 2, name: "Puttu", price: 40, image: "images/puttu.jpg" },
    { id: 3, name: "Poori", price: 25, image: "images/poori.jpg" },
    { id: 4, name: "Coffee", price: 15, image: "images/coffee.jpg" },
    { id: 5, name: "Dosai", price: 35, image: "images/dosai.jpg" },
    { id: 6, name: "Vada Pazhampori", price: 20, image: "images/vada_pazhampori.jpg" }
];

function displayMenu() {
    const menuContainer = document.getElementById("menu-container");
    menuContainer.innerHTML = "";

    menuItems.forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.className = "menu-item";
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Price: ₹${item.price}</p>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
            <button onclick="editMenuItem(${item.id})">Edit</button>
            <button onclick="deleteMenuItem(${item.id})">Delete</button>
        `;
        menuContainer.appendChild(menuItem);
    });
}

function addMenuItem(name, price, image) {
    const newItem = {
        id: menuItems.length + 1,
        name: name,
        price: price,
        image: image
    };
    menuItems.push(newItem);
    displayMenu();
}

function editMenuItem(id) {
    const item = menuItems.find(item => item.id === id);
    if (item) {
        const newName = prompt("Enter new name:", item.name);
        const newPrice = prompt("Enter new price:", item.price);
        const newImage = prompt("Enter new image URL:", item.image);
        
        item.name = newName;
        item.price = parseFloat(newPrice);
        item.image = newImage;
        displayMenu();
    }
}

function deleteMenuItem(id) {
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
        menuItems.splice(index, 1);
        displayMenu();
    }
}

function addToCart(id) {
    // Functionality to add item to cart
    console.log(`Item with id ${id} added to cart.`);
}

// Initial display of menu items
displayMenu();