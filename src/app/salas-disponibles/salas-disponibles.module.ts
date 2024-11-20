import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SalasDisponiblesPageRoutingModule } from './salas-disponibles-routing.module';

import { SalasDisponiblesPage } from './salas-disponibles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalasDisponiblesPageRoutingModule
  ],
  declarations: [SalasDisponiblesPage]
})
export class SalasDisponiblesPageModule {}
