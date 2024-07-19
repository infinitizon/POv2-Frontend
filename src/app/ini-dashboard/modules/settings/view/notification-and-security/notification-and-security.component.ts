import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import {
  FormErrors,
  ValidationMessages,
} from './notification-and-security.validators';
import { Crypto } from '@app/_shared/classes/Crypto';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@app/_shared/services/auth.service';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { User } from '@app/_shared/models/user-model';

@Component({
  selector: 'app-notification-and-security',
  templateUrl: './notification-and-security.component.html',
  styleUrls: ['./notification-and-security.component.scss'],
})
export class NotificationAndSecurityComponent implements OnInit {
  enableN: boolean = false;
  enableT: boolean = false;

  showPassword: boolean = false;

  resetPasswordForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  submitting = false;
  userInformation!: User;

  constructor(
    private fb: FormBuilder,
    private commonServices: CommonService,
    private http: HttpClient,
    private auth: AuthService,
    private _snackBar: MatSnackBar,
    public appContext: ApplicationContextService,
    ) {}

  ngOnInit() {
    this.appContext
    .getUserInformation()
    .subscribe({
      next: (data: User) => {
        this.userInformation = data;
        this.enableT = this.userInformation?.twoFactorAuth;

      },
    });

    this.resetPasswordForm = this.fb.group(
      {
        oldPassword: ['',    Validators.required],
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
      {
        validators: this.commonServices.mustMatch(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  enableNotify() {
    this.enableN = !this.enableN;
  }

  enable2Factor() {
    this.enableT = !this.enableT;
    const fd = {
      // email: this.userInformation.email,
      enable2fa: this.enableT
    };
    this.http.post(`${environment.baseApiUrl}/auth/set-2FA`,  fd)
    .subscribe((response: any) => {
      this.submitting = false;
      // this.commonServices.showLoading(this.submitButton.nativeElement);
      this.successSnackBar(response?.message);
    },
    errResp => {
       this.submitting = false;
      this.openSnackBar(errResp?.error?.error.message,);
    });
  }

  expandPassword() {
    this.showPassword = !this.showPassword;
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  clearPassword(field: string) {
    this.resetPasswordForm.get(field)?.patchValue('');
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.resetPasswordForm.get(ctrlName) as FormControl
    );
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
      });
    });
  }

  submit(): void {
    this.submitting = true;
    if (this.resetPasswordForm.invalid) {
          this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
          this.errors = this.commonServices.findInvalidControlsRecursive(this.resetPasswordForm);
          this.displayErrors();
        this.submitting = false;
          // this.commonServices.removeLoading(this.submitButton.nativeElement);
          return;
        }
    const fd = {
      oldPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('oldPassword').value),
      newPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('password').value),
      // confirmNewPassword: (new Crypto({aesKey: environment.SECRET_KEY, ivKey: environment.IV_KEY})).encryptWithKeyAndIV(this.resetPasswordForm.get('confirmPassword').value),
    };
    this.http.post(`${environment.baseApiUrl}/auth/change-password`,  fd)
      .subscribe((response: any) => {
        this.submitting = false;
        // this.commonServices.showLoading(this.submitButton.nativeElement);
        this.successSnackBar(response?.message + '\nChange will take effect on next login');
        this.auth.logout();
      },
      errResp => {
         this.submitting = false;
        this.openSnackBar(errResp?.error?.error.message,);
        this.resetPasswordForm.reset();
      });
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


  }

