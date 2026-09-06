import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ================= FIREBASE ================= */

const firebaseConfig = {
    apiKey: "AIzaSyAHlgY9kvIVelwycybmuI2Wf2NrBS81AJw",
    authDomain: "smartstock-8ef85.firebaseapp.com",
    projectId: "smartstock-8ef85",
    storageBucket: "smartstock-8ef85.firebasestorage.app",
    messagingSenderId: "294915046928",
    appId: "1:294915046928:web:d8307c245ec11a28e71495"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= DATA ================= */

let products = [];
let salesHistory = [];
let totalSales = 0;


/* ================= PAGE FUNCTIONS ================= */

function showSignup() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("signupPage").style.display = "flex";
    document.getElementById("dashboardPage").style.display = "none";
}

function showLogin() {
    document.getElementById("loginPage").style.display = "flex";
    document.getElementById("signupPage").style.display = "none";
    document.getElementById("dashboardPage").style.display = "none";
}


/* ================= SIGN UP ================= */

async function signup() {

    const username = document
        .getElementById("newUsername")
        .value
        .trim();

    const password =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const error =
        document.getElementById("signupError");


    if (!username || !password || !confirmPassword) {
        error.innerText = "Please fill all details!";
        return;
    }


    if (username.includes("@")) {
        error.innerText =
            "Username should not contain @";
        return;
    }


    if (password !== confirmPassword) {
        error.innerText = "Passwords do not match!";
        return;
    }


    if (password.length < 6) {
        error.innerText =
            "Password must be at least 6 characters!";
        return;
    }


    try {

        const email =
            username.toLowerCase() + "@smartstock.app";

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("Account created successfully!");

        document.getElementById("newUsername").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

        await signOut(auth);

        showLogin();

    } catch (err) {

        console.error(err);

        if (err.code === "auth/email-already-in-use") {

            error.innerText =
                "Username already exists!";

        } else if (err.code === "auth/invalid-email") {

            error.innerText =
                "Invalid username!";

        } else if (err.code === "auth/weak-password") {

            error.innerText =
                "Password must be at least 6 characters!";

        } else {

            error.innerText =
                "Account could not be created!";

        }
    }
}


/* ================= LOGIN ================= */

async function login() {

    const username =
        document.getElementById("username")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const error =
        document.getElementById("error");


    if (!username || !password) {

        error.innerText =
            "Please enter username and password!";

        return;
    }


    if (username.includes("@")) {

        error.innerText =
            "Enter username only, not email.";

        return;
    }


    try {

        const email =
            username.toLowerCase() + "@smartstock.app";

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        error.innerText = "";

    } catch (err) {

        console.error(err);

        error.innerText =
            "Invalid username or password!";
    }
}


/* ================= LOGOUT ================= */

async function logout() {

    try {

        await signOut(auth);

    } catch (err) {

        console.error(err);

    }
}


/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, async (user) => {

    if (user) {

        document.getElement
