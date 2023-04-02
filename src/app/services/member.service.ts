import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Member } from '../models/Member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private firestore: Firestore) { }

  // async getMembers() {
  //   const querySnapshot = await getDocs(collection(this.firestore, 'members'));
  //   const members = querySnapshot.docs
  //     .map(doc => doc.data())
  //     .filter(member => member["idClub"] === this.getCurrentClubId())
  //     .map(member => member as Member);
  //   return members;
  // }

  async getMembers() {
    const querySnapshot = await getDocs(collection(this.firestore, 'members'));
    const members = querySnapshot.docs
      .map(doc => doc.data())
      .filter(member => member["idClub"] === this.getCurrentClubId())
      .map(async member => {
        const usersRef = collection(this.firestore, 'users');
        const querySnapshot = await getDocs(query(usersRef, where('uid', '==', member['idUser'])));
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0];
          const userName = userData.data()?.['fullname'] || '';
          return {...member, fullname: userName};
        }
        else{
          return member;
        }
      });
    return Promise.all(members);
  }

  getCurrentClubId() {
    const currentClubString = localStorage.getItem("currentClub");
    if (currentClubString) {
      const currentClub = JSON.parse(currentClubString);
      return currentClub.id;
    }
    return null;
  }

}

