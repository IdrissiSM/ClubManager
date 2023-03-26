import { UserService } from './../../services/user.service';
import { User } from 'src/app/models/User';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActionSheetController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {

  loading : boolean = true;
  editForm !: FormGroup
  currentUser !: any
  userInfo : User = {
    fullname: '',
    email: '',
    phone: '',
    password: ''
  }

  constructor(
    private router : Router,
    private authService : AuthService,
    private actionSheetCtrl: ActionSheetController,
    private formBuilder : FormBuilder,
    private loadingController : LoadingController,
    private userService : UserService,
    private toastController : ToastController,
    private alertController : AlertController
  ) { }

  ngOnInit() {
    const currentUser = localStorage.getItem("currentUser")
    this.currentUser = currentUser ? JSON.parse(currentUser) : null;
    this.getUserPhotoUrl()

    // edit form :
    this.editForm = this.formBuilder.group({
      fullname : [this.currentUser.fullname,[
        Validators.required
      ]],
      email : [this.currentUser.email,[
        Validators.required,
        Validators.email
      ]],
      phone : [this.currentUser.phone,[
        Validators.required,
        Validators.pattern('[- +()0-9]+')
      ]],
    })
  }

  get fullname(){
    return this.editForm.controls['fullname'];
  }
  get email(){
    return this.editForm.controls['email'];
  }
  get phone(){
    return this.editForm.controls['phone'];
  }

  backToHome(){
    this.router.navigateByUrl("/home",{replaceUrl : true})
  }

  userPhotoUrl !: string
  getUserPhotoUrl(){
    this.userPhotoUrl = this.currentUser.photoUrl === "" ? '../../assets/images/profile.svg' : this.currentUser.photoUrl
  }

  async saveUserInfo(){
    let defaultLogoUrl = "../../assets/images/profile.svg"
    this.userInfo.fullname = this.fullname.value
    this.userInfo.email = this.email.value
    this.userInfo.phone = this.phone.value
    this.userInfo.photoUrl = defaultLogoUrl

    const loading = await this.loadingController.create({
      message: 'updating...',
    });
    await loading.present()
    const isCreated = await this.userService.saveUserInfo(this.currentUser.uid,this.newProfilLogo,this.userInfo)
    await loading.dismiss()
    if(isCreated){
      await this.router.navigateByUrl("/profil", {replaceUrl : true});
      const toast = await this.toastController.create({
        message: 'profil information updated successfully !',
        duration: 2000,
        icon: 'checkmark-circle'
      });
      await toast.present();
    }else{
      const toast = await this.toastController.create({
        message: 'Error : update failed, Please try again !',
        duration: 1500,
        icon: 'globe'
      });
      await toast.present();
    }
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

  newProfilLogo : any
  newProfilLogoDataUrl : any
  async insertProfilLogo(){
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
            this.newProfilLogo = capturedPhoto
            this.newProfilLogoDataUrl = capturedPhoto.dataUrl
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
            this.newProfilLogo = image
            this.newProfilLogoDataUrl = image.dataUrl
          }
        },
        {
          icon: 'trash',
          text: 'remove ',
          handler: () => {
            this.newProfilLogo = false
            this.newProfilLogoDataUrl = false
          }
        }
      ]
    });
    await sheet.present();
  }

  async deleteUserPhoto(){
    const alert = await this.alertController.create({
      header: `Are you sure you want to delete your profil photo ?`,
      buttons: [
        {
          text: 'Yes',
          handler : async () => {
            if(await this.userService.deleteUserPhoto(this.currentUser.uid)){
              const toast = await this.toastController.create({
                message: 'Profil photo deleted !',
                duration: 2000,
                icon: 'checkmark-circle'
              });
              await toast.present();
              this.currentUser.photoUrl = ""
              this.currentUser.photoPath = ""
              console.log(this.currentUser)
              localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
              this.getUserPhotoUrl()
            }
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

  invalidTouchedDirtyFormControl(formControlName : string){
    return this.editForm.controls[formControlName]?.invalid &&
      (this.editForm.controls[formControlName]?.touched
        || this.editForm.controls[formControlName]?.dirty);
  }


  logout(){
    localStorage.removeItem('currentMember');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentClub');
    this.authService.logout()
    this.router.navigateByUrl("/welcome",{replaceUrl : true})
  }
}
