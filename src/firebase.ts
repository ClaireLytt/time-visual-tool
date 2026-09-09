import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBANnm9MB0M4HSIf4HpJKo8HAJIUHmURXw',
  authDomain: 'tool-for-everyday.firebaseapp.com',
  projectId: 'tool-for-everyday',
  storageBucket: 'tool-for-everyday.firebasestorage.app',
  messagingSenderId: '1035375684142',
  appId: '1:1035375684142:web:bc592010ad25509d14cdbf',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
