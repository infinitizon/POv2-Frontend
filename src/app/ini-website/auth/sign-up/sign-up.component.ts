import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormErrors, ValidationMessages } from './sign-up.validators';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  container: any = {
    showBVNTip: false
  };
  validationMessages: any = ValidationMessages;
  submitting = false;
  showPop: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    }

    this.signupForm = this.fb.group({
      bvn: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          this.commonServices.regexValidator(
            new RegExp(this.commonServices.onlyDigits),
            { onlyDigits: '' }
          ),
        ],
      ],
      dob: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitting = true;
    if (this.signupForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.signupForm
      );
      this.displayErrors();
      this.submitting = false;
      return;
    }

    const fd = JSON.parse(
      JSON.stringify({
        bvn: this.signupForm.get('bvn')?.value,
        dob: moment(this.signupForm.get('dob')?.value).format('DD-MM-YYYY'),
      })
    );

    this.http.post(`${environment.baseApiUrl}/verifications/bvn`, fd).subscribe(
      (response: any) => {
        this.submitting = false;
        if(response.data === typeof {}) {
          this.openSnackBar('BVN Verification failed');
        } else {
          this.authService.signup$.next(response.data);
          this.successSnackBar('BVN Verification successful');
          this.router.navigate(['/auth/signup-continue']);
        }
      },
      (errResp) => {
        this.submitting = false;
        if(errResp?.error?.error?.message) {
        this.openSnackBar(errResp?.error?.error?.message);
        } else {
          this.openSnackBar('Network failed');
        }
      }
    );
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.signupForm.get(ctrlName) as FormControl
    );
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
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
}
