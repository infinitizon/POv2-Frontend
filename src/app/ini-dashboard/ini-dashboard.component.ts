import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subscription,
  timer,
} from 'rxjs';
import {
  debounceTime,
  switchMap,
  finalize,
  map,
  pairwise,
  filter,
  throttleTime,
  take,
} from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { IniDashboardService } from './ini-dashboard.service';
import { LinkCscsComponent } from '@app/_shared/dialogs/link-cscs/link-cscs.component';
import { User } from '@app/_shared/models/user-model';
import { GetStartedComponent } from '@app/_shared/dialogs/get-started/get-started.component';
import { environment } from '@environments/environment';
import { LogoutDialogComponent } from '@app/_shared/dialogs/logout-dialog/logout-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthService } from '@app/_shared/services/auth.service';

@Component({
  selector: 'app-ini-dashboard',
  templateUrl: './ini-dashboard.component.html',
  styleUrls: ['./ini-dashboard.component.scss'],
})
export class IniDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav: any;
  @ViewChild(CdkVirtualScrollViewport) scroller!: CdkVirtualScrollViewport;

  sideNavMode: any = 'side';
  sideNavOpen = true;
  resizeObservable$!: Observable<Event>;
  sidenavSubscription$!: Subscription;
  sidenavClickSubscription$!: Subscription;
  isHome!: boolean;
  userInformation: any;
  userSubscription$!: Subscription;
  addCscs: boolean = false;
  container: any = {};

  referrals: any;
  role: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private appContext: ApplicationContextService,
    private ngZone: NgZone,
    public dashboardService: IniDashboardService,
    private clipboard: Clipboard,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.getUserInformation();
    this.setUserInformation();
    this.setupSideBar();
    this.sidenavFunction();
    // this.role = JSON.parse(this.auth.getRole());
  }

  ngAfterViewInit() {
    this.scroller
      ?.elementScrolled()
      .pipe(
        map(() => this.scroller.measureScrollOffset('bottom')),
        pairwise(),
        filter(([y1, y2]) => y2 < y1 && y2 < 140),
        throttleTime(200)
      )
      .subscribe(() => {
        this.ngZone.run(() => {});
      });

    const hasCollapsible = document.querySelectorAll('.has-collapsible');

    // Collapsible Menu
    hasCollapsible.forEach(function (collapsible) {
      collapsible.addEventListener('click', function () {
        collapsible.classList.toggle('active');

        // Close Other Collapsible
        hasCollapsible.forEach(function (otherCollapsible) {
          if (otherCollapsible !== collapsible) {
            otherCollapsible.classList.remove('active');
          }
        });
      });
    });
  }

  setUserInformation() {
    this.appContext.getUserInformation().subscribe({
      next: (data) => {
        this.userInformation = data;
      },
    });
  }

  getUserInformation() {
    this.userSubscription$ = this.http
      .get(`${environment.baseApiUrl}/users`)
      .subscribe(
        (response: any) => {
          if (response) {
            this.appContext.userInformation = response.data;
            this.referrals = this.userInformation.refCode;
            // if(this.userInformation.firstLogin) {
            //   this.addCscs = true;
            // const getStartedDialog = this.dialog.open(GetStartedComponent, {
            //   data: {
            //     name: this.userInformation?.firstName,
            //   },
            //   width: '408px',
            //   height: '600px',
            // });
            // getStartedDialog
            //   .afterClosed()
            //   .pipe(take(1))
            //   .subscribe((result) => {
            //     if (result) {
            //     }
            //     this.addCscs = false;
            //   });
            // }
          }
        },
        (errResp) => {}
      );
  }



  copyReferral() {
    this.clipboard.copy(this.referrals);
  }

  copyCSCS() {
    this.clipboard.copy(this.referrals);
  }

  setupSideBar() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.sidenavSubscription$ = this.resizeObservable$
      .pipe(debounceTime(500))
      .subscribe((evt) => this.sidenavFunction());

    let button = document.querySelectorAll('.menu-section-bottom a');
    let sidenavClick$ = fromEvent(button, 'click');

    this.sidenavClickSubscription$ = sidenavClick$.subscribe((evt) => {
      if (window.innerWidth < 991) {
        this.sidenav.close();
      }
    });
  }

  clickedNotification(event: any) {

  }

  sidenavFunction() {
    let browserWidth = window.innerWidth;
    if (browserWidth < 991) {
      this.sideNavMode = 'over';
      this.sideNavOpen = false;
    } else {
      this.sideNavMode = 'side';
      this.sideNavOpen = true;
    }
  }

  addDetails() {
    this.addCscs = true;
    const linkCSCSDialog = this.dialog.open(LinkCscsComponent, {
      data: {},
      width: '408px',
    });

    linkCSCSDialog
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {

        }
        this.addCscs = false;
      });
  }

  openLogOutDialog(): void {
    this.dialog.open(LogoutDialogComponent);
  }

  ngOnDestroy() {
    if (this.sidenavSubscription$) this.sidenavSubscription$.unsubscribe();
    if (this.sidenavClickSubscription$)
      this.sidenavClickSubscription$.unsubscribe();
    if (this.userSubscription$) this.userSubscription$.unsubscribe();
  }
}
