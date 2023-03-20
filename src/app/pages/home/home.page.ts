import { ClubService } from './../../services/club.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  Clubs !: any

  constructor(
    private router : Router,
    private authService : AuthService,
    private loadingController : LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private clubService : ClubService
    )
  { }

  async createClub(){
    let sheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          icon: 'add-circle-outline',
          text: 'Create club',
          handler: () => {
            this.navCtrl.navigateForward('/create-club');
          }
        },
        {
          icon: 'people-outline',
          text: 'Join club',
          handler: async () => {
            const alert = await this.alertController.create({
              header: 'Join a club',
              subHeader: 'Enter club code :',
              inputs: [
                {
                  type: 'text',
                  placeholder: 'Code',
                  attributes: {
                    mode: 'ios'
                  }
                }
              ],
              buttons: [
                {
                  text: 'Join',
                }
              ],
            });
            await alert.present();
          }
        }
      ]
    });
    await sheet.present();
  }

  ngOnInit() {
    this.getUserClubs()
  }

  async logout(){
    await this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

  async getUserClubs(){
    const loading = await this.loadingController.create({
      message: 'loading...',
    });
    await loading.present();
    this.Clubs = await this.clubService.getUserClubs()
    await loading.dismiss()
  }

}
