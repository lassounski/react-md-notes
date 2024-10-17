import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc8QsgeGTv6H8Dz1DHqYwouSiVc3TXhEk",
  authDomain: "react-notes-with-markdown.firebaseapp.com",
  projectId: "react-notes-with-markdown",
  storageBucket: "react-notes-with-markdown.appspot.com",
  messagingSenderId: "905860291748",
  appId: "1:905860291748:web:3bfec21590ed68623e5a31"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const notesCollection = collection(db, "notes")