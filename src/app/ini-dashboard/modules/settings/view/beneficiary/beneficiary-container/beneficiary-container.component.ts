import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-beneficiary-container',
  templateUrl: './beneficiary-container.component.html'
})
export class BeneficiaryContainerComponent implements OnInit {
  banksDetails!: any;
  container: any = {
    loading: true,
  };
  constructor(
    private http: HttpClient,
  ) {}

  ngOnInit() {

  }

}
