import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private router : Router,
    private authService : AuthService,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private navCtrl: NavController
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
  }

  async logout(){
    await this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

}
