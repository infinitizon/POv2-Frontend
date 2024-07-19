import { Component, OnInit } from '@angular/core';
import { IniDashboardService } from '@app/ini-dashboard/ini-dashboard.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent implements OnInit {
  constructor(public dashboardService: IniDashboardService) {}

  ngOnInit() {
    setTimeout(() => {
      this.dashboardService.isHome = false;
    });
  }
}
