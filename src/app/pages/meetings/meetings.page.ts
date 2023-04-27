import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarComponent, CalendarMode, Step } from 'ionic2-calendar';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {

  constructor(private meetingService: MeetingService,private modalController: ModalController){}

    allEvents: any[] = [];
  currentMonth!: string;
  calendar = {
    mode: 'month' as CalendarMode,
    step: 30 as Step,
    currentDate: new Date(),
  };
  newMeet = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  };
  @ViewChild(CalendarComponent, {}) myCal!: CalendarComponent;

  myData = [
    {
      title: 'What is Lorem Ipsum?',
      description: 'What is Lorem Ipsum?',
      startTime: new Date(2023, 3, 22, 12, 0, 0),
      endTime: new Date(2023, 3, 22, 14, 0, 0),
    },
    {
      title: 'What is Lorem Ipsum?',
      description: 'What is Lorem Ipsum?',
      startTime: new Date(2023, 3, 23, 12, 0, 0),
      endTime: new Date(2023, 3, 23, 14, 0, 0),
    },
  ];

  async ngOnInit(): Promise<void> {
    // this.allEvents = this.myData;
    console.log(new Date(2023, 3, 23, 14, 0, 0))
    this.meetingService.getMeetings().then(docs => {
      docs.forEach(doc => {
        this.allEvents.push({
          title: doc.data()['title'],
          description: doc.data()['description'],
          startTime: new Date(doc.data()['startDate']),
          endTime: new Date(doc.data()['endDate']),
          location: doc.data()['location']
        })
      })
      console.log(this.allEvents)
    })
  }
  onViewTitleChanged(title: string) {
    this.currentMonth = title;
  }
  async onEventSelected(ev: any) {
    this.newMeet = ev;
  }
  back() {
    this.myCal.slidePrev();
  }
  next() {
    this.myCal.slideNext();
  }
}
