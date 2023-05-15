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
    const Tnotifications = await this.taskService.getUserTaskNotifications();
    const Mnotifications = await this.taskService.getUserMeetingNotifications();
    this.unread = Tnotifications.filter(Tnotification => !(Tnotification as any)['read']).length;
    if(this.unread == 0){
      this.unread = Mnotifications.filter(Mnotification => !(Mnotification as any)['read']).length;
    }
    if(await this.userService.getUserCell() == "Steering"){
      console.log(await this.userService.getUserCell())
      this.showMeeting = true
    }
  }


}
