// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC47cUK13MVA4KqBk7_ci3FpsrD-cwQ2aw",
    authDomain: "salesmaster-b36c6.firebaseapp.com",
    projectId: "salesmaster-b36c6",
    storageBucket: "salesmaster-b36c6.firebasestorage.app",
    messagingSenderId: "758805674391",
    appId: "1:758805674391:web:d3128f15dfc12704396cd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const checkFirestoreConnection = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "test")); // Change "test" to an existing Firestore collection
        console.log("Firestore is connected! ✅");
        querySnapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data());
        });
    } catch (error) {
        console.error("Firestore connection failed ❌", error);
    }
};

checkFirestoreConnection();

export const db = getFirestore(app);