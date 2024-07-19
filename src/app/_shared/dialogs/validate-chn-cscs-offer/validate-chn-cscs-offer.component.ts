import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './validate-account-validator';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { environment } from '@environments/environment';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-validate-chn-cscs-offer',
  templateUrl: './validate-chn-cscs-offer.component.html',
  styleUrls: ['./validate-chn-cscs-offer.component.scss']
})
export class ValidateChnCscsOfferComponent implements OnInit {
  firstFormGroup: UntypedFormGroup;
  validateForm: UntypedFormGroup;
  container = {
    gettingWallet: false,
    linear: true,
    loading: false,
    cscsName: null
  };
  selectionCheck: any ='chn';
  errors = [];
  formErrors = FormErrors;
  uiErrors = FormErrors;
  validationMessages = ValidationMessages;
  investorCheck: any = 'new';
  constructor(
    private _fb: FormBuilder,
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ValidateChnCscsOfferComponent>,
    private http: HttpClient,
    public dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.validateForm = this._fb.group({
      select: ['new'],
    });

    this.validateForm = this._fb.group({
      select: ['chn'],
      chn: ['', [Validators.required]],
    });
  }

  proceed(stepper: MatStepper) {
        if(this.investorCheck === 'existing') {
              stepper.next();
        } else {
          this.dialogRef.close('new');
        }
  }

  onRadioButtonChangeForInvestor(event) {
     this.investorCheck = event?.value;
  }

  onRadioButtonChange(event) {
    this.selectionCheck = event?.value;
  }


  selectionChange(event) {
    if(event.selectedStep.label?.toLowerCase() === 'completed') {
    }
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
   params = params.set('id', (fd.chn).toUpperCase());
   params = params.set('type', `${this.selectionCheck === 'chn' ? 'CHN' : 'CSCS'}`);
   this.http.get(`${environment.baseApiUrl}/3rd-party-services/ngx/brokers/lookup`, {params: params})
      .subscribe(
        (response: any) => {
          this.container['loading'] = false;
          if(response?.data.data.isEligible) {
            this.successSnackBar(`${this.selectionCheck === 'chn' ? 'CHN' : 'CSCS'} verified successfully`);
            this.dialogRef.close(response);
            } else {
              this.openSnackBar("You are not eligible to buy this offer, please contact your stockbroker");
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
        ?.replace('{{selected}}', this.selectionCheck === 'chn' ? 'CHN' : 'CSCS');
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
