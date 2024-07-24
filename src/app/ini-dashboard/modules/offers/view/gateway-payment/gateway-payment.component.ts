import { Component, OnInit } from '@angular/core';
import { OffersService } from '../../offers.service';
import { Router } from '@angular/router';
import {
  FileUploadControl,
  FileUploadValidators,
} from '@iplab/ngx-file-upload';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { User } from '@app/_shared/models/user-model';
import { take } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-gateway-payment',
  templateUrl: './gateway-payment.component.html',
  styleUrls: ['./gateway-payment.component.scss'],
})
export class GatewayPaymentComponent implements OnInit {
  gatewayDetails!: any;
  file: Array<File> = [];
  public fileUploadControl = new FileUploadControl(
    {
      listVisible: true,
      accept: ['image/*'],
      discardInvalid: true,
      multiple: false,
    },
    FileUploadValidators.filesLimit(1)
  );

  bankPayment: any;
  container: any = {};
  userInformation!: User;
  submitting: boolean = false;

  constructor(
    public offerService: OffersService,
    private router: Router,
    private http: HttpClient,
    public appContext: ApplicationContextService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {

    this.appContext
      .getUserInformation()
      .pipe(take(1))
      .subscribe({
        next: (data: User) => {
          this.userInformation = data;
        },
      });

    this.gatewayDetails = this.offerService.gatewayDetails;
    if (Object.keys(this.gatewayDetails).length === 0) {
      this.router.navigate(['/app/home/']);
    }
    this.http
      .get(
        this.gatewayDetails?.formData?.gatewayEndpoints
          ? this.gatewayDetails?.formData?.gatewayEndpoints
          : `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.gatewayDetails?.id}`
          // : `${environment.baseApiUrl}/admin/assets/${this.gatewayDetails?.id}/banks`
      )
      .subscribe(
        (response: any) => {
          this.container['bankLoading'] = false;
          let initialBank: any;
          initialBank = response?.data?.filter(
            (bank: any) => {
              return bank?.type === 'bank';
            }
          );
          this.bankPayment = initialBank[0];
          // [0].OfferBankGateways.filter(
          //   (bank: any) => {
          //     return bank.type === 'bank';
          //   }
          // );
        },
        (response) => {}
      );
  }

  uploadStatementProof() {
    this.submitting = true;
    if (!this.file) {
      this.openSnackBar('Add Proof');
      this.submitting = false;
    } else {
      console.log(this.gatewayDetails?.formData);
      const purchase: any = [{
        units: this.gatewayDetails?.formData?.unit
      }];
      const amount: any = Number(this.gatewayDetails?.formData?.unit * this.gatewayDetails?.formData?.sharePrice);
      const broker: any = {...this.gatewayDetails?.formData?.broker, cscs:this.gatewayDetails?.formData?.broker?.cscsNo,  chn: this.gatewayDetails?.chn};
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append(
        'callbackParams',
        `{"module":"invest","resident": ${null},"tenor": ${null},"assetId": "${
          this.gatewayDetails?.formData?.callbackParams?.assetId
        }","gatewayId":"${
          this.gatewayDetails?.formData?.gatewayId
        }","saveCard":${false}, "broker":${JSON.stringify(broker)}}`
      );
      formData.append('offeringTypeId', this.gatewayDetails?.formData?.offeringTypeId);
      formData.append('offeringType', this.gatewayDetails?.formData?.offeringType);
      formData.append('currency', this.gatewayDetails?.formData?.currency);
      formData.append(
        'paymentMethod',
        this.gatewayDetails?.formData?.paymentMethod
      );
      formData.append('gateway', 'bankTransfer');
      formData.append('purchase', JSON.stringify(purchase));
      formData.append('assetQuantity', this.gatewayDetails?.formData?.unit);
      formData.append(
        'redirectUrl',
        this.gatewayDetails?.formData?.redirectUrl
      );
      formData.append('image', this.file[0]);
      this.http
        .post(`${environment.baseApiUrl}/transactions/create`,
          formData
        )
        .subscribe((response: any) => {
          this.successSnackBar('Proof Uploaded Successfully');
          if (response?.data?.authorization_url) {
            window.location = response.data.authorization_url;
          }
          // this.router.navigate(['/app/transactions/view']);
          // this.submitting = false;
        });

    }
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['download'],
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

  copyAccountNumber(number: any) {
    this.clipboard.copy(number);
  }
}
