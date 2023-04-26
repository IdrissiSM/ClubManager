import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Meeting } from 'src/app/Models/meeting';
import { ClubService } from 'src/app/services/club.service';
import { MeetingService } from 'src/app/services/meeting.service';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.page.html',
  styleUrls: ['./create-meeting.page.scss'],
})
export class CreateMeetingPage implements OnInit {
  members: any[] = [];
  userRole: string = '';
  now!: string;
  after1hour!: string;
  createMeetingForm!: FormGroup

  constructor(
    private meetingService: MeetingService,
    private clubService: ClubService,
    private loadingController: LoadingController,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    let today = new Date();
    this.now = today.toISOString();
    today.setHours(today.getHours() + 1);
    this.after1hour = today.toISOString();
    console.log(this.now);
    console.log(this.after1hour);

    this.createMeetingForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      startDate: new FormControl(this.now, Validators.required),
      endDate: new FormControl(this.after1hour, Validators.required),
      location: new FormControl('', Validators.required),
    });
  }

  async createMeeting() {
    const newMeeting: Meeting = {
      title: this.createMeetingForm.get('title')?.value || '',
      description: this.createMeetingForm.get('description')?.value || '',
      startDate: this.createMeetingForm.get('startDate')?.value || '',
      endDate: this.createMeetingForm.get('endDate')?.value || '',
      location: this.createMeetingForm.get('location')?.value || '',
    };

    const loading = await this.loadingController.create({
      message: 'Creating Meeting...',
    });
    await loading.present();
    const MCreated = await this.meetingService.createMeeting(newMeeting)
    const NCreated = await this.meetingService.createMeetingNotification(newMeeting.startDate, newMeeting.endDate, newMeeting.location)
    await loading.dismiss();
    if(MCreated && NCreated){
      await this.router.navigateByUrl("/tabs/meetings", {replaceUrl : true});
      const toast = await this.toastController.create({
        message: 'Meeting created successfully !',
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
}
