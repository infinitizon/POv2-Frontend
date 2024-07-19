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
import { Router } from '@angular/router';
import { OffersService } from '@app/ini-dashboard/modules/offers/offers.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'app-payment-partner',
  templateUrl: './payment-partner.component.html',
  styleUrls: ['./payment-partner.component.scss']
})
export class PaymentPartnerComponent implements OnInit {
  container: any = {};
  cardPayment: any;
  bankPayment: any;
  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PaymentPartnerComponent>,
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private router: Router,
    public offerService: OffersService,
  ) {}

  ngOnInit() {
    this.container['cardLoading'] = true;
    this.http
      .get(
        this.data?.gatewayEndpoints
          ? this.data?.gatewayEndpoints
          : `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.data?.assetId}`
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
    this.onSubmit(type, fd);
  }

  onSubmit(type: string, fd: any) {
    let payload: any = {...fd};
    if(type === 'card') {
    this.container['submitting'] = true;
    const purchaseDataFull = [
      { units: this.data.purchaseOption === 'Additional' ? 0 : this.data.rightEntitled, type: 'accepted'},
      { units: this.data.additional || 0, type: 'extra'}
    ];
    const purchaseDataPartial = [
      { units: this.data.unit, type: 'accepted'},
      { units: this.data.renounced || 0, type: 'renounce'}
    ];
    payload.type = this.data.type;
    payload.offeringTypeId = this.data.id;
    payload.offeringType = this.data.callbackParams.module;
    // payload.shares = (this.data.purchaseOption !== 'Full' ? this.data.unit : (this.data.rightEntitled + this.data.additional));
    payload.currency = this.data.currency;
    payload.description = this.data.description;
    payload.redirectUrl = this.data.redirectUrl;
    payload.callbackParams = {
      module: this.data.callbackParams.module,
      assetId: this.data.callbackParams.assetId,
      gatewayId: fd.gatewayId,
      resident: this.data.callbackParams.resident,
      tenor: this.data.callbackParams.tenor,
      investorId: this.data?.investorId,
      brokerId: this.data?.brokerId,
      saveCard: false
    };
    payload.gatewayEndpoints = this.data.gatewayEndpoints;
    payload.gatewayId = fd.gatewayId;
    payload.gateway = fd.gateway;
    payload.channel = fd.channel;
    payload.paymentMethod = fd.paymentMethod;
    payload.purchase = this.data.purchaseOption === 'Full' || this.data.purchaseOption === 'Additional'  ? purchaseDataFull : purchaseDataPartial;
    // payload.amount = this.data.sharePrice * payload.shares;
    delete payload.subaccountId;

    this.http
      .post(
        this.data?.postUrl
          ? this.data?.postUrl
          : `${environment.baseApiUrl}/transactions/create`,
       payload
      )
      .subscribe(
        (response: any) => {
          if (response?.data?.authorization_url) {
            window.location = response.data.authorization_url;
          }
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
        },
        (response) => {
          this.openSnackBar(response?.error?.error?.message);
          this.container['submitting'] = false;
        }
      );
     }
      else {
        this.router.navigate(['/app/offers/gateway-payment']);
        let formData = { ...payload};
        this.offerService.gatewayDetails = {
          currency: this.data.currency,
          payment_method: fd?.value.gateway === null ? 'bank' : 'online',
          id: this.data.id,
          formData: formData
        };
        this.dialog.closeAll();
      }
  }

  submitUSD() {
    if (this.data.currency === 'USD') {
      this.router.navigate(['/app/offers/gateway-payment']);
      let formData = { ...this.data};
      this.offerService.gatewayDetails = {
        currency: this.data.currency,
        payment_method: 'bank',
        id: this.data.id,
        formData: formData
      };
      this.dialog.closeAll();
    }
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
