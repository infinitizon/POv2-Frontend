import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { CommonService } from '@app/_shared/services/common.service';

@Component({
  selector: 'app-right-notice',
  templateUrl: './right-notice.component.html',
  styleUrls: ['./right-notice.component.scss']
})
export class RightNoticeComponent implements OnInit {

  constructor(
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RightNoticeComponent>,
  ) {}

  ngOnInit() {
  }
}
