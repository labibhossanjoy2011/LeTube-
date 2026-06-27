import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0211170723",
  appId: "1:1092364083043:web:a830ae7a84bc7678773d56",
  apiKey: "AIzaSyAF1CedpZQ9nvH521v-zMUnkKO-SS3yrAw",
  authDomain: "gen-lang-client-0211170723.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-videostreamingpl-24034e26-e5b4-47ee-a073-5b007e9e46c9",
  storageBucket: "gen-lang-client-0211170723.firebasestorage.app",
  messagingSenderId: "1092364083043",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
