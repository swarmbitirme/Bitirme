import "firebase/firestore";
import firebase from "firebase";
import io from "socket.io-client";
const host = "https://swarm-socket-server.herokuapp.com/";

var firebaseConfig = {
  apiKey: "AIzaSyCN_bUNo2fC64E6fIpl5zx25LFfv4tVRGk",
  authDomain: "swarm-a9622.firebaseapp.com",
  databaseURL: "https://swarm-a9622.firebaseio.com",
  projectId: "swarm-a9622",
  storageBucket: "swarm-a9622.appspot.com",
  messagingSenderId: "52867235759",
  appId: "1:52867235759:web:1ae958d267bfd046e8795a",
  measurementId: "G-HQV0XW7BKB",
};

firebase.initializeApp(firebaseConfig);
const socket = io.connect(host);

const db = firebase.firestore();
module.exports = { firebase, db, socket };
