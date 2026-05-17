import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";



const firebaseConfig = {

  apiKey: "AIzaSyCM71hhF8teq4wyRKuLSJ0n5itbxjgeAOM",

  authDomain: "edunews-41a8b.firebaseapp.com",

  projectId: "edunews-41a8b",

  storageBucket: "edunews-41a8b.firebasestorage.app",

  messagingSenderId: "736814118538",

  appId: "1:736814118538:web:87a1cea6ab00e814fe1f73"

};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



export {

  db,

  collection,

  addDoc,

  query,

  orderBy,

  onSnapshot,

  serverTimestamp

};
