import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { MemberService } from 'src/app/services/member.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {

  tasks: any[] = []
  assignedTasks: any[] = []
  taskListSegment = "My_tasks";
  loaded : boolean = true;
  statusModel = false;
  stars: any[] = new Array(5);
  userRole: string = "";

  constructor(
    private router : Router,
    private taskService: TaskService,
    private memberService: MemberService,
    private auth : Auth,
    private authService : AuthService,
    private alertController: AlertController,
    private popoverController: PopoverController)
  { }

  async review(taskId: string, i: number) {
    this.taskService.updateTaskRating(taskId, i+1)
    this.tasks = await this.taskService.getUserTasks();
  }

  customActionSheetOptions = {
    header: 'Filter tasks',
  };

  async ngOnInit() {
    this.userRole = await this.taskService.getCurrentUserRole()
    if(this.userRole === 'admin'){
      this.taskListSegment = 'Assigned_tasks'
    }
    this.tasks = await this.taskService.getUserTasks();
    this.assignedTasks = await this.taskService.getUserAssignedTasks();
    this.loaded = false;
  }
  async changeStatus(taskId: any, taskStatus: any) {
    const alert = await this.alertController.create({
      header: 'Change Task Status',
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Pending',
          value: 'Pending',
          checked: taskStatus == "Pending"
        },
        {
          name: 'status',
          type: 'radio',
          label: 'In progress',
          value: 'In progress',
          checked: taskStatus == "In progress"
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Completed',
          value: 'Completed',
          checked: taskStatus == "Completed"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            this.taskService.updateTaskStatus(taskId, data);
            this.tasks = await this.taskService.getUserTasks();
            const popover = await this.popoverController.getTop();
            if (popover) {
              popover.dismiss();
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  backToHome(){
    localStorage.removeItem('currentClub');
    this.router.navigateByUrl("/home",{replaceUrl : true})
  }

  async logout(){
    await this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }
}
