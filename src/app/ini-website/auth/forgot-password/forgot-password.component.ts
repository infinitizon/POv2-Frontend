import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { take } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm!: FormGroup;
  container: any = {};
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialog,
    public appContext: ApplicationContextService,
    ) { }

  ngOnInit() {

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.commonService.email)]]
    });

  }


  onSubmit() {
    const fd = JSON.parse(JSON.stringify(this.forgotPasswordForm.value));

    this.submitting = true;
    this.http
      .post(`${environment.baseApiUrl}/auth/forgot-password/otp`, fd)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          this.successSnackBar(response?.message);
          this.router.navigate(['/auth/reset-password']);
          this.authService.email$.next(fd);
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
      panelClass: ['download'],
    });
  }

}
