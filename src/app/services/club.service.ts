import { AuthService } from './auth.service';
import { Member } from './../models/Member';
import { Auth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, where, query, getDocs, getDoc } from '@angular/fire/firestore';
import { Club } from '../models/Club';
import { Storage, getDownloadURL, ref, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { Cell } from '../models/Cell';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private authService : AuthService,
    private storage : Storage
  ){
  }
  NewClubAdmin_member : Member = {
    idUser : "",
    idCell : "",
    idClub : "",
    role : ""
  }
  NewClubSteeringCell : Cell = {
    idClub : "",
    name : "Steering",
    description : "Steering Cell",
  }
  createdClubID !: string
  async createClub(newClub : Club, image : any){
    try{
      // upload logo image to firebase storage :
      const blob = this.dataURLLtoBlob(image.dataUrl)
      const fileRef = await this.uplaodImage(blob, image)
      const url = await getDownloadURL(fileRef)
      // create new club :
      const ClubsCollectionInstance = collection(this.firestore,'clubs');
      await addDoc(ClubsCollectionInstance,{
        code : newClub.code,
        name : newClub.name,
        description : newClub.description,
        category : newClub.category,
        logoUrl : url
      }).then((docRef) => {
        this.NewClubSteeringCell.idClub = newClub.id = docRef.id;
        // console.log('docRef.id "club" ',docRef.id)
      })
      // add steering cell :
      await this.addNewCell(this.NewClubSteeringCell).then((docRef) => {
        this.NewClubSteeringCell.id = docRef.id;
        // console.log('docRef.id "cell" ',docRef.id)
      })
      // add current user as member with role admin :
      this.NewClubAdmin_member.idUser = this.getCurrentUserUID()
      this.NewClubAdmin_member.idClub = this.NewClubSteeringCell.idClub
      this.NewClubAdmin_member.idCell = this.NewClubSteeringCell.id
      this.NewClubAdmin_member.role = "admin"
      this.NewClubAdmin_member.stars = 0
      this.addNewMember(this.NewClubAdmin_member)
      return true;
    }
    catch(error){
      return true;
    }
  }

  deleteClub(id : any){
    const collectionInstance = doc(this.firestore,'clubs',id);
    deleteDoc(collectionInstance)
  }

  deleteCell(id : any){
    const collectionInstance = doc(this.firestore,'cells',id);
    deleteDoc(collectionInstance)
  }

  async getUserClubs(){
    const userClubs: any[] = []
    const uid = this.getCurrentUserUID()
    const collectionInstance = collection(this.firestore, 'members')
    const q = query(collectionInstance, where('idUser', '==', uid))
    await getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        const clubId = doc.data()["idClub"]
        const club = await this.getClubById(clubId)
        userClubs.push(club)
      })
    })
    return userClubs
  }

  async getClubById(id : any){
    try {
      const docRef = doc(this.firestore, 'clubs', id)
      const docSnap = await getDoc(docRef)
      return docSnap.data()
    } catch (error) {
      console.error(error)
      return null
    }
  }

  getCurrentUserUID(){
    const userInfoString = localStorage.getItem("currentUser");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo.uid
  }

  addNewCell(cell : Cell){
    const collectionInstance = collection(this.firestore,'cells')
      return addDoc(collectionInstance,{
        name : cell.name,
        description : cell.description,
        idClub : cell.idClub,
      })
  }
  addNewMember(member : Member){
    const collectionInstance = collection(this.firestore,'members')
      addDoc(collectionInstance,{
        idUser : member.idUser,
        idClub : member.idClub,
        idCell : member.idCell,
        role : member.role,
        stars : member.stars,
      }).then( member => {
        console.log(member);
      })
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
      const filePath = `Club_Logos/${currentDate}.${imageData.format}`
      const fileRef = ref(this.storage, filePath)
      const task = await uploadBytes(fileRef, blob)
      // const url = getDownloadURL(fileRef)
      // return url;
      return fileRef
    }catch(e){
      throw(e);
    }
  }
  async deleteImage(filePath : any) {
    try {
      const fileRef = ref(this.storage, filePath)
      await deleteObject(fileRef)
      console.log('Image deleted successfully')
    } catch (e) {
      throw(e)
    }
  }
}
