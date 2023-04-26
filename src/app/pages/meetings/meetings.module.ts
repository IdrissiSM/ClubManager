import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingsPageRoutingModule } from './meetings-routing.module';

import { MeetingsPage } from './meetings.page';
import { NgCalendarModule  } from 'ionic2-calendar';


@NgModule({
  imports: [
    NgCalendarModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingsPageRoutingModule
  ],
  declarations: [MeetingsPage]
})
export class MeetingsPageModule {}
