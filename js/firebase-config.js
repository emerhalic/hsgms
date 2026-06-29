/**
 * ===========================================================
 * HS Studio Graduation Management System (HSGMS)
 * File : firebase-config.js
 * Sprint : 1A
 *
 * Purpose:
 * Centralized Firebase initialization for the entire project.
 *
 * Architecture:
 * HTML + CSS + Vanilla JavaScript + Firebase CDN + Netlify
 *
 * DO NOT duplicate Firebase initialization
 * in any other JavaScript file.
 * ===========================================================
 */

// Import required Firebase modular SDK components via CDN (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// HSGMS Firebase Configuration Parameters
const firebaseConfig = {
  apiKey: "AIzaSyBRawoLiuqO1FwJf1v6O8WWV5QIHpBGBlo",
  authDomain: "hsstudio-graduation.firebaseapp.com",
  databaseURL: "https://hsstudio-graduation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hsstudio-graduation",
  storageBucket: "hsstudio-graduation.firebasestorage.app",
  messagingSenderId: "1032117442159",
  appId: "1:1032117442159:web:98c991bc15d9c8e43cdf9a"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Export centralized instances for consumption by domain modules
export { app, database, storage, auth };