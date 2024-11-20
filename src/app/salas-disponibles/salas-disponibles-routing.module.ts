import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalasDisponiblesPage } from './salas-disponibles.page';

const routes: Routes = [
  {
    path: '',
    component: SalasDisponiblesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalasDisponiblesPageRoutingModule {}
