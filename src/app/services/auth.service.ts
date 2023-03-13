import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { User } from '../Models/User';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth : Auth,
    private firestore: Firestore
  ){}

  async register(user : User){
    try {
      const newUser = await createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        console.log("uid "+uid);
        const collectionInstance = collection(this.firestore,'users');
        addDoc(collectionInstance,{
          uid : uid,
          fullname : user.fullname,
          email : user.email,
          phone : user.phone,
        }).then( () => {
          console.log("data saved !")
          return true;
        }).catch((err) => {
          console.log(err);
          return false;
        })
      })
      return true;
    } catch (error) {
      return false;
    }
  }


  async login(email : string , password : string){
    try {
      const loginUser = await signInWithEmailAndPassword(this.auth, email, password)
      return loginUser;
    } catch (error) {
      return null;
    }
  }

  logout(){
    return signOut(this.auth);
  }
}
