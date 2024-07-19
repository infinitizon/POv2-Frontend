import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { SharedModule } from '@app/_shared/shared.module';
import { HelpRoutingModule } from './help-routing.module';
import { ViewHelpComponent } from './view/view-help/view-help.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HelpRoutingModule
  ],
  declarations: [
    HelpComponent,
    ViewHelpComponent
  ]
})
export class HelpModule { }
