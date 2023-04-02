import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
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
  rating: number = 3;
  stars: any[] = new Array(5);

  constructor(
    private router : Router,
    private taskSrevice: TaskService,
    private auth : Auth,
    private authService : AuthService)
  { }

  review(i: number) {
    this.rating = i + 1;
  }

  customActionSheetOptions = {
    header: 'Filter tasks',
  };

  async ngOnInit() {
    this.tasks = await this.taskSrevice.getUserTasks();
    this.assignedTasks = await this.taskSrevice.getUserAssignedTasks();
    this.loaded = false;
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
