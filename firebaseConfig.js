// Firebase Configuration
// Replace these values with your Firebase project credentials

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your Firebase config - REPLACE WITH YOUR OWN
const firebaseConfig = {
  apiKey: "AIzaSyCiLvtdsdfMtb-6izmmqu8zI7CmiBpU-3s",

  authDomain: "modernnews-1bb89.firebaseapp.com",

  projectId: "modernnews-1bb89",

  storageBucket: "modernnews-1bb89.firebasestorage.app",

  messagingSenderId: "23258396528",

  appId: "1:23258396528:web:c1e87b2722428120a181b5",

  measurementId: "G-7MWHN0996Q"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);



