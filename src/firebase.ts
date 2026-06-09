// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8x86MQfCPaVHVBlcE-yyfSspPJk6o7ns",
  authDomain: "keung-keung.firebaseapp.com",
  projectId: "keung-keung",
  storageBucket: "keung-keung.firebasestorage.app",
  messagingSenderId: "957104321141",
  appId: "1:957104321141:web:2311e55c49918b40a73e3c",
  measurementId: "G-EL00MCCB88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);