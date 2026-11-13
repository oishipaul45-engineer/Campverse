import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZ6MuR-1unOAHuGAAn-g5sHHs9bYABLDU",
  authDomain: "campverse-d5016.firebaseapp.com",
  projectId: "campverse-d5016",
  storageBucket: "campverse-d5016.firebasestorage.app",
  messagingSenderId: "949011376252",
  appId: "1:949011376252:web:a7ea37484f9cceed7b41f9",
  measurementId: "G-5ZCRB1RR3V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;