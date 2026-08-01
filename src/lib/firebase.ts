import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCMBAVV82m9hwLC8js4frpX-CYHqAdnb3c',
  authDomain: 'gcp-peshawar.firebaseapp.com',
  projectId: 'gcp-peshawar',
  storageBucket: 'gcp-peshawar.firebasestorage.app',
  messagingSenderId: '641075181205',
  appId: '1:641075181205:web:952119c32e6100f09e8d9c',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
