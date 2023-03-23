import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm !: FormGroup
  passwordFieldType = 'password';
  passwordIcon = 'eye';

  constructor(
    private formBuilder : FormBuilder,
    private router : Router,
    private loadingController : LoadingController,
    private toastController: ToastController,
    private authService : AuthService)
  { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email : ['',[
        Validators.email,
        Validators.required
      ]],
      password : ['',[
        Validators.required
      ]]
    })
  }

  get email(){
    return this.loginForm.controls['email'];
  }
  get password(){
    return this.loginForm.controls['password'];
  }

  async login(){
    const loading = await this.loadingController.create({
      message: 'Logging in...',
    });
    await loading.present();

    const user = await this.authService.login(this.email.value, this.password.value)
    await loading.dismiss()

    if(user){
      this.router.navigateByUrl("/home", {replaceUrl : true});
    }else{
      const toast = await this.toastController.create({
        message: 'Error : Login failed, Please try again !',
        duration: 1500,
        icon: 'globe'
      });
      await toast.present();
    }
  }

  logout(){
    this.authService.logout()
  }


  invalidTouchedDirtyFormControl(formControlName : string){
    return this.loginForm.controls[formControlName]?.invalid &&
      (this.loginForm.controls[formControlName]?.touched
        || this.loginForm.controls[formControlName]?.dirty);
  }


  toggleShowPassword(){
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye' ? 'eye-off' : 'eye';
  }

}
