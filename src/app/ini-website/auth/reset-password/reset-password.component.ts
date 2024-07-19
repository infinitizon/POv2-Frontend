import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './reset-password.validators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, take } from 'rxjs';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { AuthService } from '@app/_shared/services/auth.service';
import { Crypto } from '@app/_shared/classes/Crypto';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  resetPasswordForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  submitting: boolean = false;

  email: string = '';
  emailSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private authService: AuthService
    ) { }

  ngOnInit() {

    this.resetPasswordForm = this.fb.group({
      token: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.commonServices.regexValidator(
            new RegExp(this.commonServices.oneDigit),
            { oneDigit: '' }
          ),
          this.commonServices.regexValidator(
            new RegExp(this.commonServices.oneLowerCase),
            { oneLowerCase: '' }
          ),
          this.commonServices.regexValidator(
            new RegExp(this.commonServices.oneUpperCase),
            { oneUpperCase: '' }
          ),
          this.commonServices.regexValidator(
            new RegExp(this.commonServices.specialChar),
            { specialChar: '' }
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.commonServices.mustMatch('password', 'confirmPassword') });

    this.emailSub = this.authService.emailData().subscribe(
      (data: any) => {
         this.email = data.email;
      }
    )
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  clearPassword(field: string) {
    this.resetPasswordForm.get(field)?.patchValue('')
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.resetPasswordForm.get(ctrlName) as FormControl);
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control: any) => {
      Object.keys(this.errors[control]).forEach((error: any) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      })
    });
  }

  onSubmit() {
    const fd = JSON.parse(JSON.stringify(this.resetPasswordForm.value));
    const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);

    fd.password = encrypted;
    fd.email = this.email;
    fd.token = String(fd.token);
    delete fd.confirmPassword;
    this.submitting = true;
    this.http
      .post(`${environment.baseApiUrl}/auth/reset-password`, fd)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          this.successSnackBar(response?.message);
          this.router.navigate(['/auth/reset-password-successful']);
        },
        (errResp) => {
          this.submitting = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }

  successSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['success'],
    });
  }

  ngOnDestroy(): void {
      this.emailSub.unsubscribe();
  }
}
