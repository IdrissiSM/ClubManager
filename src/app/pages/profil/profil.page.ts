import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {

  loading : boolean = true;

  constructor(
    private router : Router,
    private auth : Auth,
    private authService : AuthService)
  { }

  ngOnInit() {
  }

  async logout(){
    await this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

  getAllUsers(){
    this.authService.getAllUsers().subscribe( (data) => {
      console.log(data)
    })
  }

}
