import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  messagingSenderId: '606347548456',
  projectId: 'browser-dashboard-c24ae',
  apiKey: 'AIzaSyD_PqpJzjfXjBQvylufzTCh6wOhrshIA6A',
  appId: '1:606347548456:web:8ba6ba115cb0e3ac62a21d',
  authDomain: 'browser-dashboard-c24ae.firebaseapp.com',
  storageBucket: 'browser-dashboard-c24ae.firebasestorage.app',
}

class Firebase {
  public initialize() {
    initializeApp(firebaseConfig)
  }
}

export default new Firebase()
