import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonService } from '@app/_shared/services/common.service';
import { FormErrors, ValidationMessages } from './nok.validators';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { of, switchMap, take } from 'rxjs';
import { SnackBarComponent } from '@app/_shared/components/snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/_shared/models/user-model';
// import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-nok',
  templateUrl: './nok.component.html',
  styleUrls: ['./nok.component.scss'],
})
export class NokComponent implements OnInit {
  @Input() nokData: any;
  personalForm!: FormGroup;

  errors: any = [];
  formErrors: any = FormErrors;
  uiErrors: any = FormErrors;
  validationMessages: any = ValidationMessages;
  container: any = {
    loading: true,
  };

  customer: any;
  relationships = this.appContext.relationships;
  submitting: boolean = false;

  mask = '0{1000}';
  customPatterns = { '0': { pattern: new RegExp('\[a-zA-Z\\-&\\s\]')} };
  // separateDialCode = false;
	// SearchCountryField = SearchCountryField;
	// CountryISO = CountryISO;
  // PhoneNumberFormat = PhoneNumberFormat;
	// preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

	// changePreferredCountries() {
	// 	this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	// }
  constructor(
    private fb: FormBuilder,
    private commonServices: CommonService,
    private router: Router,
    private http: HttpClient,
    private aRouter: ActivatedRoute,
    public appContext: ApplicationContextService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.personalForm = this.fb.group({
      relationship: [
        this.nokData?.length > 0 ? (this.nokData[0]?.relationship).toLowerCase() : null,
        [Validators.required],
      ],
      name: [
        this.nokData?.length > 0 ? this.nokData[0]?.name : null,
        [Validators.required],
      ],
      phone: [
        this.nokData?.length > 0 ? this.nokData[0]?.phone : null,
        [Validators.required],
      ],
      email: [
        this.nokData?.length > 0 ? this.nokData[0]?.email : null,
        [Validators.required, Validators.pattern(this.commonServices.email)],
      ],
      address: [
        this.nokData?.length > 0 ? this.nokData[0]?.address : null,
        [Validators.required],
      ],
    });
  }

  controlChanged(ctrlName: string) {
    this.errors = this.commonServices.controlnvalid(
      this.personalForm.get(ctrlName) as FormControl
    );
    if (Object.keys(this.errors).length === 0) {
      this.errors[ctrlName] = {};
      this.uiErrors[ctrlName] = '';
    }
    this.displayErrors();
  }

  displayErrors() {
    Object.keys(this.formErrors).forEach((control) => {
      this.formErrors[control] = '';
    });
    Object.keys(this.errors).forEach((control: any) => {
      Object.keys(this.errors[control]).forEach((error: any) => {
        this.uiErrors[control] = this.validationMessages[control][error];
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
        icon: 'ri-close-circle-fill',
      },
      panelClass: ['success'],
    });
  }

  onSubmit() {
    this.submitting = true;
    if (this.personalForm.invalid) {
      this.uiErrors = JSON.parse(JSON.stringify(this.formErrors));
      this.errors = this.commonServices.findInvalidControlsRecursive(
        this.personalForm
      );
      this.displayErrors();
      this.submitting = false;
      return;
    }

    const fd = JSON.parse(JSON.stringify(this.personalForm.value));
    fd.phone = fd?.phone?.ie164Number;
    (this.nokData?.length > 0
      ? this.http.put(`${environment.baseApiUrl}/users/next-of-kin/${this.nokData[0]?.id}`, fd)
      : this.http.post(`${environment.baseApiUrl}/users/next-of-kin`, fd)
    )
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.submitting = false;
          this.successSnackBar('Next of kin updated successfully');
        },
        (errResp) => {
          this.submitting = false;
          this.openSnackBar(errResp?.error?.error?.message);
        }
      );
  }
}
