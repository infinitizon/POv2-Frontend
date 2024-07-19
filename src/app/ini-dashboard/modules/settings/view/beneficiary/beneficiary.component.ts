import { Component, Input, OnInit } from '@angular/core';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AddBanksComponent } from '@app/_shared/dialogs/add-banks/add-banks.component';

@Component({
  selector: 'app-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['./beneficiary.component.scss'],
})
export class BeneficiaryComponent implements OnInit {
  bankData: any;
  container: any = {
    bankName: null,
  };
  environment = environment;

  stateDesc = {
    title: 'No Bank Added Yet',
    subTitle: 'Please enter your bank account'
  }

  constructor(
    public commonServices: CommonService,
    public dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.container['loading'] = true;
    this.getBanks();
  }

  getBanks() {
    this.container['loading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/beneficiary`)
      .subscribe((response: any) => {
        this.container['loading'] = false;
        this.bankData = response.data;
      });
  }

  openBanksDialog(): void {
    const banksDialog = this.dialog.open(AddBanksComponent, {
      data: {},
      width: '450px',
      // height: '500px'
    });

    banksDialog.afterClosed().subscribe((result) => {
      this.getBanks();
    });
  }

  editBanksDialog(data: any): void {
    const banksDialog = this.dialog.open(AddBanksComponent, {
      data: data,
      width: '450px',
      // height: '520px'
    });

    banksDialog.afterClosed().subscribe((result) => {
      this.getBanks();
    });
  }
}
