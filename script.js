/* ========================================
   SMARTSTOCK - FIREBASE VERSION
======================================== */

/* FIREBASE CONFIGURATION */

const firebaseConfig = {
    apiKey: "AIzaSyAquHDhMS8w9vqqK5oq9vLNyjpiKokXE3s",
    authDomain: "smartstock-560ad.firebaseapp.com",
    databaseURL: "https://smartstock-560ad-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartstock-560ad",
    storageBucket: "smartstock-560ad.firebasestorage.app",
    messagingSenderId: "73130734334",
    appId: "1:73130734334:web:9b1bcdf8e2c0f2d9952baf"
};

/* INITIALIZE FIREBASE */

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

/* GLOBAL VARIABLES */

let products = [];
let totalSales = 0;
let salesHistory = [];

let currentUser = null;
let currentUsername = "";

/* DATABASE PATHS */

function userDatabasePath(path) {
    if (!currentUser) {
        throw new Error("Please login first.");
    }

    return database.ref(
        "users/" + currentUser.uid + "/" + path
    );
}

/* USERNAME TO INTERNAL EMAIL
   Username is used in the existing UI.
   Firebase Authentication requires an email.
*/

function usernameToEmail(username) {
    return username.trim().toLowerCase()
        + "@smartstock-560ad.firebaseapp.com";
}

/* PAGE LOAD */

window.addEventListener("load", function () {

    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("signupPage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

});

/* ========================================
   AUTHENTICATION
======================================== */

/* LOGIN */

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const error = document.getElementById("error");

    error.innerText = "";

    if (!username || !password) {
        error.innerText = "Please enter username and password!";
        return;
    }

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
        error.innerText =
            "Username must be 3-30 characters using letters, numbers, dots, _ or -.";
        return;
    }

    try {

        await auth.signInWithEmailAndPassword(
            usernameToEmail(username),
            password
        );

    } catch (err) {

        console.error("Login error:", err);

        if (
            err.code === "auth/invalid-credential" ||
            err.code === "auth/user-not-found" ||
            err.code === "auth/wrong-password"
        ) {
            error.innerText = "Invalid username or password!";
        } else if (err.code === "auth/too-many-requests") {
            error.innerText =
                "Too many attempts. Please try again later.";
        } else {
            error.innerText =
                "Login failed. Please check your Firebase setup.";
        }

    }
}

/* SIGN UP PAGE */

function showSignup() {

    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("signupPage").style.display = "flex";

}

function showLogin() {

    document.getElementById("signupPage").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

}

/* CREATE ACCOUNT */

async function signup() {

    const username =
        document.getElementById("newUsername").value.trim();

    const password =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const error =
        document.getElementById("signupError");

    error.innerText = "";

    if (!username || !password || !confirmPassword) {
        error.innerText = "Please fill all details!";
        return;
    }

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
        error.innerText =
            "Username must be 3-30 characters using letters, numbers, dots, _ or -.";
        return;
    }

    if (password.length < 6) {
        error.innerText =
            "Password must contain at least 6 characters!";
        return;
    }

    if (password !== confirmPassword) {
        error.innerText = "Passwords do not match!";
        return;
    }

    try {

        const credential =
            await auth.createUserWithEmailAndPassword(
                usernameToEmail(username),
                password
            );

        const user = credential.user;

        await database.ref("users/" + user.uid + "/profile")
            .set({
                username: username,
                createdAt: Date.now()
            });

        alert("Account created successfully!");

    } catch (err) {

        console.error("Signup error:", err);

        if (err.code === "auth/email-already-in-use") {
            error.innerText =
                "This username is already registered!";
        } else if (err.code === "auth/weak-password") {
            error.innerText =
                "Please choose a stronger password!";
        } else {
            error.innerText =
                "Account creation failed. Check Firebase settings.";
        }

    }

}

/* LOGOUT */

async function logout() {

    try {

        await auth.signOut();

    } catch (err) {

        console.error("Logout error:", err);
        alert("Logout failed. Please try again.");

    }

}

/* ========================================
   AUTH STATE AND DATA LOADING
======================================== */

auth.onAuthStateChanged(async function (user) {

    if (!user) {

        currentUser = null;
        currentUsername = "";

        products = [];
        totalSales = 0;
        salesHistory = [];

        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById("signupPage").style.display = "none";
        document.getElementById("loginPage").style.display = "flex";

        return;
    }

    currentUser = user;

    try {

        const profileSnapshot =
            await userDatabasePath("profile").once("value");

        const profile = profileSnapshot.val() || {};

        currentUsername =
            profile.username || user.email.split("@")[0];

        await loadUserData();

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("signupPage").style.display = "none";
        document.getElementById("dashboardPage").style.display = "block";

        showDashboard();

    } catch (err) {

        console.error("Loading data error:", err);

        alert(
            "Could not load your data. Check your Database Rules and internet connection."
        );

    }

});

/* LOAD CURRENT USER DATA */

async function loadUserData() {

    const results = await Promise.all([

        userDatabasePath("products").once("value"),
        userDatabasePath("totalSales").once("value"),
        userDatabasePath("salesHistory").once("value")

    ]);

    const productData = results[0].val();
    const salesData = results[1].val();
    const historyData = results[2].val();

    products = productData
        ? Object.keys(productData).map(function (key) {
            return {
                id: key,
                ...productData[key]
            };
        })
        : [];

    totalSales = Number(salesData) || 0;

    salesHistory = historyData
        ? Object.keys(historyData).map(function (key) {
            return {
                id: key,
                ...historyData[key]
            };
        })
        : [];

    updateProductTable();
    updateStockTable();
    updateDashboard();
    updateSalesHistory();

}

/* ========================================
   NAVIGATION
======================================== */

function hideAll() {

    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("productsSection").classList.add("hidden");
    document.getElementById("stockSection").classList.add("hidden");
    document.getElementById("billingSection").classList.add("hidden");
    document.getElementById("reportsSection").classList.add("hidden");

}

function showDashboard() {

    hideAll();

    document.getElementById("dashboardSection")
        .classList.remove("hidden");

    updateDashboard();

}

function showProducts() {

    hideAll();

    document.getElementById("productsSection")
        .classList.remove("hidden");

    updateProductTable();

}

function showStock() {

    hideAll();

    document.getElementById("stockSection")
        .classList.remove("hidden");

    updateStockTable();

}

function showBilling() {

    hideAll();

    document.getElementById("billingSection")
        .classList.remove("hidden");

}

function showReports() {

    hideAll();

    document.getElementById("reportsSection")
        .classList.remove("hidden");

    document.getElementById("salesReport").innerText =
        "Rs. " + totalSales;

    updateSalesHistory();

}

/* ========================================
   SAVE DATA TO FIREBASE
======================================== */

/* SAVE PRODUCTS */

async function saveProducts() {

    const productData = {};

    products.forEach(function (product) {

        productData[product.id] = {
            name: product.name,
            price: product.price,
            quantity: product.quantity
        };

    });

    await userDatabasePath("products").set(productData);

}

/* SAVE SALES TOTAL */

async function saveTotalSales() {

    await userDatabasePath("totalSales").set(totalSales);

}

/* SAVE SALES HISTORY */

async function saveSalesHistory() {

    const historyData = {};

    salesHistory.forEach(function (sale) {

        historyData[sale.id] = {
            date: sale.date,
            customer: sale.customer,
            product: sale.product,
            quantity: sale.quantity,
            total: sale.total
        };

    });

    await userDatabasePath("salesHistory").set(historyData);

}

/* ========================================
   PRODUCT MANAGEMENT
======================================== */

/* ADD PRODUCT */

async function addProduct() {

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const quantity =
        Number(document.getElementById("productQuantity").value);

    if (
        name === "" ||
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price <= 0 ||
        quantity <= 0
    ) {
        alert("Please enter valid product details.");
        return;
    }

    const product = {
        id: database.ref().push().key,
        name: name,
        price: price,
        quantity: quantity
    };

    products.push(product);

    try {

        await saveProducts();

        updateProductTable();
        updateStockTable();
        updateDashboard();

        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productQuantity").value = "";

        alert("Product added successfully!");

    } catch (err) {

        console.error(err);

        products = products.filter(function (item) {
            return item.id !== product.id;
        });

        alert("Could not save product. Check Database Rules.");

    }

}

/* PRODUCT TABLE */

function updateProductTable(productList = products) {

    const table = document.getElementById("productTable");

    table.innerHTML = "";

    productList.forEach(function (product) {

        const index = products.findIndex(function (item) {
            return item.id === product.id;
        });

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const priceCell = document.createElement("td");
        priceCell.textContent = "Rs. " + product.price;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = product.quantity;

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = function () {
            editProduct(index);
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            deleteProduct(index);
        };

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(document.createTextNode(" "));

        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(quantityCell);
        row.appendChild(actionsCell);

        table.appendChild(row);

    });

}

/* EDIT PRODUCT */

async function editProduct(index) {

    if (!currentUser || !products[index]) {
        return;
    }

    const product = products[index];

    const newName =
        prompt("Product Name:", product.name);

    if (newName === null || newName.trim() === "") {
        return;
    }

    const newPrice =
        Number(prompt("Product Price:", product.price));

    if (!Number.isFinite(newPrice) || newPrice <= 0) {
        alert("Invalid price!");
        return;
    }

    const newQuantity =
        Number(prompt("Product Quantity:", product.quantity));

    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
        alert("Invalid quantity!");
        return;
    }

    const oldProduct = { ...product };

    products[index] = {
        ...product,
        name: newName.trim(),
        price: newPrice,
        quantity: newQuantity
    };

    try {

        await saveProducts();

        updateProductTable();
        updateStockTable();
        updateDashboard();

        alert("Product updated successfully!");

    } catch (err) {

        products[index] = oldProduct;

        updateProductTable();

        console.error(err);

        alert("Product update failed. Check Database Rules.");

    }

}

/* DELETE PRODUCT */

async function deleteProduct(index) {

    if (!currentUser || !products[index]) {
        return;
    }

    const product = products[index];

    const result =
        confirm("Delete " + product.name + "?");

    if (!result) {
        return;
    }

    products.splice(index, 1);

    try {

        await saveProducts();

        updateProductTable();
        updateStockTable();
        updateDashboard();

        alert("Product deleted successfully!");

    } catch (err) {

        products.splice(index, 0, product);

        updateProductTable();

        console.error(err);

        alert("Delete failed. Check Database Rules.");

    }

}

/* SEARCH PRODUCT */

function searchProducts() {

    const search =
        document.getElementById("searchProduct")
            .value.toLowerCase();

    const filteredProducts =
        products.filter(function (product) {

            return product.name.toLowerCase().includes(search);

        });

    updateProductTable(filteredProducts);

}

/* ========================================
   STOCK MANAGEMENT
======================================== */

function updateStockTable() {

    const table = document.getElementById("stockTable");

    table.innerHTML = "";

    products.forEach(function (product) {

        let status = "In Stock";

        if (product.quantity === 0) {
            status = "Out of Stock";
        } else if (product.quantity <= 5) {
            status = "Low Stock";
        }

        const row = document.createElement("tr");

        [
            product.name,
            "Rs. " + product.price,
            product.quantity,
            status
        ].forEach(function (value) {

            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}

/* ========================================
   DASHBOARD
======================================== */

function updateDashboard() {

    let totalStock = 0;
    let lowStock = 0;

    products.forEach(function (product) {

        totalStock += Number(product.quantity) || 0;

        if (product.quantity <= 5) {
            lowStock++;
        }

    });

    document.getElementById("totalProducts").innerText =
        products.length;

    document.getElementById("totalStock").innerText =
        totalStock;

    document.getElementById("lowStock").innerText =
        lowStock;

    document.getElementById("todaySales").innerText =
        "Rs. " + totalSales;

}

/* ========================================
   BILLING
======================================== */

async function createBill() {

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const customerName =
        document.getElementById("customerName").value.trim();

    const productName =
        document.getElementById("billProduct").value.trim();

    const quantity =
        Number(document.getElementById("billQuantity").value);

    if (
        customerName === "" ||
        productName === "" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        alert("Please enter all billing details.");
        return;
    }

    const index = products.findIndex(function (item) {

        return item.name.toLowerCase() ===
            productName.toLowerCase();

    });

    if (index === -1) {
        alert("Product not found!");
        return;
    }

    const product = products[index];

    if (quantity > product.quantity) {
        alert("Not enough stock available!");
        return;
    }

    const oldQuantity = product.quantity;
    const oldTotalSales = totalSales;

    product.quantity -= quantity;

    const total = product.price * quantity;

    totalSales += total;

    const dateTime = new Date().toLocaleString();

    const sale = {
        id: database.ref().push().key,
        date: dateTime,
        customer: customerName,
        product: product.name,
        quantity: quantity,
        total: total
    };

    salesHistory.push(sale);

    try {

        await Promise.all([
            saveProducts(),
            saveTotalSales(),
            saveSalesHistory()
        ]);

        document.getElementById("billResult").innerHTML =
            "<h3>SMARTSTOCK INVOICE</h3>" +
            "<hr><br>" +
            "<p><b>Date:</b> " + dateTime + "</p>" +
            "<p><b>Customer:</b> " + escapeHTML(customerName) + "</p>" +
            "<p><b>Product:</b> " + escapeHTML(product.name) + "</p>" +
            "<p><b>Price:</b> Rs. " + product.price + "</p>" +
            "<p><b>Quantity:</b> " + quantity + "</p>" +
            "<h3>Total: Rs. " + total + "</h3>";

        updateProductTable();
        updateStockTable();
        updateDashboard();
        updateSalesHistory();

        document.getElementById("customerName").value = "";
        document.getElementById("billProduct").value = "";
        document.getElementById("billQuantity").value = "";

        alert("Bill created successfully!");

    } catch (err) {

        console.error("Billing save error:", err);

        product.quantity = oldQuantity;
        totalSales = oldTotalSales;

        salesHistory = salesHistory.filter(function (item) {
            return item.id !== sale.id;
        });

        updateProductTable();
        updateStockTable();
        updateDashboard();
        updateSalesHistory();

        alert(
            "Bill could not be saved. Please check your connection and Database Rules."
        );

    }

}

/* ESCAPE HTML */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}

/* ========================================
   SALES HISTORY
======================================== */

function updateSalesHistory() {

    const table = document.getElementById("salesHistory");

    table.innerHTML = "";

    salesHistory.forEach(function (sale) {

        const row = document.createElement("tr");

        [
            sale.date,
            sale.customer,
            sale.product,
            sale.quantity,
            "Rs. " + sale.total
        ].forEach(function (value) {

            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}

/* ========================================
   PRINT INVOICE
======================================== */

function printBill() {

    const bill =
        document.getElementById("billResult").innerHTML;

    if (bill.trim() === "") {
        alert("Please create a bill first!");
        return;
    }

    const printWindow =
        window.open("", "", "width=800,height=600");

    if (!printWindow) {
        alert("Please allow pop-ups to print the invoice.");
        return;
    }

    printWindow.document.write(
        "<html>" +
        "<head>" +
        "<title>SMARTSTOCK Invoice</title>" +
        "<style>" +
        "body{font-family:Arial;padding:40px;}" +
        "h2,h3{text-align:center;}" +
        "p{font-size:18px;}" +
        "</style>" +
        "</head>" +
        "<body>" +
        bill +
        "</body>" +
        "</html>"
    );

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

}
