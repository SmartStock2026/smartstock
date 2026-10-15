const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "smartstock-560ad.firebaseapp.com",
  databaseURL: "https://smartstock-560ad-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartstock-560ad"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.database();
let user = null;
auth.onAuthStateChanged(u => {
  user = u;
  document.getElementById("loginPage").style.display = u ? "none" : "flex";
  document.getElementById("dashboardPage").style.display = u ? "block" : "none";
});
function email(n) { return n.trim().toLowerCase() + "@smartstock-560ad.firebaseapp.com"; }
async function login() {
  try { await auth.signInWithEmailAndPassword(email(username.value), password.value); }
  catch(e) { error.innerText = "Login failed! Check username/password."; }
}
function showSignup() {
  loginPage.style.display = "none"; signupPage.style.display = "flex";
}
function showLogin() {
  signupPage.style.display = "none"; loginPage.style.display = "flex";
}
async function signup() {
  if (newPassword.value !== confirmPassword.value) return signupError.innerText = "Passwords do not match!";
  try {
    let c = await auth.createUserWithEmailAndPassword(email(newUsername.value), newPassword.value);
    await db.ref("users/" + c.user.uid + "/profile").set({username:newUsername.value});
    alert("Account created!");
  } catch(e) { signupError.innerText = "Signup failed!"; }
}
function logout() { auth.signOut(); }
async function addProduct() {
  if (!user) return alert("Login first!");
  let p = {name:productName.value,price:+productPrice.value,quantity:+productQuantity.value};
  if (!p.name || p.price <= 0 || p.quantity <= 0) return alert("Enter valid details!");
  await db.ref("users/" + user.uid + "/products").push(p);
  alert("Product added!");
}
