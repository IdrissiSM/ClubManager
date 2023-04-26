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

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private firestore: Firestore, private clubService: ClubService) {}

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
        clubId: this.clubService.getCurrentClubId()
      });
      return true;
    } catch (error) {
      return false;
    }
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
        const fromName = fromData['fullname'] || ''; 
        const toData = toQuerySnapshot.docs[0].data();
        const toName = toData['fullname'] || ''; 
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
        where('to', '==', this.getCurrentUserUID()), 
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
  async getUserTaskNotifications() {
    const notificationsRef = collection(this.firestore, 'notifications');
    const querySnapshot = await getDocs(
      query(notificationsRef, 
        where('to', '==', this.getCurrentUserUID()),
        where('clubId', '==', this.clubService.getCurrentClubId()))
    );
    const notifications = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const notificationsData = doc.data();
      const notification = { ...notificationsData, id: doc.id}
      const usersRef = collection(this.firestore, 'users');
      const userQuerySnapshot = await getDocs(
        query(usersRef, where('uid', '==', notificationsData['from']))
      );
      if (!userQuerySnapshot.empty) {
        const userData = userQuerySnapshot.docs[0].data();
        const userName = userData['fullname'] || '';
        const userPhoto = userData['photoUrl'] || "https://ionicframework.com/docs/img/demos/avatar.svg";
        return { ...notification, fullname: userName, photoUrl: userPhoto };
      }
      return notification;
    }));
    return notifications;
  }
  async readNotification(notificationId: string) {
    const notificationRef = doc(this.firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  }
  async getUserAssignedTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(
      query(tasksRef, 
        where('from', '==', this.getCurrentUserUID()),
        where('clubId', '==', this.clubService.getCurrentClubId())
      )
    );
    const tasks = querySnapshot.docs.map((doc) => doc.data());
    return tasks;
  }
  getCurrentUserUID() {
    const userInfoString = localStorage.getItem('currentUser');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo.uid;
  }
  async getCurrentUserRole() {
    const uid = this.getCurrentUserUID();
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
