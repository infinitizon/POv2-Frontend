import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-link-cscs',
  templateUrl: './link-cscs.component.html',
  styleUrls: ['./link-cscs.component.scss']
})
export class LinkCscsComponent implements OnInit {
  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LinkCscsComponent>,
  ) {}

  ngOnInit() {
  }

}
