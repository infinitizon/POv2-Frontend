/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RenouceRightsComponent } from './renouce-rights.component';

describe('RenouceRightsComponent', () => {
  let component: RenouceRightsComponent;
  let fixture: ComponentFixture<RenouceRightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenouceRightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenouceRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
