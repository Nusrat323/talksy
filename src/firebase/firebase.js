import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsBUjnmYimY73STdN2_RDP2ALP4jpZP20",
  authDomain: "talksy-353b1.firebaseapp.com",
  projectId: "talksy-353b1",
  storageBucket: "talksy-353b1.appspot.com",
  messagingSenderId: "251417546902",
  appId: "1:251417546902:web:c384d2bd110681d542b2b7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();