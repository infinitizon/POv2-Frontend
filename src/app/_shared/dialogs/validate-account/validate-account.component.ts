import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './validate-account-validator';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-validate-account',
  templateUrl: './validate-account.component.html',
  styleUrls: ['./validate-account.component.scss']
})
export class ValidateAccountComponent implements OnInit {
  validateForm: FormGroup;
  container: any = {};
  errors = [];
  formErrors = FormErrors;
  uiErrors = FormErrors;
  validationMessages = ValidationMessages;


  selectionCheck: any ='chn'

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ValidateAccountComponent>,
    private _snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private _fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.validateForm = this._fb.group({
      select: ['chn'],
      chn: ['', [Validators.required]],
    });
  }

  onRadioButtonChange(event) {
    this.selectionCheck = event?.value;
  }

  onSubmit() {
    this.container['loading'] = true;
    if (this.validateForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.validateForm
      );
      this.displayErrors();
      this.container['loading'] = false;
      return;
    }

   const fd = JSON.parse(JSON.stringify(this.validateForm.value));
   let params = new HttpParams();
   params = params.set(`${this.selectionCheck === 'chn' ? 'chn' : 'rin'}`, (fd?.chn).toUpperCase());
   params = params.set('offerId', this.data?.offerId);
   this.http.get(`${environment.baseApiUrl}/3rd-party-services/ngx/rights/eligibility`, {params: params})
      .subscribe(
        (response: any) => {
          this.container['loading'] = false;
          if(response?.data.data.isEligible) {
            this.successSnackBar('CHN verified successfully');
            this.dialogRef.close(response);
            } else {
              this.openSnackBar("You are not eligible to buy this rights issue, please contact your stockbroker");
            }
        },
        (errResp) => {
          this.container['loading'] = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }


  controlChanged(form: UntypedFormGroup, ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      form.get(ctrlName) as UntypedFormControl
    );
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = ValidationMessages[control][error]
        ?.replace('{{selected}}', this.selectionCheck === 'chn' ? 'CHN' : 'RIN');
      });
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 9000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }

  successSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 9000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }

}
