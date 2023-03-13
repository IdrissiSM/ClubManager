import { Auth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  taskListSegment = "My_tasks";
  loaded !: boolean;
  statusModel = false;

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

  profil(){

  }

}
