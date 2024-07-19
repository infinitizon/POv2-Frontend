import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-nok-container',
  templateUrl: './nok-container.component.html'
})
export class NokContainerComponent implements OnInit {
  userInformation!: any;
  container: any = {
    loading: true,
  };
  constructor(
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.container['loading'] = true;
    this.http
    .get(`${environment.baseApiUrl}/users/next-of-kin`)
    .subscribe((response: any) => {
      this.container['loading'] = false;
      this.userInformation = response.data;
    });

  }

}
