import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Meeting } from '../Models/meeting';
import { ClubService } from './club.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private firestore: Firestore, private clubService: ClubService) {}

  async createMeeting(newMeeting: Meeting) {
    try {
      const MeetingsCollectionInstance = collection(this.firestore, 'meetings');
      await addDoc(MeetingsCollectionInstance, {
        type: 'meeting',
        title: newMeeting.title,
        description: newMeeting.description,
        startDate: newMeeting.startDate,
        endDate: newMeeting.endDate,
        location: newMeeting.location,
        clubId: this.clubService.getCurrentClubId()
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async createMeetingNotification(startDate: any, endDate: any, location: any) {
    try {
      const NotificationsCollectionInstance = collection(
        this.firestore,
        'notifications'
      );
      await addDoc(NotificationsCollectionInstance, {
        date: new Date().toISOString(),
        type: 'meeting',
        startDate: startDate,
        endDate: endDate,
        location: location,
        read: false,
        clubId: this.clubService.getCurrentClubId()
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async getMeetings(){
    const meetingsRef = collection(this.firestore, 'meetings');
    const querySnapshot = await getDocs(
      query(meetingsRef, where('clubId', '==', this.clubService.getCurrentClubId()))
    );
    return querySnapshot.docs;
  }
}
