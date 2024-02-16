import { initializeApp } from "@react-native-firebase/app";
import { getStorage } from '@react-native-firebase/storage';
import { getFirestore } from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAydbToGc4nVbaZXbf5-S9cXwn9TfznMG4",
  authDomain: "cloudphoto-24d0d.firebaseapp.com",
  projectId: "cloudphoto-24d0d",
  storageBucket: "cloudphoto-24d0d.appspot.com",
  messagingSenderId: "72116443350",
  appId: "1:72116443350:web:83ea51fd488239e1121177",
  measurementId: "G-VMWY11X3Z5"
};

// Vérifier si l'application Firebase est déjà initialisée
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore();
