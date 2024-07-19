import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-view-settings',
  templateUrl: './view-settings.component.html',
  styleUrls: ['./view-settings.component.scss'],
})
export class ViewSettingsComponent implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient,
    private appContext: ApplicationContextService
  ) {}
  ngOnInit() {}
}
