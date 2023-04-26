import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent, CalendarMode, Step } from 'ionic2-calendar';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {
  allEvents!: any[];
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

  ngOnInit(): void {
    this.allEvents = this.myData;
  }
  onViewTitleChanged(title: string) {
    this.currentMonth = title;
  }
  onEventSelected(ev: any) {
    this.newMeet = ev;
  }
  back() {
    this.myCal.slidePrev();
  }
  next() {
    this.myCal.slideNext();
  }
}
