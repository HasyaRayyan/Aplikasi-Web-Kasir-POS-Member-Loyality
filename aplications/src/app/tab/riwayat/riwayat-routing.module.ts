import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RiwayatPage } from './riwayat.page';

const routes: Routes = [
  {
    path: '',
    component: RiwayatPage, // Komponen langsung digunakan di sini
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RiwayatPageRoutingModule {}
