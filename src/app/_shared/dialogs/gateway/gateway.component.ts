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
import { FormErrors, ValidationMessages } from './gateway.validators';
import { Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss'],
})
export class GatewayComponent implements OnInit {
  gatewayForm!: FormGroup;
  container: any = {};
  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  cardPayment: any;
  bankPayment: any;
  termsRead: any;
  environment = environment;

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GatewayComponent>,
    private fb: FormBuilder,
    private router: Router,
    public offerService: OffersService,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.gatewayForm = this.fb.group({
      unit: ['', [Validators.required, Validators.min(this.data?.minUnit), this.commonServices.multipleOf(this.data?.subsequentMultipleUnits, { multipleOf: '' })]],
      payment: ['', [Validators.required]],
      broker: ['', [Validators.required]],
      paymentMethod: ['online', [Validators.required]],
      terms: [false]
    });

    this.http
      .get(
        this.data?.gatewayEndpoints
          ? this.data?.gatewayEndpoints
          : `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.data?.id}`
          // : `${environment.baseApiUrl}/admin/assets/${this.data?.id}/banks`
      )
      .subscribe(
        (response: any) => {
          this.container['cardLoading'] = false;
          this.cardPayment = response.data.filter(
            (card: any) => {
              return card.type === 'card';
            }
          );
          this.bankPayment = response.data.filter(
            (card: any) => {
              return card.type === 'bank';
            }
          );
        },
        (response) => {}
      );
  }

  pay(type?: string, options = {}) {
    this.container['submitting'] = true;
    const fd = JSON.parse(JSON.stringify(options));
    fd.channel = fd.gateway;
      this.onSubmit(fd);
  }
  termChecked(value: boolean) {
    this.termsRead = value;
  }

  onSubmit(fd: any) {
    if (!this.termsRead) {
      // if(!termsChecked) {
     this.container['submitting'] = false;
      this.openSnackBar('Terms and Condition needs to be accepted');
      return;
    }

    if(this.gatewayForm.get('payment')?.value.gateway !== null) {
    if (this.gatewayForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.gatewayForm
      );
      this.displayErrors();
      this.container['submitting'] = false;
      // console.log('Got here');

      return;
        }


    this.container['submitting'] = true;
    console.log(this.gatewayForm.value);
    let formData = { ...this.gatewayForm.value, ...this.data, ...fd };
    formData.amount = Number(formData.unit * this.data.sharePrice);
    formData.offeringTypeId = formData.id,
    formData.offeringType =  "ipo",
    formData.transAmount = Number(formData.unit * this.data.sharePrice);
    formData.assetQuantity =  formData.unit ;
    formData.callbackParams.gatewayId = formData.gatewayId;
    formData.callbackParams.saveCard = false;
    formData.purchase = [
      { units: formData.unit}
    ];
    // if(this.data?.ngxInfo === 'new') {
    //   formData.callbackParams.brokerId = formData?.broker?.id;
    // } else {
      // formData.callbackParams.chn = this.data?.ngxInfo?.data?.data?.tradingInformation?.chn;
      // formData.callbackParams.cscs = formData?.broker?.cscsNo;
      formData.callbackParams.broker = {...formData?.broker, chn: this.data?.ngxInfo?.chn};
    // }
    delete formData.payment;
    delete formData.id;
    delete formData.unit;
    delete formData.sharePrice;
    delete formData.subaccountId;
    delete formData.broker;
    delete formData.ngxInfo;
    this.http
      .post(
        this.data?.post_url
          ? this.data?.post_url
          : `${environment.baseApiUrl}/transactions/create`,
        formData
      )
      .subscribe(
        (response: any) => {
          if (response?.data?.authorization_url) {
            window.location = response.data.authorization_url;
          }
          // else if (response?.data?.notifyOfCharge) {
          //   // There was no card registered to the customer and his start date is not today
          //   this.commonService.openMessageDialog(
          //     {
          //       title: 'Initial charge',
          //       acceptButtonText: 'OK',
          //       message: `${fd.currency}50 will be charged to your card and saved into your wallet <i class="fa fa-info-circle" matTooltip="We take the extra step to confirm your card so that we can verify that the card is valid"></i>`,
          //     },
          //     () => {
          //       this.container['submitting'] = true;
          //       fd.amount = 50;
          //       fd.callback_params = { module: 'wallet' };
          //       this.http
          //         .post(
          //           `${environment.baseApiUrl}/3rd-party-services/payment/initiate`,
          //           fd
          //         )
          //         .subscribe((charged: any) => {
          //           this.container['submitting'] = false;
          //           if (charged?.data?.authorization_url) {
          //             window.open(charged?.data?.authorization_url, '_self');
          //           } else {
          //             this.commonService.openMessageDialog(
          //               {
          //                 title: 'Error initializing charge',
          //                 acceptButtonText: 'OK',
          //                 message: `There was a problem charging your card. Please contact admin for assistance`,
          //               },
          //               () => {
          //                 this.router.navigateByUrl(
          //                   `/dashboard/${this.container['productType']}`
          //                 );
          //               }
          //             );
          //           }
          //         });
          //     }
          //   );
          // }
          else if (response?.data?.quickteller) {
            const quickTellerForm = document.createElement('form');
            quickTellerForm.method = 'POST';
            quickTellerForm.action = response?.data?.quickteller_endpoint;
            quickTellerForm.style.display = 'none';
            Object.keys(response?.data.quickteller).forEach((key) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = response?.data?.quickteller[key];
              quickTellerForm.appendChild(input);
            });
            document.body.appendChild(quickTellerForm);
            quickTellerForm.submit();
          }

          // this._dialogRef.close(response);
        },
        (response) => {
          this.openSnackBar(response?.error?.error?.message);
          this.container['submitting'] = false;
        }
      );
     }
      else {
        this.router.navigate(['/app/offers/gateway-payment']);
        let formData = { ...this.gatewayForm.value, ...this.data, ...fd};
        this.offerService.gatewayDetails = {
          currency: this.data.currency,
          payment_method: this.gatewayForm.get('payment')?.value.gateway === null ? 'bank' : 'online',
          id: this.data.id,
          formData: formData
        };
        this.dialog.closeAll();
      }
  }

  submitUSD() {
    if (this.data.currency === 'USD') {
      this.router.navigate(['/app/offers/gateway-payment']);
      let formData = { ...this.gatewayForm.value, ...this.data};
      this.offerService.gatewayDetails = {
        currency: this.data.currency,
        payment_method: this.gatewayForm.get('payment')?.value,
        id: this.data.id,
        formData: formData
      };
      this.dialog.closeAll();
    }
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
        ?.replace('{{sharePrice}}', this.data.currency + formatNumber(this.data.sharePrice * this.data?.unit,"en-US", "1.2-2"))
        ?.replace('{{minUnit}}', this.data?.minUnit)
        ?.replace('{{unit}}', this.data?.subsequentMultipleUnits);
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
