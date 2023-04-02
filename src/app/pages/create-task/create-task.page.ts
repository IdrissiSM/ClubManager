import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task } from 'src/app/Models/Task';
import { LoadingController, ToastController } from '@ionic/angular';
import { TaskService } from 'src/app/services/task.service';
import { Router } from '@angular/router';
import { MemberService } from 'src/app/services/member.service';
import { Member } from 'src/app/models/Member';
import { ClubService } from 'src/app/services/club.service';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.page.html',
  styleUrls: ['./create-task.page.scss'],
})
export class CreateTaskPage implements OnInit {

  members: any[] = [];
  // dateExample = new Date().toISOString();
  constructor(
    private taskService: TaskService,
    private memberService: MemberService,
    private clubService: ClubService,
    private loadingController: LoadingController,
    private router: Router,
    private toastController: ToastController,
  ) { }

  async ngOnInit() {
    this.members = await this.memberService.getMembers();
  }
  createTaskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    member: new FormControl('', Validators.required),
    deadline: new FormControl('', Validators.required),
  })

  async createTask(){
    const newTask: Task = {
      title: this.createTaskForm.get("title")?.value || "",
      description: this.createTaskForm.get("description")?.value || "",
      from: this.clubService.getCurrentUserUID(),
      to: this.createTaskForm.get("member")?.value || "",
      deadline: this.createTaskForm.get("deadline")?.value || "",
      status: "pending",
      rating: 0
    }

    const loading = await this.loadingController.create({
      message: 'Creating Task...',
    });
    await loading.present()
    const isCreated = await this.taskService.createTask(newTask)
    await loading.dismiss()
    if(isCreated){
      await this.router.navigateByUrl("/**", {replaceUrl : true});
      const toast = await this.toastController.create({
        message: 'Task created successfully !',
        duration: 1500,
        icon: 'checkmark-circle'
      });
      await toast.present();
    }else{
      const toast = await this.toastController.create({
        message: 'Error : Creation failed, Please try again !',
        duration: 1500,
        icon: 'globe'
      });
      await toast.present();
    }
  }
}
