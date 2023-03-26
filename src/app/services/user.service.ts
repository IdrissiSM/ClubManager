import { Injectable } from '@angular/core';
import { Firestore, collection, where, query, getDocs, updateDoc, doc, getDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private storage : Storage
  ){}

  async saveUserInfo(uid : string, image : any, userInfo : any){
    if(image){
      // check if the user has already a profil poto :
      const userDoc = await this.getUserDocByUID(uid)
      if(userDoc.data()["photoUrl"] !== "" || userDoc.data()["photoPath"] !== ""){
        this.deleteUserPhoto(uid)
      }
      // upload logo image to firebase storage :
      const blob = this.dataURLLtoBlob(image.dataUrl)
      const {fileRef,filePath} = (await this.uplaodImage(blob, image))
      const url = await getDownloadURL(fileRef)
      // update user info :
      const userDocRef = await this.getUserDocRefByUID(uid)
      const data = {
        fullname : userInfo.fullname,
        phone : userInfo.phone,
        photoUrl : url,
        photoPath : filePath
      };
      await updateDoc(userDocRef, data);
      // update user info in localstorage :
      const jsonCurrentUser = localStorage.getItem("currentUser")
      const currentUser = jsonCurrentUser ? JSON.parse(jsonCurrentUser) : null
      currentUser.fullname = userInfo.fullname
      currentUser.phone = userInfo.phone
      currentUser.photoUrl = url
      currentUser.photoPath = filePath
      localStorage.setItem('currentUser', JSON.stringify(currentUser))

      return true;
    }else{
      // update user info :
      const userDocRef = await this.getUserDocRefByUID(uid)
      const data = {
        fullname : userInfo.fullname,
        phone : userInfo.phone
      };
      await updateDoc(userDocRef, data)
      // update user info in localstorage :
      const jsonCurrentUser = localStorage.getItem("currentUser")
      const currentUser = jsonCurrentUser ? JSON.parse(jsonCurrentUser) : null
      currentUser.fullname = userInfo.fullname
      currentUser.phone = userInfo.phone
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      return true
    }
  }

  async deleteUserPhoto(idUser : string){
    const doc = await this.getUserDocByUID(idUser)
    if(doc.exists()){
      const fileRef = ref(this.storage, doc.data()["photoPath"]);
      await deleteObject(fileRef)
      const data = {
        photoUrl : "",
        photoPath : ""
      };
      await updateDoc(doc.ref, data)
      return true
    }
    return false
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
      return {'fileRef' : fileRef, 'filePath' : filePath}
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
  async getUserDocByUID(uid : string){
    const userCollectionInstance = collection(this.firestore, 'users')
    const q = query(
      userCollectionInstance,
      where("uid", "==", uid)
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    return doc
  }
}
