import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QRcodePageRoutingModule } from './qrcode-routing.module';
import { QrCodeModule } from 'ng-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { QRcodePage } from './qrcode.page';


@NgModule({
  imports: [
    CommonModule,
    QrCodeModule,
    FormsModule,
    IonicModule,
    QRcodePageRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [QRcodePage]
})
export class QRcodePageModule {}
