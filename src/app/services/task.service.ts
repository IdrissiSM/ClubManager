import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  where,
  query,
  getDocs,
  getDoc,
  getCountFromServer,
  orderBy,
  updateDoc,
} from '@angular/fire/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
  StorageReference,
} from '@angular/fire/storage';
import { Task } from '../Models/Task';
import { ClubService } from './club.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private firestore: Firestore, private clubService: ClubService, private userService: UserService) {}

  async createTask(newTask: Task) {
    try {
      const TasksCollectionInstance = collection(this.firestore, 'tasks');
      await addDoc(TasksCollectionInstance, {
        title: newTask.title,
        description: newTask.description,
        from: newTask.from,
        to: newTask.to,
        deadline: newTask.deadline,
        status: newTask.status,
        rating: newTask.rating,
        clubId: this.clubService.getCurrentClubId()
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async createTaskNotification(from: any, to: any, deadline: any) {
    try {
      const NotificationsCollectionInstance = collection(
        this.firestore,
        'notifications'
      );
      await addDoc(NotificationsCollectionInstance, {
        date: new Date().toISOString(),
        type: 'task',
        from: from,
        to: to,
        deadline: deadline,
        read: false,
        clubId: this.clubService.getCurrentClubId(),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async getUserTaskNotifications() {
    const notificationsRef = collection(this.firestore, 'notifications');
    const querySnapshot = await getDocs(
      query(
        notificationsRef,
        where('to', '==', this.userService.getCurrentUserUID()),
        where('clubId', '==', this.clubService.getCurrentClubId())
      )
    );
    const notifications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const notificationsData = doc.data();
        const notification = { ...notificationsData, id: doc.id };
        const usersRef = collection(this.firestore, 'users');
        const userQuerySnapshot = await getDocs(
          query(usersRef, where('uid', '==', notificationsData['from']))
        );
        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data();
          const userName = userData['fullname'] || '';
          const userPhoto =
            userData['photoUrl'] ||
            'https://ionicframework.com/docs/img/demos/avatar.svg';
          return { ...notification, fullname: userName, photoUrl: userPhoto };
        }
        return notification;
      })
    );
    return notifications;
  }
  async readNotification(notificationId: string) {
    const notificationRef = doc(
      this.firestore,
      'notifications',
      notificationId
    );
    await updateDoc(notificationRef, { read: true });
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
        from: this.userService.getCurrentUserUID(),
        clubId: this.clubService.getCurrentClubId(),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async getUserMeetingNotifications() {
    const notificationsRef = collection(this.firestore, 'notifications');
    const querySnapshot = await getDocs(
      query(
        notificationsRef,
        where('type', '==', 'meeting'),
        where('clubId', '==', this.clubService.getCurrentClubId())
      )
    );
    const notifications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const notificationsData = doc.data();
        const notification = { ...notificationsData, id: doc.id };
        const usersRef = collection(this.firestore, 'users');
        const userQuerySnapshot = await getDocs(
          query(usersRef, where('uid', '==', notificationsData['from']))
        );
        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data();
          const userName = notificationsData['from'] == this.userService.getCurrentUserUID()? 'you': userData['fullname']
          const userPhoto =
            userData['photoUrl'] ||
            'https://ionicframework.com/docs/img/demos/avatar.svg';
          return { ...notification, fullname: userName, photoUrl: userPhoto };
        }
        return notification;
      })
    );
    return notifications;
  }
  async getAllTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(
      query(tasksRef, where('clubId', '==', this.clubService.getCurrentClubId()))
    );
    const tasks = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const taskData = doc.data();
      const taskId = doc.id;
      const usersRef = collection(this.firestore, 'users');
      const fromQuerySnapshot = await getDocs(
        query(usersRef, where('uid', '==', taskData['from']))
      );
      const toQuerySnapshot = await getDocs(
        query(usersRef, where('uid', '==', taskData['to']))
      );
      if (!fromQuerySnapshot.empty && !toQuerySnapshot.empty) {
        const fromData = fromQuerySnapshot.docs[0].data();
        const fromName = taskData['from'] == this.userService.getCurrentUserUID()? 'you': fromData['fullname']
        const toData = toQuerySnapshot.docs[0].data();
        const toName = taskData['to'] == this.userService.getCurrentUserUID()? 'you': toData['fullname']
        return {...taskData, from: fromName, to: toName, id: taskId}
      }
      return { id: taskId, ...taskData };
    }));
    return tasks;
  }
  async getUserTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(
      query(tasksRef, 
        where('to', '==', this.userService.getCurrentUserUID()), 
        where('clubId', '==', this.clubService.getCurrentClubId())
      )
    );
    const tasks = querySnapshot.docs.map((doc) => {
      const taskData = doc.data();
      const taskId = doc.id;
      return { id: taskId, ...taskData };
    });
    return tasks;
  }
  async getUserAssignedTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(
      query(tasksRef, 
        where('from', '==', this.userService.getCurrentUserUID()),
        where('clubId', '==', this.clubService.getCurrentClubId())
      )
    );
    const tasks = querySnapshot.docs.map((doc) => doc.data());
    return tasks;
  }
  
  async getCurrentUserRole() {
    const uid = this.userService.getCurrentUserUID();
    const membersRef = collection(this.firestore, 'members');
    const querySnapshot = await getDocs(
      query(membersRef, where('idUser', '==', uid))
    );
    const userData = querySnapshot.docs[0].data()['role'];
    return userData;
  }
  async updateTaskStatus(taskId: string, newStatus: string) {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });
  }
  async updateTaskRating(taskId: string, newRating: number) {
    const taskRef = doc(this.firestore, 'tasks', taskId);
    await updateDoc(taskRef, { rating: newRating });
  }
  async deleteTask(taskId: string) {
    try {
      const taskRef = doc(this.firestore, 'tasks', taskId);
      await deleteDoc(taskRef);
      return true;
    } catch (error) {
      return false;
    }
  }
}
