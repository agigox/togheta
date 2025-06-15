// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDvijt4VfndKG_XVlbdnUq2sAjpJ1aV_pc',
  authDomain: 'togheta-fec6a.firebaseapp.com',
  projectId: 'togheta-fec6a',
  storageBucket: 'togheta-fec6a.firebasestorage.app',
  messagingSenderId: '374552104519',
  appId: '1:374552104519:web:f1d4bc2154940d152fab62',
  measurementId: 'G-0DBWTCH68V',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export function getDB() {
  return getFirestore(app);
}
// export const db = getFirestore(app);
// export const auth = getAuth(app);
// const analytics = getAnalytics(app);
