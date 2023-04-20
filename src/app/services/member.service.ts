import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private firestore: Firestore,
    private taskService: TaskService,
    ) { }

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

  async getMembersWithoutUser() {
    const querySnapshot = await getDocs(collection(this.firestore, 'members'));
    const members = querySnapshot.docs
      .map(doc => doc.data())
      .filter(member => member["idClub"] === this.getCurrentClubId() && member["idUser"] !== this.taskService.getCurrentUserUID())
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
  
  async getMembersByClubAndCell() {
    const currentUser = this.taskService.getCurrentUserUID();
    const clubId = this.getCurrentClubId();
  
    const querySnapshot = await getDocs(query(collection(this.firestore, 'members'), where('idUser', '==', currentUser), where('idClub', '==', clubId)));
    const memberData = querySnapshot.docs[0]?.data() || {};
    const cellId = memberData['idCell'] || '';
  
    const membersSnapshot = await getDocs(collection(this.firestore, 'members'));
    const members = membersSnapshot.docs
      .map(doc => doc.data())
      .filter(member => member['idClub'] === clubId && member['idCell'] === cellId && member['idUser'] !== currentUser);
  
    const membersWithNames = await Promise.all(members.map(async member => {
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
    }));
  
    return membersWithNames;
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

