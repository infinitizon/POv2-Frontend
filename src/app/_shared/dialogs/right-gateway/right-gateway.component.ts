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
import { FormErrors, ValidationMessages } from './right-gateway.validators';
import { Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';
import { RightNoticeComponent } from '../right-notice/right-notice.component';
import { User } from '@app/_shared/models/user-model';

@Component({
  selector: 'app-right-gateway',
  templateUrl: './right-gateway.component.html',
  styleUrls: ['./right-gateway.component.scss'],
})
export class RightGatewayComponent implements OnInit {
  gatewayForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  cardPayment: any;
  bankPayment: any;
  termsRead: any;

  purchaseOptionsData: string[] = ['Full', 'Partial', 'Additional'];
  customPatterns = {
    '0': { pattern: new RegExp('[0-9]') },
  };

  getInvestorId: any;
  getBrokerId: any;
  userInformation: any;
  brokerList: any;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RightGatewayComponent>,
    private fb: FormBuilder,
    private router: Router,
    public offerService: OffersService,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.appContext
      .getUserInformation()
      .pipe()
      .subscribe({
        next: (data: User) => {
          if (data) {
            this.userInformation = data;
          }
        },
      });

    this.gatewayForm = this.fb.group({
      purchaseOption: ['', [Validators.required]],
      unit: [''],
      unitHeld: [this.data?.rightEntitled?.data?.noOfUnits],
      rightEntitled: [
        this.data?.rightEntitled?.data?.data?.maximumUnitBuyable,
        [Validators.required, this.commonServices.notAllowed(/^0/)],
      ],
      additional: [null],
      totalAmount: [0],
      renounced: [0],
      terms: [false],
    });

    if (this.data?.rightEntitled?.data?.data?.status === 'NEW') {
      this.purchaseOptionsData = ['Full', 'Partial', 'Additional'];
    } else if (
      this.data?.rightEntitled?.data?.data?.status === 'REQUEST_OVERAGE'
    ) {
      this.purchaseOptionsData = ['Additional'];
      this.getBrokerId = this.data?.rightEntitled?.data?.data?.brokerId;
      this.getInvestor();
    }

    this.gatewayForm.get('purchaseOption').valueChanges.subscribe((data) => {
               if(data === 'Additional') {
                this.getBrokerId = this.data?.rightEntitled?.data?.data?.brokerId;
                this.getInvestor();
               }
    });

    // if (!this.data?.rightEntitled?.data?.data?.brokerId) {
    //       this.getBrokerList();
    // }

  }

  termChecked(value: boolean) {
    this.termsRead = value;
  }

  // brokerId

  getInvestor() {
    this.http
      .get(
        `${environment.baseApiUrl}/3rd-party-services/ngx/investors?email=${this.userInformation?.email}`
      )
      .subscribe(
        (response: any) => {
          this.getInvestorId = response?.data?.data?.investors[0]?.id;
        },
        (errResp) => {
          // this.container['userLoading'] = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }

  // getBrokerList() {
  //   this.http
  //     .get(
  //       `${environment.baseApiUrl}/3rd-party-services/ngx/investors?email=${this.userInformation?.email}`
  //     )
  //     .subscribe(
  //       (response: any) => {
  //         console.log(response);
  //       },
  //       (errResp) => {
  //         // this.container['userLoading'] = false;
  //         this.openSnackBar(errResp?.error?.error?.message);
  //       }
  //     );
  // }

  checkedForPartial() {
    let totalAmount;
    if (this.gatewayForm.get('purchaseOption')?.value === 'Partial') {
      this.gatewayForm
        .get('unit')
        .setValidators([
          Validators.required,
          this.commonServices.validateRenounceBuy(
            this.data?.rightEntitled?.data?.data?.maximumUnitBuyable -
              this.gatewayForm.get('renounced')?.value,
            { plusBy: '' }
          ),
        ]);
      // this.gatewayForm.get('renounced').setValidators([this.commonServices.validateRenounceBuy(
      //   (this.data?.rightEntitled?.remainderToBuy  -  this.gatewayForm.get('unit')?.value),
      //   { plusBy: '' }
      // ), this.commonServices.validateUnitsExist(
      //   (this.gatewayForm.get('unit')?.value),
      //   { unitBy: '' }
      // )]);
      this.gatewayForm.get('unit').updateValueAndValidity();
      // this.gatewayForm.get('renounced').updateValueAndValidity();
      this.gatewayForm.get('rightEntitled').clearValidators();
      this.gatewayForm.get('rightEntitled').updateValueAndValidity();
      totalAmount =
        this.data.sharePrice * Number(this.gatewayForm.get('unit')?.value);
      this.gatewayForm.get('additional').clearValidators();
      this.gatewayForm.get('additional').updateValueAndValidity();
      this.gatewayForm.get('rightEntitled').updateValueAndValidity();
      this.gatewayForm.get('additional').patchValue('');
    } else if (this.gatewayForm.get('purchaseOption')?.value === 'Additional') {
      // if (this.data?.rightEntitled?.data?.data?.status === 'REQUEST_OVERAGE') {
        this.gatewayForm
          .get('additional')
          .setValidators([
            Validators.required,
            // Validators.min(1)
            // this.commonServices.validateRightsEntitledisZero(
            //   this.data?.rightEntitled?.data?.data?.maximumUnitBuyable,
            //   { checkBy: '' }
            // ),
          ]);
      // }
      this.gatewayForm.get('unit').patchValue('');
      this.gatewayForm.get('additional').updateValueAndValidity();
      this.gatewayForm.get('rightEntitled').clearValidators();
      this.gatewayForm.get('rightEntitled').updateValueAndValidity();
      this.gatewayForm.get('unit').clearValidators();
      this.gatewayForm.get('unit').updateValueAndValidity();
      totalAmount = Number(this.gatewayForm.get('additional')?.value);
    } else {
      totalAmount =
        this.data.sharePrice *
        Number(this.gatewayForm.get('rightEntitled')?.value);
        this.gatewayForm
        .get('rightEntitled')
        .setValidators([
          Validators.required,
          this.commonServices.notAllowed(/^0/)
        ]);
      this.gatewayForm.get('unit').clearValidators();
      this.gatewayForm.get('additional').clearValidators();
      this.gatewayForm.get('unit').updateValueAndValidity();
      this.gatewayForm.get('additional').updateValueAndValidity();
      this.gatewayForm.get('rightEntitled').updateValueAndValidity();
      this.gatewayForm.get('additional').patchValue('');
      this.gatewayForm.get('unit').patchValue('');
    }
    this.gatewayForm.patchValue({
      totalAmount: totalAmount,
    });
  }

  onSubmit() {
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

    if (!this.getInvestorId && fd.purchaseOption === 'Additional') {
      this.openSnackBar('Investor ID not available ');
      return;
    }

    if (!this.termsRead) {
     this.container['submitting'] = false;
      this.openSnackBar('Terms and Condition needs to be accepted');
      return;
    }

    const payload = { ...this.data, ...fd };
    payload.totalAmount += payload.additional * this.data.sharePrice;
    payload.unitHeld = Number(payload.unitHeld);
    payload.rightEntitled = Number(payload.rightEntitled);
    if (fd.purchaseOption === 'Additional') {
      payload.brokerId = this.getBrokerId;
      payload.investorId = this.getInvestorId;
    }
    this.appContext.rightPaymentInformation$.next(payload);
    if (fd.purchaseOption === 'Full' && fd.additional > 0) {
      this.openNoticeDialog();
    } else {
      this.router.navigate(['/app/offers/right-payment-summary']);
    }

    this.dialogRef.close();
  }

  openNoticeDialog(): void {
    const rightNoticeDialog = this.dialog.open(RightNoticeComponent, {
      data: {},
      width: '368px',
      // height: '500px'
    });

    rightNoticeDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/app/offers/right-payment-summary']);
      }
    });
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
          ?.replace(
            '{{minPurchaseUnits}}',
            formatNumber(this.data?.unit, 'en-US', '1.2-2')
          )
          ?.replace(
            '{{sharePrice}}',
            this.data.currency +
              formatNumber(
                this.data.sharePrice * this.data?.unit,
                'en-US',
                '1.2-2'
              )
          );
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
}
