import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { QrCodeModule } from 'ng-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';


@NgModule({
  imports: [
    CommonModule,
    QrCodeModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [HomePage,BarcodeScanningModalComponent]
})
export class HomePageModule {}
