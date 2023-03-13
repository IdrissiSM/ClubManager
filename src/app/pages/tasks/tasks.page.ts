import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {

  taskListSegment = "My_tasks";
  loaded !: boolean;
  statusModel = false;

  constructor() { }

  ngOnInit() {
    this.loaded = true;
  }

}
