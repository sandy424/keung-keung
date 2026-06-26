import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8x86MQfCPaVHVBlcE-yyfSspPJk6o7ns",
  authDomain: "keung-keung.firebaseapp.com",
  projectId: "keung-keung",
  storageBucket: "keung-keung.firebasestorage.app",
  messagingSenderId: "957104321141",
  appId: "1:957104321141:web:2311e55c49918b40a73e3c",
  measurementId: "G-EL00MCCB88"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// 새로고침 시 로그아웃 (메모리에만 세션 유지)
setPersistence(auth, inMemoryPersistence);