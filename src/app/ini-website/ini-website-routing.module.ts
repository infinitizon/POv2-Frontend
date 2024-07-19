import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignUpContinueComponent } from './auth/sign-up-continue/sign-up-continue.component';
import { SuccessfulPageComponent } from './auth/successful-page/successful-page.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { GetInTouchComponent } from './auth/get-in-touch/get-in-touch.component';
import { TermsComponent } from './auth/terms/terms.component';
import { HomePageComponent } from './auth/home-page/home-page.component';
import { PrivacyComponent } from './auth/privacy/privacy.component';


const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'signup-continue', component: SignUpContinueComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'reset-password-successful', component: SuccessfulPageComponent},
      { path: 'verify-otp', component: VerifyOtpComponent},
      { path: 'get-in-touch', component: GetInTouchComponent},
      { path: 'terms', component: TermsComponent},
      { path: 'privacy-policy', component: PrivacyComponent},
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniWebsiteRoutingModule { }
