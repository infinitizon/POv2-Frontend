import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { PaymentPartnerComponent } from '@app/_shared/dialogs/payment-partner/payment-partner.component';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-right-summary',
  templateUrl: './right-summary.component.html',
  styleUrls: ['./right-summary.component.scss']
})
export class RightSummaryComponent implements OnInit {
  termsRead: any;
  container: any = {};
  summaryDetails: any;
  date: any = Date.now();
  constructor(
    private _snackBar: MatSnackBar,
    private appContext: ApplicationContextService,
    private location: Location,
    public dialog: MatDialog,
  ) {
    this.appContext.rightPaymentInformation$.subscribe({
      next: (data: any) => {
        this.summaryDetails = data;
      }
    })
  }

  ngOnInit() {
    if(this.summaryDetails === null) this.location.back();
  }

  termChecked(value: boolean) {
    this.termsRead = value;
  }


  pay () {
    if (!this.termsRead) {
      // if(!termsChecked) {
     this.container['submitting'] = false;
      this.openSnackBar('Terms and Condition needs to be accepted');
      return;
    }
    this.openPaymentDialog();
  }


  openPaymentDialog(): void {
    const rightPaymentDialog = this.dialog.open(PaymentPartnerComponent, {
      data: this.summaryDetails,
      width: '408px',
      disableClose: true,
      // height: '500px'
    });

    rightPaymentDialog.afterClosed().subscribe((result) => {
      if (result) {
      }
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
