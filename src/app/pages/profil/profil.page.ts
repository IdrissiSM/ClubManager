import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    private authService : AuthService,
    private actionSheetCtrl: ActionSheetController
  ) { }

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

  editFullname : boolean = false;
  editEmail : boolean = false;
  editPhone : boolean = false;
  editInput(inputName : string){
    if(inputName === "fullname"){
      this.editFullname = ! this.editFullname;
    }else if(inputName === "email"){
      this.editEmail = ! this.editEmail;
    }if(inputName === "phone"){
      this.editPhone = ! this.editPhone;
    }
  }


  async modifyProfile(){
    let sheet = await this.actionSheetCtrl.create({
      buttons:[
        {
          icon: 'camera',
          text: 'Take a picture ',
          handler: async () => {
            const capturedPhoto = await Camera.getPhoto({
              resultType: CameraResultType.Uri,
              source: CameraSource.Camera,
              quality: 100
            });
          }
        },
        {
          icon: 'images',
          text: 'Choose from gallery',
          handler: async () => {
            const image = await Camera.getPhoto({
              source: CameraSource.Photos,
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.Uri
            });
            console.log(image);
          }
        },
        {
          icon: 'trash',
          text: 'remove ',
          handler: () => {

          }
        }
      ]
    });
    await sheet.present();
  }

}
