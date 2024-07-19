import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { ViewHomeComponent } from './view/view-home/view-home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'view',
        component: ViewHomeComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/home/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
