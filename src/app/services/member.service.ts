import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { TaskService } from './task.service';
import { ClubService } from './club.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private firestore: Firestore,
    private userService: UserService,
    private clubService: ClubService,
    ) { }

  async getMembers() {
    const querySnapshot = await getDocs(collection(this.firestore, 'members'));
    const members = querySnapshot.docs
      .map(doc => doc.data())
      .filter(member => member["idClub"] === this.clubService.getCurrentClubId())
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
      .filter(member => member["idClub"] === this.clubService.getCurrentClubId() && member["idUser"] !== this.userService.getCurrentUserUID())
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
    const currentUser = this.userService.getCurrentUserUID();
    const clubId = this.clubService.getCurrentClubId();
  
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
}

