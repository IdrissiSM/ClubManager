import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { CreateClubPageRoutingModule } from './create-club-routing.module';

import { CreateClubPage } from './create-club.page';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {HttpClientModule} from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule,
    CreateClubPageRoutingModule
  ],
  declarations: [CreateClubPage]
})
export class CreateClubPageModule {}
