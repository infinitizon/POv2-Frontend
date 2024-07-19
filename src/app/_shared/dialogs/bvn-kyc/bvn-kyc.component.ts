import { Component, Inject, NgZone, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';

import { FormErrors, ValidationMessages } from './bvn-kyc.validators';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { of, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CommonService } from '@app/_shared/services/common.service';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';

@Component({
  selector: 'in-bvn-kyc',
  templateUrl: './bvn-kyc.component.html',
  styleUrls: ['./bvn-kyc.component.scss'],
})
export class BvnKycComponent implements OnInit {
  container = {
    gettingWallet: false,
    linear: true,
    loading: false,
    redirect_uri: "",
    loadingBvn: false,
    bvn_info: {},
    cscsName: null
  };
  countries: any = this.appContext.countries;
  firstFormGroup: UntypedFormGroup;
  ninFormGroup: UntypedFormGroup;
  secondFormGroup: UntypedFormGroup;
  cscsVerifyFormGroup: UntypedFormGroup;
  bankDetailsFormGroup: UntypedFormGroup;
  cscsCreateFormGroup: UntypedFormGroup;
  nextOfKinCreateFormGroup: UntypedFormGroup;
  addressForm: UntypedFormGroup;
  errors = [];
  formErrors = FormErrors;
  uiErrors = FormErrors;
  validationMessages = ValidationMessages;
  environment = environment;
  userSubscription$: Subscription;

  verifyCscs: boolean = false;
  cscsVerifySuccessMessage: boolean = null;
  wallet: any;
  currencyData: any = [];
  relationships = this.appContext.relationships;
  mask = '0{1000}';
  customPatterns = { '0': { pattern: new RegExp('\[a-zA-Z\\-&\\s\]')} };
  userInformation : any;
  constructor(
    private _fb: FormBuilder,
    public commonServices: CommonService,
    public appContext: ApplicationContextService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BvnKycComponent>,
    private http: HttpClient,
    public dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getCurrency();
    this.userSubscription$ = this.appContext
      .getUserInformation()
      .subscribe((user: any) => {
       if(user) {
        this.userInformation = user;
        const country = user?.Addresses
        ? this.appContext.countries.find(
            (el: any) => el.code === user?.Addresses['0']?.country
          )
        : null;
      const state = user?.Addresses
        ? country?.states?.find(
            (el: any) => el.code === user?.Addresses['0']?.state
          )
        : null;
        this.container['currentUser'] = user;
        this.firstFormGroup = this._fb.group({
          bvn: [
            user.bvn,
            [
              Validators.required,
              Validators.minLength(11),
              Validators.maxLength(11),
              this.commonServices.regexValidator(
                new RegExp(this.commonServices.onlyDigits),
                { onlyDigits: '' }
              ),
            ],
          ],
          dob: [user.dob ? new Date(user.dob) : null, Validators.required],
        });
        this.ninFormGroup = this._fb.group({
          nin: [user.nin, Validators.required],
        });
        this.secondFormGroup = this._fb.group({
          mothersMaidenName: [user.mothersMaidenName, Validators.required],
          placeOfBirth: [user.placeOfBirth, Validators.required],
        });
        this.cscsVerifyFormGroup = this._fb.group({
          cscsNo: [user.cscs, Validators.required],
          chn: [user.chn, Validators.required],
        });
        this.bankDetailsFormGroup = this._fb.group({
          currency: ['', [Validators.required]],
          account_number: ['', [Validators.required]],
          bank: ['', [Validators.required]],
          account_name: [''],
          // password: [null, [Validators.required, Validators.minLength(6)]],
        });

        this.addressForm = this._fb.group({
          address1: [
            user?.Addresses
              ? user?.Addresses[0]?.address1
              : user.residentialAddress,
            Validators.maxLength(100),
          ],
          city: [user?.Addresses ? user?.Addresses[0]?.city : null, [Validators.required]],
          country: [country, [Validators.required]],
          state: [state ? state : user?.state, [Validators.required]],
          lga: [user?.Addresses ? user?.Addresses[0]?.address2 : null, [Validators.required]],
        })

        if (this.bankDetailsFormGroup.get('currency')?.value === 'NGN') {
          this.container['bankAccountName'] = {
            success: true,
            name: user?.Beneficiaries[0].accountName,
          };

          // this.bankDetailsFormGroup
          //   .get('bank')
          //   .patchValue({
          //     code: user?.Beneficiaries[0].bankCode,
          //     name: user?.Beneficiaries[0].bankName,
          //   });
        }


        this.nextOfKinCreateFormGroup = this._fb.group({
          relationship: [
            user?.NextOfKins[0]?.length > 0 ? user?.NextOfKins[0]?.relationship : null,
            [Validators.required],
          ],
          name: [
            user?.NextOfKins[0]?.length > 0 ? user?.NextOfKins[0]?.name : null,
            [Validators.required],
          ],
          phone: [
            user?.NextOfKins[0]?.length > 0 ? user?.NextOfKins[0]?.phone : null,
            [Validators.required, Validators.maxLength(21)],
          ],
          email: [
            user?.NextOfKins[0]?.length > 0 ? user?.NextOfKins[0]?.email : null,
            [Validators.required, Validators.pattern(this.commonServices.email)],
          ],
          address: [
            user?.NextOfKins[0]?.length > 0 ? user?.NextOfKins[0]?.address : null,
            [Validators.required],
          ],
        });

        this.cscsCreateFormGroup = this._fb.group({
          selectBroker: [null],
          brokerName: [null],
          fullName: [
            user.firstName + ' ' + user.lastName,
            [Validators.required],
          ],
          MaidenName: [user.mothersMaidenName, [Validators.required]],
          City: [null, [Validators.required]],
          Country: [country, [Validators.required]],
          State: [state, [Validators.required]],
          LGA: [null, [Validators.required]],
          Citizen: [null, [Validators.required]],
          PostalCode: [null, [Validators.required]],
        });

        this.cscsVerifyFormGroup
          .get('cscsNo')
          .valueChanges.pipe(
            // filter(res => res.length > 2),
            debounceTime(800),
            distinctUntilChanged(),
            switchMap((data) => {
              this.container['cscsName'] = '';
              this.container['submittingCSCSVerify'] = true;
              return this.http.post(
                `${environment.baseApiUrl}/mtn/customers/first-step`,
                { chn: this.cscsVerifyFormGroup.get('chn').value, cscsNo: data }
              );
            })
          )
          .subscribe(
            (response: any) => {
              this.container['submittingCSCSVerify'] = false;
              this.container['cscsName'] =
                response.data.cscsResponse?.accountName;
              this.cscsVerifyFormGroup.patchValue({
                brokerName: response.data.cscsResponse?.broker,
                chn: response?.data?.cscsResponse?.chn,
              });
            },
            (errResp) => {
              this.container['submittingCSCSVerify'] = false;
              this.cscsVerifyFormGroup.patchValue({ brokerName: null });
              this.container['cscsName'] = '';
              this.openSnackBar(
                errResp?.error?.error?.message
                  ? errResp?.error?.error?.message
                  : errResp.statusText
              );
            }
          );
        }
      });
  }

  goForward(stepper: MatStepper, verifyCscs?: any) {
    if (verifyCscs) {
      this.verifyCscs = verifyCscs;
    }
    stepper.next();
  }


  openCscs(verifyCscs: boolean, stepper: MatStepper) {
    // const cscsDialog = this.dialog.open(CscsDialogComponent, {
    //   data: {
    //     verifyCscs: verifyCscs,

    //   },
    //   panelClass: 'icon-outside',
    //   maxWidth: '52%',
    //   width: '500px',
    //   disableClose: true
    // });
    // //
    // cscsDialog.afterClosed().subscribe((result) => {
    //   if (!result) {
    //     this.cscsVerifySuccessMessage = verifyCscs;

    //     stepper.next();
    //   }
    //     // callBack();
    //   });
  }

  goToBack(stepper: MatStepper) {
    stepper.previous();
  }

  goToCreate(stepper: MatStepper) {
    this.container['linear'] = false;
    stepper.next();
  }
  closeDialog(value: boolean) {
    this.getUserInformation()
    this.dialogRef.close(value);
  }

  startNINVerification(stepper: MatStepper) {
    this.container['loadingNIN'] = true;
    const fd = JSON.parse(JSON.stringify(this.ninFormGroup.value));
    const bd = {nin: fd}
    this.http
    .post(`${environment.baseApiUrl}/users/${this.userInformation?.id}/profile`, bd)
    .subscribe(
      (resp: any) => {
        this.successSnackBar(resp.nin.message);
        stepper.next();
        this.container['loadingNIN'] = false;
      },
      (errResp) => {
        this.container['loadingNIN'] = false;
        this.openSnackBar(
          errResp?.error?.error?.message || 'Error Starting Verification. Please try again later'
        );
        // this.container['bvn_info'] = {
        //   success: false,
        //   name: errResp?.error?.error?.message,
        // };
      }
    );
  }


  controlChanged(form: UntypedFormGroup, ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      form.get(ctrlName) as UntypedFormControl
    );
    this.displayErrors();
  }

  onNubanChanged(): any {
    this.controlChanged(this.bankDetailsFormGroup, 'account_number');
    let accountNumber = this.bankDetailsFormGroup.get('account_number')?.value;
    if (!this.bankDetailsFormGroup.get('bank')?.value) {
      this.bankDetailsFormGroup.get('account_number')?.patchValue(null, { emitEvent: false });
      // this.toastr.error('Please select a bank first', 'Error');
      return null;
    }
    if (accountNumber?.length === 10) {
      const chosenBank = this.bankDetailsFormGroup.get('bank')?.value;
      // console.log(accountNumber, chosenBank);
      this.container['loadingBankName'] = true;
      const fd = {
        bankCode: chosenBank?.code,
        nuban: accountNumber,
      };
      this.http
        .post(`${environment.baseApiUrl}/verifications/nuban`, fd)
        .subscribe(
          (resp: any) => {
            this.container['loadingBankName'] = false;
            this.container['disableButton'] = false;
            this.container['bankAccountName'] = {
              success: true,
              name: resp?.data?.accountName,
            };
          },
          (errResp) => {
            this.container['loadingBankName'] = false;
            this.container['disableButton'] = true;
            this.container['bankAccountName'] = {
              success: false,
              name: errResp?.error?.message,
            };
            // console.log(errResp);
          }
        );
    }
  }

  onBrokerChange(event) {
    if (event.target.checked) {
      this.cscsCreateFormGroup.patchValue({ brokerName: null });
      this.cscsCreateFormGroup
        .get('brokerName')
        .setValidators([Validators.required]);
    } else {
      this.cscsCreateFormGroup.patchValue({
        brokerName: { code: 'CHDS', name: 'Chapel Hill Denham Securities' },
      });
      this.cscsCreateFormGroup.get('brokerName').clearValidators();
    }
  }

  onSubmitBVN(stepper: MatStepper) {
    this.container['loadingBvn'] = true;
    if (this.firstFormGroup.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.firstFormGroup
      );
      this.displayErrors();
      this.container['loadingBvn'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.firstFormGroup.value));
    fd.dob = moment(fd.dob).format('DD-MM-YYYY');
    const bd = {
      bvn : fd
    };
    this.http
      .post(`${environment.baseApiUrl}/users/${this.userInformation?.id}/profile`, bd)
      .subscribe(
        (response: any) => {
          // if(response.data === typeof {}) {
          //   this.openSnackBar('BVN Verification failed');
          // } else {
          //   this.successSnackBar('BVN Verification successful');
          // }
          this.successSnackBar(response.bvn.message);
          // this.getUserInformation();
          // this.appContext.userInformation = response.data;
          this.container['loadingBvn'] = false;
          stepper.next();
        },
        (response) => {
          this.container['loadingBvn'] = false;
          this.openSnackBar(response.error.error.message);
        }
      );
  }

  onSubmitKYC(stepper: MatStepper) {
    this.container['submittingOthers'] = true;
    if (this.secondFormGroup.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.secondFormGroup
      );
      // // console.log(this.uiErrors, this.errors, this.myForm);
      this.displayErrors();
      this.container['submittingOthers'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.secondFormGroup.value));
    const payload = {
      security: fd
    };
    this.http
      .post(`${environment.baseApiUrl}/users/${this.userInformation?.id}/profile`, payload)
      .subscribe(
        (response: any) => {
          // this.appContext.userInformation = response.data;
          this.container['submittingOthers'] = false;
          this.successSnackBar(response.security.message);
          // this.getUserInformation();
            stepper.next();
        },
        (response) => {
          this.container['submittingOthers'] = false;
          this.openSnackBar(response.error.error.message);
        }
      );
  }

  onSubmitAddress(stepper: MatStepper) {
    this.container['submittingAddress'] = true;
    if (this.addressForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.addressForm
      );
      this.displayErrors();
      this.container['submittingAddress'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.addressForm.value));
    fd.country ? (fd.country = fd.country.code) : 0;
    typeof fd.state == 'object' ? (fd.state = fd.state.code) : 0;
     fd.address2 = fd.lga;
     delete fd.lga;
     const bd = {
      address: fd
     }
    this.http
      .post(`${environment.baseApiUrl}/users/${this.userInformation?.id}/profile`, bd)
      .subscribe(
        (response: any) => {
          // this.appContext.userInformation = response.data;
          stepper.next();
          console.log(stepper.next());
          this.container['submittingAddress'] = false;
          this.successSnackBar(response.address.message);
          // this.getUserInformation();


        },
        (response) => {
          this.container['submittingAddress'] = false;
          this.openSnackBar(response.error.error.message);
        }
      );
  }

  // onSubmitCSCSVerify(stepper: MatStepper) {
  //   this.container['submittingCSCSVerify'] = true;
  //   if (this.cscsVerifyFormGroup.invalid) {
  //     this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
  //     this.errors = this.commonServices.findInvalidControlsRecursive(
  //       this.cscsVerifyFormGroup
  //     );
  //     this.displayErrors();
  //     this.container['submittingCSCSVerify'] = false;
  //     return;
  //   }
  //   const fd = JSON.parse(JSON.stringify(this.cscsVerifyFormGroup.value));
  //   this.http
  //     .post(`${environment.baseApiUrl}/verifications/cscs`, fd)
  //     .pipe(
  //       switchMap((resp) => {
  //         return this.http.get(
  //           `${environment.baseApiUrl}/customers/profile/fetch`
  //         );
  //       })
  //     )
  //     .subscribe(
  //       (response: any) => {
  //         this.appContext.userInformation$.next(response.data);
  //         this.container['submittingCSCSVerify'] = false;
  //         this.successSnackBar('CSCS number updated sucessfully');
  //         // stepper.next();
  //       },
  //       (response) => {
  //         this.container['submittingCSCSVerify'] = false;
  //         this.openSnackBar(response.error.error.message);
  //       }
  //     );
  // }

  onSubmitBank(stepper: MatStepper): void {
    this.container['submittingBank'] = true;
    if (this.bankDetailsFormGroup.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.bankDetailsFormGroup
      );
      this.displayErrors();
      this.container['submittingBank'] = false;
      return;
    }
    const fd = JSON.parse(JSON.stringify(this.bankDetailsFormGroup.value));
    const payload = {
      nuban: fd.account_number,
      bankCode: fd.bank.code ? fd.bank.code : '',
      bankName: fd.bank.name ? fd.bank.name : fd.bank,
      bankAccountName: this.container['bankAccountName']?.name
        ? this.container['bankAccountName']?.name
        : fd.account_name,
      currency: fd.currency
    };
this.http.post(`${environment.baseApiUrl}/users/beneficiary`, payload)
    .subscribe(
      (response: any) => {
        this.container['submittingBank'] = false;
        this.successSnackBar('Bank saved Successfully');
        // this.getUserInformation();
        stepper.next();
      },
      (errResp: any) => {
        this.container['submittingBank'] = false;
        this.openSnackBar(errResp?.error?.error?.message);
      }
    );
  }

  onSubmitNextOfKin(stepper: MatStepper) {
    this.container['submittingNextOfKin'] = true;
    if (this.nextOfKinCreateFormGroup.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.nextOfKinCreateFormGroup
      );
      this.displayErrors();
      this.container['submittingNextOfKin'] = false;
      return;
    }

  const fd = JSON.parse(JSON.stringify(this.nextOfKinCreateFormGroup.value));
  const bd = {
    nok: fd
  };
   this.http.post(`${environment.baseApiUrl}/users/${this.userInformation?.id}/profile`, bd)
      .subscribe(
        (response: any) => {
          this.container['submittingNextOfKin'] = false;
          this.successSnackBar('Next of kin updated successfully');
          // this.getUserInformation();
          stepper.next();
        },
        (errResp) => {
          this.container['submittingNextOfKin'] = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }

  // onSubmitCSCSCreate() {
  //   this.container['submittingCSCSCreate'] = true;
  //   if (this.cscsCreateFormGroup.invalid) {
  //     this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
  //     this.errors = this.commonServices.findInvalidControlsRecursive(
  //       this.cscsCreateFormGroup
  //     );
  //     this.displayErrors();
  //     this.container['submittingCSCSCreate'] = false;
  //     return;
  //   }
  //   const fd = JSON.parse(JSON.stringify(this.cscsCreateFormGroup.value));
  //   fd.brokerName = fd.selectBroker ? fd.brokerName?.code : 'CHDS';
  //   fd.Country = fd.Country.code;
  //   fd.State = fd.State?.code ? fd.State?.code : fd.State;
  //   fd.Citizen = fd.Citizen.code;

  //   this.http
  //     .post(`${environment.baseApiUrl}/customers/create-cscs`, fd)
  //     .subscribe(
  //       (response) => {
  //         this.container['submittingCSCSCreate'] = false;
  //         this.successSnackBar('CSCS account creation is in progress');

  //       },
  //       (errResp) => {
  //         this.container['submittingCSCSCreate'] = false;
  //         this.openSnackBar(errResp?.error?.error?.message);
  //       }
  //     );
  // }

  selectionChange(event) {
    if(event.selectedStep.label?.toLowerCase() === 'completed') {
      // this.container['gettingWallet'] = true;
      // this.http.get(`${environment.baseApiUrl}/transactions/wallet/balance`)
      //   .subscribe({
      //     next: (response: any) => {
      //         this.wallet = response.data;
      //         this.container['gettingWallet'] = false;

      //     },
      //     error: (err) => {
      //         // console.error(err.error.error.message);
      //         this.container['gettingWallet'] = false;
      //     },
      // })
    }
  }


  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control) => {
      Object.keys(this.errors[control]).forEach((error) => {
        this.uiErrors[control] = ValidationMessages[control][error];
      });
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['error'],
    });
  }

  successSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: 2000,
      data: {
        message: message,
        icon: 'ri-checkbox-circle-fill',
      },
      panelClass: ['success'],
    });
  }

  changeCurrency() {
    this.bankDetailsFormGroup.patchValue({
      account_number: [''],
      bank: [''],
    });

    if (this.bankDetailsFormGroup.get('currency')?.value !== 'NGN') {
      this.bankDetailsFormGroup.get('account_name').setValidators([Validators.required]);
      this.bankDetailsFormGroup.get('account_name').updateValueAndValidity();
    } else {
      this.bankDetailsFormGroup.get('account_name').clearValidators();
      this.bankDetailsFormGroup.get('account_name').updateValueAndValidity();
    }

    this.container['bankAccountName'] = {
      success: true,
      name: '',
    };
  }

  getCurrency() {
    // this.container['loading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/users/getCurrencyCodes`)
      .subscribe((response: any) => {
        this.container['loading'] = false;

        this.currencyData = response.data;
      });
  }



  getUserInformation() {
    this.userSubscription$ = this.http
      .get(`${environment.baseApiUrl}/users`)
      .subscribe(
        (response: any) => {
          if (response) {
            this.appContext.userInformation$.next(response.data);
            this.userInformation = response.data;
          }
        },
        (errResp) => {}
      );
  }


}
