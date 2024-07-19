import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { Crypto } from '@app/_shared/classes/Crypto';
import { FormErrors, ValidationMessages } from './otp-dialog.validators';
import * as moment from 'moment';

@Component({
  selector: 'app-otp-dialog',
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss']
})
export class OtpDialogComponent implements OnInit {
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  };

  otp: any = null;
  email: string = '';
  submitting: boolean = false;
  loginForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  countdown: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private appContext: ApplicationContextService,
    public commonServices: CommonService,
    private aRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OtpDialogComponent>
  ) {
    const duration = moment.duration(600, 's');

    const intervalId = setInterval(() => {
      duration.subtract(1, "s");

      const inMilliseconds = duration.asMilliseconds();

      // "mm:ss:SS" will include milliseconds
      this.countdown = moment.utc(inMilliseconds).format("mm:ss")

      if (inMilliseconds !== 0) return;

      clearInterval(intervalId);
      this.countdown = "Otp expired!, Resend"
      // console.warn("Times up!");
    }, 1000);
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      password: [null, [
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
        ),]],
      // rememberMe: [null],
    });
  }

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  resendOtp() {
    this.submitting = true;
    this.http.post(`${environment.baseApiUrl}/rights/${this.data?.rightId}/user/otp/generate`, this.data?.payload)
    .subscribe((response: any) => {
      this.submitting = false;
      this.successSnackBar('OTP sent to your mail');
    },
    errResp => {
      this.submitting = false;
      this.openSnackBar(errResp?.error?.error?.message)
    });
}

handleOtpChange(value: string[]): void {
  // console.log(value);
}

handleFillEvent(value: string): void {
  this.otp = value;
  // console.log(value);
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

onSubmit() {
  const fd = JSON.parse(JSON.stringify(this.loginForm.value));
  const encrypted = new Crypto({
    aesKey: environment.SECRET_KEY,
    ivKey: environment.IV_KEY,
  }).encryptWithKeyAndIV(fd.password);
  fd.password = encrypted;

  const payload = {
       email: this.data?.payload?.email,
       token: this.otp,
       password: fd.password,
       userId: this.data?.payload?.userId

  };



  this.submitting = true;
  this.http.post(`${environment.baseApiUrl}/rights/${this.data.rightId}/user/otp/verify`, payload)
    .subscribe((response: any) => {
      this.submitting = false;
      this.dialog.closeAll();
      this.successSnackBar(response.message);
      this.router.navigate(['/auth/login']);
    },
    errResp => {
      this.submitting = false;
      this.openSnackBar(errResp?.error?.error?.message)
    });
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.loginForm.get(ctrlName) as FormControl);
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

}
