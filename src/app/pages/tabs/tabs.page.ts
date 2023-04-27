import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  unread = 0
  showMeeting = false
  // schedule a meeting

  constructor(private taskService: TaskService, private userService: UserService) { }

  async ngOnInit() {
    const notifications = await this.taskService.getUserTaskNotifications();
    this.unread = notifications.filter(notification => !(notification as any)['read']).length;
    if(await this.userService.getUserCell() == "Steering"){
      this.showMeeting = true
    }
  }


}
