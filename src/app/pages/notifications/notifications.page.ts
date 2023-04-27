import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notifications: any[] = []

  constructor(private taskService : TaskService) { }

  async ngOnInit() {
    const tasksN = await this.taskService.getUserTaskNotifications()
    const meetingN = await this.taskService.getUserMeetingNotifications()
    this.notifications = tasksN.concat(meetingN);
    // this.notifications.sort((a, b) => a.date - b.date);
    console.log(this.notifications)
    this.notifications.forEach((n) => {
      if(!n.read){
        this.taskService.readNotification(n.id)
      }
    })
  }

  getElapsedTime(date: string): string {
    const createdDate = moment(date);
    const now = moment();
    const duration = moment.duration(now.diff(createdDate));

    const hours = duration.asHours();
    if (hours < 1) {
      const minutes = duration.asMinutes();
      return Math.round(minutes) + ' minutes ago';
    } else if (hours < 24) {
      return Math.round(hours) + ' hours ago';
    } else {
      const days = duration.asDays();
      return Math.round(days) + ' days ago';
    }
  }

}


