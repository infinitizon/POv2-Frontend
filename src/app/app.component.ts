import { Component } from '@angular/core';
import { AutoLogoutService } from './_shared/services/auto-logout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'primary-offer-v2';
  constructor(private logout: AutoLogoutService) {
    localStorage.removeItem('session');
  }
}
