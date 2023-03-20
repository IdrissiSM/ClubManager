import { ClubService } from './../../services/club.service';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Club } from 'src/app/models/Club'
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-club',
  templateUrl: './create-club.page.html',
  styleUrls: ['./create-club.page.scss'],
})
export class CreateClubPage implements OnInit {

  createClubForm !: FormGroup
  newClub : Club = {
    code : "",
    name : "",
    description : "",
    category : "",
  }
  newClubLogo !: any
  newClubLogoDataUrl !: any

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private formBuilder : FormBuilder,
    private router : Router,
    private loadingController : LoadingController,
    private clubService : ClubService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.createClubForm = this.formBuilder.group({
      name : ['',[
        Validators.required
      ]],
      description : ['',[
        Validators.required
      ]],
      category : ['',[
        Validators.required
      ]],
    })
  }

  get name(){
    return this.createClubForm.controls['name'];
  }
  get description(){
    return this.createClubForm.controls['description'];
  }
  get category(){
    return this.createClubForm.controls['category'];
  }

  async insertClubLogo(){
    let sheet = await this.actionSheetCtrl.create({
      buttons:[
        {
          icon: 'camera',
          text: 'Take a picture ',
          handler: async () => {
            const capturedPhoto = await Camera.getPhoto({
              source: CameraSource.Camera,
              quality: 100,
              resultType: CameraResultType.DataUrl
            });
            this.newClubLogo = capturedPhoto
            this.newClubLogoDataUrl = capturedPhoto.dataUrl
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
              resultType: CameraResultType.DataUrl
            });
            this.newClubLogo = image
            this.newClubLogoDataUrl = image.dataUrl
          }
        },
        {
          icon: 'trash',
          text: 'remove ',
          handler: () => {
            this.newClubLogo = false
            this.newClubLogoDataUrl = false
          }
        }
      ]
    });
    await sheet.present();
  }


  async createClub(){
    let clubUid = uuidv4();
    let defaultLogoUrl = "../../assets/images/default.svg"

    this.newClub.code = clubUid;
    this.newClub.name = this.name.value;
    this.newClub.description = this.description.value;
    this.newClub.category = this.category.value;
    this.newClub.logoUrl = defaultLogoUrl;

    const loading = await this.loadingController.create({
      message: 'Creating Club...',
    });
    await loading.present()
    const isCreated = await this.clubService.createClub(this.newClub, this.newClubLogo)
    await loading.dismiss()
    if(isCreated){
      this.router.navigateByUrl("/tabs/home", {replaceUrl : true});
      const toast = await this.toastController.create({
        message: 'Club created successfully !',
        duration: 1500,
        icon: 'checkmark-circle'
      });
      await toast.present();
    }else{
      const toast = await this.toastController.create({
        message: 'Error : Creation failed, Please try again !',
        duration: 1500,
        icon: 'globe'
      });
      await toast.present();
    }
  }

  invalidTouchedDirtyFormControl(formControlName : string){
    return this.createClubForm.controls[formControlName]?.invalid &&
      (this.createClubForm.controls[formControlName]?.touched
        || this.createClubForm.controls[formControlName]?.dirty);
  }

}
