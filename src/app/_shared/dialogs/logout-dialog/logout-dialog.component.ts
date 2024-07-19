import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@app/_shared/services/auth.service';


@Component({
  selector: 'in-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss']
})
export class LogoutDialogComponent implements OnInit {

  constructor(private auth: AuthService,
    public _dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    this._dialogRef.close();
    this.auth.logout();
  }

}
