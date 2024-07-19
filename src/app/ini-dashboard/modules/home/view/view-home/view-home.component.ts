import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { BvnKycComponent } from '@app/_shared/dialogs/bvn-kyc/bvn-kyc.component';
import { GetStartedComponent } from '@app/_shared/dialogs/get-started/get-started.component';
import { Assets } from '@app/_shared/models/assets-model';
import { RightIssue } from '@app/_shared/models/right-issue-model';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { AuthService } from '@app/_shared/services/auth.service';
import { environment } from '@environments/environment';
import { finalize, forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-view-home',
  templateUrl: './view-home.component.html',
  styleUrls: ['./view-home.component.scss'],
})
export class ViewHomeComponent implements OnInit {

  container: any = {
    assetsLoading: true
  };
  userInformation!: any;
  assets!: any;

  emptyState = {
    title: 'No Offers',
    subTitle: 'There are no offers available yet'
  }


  offersTab: string[] = ['All', 'IPOs', 'Rights issue'];
  tabActive = 'All';
  rightIssue!: any;
  userVerification: any;
  constructor(
    public dialog: MatDialog,
    public appContext: ApplicationContextService,
    private http: HttpClient,
    private authService: AuthService,
    private aRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.container['assetsLoading'] = true;
    this.aRoute.queryParamMap.subscribe((qParams) => {
      if (qParams.get('success') === 'true' ) {
        this.openSnackBar('Shares bought Successfully');
      }
    });

    this.appContext
      .getUserInformation().pipe(take(1))
      .subscribe({
        next: (data: any) => {
          if(data) {
          this.userInformation = data;
          this.getUserVerification();
          this.getDashboardEndpoints();
        }
        },
      });


  }





  getDashboardEndpoints() {

    forkJoin([
      this.http.get(`${environment.baseApiUrl}/rights`),
      this.http.get(`${environment.baseApiUrl}/transactions/reports/value-by-currency`),
      this.http.get(`${environment.baseApiUrl}/assets`),
    ])
    .subscribe(
      ([rights, valueByCurrency, assets  ]) => {
          this.assets = assets;
          this.container['valueByCurrency']  = (valueByCurrency as {data: any})?.data;
          this.container['assetsLoading'] = false;
          this.rightIssue = (rights as {data: any})?.data;
      },
      (errResp) => {
        this.container['assetsLoading'] = false;
      }
    );
  }

  getCurrencyDetails(currency: string) {
    return this.appContext.currencies.find(c=>c.code == currency);
  }

  openRequirementDialog(userDetails): void {
    const requirementDialog = this.dialog.open(BvnKycComponent, {
      data: {userDetails, showLater: true, showNIN: false},
      width: '60%',
      maxHeight: '600px',
      disableClose: true,
      autoFocus: false,
    });

    requirementDialog.afterClosed().subscribe((result) => {
      if (result === true) {
        this.getUserVerification();
      }
    });
  }


  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }

  getUserVerification() {
    this.container['userLoading'] = true;
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
          }
          this.container['userLoading'] = false;

        },
        (errResp) => {
          this.container['userLoading'] = false;
        }
      );
  }
}
