import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvailableOfferingComponent } from '@app/_shared/dialogs/available-offering/available-offering.component';
import { RightIssue } from '@app/_shared/models/right-issue-model';
import { CommonService } from '@app/_shared/services/common.service';
import { environment } from '@environments/environment';
import { Observable, Subject, catchError, concat, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  environment = environment;
  offeringType = ['IPOs', 'Rights'];
  activeOffering = 'Rights';
  availableColors: any[] = [
    {name: 'none', color: undefined},
    {name: 'Primary', color: 'primary'},
    {name: 'Accent', color: 'accent'},
    {name: 'Warn', color: 'warn'},
  ];
  rightIssue: RightIssue[] = [];
  container: any = {};
  searchName: any;
  public input$ = new Subject<string | null>();
  public items$: Observable<any[]>;
  customerLoading = false;
  minLengthTerm = 3;


  selectedOffering: any;
  constructor(
    private http: HttpClient,
    public commonServices: CommonService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getRightIssue();
  }


  getRightIssue() {
    this.container['loading-right'] = true;
    this.http
      .get(`${environment.baseApiUrl}/rights`)
      .subscribe(
        (response: any) => {
            this.rightIssue = response.data;
          this.container['loading-right'] = false;
        },
        (errResp) => {
          this.container['loading-right'] = false;
        }
      );
  }

  addTagFn(name) {
    return { firstName: 'Not', lastName: 'Found', refCode: name, tag: true };
  }

  private loadCustomer(id: any) {
    this.items$ = concat(
      of([]), // default items
      this.input$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.customerLoading = true)),
        switchMap((term) => {
          return this.getCustomer(term, id).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.customerLoading = false))
          );
        })
      )
    );
  }

  getCustomer(term: string = null, id): Observable<any> {
    return  this.http.get(`${environment.baseApiUrl}/rights/${id}/users?search=` + term).pipe(
      map((resp: any) => {
        if (resp.Error) {
          throwError(resp.Error);
        } else {
          return resp.data;
        }
      })
    );
  }


  selectOffering(options: any) {
    this.loadCustomer(options?.id);
    this.selectedOffering = options;
  }

  getCustomerId() {
  }


  openAvailableDialog(data?: any): void {
    const availableDialog = this.dialog.open(AvailableOfferingComponent, {
      data,
      width: '600px',
      // height: '500px'
    });

    availableDialog.afterClosed().subscribe((result) => {

    });
  }
}
