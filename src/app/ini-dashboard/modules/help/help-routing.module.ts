import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewHelpComponent } from './view/view-help/view-help.component';
import { HelpComponent } from './help.component';
const routes: Routes = [
  {
    path: '',
    component: HelpComponent,
    children: [
      {
        path: 'view',
        component: ViewHelpComponent
      },
      { path: '', redirectTo: 'view', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/app/help/view', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule { }
