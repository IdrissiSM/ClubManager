import { Member } from './../models/Member';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, where, query, getDocs, getDoc, getCountFromServer, orderBy, updateDoc } from '@angular/fire/firestore';
import { Club } from '../models/Club';
import { Storage, getDownloadURL, ref, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { Cell } from '../models/Cell';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private storage : Storage,
    private toastController : ToastController,
  ){}

  async saveUserInfo(uid : string, image : any, userInfo : any){
    try{
      // upload profil image to firebase storage :
      const blob = this.dataURLLtoBlob(image.dataUrl)
      const fileRef = await this.uplaodImage(blob, image)
      const url = await getDownloadURL(fileRef)
      // update user info :
      const userDocRef = await this.getUserDocRefByUID(uid)
      const data = {
        fullname : userInfo.fullname,
        phone : userInfo.phone,
      };
      await updateDoc(userDocRef, data);
      return true;
    }
    catch(error){
      return true;
    }
  }

  dataURLLtoBlob(dataurl : any){
    var arr = dataurl.split(','), mine = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob( [u8arr], {type:mine});
  }

  async uplaodImage(blob : any, imageData :  any){
    try{
      const currentDate = Date.now()
      const filePath = `Profil_Images/${currentDate}.${imageData.format}`
      const fileRef = ref(this.storage, filePath)
      await uploadBytes(fileRef, blob)
      return fileRef
    }catch(e){
      throw(e);
    }
  }

  async getUserDocRefByUID(uid : string){
    const userCollectionInstance = collection(this.firestore, 'users')
    const q = query(
      userCollectionInstance,
      where("uid", "==", uid)
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    return doc.ref
  }
}
