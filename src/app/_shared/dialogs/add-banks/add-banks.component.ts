import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormControlState,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormErrors, ValidationMessages } from './beneficiary.validators';
@Component({
  selector: 'app-add-banks',
  templateUrl: './add-banks.component.html',
  styleUrls: ['./add-banks.component.scss'],
})
export class AddBanksComponent implements OnInit {
  container: any = {
    bankName: null,
  };
  myForm: FormGroup;
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  environment = environment;

  currencyData: any = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private appContext: ApplicationContextService,
    public commonServices: CommonService,
    private aRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public bankData: any,
    private dialogRef: MatDialogRef<AddBanksComponent>
  ) {}

  ngOnInit() {
    this.getCurrency();
    this.myForm = this.fb.group({
      currency: [this.bankData.currency, [Validators.required]],
      account_number: [this.bankData?.accountNumber, [Validators.required]],
      bank: [this.bankData?.bankName, [Validators.required]],
      account_name: [this.bankData?.accountName],
    });

    if (this.myForm.get('currency')?.value === 'NGN') {
      this.container['bankAccountName'] = {
        success: true,
        name: this.bankData?.accountName,
      };

      this.myForm
        .get('bank')
        .patchValue({
          code: this.bankData?.bankCode,
          name: this.bankData?.bankName,
        });
    }
  }

  changeCurrency() {
    this.myForm.patchValue({
      account_number: [''],
      bank: [''],
    });

    if (this.myForm.get('currency')?.value !== 'NGN') {
      this.myForm.get('account_name').setValidators([Validators.required]);
      this.myForm.get('account_name').updateValueAndValidity();
    } else {
      this.myForm.get('account_name').clearValidators();
      this.myForm.get('account_name').updateValueAndValidity();
    }

    this.container['bankAccountName'] = {
      success: true,
      name: '',
    };
  }

  onNubanChanged(): any {
    this.controlChanged('account_number');
    let accountNumber = this.myForm.get('account_number')?.value;
    if (!this.myForm.get('bank')?.value) {
      this.myForm.get('account_number')?.patchValue(null, { emitEvent: false });
      // this.toastr.error('Please select a bank first', 'Error');
      return null;
    }
    if (accountNumber?.length === 10) {
      const chosenBank = this.myForm.get('bank')?.value;
      // console.log(accountNumber, chosenBank);
      this.container['loadingBankName'] = true;
      const fd = {
        bankCode: chosenBank?.code,
        nuban: accountNumber,
      };
      this.http
        .post(`${environment.baseApiUrl}/verifications/nuban`, fd)
        .subscribe(
          (resp: any) => {
            this.container['loadingBankName'] = false;
            this.container['disableButton'] = false;
            this.container['bankAccountName'] = {
              success: true,
              name: resp?.data?.accountName,
            };
          },
          (errResp) => {
            this.container['loadingBankName'] = false;
            this.container['disableButton'] = true;
            this.container['bankAccountName'] = {
              success: false,
              name: errResp?.error?.message,
            };
            // console.log(errResp);
          }
        );
    }
  }

  controlChanged(ctrlName: string): void {
    this.errors = this.commonServices.controlnvalid(
      this.myForm.get(ctrlName) as FormControl
    );
    this.displayErrors();
  }

  onSubmit() {
    // console.log(this.data); return

    this.container['submitting'] = true;
    if (this.myForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.myForm
      );
      this.displayErrors();
      this.container['submitting'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.myForm.value));
    const payload = {
      nuban: fd.account_number,
      bankCode: fd.bank.code ? fd.bank.code : '',
      bankName: fd.bank.name ? fd.bank.name : fd.bank,
      bankAccountName: this.container['bankAccountName']?.name
        ? this.container['bankAccountName']?.name
        : fd.account_name,
      currency: fd.currency,
      id: this?.bankData?.id
    };
    (this.bankData?.id
      ? this.http.patch(
          `${environment.baseApiUrl}/users/beneficiary`,
          payload
        )
      : this.http.post(`${environment.baseApiUrl}/users/beneficiary`, payload)
    ).subscribe(
      (response: any) => {
        this.container['submitting'] = false;
        this.successSnackBar('Bank saved Successfully');
        this.dialogRef.close();
      },
      (errResp: any) => {
        this.container['submitting'] = false;
        this.openSnackBar(errResp?.error?.error?.message);
      }
    );
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

  displayErrors(): void {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
      this.uiErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = this.validationMessages[control][error];
      });
    });
  }

  getCurrency() {
    this.container['loading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/getCurrencyCodes`)
      .subscribe((response: any) => {
        this.container['loading'] = false;

        this.currencyData = response.data;
      });
  }
}
