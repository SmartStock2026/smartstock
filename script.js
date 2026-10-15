/* ======================================== SMARTSTOCK - FIREBASE EXACT 30 LINES ======================================== */
const firebaseConfig = { apiKey: "AIzaSyAquHDhMS8w9vqqK5oq9vLNyjpiKokXE3s", authDomain: "://firebaseapp.com", databaseURL: "https://firebasedatabase.app", projectId: "smartstock-560ad", storageBucket: "smartstock-560ad.firebasestorage.app", messagingSenderId: "73130734334", appId: "1:73130734334:web:9b1bcdf8e2c0f2d9952baf" };
firebase.initializeApp(firebaseConfig); const auth = firebase.auth(), database = firebase.database(); let products = [], totalSales = 0, salesHistory = [], currentUser = null, currentUsername = "";
function userDatabasePath(p) { if (!currentUser) throw new Error("Please login first."); return database.ref("users/" + currentUser.uid + "/" + p); }
function usernameToEmail(u) { return u.trim().toLowerCase() + "@://firebaseapp.com"; }
window.addEventListener("load", function () { document.getElementById("dashboardPage").style.display = "none"; document.getElementById("signupPage").style.display = "none"; document.getElementById("loginPage").style.display = "flex"; });

async function login() {
    const u = document.getElementById("username").value.trim(), p = document.getElementById("password").value, err = document.getElementById("error"); err.innerText = "";
    if (!u || !p) return err.innerText = "Please enter username and password!"; if (!/^[a-zA-Z0-9._-]{3,30}$/.test(u)) return err.innerText = "Username must be 3-30 characters using letters, numbers, dots, _ or -.";
    try { await auth.signInWithEmailAndPassword(usernameToEmail(u), p); } 
    catch (e) { console.error("Login error:", e); err.innerText = ["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(e.code) ? "Invalid username or password!" : e.code === "auth/too-many-requests" ? "Too many attempts. Please try again later." : "Login failed. Please check your Firebase setup."; }
}
function showSignup() { document.getElementById("dashboardPage").style.display = "none"; document.getElementById("loginPage").style.display = "none"; document.getElementById("signupPage").style.display = "flex"; }
function showLogin() { document.getElementById("signupPage").style.display = "none"; document.getElementById("loginPage").style.display = "flex"; }

async function signup() {
    const u = document.getElementById("newUsername").value.trim(), p = document.getElementById("newPassword").value, cp = document.getElementById("confirmPassword").value, err = document.getElementById("signupError"); err.innerText = "";
    if (!u || !p || !cp) return err.innerText = "Please fill all details!"; if (!/^[a-zA-Z0-9._-]{3,30}$/.test(u)) return err.innerText = "Username must be 3-30 characters using letters, numbers, dots, _ or -.";
    if (p.length < 6) return err.innerText = "Password must contain at least 6 characters!"; if (p !== cp) return err.innerText = "Passwords do not match!";
    try {
        const cred = await auth.createUserWithEmailAndPassword(usernameToEmail(u), p);
        await database.ref("users/" + cred.user.uid + "/profile").set({ username: u, createdAt: Date.now() }); alert("Account created successfully!"); showLogin();
    } catch (e) { console.error("Signup error:", e); err.innerText = e.code === "auth/email-already-in-use" ? "This username is already registered!" : e.code === "auth/weak-password" ? "Please choose a stronger password!" : "Account creation failed. Check Firebase settings."; }
}
async function logout() { try { await auth.signOut(); } catch (e) { console.error("Logout error:", e); alert("Logout failed. Please try again."); } }

auth.onAuthStateChanged(async function (user) {
    if (!user) { currentUser = null; currentUsername = ""; products = []; totalSales = 0; salesHistory = []; document.getElementById("dashboardPage").style.display = "none"; document.getElementById("signupPage").style.display = "none"; document.getElementById("loginPage").style.display = "flex"; return; }
    currentUser = user; try {
        const snap = await userDatabasePath("profile").once("value"), prof = snap.val() || {}; currentUsername = prof.username || user.email.split("@");
        await loadUserData(); document.getElementById("loginPage").style.display = "none"; document.getElementById("signupPage").style.display = "none"; document.getElementById("dashboardPage").style.display = "block"; showDashboard();
    } catch (e) { console.error("Loading data error:", e); alert("Could not load your data. Check your Database Rules and internet connection."); }
});

async function loadUserData() {
    const results = await Promise.all([userDatabasePath("products").once("value"), userDatabasePath("totalSales").once("value"), userDatabasePath("salesHistory").once("value")]);
    const productData = results[0].val(), salesData = results[1].val(), historyData = results[2].val();
    products = productData ? Object.keys(productData).map(key => ({ id: key, ...productData[key] })) : []; totalSales = Number(salesData) || 0;
    salesHistory = historyData ? Object.keys(historyData).map(key => ({ id: key, ...historyData[key] })) : [];
    updateProductTable(); updateStockTable(); updateDashboard(); updateSalesHistory();
}
function hideAll() { document.getElementById("dashboardSection").classList.add("hidden"); document.getElementById("productsSection").classList.add("hidden"); document.getElementById("stockSection").classList.add("hidden"); document.getElementById("billingSection").classList.add("hidden"); } 
