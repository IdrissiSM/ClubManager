import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, where, query, getDocs, getDoc, getCountFromServer, orderBy, updateDoc } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes, deleteObject, StorageReference  } from '@angular/fire/storage';
import { Task } from '../Models/Task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private firestore: Firestore) { }

  async createTask(newTask : Task){
    try{
      const TasksCollectionInstance = collection(this.firestore,'tasks');
      await addDoc(TasksCollectionInstance,{
        title : newTask.title,
        description : newTask.description,
        from : newTask.from,
        to : newTask.to,
        deadline: newTask.deadline,
        status: newTask.status,
        rating: newTask.rating,
      })
      return true;
    }
    catch(error){
      return true;
    }
  }

  async getUserTasks(){
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(query(tasksRef, where('to', '==', this.getCurrentUserUID())));
    const tasks = querySnapshot.docs.map(doc => {
      const taskData = doc.data();
      const taskId = doc.id;
      return { id: taskId, ...taskData };
    });
    return tasks;
  }
  async getUserAssignedTasks(){
    const tasksRef = collection(this.firestore, 'tasks');
    const querySnapshot = await getDocs(query(tasksRef, where('from', '==', this.getCurrentUserUID())));
    const tasks = querySnapshot.docs.map(doc => doc.data())
    return tasks;
  }

  getCurrentUserUID(){
    const userInfoString = localStorage.getItem("currentUser");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    return userInfo.uid
  }
  async getCurrentUserRole(){
    const uid = this.getCurrentUserUID();
    const membersRef = collection(this.firestore, 'members');
    const querySnapshot = await getDocs(query(membersRef, where('idUser', '==',uid)));
    const userData = querySnapshot.docs[0].data()['role']
    console.log(userData)
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
}
