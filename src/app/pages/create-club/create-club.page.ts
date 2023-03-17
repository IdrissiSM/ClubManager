import { Component, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Club } from 'src/app/models/Club'

@Component({
  selector: 'app-create-club',
  templateUrl: './create-club.page.html',
  styleUrls: ['./create-club.page.scss'],
})
export class CreateClubPage implements OnInit {

  createClubForm !: FormGroup
  newClub !: Club

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private formBuilder : FormBuilder,
    private router : Router,
    private loadingController : LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.createClubForm = this.formBuilder.group({
      fullname : ['',[
        Validators.required
      ]],
      email : ['',[
        Validators.required,
        Validators.email
      ]],
      phone : ['',[
        Validators.required,
        Validators.pattern('[- +()0-9]+')
      ]],
      password : ['',[
        Validators.required,
        // At least 8 characters in length Lowercase letters Uppercase letters Numbers Special characters.
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
      ]],
      repeatPassword : ['',[
        Validators.required
      ]]
    })
  }

  get name(){
    return this.createClubForm.controls['name'];
  }
  get description(){
    return this.createClubForm.controls['description'];
  }

  async insertClubLogo(){
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

  invalidTouchedDirtyFormControl(formControlName : string){
    return this.createClubForm.controls[formControlName]?.invalid &&
      (this.createClubForm.controls[formControlName]?.touched
        || this.createClubForm.controls[formControlName]?.dirty);
  }

}
