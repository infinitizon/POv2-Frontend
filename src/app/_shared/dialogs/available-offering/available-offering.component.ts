import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RightIssue } from '@app/_shared/models/right-issue-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { Observable, Subject, catchError, concat, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { OtpDialogComponent } from '../otp-dialog/otp-dialog.component';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'app-available-offering',
  templateUrl: './available-offering.component.html',
  styleUrls: ['./available-offering.component.scss'],
})
export class AvailableOfferingComponent implements OnInit {
  environment = environment;
  rightIssue: RightIssue[] = [];
  container: any = {};
  searchName: any;
  email: any;
  public input$ = new Subject<string | null>();
  public items$: Observable<any[]>;
  customerLoading = false;
  minLengthTerm = 3;


  selectedOffering: any;
  emailForm: FormGroup;
  termsRead: any;
  checkEmail: boolean = false;

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
    private dialogRef: MatDialogRef<AvailableOfferingComponent>
  ) {
    this.loadCustomer();
  }

  ngOnInit() {
    // if (this.data.data === 'rights') {
    //   this.getRightIssue();
    // }
    // console.log(this.data);

    this.emailForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.pattern(this.commonServices.email)],
      ],
      terms: [false]
      // rememberMe: [null],
    });
  }



  getRightIssue() {
    this.container['loading-right'] = true;
    this.http.get(`${environment.baseApiUrl}/rights`).subscribe(
      (response: any) => {
        this.rightIssue = response.data;
        this.container['loading-right'] = false;
      },
      (errResp) => {
        this.container['loading-right'] = false;
      }
    );
  }

  addTagFn(name) {
    return { firstName: 'Not', lastName: 'Found', refCode: name, tag: true };
  }

  private loadCustomer() {
    this.items$ = concat(
      of([]), // default items
      this.input$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.customerLoading = true)),
        switchMap((term) => {
          return this.getCustomer(term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.customerLoading = false))
          );
        })
      )
    );
  }

  getCustomer(term: string = null): Observable<any> {
    return this.http
      .get(`${environment.baseApiUrl}/rights/${this.data?.id}/users?search=` + term)
      .pipe(
        map((resp: any) => {
          if (resp.Error) {
            throwError(resp.Error);
          } else {
            return resp.data;
          }
        })
      );
  }

  selectOffering(options: any) {

    this.selectedOffering = options;
  }

  getCustomerId(customer: any) {
    this.container['customer'] = customer;
  }

  termChecked(value: boolean) {
    this.termsRead = value;
  }


  proceed() {
    this.container['loading-proceed'] = true;
    const fd = JSON.parse(JSON.stringify(this.emailForm.value));
    const payload: any = {
       userId: this.container['customer']?.id,
    };

    if(!this.container['customer'].email) {
      if(this.emailForm.invalid) {
        this.container['loading-proceed'] = false;
        this.checkEmail = true;
        return;
      }
      payload.email = fd.email;
    } else {
      this.termsRead = true;
      this.checkEmail = false;
    }

    if (!this.termsRead) {
      this.container['loading-proceed'] = false;
       this.openSnackBar('Terms and Condition needs to be accepted');
       return;
     }

    this.http.post(`${environment.baseApiUrl}/rights/${this.data?.id}/user/otp/generate`, payload).subscribe(
      (response: any) => {
        this.container['loading-proceed'] = false;
        this.successSnackBar('OTP sent to your mail');
        this.openOTPDialog(payload)
      },
      (errResp) => {
        this.container['loading-proceed'] = false;
        this.openSnackBar(errResp?.error?.error?.message)
      }
    );
  }

  openOTPDialog(data: any): void {
    const otpDialog = this.dialog.open(OtpDialogComponent, {
      data: {
        payload: data,
        rightId: this.selectedOffering?.id
      },
      width: '500px',
    });

    otpDialog.afterClosed().subscribe((result) => {
       this.container['loading-proceed'] = false;
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
