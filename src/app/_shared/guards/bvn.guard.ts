import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApplicationContextService } from '../services/application-context.service';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class BVNGuards implements CanActivateChild {

  constructor(
    private appContext: ApplicationContextService,
    private commonServices: CommonService, private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let subject = new ReplaySubject<boolean>();

      // console.log('hello');
      return this.appContext.userInformationObs()
        .pipe(
          switchMap((user: any) => {
            // console.log(user);

            // subject.next(true);
            // return subject.asObservable();
            if(!user?.bvn || !user?.dob) {
              this.commonServices.openMessageDialog({
                title: 'BVN update',
                acceptButtonText: 'OK',
                cancelButtonText: 'Not now',
                message: 'You have not completed your BVN verification. Click "OK" to validate your BVN'
              },
              () => {
                this.router.navigate(['/dashboard/user/bvn-kyc'])
                subject.next(false)
                return subject.asObservable();
              },
              () => {
                this.commonServices.openMessageDialog(
                  {
                    acceptButtonText: 'OK',
                    message: 'You cannot proceed unless you provide your BVN'
                  }, () => {
                    subject.next(false)
                    return subject.asObservable();
                  }
                )
              });
              return subject.asObservable();
            } else{
              // console.log('bvn and dob found');

              subject.next(true);
              return subject.asObservable();
            }
          }),catchError((err, caught) => {
            subject.next(false)
            return subject.asObservable();
          })
        )
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.canActivate(next, state);
  }


}
