import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyD_PqpJzjfXjBQvylufzTCh6wOhrshIA6A',
  authDomain: 'browser-dashboard-c24ae.firebaseapp.com',
  projectId: 'browser-dashboard-c24ae',
  storageBucket: 'browser-dashboard-c24ae.firebasestorage.app',
  messagingSenderId: '606347548456',
  appId: '1:606347548456:web:8ba6ba115cb0e3ac62a21d',
}

class Firebase {
  public initialize() {
    initializeApp(firebaseConfig)
  }
}

export default new Firebase()
