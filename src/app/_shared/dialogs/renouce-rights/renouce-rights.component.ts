import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './renouce-rights.validators';
import { Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';
import { RightNoticeComponent } from '../right-notice/right-notice.component';

@Component({
  selector: 'app-renouce-rights',
  templateUrl: './renouce-rights.component.html',
  styleUrls: ['./renouce-rights.component.scss']
})
export class RenouceRightsComponent implements OnInit {
  gatewayForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  cardPayment: any;
  bankPayment: any;
  termsRead: any;

  purchaseOptionsData: string[] = ['Full', 'Partial']

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RenouceRightsComponent>,
    private fb: FormBuilder,
    private router: Router,
    public offerService: OffersService,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.gatewayForm = this.fb.group({
      // purchaseOption: ['', [Validators.required]],
      // unit: [0],
      unitHeld: [this.data?.rightEntitled?.data?.noOfUnits, [Validators.required]],
      // rightEntitled: [this.data?.rightEntitled?.remainderToBuy, [Validators.required]],
      // additional: [0],
      // totalAmount: [0],
      renounced: [this.data?.rightEntitled?.remainderToBuy, [Validators.required]],
      terms: [false]
    });
  }

  termChecked(value: boolean) {
    this.termsRead = value;
  }

  checkedForPartial() {
    let totalAmount;
    if (this.gatewayForm.get('purchaseOption')?.value === 'Partial') {
      this.gatewayForm.get('unit').setValidators([Validators.required]);
      this.gatewayForm.get('unit').updateValueAndValidity();
      totalAmount = this.data.sharePrice * Number(this.gatewayForm.get('unit')?.value);
    } else {
      totalAmount = this.data.sharePrice * Number(this.gatewayForm.get('rightEntitled')?.value);
      this.gatewayForm.get('unit').clearValidators();
      this.gatewayForm.get('unit').updateValueAndValidity();
    }
    this.gatewayForm.patchValue({
      totalAmount: totalAmount
    });
  }

  onSubmit() {
    if (!this.termsRead) {
     this.container['submitting'] = false;
      this.openSnackBar('Terms and Condition needs to be accepted');
      return;
    }

    if (this.gatewayForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.gatewayForm
      );
      this.displayErrors();
      this.container['submitting'] = false;

      return;
    }
    const fd = JSON.parse(JSON.stringify(this.gatewayForm.value));
    let payload: any = {...fd};
    this.container['submitting'] = true;
    const purchaseDataPartial = [
      { shares: 0, type: 'accepted'},
      { shares: payload.renounced, type: 'renounce'}
    ];
    payload.type = this.data.type;
    payload.rightId = this.data.id;
    // payload.shares = (this.data.purchaseOption !== 'Full' ? this.data.unit : (this.data.rightEntitled + this.data.additional));
    payload.currency = this.data.currency;
    payload.description = this.data.description;
    payload.redirectUrl = this.data.redirectUrl;
    payload.callbackParams = {
      module: this.data.callbackParams.module,
      assetId: this.data.callbackParams.assetId,
      gatewayId: this.data.id,
      resident: this.data.callbackParams.resident,
      tenor: this.data.callbackParams.tenor,
      saveCard: false
    };
    payload.gatewayEndpoints = this.data.gatewayEndpoints;
    payload.gatewayId = this.data.id;
    payload.gateway = 'paystack';
    payload.channel = 'paystack';
    payload.paymentMethod = 'online';
    payload.purchase =  purchaseDataPartial;
    // payload.amount = this.data.sharePrice * payload.shares;
    delete payload.subaccountId;
    delete payload.renounced;

    this.http
      .post(
        this.data?.postUrl
          ? this.data?.postUrl
          : `${environment.baseApiUrl}/rights/txn`,
       payload
      )
      .subscribe(
        (response: any) => {
          this.successSnackBar(response?.message);
          // if (response?.data?.authorization_url) {
          //   window.location = response.data.authorization_url;
          // }
          this.dialogRef.close();
        },
        (response) => {
          this.openSnackBar(response?.error?.error?.message);
          this.container['submitting'] = false;
        }
      );
  }




  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.gatewayForm.get(ctrlName) as FormControl
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
        this.uiErrors[control] = this.validationMessages[control][error]
        ?.replace('{{minPurchaseUnits}}', formatNumber(this.data?.unit,"en-US", "1.2-2"))
        ?.replace('{{sharePrice}}', this.data.currency + formatNumber(this.data.sharePrice * this.data?.unit,"en-US", "1.2-2"));
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
