import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {

  taskListSegment = "My_tasks";
  loaded !: boolean;
  statusModel = false;

  customActionSheetOptions = {
    header: 'Filter tasks',
  };

  constructor(
    private router : Router,
    private auth : Auth,
    private authService : AuthService)
  { }

  ngOnInit() {
    this.loaded = true;
  }

  async logout(){
    await this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

}
