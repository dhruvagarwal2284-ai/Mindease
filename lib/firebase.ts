// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnSZCNf-iE_4UUS14QMds6or407_IkrMY",
  authDomain: "mentalhealthfinal1.firebaseapp.com",
  projectId: "mentalhealthfinal1",
  storageBucket: "mentalhealthfinal1.firebasestorage.app",
  messagingSenderId: "636475442478",
  appId: "1:636475442478:web:21737b0367e229fea666bf",
  measurementId: "G-6C3SP8Q5JP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);