let products = JSON.parse(localStorage.getItem("products")) || [];
let totalSales = Number(localStorage.getItem("totalSales")) || 0;
let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

/* PAGE LOAD */
window.onload = function () {
    updateProductTable();
    updateStockTable();
    updateDashboard();
};


/* LOGIN */
function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const savedUsername =
        localStorage.getItem("smartstockUsername");

    const savedPassword =
        localStorage.getItem("smartstockPassword");

    if (
        (username === "admin" && password === "1234") ||
        (username === savedUsername && password === savedPassword)
    ) {

        document.getElementById("loginPage").style.display = "none";

        document.getElementById("signupPage").style.display = "none";

        document.getElementById("dashboardPage").style.display = "block";

        document.getElementById("error").innerText = "";

        showDashboard();
        updateDashboard();

    } else {

        document.getElementById("error").innerText =
            "Invalid username or password!";

    }
}


/* LOGOUT */
function logout() {

    document.getElementById("dashboardPage").style.display = "none";

    document.getElementById("loginPage").style.display = "flex";

    document.getElementById("username").value = "";

    document.getElementById("password").value = "";

}


/* SIGN UP */
function showSignup() {

    document.getElementById("dashboardPage").style.display = "none";

    document.getElementById("loginPage").style.display = "none";

    document.getElementById("signupPage").style.display = "flex";

}


function showLogin() {

    document.getElementById("signupPage").style.display = "none";

    document.getElementById("loginPage").style.display = "flex";

}


function signup() {

    const username =
        document.getElementById("newUsername").value.trim();

    const password =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (username === "" || password === "") {

        document.getElementById("signupError").innerText =
            "Please fill all details!";

        return;
    }

    if (password !== confirmPassword) {

        document.getElementById("signupError").innerText =
            "Passwords do not match!";

        return;
    }

    localStorage.setItem("smartstockUsername", username);

    localStorage.setItem("smartstockPassword", password);

    alert("Account created successfully!");

    showLogin();

}


/* HIDE ALL SECTIONS */
function hideAll() {

    document.getElementById("dashboardSection")
        .classList.add("hidden");

    document.getElementById("productsSection")
        .classList.add("hidden");

    document.getElementById("stockSection")
        .classList.add("hidden");

    document.getElementById("billingSection")
        .classList.add("hidden");

    document.getElementById("reportsSection")
        .classList.add("hidden");

}


/* SHOW DASHBOARD */
function showDashboard() {

    hideAll();

    document.getElementById("dashboardSection")
        .classList.remove("hidden");

    updateDashboard();

}


/* SHOW PRODUCTS */
function showProducts() {

    hideAll();

    document.getElementById("productsSection")
        .classList.remove("hidden");

    updateProductTable();

}


/* SHOW STOCK */
function showStock() {

    hideAll();

    document.getElementById("stockSection")
        .classList.remove("hidden");

    updateStockTable();

}


/* SHOW BILLING */
function showBilling() {

    hideAll();

    document.getElementById("billingSection")
        .classList.remove("hidden");

}


/* SHOW REPORTS */
function showReports() {

    hideAll();

    document.getElementById("reportsSection")
        .classList.remove("hidden");

    document.getElementById("salesReport").innerText =
        "Rs. " + totalSales;

    updateSalesHistory();

}


/* SAVE PRODUCTS */
function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


/* ADD PRODUCT */
function addProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const quantity =
        Number(document.getElementById("productQuantity").value);

    if (name === "" || price <= 0 || quantity <= 0) {

        alert("Please enter valid product details.");

        return;
    }

    products.push({
        name: name,
        price: price,
        quantity: quantity
    });

    saveProducts();

    updateProductTable();
    updateStockTable();
    updateDashboard();

    document.getElementById("productName").value = "";

    document.getElementById("productPrice").value = "";

    document.getElementById("productQuantity").value = "";

    alert("Product added successfully!");

}


/* PRODUCT TABLE */
function updateProductTable(productList = products) {

    const table =
        document.getElementById("productTable");

    table.innerHTML = "";

    productList.forEach(function (product) {

        const index =
            products.indexOf(product);

        table.innerHTML +=
            "<tr>" +
            "<td>" + product.name + "</td>" +
            "<td>Rs. " + product.price + "</td>" +
            "<td>" + product.quantity + "</td>" +
            "<td>" +
            "<button onclick='editProduct(" + index + ")'>Edit</button> " +
            "<button onclick='deleteProduct(" + index + ")'>Delete</button>" +
            "</td>" +
            "</tr>";

    });

}


/* EDIT PRODUCT */
function editProduct(index) {

    const product = products[index];

    const newName =
        prompt("Product Name:", product.name);

    if (newName === null || newName.trim() === "") {
        return;
    }

    const newPrice =
        Number(prompt("Product Price:", product.price));

    if (newPrice <= 0) {

        alert("Invalid price!");

        return;
    }

    const newQuantity =
        Number(prompt("Product Quantity:", product.quantity));

    if (newQuantity < 0) {

        alert("Invalid quantity!");

        return;
    }

    products[index] = {
        name: newName.trim(),
        price: newPrice,
        quantity: newQuantity
    };

    saveProducts();

    updateProductTable();
    updateStockTable();
    updateDashboard();

    alert("Product updated successfully!");

}


/* DELETE PRODUCT */
function deleteProduct(index) {

    const productName =
        products[index].name;

    const result =
        confirm("Delete " + productName + "?");

    if (result) {

        products.splice(index, 1);

        saveProducts();

        updateProductTable();
        updateStockTable();
        updateDashboard();

        alert("Product deleted successfully!");

    }

}


/* SEARCH PRODUCT */
function searchProducts() {

    const search =
        document.getElementById("searchProduct")
            .value
            .toLowerCase();

    const filteredProducts =
        products.filter(function (product) {

            return product.name
                .toLowerCase()
                .includes(search);

        });

    updateProductTable(filteredProducts);

}


/* STOCK TABLE */
function updateStockTable() {

    const table =
        document.getElementById("stockTable");

    table.innerHTML = "";

    products.forEach(function (product) {

        let status = "In Stock";

        if (product.quantity === 0) {

            status = "Out of Stock";

        } else if (product.quantity <= 5) {

            status = "Low Stock";

        }

        table.innerHTML +=
            "<tr>" +
            "<td>" + product.name + "</td>" +
            "<td>Rs. " + product.price + "</td>" +
            "<td>" + product.quantity + "</td>" +
            "<td>" + status + "</td>" +
            "</tr>";

    });

}


/* UPDATE DASHBOARD */
function updateDashboard() {

    let totalStock = 0;

    let lowStock = 0;

    products.forEach(function (product) {

        totalStock += product.quantity;

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


/* CREATE BILL */
function createBill() {

    const customerName =
        document.getElementById("customerName").value.trim();

    const productName =
        document.getElementById("billProduct").value.trim();

    const quantity =
        Number(document.getElementById("billQuantity").value);

    if (
        customerName === "" ||
        productName === "" ||
        quantity <= 0
    ) {

        alert("Please enter all billing details.");

        return;
    }

    const product =
        products.find(function (item) {

            return item.name.toLowerCase() ===
                productName.toLowerCase();

        });

    if (!product) {

        alert("Product not found!");

        return;
    }

    if (quantity > product.quantity) {

        alert("Not enough stock available!");

        return;
    }

    product.quantity -= quantity;

    const total =
        product.price * quantity;

    totalSales += total;

    const dateTime =
        new Date().toLocaleString();

    salesHistory.push({
        date: dateTime,
        customer: customerName,
        product: product.name,
        quantity: quantity,
        total: total
    });

    saveProducts();

    localStorage.setItem(
        "totalSales",
        totalSales
    );

    localStorage.setItem(
        "salesHistory",
        JSON.stringify(salesHistory)
    );

    document.getElementById("billResult").innerHTML =
        "<h3>SMARTSTOCK INVOICE</h3>" +
        "<hr><br>" +
        "<p><b>Date:</b> " + dateTime + "</p>" +
        "<p><b>Customer:</b> " + customerName + "</p>" +
        "<p><b>Product:</b> " + product.name + "</p>" +
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

}


/* SALES HISTORY */
function updateSalesHistory() {

    const table =
        document.getElementById("salesHistory");

    table.innerHTML = "";

    salesHistory.forEach(function (sale) {

        table.innerHTML +=
            "<tr>" +
            "<td>" + sale.date + "</td>" +
            "<td>" + sale.customer + "</td>" +
            "<td>" + sale.product + "</td>" +
            "<td>" + sale.quantity + "</td>" +
            "<td>Rs. " + sale.total + "</td>" +
            "</tr>";

    });

}


/* PRINT BILL */
function printBill() {

    const bill =
        document.getElementById("billResult").innerHTML;

    if (bill.trim() === "") {

        alert("Please create a bill first!");

        return;
    }

    const printWindow =
        window.open("", "", "width=800,height=600");

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

    printWindow.print();

}