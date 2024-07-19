import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './sign-up-continue.validators';
import { Subscription, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@app/_shared/services/auth.service';
import * as moment from 'moment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { environment } from '@environments/environment';
import { Crypto } from '@app/_shared/classes/Crypto';
import { ConfirmEmailComponent } from '@app/_shared/dialogs/confirm-email/confirm-email.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-up-continue',
  templateUrl: './sign-up-continue.component.html',
  styleUrls: ['./sign-up-continue.component.scss'],
})
export class SignUpContinueComponent implements OnInit, OnDestroy {

  gender = [{id: 'male', name: 'Male' }, {id: 'female', name: 'Female' }];
  signupForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;

  signupSub!: Subscription;
  submitting: boolean = false;

  referrals: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    )
     { }

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        bvn: ['', [Validators.required]],
        dob: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        middleName: [''],
        mothersMaidenName: ['', [Validators.required]],
        placeOfBirth: ['', [Validators.required]],
        address: ['', [Validators.required]],
        gender: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.pattern(this.commonServices.email)]],
        phone: ['', [Validators.required]],
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
      { validators: this.commonServices.mustMatch('password', 'confirmPassword') }
    );
    this.signupSub = this.authService.signUp().subscribe(
      (data: any) => {
        if(data) {
          // console.log(data);
          this.populateKYCDetail(data);
        } else {
          this.router.navigate(['/auth/signup']);
        }
      }
    )
  }


  populateKYCDetail(kycDetail: any) {
    const gender = this.gender.find(g => g?.name === kycDetail?.gender);
    const getUrl = window.location;
    this.signupForm.patchValue({
      firstName: kycDetail?.firstName,
      lastName: kycDetail?.lastName,
      middleName: kycDetail?.middleName,
      gender: gender,
      // phone: kycDetail?.phone,
      dob: moment(kycDetail?.dateOfBirth,'DD-MM-YYYY').format('DD-MM-YYYY'),

      // photo: kycDetail?.photo,
      address: kycDetail?.residentialAddress,
      bvn: kycDetail?.bvn,

      // signature: kycDetail?.signature,
      // redirect_url: getUrl.protocol+"//"+getUrl.host + this.loginRoute
    });
  }


  confirmEmail() {
    if (this.signupForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.signupForm
      );
      this.displayErrors();
      this.submitting = false;
      return;
    }
    const emailDialog = this.dialog.open(ConfirmEmailComponent, {
      data: {
        email: this.signupForm.get('email')?.value,
      },
      width: '380px',
      height: '210px',
    });
    emailDialog
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if(result) {
         this.onSubmit();
        }
      });
  }

   getReferral() {
    this.container['referralsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/ref-codes`)
      .subscribe(
        (response: any) => {
          this.referrals = response?.data;
          this.container['referralsLoading'] = false;
        },
        (errResp) => {
          this.container['referralsLoading'] = false;
        }
      );
  }



  onSubmit() {
    this.submitting = true;
    if (this.signupForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors))
      this.errors = this.commonServices.findInvalidControlsRecursive(this.signupForm);
      this.displayErrors();
      this.submitting = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.signupForm.value));
    fd.gender = fd.gender.id;

    const encrypted = new Crypto({
      aesKey: environment.SECRET_KEY,
      ivKey: environment.IV_KEY,
    }).encryptWithKeyAndIV(fd.password);

    fd.password = encrypted;
    this.http.post(`${environment.baseApiUrl}/auth/user/signup`, fd)
      .subscribe((response: any) => {
        this.submitting = false;
        this.authService.signup$.next(response.user);
          this.router.navigate(['/auth/verify-otp']);
      },
      errResp => {
        this.submitting = false;
        this.openSnackBar(errResp?.error?.error?.message);
      });
  }

  sendOtp(email: string) {
    this.http.post(`${environment.baseApiUrl}/auth/generateOTP`, {email: email, subject: 'Verification'})
    .subscribe((response: any) => {
      this.submitting = false;
    },
    errResp => {
      this.submitting = false;
      this.openSnackBar(errResp?.error?.message)
    });
}

  showEyes() {
    this.container['fieldTextType'] = !this.container['fieldTextType'];
  }

  clearPassword(field: string) {
    this.signupForm.get(field)?.patchValue('')
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(this.signupForm.get(ctrlName) as FormControl);
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
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }


  ngOnDestroy() {
    if(this.signupSub) {
      this.signupSub.unsubscribe();
    }
  }
}
