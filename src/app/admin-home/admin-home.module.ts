import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminHomePageRoutingModule } from './admin-home-routing.module';

import { QrCodeModule } from 'ng-qrcode';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';

import { AdminHomePage } from './admin-home.page';

@NgModule({
  imports: [
    CommonModule,
    QrCodeModule,
    FormsModule,
    IonicModule,
    AdminHomePageRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AdminHomePage,BarcodeScanningModalComponent]
})
export class AdminHomePageModule {}
