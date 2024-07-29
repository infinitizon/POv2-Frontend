import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { BvnKycComponent } from '@app/_shared/dialogs/bvn-kyc/bvn-kyc.component';
import { GatewayComponent } from '@app/_shared/dialogs/gateway/gateway.component';
import { RenouceRightsComponent } from '@app/_shared/dialogs/renouce-rights/renouce-rights.component';
import { RightGatewayComponent } from '@app/_shared/dialogs/right-gateway/right-gateway.component';
import { ValidateAccountComponent } from '@app/_shared/dialogs/validate-account/validate-account.component';
import { Assets } from '@app/_shared/models/assets-model';
import { RightIssue } from '@app/_shared/models/right-issue-model';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

import { forkJoin, take } from 'rxjs';
@Component({
  selector: 'app-right-detail',
  templateUrl: './right-detail.component.html',
  styleUrls: ['./right-detail.component.scss'],
})
export class RightDetailComponent implements OnInit, AfterViewInit {
  id: any;
  container: any = {};
  userInformation!: User;
  right!: RightIssue;
  rightEntitled: any;
  rightLogo: any;
  userVerification: any;
  rightDocument: any = [];
  rightBanner: any = [];
  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    public appContext: ApplicationContextService,
    private http: HttpClient
  ) {}

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 11000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.appContext
      .getUserInformation()
      .pipe()
      .subscribe({
        next: (data: User) => {
          if (data) {
            this.userInformation = data;
            this.getRights(data.id);
          }
        },
      });
  }

  ngAfterViewInit() {

  }

  getRights(userId: string) {
    this.container['rightLoading'] = true;
    forkJoin([
      this.http.get(`${environment.baseApiUrl}/rights/${this.id}`),
      // this.http.get(
      //   `${environment.baseApiUrl}/rights/${this.id}/${userId}/unitsHeld`
      // ),
    ]).subscribe(
      ([rightData]) => {
        this.right = (rightData as { data: any })?.data;
        this.rightLogo = this.right?.extRef?.ngx.logo ?  this.right?.extRef?.ngx.logo : '/assets/logo/po_logo.png';
        this.rightDocument = this.right?.Media?.filter((item: any) => {
          return item?.type.name === 'offer-documents'
        });
        this.rightBanner = this.right?.Media?.filter((item: any) => {
          return item?.type?.name === 'banner'
        });


        const today = new Date();
        const closingDate = new Date(this.right.endDate);
        const openingDate = new Date(this.right.startDate);
        if (today > closingDate || openingDate > today) {
          this.right.openForPurchase = false;
        } else {
          this.right.openForPurchase = true;
        }

        // this.rightEntitled = rightEntitled;
        this.container['rightLoading'] = false;
      },
      (errResp) => {
        this.container['rightLoading'] = false;
      }
    );
  }

  checkEligibility() {
    const eligibilityDialog = this.dialog.open(ValidateAccountComponent, {
      data: {
        offerId: this.right?.id,
      },
      width: '40%',
      maxHeight: '600px',
      // height: '315px',
      disableClose: true,
      autoFocus: false,
    });

    eligibilityDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.getUserVerification(result);
      } else {
        this.container['userLoading'] = false;
      }
    });
  }

  checkUserFromCHD() {
    this.container['userLoading'] = true;
    this.http
      .get(
        `${environment.baseApiUrl}/rights/checkRightStatus/${this.id}/${this.userInformation?.id}`
      )
      .subscribe(
        (res: any) => {
          if (res.isEligible) {
            this.checkCHNFromNgx(res);
          } else {
            this.checkEligibility();
          }
          // this.container['userLoading'] = false;
        },
        (errResp) => {
          this.container['userLoading'] = false;
        }
      );
  }


checkCHNFromNgx(resCHN: any) {
  let params = new HttpParams();
  params = params.set(`${resCHN?.data?.chn ? 'chn' : 'rin'}`, (resCHN?.data?.chn ? resCHN?.data?.chn : resCHN?.data?.rin).toUpperCase());
  params = params.set('offerId', this.right?.id);
  this.http.get(`${environment.baseApiUrl}/3rd-party-services/ngx/rights/eligibility`, {params: params})
  .subscribe(
    (response: any) => {
      if(response?.data.data.isEligible) {
        if(response?.data?.data?.status === 'NEW' || response?.data?.data?.status === 'REQUEST_OVERAGE') {
          if(response?.data?.data?.cscs || response?.data?.data?.rin) {
            this.getUserVerification(response);
          } else {
            this.openSnackBar("We could not verify your CHN/RIN. Please contact your stock broker for assistance");
          }
        } else if(response?.data?.data.status === 'REQUEST_TRADE') {
          this.container['userLoading'] = false;
          this.openSnackBar("You already purchased partial rights and renounced remaining rights. To purchase additional shares, contact your stockbroker");
        }
      } else {
        this.container['userLoading'] = false;
        if(response?.data?.data.cscs || response?.data?.data.rin) {
          this.openSnackBar("Looks like you have already participated in the Rights Issue! Please contact your broker for any additional information you may need.");
        } else {
          this.openSnackBar("You are not eligible to buy this rights issue, please contact your stockbroker");
        }
      }
    },
    (errResp) => {
      this.container['userLoading'] = false;
      this.openSnackBar(errResp?.error?.error?.message);
    }
  );
}


getUserVerification(rightInfo: any) {
  this.http
    .get(`${environment.baseApiUrl}/users/verification/kyc`)
    .pipe(take(1))
    .subscribe(
      (response: any) => {
        this.userVerification = response?.data?.missing;
        if (
          this.userVerification?.bvn ||
          this.userVerification?.mothersMaidenName ||
          this.userVerification?.placeOfBirth ||
          this.userVerification?.nextOfKin ||
          this.userVerification?.bankAccount ||
          this.userVerification?.address   ||
          this.userVerification?.lga   ||
          this.userVerification?.nationality   ||
          this.userVerification?.state
        ) {
          this.openRequirementDialog(this.userVerification);
        } else {
          this.openRightGatewayDialog(rightInfo)
        }

      },
      (errResp) => {
        this.container['userLoading'] = false;
      }
    );
}

  openRightGatewayDialog(rightInfo?: any): void {
      const getUrl = window.location;
      const rightGatewayDialog = this.dialog.open(RightGatewayComponent, {
        data: {
          ngx: this.right?.extRef,
          fundName: this.right?.name,
          assetName: this.right?.name,
          assetType: 'right-issue',
          assetId: this.right?.assetId,
          type: 'debit',
          currency: this.right?.Asset?.currency,
          id: this.id,
          sharePrice: this.right?.sharePrice,
          // unit: this.right.,
          // module: 'invest',
          description: `New deposit for ${this.right?.name}`,
          orderBase: 'VALUE',
          transType: 'SUBSCRIPTION',
          postUrl: `${environment.baseApiUrl}/transactions/create`,
          redirectUrl: getUrl.protocol + '//' + getUrl.host + '/app/home/view',
          callbackParams: {
            module: 'rights',
            assetId: this.id,
            resident: null,
            tenor: null,
          },
          rightEntitled: rightInfo,
          gatewayEndpoints: `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.right?.id}&modules=rights`,
          rightLogo: this.rightLogo
        },
        disableClose: true,
        width: '40%',
        maxHeight: '700px',
        autoFocus: false
      });

      rightGatewayDialog.afterClosed().subscribe((result) => {
        if (result) {
        } else {

        }
        this.container['userLoading'] = false;
      });
  }

  openRequirementDialog(userDetails): void {
    const requirementDialog = this.dialog.open(BvnKycComponent, {
      data: {userDetails, showLater: false, showNIN: false},
      width: '60%',
      maxHeight: '600px',
      disableClose: true,
      autoFocus: false,
    });

    requirementDialog.afterClosed().subscribe((result) => {
      if (result) {
      }
      this.container['userLoading'] = false;
    });
  }

  openRightRenounceDialog(): void {
    if (
      this.userInformation?.bvn === null ||
      this.userInformation?.dob === null ||
      this.userInformation?.NextOfKins?.length <= 0 ||
      this.userInformation?.Beneficiaries?.length <= 0
    ) {
      this.openRequirementDialog(this.userInformation);
    } else {
      const getUrl = window.location;
      const renounceGatewayDialog = this.dialog.open(RenouceRightsComponent, {
        data: {
          rightEntitled: this.rightEntitled,
          fundName: this.right.Asset.name,
          assetName: this.right.Asset.name,
          assetType: 'right-issue',
          assetId: this.right.assetId,
          type: 'debit',
          currency: this.right.Asset.currency,
          id: this.id,
          sharePrice: this.right.sharePrice,
          // unit: this.right.,
          // module: 'invest',
          description: `New deposit for ${this.right.Asset.name}`,
          orderBase: 'VALUE',
          transType: 'SUBSCRIPTION',
          postUrl: `${environment.baseApiUrl}/transactions/create`,
          redirectUrl: getUrl.protocol + '//' + getUrl.host + '/app/home/view',
          callbackParams: {
            module: 'rights',
            assetId: this.id,
            resident: null,
            tenor: null,
          },
          gatewayEndpoints: `${environment.baseApiUrl}/3rd-party-services/gateway?id=${this.right.id}&modules=rights`,
        },
        disableClose: true,
        width: '408px',
        // height: '500px'
      });

      renounceGatewayDialog.afterClosed().subscribe((result) => {
        if (result) {
        }
      });
    }
  }
}
