import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCIyhtp5V-f9lf9BfOrtjbaS_BWTRaCr2Y",
  authDomain: "get-cookies-4e5b5.firebaseapp.com",
  projectId: "get-cookies-4e5b5",
  storageBucket: "get-cookies-4e5b5.firebasestorage.app",
  messagingSenderId: "854785607728",
  appId: "1:854785607728:web:1c2b411e1e8a52ff2d45f5",
  measurementId: "G-3XSLKKBM7D"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error registering", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
