import { Member } from './../models/Member';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, where, query, getDocs, getDoc, getCountFromServer, orderBy, updateDoc } from '@angular/fire/firestore';
import { Club } from '../models/Club';
import { Storage, getDownloadURL, ref, uploadBytes, deleteObject, StorageReference  } from '@angular/fire/storage';
import { Cell } from '../models/Cell';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  constructor(
    private firestore: Firestore,
    private storage : Storage,
    private toastController : ToastController,
  ){}

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
      const {fileRef,filePath} = (await this.uplaodImage(blob, image))
      const url = await getDownloadURL(fileRef)
      // create new club :
      const ClubsCollectionInstance = collection(this.firestore,'clubs');
      await addDoc(ClubsCollectionInstance,{
        name : newClub.name,
        description : newClub.description,
        category : newClub.category,
        logoUrl : url,
        logoPath : filePath,
      }).then((docRef) => {
        this.NewClubSteeringCell.idClub = newClub.id = docRef.id;
      })
      // add steering cell :
      await this.addNewCell(this.NewClubSteeringCell).then((docRef) => {
        this.NewClubSteeringCell.id = docRef?.id;
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

  async deleteCell(id : string){
    const collectionInstance = doc(this.firestore,'cells',id);
    await deleteDoc(collectionInstance)
  }

  async getUserClubs(){
    const userClubs: any[] = []
    const uid = this.getCurrentUserUID()
    const collectionInstance = collection(this.firestore, 'members')
    const q = query(collectionInstance, where('idUser', '==', uid))
    await getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        const clubId = doc.data()["idClub"]
        let club = await this.getClubById(clubId)
        club = {
          ...club,
          ...{'id' : clubId},
          ...{'memberId' : doc.id},
          ...{'role' : doc.data()["role"]}
        }
        userClubs.push(club)
      })
    })
    return userClubs
  }

  async joinClubByCode(code : string){
    // check if club exists
    const clubRef = doc(this.firestore, 'clubs', code)
    const clubSnap = await getDoc(clubRef)
    if(clubSnap.exists()){
      // the club exists
      // check if user is already a member of the club :
      const memberCollectionInstance = collection(this.firestore, 'members')
      const q = query(
        memberCollectionInstance,
        where('idUser', '==', this.getCurrentUserUID()),
        where('idClub', '==', code)
      )
      return await getDocs(q).then(async (querySnapshot) => {
        if(querySnapshot.size > 0){
          // the user is already a member of the club
          const toast = await this.toastController.create({
            message: 'You are already a member of this club',
            duration: 1500,
            icon: 'alert-circle'
          });
          await toast.present();
          return false
        }else{
          // the user is not a member of the club
          // add current user as member with role "no-role" :
          const member : Member = {
            idUser: this.getCurrentUserUID(),
            idClub: code,
            idCell: '',
            role: 'no-role',
            stars: 0
          }
          await this.addNewMember(member)
          return true
        }
      })
    } else {
      // club does not exist
      const toast = await this.toastController.create({
        message: 'Incorrect code',
        duration: 1500,
        icon: 'alert-circle'
      });
      await toast.present();
      return false
    }
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

  async leaveClub(id : string){
    try {
      // get member by idClub and idUser :
      const memberCollectionInstance = collection(this.firestore, 'members')
      const q = query(
        memberCollectionInstance,
        where('idUser', '==', this.getCurrentUserUID()),
        where('idClub', '==', id)
      )
      await getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref)
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  getCurrentUserUID(){
    const userInfoString = localStorage.getItem("currentUser");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo.uid
  }

  async addNewCell(cell : Cell){
    const cellCollectionInstance = collection(this.firestore, 'cells')
    const q = query(
      cellCollectionInstance,
      where("idClub", "==", cell.idClub),
      where("name", "==", cell.name),
      )
    const snapshot = await getCountFromServer(q)
    if(snapshot.data().count == 0){
      return addDoc(cellCollectionInstance,{
        name : cell.name,
        description : cell.description,
        idClub : cell.idClub,
      })
    }
    else{
      return null
    }
  }

  async getClubMembersInCells(idClub : string){
    let cellsWithMembersList : any = []
    const cellCollectionInstance = collection(this.firestore, 'cells')
    const q = query(
      cellCollectionInstance,
      where("idClub", "==", idClub),
    )
    await getDocs(q).then((memberQuerySnapshot) => {
      memberQuerySnapshot.forEach(async (cellDoc) => {
        const users = await this.getMembersByCellName(idClub,cellDoc.data()["name"])
        const cell : Cell = {
          id: cellDoc.id,
          idClub: cellDoc.data()["idClub"],
          name: cellDoc.data()["name"],
          description: cellDoc.data()["description"]
        }
        const cellWithMembersList = {"cell" : cell, "users" : users }
        cellsWithMembersList.push(cellWithMembersList)
      })
    })
    return cellsWithMembersList
  }

  async getMembersWithoutCell(idClub : string){
    let membersWithoutCell : any = []
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idClub", "==", idClub),
      where("role", "==", "no-role")
    )
    await getDocs(q).then((memberQuerySnapshot) => {
      memberQuerySnapshot.forEach(async (memberDoc) => {
        const user = await this.getUserByUID(memberDoc.data()["idUser"])
        membersWithoutCell.push(user)
      })
    })
    return membersWithoutCell
  }

  async addNewMember(member : Member){
    const collectionInstance = collection(this.firestore,'members')
    await addDoc(collectionInstance,{
      idUser : member.idUser,
      idClub : member.idClub,
      idCell : member.idCell,
      role : member.role,
      stars : member.stars,
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
      await uploadBytes(fileRef, blob)
      return {'fileRef' : fileRef, 'filePath' : filePath}
    }catch(e){
      throw(e);
    }
  }
  async deleteClubLogo(idClub : string){
    const docRef = doc(this.firestore, 'clubs', idClub)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const fileRef = ref(this.storage, docSnap.data()["logoPath"]);
      await deleteObject(fileRef)
    }
  }

  async getCountClubMembers(idClub : string){
    const memberCollectionInstance = collection(this.firestore, 'members')
    const q = query(memberCollectionInstance, where("idClub", "==", idClub))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  }

  async getSteeringCellMembers(idClub : string){
    const clubUsers : any[] = []
    const memberCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      memberCollectionInstance,
      where("idClub", "==", idClub)
    )
    await getDocs(q).then((memberQuerySnapshot) => {
      memberQuerySnapshot.forEach(async (memberDoc) => {
        const idCell = memberDoc.data()["idCell"]
        // console.log('memberDoc.data()',memberDoc.data())
        const cellCollectionInstance = collection(this.firestore, 'cells')
        const q = query(
          cellCollectionInstance,
          where("idClub", "==", idClub),
          where("name", "==", "Steering")
        )
        await getDocs(q).then( (cellQuerySnapqhot) => {
          cellQuerySnapqhot.forEach(async (cellDoc) => {
            if(cellDoc.id == idCell){
              const uid = await memberDoc.data()["idUser"]
              const user = await this.getUserByUID(uid)
              clubUsers.push(user)
            }
          })
        })
      })
    })
    return clubUsers
  }

  async getMembersByCellName(idClub : string,cellName : string){
    let cellMembers : any[] = []
    const memberCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      memberCollectionInstance,
      where("idClub", "==", idClub)
    )
    await getDocs(q).then((memberQuerySnapshot) => {
      memberQuerySnapshot.forEach(async (memberDoc) => {
        const idCell = memberDoc.data()["idCell"]
        const cellCollectionInstance = collection(this.firestore, 'cells')
        const q = query(
          cellCollectionInstance,
          where("idClub", "==", idClub),
          where("name", "==", cellName)
        )
        await getDocs(q).then( (cellQuerySnapqhot) => {
          cellQuerySnapqhot.forEach(async (cellDoc) => {
            if(cellDoc.id == idCell){
              const uid = await memberDoc.data()["idUser"]
              const user = await this.getUserByUID(uid)
              const member = await this.getMemberByClubIdAndUserId(uid,idClub)
              cellMembers.push({...user,...{"role" : member.role}})
            }
          })
        })
      })
    })
    return cellMembers
  }

  async getUserByUID(uid : string){
    let user : any
    const userCollectionInstance = collection(this.firestore, 'users')
    const q = query(
      userCollectionInstance,
      where("uid", "==", uid)
    )
    await getDocs(q).then((querySnapqhot) => {
      querySnapqhot.forEach((userDoc) => {
        user = userDoc.data()
      })
    })
    return user
  }

  async getCellById(idCell : string){
    try {
      const docRef = doc(this.firestore, 'cells', idCell)
      const docSnap = await getDoc(docRef)
      console.log(docSnap.data())
      return docSnap.data()
    } catch (error) {
      return null
    }
  }

  async getUserById(idUser : string){
    try {
      const docRef = doc(this.firestore, 'users', idUser)
      const docSnap = await getDoc(docRef)
      return docSnap.data()
    } catch (error) {
      return null
    }
  }

  async getCountClubCells(idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'cells')
    const q = query(cellCollectionInstance, where("idClub", "==", idClub))
    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  }

  async getClubCells(idClub : string){
    let clubCells : any[] = []
    const collectionInstance = collection(this.firestore, 'cells')
    const q = query(collectionInstance, where('idClub', '==', idClub))
    await getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        const cell : Cell = {
          id : doc.id,
          idClub: doc.data()["idClub"],
          name: doc.data()["name"],
          description: doc.data()["description"]
        }
        clubCells.push(cell)
      })
    })
    return clubCells
  }

  async addMemberToCell(idUser : string, idCell : string, idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub),
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    const data = {
      idCell : idCell,
      role : "member",
    };
    await updateDoc(doc.ref, data);
  }

  async removeMemberFromCell(idUser : string, idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub),
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    const data = {
      idCell : "",
      role : "no-role",
    };
    await updateDoc(doc.ref, data);
  }

  async excludeMember(idUser : string, idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub),
    )
    const docRef = await getDocs(q)
    const doc = docRef.docs[0]
    await deleteDoc(doc.ref)
  }

  async getMemberByClubIdAndUserId(idUser : string, idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub),
    )
    const docRef = await getDocs(q)
    const doc = docRef.docs[0]
    const member : Member = {
      id: doc.id,
      idUser: doc.data()["idUser"],
      idClub: doc.data()["idClub"],
      role: doc.data()["role"]
    }
    return member
  }

  async getMembersByClubId(idClub : string){
    let clubMembers : any[] = []
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idClub", "==", idClub),
    )
    await getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        const member : Member = {
          id: doc.id,
          idUser: doc.data()["idUser"],
          idClub: doc.data()["idClub"],
          role: doc.data()["role"]
        }
        clubMembers.push(member)
      })
    })
    return clubMembers
  }

  async deleteClub(id : string){
    // delete members :
    const clubMembers = await this.getMembersByClubId(id)
    clubMembers.forEach(async (member) => {
      const memberDoc = doc(this.firestore,'members',member.id)
      await deleteDoc(memberDoc)
    })
    // delete club cells :
    const clubCells = await this.getClubCells(id)
    clubCells.forEach(async (cell) => {
      const cellDoc = doc(this.firestore,'cells',cell.id)
      await deleteDoc(cellDoc)
    })
    // delete club logo :
    await this.deleteClubLogo(id)
    // delete club :
    const clubDoc = doc(this.firestore,'clubs',id)
    await deleteDoc(clubDoc)
  }

  async defineRole(idUser : string,idClub : string,newRole : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub)
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    const data = {
      role : newRole,
    };
    await updateDoc(doc.ref, data);
  }

  async isRoleAlreadyExists(role : string,idClub : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idClub", "==", idClub),
      where("role", "==", role)
    )
    return !(await getDocs(q)).empty
  }

  async getMemberRole(idClub : string,idUser : string){
    const cellCollectionInstance = collection(this.firestore, 'members')
    const q = query(
      cellCollectionInstance,
      where("idUser", "==", idUser),
      where("idClub", "==", idClub)
    )
    const docRef = await getDocs(q);
    const doc = docRef.docs[0];
    console.log('doc.data()["role"]',doc.data()["role"])
    return doc.data()["role"]
  }

}
