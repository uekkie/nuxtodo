import firebase from 'firebase/app'
import 'firebase/database'

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: 'AIzaSyB-Ho-85RNViMtpjc_-0cAuVsTquI92WwQ',
    authDomain: 'nuxtodo-d7575.firebaseapp.com',
    databaseURL: 'https://nuxtodo-d7575.firebaseio.com',
    projectId: 'nuxtodo-d7575',
    storageBucket: 'nuxtodo-d7575.appspot.com',
    messagingSenderId: '307187478253',
    appId: '1:307187478253:web:ce2dd8280f5863a8c926e4',
  }
  firebase.initializeApp(firebaseConfig)
}

export default firebase
