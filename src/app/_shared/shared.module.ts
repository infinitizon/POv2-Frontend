import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DurationFormatPipe } from './pipes/duration-format.pipe';
import { SafeHtml } from './pipes/safe-html.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './third-party/material.module';
import { BackbuttonComponent } from './components/backbutton/backbutton.component';
import { SuccessfulPageComponent } from '../ini-website/auth/successful-page/successful-page.component';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { SnackBarComponent } from './components/snack-bar/snack-bar.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GatewayComponent } from './dialogs/gateway/gateway.component';
import { GetStartedComponent } from './dialogs/get-started/get-started.component';
import { LinkCscsComponent } from './dialogs/link-cscs/link-cscs.component';
import { ProfileSelectComponent } from './dialogs/profile-select/profile-select.component';
import { GetRolesComponent } from './components/get-roles/get-roles.component';
import { LogoutDialogComponent } from './dialogs/logout-dialog/logout-dialog.component';
import { LoaderComponent } from './components/loader/loader.component';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask'
import { Loader2Component } from './components/loader_2/loader.component';
import { ActivateEmailComponent } from './dialogs/activate-email/activate-email.component';
import { ConfirmEmailComponent } from './dialogs/confirm-email/confirm-email.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddBanksComponent } from './dialogs/add-banks/add-banks.component';
import { RightGatewayComponent } from './dialogs/right-gateway/right-gateway.component';
import { RightNoticeComponent } from './dialogs/right-notice/right-notice.component';
import { PaymentPartnerComponent } from './dialogs/payment-partner/payment-partner.component';
import { RenouceRightsComponent } from './dialogs/renouce-rights/renouce-rights.component';
import { AvailableOfferingComponent } from './dialogs/available-offering/available-offering.component';
import { EmailAsteriskPipe } from './pipes/email-asterisk';
import { OtpDialogComponent } from './dialogs/otp-dialog/otp-dialog.component';
import { BvnKycComponent } from './dialogs/bvn-kyc/bvn-kyc.component';
import { ValidateAccountComponent } from './dialogs/validate-account/validate-account.component';
import { ValidateChnCscsOfferComponent } from './dialogs/validate-chn-cscs-offer/validate-chn-cscs-offer.component';


const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'MMM DD, YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};


@NgModule({
  declarations: [
    DurationFormatPipe,
    SafeHtml,
    BackbuttonComponent,
    SnackBarComponent,
    GatewayComponent,
    GetStartedComponent,
    LinkCscsComponent,
    ProfileSelectComponent,
    GetRolesComponent,
    LogoutDialogComponent,
    LoaderComponent,
    EmptyStateComponent,
    Loader2Component,
    ActivateEmailComponent,
    ConfirmEmailComponent,
    AddBanksComponent,
    RightGatewayComponent,
    RightNoticeComponent,
    PaymentPartnerComponent,
    RenouceRightsComponent,
    AvailableOfferingComponent,
    EmailAsteriskPipe,
    OtpDialogComponent,
    BvnKycComponent,
    ValidateAccountComponent,
    ValidateChnCscsOfferComponent

  ],
  providers: [
    provideNgxMask()
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMatIntlTelInputComponent,
    NgxOtpInputModule,
    NgApexchartsModule,
    FileUploadModule,
    NgxMaskDirective, NgxMaskPipe,
    NgSelectModule,

  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule,
    DurationFormatPipe, SafeHtml,
    MaterialModule,
    BackbuttonComponent,
    NgxMatIntlTelInputComponent,
    NgxOtpInputModule,
    SnackBarComponent,
    NgApexchartsModule,
    GatewayComponent,
    GetStartedComponent,
    LinkCscsComponent,
    ProfileSelectComponent,
    GetRolesComponent,
    LogoutDialogComponent,
    LoaderComponent,
    FileUploadModule,
    EmptyStateComponent,
    NgxMaskDirective, NgxMaskPipe,
    Loader2Component,
    ActivateEmailComponent,
    ConfirmEmailComponent,
    NgSelectModule,
    AddBanksComponent,
    RightGatewayComponent,
    RightNoticeComponent,
    PaymentPartnerComponent,
    RenouceRightsComponent,
    AvailableOfferingComponent,
    EmailAsteriskPipe,
    OtpDialogComponent,
    BvnKycComponent,
    ValidateAccountComponent,
    ValidateChnCscsOfferComponent
  ]
})
export class SharedModule { }
