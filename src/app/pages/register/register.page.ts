import { AuthService } from './../../services/auth.service';
import { User } from '../../models/User';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    private formBuilder : FormBuilder,
    private router : Router,
    private loadingController : LoadingController,
    private toastController: ToastController,
    private authService : AuthService)
  { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
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

  registerForm !: FormGroup
  newUser : User = {
    fullname : '',
    email : '',
    phone : '',
    password : ''
  };
  passwordFieldType = 'password'
  passwordIcon = 'eye'

  get fullname(){
    return this.registerForm.controls['fullname'];
  }
  get email(){
    return this.registerForm.controls['email'];
  }
  get phone(){
    return this.registerForm.controls['phone'];
  }
  get password(){
    return this.registerForm.controls['password'];
  }
  get repeatPassword(){
    return this.registerForm.controls['repeatPassword'];
  }

  async register(){
    this.newUser.fullname = this.fullname.value
    this.newUser.email = this.email.value
    this.newUser.phone = this.phone.value
    this.newUser.password = this.password.value

    const loading = await this.loadingController.create({
      message: 'Creating account...',
    });
    await loading.present()
    const user = await this.authService.register(this.newUser)
    await loading.dismiss()
    if(user){
      this.router.navigateByUrl("/login", {replaceUrl : true});
    }else{
      const toast = await this.toastController.create({
        message: 'Error : Registration failed, Please try again !',
        duration: 1500,
        icon: 'globe'
      });
      await toast.present();
    }
  }

  invalidTouchedDirtyFormControl(formControlName : string){
    return this.registerForm.controls[formControlName]?.invalid &&
      (this.registerForm.controls[formControlName]?.touched
        || this.registerForm.controls[formControlName]?.dirty);
  }

  toggleShowPassword(){
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye' ? 'eye-off' : 'eye';
  }
}
