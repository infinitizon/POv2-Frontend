/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NokComponent } from './nok.component';

describe('NokComponent', () => {
  let component: NokComponent;
  let fixture: ComponentFixture<NokComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NokComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NokComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
