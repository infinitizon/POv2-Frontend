/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddBanksComponent } from './add-banks.component';

describe('AddBanksComponent', () => {
  let component: AddBanksComponent;
  let fixture: ComponentFixture<AddBanksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBanksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
