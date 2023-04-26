import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  unread = 0
  userRole = ""
  // schedule a meeting

  constructor(private taskService: TaskService) { }

  async ngOnInit() {
    const notifications = await this.taskService.getUserTaskNotifications();
    this.unread = notifications.filter(notification => !(notification as any)['read']).length;
    this.userRole = await this.taskService.getCurrentUserRole()
  }


}
