import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5r2pqbmO76XhkkY2vGn2DW3DYmvQOrnU",
  authDomain: "lista-facil-orcamentos.firebaseapp.com",
  projectId: "lista-facil-orcamentos",
  storageBucket: "lista-facil-orcamentos.firebasestorage.app",
  messagingSenderId: "75065676378",
  appId: "1:75065676378:web:13effba95afff56acdbe63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
