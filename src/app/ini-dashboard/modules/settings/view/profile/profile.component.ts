import { Component, OnInit } from '@angular/core';
import { User } from '@app/_shared/models/user-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  container: any = {};
  userInformation!: User;

  constructor(
    public appContext: ApplicationContextService,
  ) { }

  ngOnInit() {
    this.appContext
    .getUserInformation()
    .subscribe({
      next: (data: User) => {
        this.userInformation = data;

      },
    });
  }
}
