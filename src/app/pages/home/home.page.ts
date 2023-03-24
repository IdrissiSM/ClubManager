import { Member } from './../../models/Member';
import { ClubService } from './../../services/club.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, NavController, LoadingController, ToastController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  Clubs !: any
  searchClubs !: any

  constructor(
    private router : Router,
    private authService : AuthService,
    private loadingController : LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private navCtrl: NavController,
    private clubService : ClubService,
    private clipboard: Clipboard,
    private toastController : ToastController,
    private popoverController : PopoverController
    )
  { }

  currentUser : any

  ngOnInit() {
    const currentUser = localStorage.getItem("currentUser")
    this.currentUser = currentUser ? JSON.parse(currentUser) : null;
    this.getUserClubs()
  }

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
                  name: 'ClubCodeToJoin',
                  placeholder: 'Code',
                  attributes: {
                    mode: 'ios'
                  }
                }
              ],
              buttons: [
                {
                  text: 'Join',
                  handler : async (data) => {
                    this.joinClubByCode(data.ClubCodeToJoin)
                  }
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

  async joinClubByCode(code : string){
    if(await this.clubService.joinClubByCode(code)){
      await this.getUserClubs()
    }
  }

  async copyClubCode(code : string, name : string){
    await this.popoverController.dismiss()
    const alert = await this.alertController.create({
      header: `Code to join ${name}`,
      inputs: [
        {
          type: 'text',
          placeholder: 'Code',
          value : code,
          attributes: {
            mode: 'ios'
          }
        }
      ],
      buttons: [
        {
          text: 'Copy',
          handler : async () => {
            this.clipboard.copy(code)
            const toast = await this.toastController.create({
              message: code + ' copied',
              duration: 1500,
              icon: 'copy'
            });
            await toast.present();
          }
        }
      ],
    });
    await alert.present();
  }

  currentMember !: Member
  async getCurrentMemeber(idClub : string){
    await this.clubService.getMemberByClubIdAndUserId(this.currentUser.uid,idClub).then((member)=>{
      this.currentMember = member
    })
  }

  async clubDetails(currentClub : any){
    await this.getCurrentMemeber(currentClub.id)
    this.router.navigateByUrl("/tabs",{replaceUrl : true})
    localStorage.setItem('currentClub', JSON.stringify(currentClub));
    localStorage.setItem('currentMember', JSON.stringify(this.currentMember));
  }

  logout(){
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentClub');
    this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }

  async getUserClubs(){
    const loading = await this.loadingController.create({
      message: 'loading...',
    });
    await loading.present();
    const clubs = await this.clubService.getUserClubs()
    this.searchClubs = this.Clubs = clubs
    await loading.dismiss()
  }

  async leaveClub(name : string, id : string){
    await this.popoverController.dismiss();
    const alert = await this.alertController.create({
      header: `Are you sure you want leave ${name} ?`,
      buttons: [
        {
          text: 'Yes',
          handler : async () => {
            await this.clubService.leaveClub(id)
            await this.alertController.dismiss();
            await this.getUserClubs()
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ],
    });
    await alert.present();
  }

  searchClubText !: string;
  searchClub(){
    this.searchClubs = this.Clubs.filter((club: { name: string; }) => club.name.toLowerCase().includes(this.searchClubText.toLowerCase()))
  }

  async deleteClub(id : string, name : string){
    await this.popoverController.dismiss();
    const alert = await this.alertController.create({
      header: `Are you sure you want delete ${name} ?`,
      buttons: [
        {
          text: 'Yes',
          handler : async () => {
            await this.clubService.deleteClub(id)
            await this.alertController.dismiss();
            await this.getUserClubs()
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ],
    });
    await alert.present();
  }

}
